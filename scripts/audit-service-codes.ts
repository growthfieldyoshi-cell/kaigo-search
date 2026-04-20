import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);

// ========================================
// 想定されるサービスコード定義（参考）
// ========================================
// 厚労省「介護サービス情報公表システム」の分類に基づく想定。
// 確定ではなく、実データとの照合用。
//
// ★ = 入所系（Phase 4 で residential_total に含まれているべきか要検討）

const EXPECTED_DEFINITIONS: Record<string, {
  expected_type: string;
  expected_group: string;
  is_residential: boolean;
  notes: string;
}> = {
  '110': { expected_type: '訪問介護', expected_group: 'home_visit', is_residential: false, notes: '' },
  '120': { expected_type: '訪問入浴介護', expected_group: 'home_visit', is_residential: false, notes: '' },
  '130': { expected_type: '訪問看護', expected_group: 'home_visit', is_residential: false, notes: '' },
  '140': { expected_type: '訪問リハビリテーション', expected_group: 'home_visit', is_residential: false, notes: '' },
  '150': { expected_type: '通所介護（デイサービス）', expected_group: 'day_service', is_residential: false, notes: '' },
  '155': { expected_type: '療養通所介護', expected_group: 'day_service', is_residential: false, notes: '' },
  '160': { expected_type: '通所リハビリテーション', expected_group: 'day_service', is_residential: false, notes: '' },
  '170': { expected_type: '福祉用具貸与', expected_group: 'equipment', is_residential: false, notes: 'capacity=全NULL（適切）' },
  '210': { expected_type: '短期入所生活介護（ショートステイ）', expected_group: 'short_stay', is_residential: true, notes: '★ 入所系。既存定義通り' },
  '220': { expected_type: '短期入所療養介護（老健でのショート）', expected_group: 'short_stay', is_residential: true, notes: '★ 入所系。既存定義通り' },
  '230': { expected_type: '短期入所療養介護（療養病床でのショート）', expected_group: 'short_stay', is_residential: true, notes: '★ 入所系。実��ータ=短期入所。既存定義通り' },
  '320': { expected_type: '認知症対応型共同生活介護（グループホーム）', expected_group: 'group_home', is_residential: true, notes: '★ 入所系。既存定義通り' },
  '331': { expected_type: '特定施設入居者生活介護（有料老人ホーム）', expected_group: 'tokutei_shisetsu', is_residential: true, notes: '★ 入所系。既存定義通り' },
  '332': { expected_type: '特定施設入居者生活介護（軽費老人ホーム）', expected_group: 'tokutei_shisetsu', is_residential: true, notes: '★ 入所系。実データ=軽費老人ホーム。特養ではない' },
  '334': { expected_type: '特定施設入居者生活介護（サービス付き高齢者向け住宅）', expected_group: 'tokutei_shisetsu', is_residential: true, notes: '★ 入所系。実データ=サ高住。老健ではない' },
  '335': { expected_type: '特定施設入居者生活介護（有料・外部サービス利用型）', expected_group: 'tokutei_shisetsu', is_residential: true, notes: '★ 入所系。現在 residential_total に含まれていない。件数極少(8件)' },
  '336': { expected_type: '特定施設入居者生活介護（軽費・外部サービス利用型）', expected_group: 'tokutei_shisetsu', is_residential: true, notes: '★ 入所系。現在含まれていない。件数極少(5件)' },
  '337': { expected_type: '特定施設入居者生活介護（サ高住���外部サービス利用型）', expected_group: 'tokutei_shisetsu', is_residential: true, notes: '★ 入所系。現在含まれていない。件数���少(9件)' },
  '361': { expected_type: '地域密着型特定施設入居者生活介護（有料老人ホーム）', expected_group: 'tokutei_chiiki', is_residential: true, notes: '★ 入所系。現在含まれていない。256件' },
  '362': { expected_type: '地域密着型特定施設入居者生活介護（軽費老人ホーム）', expected_group: 'tokutei_chiiki', is_residential: true, notes: '★ 入所系。現在含まれていない。64件' },
  '364': { expected_type: '地域密着型特定施設入居者生活介護（サ高住）', expected_group: 'tokutei_chiiki', is_residential: true, notes: '★ 入所系。現在含まれていない。52件' },
  '410': { expected_type: '特定福祉用具販売', expected_group: 'equipment', is_residential: false, notes: 'capacity=全NULL（適切）' },
  '430': { expected_type: '居宅介護支援', expected_group: 'care_management', is_residential: false, notes: '' },
  '520': { expected_type: '介護老人保健施設（老健）', expected_group: 'institutional_core', is_residential: true, notes: '★★ 重大: 入所系の主要施設。現在 residential_total に含まれていない。4,121件' },
  '530': { expected_type: '介護療養型医療施設', expected_group: 'institutional_core', is_residential: true, notes: '★ 入所系。現在含まれていない。75件。廃止移行中' },
  '540': { expected_type: '地域密着型介護老人福祉施設入所者生活介護（小規模特養）', expected_group: 'institutional_core', is_residential: true, notes: '★★ 重大: 入所系の主要施設（小規模特養）。現在含まれていない。2,553件' },
  '550': { expected_type: '介護医療院', expected_group: 'institutional_core', is_residential: true, notes: '★ 入所系。現在含まれていない。923件' },
  '551': { expected_type: '短期入所療養介護（介護医療院）', expected_group: 'short_stay', is_residential: true, notes: '★ 入所系（ショート）。現在含まれていない。181件' },
  '710': { expected_type: '夜間対応型訪問介護', expected_group: 'home_visit', is_residential: false, notes: '' },
  '720': { expected_type: '認知症対応型通所介護', expected_group: 'day_service', is_residential: false, notes: '' },
  '730': { expected_type: '小規模多機能型居宅介護', expected_group: 'multi_function', is_residential: false, notes: '通い+泊まり+訪問の複合型。入所系に含めるか要検討' },
  '760': { expected_type: '定期巡回・随時対応型訪問介護看護', expected_group: 'home_visit', is_residential: false, notes: '' },
  '770': { expected_type: '看護小規模多機能型居宅介護', expected_group: 'multi_function', is_residential: false, notes: '' },
  '780': { expected_type: '地域密着型通所介護', expected_group: 'day_service', is_residential: false, notes: '' },
};

