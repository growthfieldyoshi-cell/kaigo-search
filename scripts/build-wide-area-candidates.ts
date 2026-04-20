import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);

// ── 型定義 ─────────────────────────────────────────────────

interface WideAreaTarget {
  prefecture: string;
  city_raw: string;
  source_table: string;
}

interface UnionName {
  prefecture: string;
  union_name: string;
}

interface Candidate {
  prefecture: string;
  city_raw: string;
  source_table: string;
  wide_area_name: string;
  candidate_rank: number;
  candidate_reason: string;
  same_prefecture_flag: boolean;
  name_overlap_score: number;
  confidence: 'high' | 'medium' | 'low';
  status: 'suggested';
  notes: string;
}

// ── 名前重なりスコア ────────────────────────────────────────
//
// city_raw と union_name の間で共有される文字の割合を計算。
// 「鈴鹿市」と「鈴鹿亀山地区広域連合」→ 「鈴鹿」が共通 → 2/3 = 0.67
//
// 手順:
//   1. union_name から汎用ワード（広域連合、地区、組合、等）を除去
//   2. city_raw から行政単位（市、町、村、区、郡）を除去
//   3. 除去後の city_raw の各文字が union_core に含まれるか
//   4. 一致文字数 / city_core の文字数

const UNION_NOISE = /広域連合|広域市町村圏組合|広域行政組合|広域行政事務組合|広域組合|介護保険組合|介護保険|ケーブルテレビ|事業組合|総合事務組合|地区|地域|地方|連合|組合|県|北部|南部|中部|東部|西部/g;
const CITY_SUFFIX = /市$|町$|村$|区$|郡$/;

function calcNameOverlap(cityRaw: string, unionName: string): number {
  const cityCore = cityRaw.replace(CITY_SUFFIX, '');
  const unionCore = unionName.replace(UNION_NOISE, '');

  if (cityCore.length === 0) return 0;
  if (unionCore.length === 0) return 0;

  let matchCount = 0;
  for (const ch of cityCore) {
    if (unionCore.includes(ch)) matchCount++;
  }

  return Math.round((matchCount / cityCore.length) * 100) / 100;
}

// ── 候補理由の判定 ──────────────────────────────────────────

function determineReason(
  overlap: number,
  samePref: boolean,
): string {
  if (!samePref) return 'cross_prefecture_weak_signal';
  if (overlap >= 0.5) return 'same_prefecture_name_partially_related';
  if (overlap > 0) return 'same_prefecture_weak_name_signal';
  return 'same_prefecture_wide_area_name_exists';
}

function determineConfidence(
  overlap: number,
  samePref: boolean,
): 'high' | 'medium' | 'low' {
  if (!samePref) return 'low';
  // high: 同一県 + 名前が半分以上一致
  if (overlap >= 0.5) return 'high';
  // medium: 同一県 + 少しでも名前重なりあり
  if (overlap > 0) return 'medium';
  // low: 同一県だが名前の手がかりなし
  return 'low';
}

// ── メイン ──────────────────────────────────────────────────

