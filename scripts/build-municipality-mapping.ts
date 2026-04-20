import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);

// ── 型定義 ─────────────────────────────────────────────────

type PrefCity = { prefecture: string; city: string };

interface MappingRow {
  source_table: string;   // facilities | kaigo_ninteisha | kaigo_hokensha
  prefecture: string;
  city_raw: string;       // 元の市区町村名
  city_agg: string;       // 集約用の市区町村名（結合キー）
  match_type: string;     // exact | seirei_city_ward | name_variant | wide_area | unmatched
  status: string;         // confirmed | pending_review
  notes: string;
}

// ── 表記ゆれ辞書（ケ/ヶ/ガ等）─────────────────────────────

const NAME_VARIANTS: Record<string, string> = {
  '鎌ケ谷市': '鎌ヶ谷市',
  '龍ヶ崎市': '龍ケ崎市',   // stats側は龍ケ崎市（ケ）の可能性
};

function findNameVariant(
  prefecture: string,
  city: string,
  targetSet: Set<string>,
): string | null {
  // 1. 辞書から探す
  const dictMatch = NAME_VARIANTS[city];
  if (dictMatch && targetSet.has(`${prefecture}\t${dictMatch}`)) {
    return dictMatch;
  }

  // 2. ケ↔ヶ の自動検出
  const variants = [
    city.replace(/ケ/g, 'ヶ'),
    city.replace(/ヶ/g, 'ケ'),
    city.replace(/ガ/g, 'ヶ'),
    city.replace(/ヶ/g, 'ガ'),
  ].filter((v) => v !== city);

  for (const v of variants) {
    if (targetSet.has(`${prefecture}\t${v}`)) return v;
  }
  return null;
}

// ── 政令指定都市判定 ────────────────────────────────────────

const SEIREI_PATTERN = /^(.+市).+区$/;

function extractSeireiCity(city: string): string | null {
  const m = city.match(SEIREI_PATTERN);
  return m ? m[1] : null;
}

// ── 広域連合キーワード ──────────────────────────────────────

const WIDE_AREA_KEYWORDS = ['広域連合', '広域市町村', '広域行政', '広域組合', '事業組合', '介護保険組合'];

function isWideArea(city: string): boolean {
  return WIDE_AREA_KEYWORDS.some((kw) => city.includes(kw));
}

// ── データ取得 ──────────────────────────────────────────────

async function getUniquePrefCities(table: string): Promise<PrefCity[]> {
  return await sql.query(
    `SELECT DISTINCT prefecture, city
     FROM ${table}
     WHERE prefecture IS NOT NULL AND city IS NOT NULL
       AND prefecture != '' AND city != ''
     ORDER BY prefecture, city`,
    [],
  ) as PrefCity[];
}

function toKeySet(rows: PrefCity[]): Set<string> {
  return new Set(rows.map((r) => `${r.prefecture}\t${r.city}`));
}

// ── マッピング構築 ──────────────────────────────────────────

function buildMappings(
  sourceTable: string,
  sourceRows: PrefCity[],
  statsSet: Set<string>,
  statsCities: PrefCity[],
): MappingRow[] {
  const mappings: MappingRow[] = [];

  // 都道府県ごとの広域連合名を収集
  const wideAreaByPref = new Map<string, string[]>();
  for (const { prefecture, city } of statsCities) {
    if (isWideArea(city)) {
      const list = wideAreaByPref.get(prefecture) ?? [];
      list.push(city);
      wideAreaByPref.set(prefecture, list);
    }
  }

  for (const { prefecture, city } of sourceRows) {
    const key = `${prefecture}\t${city}`;

    // 1. 完全一致
    if (statsSet.has(key)) {
      mappings.push({
        source_table: sourceTable,
        prefecture,
        city_raw: city,
        city_agg: city,
        match_type: 'exact',
        status: 'confirmed',
        notes: '',
      });
      continue;
    }

    // 2. 政令指定都市の区 → 市
    const seireiCity = extractSeireiCity(city);
    if (seireiCity && statsSet.has(`${prefecture}\t${seireiCity}`)) {
      mappings.push({
        source_table: sourceTable,
        prefecture,
        city_raw: city,
        city_agg: seireiCity,
        match_type: 'seirei_city_ward',
        status: 'confirmed',
        notes: `${city} → ${seireiCity}`,
      });
      continue;
    }

    // 3. 表記ゆれ（ケ/ヶ 等）
    const variant = findNameVariant(prefecture, city, statsSet);
    if (variant) {
      mappings.push({
        source_table: sourceTable,
        prefecture,
        city_raw: city,
        city_agg: variant,
        match_type: 'name_variant',
        status: 'confirmed',
        notes: `${city} → ${variant}`,
      });
      continue;
    }

    // 4. 広域連合の可能性
    const wideAreas = wideAreaByPref.get(prefecture);
    if (wideAreas && wideAreas.length > 0) {
      mappings.push({
        source_table: sourceTable,
        prefecture,
        city_raw: city,
        city_agg: '',
        match_type: 'wide_area',
        status: 'pending_review',
        notes: `広域連合候補: ${wideAreas.join(', ')}`,
      });
      continue;
    }

    // 5. 不明
    mappings.push({
      source_table: sourceTable,
      prefecture,
      city_raw: city,
      city_agg: '',
      match_type: 'unmatched',
      status: 'pending_review',
      notes: '',
    });
  }

  return mappings;
}

