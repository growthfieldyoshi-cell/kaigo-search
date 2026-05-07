export type CareServiceGroupKey =
  | "residential"
  | "daycare"
  | "visit"
  | "consultation"
  | "equipment"
  | "multi_function"
  | "other";

export interface CareServiceGroupDef {
  key: CareServiceGroupKey;
  label: string;
  serviceNames: string[];
}

export const CARE_SERVICE_GROUPS: CareServiceGroupDef[] = [
  {
    key: "residential",
    label: "入所系",
    serviceNames: [
      "短期入所生活介護",
      "短期入所療養介護",
      "特定施設入居者生活介護",
      "認知症対応型共同生活介護",
      "介護老人福祉施設",
      "介護老人保健施設",
    ],
  },
  {
    key: "daycare",
    label: "通所系",
    serviceNames: [
      "通所介護",
      "療養通所介護",
      "通所リハビリテーション",
    ],
  },
  {
    key: "visit",
    label: "訪問系",
    serviceNames: [
      "訪問介護",
      "訪問入浴介護",
      "訪問看護",
      "訪問リハビリテーション",
    ],
  },
  {
    key: "consultation",
    label: "相談系",
    serviceNames: ["居宅介護支援"],
  },
  {
    key: "equipment",
    label: "福祉用具系",
    serviceNames: ["福祉用具貸与", "特定福祉用具販売"],
  },
  {
    key: "multi_function",
    label: "複合型（通い・訪問・宿泊）",
    serviceNames: [
      "小規模多機能型居宅介護",
      "看護小規模多機能型居宅介護（複合型サービス）",
    ],
  },
];

const NAME_TO_GROUP: Map<string, CareServiceGroupKey> = (() => {
  const map = new Map<string, CareServiceGroupKey>();
  for (const g of CARE_SERVICE_GROUPS) {
    for (const name of g.serviceNames) map.set(name, g.key);
  }
  return map;
})();

// service_code 優先の分類対応表。DB の service_code が number でも string でも
// 同じキーで引けるよう、キーは文字列で保持する。
const CODE_TO_GROUP: Map<string, CareServiceGroupKey> = new Map([
  // 訪問系
  ["110", "visit"], // 訪問介護
  ["120", "visit"], // 訪問入浴介護
  ["130", "visit"], // 訪問看護
  ["140", "visit"], // 訪問リハビリテーション
  ["710", "visit"], // 夜間対応型訪問介護
  ["760", "visit"], // 定期巡回・随時対応型訪問介護看護
  // 通所系
  ["150", "daycare"], // 通所介護
  ["155", "daycare"], // 指定療養通所介護
  ["160", "daycare"], // 通所リハビリテーション
  ["720", "daycare"], // 認知症対応型通所介護
  ["780", "daycare"], // 地域密着型通所介護
  // 福祉用具系
  ["170", "equipment"], // 福祉用具貸与
  ["410", "equipment"], // 特定福祉用具販売
  // 入所系
  ["210", "residential"], // 短期入所生活介護
  ["220", "residential"], // 短期入所療養介護（介護老人保健施設）
  ["230", "residential"], // 短期入所療養介護（療養病床）
  ["320", "residential"], // 認知症対応型共同生活介護
  ["331", "residential"], // 特定施設入居者生活介護（有料老人ホーム）
  ["332", "residential"], // 特定施設入居者生活介護（軽費老人ホーム）
  ["334", "residential"], // 特定施設入居者生活介護（サ高住）
  ["335", "residential"], // 特定施設入居者生活介護（外部サービス利用型・有料老人ホーム）
  ["336", "residential"], // 特定施設入居者生活介護（外部サービス利用型・軽費老人ホーム）
  ["337", "residential"], // 特定施設入居者生活介護（外部サービス利用型・サ高住）
  ["361", "residential"], // 地域密着型特定施設入居者生活介護（有料老人ホーム）
  ["362", "residential"], // 地域密着型特定施設入居者生活介護（軽費老人ホーム）
  ["364", "residential"], // 地域密着型特定施設入居者生活介護（サ高住）
  ["520", "residential"], // 介護老人保健施設
  ["530", "residential"], // 介護療養型医療施設
  ["540", "residential"], // 地域密着型介護老人福祉施設入所者生活介護
  ["550", "residential"], // 介護医療院
  ["551", "residential"], // 短期入所療養介護（介護医療院）
  // 相談系
  ["430", "consultation"], // 居宅介護支援
  // 複合型
  ["730", "multi_function"], // 小規模多機能型居宅介護
  ["770", "multi_function"], // 看護小規模多機能型居宅介護
]);

