import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);

// ========================================
// 入所系サービスコード v2 定義
// ========================================
//
// v1 (Phase 4):  210, 220, 230, 320, 331, 332, 334  (7コード)
// v2 (本修正):  +520, +540, +550                     (10コード)
//
// 追加理由:
//   520: 介護老人保健施設（老健）— 入所系の中核。4,121件
//   540: 地域密着型介護老人福祉施設（小規模特養）— 2,553件
//   550: 介護医療院 — 介護療養型からの移行先。923件
//
// Phase 4.5 の監査で、これら3コードが residential_total から
// 欠落しており充足率を過小評価していることが判明。

const V2_RESIDENTIAL_CODES = [
  '210', '220', '230',  // 短期入所系
  '320',                // グループホーム
  '331', '332', '334',  // 特定施設系
  '520', '540', '550',  // 施設系（老健・小規模特養・介護医療院）
];

// サービス類型定義 v2
const SERVICE_GROUPS_V2 = [
  { group: 'short_stay',         codes: ['210', '220', '230'],  label: '短期入所系' },
  { group: 'group_home',         codes: ['320'],                label: 'グループホーム' },
  { group: 'tokutei_shisetsu',   codes: ['331', '332', '334'],  label: '特定施設入居者生活介護' },
  { group: 'institutional_core', codes: ['520', '540', '550'],  label: '施設系（老健・小規模特養・介護医療院）' },
];

// ── ヘルパー ────────────────────────────────────────────────

function scoreA(cov: number | null): number {
  if (cov == null) return 0;
  if (cov >= 0.8) return 40; if (cov >= 0.6) return 30;
  if (cov >= 0.4) return 20; if (cov >= 0.3) return 10;
  return 0;
}
function scoreB(n: number): number {
  if (n >= 20) return 20; if (n >= 10) return 15;
  if (n >= 5) return 10;  if (n >= 3) return 5;
  return 0;
}
function scoreC(n: number): number {
  if (n >= 50) return 15; if (n >= 20) return 10;
  if (n >= 10) return 5;
  return 0;
}
function scoreD(mq: string): number {
  if (mq === 'exact') return 15;
  if (mq === 'admin_level_adjusted' || mq === 'name_normalized') return 10;
  if (mq === 'stats_only') return 5;
  return 0;
}
function toConf(s: number): string {
  if (s >= 80) return 'high'; if (s >= 60) return 'medium';
  if (s >= 40) return 'low'; return 'reference_only';
}

function matchTypeToMQ(mt: string): string {
  if (mt === 'exact') return 'exact';
  if (mt === 'seirei_city_ward') return 'admin_level_adjusted';
  if (mt === 'name_variant') return 'name_normalized';
  return 'unknown';
}

// ── メイン ──────────────────────────────────────────────────