/** stats 側にしか存在しない市区町村のマッピング */
function buildStatsMappings(
  sourceTable: string,
  statsRows: PrefCity[],
  facilitiesSet: Set<string>,
): MappingRow[] {
  const mappings: MappingRow[] = [];

  for (const { prefecture, city } of statsRows) {
    if (facilitiesSet.has(`${prefecture}\t${city}`)) continue; // 既に exact で処理済み

    // 広域連合名
    if (isWideArea(city)) {
      mappings.push({
        source_table: sourceTable,
        prefecture,
        city_raw: city,
        city_agg: city,
        match_type: 'wide_area',
        status: 'pending_review',
        notes: '広域連合/組合名称（構成市町村の確認必要）',
      });
      continue;
    }

    // 政令指定都市の市のみ（facilities側は区単位）
    let hasWards = false;
    for (const fKey of facilitiesSet) {
      const [p, c] = fKey.split('\t');
      if (p === prefecture && c.startsWith(city) && c !== city && SEIREI_PATTERN.test(c)) {
        hasWards = true;
        break;
      }
    }
    if (hasWards) {
      mappings.push({
        source_table: sourceTable,
        prefecture,
        city_raw: city,
        city_agg: city,
        match_type: 'seirei_city_ward',
        status: 'confirmed',
        notes: 'stats側は市単位（facilities側の区を集約）',
      });
      continue;
    }

    // 表記ゆれ
    const variant = findNameVariant(prefecture, city, facilitiesSet);
    if (variant) {
      mappings.push({
        source_table: sourceTable,
        prefecture,
        city_raw: city,
        city_agg: variant,
        match_type: 'name_variant',
        status: 'confirmed',
        notes: `${city} → ${variant}`,
      });
      continue;
    }

    // 不明
    mappings.push({
      source_table: sourceTable,
      prefecture,
      city_raw: city,
      city_agg: '',
      match_type: 'unmatched',
      status: 'pending_review',
      notes: '',
    });
  }

  return mappings;
}

// ── DB保存 ──────────────────────────────────────────────────

const BATCH_SIZE = 500;

async function insertBatch(rows: MappingRow[]) {
  if (rows.length === 0) return;

  const values: string[] = [];
  const params: (string)[] = [];
  let idx = 1;

  for (const r of rows) {
    const placeholders: string[] = [];
    for (const val of [
      r.source_table, r.prefecture, r.city_raw, r.city_agg,
      r.match_type, r.status, r.notes,
    ]) {
      placeholders.push(`$${idx++}`);
      params.push(val);
    }
    values.push(`(${placeholders.join(',')})`);
  }

  await sql.query(
    `INSERT INTO municipality_mapping
       (source_table, prefecture, city_raw, city_agg, match_type, status, notes)
     VALUES ${values.join(',')}`,
    params,
  );
}

// ── メイン ──────────────────────────────────────────────────

