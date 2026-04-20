import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);

// ========================================
// confidence_score v2 配点（0〜100）
// ========================================
//
// A. capacity_coverage_rate: 0〜40
//    >= 0.8 → 40,  >= 0.6 → 30,  >= 0.4 → 20,  >= 0.3 → 10,  < 0.3 → 0
//
// B. capacity_facility_count: 0〜20
//    >= 20 → 20,  >= 10 → 15,  >= 5 → 10,  >= 3 → 5,  < 3 → 0
//
// C. facility_count: 0〜15
//    >= 50 → 15,  >= 20 → 10,  >= 10 → 5,  < 10 → 0
//
// D. mapping_quality: 5〜15
//    exact → 15,  admin_level_adjusted → 10,  name_normalized → 10,  stats_only → 5
//
// E. ペナルティ: -10〜0
//    capacity_sum IS NULL（有効定員0件）→ -10
//
// is_sufficiency_publishable v2:
//    sufficiency_rate IS NOT NULL
//    AND capacity_coverage_rate >= 0.3
//    AND capacity_facility_count >= 3   ← v2 追加条件（極小母数排除）

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

async function main() {
  console.log('city_care_metrics_v2 本命化: quality/confidence 再計算 + 監査\n');

  // ── 1. 行数差3件の監査 ──

  console.log('='.repeat(70));
  console.log('監査1: 行数差の確認');
  console.log('='.repeat(70));

  const v2only = await sql`
    SELECT v2.prefecture, v2.city_agg, v2.facility_count, v2.capacity_sum
    FROM city_care_metrics_v2 v2
    LEFT JOIN city_care_metrics v1 ON v1.prefecture=v2.prefecture AND v1.city_agg=v2.city_agg
    WHERE v1.id IS NULL ORDER BY v2.prefecture
  `;
  console.log(`v2のみに存在: ${v2only.length}件`);
  for (const r of v2only) {
    console.log(`  ${r.prefecture} / ${r.city_agg} (fac=${r.facility_count}, cap=${r.capacity_sum ?? 'NULL'})`);
  }
  console.log('原因: v1の7コードでは施設0件だが、v2で追加した520/540/550に施設がある自治体。');
  console.log('      重複ではなく、コード追加による正常な増加。\n');

  // ── 2. mapping_quality 解決 ──

  console.log('Resolving mapping_quality...');
  const mqRows = await sql`
    SELECT DISTINCT city_agg, prefecture, match_type
    FROM municipality_mapping
    WHERE source_table='facilities' AND status='confirmed'
      AND match_type IN ('exact','seirei_city_ward','name_variant')
  `;
  const mqMap = new Map(mqRows.map((r: Record<string, unknown>) =>
    [`${r.prefecture}\t${r.city_agg}`, matchTypeToMQ(r.match_type as string)]
  ));
  console.log(`  ${mqMap.size} entries`);

  // ── 3. 全行取得 → 再計算 → UPDATE ──

  console.log('Recomputing quality/confidence...');
  const rows = await sql`
    SELECT id, prefecture, city_agg,
           facility_count, capacity_sum, capacity_facility_count,
           sufficiency_rate
    FROM city_care_metrics_v2 ORDER BY id
  `;

  let updated = 0;
  for (const r of rows) {
    const key = `${r.prefecture}\t${r.city_agg}`;
    const mq = mqMap.get(key) ?? 'unknown';
    const fac = Number(r.facility_count ?? 0);
    const capFac = Number(r.capacity_facility_count ?? 0);
    const capSum = r.capacity_sum != null ? Number(r.capacity_sum) : null;
    const sufRate = r.sufficiency_rate != null ? Number(r.sufficiency_rate) : null;

    const covRate = fac > 0 ? capFac / fac : null;
    const dqFlag = covRate != null
      ? (covRate >= 0.6 ? 'high' : covRate >= 0.3 ? 'medium' : 'low')
      : 'low';
    const pub = sufRate != null && covRate != null && covRate >= 0.3 && capFac >= 3;

    const a = scoreA(covRate);
    const b = scoreB(capFac);
    const c = scoreC(fac);
    const d = scoreD(mq);
    const e = capSum == null ? -10 : 0;
    const confScore = Math.max(0, a + b + c + d + e);
    const metricConf = toConf(confScore);

    await sql`
      UPDATE city_care_metrics_v2
      SET capacity_coverage_rate = ${covRate != null ? Math.round(covRate * 10000) / 10000 : null},
          data_quality_flag = ${dqFlag},
          is_sufficiency_publishable = ${pub},
          confidence_score = ${confScore},
          metric_confidence = ${metricConf},
          mapping_quality = ${mq}
      WHERE id = ${r.id}
    `;
    updated++;
  }
  console.log(`  ${updated} rows updated\n`);

  // ── 4. v2 サマリ ──

  console.log('='.repeat(70));
  console.log('v2 サマリ');
  console.log('='.repeat(70));

  const v2sum = await sql`
    SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN is_sufficiency_publishable THEN 1 ELSE 0 END) AS publishable,
      ROUND(AVG(sufficiency_rate)::numeric, 3) AS avg_suf,
      ROUND(AVG(confidence_score)::numeric, 1) AS avg_score
    FROM city_care_metrics_v2
  `;
  const s = v2sum[0];
  console.log(`  総行数:       ${s.total}`);
  console.log(`  publishable:  ${s.publishable}`);
  console.log(`  平均充足率:   ${s.avg_suf}%`);
  console.log(`  平均score:    ${s.avg_score}`);

  // data_quality_flag
  console.log('\n  data_quality_flag:');
  const dqDist = await sql`
    SELECT data_quality_flag, COUNT(*) AS cnt FROM city_care_metrics_v2
    GROUP BY data_quality_flag ORDER BY data_quality_flag
  `;
  for (const r of dqDist) console.log(`    ${r.data_quality_flag}: ${r.cnt}`);

  // metric_confidence
  console.log('\n  metric_confidence:');
  const mcDist = await sql`
    SELECT metric_confidence, COUNT(*) AS cnt,
           ROUND(AVG(confidence_score)) AS avg_s
    FROM city_care_metrics_v2
    GROUP BY metric_confidence ORDER BY MIN(confidence_score) DESC
  `;
  for (const r of mcDist) console.log(`    ${(r.metric_confidence as string).padEnd(16)} ${String(r.cnt).padStart(5)}件  avg_score=${r.avg_s}`);

  // publishable の metric_confidence 内訳
  console.log('\n  publishable=true の metric_confidence:');
  const pubMc = await sql`
    SELECT metric_confidence, COUNT(*) AS cnt FROM city_care_metrics_v2
    WHERE is_sufficiency_publishable=true
    GROUP BY metric_confidence ORDER BY MIN(confidence_score) DESC
  `;
  for (const r of pubMc) console.log(`    ${r.metric_confidence}: ${r.cnt}`);

  // confidence_score 分布
  console.log('\n  confidence_score 分布:');
  const scoreDist = await sql`
    SELECT FLOOR(confidence_score/10)*10 AS bucket, COUNT(*) AS cnt
    FROM city_care_metrics_v2 GROUP BY bucket ORDER BY bucket
  `;
  for (const r of scoreDist) {
    const bar = '#'.repeat(Math.ceil(Number(r.cnt) / 10));
    console.log(`    ${String(r.bucket).padStart(3)}-${String(Number(r.bucket)+9).padStart(3)}: ${String(r.cnt).padStart(5)} ${bar}`);
  }

  // ── 5. v1 vs v2 差分確認 ──

  console.log(`\n${'='.repeat(90)}`);
  console.log('v1 → v2 差分');
  console.log('='.repeat(90));

  const diff = await sql`
    SELECT
      SUM(CASE WHEN v1.is_sufficiency_publishable THEN 1 ELSE 0 END) AS v1_pub,
      SUM(CASE WHEN v2.is_sufficiency_publishable THEN 1 ELSE 0 END) AS v2_pub,
      SUM(CASE WHEN v1.metric_confidence='high' THEN 1 ELSE 0 END) AS v1_high,
      SUM(CASE WHEN v2.metric_confidence='high' THEN 1 ELSE 0 END) AS v2_high,
      SUM(CASE WHEN v1.metric_confidence='medium' THEN 1 ELSE 0 END) AS v1_med,
      SUM(CASE WHEN v2.metric_confidence='medium' THEN 1 ELSE 0 END) AS v2_med
    FROM city_care_metrics v1
    INNER JOIN city_care_metrics_v2 v2 ON v1.prefecture=v2.prefecture AND v1.city_agg=v2.city_agg
  `;
  const d = diff[0];
  console.log(`  publishable:   v1=${d.v1_pub} → v2=${d.v2_pub}`);
  console.log(`  high:          v1=${d.v1_high} → v2=${d.v2_high}`);
  console.log(`  medium:        v1=${d.v1_med} → v2=${d.v2_med}`);

  // sufficiency_rate 上昇幅 上位20
  console.log(`\n${'='.repeat(110)}`);
  console.log('充足率 上昇幅 上位20（v1→v2）');
  console.log('='.repeat(110));
  const sufDiff = await sql`
    SELECT v2.prefecture, v2.city_agg,
           v1.sufficiency_rate AS v1_suf, v2.sufficiency_rate AS v2_suf,
           (v2.sufficiency_rate - v1.sufficiency_rate) AS diff,
           v1.facility_count AS v1_fac, v2.facility_count AS v2_fac,
           v2.confidence_score, v2.metric_confidence
    FROM city_care_metrics_v2 v2
    INNER JOIN city_care_metrics v1 ON v1.prefecture=v2.prefecture AND v1.city_agg=v2.city_agg
    WHERE v1.sufficiency_rate IS NOT NULL AND v2.sufficiency_rate IS NOT NULL
    ORDER BY (v2.sufficiency_rate - v1.sufficiency_rate) DESC
    LIMIT 20
  `;
  console.log('  都道府県 / 市区町村 | v1充足 | v2充足 | diff | v1施設 | v2施設 | score | conf');
  console.log('  ' + '-'.repeat(100));
  for (const r of sufDiff) {
    console.log(`  ${r.prefecture} / ${(r.city_agg as string).padEnd(10)} | ${String(r.v1_suf).padStart(7)}% | ${String(r.v2_suf).padStart(7)}% | +${String(Number(r.diff).toFixed(3)).padStart(7)} | ${String(r.v1_fac).padStart(4)} | ${String(r.v2_fac).padStart(4)} | ${String(r.confidence_score).padStart(3)} | ${r.metric_confidence}`);
  }

  // publishable false→true
  console.log(`\n${'='.repeat(90)}`);
  console.log('publishable false→true になった自治体');
  console.log('='.repeat(90));
  const newPub = await sql`
    SELECT v2.prefecture, v2.city_agg, v2.sufficiency_rate, v2.facility_count,
           v2.capacity_sum, v2.capacity_facility_count, v2.confidence_score
    FROM city_care_metrics_v2 v2
    INNER JOIN city_care_metrics v1 ON v1.prefecture=v2.prefecture AND v1.city_agg=v2.city_agg
    WHERE v1.is_sufficiency_publishable=false AND v2.is_sufficiency_publishable=true
    ORDER BY v2.sufficiency_rate DESC
  `;
  console.log(`  ${newPub.length}件`);
  for (const r of newPub) {
    console.log(`  ${r.prefecture} / ${r.city_agg} suf=${r.sufficiency_rate}% fac=${r.facility_count} cap=${r.capacity_sum} cap_fac=${r.capacity_facility_count} score=${r.confidence_score}`);
  }

  // publishable true→false (v2 で capFac>=3 条件追加のため)
  const lostPub = await sql`
    SELECT v2.prefecture, v2.city_agg, v2.sufficiency_rate, v2.facility_count,
           v2.capacity_facility_count, v1.capacity_facility_count AS v1_capfac
    FROM city_care_metrics_v2 v2
    INNER JOIN city_care_metrics v1 ON v1.prefecture=v2.prefecture AND v1.city_agg=v2.city_agg
    WHERE v1.is_sufficiency_publishable=true AND v2.is_sufficiency_publishable=false
    ORDER BY v2.prefecture
  `;
  console.log(`\npublishable true→false: ${lostPub.length}件`);
  for (const r of lostPub.slice(0, 20)) {
    console.log(`  ${r.prefecture} / ${r.city_agg} suf=${r.sufficiency_rate ?? '-'}% v2_capfac=${r.capacity_facility_count} v1_capfac=${r.v1_capfac}`);
  }
  if (lostPub.length > 20) console.log(`  ... 他 ${lostPub.length - 20}件`);

  // ── 6. 異常値チェック ──

  console.log(`\n${'='.repeat(70)}`);
  console.log('異常値チェック');
  console.log('='.repeat(70));

  // 極端に高い充足率
  const highSuf = await sql`
    SELECT prefecture, city_agg, sufficiency_rate, facility_count, capacity_sum, confidence_score
    FROM city_care_metrics_v2
    WHERE sufficiency_rate > 20
    ORDER BY sufficiency_rate DESC LIMIT 10
  `;
  console.log(`\n充足率 > 20%: ${highSuf.length}件`);
  for (const r of highSuf) {
    console.log(`  ${r.prefecture}/${r.city_agg} suf=${r.sufficiency_rate}% fac=${r.facility_count} cap=${r.capacity_sum} score=${r.confidence_score}`);
  }

  // 施設数少 + publishable
  const smallPub = await sql`
    SELECT prefecture, city_agg, facility_count, capacity_facility_count, sufficiency_rate, confidence_score
    FROM city_care_metrics_v2
    WHERE is_sufficiency_publishable=true AND facility_count < 5
    ORDER BY facility_count, confidence_score LIMIT 10
  `;
  console.log(`\n施設数<5 かつ publishable: ${smallPub.length}件`);
  for (const r of smallPub) {
    console.log(`  ${r.prefecture}/${r.city_agg} fac=${r.facility_count} cap_fac=${r.capacity_facility_count} suf=${r.sufficiency_rate}% score=${r.confidence_score}`);
  }

  // ── 非更新確認 ──
  const v1check = await sql`SELECT COUNT(*) AS cnt FROM city_care_metrics`;
  const mmCheck = await sql`SELECT match_type, COUNT(*) AS cnt FROM municipality_mapping GROUP BY match_type ORDER BY match_type`;
  console.log(`\n${'='.repeat(50)}`);
  console.log('非更新確認');
  console.log('='.repeat(50));
  console.log(`city_care_metrics (v1): ${v1check[0].cnt}行 (変更なし)`);
  console.log(`municipality_mapping: ${mmCheck.map((r: Record<string, unknown>) => r.match_type + '=' + r.cnt).join(', ')} (変更なし)`);
}

main().catch(console.error);