async function main() {
  console.log('Phase 4 修正版: 入所系充足率 v2\n');

  // ── 1. city_care_metrics_v2 ──

  console.log('Creating city_care_metrics_v2...');
  await sql`DROP TABLE IF EXISTS city_care_metrics_v2`;
  await sql`
    CREATE TABLE city_care_metrics_v2 (
      id SERIAL PRIMARY KEY,
      prefecture VARCHAR(20) NOT NULL,
      city_agg VARCHAR(100) NOT NULL,
      facility_count INTEGER DEFAULT 0,
      capacity_sum INTEGER,
      capacity_facility_count INTEGER DEFAULT 0,
      ninteisha_total INTEGER,
      hokensha_total INTEGER,
      certification_rate NUMERIC(5,2),
      sufficiency_rate NUMERIC(7,3),
      capacity_coverage_rate NUMERIC(5,4),
      data_quality_flag VARCHAR(10),
      is_sufficiency_publishable BOOLEAN DEFAULT false,
      confidence_score INTEGER,
      metric_confidence VARCHAR(20),
      mapping_quality VARCHAR(30),
      year INTEGER DEFAULT 2023,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(prefecture, city_agg, year)
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_ccmv2_pref ON city_care_metrics_v2(prefecture, city_agg)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_ccmv2_suf ON city_care_metrics_v2(sufficiency_rate)`;

  // ── 2. 施設集計 ──

  console.log('Aggregating facilities (v2 codes)...');
  const facStats = await sql`
    WITH cc AS (
      SELECT m.prefecture, m.city_agg, f.id,
        CASE WHEN f.capacity IS NULL THEN NULL
             WHEN f.capacity = 0 THEN NULL
             WHEN f.capacity >= 500 THEN NULL
             ELSE f.capacity END AS cap_clean
      FROM facilities f
      INNER JOIN municipality_mapping m
        ON m.source_table = 'facilities'
        AND m.prefecture = f.prefecture AND m.city_raw = f.city
        AND m.status = 'confirmed'
        AND m.match_type IN ('exact','seirei_city_ward','name_variant')
      WHERE f.service_code = ANY(${V2_RESIDENTIAL_CODES})
    )
    SELECT prefecture, city_agg,
      COUNT(*) AS fac, SUM(cap_clean) AS cap_sum, COUNT(cap_clean) AS cap_fac
    FROM cc GROUP BY prefecture, city_agg ORDER BY prefecture, city_agg
  `;
  console.log(`  ${facStats.length} municipality groups`);

  // ── 3. ninteisha / hokensha ──

  console.log('Aggregating stats...');
  const [ninRows, hokRows] = await Promise.all([
    sql`
      SELECT n.prefecture, n.city AS city_agg, SUM(n.total) AS total
      FROM kaigo_ninteisha n
      WHERE EXISTS (
        SELECT 1 FROM municipality_mapping m
        WHERE m.source_table='facilities' AND m.status='confirmed'
          AND m.match_type IN ('exact','seirei_city_ward','name_variant')
          AND m.prefecture=n.prefecture AND m.city_agg=n.city
      )
      GROUP BY n.prefecture, n.city
    `,
    sql`
      SELECT h.prefecture, h.city AS city_agg, SUM(h.total) AS total
      FROM kaigo_hokensha h
      WHERE EXISTS (
        SELECT 1 FROM municipality_mapping m
        WHERE m.source_table='facilities' AND m.status='confirmed'
          AND m.match_type IN ('exact','seirei_city_ward','name_variant')
          AND m.prefecture=h.prefecture AND m.city_agg=h.city
      )
      GROUP BY h.prefecture, h.city
    `,
  ]);

  const ninMap = new Map(ninRows.map((r: Record<string, unknown>) => [`${r.prefecture}\t${r.city_agg}`, Number(r.total)]));
  const hokMap = new Map(hokRows.map((r: Record<string, unknown>) => [`${r.prefecture}\t${r.city_agg}`, Number(r.total)]));

  // mapping_quality
  const mqRows = await sql`
    SELECT DISTINCT city_agg, prefecture, match_type
    FROM municipality_mapping
    WHERE source_table='facilities' AND status='confirmed'
      AND match_type IN ('exact','seirei_city_ward','name_variant')
  `;
  const mqMap = new Map(mqRows.map((r: Record<string, unknown>) => [`${r.prefecture}\t${r.city_agg}`, matchTypeToMQ(r.match_type as string)]));

  // ── 4. メトリクス計算 + INSERT ──

  console.log('Computing metrics and inserting...');
  const BATCH = 200;
  let inserted = 0;

  for (let i = 0; i < facStats.length; i += BATCH) {
    const batch = facStats.slice(i, i + BATCH);
    const values: string[] = [];
    const params: (string | number | boolean | null)[] = [];
    let idx = 1;

    for (const r of batch) {
      const key = `${r.prefecture}\t${r.city_agg}`;
      const fac = Number(r.fac);
      const capSum = r.cap_sum != null ? Number(r.cap_sum) : null;
      const capFac = Number(r.cap_fac);
      const nin = ninMap.get(key) ?? null;
      const hok = hokMap.get(key) ?? null;
      const mq = mqMap.get(key) ?? 'unknown';

      const covRate = fac > 0 ? capFac / fac : null;
      const certRate = nin != null && hok != null && hok > 0 ? Math.round(nin / hok * 10000) / 100 : null;
      const sufRate = capSum != null && nin != null && nin > 0 ? Math.round(capSum / nin * 100000) / 1000 : null;

      const dqFlag = covRate != null
        ? (covRate >= 0.6 ? 'high' : covRate >= 0.3 ? 'medium' : 'low')
        : 'low';
      const pub = sufRate != null && covRate != null && covRate >= 0.3;

      const a = scoreA(covRate);
      const b = scoreB(capFac);
      const c = scoreC(fac);
      const d = scoreD(mq);
      const e = capSum == null ? -10 : 0;
      const confScore = Math.max(0, a + b + c + d + e);
      const metricConf = toConf(confScore);

      const ph: string[] = [];
      for (const val of [
        r.prefecture as string, r.city_agg as string,
        fac, capSum, capFac,
        nin, hok, certRate, sufRate,
        covRate != null ? Math.round(covRate * 10000) / 10000 : null,
        dqFlag, pub, confScore, metricConf, mq,
      ]) {
        ph.push(`$${idx++}`);
        params.push(val as string | number | boolean | null);
      }
      values.push(`(${ph.join(',')})`);
    }

    await sql.query(
      `INSERT INTO city_care_metrics_v2
        (prefecture, city_agg, facility_count, capacity_sum, capacity_facility_count,
         ninteisha_total, hokensha_total, certification_rate, sufficiency_rate,
         capacity_coverage_rate, data_quality_flag, is_sufficiency_publishable,
         confidence_score, metric_confidence, mapping_quality)
       VALUES ${values.join(',')}`,
      params,
    );
    inserted += batch.length;
  }
  console.log(`  ${inserted} rows`);

  // ── 5. city_care_metrics_by_service_group_v2 ──

  console.log('\nCreating city_care_metrics_by_service_group_v2...');
  await sql`DROP TABLE IF EXISTS city_care_metrics_by_service_group_v2`;
  await sql`
    CREATE TABLE city_care_metrics_by_service_group_v2 (
      id SERIAL PRIMARY KEY,
      prefecture VARCHAR(20) NOT NULL,
      city_agg VARCHAR(100) NOT NULL,
      service_group VARCHAR(30) NOT NULL,
      service_codes TEXT NOT NULL,
      facility_count INTEGER DEFAULT 0,
      capacity_sum INTEGER,
      capacity_facility_count INTEGER DEFAULT 0,
      capacity_coverage_rate NUMERIC(5,4),
      metric_note TEXT DEFAULT '',
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(prefecture, city_agg, service_group)
    )
  `;

  const allGroups = [
    ...SERVICE_GROUPS_V2,
    { group: 'residential_total', codes: V2_RESIDENTIAL_CODES, label: '入所系全体 v2' },
  ];

  let sgInserted = 0;
  for (const grp of allGroups) {
    const rows = await sql`
      WITH cc AS (
        SELECT m.prefecture, m.city_agg,
          CASE WHEN f.capacity IS NULL THEN NULL
               WHEN f.capacity = 0 THEN NULL
               WHEN f.capacity >= 500 THEN NULL
               ELSE f.capacity END AS cap_clean
        FROM facilities f
        INNER JOIN municipality_mapping m
          ON m.source_table='facilities' AND m.prefecture=f.prefecture AND m.city_raw=f.city
          AND m.status='confirmed' AND m.match_type IN ('exact','seirei_city_ward','name_variant')
        WHERE f.service_code = ANY(${grp.codes})
      )
      SELECT prefecture, city_agg,
        COUNT(*) AS fac, SUM(cap_clean) AS cap_sum, COUNT(cap_clean) AS cap_fac,
        CASE WHEN COUNT(*)=0 THEN NULL ELSE COUNT(cap_clean)::float/COUNT(*) END AS cov
      FROM cc GROUP BY prefecture, city_agg ORDER BY prefecture, city_agg
    `;

    for (let i = 0; i < rows.length; i += BATCH) {
      const batch = rows.slice(i, i + BATCH);
      const values: string[] = [];
      const params: (string | number | null)[] = [];
      let idx2 = 1;
      for (const r of batch) {
        const ph: string[] = [];
        for (const val of [
          r.prefecture as string, r.city_agg as string, grp.group, grp.codes.join(','),
          Number(r.fac), r.cap_sum != null ? Number(r.cap_sum) : null, Number(r.cap_fac),
          r.cov != null ? Math.round(Number(r.cov) * 10000) / 10000 : null, grp.label,
        ]) { ph.push(`$${idx2++}`); params.push(val); }
        values.push(`(${ph.join(',')})`);
      }
      await sql.query(
        `INSERT INTO city_care_metrics_by_service_group_v2
          (prefecture, city_agg, service_group, service_codes,
           facility_count, capacity_sum, capacity_facility_count, capacity_coverage_rate, metric_note)
         VALUES ${values.join(',')}`, params,
      );
      sgInserted += batch.length;
    }
    console.log(`  ${grp.group}: ${rows.length} cities`);
  }
  console.log(`  Total: ${sgInserted} rows`);

  // ── 6. 比較出力 ──

  console.log(`\n${'='.repeat(90)}`);
  console.log('v1 vs v2 比較');
  console.log('='.repeat(90));

  const cmp = await sql`
    SELECT
      COUNT(*) AS cities,
      SUM(v1.facility_count) AS v1_fac, SUM(v2.facility_count) AS v2_fac,
      SUM(v1.capacity_sum) AS v1_cap, SUM(v2.capacity_sum) AS v2_cap,
      SUM(v1.capacity_facility_count) AS v1_capfac, SUM(v2.capacity_facility_count) AS v2_capfac,
      ROUND(AVG(v1.sufficiency_rate)::numeric, 3) AS v1_avg_suf,
      ROUND(AVG(v2.sufficiency_rate)::numeric, 3) AS v2_avg_suf,
      SUM(CASE WHEN v1.is_sufficiency_publishable THEN 1 ELSE 0 END) AS v1_pub,
      SUM(CASE WHEN v2.is_sufficiency_publishable THEN 1 ELSE 0 END) AS v2_pub
    FROM city_care_metrics v1
    INNER JOIN city_care_metrics_v2 v2 ON v1.prefecture=v2.prefecture AND v1.city_agg=v2.city_agg
  `;
  const c = cmp[0];
  console.log(`  市区町村数:       ${c.cities}`);
  console.log(`  施設数:           v1=${c.v1_fac}  →  v2=${c.v2_fac}  (+${Number(c.v2_fac) - Number(c.v1_fac)})`);
  console.log(`  定員計:           v1=${c.v1_cap}  →  v2=${c.v2_cap}  (+${Number(c.v2_cap) - Number(c.v1_cap)})`);
  console.log(`  有効施設:         v1=${c.v1_capfac}  →  v2=${c.v2_capfac}  (+${Number(c.v2_capfac) - Number(c.v1_capfac)})`);
  console.log(`  平均充足率:       v1=${c.v1_avg_suf}%  →  v2=${c.v2_avg_suf}%`);
  console.log(`  publishable:      v1=${c.v1_pub}  →  v2=${c.v2_pub}`);

  // confidence 比較
  const confCmp = await sql`
    SELECT v2.metric_confidence, COUNT(*) AS cnt
    FROM city_care_metrics_v2 v2
    GROUP BY v2.metric_confidence
    ORDER BY MIN(v2.confidence_score) DESC
  `;
  console.log('\n  v2 metric_confidence:');
  for (const r of confCmp) console.log(`    ${r.metric_confidence}: ${r.cnt}`);

  // 充足率 上位10
  console.log(`\n${'='.repeat(110)}`);
  console.log('v2 充足率 上位10（publishable=true）');
  console.log('='.repeat(110));
  const top = await sql`
    SELECT v2.prefecture, v2.city_agg,
           v2.sufficiency_rate AS v2_suf, v1.sufficiency_rate AS v1_suf,
           v2.facility_count, v2.capacity_sum, v2.confidence_score, v2.metric_confidence
    FROM city_care_metrics_v2 v2
    LEFT JOIN city_care_metrics v1 ON v1.prefecture=v2.prefecture AND v1.city_agg=v2.city_agg
    WHERE v2.is_sufficiency_publishable = true
    ORDER BY v2.sufficiency_rate DESC LIMIT 10
  `;
  console.log('  都道府県 / 市区町村 | v2充足率 | v1充足率 | 施設 | 定員 | score | conf');
  console.log('  ' + '-'.repeat(100));
  for (const r of top) {
    console.log(`  ${r.prefecture} / ${r.city_agg} | ${r.v2_suf}% | ${r.v1_suf ?? '-'}% | ${r.facility_count} | ${r.capacity_sum ?? '-'} | ${r.confidence_score} | ${r.metric_confidence}`);
  }

  // 充足率 下位10
  console.log(`\n${'='.repeat(110)}`);
  console.log('v2 充足率 下位10（publishable=true）');
  console.log('='.repeat(110));
  const bottom = await sql`
    SELECT v2.prefecture, v2.city_agg,
           v2.sufficiency_rate AS v2_suf, v1.sufficiency_rate AS v1_suf,
           v2.facility_count, v2.capacity_sum, v2.confidence_score, v2.metric_confidence
    FROM city_care_metrics_v2 v2
    LEFT JOIN city_care_metrics v1 ON v1.prefecture=v2.prefecture AND v1.city_agg=v2.city_agg
    WHERE v2.is_sufficiency_publishable = true
    ORDER BY v2.sufficiency_rate ASC LIMIT 10
  `;
  console.log('  都道府県 / 市区町村 | v2充足率 | v1充足率 | 施設 | 定員 | score | conf');
  console.log('  ' + '-'.repeat(100));
  for (const r of bottom) {
    console.log(`  ${r.prefecture} / ${r.city_agg} | ${r.v2_suf}% | ${r.v1_suf ?? '-'}% | ${r.facility_count} | ${r.capacity_sum ?? '-'} | ${r.confidence_score} | ${r.metric_confidence}`);
  }

  // service_group_v2 サマリ
  console.log(`\n${'='.repeat(90)}`);
  console.log('service_group v2 サマリ');
  console.log('='.repeat(90));
  const sgSummary = await sql`
    SELECT service_group, service_codes,
           COUNT(*) AS cities, SUM(facility_count) AS fac,
           SUM(capacity_sum) AS cap, SUM(capacity_facility_count) AS cap_fac,
           ROUND(AVG(capacity_coverage_rate)::numeric, 4) AS avg_cov
    FROM city_care_metrics_by_service_group_v2
    GROUP BY service_group, service_codes ORDER BY service_group
  `;
  for (const r of sgSummary) {
    console.log(`  ${(r.service_group as string).padEnd(22)} codes=${(r.service_codes as string).padEnd(30)} cities=${String(r.cities).padStart(5)} fac=${String(r.fac).padStart(6)} cap=${String(r.cap ?? '-').padStart(8)} avg_cov=${r.avg_cov}`);
  }

  // 既存テーブル非破壊確認
  const v1check = await sql`SELECT COUNT(*) AS cnt FROM city_care_metrics`;
  const v1sg = await sql`SELECT COUNT(*) AS cnt FROM city_care_metrics_by_service_group`;
  console.log(`\n既存テーブル確認: city_care_metrics=${v1check[0].cnt}行, by_service_group=${v1sg[0].cnt}行 (変更なし)`);
}

main().catch(console.error);