async function main() {
  console.log('municipality_mapping テーブル構築\n');

  // テーブル作成
  console.log('Creating table...');
  await sql`
    CREATE TABLE IF NOT EXISTS municipality_mapping (
      id SERIAL PRIMARY KEY,
      source_table VARCHAR(30) NOT NULL,
      prefecture VARCHAR(20) NOT NULL,
      city_raw VARCHAR(100) NOT NULL,
      city_agg VARCHAR(100) NOT NULL DEFAULT '',
      match_type VARCHAR(30) NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'pending_review',
      notes TEXT DEFAULT '',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_mapping_source ON municipality_mapping(source_table)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_mapping_match ON municipality_mapping(match_type)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_mapping_status ON municipality_mapping(status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_mapping_pref_city ON municipality_mapping(prefecture, city_raw)`;

  // データ取得
  console.log('Fetching data...');
  const [facilitiesRows, ninteishaRows, hokenshaRows] = await Promise.all([
    getUniquePrefCities('facilities'),
    getUniquePrefCities('kaigo_ninteisha'),
    getUniquePrefCities('kaigo_hokensha'),
  ]);

  const facilitiesSet = toKeySet(facilitiesRows);
  const ninteishaSet = toKeySet(ninteishaRows);
  const hokenshaSet = toKeySet(hokenshaRows);

  // ninteisha と hokensha は同一構成なので stats としてまとめて扱う
  // ただし source_table は区別して記録
  const allStatsRows = [...new Set([...ninteishaRows, ...hokenshaRows].map((r) => `${r.prefecture}\t${r.city}`))].map((k) => {
    const [prefecture, city] = k.split('\t');
    return { prefecture, city };
  });
  const allStatsSet = toKeySet(allStatsRows);

  console.log(`facilities: ${facilitiesSet.size}, ninteisha: ${ninteishaSet.size}, hokensha: ${hokenshaSet.size}, stats(union): ${allStatsSet.size}`);

  // マッピング構築
  console.log('Building mappings...');

  const facMappings = buildMappings('facilities', facilitiesRows, allStatsSet, allStatsRows);
  const ninMappings = buildStatsMappings('kaigo_ninteisha', ninteishaRows, facilitiesSet);
  const hokMappings = buildStatsMappings('kaigo_hokensha', hokenshaRows, facilitiesSet);

  const allMappings = [...facMappings, ...ninMappings, ...hokMappings];

  // サマリ出力
  const countBy = (key: keyof MappingRow) => {
    const counts = new Map<string, number>();
    for (const m of allMappings) {
      const v = m[key];
      counts.set(v, (counts.get(v) ?? 0) + 1);
    }
    return counts;
  };

  console.log('\n--- match_type 別件数 ---');
  for (const [type, count] of [...countBy('match_type')].sort()) {
    console.log(`  ${type}: ${count}`);
  }

  console.log('\n--- source_table 別件数 ---');
  for (const [src, count] of [...countBy('source_table')].sort()) {
    console.log(`  ${src}: ${count}`);
  }

  console.log('\n--- status 別件数 ---');
  for (const [status, count] of [...countBy('status')].sort()) {
    console.log(`  ${status}: ${count}`);
  }

  // match_type × source_table のクロス集計
  console.log('\n--- match_type × source_table ---');
  const cross = new Map<string, number>();
  for (const m of allMappings) {
    const key = `${m.match_type} × ${m.source_table}`;
    cross.set(key, (cross.get(key) ?? 0) + 1);
  }
  for (const [key, count] of [...cross].sort()) {
    console.log(`  ${key}: ${count}`);
  }

  // DB保存
  console.log('\nSaving to DB...');
  await sql`DELETE FROM municipality_mapping`;

  let inserted = 0;
  for (let i = 0; i < allMappings.length; i += BATCH_SIZE) {
    const batch = allMappings.slice(i, i + BATCH_SIZE);
    await insertBatch(batch);
    inserted += batch.length;
    console.log(`  ${inserted}/${allMappings.length}`);
  }

  // 検証
  const total = await sql`SELECT COUNT(*) AS cnt FROM municipality_mapping`;
  console.log(`\nDone! ${total[0].cnt} rows saved to municipality_mapping`);

  // pending_review のサンプル
  console.log('\n--- pending_review サンプル（先頭20件） ---');
  const pending = await sql`
    SELECT source_table, prefecture, city_raw, match_type, notes
    FROM municipality_mapping
    WHERE status = 'pending_review'
    ORDER BY prefecture, city_raw
    LIMIT 20
  `;
  for (const r of pending) {
    console.log(`  [${r.source_table}] ${r.prefecture} / ${r.city_raw} (${r.match_type}) ${r.notes ?? ''}`);
  }
}

main().catch(console.error);
