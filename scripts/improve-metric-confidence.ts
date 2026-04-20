import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);

// ========================================
// confidence_score 算出ロジック（0〜100）
// ========================================
//
// A. capacity_coverage_rate（定員充足率の母数品質）: 最大 40点
//    >= 0.8 → 40
//    >= 0.6 → 30
//    >= 0.4 → 20
//    >= 0.3 → 10
//    < 0.3  → 0
//
// B. capacity_facility_count（定員有効な施設数）: 最大 20点
//    >= 20  → 20
//    >= 10  → 15
//    >= 5   → 10
//    >= 3   → 5
//    < 3    → 0
//    小規模自治体の極端値を抑えるための要素。
//    定員1件で「充足率 20%」のような数値が高信頼にならないようにする。
//
// C. facility_count（入所系施設数の母数）: 最大 15点
//    >= 50  → 15
//    >= 20  → 10
//    >= 10  → 5
//    < 10   → 0
//
// D. mapping_quality: 最大 15点
//    exact                  → 15
//    admin_level_adjusted   → 10（政令指定都市の区→市集約）
//    name_normalized        → 10（ケ/ヶ等の表記ゆれ補正）
//    stats_only             → 5 （施設データなし）
//
// E. 異常値影響ペナルティ: 最大 -10点
//    capacity_sum が NULL（有効定員0件）→ -10
//    （capacity >= 500 の異常除外は build-city-care-metrics で処理済み。
//      ここでは「結果として有効定員が0件」なケースを検出する）
//
// 合計: A + B + C + D + E （最低0、最高90。通常上限は90だが、
//        ペナルティで下がることがある）
//
// ========================================
// metric_confidence の閾値
// ========================================
//
// >= 80 → high           比較・意思決定に使える品質
// >= 60 → medium         一般的な参考値
// >= 40 → low            注意付きで参考
// < 40  → reference_only 数値は出すが強くは使えない

function scoreA(coverageRate: number | null): number {
  if (coverageRate == null) return 0;
  if (coverageRate >= 0.8) return 40;
  if (coverageRate >= 0.6) return 30;
  if (coverageRate >= 0.4) return 20;
  if (coverageRate >= 0.3) return 10;
  return 0;
}

function scoreB(capFacCount: number): number {
  if (capFacCount >= 20) return 20;
  if (capFacCount >= 10) return 15;
  if (capFacCount >= 5) return 10;
  if (capFacCount >= 3) return 5;
  return 0;
}

function scoreC(facCount: number): number {
  if (facCount >= 50) return 15;
  if (facCount >= 20) return 10;
  if (facCount >= 10) return 5;
  return 0;
}

function scoreD(mappingQuality: string): number {
  switch (mappingQuality) {
    case 'exact': return 15;
    case 'admin_level_adjusted': return 10;
    case 'name_normalized': return 10;
    case 'stats_only': return 5;
    default: return 0;
  }
}

function scoreE(capacitySum: number | null): number {
  if (capacitySum == null) return -10;
  return 0;
}

function toConfidence(score: number): string {
  if (score >= 80) return 'high';
  if (score >= 60) return 'medium';
  if (score >= 40) return 'low';
  return 'reference_only';
}

// ── mapping_quality の判定 ──────────────────────────────────
//
// city_care_metrics の (prefecture, city_agg) に対して、
// municipality_mapping から match_type を取得する。
// seirei_city_ward の場合は複数の city_raw が同じ city_agg に集約されているが、
// match_type は全て seirei_city_ward なので city_agg 単位で一意に決まる。

function matchTypeToMappingQuality(matchType: string): string {
  switch (matchType) {
    case 'exact': return 'exact';
    case 'seirei_city_ward': return 'admin_level_adjusted';
    case 'name_variant': return 'name_normalized';
    case 'stats_only': return 'stats_only';
    default: return 'unknown';
  }
}

// ── メイン ──────────────────────────────────────────────────

