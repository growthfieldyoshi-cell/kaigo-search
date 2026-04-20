import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);

// ── 分類ロジック ────────────────────────────────────────────
//
// review_group の判定順:
//
// 1. prefecture_level_union
//    広域連合名に都道府県名がそのまま含まれている場合。
//    「○○県介護保険広域連合」のように県全体を束ねる組織で、
//    名前だけでは個別市町村に割り当てられない。
//
// 2. name_linked_union
//    name_overlap_score >= 0.5 の場合。
//    自治体名の主要部分が広域連合名に含まれており、
//    人間が見れば「関係がありそう」とすぐ判断できる。
//
// 3. generic_union_name
//    name_overlap_score > 0 かつ < 0.5、
//    または overlap=0 でも広域連合名が地域名を含む一般的パターン。
//    外部資料で構成市町村を確認する必要がある。
//
// 4. manual_hard_case
//    上記いずれにも当てはまらない。
//    名称に手がかりがなく、レビュー難度が高い。

function isPrefectureLevelUnion(prefecture: string, unionName: string): boolean {
  // 「福岡県介護保険広域連合」「沖縄県介護保険広域連合」等
  // 都道府県名がそのまま広域連合名の冒頭に含まれる
  const prefCore = prefecture.replace(/[都道府県]$/, '');
  return unionName.startsWith(prefCore) || unionName.startsWith(prefecture);
}

interface CandidateRow {
  id: number;
  prefecture: string;
  city_raw: string;
  wide_area_name: string;
  candidate_rank: number;
  name_overlap_score: number;
  confidence: string;
}

interface Classification {
  review_group: string;
  review_priority: number;
  review_reason: string;
  needs_external_source: boolean;
  likely_prefecture_level_union: boolean;
}

function classify(row: CandidateRow): Classification {
  const score = Number(row.name_overlap_score);
  const isPrefLevel = isPrefectureLevelUnion(row.prefecture, row.wide_area_name);

  // 1. prefecture_level_union
  if (isPrefLevel) {
    return {
      review_group: 'prefecture_level_union',
      review_priority: 3,
      review_reason: 'prefecture_name_included_in_union_name',
      needs_external_source: true,
      likely_prefecture_level_union: true,
    };
  }

  // 2. name_linked_union
  if (score >= 0.5) {
    return {
      review_group: 'name_linked_union',
      review_priority: 1,
      review_reason: 'municipality_name_included_in_union_name',
      needs_external_source: false,
      likely_prefecture_level_union: false,
    };
  }

  // 3. generic_union_name
  //    overlap > 0 だが弱い、または overlap=0 でも地域名入りの広域連合
  if (score > 0) {
    return {
      review_group: 'generic_union_name',
      review_priority: 2,
      review_reason: 'weak_name_signal',
      needs_external_source: true,
      likely_prefecture_level_union: false,
    };
  }

  // overlap=0: 広域連合名と自治体名に文字的手がかりなし
  //   ただし rank=1 で同県内唯一の候補なら generic_union_name として扱う
  //   （そもそも同県にある広域連合なので関係はあり得る）
  if (row.candidate_rank === 1) {
    return {
      review_group: 'generic_union_name',
      review_priority: 2,
      review_reason: 'union_name_too_generic',
      needs_external_source: true,
      likely_prefecture_level_union: false,
    };
  }

  // 4. manual_hard_case（rank 2,3 で overlap=0）
  return {
    review_group: 'manual_hard_case',
    review_priority: 4,
    review_reason: 'manual_review_required',
    needs_external_source: true,
    likely_prefecture_level_union: false,
  };
}

// ── メイン ──────────────────────────────────────────────────

