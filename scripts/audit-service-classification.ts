import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import {
  classifyCareService,
  CARE_SERVICE_GROUPS,
} from "../lib/care-service-groups";
import type { CareServiceGroupKey } from "../lib/care-service-groups";

const sql = neon(process.env.DATABASE_URL!);

interface Row {
  service_code: string;
  service_name: string;
  count: number;
}

async function main() {
  // facilities の (service_code, service_name) 別件数（実 DB 棚卸し）
  const rows = (await sql`
    SELECT service_code, service_name, COUNT(*)::int AS count
    FROM facilities
    GROUP BY service_code, service_name
    ORDER BY service_code, service_name
  `) as Row[];

  // 各行に分類結果と分類経路（code/name/none）を付与
  type Classified = Row & {
    group: CareServiceGroupKey;
    matchedBy: "code" | "name" | "none";
  };

  // CODE_TO_GROUP は private なので、code を使った場合と name を使った場合を別々に判定して経路を推定
  const classified: Classified[] = rows.map((r) => {
    const byCodeOnly = classifyCareService("__no_match__", r.service_code);
    const byNameOnly = classifyCareService(r.service_name, undefined);
    const final = classifyCareService(r.service_name, r.service_code);

    let matchedBy: "code" | "name" | "none";
    if (byCodeOnly !== "other") matchedBy = "code";
    else if (byNameOnly !== "other") matchedBy = "name";
    else matchedBy = "none";

    return { ...r, group: final, matchedBy };
  });

  const totalFacilities = rows.reduce((a, r) => a + r.count, 0);

  // ── 1) 全件一覧（service_code 昇順） ──────────────────────────
  console.log("=" .repeat(72));
  console.log(" 1) facilities に存在する全 service_code / service_name / 件数");
  console.log("=" .repeat(72));
  console.log(
    `total rows: ${rows.length} 種別 / ${totalFacilities.toLocaleString()} 件\n`,
  );
  console.log(
    "code | group        | by   | count   | service_name",
  );
  console.log("-".repeat(120));
  for (const r of classified) {
    console.log(
      `${r.service_code.padEnd(4)} | ${r.group.padEnd(12)} | ${r.matchedBy.padEnd(4)} | ${String(r.count).padStart(6)} | ${r.service_name}`,
    );
  }

  // ── 2) "other" 全件 ───────────────────────────────────────────
  const others = classified
    .filter((r) => r.group === "other")
    .sort((a, b) => b.count - a.count);
  const otherTotal = others.reduce((a, r) => a + r.count, 0);

  console.log("\n" + "=".repeat(72));
  console.log(" 2) classifyCareService で 'other' になる全 service_code");
  console.log("=" .repeat(72));
  console.log(
    `other total: ${others.length} 種別 / ${otherTotal.toLocaleString()} 件 (全体の ${((otherTotal / totalFacilities) * 100).toFixed(1)}%)\n`,
  );
  console.log("code | count   | service_name");
  console.log("-".repeat(80));
  for (const r of others) {
    console.log(
      `${r.service_code.padEnd(4)} | ${String(r.count).padStart(6)} | ${r.service_name}`,
    );
  }

  // ── 3) other 上位 20 ──────────────────────────────────────────
  console.log("\n" + "=".repeat(72));
  console.log(" 3) 'other' のうち件数が多い上位 20");
  console.log("=" .repeat(72));
  console.log("rank | code | count   | service_name");
  console.log("-".repeat(80));
  others.slice(0, 20).forEach((r, i) => {
    console.log(
      `${String(i + 1).padStart(4)} | ${r.service_code.padEnd(4)} | ${String(r.count).padStart(6)} | ${r.service_name}`,
    );
  });

  // ── 4) 既存5グループ別の集計 ──────────────────────────────────
  console.log("\n" + "=".repeat(72));
  console.log(" 4) 既存5グループ別の集計");
  console.log("=" .repeat(72));
  for (const g of CARE_SERVICE_GROUPS) {
    const inGroup = classified.filter((r) => r.group === g.key);
    const groupCount = inGroup.reduce((a, r) => a + r.count, 0);
    console.log(
      `\n[${g.key}] ${g.label}: ${inGroup.length} 種別 / ${groupCount.toLocaleString()} 件`,
    );
    for (const r of inGroup.sort((a, b) => b.count - a.count)) {
      console.log(
        `  ${r.service_code.padEnd(4)} (${r.matchedBy}) ${String(r.count).padStart(6)}件  ${r.service_name}`,
      );
    }
  }
  const otherGroup = classified.filter((r) => r.group === "other");
  const otherGroupCount = otherGroup.reduce((a, r) => a + r.count, 0);
  console.log(
    `\n[other] その他: ${otherGroup.length} 種別 / ${otherGroupCount.toLocaleString()} 件`,
  );

  // ── 5) ユーザー指定の関心トピックがどう格納されているか ─────────
  console.log("\n" + "=".repeat(72));
  console.log(" 5) 関心トピック別の格納状況");
  console.log("=" .repeat(72));
  const topics: Array<[string, RegExp]> = [
    ["介護老人保健施設", /老人保健施設/],
    ["介護医療院", /介護医療院/],
    ["地域密着型", /地域密着型/],
    ["小規模多機能", /小規模多機能/],
    ["看護小規模多機能", /看護小規模多機能/],
    ["認知症対応型通所", /認知症対応型通所/],
    ["定期巡回", /定期巡回/],
    ["夜間対応型訪問", /夜間対応型訪問/],
    ["特定福祉用具販売", /特定福祉用具/],
    ["居宅療養管理", /居宅療養管理/],
  ];
  for (const [label, re] of topics) {
    const hits = rows.filter((r) => re.test(r.service_name));
    console.log(`\n  ${label}:`);
    if (hits.length === 0) {
      console.log("    (該当なし)");
      continue;
    }
    for (const r of hits) {
      const c = classified.find(
        (cc) => cc.service_code === r.service_code && cc.service_name === r.service_name,
      )!;
      console.log(
        `    ${r.service_code.padEnd(4)} → ${c.group.padEnd(12)} (${c.matchedBy})  ${String(r.count).padStart(6)}件  ${r.service_name}`,
      );
    }
  }
}

main().then(() => process.exit(0)).catch((e) => {
  console.error(e);
  process.exit(1);
});