// Phase 4 で割り当てた service_group
const PHASE4_GROUP_MAP: Record<string, string> = {
  '210': 'short_stay',
  '220': 'short_stay',
  '230': 'short_stay',
  '320': 'group_home',
  '331': 'tokutei_shisetsu',
  '332': 'tokutei_shisetsu',
  '334': 'tokutei_shisetsu',
};

// ── 監査ロジック ────────────────────────────────────────────

interface AuditRow {
  service_code: string;
  service_name_sample: string;
  facility_count: number;
  capacity_null_rate: number;
  capacity_zero_rate: number;
  capacity_valid_count: number;
  avg_capacity_valid: number | null;
  median_capacity_valid: number | null;
  assigned_service_group: string;
  expected_service_type: string;
  mismatch_flag: boolean;
  review_required: boolean;
  review_reasons: string[];
  confidence: 'high' | 'medium' | 'low';
  notes: string;
}

function audit(
  code: string,
  name: string,
  count: number,
  nullRate: number,
  zeroRate: number,
  validCount: number,
  avgCap: number | null,
  medianCap: number | null,
): AuditRow {
  const expected = EXPECTED_DEFINITIONS[code];
  const assignedGroup = PHASE4_GROUP_MAP[code] ?? 'not_assigned';
  const reasons: string[] = [];
  let mismatch = false;

  if (!expected) {
    return {
      service_code: code,
      service_name_sample: name,
      facility_count: count,
      capacity_null_rate: nullRate,
      capacity_zero_rate: zeroRate,
      capacity_valid_count: validCount,
      avg_capacity_valid: avgCap,
      median_capacity_valid: medianCap,
      assigned_service_group: assignedGroup,
      expected_service_type: 'unknown',
      mismatch_flag: true,
      review_required: true,
      review_reasons: ['unknown_service_code'],
      confidence: 'low',
      notes: 'コード定義が不明',
    };
  }

  // A. 入所系なのに residential_total に含まれていない
  if (expected.is_residential && !PHASE4_GROUP_MAP[code]) {
    reasons.push('residential_but_not_in_total');
    mismatch = true;
  }

  // B. capacity=0率が異常に高い（>50%）
  if (zeroRate > 0.5 && expected.is_residential) {
    reasons.push('high_zero_rate_data_issue');
  }

  // C. capacity NULL率が異常に高い（>30%）
  if (nullRate > 0.3 && expected.is_residential) {
    reasons.push('high_null_rate_data_issue');
  }

  // D. 実データ名と想定定義のズ��検出
  //    想定の主要キーワードが実データ名に含まれていない場合
  const expectedKeywords = expected.expected_type.split(/[（）・]/);
  const nameContainsExpected = expectedKeywords.some((kw) => kw.length >= 2 && name.includes(kw));
  if (!nameContainsExpected && expectedKeywords[0].length >= 2) {
    reasons.push('service_name_mismatch');
    mismatch = true;
  }

  // confidence 判定
  let confidence: 'high' | 'medium' | 'low' = 'high';
  if (mismatch || reasons.length >= 2) confidence = 'low';
  else if (reasons.length >= 1) confidence = 'medium';

  const review = mismatch || reasons.length > 0;

  return {
    service_code: code,
    service_name_sample: name,
    facility_count: count,
    capacity_null_rate: nullRate,
    capacity_zero_rate: zeroRate,
    capacity_valid_count: validCount,
    avg_capacity_valid: avgCap,
    median_capacity_valid: medianCap,
    assigned_service_group: assignedGroup,
    expected_service_type: expected.expected_type,
    mismatch_flag: mismatch,
    review_required: review,
    review_reasons: reasons,
    confidence,
    notes: expected.notes,
  };
}

