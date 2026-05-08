import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "運営者情報",
  description: "介護さがしの運営者情報・会社概要です。",
  alternates: {
    canonical: "https://www.kaigosagashi.jp/about",
  },
};

export default function AboutPage() {
  return (
    <>
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-primary">トップ</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-800">運営者情報</span>
      </nav>

      <h1 className="font-serif text-2xl font-bold text-primary mb-8">運営者情報</h1>

      <div className="bg-bg-card border border-gray-200 rounded-lg p-6 sm:p-8">
        <dl className="divide-y divide-gray-100">
          {[
            ["サービス名", "介護さがし"],
            ["運営会社", "グロースフィールド株式会社"],
            ["代表取締役", "増田吉彦"],
            ["設立", "2025年"],
            ["事業内容", "データ分析・Webサービス運営"],
            [
              "お問い合わせ",
              <a key="email" href="mailto:kaigosagashi.info@gmail.com" className="text-primary hover:underline">
                kaigosagashi.info@gmail.com
              </a>,
            ],
          ].map(([label, value]) => (
            <div key={String(label)} className="grid grid-cols-[140px_1fr] sm:grid-cols-[180px_1fr] gap-2 py-4">
              <dt className="text-sm text-gray-500 font-medium">{label}</dt>
              <dd className="text-sm text-gray-800">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="bg-bg-card border border-gray-200 rounded-lg p-6 sm:p-8 mt-6">
        <h2 className="font-serif text-lg font-bold text-primary mb-4">データ出典</h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          本サイトで掲載している介護事業所データは、厚生労働省「介護サービス情報公表システム」のオープンデータ（CC BY）を利用しています。
        </p>
        <p className="text-sm text-gray-500 mt-2">
          出典：
          <a
            href="https://www.kaigokensaku.mhlw.go.jp/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            https://www.kaigokensaku.mhlw.go.jp/
          </a>
        </p>
      </div>
    </>
  );
}
