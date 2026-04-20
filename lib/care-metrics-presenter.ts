import { sql } from './db';

// ========================================
// UI表示用データ整形レイヤー
// ========================================
//
// city_care_metrics_v2 の数値を、ユーザーが理解しやすい形に整形する。
// 数値をそのまま返さず、信頼度に応じた表示制御・説明文・注意文を付与する。
//
// 設計方針:
//   - metric_confidence に応じて表示/非表示/警告付き表示を切り替え
//   - sufficiency_rate を4段階に分類して自然言語の説明を生成
//   - 認定率×カバー率の組み合わせで地域特徴を簡潔に記述
//   - 信頼度が低いデータには必ず注意文を添える

// ── 型定義 ─────────────────────────────────────────────────

export type DisplayFlag = 'show' | 'show_with_warning' | 'hide';
export type SufficiencyLevel = 'very_high' | 'high' | 'medium' | 'low';

export interface CareMetricsPresentation {
  prefecture: string;
  city: string;

  // 生数値
  sufficiency_rate: number | null;
  certification_rate: number | null;

  // 信頼度
  metric_confidence: string;
  confidence_score: number;

  // 表示制御
  display_flag: DisplayFlag;
  display_label: string;
  display_description: string;

  // 解釈
  sufficiency_level: SufficiencyLevel | null;
  area_characteristics: string;

  // 注意
  warning_message: string | null;
}

// ── 表示フラグ ──────────────────────────────────────────────
//
// high / medium → そのまま表示
// low           → 注意付き表示（データが少ない旨を明記）
// reference_only → 非表示（数値が不安定すぎて誤解を招く）

function resolveDisplayFlag(confidence: string): DisplayFlag {
  if (confidence === 'high' || confidence === 'medium') return 'show';
  if (confidence === 'low') return 'show_with_warning';
  return 'hide';
}

// ── 表示ラベル ──────────────────────────────────────────────

function resolveDisplayLabel(flag: DisplayFlag): string {
  if (flag === 'show') return '入所系施設カバー率';
  if (flag === 'show_with_warning') return '入所系施設カバー率（参考値）';
  return '入所系施設カバー率（データ不足）';
}

// ── カバー率レベル ────────────────────────────────────────────
//
// 全国平均は約3.0%。
// 5%以上は供給が手厚い地域、1.5%未満は不足傾向。

function resolveSufficiencyLevel(rate: number | null): SufficiencyLevel | null {
  if (rate == null) return null;
  if (rate >= 5) return 'very_high';
  if (rate >= 3) return 'high';
  if (rate >= 1.5) return 'medium';
  return 'low';
}

// ── 表示説明文 ──────────────────────────────────────────────

function resolveDisplayDescription(level: SufficiencyLevel | null): string {
  switch (level) {
    case 'very_high':
      return 'この地域は入所系介護施設の供給が比較的充実しています。';
    case 'high':
      return '全国平均と同程度の介護施設供給がある地域です。';
    case 'medium':
      return '全国平均と比較して介護施設の供給はやや少ない傾向です。';
    case 'low':
      return '認定者数に対して入所系施設の定員が少なめの地域です。';
    default:
      return 'カバー率のデータが不足しているため、評価できません。';
  }
}

// ── 地域特徴 ────────────────────────────────────────────────
//
// カバー率と認定率の組み合わせで4象限の特徴を記述。
// 認定率の全国平均は約56%を基準にする。

function resolveAreaCharacteristics(
  sufLevel: SufficiencyLevel | null,
  certRate: number | null,
): string {
  if (sufLevel == null || certRate == null) return '';

  const highCert = certRate >= 56;
  const highSuf = sufLevel === 'very_high' || sufLevel === 'high';

  if (highSuf && highCert) return '需要・供給ともに高い地域';
  if (!highSuf && highCert) return '需要に対して供給が不足傾向の地域';
  if (highSuf && !highCert) return '供給が比較的多い地域';
  return '需要・供給ともに全国平均以下の地域';
}

// ── 注意メッセージ ──────────────────────────────────────────