// ── メイン ──────────────────────────────────────────────────

async function main() {
  console.log('Phase 4.5: service_code 定義監査\n');

  // ── 1. テーブル作成 ──

  console.log('Creating audit table...');
  await sql`
    CREATE TABLE IF NOT EXISTS service_code_audit (
      id SERIAL PRIMARY KEY,
      service_code VARCHAR(10) NOT NULL,
      service_name_sample VARCHAR(200),
      facility_count INTEGER,
      capacity_null_rate NUMERIC(5,4),
      capacity_zero_rate NUMERIC(5,4),
      capacity_valid_count INTEGER,
      avg_capacity_valid NUMERIC(8,1),
      median_capacity_valid NUMERIC(8,1),
      assigned_service_group VARCHAR(30),
      expected_service_type VARCHAR(200),
      mismatch_flag BOOLEAN DEFAULT false,
      review_required BOOLEAN DEFAULT false,
      review_reason TEXT,
      confidence VARCHAR(10),
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(service_code)
    )
  `;

  // ── 2. 実データ取得 ──

  console.log('Fetching facility data...');
  const rows = await sql`
    SELECT
      service_code,
      service_name,
      COUNT(*) AS cnt,
      ROUND(COUNT(*) FILTER (WHERE capacity IS NULL)::numeric / NULLIF(COUNT(*), 0), 4) AS null_rate,
      ROUND(COUNT(*) FILTER (WHERE capacity = 0)::numeric / NULLIF(COUNT(*), 0), 4) AS zero_rate,
      COUNT(*) FILTER (WHERE capacity > 0 AND capacity < 500) AS valid_count,
      ROUND(AVG(capacity) FILTER (WHERE capacity > 0 AND capacity < 500)) AS avg_cap,
      PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY capacity)
        FILTER (WHERE capacity > 0 AND capacity < 500) AS median_cap
    FROM facilities
    GROUP BY service_code, service_name
    ORDER BY service_code
  `;

  // ── 3. 監査実行 ──

  console.log('Auditing...');
  const results: AuditRow[] = [];

  for (const r of rows) {
    const result = audit(
      r.service_code as string,
      r.service_name as string,
      Number(r.cnt),
      Number(r.null_rate ?? 0),
      Number(r.zero_rate ?? 0),
      Number(r.valid_count ?? 0),
      r.avg_cap != null ? Number(r.avg_cap) : null,
      r.median_cap != null ? Number(r.median_cap) : null,
    );
    results.push(result);
  }

  // ── 4. DB保存 ──

  await sql`DELETE FROM service_code_audit`;

  for (const r of results) {
    await sql`
      INSERT INTO service_code_audit (
        service_code, service_name_sample, facility_count,
        capacity_null_rate, capacity_zero_rate, capacity_valid_count,
        avg_capacity_valid, median_capacity_valid,
        assigned_service_group, expected_service_type,
        mismatch_flag, review_required, review_reason,
        confidence, notes
      ) VALUES (
        ${r.service_code}, ${r.service_name_sample}, ${r.facility_count},
        ${r.capacity_null_rate}, ${r.capacity_zero_rate}, ${r.capacity_valid_count},
        ${r.avg_capacity_valid}, ${r.median_capacity_valid},
        ${r.assigned_service_group}, ${r.expected_service_type},
        ${r.mismatch_flag}, ${r.review_required}, ${r.review_reasons.join('; ')},
        ${r.confidence}, ${r.notes}
      )
    `;
  }
  console.log(`  ${results.length} audit rows saved`);

  // ── 5. サマリ出力 ──

  console.log(`\n${'='.repeat(120)}`);
  console.log('全 service_code サマリ');
  console.log('='.repeat(120));
  console.log(
    'code  ' + 'service_name'.padEnd(38) +
    'cnt'.padStart(7) + ' null%'.padStart(7) + ' zero%'.padStart(7) +
    ' valid'.padStart(7) + ' avgCap'.padStart(7) + ' medCap'.padStart(7) +
    '  group'.padEnd(22) + '  review  reasons'
  );
  console.log('-'.repeat(120));
  for (const r of results) {
    const flags = r.review_required ? '  YES   ' : '        ';
    console.log(
      r.service_code.padEnd(6) +
      r.service_name_sample.substring(0, 36).padEnd(38) +
      String(r.facility_count).padStart(7) +
      (r.capacity_null_rate * 100).toFixed(1).padStart(6) + '%' +
      (r.capacity_zero_rate * 100).toFixed(1).padStart(6) + '%' +
      String(r.capacity_valid_count).padStart(7) +
      (r.avg_capacity_valid != null ? String(r.avg_capacity_valid) : '-').padStart(7) +
      (r.median_capacity_valid != null ? String(r.median_capacity_valid) : '-').padStart(7) +
      '  ' + (r.assigned_service_group).padEnd(20) +
      flags +
      r.review_reasons.join('; ')
    );
  }

  // mismatch / review 件数
  const mismatchCount = results.filter((r) => r.mismatch_flag).length;
  const reviewCount = results.filter((r) => r.review_required).length;
  console.log(`\nmismatch_flag=true:  ${mismatchCount}`);
  console.log(`review_required=true: ${reviewCount}`);

  // confidence 別
  const confCounts = { high: 0, medium: 0, low: 0 };
  for (const r of results) confCounts[r.confidence]++;
  console.log(`\nconfidence: high=${confCounts.high} medium=${confCounts.medium} low=${confCounts.low}`);

  // ── 6. 要確認コード一覧 ──

  console.log(`\n${'='.repeat(120)}`);
  console.log('要確認コード（review_required=true）');
  console.log('='.repeat(120));

  const reviewItems = results.filter((r) => r.review_required);
  for (const r of reviewItems) {
    console.log(`\n  [${r.service_code}] ${r.service_name_sample}`);
    console.log(`    assigned_group: ${r.assigned_service_group}`);
    console.log(`    expected_type:  ${r.expected_service_type}`);
    console.log(`    confidence:     ${r.confidence}`);
    console.log(`    mismatch:       ${r.mismatch_flag}`);
    console.log(`    reasons:        ${r.review_reasons.join('; ')}`);
    console.log(`    facility_count: ${r.facility_count}`);
    console.log(`    notes:          ${r.notes}`);
  }

  // ── 7. 重大な発見のハイライト ──

  console.log(`\n${'='.repeat(80)}`);
  console.log('★★ 重大な発見: residential_total に含まれていない入所系施設');
  console.log('='.repeat(80));

  const missing = results.filter((r) => {
    const exp = EXPECTED_DEFINITIONS[r.service_code];
    return exp?.is_residential && !PHASE4_GROUP_MAP[r.service_code];
  });

  let missingTotal = 0;
  let missingCap = 0;
  for (const r of missing) {
    const capStr = r.avg_capacity_valid != null
      ? `avg_cap=${r.avg_capacity_valid}, valid=${r.capacity_valid_count}`
      : 'capacity data insufficient';
    console.log(`  ${r.service_code}: ${r.service_name_sample} (${r.facility_count}件, ${capStr})`);
    missingTotal += r.facility_count;
    missingCap += r.capacity_valid_count;
  }
  console.log(`\n  合計: ${missingTotal}件（有効定員 ${missingCap}件）`);
  console.log(`  これらが residential_total に含まれていないため、充足率が過小評価されている可能性がある`);

  // ── 8. 問題なさそうなコード ──

  console.log(`\n${'='.repeat(60)}`);
  console.log('問題なし（confidence=high, review_required=false）');
  console.log('='.repeat(60));
  const ok = results.filter((r) => !r.review_required && r.confidence === 'high');
  for (const r of ok.slice(0, 10)) {
    console.log(`  ${r.service_code}: ${r.service_name_sample} (${r.facility_count}件)`);
  }
  console.log(`  ... 他 ${Math.max(0, ok.length - 10)}件`);

  // ── 非更新確認 ──

  const mmCheck = await sql`
    SELECT match_type, COUNT(*) AS cnt FROM municipality_mapping GROUP BY match_type ORDER BY match_type
  `;
  console.log(`\nmunicipality_mapping: ${mmCheck.map((r: Record<string, unknown>) => r.match_type + '=' + r.cnt).join(', ')} (更新なし)`);

  const ccmCheck = await sql`SELECT COUNT(*) AS cnt FROM city_care_metrics`;
  console.log(`city_care_metrics: ${ccmCheck[0].cnt}行 (更新なし)`);
}

main().catch(console.error);
