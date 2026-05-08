/**
 * /sitemap-facilities-1.xml — 施設詳細 sitemap 第1段
 *
 * /sitemap.xml は GSC 既送信のため単一 sitemap として従来挙動を維持し、
 * 施設詳細 URL はこの別 Route Handler で配信する（25,000 URL/file）。
 *
 * 抽出条件:
 *   - 公式 URL が http(s):// で始まる施設のみ（品質シグナル）
 *   - id ASC で先頭 25,000 件
 *   - city は confirmed mapping 経由で city_agg に正規化済み
 *
 * 将来の拡張: 第2段は OFFSET=25000 で /sitemap-facilities-2.xml として追加する想定。
 */
import { getFacilitiesForSitemap } from "@/lib/queries";

const BASE = "https://www.kaigosagashi.jp";
const CHUNK_OFFSET = 0;
const CHUNK_LIMIT = 25_000;

// XML 特殊文字エスケープ（URL に & が混じる場合に備えた防御）
function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export const dynamic = "force-static";
export const revalidate = 86400;

export async function GET(): Promise<Response> {
  const facilities = await getFacilitiesForSitemap(CHUNK_OFFSET, CHUNK_LIMIT);
  const lastmod = new Date().toISOString();

  const urlNodes = facilities
    .map((f) => {
      const url = `${BASE}/${encodeURIComponent(f.prefecture)}/${encodeURIComponent(f.city)}/${f.service_code}/${f.id}`;
      return `  <url>
    <loc>${escapeXml(url)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlNodes}
</urlset>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
