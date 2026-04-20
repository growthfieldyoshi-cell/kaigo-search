import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);

function padR(s: string, len: number): string {
  const fw = [...s].filter((c) => c.charCodeAt(0) > 0xff).length;
  return s + ' '.repeat(Math.max(0, len - s.length - fw));
}

async function main() {
  console.log('city_care_metrics 改善（ALTER TABLE + UPDATE）\n');

  // ── 1. カラム追加 ──

  console.log('Adding columns...');

  // capacity_coverage_rate
  await sql`
    ALTER TABLE city_care_metrics
    ADD COLUMN IF NOT EXISTS capacity_coverage_rate NUMERIC(5,4)
  `;

  // data_quality_flag
  await sql`
    ALTER TABLE city_care_metrics
    ADD COLUMN IF NOT EXISTS data_quality_flag VARCHAR(10)
  `;

  // is_sufficiency_publishable
  await sql`
    ALTER TABLE city_care_metrics
    ADD COLUMN IF NOT EXISTS is_sufficiency_publishable BOOLEAN DEFAULT false
  `;

  // ── 2. UPDATE ──

  console.log('Updating capacity_coverage_rate...');
  await sql`
    UPDATE city_care_metrics
    SET capacity_coverage_rate =
      capacity_facility_count::float / NULLIF(facility_count, 0)
  `;

  console.log('Updating data_quality_flag...');
  await sql`
    UPDATE city_care_metrics
    SET data_quality_flag = CASE
      WHEN capacity_coverage_rate >= 0.6 THEN 'high'
      WHEN capacity_coverage_rate >= 0.3 THEN 'medium'
      ELSE 'low'
    END
  `;

  console.log('Updating is_sufficiency_publishable...');
  await sql`
    UPDATE city_care_metrics
    SET is_sufficiency_publishable = (
      sufficiency_rate IS NOT NULL
      AND capacity_coverage_rate >= 0.3
    )
  `;

  // ── 3. インデックス追加 ──

  await sql`CREATE INDEX IF NOT EXISTS idx_ccm_quality ON city_care_metrics(data_quality_flag)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_ccm_publishable ON city_care_metrics(is_sufficiency_publishable)`;

  // ── 4. 集計・出力 ──

  // data_quality_flag 別件数
  console.log('\n' + '='.repeat(60));
  console.log('data_quality_flag 別件数');
  console.log('='.repeat(60));
  const qualityCounts = await sql`
    SELECT data_quality_flag, COUNT(*) AS cnt
    FROM city_care_metrics
    GROUP BY data_quality_flag
    ORDER BY data_quality_flag
  `;
  for (const r of qualityCounts) {
    console.log(`  ${padR(r.data_quality_flag, 10)} ${r.cnt}`);
  }

  // is_sufficiency_publishable 件数
  const pubCounts = await sql`
    SELECT is_sufficiency_publishable, COUNT(*) AS cnt
    FROM city_care_metrics
    GROUP BY is_sufficiency_publishable
    ORDER BY is_sufficiency_publishable
  `;
  console.log('\nis_sufficiency_publishable:');
  for (const r of pubCounts) {
    console.log(`  ${String(r.is_sufficiency_publishable).padEnd(8)} ${r.cnt}`);
  }

  // ── 認定率 上位10 ──
  console.log('\n' + '='.repeat(100));
  console.log('認定率 上位10市区町村');
  console.log('='.repeat(100));
  const certTop = await sql`
    SELECT prefecture, city_agg, certification_rate, sufficiency_rate,
           hokensha_total, ninteisha_total, data_quality_flag, is_sufficiency_publishable
    FROM city_care_metrics
    WHERE certification_rate IS NOT NULL
    ORDER BY certification_rate DESC
    LIMIT 10
  `;
  console.log(
    padR('都道府県', 10) + padR('市区町村', 18) +
    padR('認定率', 8) + padR('充足率', 8) +
    padR('65歳+', 10) + padR('認定者', 10) +
    padR('品質', 8) + '公開可'
  );
  console.log('-'.repeat(100));
  for (const r of certTop) {
    console.log(
      padR(r.prefecture, 10) + padR(r.city_agg, 18) +
      padR(r.certification_rate + '%', 8) + padR((r.sufficiency_rate ?? '-') + '%', 8) +
      padR(String(r.hokensha_total), 10) + padR(String(r.ninteisha_total), 10) +
      padR(r.data_quality_flag, 8) + r.is_sufficiency_publishable
    );
  }

  // ── 認定率 下位10 ──
  console.log('\n' + '='.repeat(100));
  console.log('認定率 下位10市区町村');
  console.log('='.repeat(100));
  const certBottom = await sql`
    SELECT prefecture, city_agg, certification_rate, sufficiency_rate,
           hokensha_total, ninteisha_total, data_quality_flag, is_sufficiency_publishable
    FROM city_care_metrics
    WHERE certification_rate IS NOT NULL
    ORDER BY certification_rate ASC
    LIMIT 10
  `;
  console.log(
    padR('都道府県', 10) + padR('市区町村', 18) +
    padR('認定率', 8) + padR('充足率', 8) +
    padR('65歳+', 10) + padR('認定者', 10) +
    padR('品質', 8) + '公開可'
  );
  console.log('-'.repeat(100));
  for (const r of certBottom) {
    console.log(
      padR(r.prefecture, 10) + padR(r.city_agg, 18) +
      padR(r.certification_rate + '%', 8) + padR((r.sufficiency_rate ?? '-') + '%', 8) +
      padR(String(r.hokensha_total), 10) + padR(String(r.ninteisha_total), 10) +
      padR(r.data_quality_flag, 8) + r.is_sufficiency_publishable
    );
  }

  // ── 充足率 上位10（publishable のみ） ──
  console.log('\n' + '='.repeat(100));
  console.log('充足率 上位10市区町村（publishable = true）');
  console.log('='.repeat(100));
  const suffTop = await sql`
    SELECT prefecture, city_agg, sufficiency_rate, certification_rate,
           facility_count, capacity_sum, capacity_facility_count,
           ninteisha_total, capacity_coverage_rate, data_quality_flag
    FROM city_care_metrics
    WHERE is_sufficiency_publishable = true
    ORDER BY sufficiency_rate DESC
    LIMIT 10
  `;
  console.log(
    padR('都道府県', 10) + padR('市区町村', 18) +
    padR('充足率', 8) + padR('認定率', 8) +
    padR('施設数', 6) + padR('定員計', 8) + padR('有効施設', 8) +
    padR('認定者', 10) + padR('coverage', 10) + '品質'
  );
  console.log('-'.repeat(100));
  for (const r of suffTop) {
    console.log(
      padR(r.prefecture, 10) + padR(r.city_agg, 18) +
      padR(r.sufficiency_rate + '%', 8) + padR(r.certification_rate + '%', 8) +
      padR(String(r.facility_count), 6) + padR(String(r.capacity_sum ?? '-'), 8) + padR(String(r.capacity_facility_count), 8) +
      padR(String(r.ninteisha_total), 10) + padR(String(r.capacity_coverage_rate), 10) + r.data_quality_flag
    );
  }

  // ── 充足率 下位10（publishable のみ） ──
  console.log('\n' + '='.repeat(100));
  console.log('充足率 下位10市区町村（publishable = true）');
  console.log('='.repeat(100));
  const suffBottom = await sql`
    SELECT prefecture, city_agg, sufficiency_rate, certification_rate,
           facility_count, capacity_sum, capacity_facility_count,
           ninteisha_total, capacity_coverage_rate, data_quality_flag
    FROM city_care_metrics
    WHERE is_sufficiency_publishable = true
    ORDER BY sufficiency_rate ASC
    LIMIT 10
  `;
  console.log(
    padR('都道府県', 10) + padR('市区町村', 18) +
    padR('充足率', 8) + padR('認定率', 8) +
    padR('施設数', 6) + padR('定員計', 8) + padR('有効施設', 8) +
    padR('認定者', 10) + padR('coverage', 10) + '品質'
  );
  console.log('-'.repeat(100));
  for (const r of suffBottom) {
    console.log(
      padR(r.prefecture, 10) + padR(r.city_agg, 18) +
      padR(r.sufficiency_rate + '%', 8) + padR(r.certification_rate + '%', 8) +
      padR(String(r.facility_count), 6) + padR(String(r.capacity_sum ?? '-'), 8) + padR(String(r.capacity_facility_count), 8) +
      padR(String(r.ninteisha_total), 10) + padR(String(r.capacity_coverage_rate), 10) + r.data_quality_flag
    );
  }

  console.log('\nDone!');
}

main().catch(console.error);
