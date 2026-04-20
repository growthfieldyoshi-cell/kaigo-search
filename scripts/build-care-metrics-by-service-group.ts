import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);

// ========================================
// サービス類型定義
// ========================================
//
// 実データの service_code → service_name 対応（2024年度公表データ）:
//   210: 短期入所生活介護
//   220: 短期入所療養介護（介護老人保健施設）
//   230: 短期入所療養介護（療養病床を有する病院等）
//   320: 認知症対応型共同生活介護
//   331: 特定施設入居者生活介護（有料老人ホーム）
//   332: 特定施設入居者生活介護（軽費老人ホーム）
//   334: 特定施設入居者生活介護（有料老人ホーム（サービス付き高齢者向け住宅））
//
// 類型分類の設計意図:
//   - short_stay: 短期入所系。在宅復帰前提の利用。210/220/230
//   - group_home: グループホーム。認知症対応型の小規模居住。320
//   - tokutei_shisetsu: 特定施設入居者生活介護。有料老人ホーム・軽費・サ高住。331/332/334
//   - residential_total: 上記すべての合算。既存 city_care_metrics と整合する
//
// 注意:
//   元のプロンプトで 332=特養、334=老健 と記載があったが、
//   実データでは 332=軽費老人ホーム、334=サ高住。
//   実データ優先で類型を構成している。

interface ServiceGroup {
  group: string;
  codes: string[];
  label: string;
}

const SERVICE_GROUPS: ServiceGroup[] = [
  {
    group: 'short_stay',
    codes: ['210', '220', '230'],
    label: '短期入所系（ショートステイ）',
  },
  {
    group: 'group_home',
    codes: ['320'],
    label: '認知症対応型共同生活介護（グループホーム）',
  },
  {
    group: 'tokutei_shisetsu',
    codes: ['331', '332', '334'],
    label: '特定施設入居者生活介護（有料老人ホーム・軽費・サ高住）',
  },
];

// residential_total は上記すべてのコードを含む
const ALL_RESIDENTIAL_CODES = SERVICE_GROUPS.flatMap((g) => g.codes);

// ── メイン ──────────────────────────────────────────────────

