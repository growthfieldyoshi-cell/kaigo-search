import type { MetadataRoute } from "next";

// AI学習目的のクローラーをブロック
// SEO検索エンジン(Google/Bing)とSEOツール(Ahrefs/Semrush)は許可
const AI_BOTS = [
  // OpenAI
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  // Anthropic
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  // Perplexity
  "PerplexityBot",
  "Perplexity-User",
  // ByteDance / TikTok(特に攻撃的)
  "Bytespider",
  // Google AI(検索とは別系統)
  "Google-Extended",
  // Common Crawl(多くのAIモデルが学習データに利用)
  "CCBot",
  // Apple AI(検索の Applebot は別系統なので影響なし)
  "Applebot-Extended",
  // その他主要AI/データ抽出系
  "cohere-ai",
  "Diffbot",
  "Omgilibot",
  "FacebookBot",
  "Meta-ExternalAgent",
  "meta-externalagent",
  "Amazonbot",
  "DuckAssistBot",
  "PetalBot",
  "YouBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // AI学習bot は全部ブロック
      ...AI_BOTS.map((bot) => ({
        userAgent: bot,
        disallow: "/",
      })),
      // それ以外は全部許可(Googlebot, bingbot, AhrefsBot, SemrushBot 等)
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    // /sitemap.xml: GSC に既送信済みの単一 sitemap（home / static / prefecture / ranking / articles / city / city-service）
    // /sitemap-facilities-1.xml: 施設詳細 第1段（公式 URL 持ち施設の上位 25,000 件）
    // 将来の拡張は /sitemap-facilities-2.xml, /sitemap-facilities-3.xml ... を追加する想定。
    sitemap: [
      "https://www.kaigosagashi.jp/sitemap.xml",
      "https://www.kaigosagashi.jp/sitemap-facilities-1.xml",
    ],
  };
}