async function main() {
  console.log('Phase 2: wide_area 候補マッピング台帳作成\n');

  // ── 1. テーブル作成 ──

  console.log('Creating table...');
  await sql`
    CREATE TABLE IF NOT EXISTS wide_area_mapping_candidates (
      id SERIAL PRIMARY KEY,
      prefecture VARCHAR(20) NOT NULL,
      city_raw VARCHAR(100) NOT NULL,
      source_table VARCHAR(30) NOT NULL,
      wide_area_name VARCHAR(200) NOT NULL,
      candidate_rank INTEGER NOT NULL,
      candidate_reason VARCHAR(100) NOT NULL,
      same_prefecture_flag BOOLEAN NOT NULL DEFAULT true,
      name_overlap_score NUMERIC(4,2) NOT NULL DEFAULT 0,
      confidence VARCHAR(10) NOT NULL DEFAULT 'low',
      status VARCHAR(20) NOT NULL DEFAULT 'suggested',
      notes TEXT DEFAULT '',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_wac_pref_city ON wide_area_mapping_candidates(prefecture, city_raw)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_wac_confidence ON wide_area_mapping_candidates(confidence)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_wac_status ON wide_area_mapping_candidates(status)`;

  // ── 2. 対象データ取得 ──

  // facilities 側の wide_area 自治体
  const facTargets = await sql`
    SELECT DISTINCT prefecture, city_raw, source_table
    FROM municipality_mapping
    WHERE match_type = 'wide_area' AND source_table = 'facilities'
    ORDER BY prefecture, city_raw
  ` as WideAreaTarget[];

  // stats 側の広域連合名（ユニーク）
  const statsUnions = await sql`
    SELECT DISTINCT prefecture, city_raw AS union_name
    FROM municipality_mapping
    WHERE match_type = 'wide_area'
      AND source_table IN ('kaigo_ninteisha', 'kaigo_hokensha')
    ORDER BY prefecture, city_raw
  ` as UnionName[];

  console.log(`facilities側 wide_area 自治体: ${facTargets.length}`);
  console.log(`stats側 広域連合/組合名 (unique): ${statsUnions.length}`);

  // 都道府県別の広域連合名マップ
  const unionsByPref = new Map<string, UnionName[]>();
  for (const u of statsUnions) {
    const list = unionsByPref.get(u.prefecture) ?? [];
    list.push(u);
    unionsByPref.set(u.prefecture, list);
  }

  // ── 3. 候補生成 ──

  console.log('Building candidates...');
  const allCandidates: Candidate[] = [];
  let noCandidateCount = 0;

  for (const target of facTargets) {
    const prefUnions = unionsByPref.get(target.prefecture) ?? [];
    if (prefUnions.length === 0) {
      noCandidateCount++;
      continue;
    }

    // 各広域連合名とのスコアを計算してランク付け
    const scored = prefUnions.map((u) => {
      const overlap = calcNameOverlap(target.city_raw, u.union_name);
      return { ...u, overlap };
    });

    // スコア降順ソート、上位3件
    scored.sort((a, b) => b.overlap - a.overlap);
    const top = scored.slice(0, 3);

    for (let i = 0; i < top.length; i++) {
      const u = top[i];
      const samePref = u.prefecture === target.prefecture;
      const reason = determineReason(u.overlap, samePref);
      const confidence = determineConfidence(u.overlap, samePref);

      allCandidates.push({
        prefecture: target.prefecture,
        city_raw: target.city_raw,
        source_table: target.source_table,
        wide_area_name: u.union_name,
        candidate_rank: i + 1,
        candidate_reason: reason,
        same_prefecture_flag: samePref,
        name_overlap_score: u.overlap,
        confidence,
        status: 'suggested',
        notes: `overlap(${target.city_raw.replace(CITY_SUFFIX, '')} ∩ ${u.union_name.replace(UNION_NOISE, '')}) = ${u.overlap}`,
      });
    }
  }

  console.log(`候補生成: ${allCandidates.length}件`);
  console.log(`候補なし: ${noCandidateCount}件\n`);

  // ── 4. DB保存 ──

  console.log('Saving to DB...');
  await sql`DELETE FROM wide_area_mapping_candidates`;

  const BATCH = 200;
  let inserted = 0;

  for (let i = 0; i < allCandidates.length; i += BATCH) {
    const batch = allCandidates.slice(i, i + BATCH);
    const values: string[] = [];
    const params: (string | number | boolean)[] = [];
    let idx = 1;

    for (const c of batch) {
      const ph: string[] = [];
      for (const val of [
        c.prefecture, c.city_raw, c.source_table, c.wide_area_name,
        c.candidate_rank, c.candidate_reason, c.same_prefecture_flag,
        c.name_overlap_score, c.confidence, c.status, c.notes,
      ]) {
        ph.push(`$${idx++}`);
        params.push(val as string | number | boolean);
      }
      values.push(`(${ph.join(',')})`);
    }

    await sql.query(
      `INSERT INTO wide_area_mapping_candidates
        (prefecture, city_raw, source_table, wide_area_name,
         candidate_rank, candidate_reason, same_prefecture_flag,
         name_overlap_score, confidence, status, notes)
       VALUES ${values.join(',')}`,
      params,
    );
    inserted += batch.length;
  }
  console.log(`  ${inserted} rows saved`);

  // ── 5. サマリ出力 ──

  console.log(`\n${'='.repeat(80)}`);
  console.log('サマリ');
  console.log('='.repeat(80));

  const total = await sql`SELECT COUNT(*) AS cnt FROM wide_area_mapping_candidates`;
  console.log(`候補総数: ${total[0].cnt}`);

  // confidence 別
  const confCounts = await sql`
    SELECT confidence, COUNT(*) AS cnt
    FROM wide_area_mapping_candidates
    GROUP BY confidence ORDER BY confidence
  `;
  console.log('\nconfidence 別:');
  for (const r of confCounts) console.log(`  ${r.confidence}: ${r.cnt}`);

  // candidate_rank 別
  const rankCounts = await sql`
    SELECT candidate_rank, COUNT(*) AS cnt
    FROM wide_area_mapping_candidates
    GROUP BY candidate_rank ORDER BY candidate_rank
  `;
  console.log('\ncandidate_rank 別:');
  for (const r of rankCounts) console.log(`  rank ${r.candidate_rank}: ${r.cnt}`);

  // 都道府県別
  const prefCounts = await sql`
    SELECT prefecture, COUNT(*) AS cnt
    FROM wide_area_mapping_candidates
    WHERE candidate_rank = 1
    GROUP BY prefecture ORDER BY prefecture
  `;
  console.log('\n都道府県別（rank=1のみ）:');
  for (const r of prefCounts) console.log(`  ${r.prefecture}: ${r.cnt}`);

  // ── high confidence の候補一覧 ──

  console.log(`\n${'='.repeat(100)}`);
  console.log('high confidence 候補（rank=1, 先頭50件）');
  console.log('='.repeat(100));
  const highSamples = await sql`
    SELECT prefecture, city_raw, wide_area_name, name_overlap_score, candidate_reason, notes
    FROM wide_area_mapping_candidates
    WHERE confidence = 'high' AND candidate_rank = 1
    ORDER BY prefecture, city_raw
    LIMIT 50
  `;
  for (const r of highSamples) {
    console.log(`  ${r.prefecture} / ${r.city_raw} → ${r.wide_area_name} (score=${r.name_overlap_score}) [${r.candidate_reason}]`);
  }

  // ── medium confidence の候補一覧 ──

  console.log(`\n${'='.repeat(100)}`);
  console.log('medium confidence 候補（rank=1, 先頭30件）');
  console.log('='.repeat(100));
  const medSamples = await sql`
    SELECT prefecture, city_raw, wide_area_name, name_overlap_score, candidate_reason, notes
    FROM wide_area_mapping_candidates
    WHERE confidence = 'medium' AND candidate_rank = 1
    ORDER BY name_overlap_score DESC, prefecture, city_raw
    LIMIT 30
  `;
  for (const r of medSamples) {
    console.log(`  ${r.prefecture} / ${r.city_raw} → ${r.wide_area_name} (score=${r.name_overlap_score}) [${r.candidate_reason}]`);
  }

  // ── low confidence のサンプル ──

  console.log(`\n${'='.repeat(100)}`);
  console.log('low confidence 候補（rank=1, 先頭20件）');
  console.log('='.repeat(100));
  const lowSamples = await sql`
    SELECT prefecture, city_raw, wide_area_name, name_overlap_score, candidate_reason, notes
    FROM wide_area_mapping_candidates
    WHERE confidence = 'low' AND candidate_rank = 1
    ORDER BY prefecture, city_raw
    LIMIT 20
  `;
  for (const r of lowSamples) {
    console.log(`  ${r.prefecture} / ${r.city_raw} → ${r.wide_area_name} (score=${r.name_overlap_score}) [${r.candidate_reason}]`);
  }

  // ── municipality_mapping 非更新の確認 ──

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