async function main() {
  console.log('Phase 3: metric_confidence 実装\n');

  // ── 1. カラム追加 ──

  console.log('Adding columns...');
  await sql`ALTER TABLE city_care_metrics ADD COLUMN IF NOT EXISTS confidence_score INTEGER`;
  await sql`ALTER TABLE city_care_metrics ADD COLUMN IF NOT EXISTS metric_confidence VARCHAR(20)`;
  await sql`ALTER TABLE city_care_metrics ADD COLUMN IF NOT EXISTS mapping_quality VARCHAR(30)`;

  // ── 2. mapping_quality の判定 ──

  console.log('Resolving mapping_quality...');

  // city_agg ごとの match_type を取得（facilities source のみ）
  const mappingRows = await sql`
    SELECT DISTINCT city_agg, prefecture, match_type
    FROM municipality_mapping
    WHERE source_table = 'facilities'
      AND status = 'confirmed'
      AND match_type IN ('exact', 'seirei_city_ward', 'name_variant')
    ORDER BY prefecture, city_agg
  `;

  const qualityMap = new Map<string, string>();
  for (const r of mappingRows) {
    const key = `${r.prefecture}\t${r.city_agg}`;
    qualityMap.set(key, matchTypeToMappingQuality(r.match_type as string));
  }
  console.log(`  ${qualityMap.size} mapping quality entries resolved`);

  // ── 3. city_care_metrics の全行を取得してスコア計算 ──

  console.log('Computing scores...');

  const metrics = await sql`
    SELECT id, prefecture, city_agg,
           capacity_coverage_rate, capacity_facility_count,
           facility_count, capacity_sum
    FROM city_care_metrics
    ORDER BY id
  `;

  let updated = 0;
  for (const row of metrics) {
    const key = `${row.prefecture}\t${row.city_agg}`;
    const mq = qualityMap.get(key) ?? 'unknown';
    const coverage = row.capacity_coverage_rate != null ? Number(row.capacity_coverage_rate) : null;
    const capFac = Number(row.capacity_facility_count ?? 0);
    const fac = Number(row.facility_count ?? 0);
    const capSum = row.capacity_sum != null ? Number(row.capacity_sum) : null;

    const a = scoreA(coverage);
    const b = scoreB(capFac);
    const c = scoreC(fac);
    const d = scoreD(mq);
    const e = scoreE(capSum);
    const total = Math.max(0, a + b + c + d + e);
    const conf = toConfidence(total);

    await sql`
      UPDATE city_care_metrics
      SET confidence_score = ${total},
          metric_confidence = ${conf},
          mapping_quality = ${mq}
      WHERE id = ${row.id}
    `;
    updated++;
  }
  console.log(`  ${updated} rows updated`);

  // ── 4. サマリ出力 ──

  // metric_confidence 別件数
  console.log(`\n${'='.repeat(60)}`);
  console.log('metric_confidence 分布');
  console.log('='.repeat(60));
  const confDist = await sql`
    SELECT metric_confidence, COUNT(*) AS cnt,
           ROUND(AVG(confidence_score)) AS avg_score,
           MIN(confidence_score) AS min_score,
           MAX(confidence_score) AS max_score
    FROM city_care_metrics
    GROUP BY metric_confidence
    ORDER BY MIN(confidence_score) DESC
  `;
  for (const r of confDist) {
    console.log(`  ${(r.metric_confidence as string).padEnd(16)} ${String(r.cnt).padStart(5)}件  avg=${r.avg_score} range=[${r.min_score}..${r.max_score}]`);
  }

  // confidence_score 分布（10刻み）
  console.log(`\n${'='.repeat(60)}`);
  console.log('confidence_score 分布（10刻み）');
  console.log('='.repeat(60));
  const scoreDist = await sql`
    SELECT
      FLOOR(confidence_score / 10) * 10 AS bucket,
      COUNT(*) AS cnt
    FROM city_care_metrics
    GROUP BY bucket
    ORDER BY bucket
  `;
  for (const r of scoreDist) {
    const bar = '#'.repeat(Math.ceil(Number(r.cnt) / 10));
    console.log(`  ${String(r.bucket).padStart(3)}-${String(Number(r.bucket) + 9).padStart(3)}: ${String(r.cnt).padStart(5)} ${bar}`);
  }

  // mapping_quality 分布
  console.log(`\n${'='.repeat(60)}`);
  console.log('mapping_quality 分布');
  console.log('='.repeat(60));
  const mqDist = await sql`
    SELECT mapping_quality, COUNT(*) AS cnt
    FROM city_care_metrics
    GROUP BY mapping_quality
    ORDER BY mapping_quality
  `;
  for (const r of mqDist) console.log(`  ${r.mapping_quality}: ${r.cnt}`);

  // publishable=true の内訳
  console.log(`\n${'='.repeat(60)}`);
  console.log('publishable=true の metric_confidence 内訳');
  console.log('='.repeat(60));
  const pubConf = await sql`
    SELECT metric_confidence, COUNT(*) AS cnt
    FROM city_care_metrics
    WHERE is_sufficiency_publishable = true
    GROUP BY metric_confidence
    ORDER BY MIN(confidence_score) DESC
  `;
  for (const r of pubConf) console.log(`  ${r.metric_confidence}: ${r.cnt}`);

  // ── 上位20件 ──
  console.log(`\n${'='.repeat(110)}`);
  console.log('confidence_score 上位20件');
  console.log('='.repeat(110));
  const top = await sql`
    SELECT prefecture, city_agg, confidence_score, metric_confidence, mapping_quality,
           facility_count, capacity_facility_count, capacity_coverage_rate,
           sufficiency_rate, certification_rate
    FROM city_care_metrics
    ORDER BY confidence_score DESC, facility_count DESC
    LIMIT 20
  `;
  console.log('  都道府県 / 市区町村 | score | conf | mapping | 施設 | 有効 | coverage | 充足率 | 認定率');
  console.log('  ' + '-'.repeat(105));
  for (const r of top) {
    const cov = r.capacity_coverage_rate != null ? Number(r.capacity_coverage_rate).toFixed(2) : '-';
    const suf = r.sufficiency_rate != null ? r.sufficiency_rate + '%' : '-';
    const cert = r.certification_rate != null ? r.certification_rate + '%' : '-';
    console.log(`  ${r.prefecture} / ${(r.city_agg as string).padEnd(10)} | ${String(r.confidence_score).padStart(3)} | ${(r.metric_confidence as string).padEnd(15)} | ${(r.mapping_quality as string).padEnd(7)} | ${String(r.facility_count).padStart(4)} | ${String(r.capacity_facility_count).padStart(4)} | ${cov.padStart(6)} | ${suf.padStart(8)} | ${cert}`);
  }

  // ── 下位20件 ──
  console.log(`\n${'='.repeat(110)}`);
  console.log('confidence_score 下位20件');
  console.log('='.repeat(110));
  const bottom = await sql`
    SELECT prefecture, city_agg, confidence_score, metric_confidence, mapping_quality,
           facility_count, capacity_facility_count, capacity_coverage_rate,
           sufficiency_rate, certification_rate
    FROM city_care_metrics
    ORDER BY confidence_score ASC, facility_count ASC
    LIMIT 20
  `;
  console.log('  都道府県 / 市区町村 | score | conf | mapping | 施設 | 有効 | coverage | 充足率 | 認定率');
  console.log('  ' + '-'.repeat(105));
  for (const r of bottom) {
    const cov = r.capacity_coverage_rate != null ? Number(r.capacity_coverage_rate).toFixed(2) : '-';
    const suf = r.sufficiency_rate != null ? r.sufficiency_rate + '%' : '-';
    const cert = r.certification_rate != null ? r.certification_rate + '%' : '-';
    console.log(`  ${r.prefecture} / ${(r.city_agg as string).padEnd(10)} | ${String(r.confidence_score).padStart(3)} | ${(r.metric_confidence as string).padEnd(15)} | ${(r.mapping_quality as string).padEnd(7)} | ${String(r.facility_count).padStart(4)} | ${String(r.capacity_facility_count).padStart(4)} | ${cov.padStart(6)} | ${suf.padStart(8)} | ${cert}`);
  }

  // ── municipality_mapping 非更新確認 ──
  const mmCheck = await sql`
    SELECT match_type, COUNT(*) AS cnt
    FROM municipality_mapping
    GROUP BY match_type ORDER BY match_type
  `;
  console.log(`\n${'='.repeat(60)}`);
  console.log('municipality_mapping（確認用・更新なし）');
  console.log('='.repeat(60));
  for (const r of mmCheck) console.log(`  ${r.match_type}: ${r.cnt}`);
}

main().catch(console.error);
