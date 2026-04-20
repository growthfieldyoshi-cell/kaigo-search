import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);

type PrefCity = { prefecture: string; city: string };

interface MappingCandidate {
  prefecture: string;
  city_raw: string;
  suggested_city_agg: string;
  match_type: string;
  notes: string;
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

function keyToPrefCity(key: string): PrefCity {
  const [prefecture, city] = key.split('\t');
  return { prefecture, city };
}

// ── 分類ロジック ────────────────────────────────────────────

/** 「○○市○○区」形式 → 政令指定都市の区 */
const SEIREI_PATTERN = /^(.+市).+区$/;

function extractSeireiCity(city: string): string | null {
  const m = city.match(SEIREI_PATTERN);
  return m ? m[1] : null;
}

function classifyFacilitiesOnly(
  onlyFacilities: PrefCity[],
  statsSet: Set<string>,
  statsCities: PrefCity[],
): {
  seirei_city_ward: MappingCandidate[];
  wide_area_possible: MappingCandidate[];
  other: MappingCandidate[];
} {
  // 都道府県ごとの stats 側の広域連合名を収集
  const wideAreaByPref = new Map<string, string[]>();
  for (const { prefecture, city } of statsCities) {
    if (city.includes('広域連合') || city.includes('広域市町村') || city.includes('広域行政') || city.includes('広域組合') || city.includes('事業組合')) {
      const list = wideAreaByPref.get(prefecture) ?? [];
      list.push(city);
      wideAreaByPref.set(prefecture, list);
    }
  }

  const seirei_city_ward: MappingCandidate[] = [];
  const wide_area_possible: MappingCandidate[] = [];
  const other: MappingCandidate[] = [];

  for (const { prefecture, city } of onlyFacilities) {
    // 1. 政令指定都市の区？
    const seireiCity = extractSeireiCity(city);
    if (seireiCity && statsSet.has(`${prefecture}\t${seireiCity}`)) {
      seirei_city_ward.push({
        prefecture,
        city_raw: city,
        suggested_city_agg: seireiCity,
        match_type: 'seirei_city_ward',
        notes: `${city} → ${seireiCity} で stats 側に一致`,
      });
      continue;
    }

    // 2. 同一都道府県の stats 側に広域連合が存在？
    const wideAreas = wideAreaByPref.get(prefecture);
    if (wideAreas && wideAreas.length > 0) {
      wide_area_possible.push({
        prefecture,
        city_raw: city,
        suggested_city_agg: '',
        match_type: 'wide_area_possible',
        notes: `同県の広域連合候補: ${wideAreas.join(', ')}`,
      });
      continue;
    }

    // 3. その他
    other.push({
      prefecture,
      city_raw: city,
      suggested_city_agg: '',
      match_type: 'other',
      notes: '',
    });
  }

  return { seirei_city_ward, wide_area_possible, other };
}

function classifyStatsOnly(
  onlyStats: PrefCity[],
  facilitiesSet: Set<string>,
): {
  stats_city_only: MappingCandidate[];
  wide_area_union: MappingCandidate[];
  other: MappingCandidate[];
} {
  const stats_city_only: MappingCandidate[] = [];
  const wide_area_union: MappingCandidate[] = [];
  const other: MappingCandidate[] = [];

  for (const { prefecture, city } of onlyStats) {
    // 1. 広域連合・広域組合
    if (city.includes('広域連合') || city.includes('広域市町村') || city.includes('広域行政') || city.includes('広域組合') || city.includes('事業組合')) {
      wide_area_union.push({
        prefecture,
        city_raw: city,
        suggested_city_agg: '',
        match_type: 'wide_area_union',
        notes: '広域連合/組合名称',
      });
      continue;
    }

    // 2. 政令指定都市の市のみ（facilities 側に区レベルが存在する）
    let hasWards = false;
    for (const key of facilitiesSet) {
      const { prefecture: p, city: c } = keyToPrefCity(key);
      if (p === prefecture && c.startsWith(city) && c !== city && SEIREI_PATTERN.test(c)) {
        hasWards = true;
        break;
      }
    }
    if (hasWards) {
      stats_city_only.push({
        prefecture,
        city_raw: city,
        suggested_city_agg: city,
        match_type: 'stats_city_only',
        notes: `facilities 側は区単位で存在`,
      });
      continue;
    }

    // 3. その他
    other.push({
      prefecture,
      city_raw: city,
      suggested_city_agg: '',
      match_type: 'other',
      notes: '',
    });
  }

  return { stats_city_only, wide_area_union, other };
}

// ── 出力 ────────────────────────────────────────────────────

function printList(label: string, items: MappingCandidate[], limit: number) {
  if (items.length === 0) return;
  console.log(`\n  --- ${label}（${items.length}件、先頭${Math.min(items.length, limit)}件表示） ---`);
  for (const item of items.slice(0, limit)) {
    const agg = item.suggested_city_agg ? ` → ${item.suggested_city_agg}` : '';
    const note = item.notes ? `  (${item.notes})` : '';
    console.log(`    ${item.prefecture} / ${item.city_raw}${agg}${note}`);
  }
  if (items.length > limit) console.log(`    ... 他 ${items.length - limit} 件`);
}

function printClassification(
  label: string,
  categories: Record<string, MappingCandidate[]>,
  limits: Record<string, number>,
) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(label);
  console.log('='.repeat(60));

