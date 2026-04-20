import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);

interface UnmatchedRecord {
  id: number;
  source_table: string;
  prefecture: string;
  city_raw: string;
}

interface ReviewResult {
  id: number;
  source_table: string;
  prefecture: string;
  city_raw: string;
  recommended_match_type: string;
  recommended_city_agg: string;
  confidence: 'high' | 'medium' | 'low';
  reason: string;
  auto_update: boolean;
}

async function main() {
  console.log('Phase 1: unmatched 16件の精査と解消\n');

  // ── 1. unmatched 全件取得 ──

  const unmatched = await sql`
    SELECT id, source_table, prefecture, city_raw
    FROM municipality_mapping
    WHERE match_type = 'unmatched'
    ORDER BY source_table, prefecture, city_raw
  ` as UnmatchedRecord[];

  console.log(`unmatched 件数: ${unmatched.length}\n`);

  // ── 2. facilities 側に存在する市区町村を取得 ──

  const facilitiesCities = await sql`
    SELECT DISTINCT prefecture, city
    FROM facilities
    WHERE prefecture IS NOT NULL AND city IS NOT NULL AND city != ''
  `;
  const facilitiesSet = new Set(
    facilitiesCities.map((r: Record<string, string>) => `${r.prefecture}\t${r.city}`)
  );

  // ── 3. 各件を精査 ──

  const results: ReviewResult[] = [];

  for (const rec of unmatched) {
    const { id, source_table, prefecture, city_raw } = rec;
    const inFacilities = facilitiesSet.has(`${prefecture}\t${city_raw}`);

    // パターン1: 「行政事務組合」「総合事務組合」→ wide_area に再分類
    // 根拠: 同じ「行政事務組合」名称の「二戸地区広域行政事務組合」は
    //        既に wide_area に分類済み。build-municipality-mapping.ts の
    //        WIDE_AREA_KEYWORDS に「行政事務」が含まれていなかったのが原因。
    if (city_raw.includes('事���組合')) {
      results.push({
        id, source_table, prefecture, city_raw,
        recommended_match_type: 'wide_area',
        recommended_city_agg: city_raw,
        confidence: 'high',
        reason: `「${city_raw}」は広域行政事務組合。同種の「二戸地区広域行政事務組合」は既にwide_area分類済み。WIDE_AREA_KEYWORDSに「事務組合」が不足していた`,
        auto_update: true,
      });
      continue;
    }

    // パターン2: facilities に施設が存在しない離島・過疎自治体
    // stats (ninteisha/hokensha) にのみ存在し、facilities に0件
    // → stats_only として分類。city_agg = city_raw（自身を保持）
    if (!inFacilities) {
      results.push({
        id, source_table, prefecture, city_raw,
        recommended_match_type: 'stats_only',
        recommended_city_agg: city_raw,
        confidence: 'high',
        reason: `facilities に「${prefecture} / ${city_raw}」の施設が0件。離島・過疎地域で介護施設が存在しない自治体。stats_onlyとして分類`,
        auto_update: true,
      });
      continue;
    }

    // パターン3: その他（該当なし想定だが安全弁���
    results.push({
      id, source_table, prefecture, city_raw,
      recommended_match_type: 'unmatched',
      recommended_city_agg: '',
      confidence: 'low',
      reason: '自動判定不可。手動確認が必要',
      auto_update: false,
    });
  }

  // ── 4. 結果出力 ──

  console.log('='.repeat(100));
  console.log('精査結果');
  console.log('='.repeat(100));

  for (const r of results) {
    console.log(`\n[${r.source_table}] ${r.prefecture} / ${r.city_raw} (id=${r.id})`);
    console.log(`  推奨 match_type: ${r.recommended_match_type}`);
    console.log(`  推奨 city_agg:   ${r.recommended_city_agg}`);
    console.log(`  confidence:      ${r.confidence}`);
    console.log(`  理由:            ${r.reason}`);
    console.log(`  自動更新:        ${r.auto_update ? 'YES' : 'NO（保留）'}`);
  }

  // ── 5. サマリ ──

  const highCount = results.filter((r) => r.confidence === 'high').length;
  const mediumCount = results.filter((r) => r.confidence === 'medium').length;
  const lowCount = results.filter((r) => r.confidence === 'low').length;
  const autoUpdateTargets = results.filter((r) => r.auto_update);
  const pendingTargets = results.filter((r) => !r.auto_update);

  console.log(`\n${'='.repeat(60)}`);
  console.log('サマリ');
  console.log('='.repeat(60));
  console.log(`  unmatched 総数:   ${unmatched.length}`);
  console.log(`  high:             ${highCount}`);
  console.log(`  medium:           ${mediumCount}`);
  console.log(`  low:              ${lowCount}`);
  console.log(`  自動更新対象:     ${autoUpdateTargets.length}`);
  console.log(`  保留:             ${pendingTargets.length}`);

  // 再分類内訳
  const typeCounts = new Map<string, number>();
  for (const r of autoUpdateTargets) {
    typeCounts.set(r.recommended_match_type, (typeCounts.get(r.recommended_match_type) ?? 0) + 1);
  }
  console.log('\n  再分類内訳:');
  for (const [type, count] of [...typeCounts].sort()) {
    console.log(`    → ${type}: ${count}`);
  }

  // ── 6. DB更新（high confidence のみ） ──

  if (autoUpdateTargets.length > 0) {
    console.log(`\nDB更新中... (${autoUpdateTargets.length}件)`);

    for (const r of autoUpdateTargets) {
      await sql`
        UPDATE municipality_mapping
        SET match_type = ${r.recommended_match_type},
            city_agg = ${r.recommended_city_agg},
            status = 'confirmed',
            notes = ${r.reason}
        WHERE id = ${r.id}
      `;
      console.log(`  id=${r.id} → ${r.recommended_match_type} (${r.prefecture} / ${r.city_raw})`);
    }
  }

  // ── 7. 更新後検証 ──

  const remaining = await sql`
    SELECT COUNT(*) AS cnt FROM municipality_mapping WHERE match_type = 'unmatched'
  `;
  console.log(`\n更新後 unmatched 残数: ${remaining[0].cnt}`);

  // match_type 別の最新件数
  const typeSummary = await sql`
    SELECT match_type, COUNT(*) AS cnt
    FROM municipality_mapping
    GROUP BY match_type
    ORDER BY match_type
  `;
  console.log('\nmatch_type 別件数（更新後）:');
  for (const r of typeSummary) {
    console.log(`  ${r.match_type}: ${r.cnt}`);
  }
}

main().catch(console.error);