async function main() {
  console.log('Phase 2.5: wide_area 候補のレビューグループ分類\n');

  // ── 1. カラム追加 ──

  console.log('Adding columns...');
  for (const col of [
    ['review_group', 'VARCHAR(40)'],
    ['review_priority', 'INTEGER'],
    ['review_reason', 'VARCHAR(100)'],
    ['needs_external_source', 'BOOLEAN DEFAULT false'],
    ['likely_prefecture_level_union', 'BOOLEAN DEFAULT false'],
  ]) {
    await sql.query(
      `ALTER TABLE wide_area_mapping_candidates ADD COLUMN IF NOT EXISTS ${col[0]} ${col[1]}`,
      [],
    );
  }

  // ── 2. 全レコード取得 ──

  const rows = await sql`
    SELECT id, prefecture, city_raw, wide_area_name,
           candidate_rank, name_overlap_score, confidence
    FROM wide_area_mapping_candidates
    ORDER BY id
  ` as CandidateRow[];

  console.log(`対象レコード: ${rows.length}\n`);

  // ── 3. 分類してバッチ更新 ──

  console.log('Classifying...');
  let updated = 0;

  for (const row of rows) {
    const c = classify(row);
    await sql`
      UPDATE wide_area_mapping_candidates
      SET review_group = ${c.review_group},
          review_priority = ${c.review_priority},
          review_reason = ${c.review_reason},
          needs_external_source = ${c.needs_external_source},
          likely_prefecture_level_union = ${c.likely_prefecture_level_union},
          updated_at = NOW()
      WHERE id = ${row.id}
    `;
    updated++;
  }
  console.log(`  ${updated} rows updated`);

  // ── 4. サマリ出力 ──

  console.log(`\n${'='.repeat(70)}`);
  console.log('review_group 別件数');
  console.log('='.repeat(70));

  const groupCounts = await sql`
    SELECT review_group, review_priority, COUNT(*) AS cnt
    FROM wide_area_mapping_candidates
    GROUP BY review_group, review_priority
    ORDER BY review_priority
  `;
  for (const r of groupCounts) {
    console.log(`  [priority=${r.review_priority}] ${r.review_group}: ${r.cnt}`);
  }

  // rank=1 だけの分布
  console.log('\n  (rank=1 のみ):');
  const groupCountsR1 = await sql`
    SELECT review_group, COUNT(*) AS cnt
    FROM wide_area_mapping_candidates
    WHERE candidate_rank = 1
    GROUP BY review_group
    ORDER BY review_group
  `;
  for (const r of groupCountsR1) console.log(`    ${r.review_group}: ${r.cnt}`);

  // needs_external_source
  const extCounts = await sql`
    SELECT needs_external_source, COUNT(*) AS cnt
    FROM wide_area_mapping_candidates
    GROUP BY needs_external_source
    ORDER BY needs_external_source
  `;
  console.log('\nneeds_external_source:');
  for (const r of extCounts) console.log(`  ${r.needs_external_source}: ${r.cnt}`);

  // ── 5. 各グループの代表例 ──

  // name_linked_union
  console.log(`\n${'='.repeat(90)}`);
  console.log('name_linked_union（priority=1, rank=1, 先頭20件）');
  console.log('='.repeat(90));
  const g1 = await sql`
    SELECT prefecture, city_raw, wide_area_name, name_overlap_score, review_reason
    FROM wide_area_mapping_candidates
    WHERE review_group = 'name_linked_union' AND candidate_rank = 1
    ORDER BY name_overlap_score DESC, prefecture, city_raw
    LIMIT 20
  `;
  for (const r of g1) {
    console.log(`  ${r.prefecture} / ${r.city_raw} → ${r.wide_area_name} (score=${r.name_overlap_score})`);
  }

  // generic_union_name
  console.log(`\n${'='.repeat(90)}`);
  console.log('generic_union_name（priority=2, rank=1, 先頭20件）');
  console.log('='.repeat(90));
  const g2 = await sql`
    SELECT prefecture, city_raw, wide_area_name, name_overlap_score, review_reason
    FROM wide_area_mapping_candidates
    WHERE review_group = 'generic_union_name' AND candidate_rank = 1
    ORDER BY name_overlap_score DESC, prefecture, city_raw
    LIMIT 20
  `;
  for (const r of g2) {
    console.log(`  ${r.prefecture} / ${r.city_raw} → ${r.wide_area_name} (score=${r.name_overlap_score}) [${r.review_reason}]`);
  }

  // prefecture_level_union
  console.log(`\n${'='.repeat(90)}`);
  console.log('prefecture_level_union（priority=3, rank=1, 先頭20件）');
  console.log('='.repeat(90));
  const g3 = await sql`
    SELECT prefecture, city_raw, wide_area_name, name_overlap_score, review_reason
    FROM wide_area_mapping_candidates
    WHERE review_group = 'prefecture_level_union' AND candidate_rank = 1
    ORDER BY prefecture, city_raw
    LIMIT 20
  `;
  for (const r of g3) {
    console.log(`  ${r.prefecture} / ${r.city_raw} → ${r.wide_area_name}`);
  }

  // manual_hard_case
  console.log(`\n${'='.repeat(90)}`);
  console.log('manual_hard_case（priority=4, 先頭20件）');
  console.log('='.repeat(90));
  const g4 = await sql`
    SELECT prefecture, city_raw, wide_area_name, candidate_rank, name_overlap_score
    FROM wide_area_mapping_candidates
    WHERE review_group = 'manual_hard_case'
    ORDER BY prefecture, city_raw, candidate_rank
    LIMIT 20
  `;
  for (const r of g4) {
    console.log(`  ${r.prefecture} / ${r.city_raw} → ${r.wide_area_name} (rank=${r.candidate_rank}, score=${r.name_overlap_score})`);
  }

  // ── 6. municipality_mapping 非更新の確認 ──

  const mmCheck = await sql`
    SELECT match_type, COUNT(*) AS cnt
    FROM municipality_mapping
    GROUP BY match_type ORDER BY match_type
  `;
  console.log(`\n${'='.repeat(60)}`);
  console.log('municipality_mapping（確認用・更新なし）');
  console.log('='.repeat(60));
  for (const r of mmCheck) console.log(`  ${r.match_type}: ${r.cnt}`);

  // ── 7. レビュー順序の提案 ──

  console.log(`\n${'='.repeat(60)}`);
  console.log('推奨レビュー順序');
  console.log('='.repeat(60));
  console.log('  Step 1: name_linked_union（priority=1）');
  console.log('          名前対応が明確。人間が短時間で confirmed/rejected を判定可能');
  console.log('  Step 2: generic_union_name（priority=2）');
  console.log('          外部資料（広域連合の公式構成市町村リスト）を参照して判定');
  console.log('  Step 3: prefecture_level_union（priority=3）');
  console.log('          県全体型の広域連合。公式サイトで構成自治体を確認');
  console.log('  Step 4: manual_hard_case（priority=4）');
  console.log('          保留を許容。無理に解かない');
}

main().catch(console.error);