  const total = Object.values(categories).reduce((s, a) => s + a.length, 0);
  console.log(`  総数: ${total}`);
  for (const [cat, items] of Object.entries(categories)) {
    console.log(`    ${cat}: ${items.length}`);
  }

  for (const [cat, items] of Object.entries(categories)) {
    printList(cat, items, limits[cat] ?? 30);
  }
}

// ── メイン ──────────────────────────────────────────────────

async function main() {
  console.log('市区町村名 不一致パターン分類\n');

  const [facilitiesRows, ninteishaRows, hokenshaRows] = await Promise.all([
    getUniquePrefCities('facilities'),
    getUniquePrefCities('kaigo_ninteisha'),
    getUniquePrefCities('kaigo_hokensha'),
  ]);

  const facilitiesSet = toKeySet(facilitiesRows);
  const ninteishaSet = toKeySet(ninteishaRows);
  const hokenshaSet = toKeySet(hokenshaRows);

  console.log(`facilities       ユニーク市区町村数: ${facilitiesSet.size}`);
  console.log(`kaigo_ninteisha  ユニーク市区町村数: ${ninteishaSet.size}`);
  console.log(`kaigo_hokensha   ユニーク市区町村数: ${hokenshaSet.size}`);

  // ── facilities ↔ kaigo_ninteisha ──

  const onlyFacVsNin = facilitiesRows.filter((r) => !ninteishaSet.has(`${r.prefecture}\t${r.city}`));
  const onlyNinVsFac = ninteishaRows.filter((r) => !facilitiesSet.has(`${r.prefecture}\t${r.city}`));

  const facClassNin = classifyFacilitiesOnly(onlyFacVsNin, ninteishaSet, ninteishaRows);
  const ninClass = classifyStatsOnly(onlyNinVsFac, facilitiesSet);

  printClassification('facilities のみ（vs kaigo_ninteisha）', {
    seirei_city_ward: facClassNin.seirei_city_ward,
    wide_area_possible: facClassNin.wide_area_possible,
    other: facClassNin.other,
  }, { seirei_city_ward: 50, wide_area_possible: 50, other: 30 });

  printClassification('kaigo_ninteisha のみ（vs facilities）', {
    stats_city_only: ninClass.stats_city_only,
    wide_area_union: ninClass.wide_area_union,
    other: ninClass.other,
  }, { stats_city_only: 50, wide_area_union: 50, other: 30 });

  // ── facilities ↔ kaigo_hokensha ──

  const onlyFacVsHok = facilitiesRows.filter((r) => !hokenshaSet.has(`${r.prefecture}\t${r.city}`));
  const onlyHokVsFac = hokenshaRows.filter((r) => !facilitiesSet.has(`${r.prefecture}\t${r.city}`));

  const facClassHok = classifyFacilitiesOnly(onlyFacVsHok, hokenshaSet, hokenshaRows);
  const hokClass = classifyStatsOnly(onlyHokVsFac, facilitiesSet);

  printClassification('facilities のみ（vs kaigo_hokensha）', {
    seirei_city_ward: facClassHok.seirei_city_ward,
    wide_area_possible: facClassHok.wide_area_possible,
    other: facClassHok.other,
  }, { seirei_city_ward: 50, wide_area_possible: 50, other: 30 });

  printClassification('kaigo_hokensha のみ（vs facilities）', {
    stats_city_only: hokClass.stats_city_only,
    wide_area_union: hokClass.wide_area_union,
    other: hokClass.other,
  }, { stats_city_only: 50, wide_area_union: 50, other: 30 });

  // ── マッピング候補サマリ ──

  console.log(`\n${'='.repeat(60)}`);
  console.log('マッピング候補サマリ（seirei_city_ward）');
  console.log('='.repeat(60));
  console.log('  prefecture | city_raw | suggested_city_agg | match_type');
  console.log('  ' + '-'.repeat(56));
  for (const m of facClassNin.seirei_city_ward) {
    console.log(`  ${m.prefecture} | ${m.city_raw} | ${m.suggested_city_agg} | ${m.match_type}`);
  }
}

main().catch(console.error);
