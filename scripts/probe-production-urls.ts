/**
 * 本番URLのHTTPステータスを実測し、200/301/308/404/5xx/other に分類する。
 *
 * 使い方:
 *   npx tsx scripts/probe-production-urls.ts <urls-file>
 *
 *   <urls-file>: 1行1URL のテキストファイル。フルURL でもパスでも可。
 *                # で始まる行と空行は無視。
 *
 * 出力:
 *   outputs/probe-production-urls.csv  ... 行単位の詳細
 *   標準出力                          ... 集計と各URL結果
 *
 * 注意:
 *   - redirect は follow せず、初手の status と Location を記録する
 *     （リダイレクト方式そのものを検査するため）。
 *   - 並列度は控えめ（CONCURRENCY=4）に抑え、本番に負荷をかけない。
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";

const BASE = "https://www.kaigosagashi.jp";
const CONCURRENCY = 4;

type Category = "200" | "301" | "308" | "404" | "5xx" | "other" | "error";

interface ProbeResult {
  input: string;
  url: string;
  status: number | "error";
  category: Category;
  location: string;
  error: string;
}

function categorize(status: number): Category {
  if (status === 200) return "200";
  if (status === 301) return "301";
  if (status === 308) return "308";
  if (status === 404) return "404";
  if (status >= 500 && status < 600) return "5xx";
  return "other";
}

async function probe(input: string): Promise<ProbeResult> {
  const trimmed = input.trim();
  const fullUrl = trimmed.startsWith("http") ? trimmed : `${BASE}${trimmed}`;
  // 非ASCIIを含む URL は encodeURI で安全に正規化（/, :, ?, = は保持される）
  const encoded = /[^\x00-\x7F]/.test(fullUrl) ? encodeURI(fullUrl) : fullUrl;

  try {
    const res = await fetch(encoded, {
      redirect: "manual",
      method: "GET",
      headers: { "user-agent": "kaigo-search-probe/1.0" },
    });
    return {
      input: trimmed,
      url: fullUrl,
      status: res.status,
      category: categorize(res.status),
      location: res.headers.get("location") ?? "",
      error: "",
    };
  } catch (e) {
    return {
      input: trimmed,
      url: fullUrl,
      status: "error",
      category: "error",
      location: "",
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

function csvField(s: string | number): string {
  const str = String(s);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error("Usage: tsx scripts/probe-production-urls.ts <urls-file>");
    console.error("  <urls-file>: 1行1URL のテキストファイル（# コメント・空行は無視）");
    process.exit(1);
  }

  const content = await readFile(file, "utf-8");
  const inputs = content
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith("#"));

  if (inputs.length === 0) {
    console.error("No URLs to probe.");
    process.exit(1);
  }

  console.log(`Probing ${inputs.length} URLs against ${BASE} ...\n`);

  const results: ProbeResult[] = [];
  for (let i = 0; i < inputs.length; i += CONCURRENCY) {
    const batch = inputs.slice(i, i + CONCURRENCY);
    const r = await Promise.all(batch.map(probe));
    results.push(...r);
  }

  // CSV 出力
  const outPath = "outputs/probe-production-urls.csv";
  await mkdir(dirname(outPath), { recursive: true });
  const header = ["input", "url", "status", "category", "location", "error"];
  const csvLines = [header.join(",")];
  for (const r of results) {
    csvLines.push(
      [
        csvField(r.input),
        csvField(r.url),
        csvField(r.status),
        csvField(r.category),
        csvField(r.location),
        csvField(r.error),
      ].join(","),
    );
  }
  await writeFile(outPath, csvLines.join("\n") + "\n");

  // 集計
  const counts: Record<Category, number> = {
    "200": 0,
    "301": 0,
    "308": 0,
    "404": 0,
    "5xx": 0,
    other: 0,
    error: 0,
  };
  for (const r of results) counts[r.category]++;

  console.log("=== Summary ===");
  console.log(`Total probed: ${results.length}`);
  for (const cat of ["200", "301", "308", "404", "5xx", "other", "error"] as Category[]) {
    if (counts[cat] > 0) console.log(`  ${cat.padEnd(5)} : ${counts[cat]}`);
  }
  console.log(`\nCSV saved to: ${outPath}`);

  console.log("\n=== Per-URL ===");
  for (const r of results) {
    const loc = r.location ? ` → ${safeDecode(r.location)}` : "";
    const err = r.error ? ` (error: ${r.error})` : "";
    console.log(
      `  [${String(r.status).padStart(5)}] [${r.category.padEnd(5)}] ${r.input}${loc}${err}`,
    );
  }
}

function safeDecode(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