export function classifyCareService(
  serviceName: string,
  serviceCode?: string | number | null,
): CareServiceGroupKey {
  if (serviceCode != null) {
    const codeKey = String(serviceCode).trim();
    if (codeKey !== "") {
      const byCode = CODE_TO_GROUP.get(codeKey);
      if (byCode) return byCode;
    }
  }
  const byName = NAME_TO_GROUP.get(serviceName);
  if (byName) return byName;
  return "other";
}

export const RESIDENTIAL_SERVICE_NAMES: ReadonlySet<string> = new Set(
  CARE_SERVICE_GROUPS.find((g) => g.key === "residential")!.serviceNames,
);

// グループごとの軽い説明と、施設詳細ページで利用者が確認すべきポイントの例。
// YMYL 配慮として、断定や医療的判断を避け、利用者が事業所・公式情報に直接確認するよう促す表現にしている。
export interface CareServiceGroupGuidance {
  description: string;
  checkItems: string[];
}

export const CARE_SERVICE_GROUP_GUIDANCE: Record<
  CareServiceGroupKey,
  CareServiceGroupGuidance
> = {
  residential: {
    description:
      "入所系サービスは、施設に入所または宿泊して介護を受けるサービスです。定員・空き状況・費用・医療対応などの確認が重要です。",
    checkItems: [
      "空き状況・順番待ちの状況",
      "利用料金・自己負担額",
      "対応できる介護内容",
      "医療対応・認知症対応",
      "見学・相談の可否",
    ],
  },
  daycare: {
    description:
      "通所系サービスは、日中に施設へ通って介護・機能訓練・入浴などを受けるサービスです。送迎範囲や利用可能日を確認しましょう。",
    checkItems: [
      "空き状況",
      "利用料金・自己負担額",
      "対応できる介護内容",
      "送迎範囲",
      "利用可能日・時間",
      "見学・相談の可否",
    ],
  },
  visit: {
    description:
      "訪問系サービスは、自宅で生活しながら介護や看護、リハビリなどを受けるサービスです。対応エリアや利用条件は事業所ごとに異なります。",
    checkItems: [
      "訪問対応エリア",
      "利用料金・自己負担額",
      "対応できる介護内容",
      "医療対応・認知症対応",
      "利用可能日・時間",
      "相談の可否",
    ],
  },
  consultation: {
    description:
      "居宅介護支援は、ケアマネジャーがケアプラン作成や介護サービス利用の相談を支援するサービスです。",
    checkItems: [
      "対応エリア",
      "相談・対応可能日",
      "対応できる介護保険サービスの範囲",
      "担当ケアマネジャーの受け入れ状況",
      "初回相談・面談の可否",
    ],
  },
  equipment: {
    description:
      "福祉用具系のサービスは、介護ベッドや車いすなどの福祉用具を借りる(貸与)・購入(販売)するサービスです。対象品目や利用条件を確認しましょう。",
    checkItems: [
      "貸与品目・取り扱い品目",
      "利用料金・自己負担額",
      "配送・搬入対応エリア",
      "メンテナンス・点検の対応",
      "相談の可否",
    ],
  },
  multi_function: {
    description:
      "複合型サービスは、通い・訪問・宿泊を組み合わせて利用できる介護サービスです。利用できる内容や回数、費用は事業所ごとに異なるため、利用条件を確認することが大切です。",
    checkItems: [
      "通い・訪問・宿泊それぞれの利用可能枠",
      "利用料金・自己負担額",
      "対応できる介護内容",
      "医療対応・認知症対応",
      "見学・相談の可否",
    ],
  },
  other: {
    description:
      "サービス内容や利用条件は事業所ごとに異なります。気になる点は公式情報や事業所へ直接確認しましょう。",
    checkItems: [
      "空き状況・利用可能枠",
      "利用料金・自己負担額",
      "対応できる介護内容",
      "利用条件・対応エリア",
      "見学・相談の可否",
    ],
  },
};