function resolveWarningMessage(
  flag: DisplayFlag,
  facilityCount: number,
  capFacCount: number,
): string | null {
  const messages: string[] = [];

  if (flag === 'show_with_warning') {
    messages.push('定員データの取得件数が少ないため参考値です。');
  }

  if (facilityCount < 5) {
    messages.push('施設数が少ないため数値の変動が大きい可能性があります。');
  }

  if (capFacCount < 5 && capFacCount > 0) {
    messages.push(`定員が確認できた施設は${capFacCount}件のみです。`);
  }

  return messages.length > 0 ? messages.join(' ') : null;
}

// ── メイン関数 ──────────────────────────────────────────────

/**
 * 市区町村の介護指標を UI 表示用に整形して返す。
 *
 * city_care_metrics_v2 から取得し、信頼度・表示制御・説明文を付与する。
 * facilities テーブルの city（区単位）で検索した場合、
 * mapping の city_agg（市単位）で metrics を引く。
 */
export async function getCareMetrics(
  prefecture: string,
  city: string,
): Promise<CareMetricsPresentation | null> {
  // city が区単位の場合、city_agg（市単位）にマッピング
  const mapping = await sql`
    SELECT city_agg FROM municipality_mapping
    WHERE source_table = 'facilities'
      AND prefecture = ${prefecture}
      AND city_raw = ${city}
      AND status = 'confirmed'
    LIMIT 1
  `;
  const cityAgg = (mapping[0]?.city_agg as string) ?? city;

  const rows = await sql`
    SELECT prefecture, city_agg, sufficiency_rate, certification_rate,
           metric_confidence, confidence_score,
           facility_count, capacity_facility_count
    FROM city_care_metrics_v2
    WHERE prefecture = ${prefecture} AND city_agg = ${cityAgg}
    LIMIT 1
  `;

  if (rows.length === 0) return null;

  const r = rows[0];
  const sufRate = r.sufficiency_rate != null ? Number(r.sufficiency_rate) : null;
  const certRate = r.certification_rate != null ? Number(r.certification_rate) : null;
  const confidence = r.metric_confidence as string;
  const facCount = Number(r.facility_count);
  const capFacCount = Number(r.capacity_facility_count);

  const flag = resolveDisplayFlag(confidence);
  const level = resolveSufficiencyLevel(sufRate);

  return {
    prefecture: r.prefecture as string,
    city: cityAgg,
    sufficiency_rate: sufRate,
    certification_rate: certRate,
    metric_confidence: confidence,
    confidence_score: Number(r.confidence_score),
    display_flag: flag,
    display_label: resolveDisplayLabel(flag),
    display_description: resolveDisplayDescription(level),
    sufficiency_level: level,
    area_characteristics: resolveAreaCharacteristics(level, certRate),
    warning_message: resolveWarningMessage(flag, facCount, capFacCount),
  };
}

/**
 * 都道府県内の全市区町村の介護指標を UI 表示用に一括取得する。
 * display_flag = 'hide' のものも含めて返す（UI側でフィルタ可能）。
 */
export async function getCareMetricsByPrefecture(
  prefecture: string,
): Promise<CareMetricsPresentation[]> {
  const rows = await sql`
    SELECT prefecture, city_agg, sufficiency_rate, certification_rate,
           metric_confidence, confidence_score,
           facility_count, capacity_facility_count
    FROM city_care_metrics_v2
    WHERE prefecture = ${prefecture}
    ORDER BY city_agg
  `;

  return rows.map((r) => {
    const sufRate = r.sufficiency_rate != null ? Number(r.sufficiency_rate) : null;
    const certRate = r.certification_rate != null ? Number(r.certification_rate) : null;
    const confidence = r.metric_confidence as string;
    const facCount = Number(r.facility_count);
    const capFacCount = Number(r.capacity_facility_count);

    const flag = resolveDisplayFlag(confidence);
    const level = resolveSufficiencyLevel(sufRate);

    return {
      prefecture: r.prefecture as string,
      city: r.city_agg as string,
      sufficiency_rate: sufRate,
      certification_rate: certRate,
      metric_confidence: confidence,
      confidence_score: Number(r.confidence_score),
      display_flag: flag,
      display_label: resolveDisplayLabel(flag),
      display_description: resolveDisplayDescription(level),
      sufficiency_level: level,
      area_characteristics: resolveAreaCharacteristics(level, certRate),
      warning_message: resolveWarningMessage(flag, facCount, capFacCount),
    };
  });
}
