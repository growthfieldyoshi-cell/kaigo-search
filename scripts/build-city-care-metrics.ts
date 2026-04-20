import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);

const RESIDENTIAL_CODES = ['210', '220', '230', '320', '331', '332', '334'];

async function main() {
  console.log('city_care_metrics テーブル構築\n');

  // ── テーブル作成 ──

  console.log('Creating table...');
  await sql`
    CREATE TABLE IF NOT EXISTS city_care_metrics (
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
      year INTEGER DEFAULT 2023,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(prefecture, city_agg, year)
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_ccm_pref_city ON city_care_metrics(prefecture, city_agg)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_ccm_sufficiency ON city_care_metrics(sufficiency_rate)`;

  // ── 入所系施設の集計（capacity cleaned） ──

  console.log('Aggregating residential facilities...');
  const facilityStats = await sql`
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
      WHERE f.service_code = ANY(${RESIDENTIAL_CODES})
    )
    SELECT
      prefecture,
      city_agg,
      COUNT(*) AS facility_count,
      SUM(capacity_clean) AS capacity_sum,
      COUNT(capacity_clean) AS capacity_facility_count
    FROM capacity_cleaned
    GROUP BY prefecture, city_agg
    ORDER BY prefecture, city_agg
  `;
  console.log(`  ${facilityStats.length} municipality groups`);

  // ── ninteisha 集計 ──

  // ninteisha/hokensha は city が stats 側の粒度。
  // mapping の city_agg と直接結合する（exact なら city_raw = city_agg = stats の city）。
  // city_agg の一覧は confirmed な facilities mapping から取得。

  console.log('Aggregating ninteisha...');
  const ninteishaStats = await sql`
    SELECT
      n.prefecture,
      n.city AS city_agg,
      SUM(n.total) AS ninteisha_total
    FROM kaigo_ninteisha n
    WHERE EXISTS (
      SELECT 1 FROM municipality_mapping m
      WHERE m.source_table = 'facilities'
        AND m.status = 'confirmed'
        AND m.match_type IN ('exact', 'seirei_city_ward', 'name_variant')
        AND m.prefecture = n.prefecture
        AND m.city_agg = n.city
    )
    GROUP BY n.prefecture, n.city
    ORDER BY n.prefecture, n.city
  `;
  console.log(`  ${ninteishaStats.length} municipality groups`);

  // ── hokensha 集計 ──

  console.log('Aggregating hokensha...');
  const hokenshaStats = await sql`
    SELECT
      h.prefecture,
      h.city AS city_agg,
      SUM(h.total) AS hokensha_total
    FROM kaigo_hokensha h
    WHERE EXISTS (
      SELECT 1 FROM municipality_mapping m
      WHERE m.source_table = 'facilities'
        AND m.status = 'confirmed'
        AND m.match_type IN ('exact', 'seirei_city_ward', 'name_variant')
        AND m.prefecture = h.prefecture
        AND m.city_agg = h.city
    )
    GROUP BY h.prefecture, h.city
    ORDER BY h.prefecture, h.city
  `;
  console.log(`  ${hokenshaStats.length} municipality groups`);

  // ── メモリ上で結合 ──

  console.log('Merging...');

  type Row = Record<string, unknown>;

  const ninMap = new Map<string, number>();
  for (const r of ninteishaStats as Row[]) {
    ninMap.set(`${r.prefecture}\t${r.city_agg}`, Number(r.ninteisha_total));
  }
  const hokMap = new Map<string, number>();
  for (const r of hokenshaStats as Row[]) {
    hokMap.set(`${r.prefecture}\t${r.city_agg}`, Number(r.hokensha_total));
  }

  interface MetricRow {
    prefecture: string;
    city_agg: string;
    facility_count: number;
    capacity_sum: number | null;
    capacity_facility_count: number;
    ninteisha_total: number | null;
    hokensha_total: number | null;
    certification_rate: number | null;
    sufficiency_rate: number | null;
  }

  const metrics: MetricRow[] = [];
  for (const r of facilityStats as Row[]) {
    const key = `${r.prefecture}\t${r.city_agg}`;
    const facilityCount = Number(r.facility_count);
    const capacitySum = r.capacity_sum != null ? Number(r.capacity_sum) : null;
    const capacityFacilityCount = Number(r.capacity_facility_count);
    const ninteisha = ninMap.get(key) ?? null;
    const hokensha = hokMap.get(key) ?? null;

    const certRate = (ninteisha != null && hokensha != null && hokensha > 0)
      ? ninteisha / hokensha * 100
      : null;

    const suffRate = (capacitySum != null && ninteisha != null && ninteisha > 0)
      ? capacitySum / ninteisha * 100
      : null;

    metrics.push({
      prefecture: r.prefecture as string,
      city_agg: r.city_agg as string,
      facility_count: facilityCount,
      capacity_sum: capacitySum,
      capacity_facility_count: capacityFacilityCount,
      ninteisha_total: ninteisha,
      hokensha_total: hokensha,
      certification_rate: certRate != null ? Math.round(certRate * 100) / 100 : null,
      sufficiency_rate: suffRate != null ? Math.round(suffRate * 1000) / 1000 : null,
    });
  }

  console.log(`  ${metrics.length} metric rows built`);

  // ── DB保存 ──

  console.log('Saving to DB...');
  await sql`DELETE FROM city_care_metrics`;

  const BATCH_SIZE = 200;
  let inserted = 0;

  for (let i = 0; i < metrics.length; i += BATCH_SIZE) {
    const batch = metrics.slice(i, i + BATCH_SIZE);
    const values: string[] = [];
    const params: (string | number | null)[] = [];
    let idx = 1;

    for (const m of batch) {
      const ph: string[] = [];
      for (const val of [
        m.prefecture, m.city_agg,
        m.facility_count, m.capacity_sum, m.capacity_facility_count,
        m.ninteisha_total, m.hokensha_total,
        m.certification_rate, m.sufficiency_rate,
      ]) {
        ph.push(`$${idx++}`);
        params.push(val);
      }
      values.push(`(${ph.join(',')})`);
    }

    await sql.query(
      `INSERT INTO city_care_metrics
        (prefecture, city_agg, facility_count, capacity_sum, capacity_facility_count,
         ninteisha_total, hokensha_total, certification_rate, sufficiency_rate)
       VALUES ${values.join(',')}`,
      params,
    );
    inserted += batch.length;
    console.log(`  ${inserted}/${metrics.length}`);
  }

  // ── 検証 ──

  const total = await sql`SELECT COUNT(*) AS cnt FROM city_care_metrics`;
  console.log(`\nDone! ${total[0].cnt} rows in city_care_metrics`);

  // サマリ
  const summary = await sql`
    SELECT
      COUNT(*) AS total_cities,
      COUNT(sufficiency_rate) AS has_sufficiency,
      COUNT(certification_rate) AS has_certification,
      ROUND(AVG(certification_rate), 2) AS avg_cert_rate,
      ROUND(AVG(sufficiency_rate)::numeric, 3) AS avg_suff_rate,
      MIN(sufficiency_rate) AS min_suff,
      MAX(sufficiency_rate) AS max_suff
    FROM city_care_metrics
  `;
  console.log('\nサマリ:');
  const s = summary[0];
  console.log(`  市区町村数:        ${s.total_cities}`);
  console.log(`  充足率あり:        ${s.has_sufficiency}`);
  console.log(`  認定率あり:        ${s.has_certification}`);
  console.log(`  平均認定率:        ${s.avg_cert_rate}%`);
  console.log(`  平均充足率:        ${s.avg_suff_rate}%`);
  console.log(`  充足率 最小:       ${s.min_suff}%`);
  console.log(`  充足率 最大:       ${s.max_suff}%`);

  // 充足率 上位10
  console.log('\n--- 充足率 上位10市区町村 ---');
  const top = await sql`
    SELECT prefecture, city_agg, facility_count, capacity_sum,
           ninteisha_total, hokensha_total,
           certification_rate, sufficiency_rate
    FROM city_care_metrics
    WHERE sufficiency_rate IS NOT NULL
    ORDER BY sufficiency_rate DESC
    LIMIT 10
  `;
  console.log('  都道府県 / 市区町村 | 施設数 | 定員計 | 認定者 | 65歳+ | 認定率 | 充足率');
  console.log('  ' + '-'.repeat(90));
  for (const r of top) {
    console.log(`  ${r.prefecture} / ${r.city_agg} | ${r.facility_count} | ${r.capacity_sum ?? '-'} | ${r.ninteisha_total} | ${r.hokensha_total} | ${r.certification_rate}% | ${r.sufficiency_rate}%`);
  }

  // 充足率 下位10
  console.log('\n--- 充足率 下位10市区町村 ---');
  const bottom = await sql`
    SELECT prefecture, city_agg, facility_count, capacity_sum,
           ninteisha_total, hokensha_total,
           certification_rate, sufficiency_rate
    FROM city_care_metrics
    WHERE sufficiency_rate IS NOT NULL
    ORDER BY sufficiency_rate ASC
    LIMIT 10
  `;
  console.log('  都道府県 / 市区町村 | 施設数 | 定員計 | 認定者 | 65歳+ | 認定率 | 充足率');
  console.log('  ' + '-'.repeat(90));
  for (const r of bottom) {
    console.log(`  ${r.prefecture} / ${r.city_agg} | ${r.facility_count} | ${r.capacity_sum ?? '-'} | ${r.ninteisha_total} | ${r.hokensha_total} | ${r.certification_rate}% | ${r.sufficiency_rate}%`);
  }
}

main().catch(console.error);
