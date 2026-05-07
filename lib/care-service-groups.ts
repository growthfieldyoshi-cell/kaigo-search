export type CareServiceGroupKey =
  | "residential"
  | "daycare"
  | "visit"
  | "consultation"
  | "equipment"
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
    serviceNames: ["福祉用具貸与"],
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
  ["110", "visit"],
  ["120", "visit"],
  ["130", "visit"],
  ["140", "visit"],
  ["150", "daycare"],
  ["155", "daycare"],
  ["160", "daycare"],
  ["170", "equipment"],
  ["210", "residential"],
  ["220", "residential"],
  ["230", "residential"],
  ["320", "residential"],
  ["331", "residential"],
  ["332", "residential"],
  ["334", "residential"],
  ["430", "consultation"],
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