async function main() {
  console.log('Phase 4: サービス類型別内部集計\n');

  // ── 1. テーブル作成 ──

  console.log('Creating table...');
  await sql`
    CREATE TABLE IF NOT EXISTS city_care_metrics_by_service_group (
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
      updated_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(prefecture, city_agg, service_group)
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_ccmsg_pref_city ON city_care_metrics_by_service_group(prefecture, city_agg)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_ccmsg_group ON city_care_metrics_by_service_group(service_group)`;

  // ── 2. 類型別集計 ──

  console.log('Aggregating...');

  // 全グループ + residential_total
  const groupsToProcess = [
    ...SERVICE_GROUPS,
    {
      group: 'residential_total',
      codes: ALL_RESIDENTIAL_CODES,
      label: '入所系全体',
    },
  ];

  // 既存データクリア（再実行対応）
  await sql`DELETE FROM city_care_metrics_by_service_group`;

  let totalInserted = 0;

  for (const grp of groupsToProcess) {
    console.log(`  ${grp.group} (${grp.codes.join(',')}): ${grp.label}`);

    // capacity_clean ロジック:
    //   NULL → NULL, 0 → NULL, >= 500 → NULL, else → value
    // municipality_mapping join:
    //   source_table='facilities', status='confirmed',
    //   match_type IN ('exact','seirei_city_ward','name_variant')
    const rows = await sql`
      WITH capacity_cleaned AS (
        SELECT
          m.prefecture,
          m.city_agg,
          f.id,
          CASE
            WHEN f.capacity IS NULL THEN NULL
            WHEN f.capacity = 0 THEN NULL
            WHEN f.capacity >= 500 THEN NULL
            ELSE f.capacity
          END AS capacity_clean
        FROM facilities f
        INNER JOIN municipality_mapping m
          ON m.source_table = 'facilities'
          AND m.prefecture = f.prefecture
          AND m.city_raw = f.city
          AND m.status = 'confirmed'
          AND m.match_type IN ('exact', 'seirei_city_ward', 'name_variant')
        WHERE f.service_code = ANY(${grp.codes})
      )
      SELECT
        prefecture,
        city_agg,
        COUNT(*) AS facility_count,
        SUM(capacity_clean) AS capacity_sum,
        COUNT(capacity_clean) AS capacity_facility_count,
        CASE
          WHEN COUNT(*) = 0 THEN NULL
          ELSE COUNT(capacity_clean)::float / COUNT(*)
        END AS capacity_coverage_rate
      FROM capacity_cleaned
      GROUP BY prefecture, city_agg
      ORDER BY prefecture, city_agg
    `;

    // バッチINSERT
    const BATCH = 200;
    for (let i = 0; i < rows.length; i += BATCH) {
      const batch = rows.slice(i, i + BATCH);
      const values: string[] = [];
      const params: (string | number | null)[] = [];
      let idx = 1;

      for (const r of batch) {
        const ph: string[] = [];
        for (const val of [
          r.prefecture as string,
          r.city_agg as string,
          grp.group,
          grp.codes.join(','),
          Number(r.facility_count),
          r.capacity_sum != null ? Number(r.capacity_sum) : null,
          Number(r.capacity_facility_count),
          r.capacity_coverage_rate != null ? Number(Number(r.capacity_coverage_rate).toFixed(4)) : null,
          grp.label,
        ]) {
          ph.push(`$${idx++}`);
          params.push(val);
        }
        values.push(`(${ph.join(',')})`);
      }

      await sql.query(
        `INSERT INTO city_care_metrics_by_service_group
          (prefecture, city_agg, service_group, service_codes,
           facility_count, capacity_sum, capacity_facility_count,
           capacity_coverage_rate, metric_note)
         VALUES ${values.join(',')}`,
        params,
      );
      totalInserted += batch.length;
    }
    console.log(`    → ${rows.length} municipalities`);
  }

  console.log(`\n合計 ${totalInserted} rows inserted`);

  // ── 3. 検証 ──

  // 3a. service_group ごとの件数サマリ
  console.log(`\n${'='.repeat(90)}`);
  console.log('service_group 件数サマリ');
  console.log('='.repeat(90));
  const groupSummary = await sql`
    SELECT service_group, service_codes,
           COUNT(*) AS cities,
           SUM(facility_count) AS total_facilities,
           SUM(capacity_sum) AS total_capacity,
           SUM(capacity_facility_count) AS total_cap_fac,
           ROUND(AVG(capacity_coverage_rate)::numeric, 4) AS avg_coverage
    FROM city_care_metrics_by_service_group
    GROUP BY service_group, service_codes
    ORDER BY service_group
  `;
  for (const r of groupSummary) {
    console.log(`  ${(r.service_group as string).padEnd(22)} codes=${(r.service_codes as string).padEnd(14)} cities=${String(r.cities).padStart(5)} fac=${String(r.total_facilities).padStart(7)} cap=${String(r.total_capacity ?? '-').padStart(8)} cap_fac=${String(r.total_cap_fac).padStart(6)} avg_cov=${r.avg_coverage}`);
  }

  // 3b. residential_total と既存 city_care_metrics の整合確認
  console.log(`\n${'='.repeat(90)}`);
  console.log('residential_total vs 既存 city_care_metrics 整合確認');
  console.log('='.repeat(90));

  const diffCheck = await sql`
    SELECT
      COUNT(*) AS total_cities,
      SUM(CASE WHEN sg.facility_count != ccm.facility_count THEN 1 ELSE 0 END) AS fac_diff,
      SUM(CASE WHEN COALESCE(sg.capacity_sum, -1) != COALESCE(ccm.capacity_sum, -1) THEN 1 ELSE 0 END) AS cap_diff,
      SUM(CASE WHEN sg.capacity_facility_count != ccm.capacity_facility_count THEN 1 ELSE 0 END) AS capfac_diff
    FROM city_care_metrics_by_service_group sg
    INNER JOIN city_care_metrics ccm
      ON ccm.prefecture = sg.prefecture AND ccm.city_agg = sg.city_agg
    WHERE sg.service_group = 'residential_total'
  `;
  const d = diffCheck[0];
  console.log(`  比較対象: ${d.total_cities} municipalities`);
  console.log(`  facility_count 差異: ${d.fac_diff}`);
  console.log(`  capacity_sum 差異:   ${d.cap_diff}`);
  console.log(`  cap_facility_count 差異: ${d.capfac_diff}`);

  if (Number(d.fac_diff) === 0 && Number(d.cap_diff) === 0 && Number(d.capfac_diff) === 0) {
    console.log('  ✓ 完全一致');
  } else {
    console.log('  ✗ 差異あり — 要調査');
    const diffRows = await sql`
      SELECT sg.prefecture, sg.city_agg,
             sg.facility_count AS sg_fac, ccm.facility_count AS ccm_fac,
             sg.capacity_sum AS sg_cap, ccm.capacity_sum AS ccm_cap
      FROM city_care_metrics_by_service_group sg
      INNER JOIN city_care_metrics ccm
        ON ccm.prefecture = sg.prefecture AND ccm.city_agg = sg.city_agg
      WHERE sg.service_group = 'residential_total'
        AND (sg.facility_count != ccm.facility_count
          OR COALESCE(sg.capacity_sum, -1) != COALESCE(ccm.capacity_sum, -1))
      LIMIT 10
    `;
    for (const r of diffRows) {
      console.log(`    ${r.prefecture}/${r.city_agg}: sg(${r.sg_fac},${r.sg_cap}) vs ccm(${r.ccm_fac},${r.ccm_cap})`);
    }
  }

  // 3c. 類型合計 = residential_total の確認（市区町村ごと）
  console.log(`\n${'='.repeat(90)}`);
  console.log('類型合計 vs residential_total 一致確認');
  console.log('='.repeat(90));

  const sumCheck = await sql`
    WITH sub_totals AS (
      SELECT prefecture, city_agg,
             SUM(facility_count) AS sum_fac,
             SUM(capacity_sum) AS sum_cap
      FROM city_care_metrics_by_service_group
      WHERE service_group != 'residential_total'
      GROUP BY prefecture, city_agg
    ),
    res_total AS (
      SELECT prefecture, city_agg, facility_count, capacity_sum
      FROM city_care_metrics_by_service_group
      WHERE service_group = 'residential_total'
    )
    SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN st.sum_fac != rt.facility_count THEN 1 ELSE 0 END) AS fac_mismatch,
      SUM(CASE WHEN COALESCE(st.sum_cap, -1) != COALESCE(rt.capacity_sum, -1) THEN 1 ELSE 0 END) AS cap_mismatch
    FROM res_total rt
    INNER JOIN sub_totals st ON st.prefecture = rt.prefecture AND st.city_agg = rt.city_agg
  `;
  const sc = sumCheck[0];
  console.log(`  比較対象: ${sc.total} municipalities`);
  console.log(`  facility_count 不一致: ${sc.fac_mismatch}`);
  console.log(`  capacity_sum 不一致:   ${sc.cap_mismatch}`);

  if (Number(sc.fac_mismatch) === 0 && Number(sc.cap_mismatch) === 0) {
    console.log('  ✓ 類型合計 = residential_total 完全一致');
  } else {
    console.log('  ✗ 不一致あり — 要調査');
  }

  // ── 4. サンプル出力 ──

  console.log(`\n${'='.repeat(110)}`);
  console.log('類型別集計サンプル: 東京都墨田区');
  console.log('='.repeat(110));
  const sampleCity = await sql`
    SELECT service_group, facility_count, capacity_sum, capacity_facility_count, capacity_coverage_rate
    FROM city_care_metrics_by_service_group
    WHERE prefecture = '東京都' AND city_agg = '墨田区'
    ORDER BY service_group
  `;
  for (const r of sampleCity) {
    const cov = r.capacity_coverage_rate != null ? Number(r.capacity_coverage_rate).toFixed(4) : '-';
    console.log(`  ${(r.service_group as string).padEnd(22)} fac=${String(r.facility_count).padStart(4)} cap=${String(r.capacity_sum ?? '-').padStart(6)} cap_fac=${String(r.capacity_facility_count).padStart(4)} cov=${cov}`);
  }

  // coverage が極端に低い類型
  console.log(`\n${'='.repeat(90)}`);
  console.log('coverage が極端に低い類型（avg < 0.2, facility_count >= 10）');
  console.log('='.repeat(90));
  const lowCov = await sql`
    SELECT service_group,
           COUNT(*) AS cities,
           ROUND(AVG(capacity_coverage_rate)::numeric, 4) AS avg_cov,
           ROUND(AVG(facility_count)::numeric, 1) AS avg_fac
    FROM city_care_metrics_by_service_group
    WHERE service_group != 'residential_total'
    GROUP BY service_group
    ORDER BY avg_cov
  `;
  for (const r of lowCov) {
    console.log(`  ${(r.service_group as string).padEnd(22)} cities=${String(r.cities).padStart(5)} avg_coverage=${r.avg_cov} avg_facility_count=${r.avg_fac}`);
  }

  // ── 5. 既存テーブル非破壊確認 ──
  console.log(`\n${'='.repeat(60)}`);
  console.log('city_care_metrics 非破壊確認');
  console.log('='.repeat(60));
  const ccmCount = await sql`SELECT COUNT(*) AS cnt FROM city_care_metrics`;
  const ccmSample = await sql`
    SELECT confidence_score, metric_confidence, sufficiency_rate
    FROM city_care_metrics
    WHERE prefecture = '東京都' AND city_agg = '墨田区'
  `;
  console.log(`  city_care_metrics 行数: ${ccmCount[0].cnt}`);
  console.log(`  墨田区: score=${ccmSample[0].confidence_score} conf=${ccmSample[0].metric_confidence} suf=${ccmSample[0].sufficiency_rate}`);
}

main().catch(console.error);
