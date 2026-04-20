import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "データについて",
  description: "介護さがしで利用しているデータの出典・ライセンス情報です。",
};

export default function DataPage() {
  return (
    <>
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-primary">トップ</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-800">データについて</span>
      </nav>

      <h1 className="font-serif text-2xl font-bold text-primary mb-8">データについて</h1>

      <div className="bg-bg-card border border-gray-200 rounded-lg p-6 sm:p-8">
        <p className="text-sm text-gray-700 leading-relaxed mb-6">
          当サイトで掲載している介護事業所の情報は、以下のオープンデータを利用しています。
        </p>

        <dl className="divide-y divide-gray-100">
          {[
            ["データ名", "介護サービス情報公表システム 事業所情報"],
            ["提供元", "厚生労働省"],
            [
              "ライセンス",
              <>
                CC BY（クリエイティブ・コモンズ 表示 4.0 国際）
                <br />
                <span className="text-gray-400">商用利用可・出典明記が必要です</span>
              </>,
            ],
            [
              "出典URL",
              <a
                key="url"
                href="https://www.mhlw.go.jp/stf/kaigo-kouhyou_opendata.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline break-all"
              >
                https://www.mhlw.go.jp/stf/kaigo-kouhyou_opendata.html
              </a>,
            ],
          ].map(([label, value]) => (
            <div key={String(label)} className="grid grid-cols-[120px_1fr] sm:grid-cols-[160px_1fr] gap-2 py-4">
              <dt className="text-sm text-gray-500 font-medium">{label}</dt>
              <dd className="text-sm text-gray-800">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="bg-bg-card border border-gray-200 rounded-lg p-6 sm:p-8 mt-6">
        <h2 className="font-serif text-lg font-bold text-primary mb-3">データの正確性について</h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          掲載情報は厚生労働省のオープンデータに基づいていますが、最新の状況と異なる場合があります。正確な情報については、各事業所または自治体へ直接お問い合わせください。
        </p>
      </div>

      <div className="bg-bg-card border border-gray-200 rounded-lg p-6 sm:p-8 mt-6">
        <h2 className="font-serif text-lg font-bold text-primary mb-3">独自指標について</h2>
        <p className="text-sm text-gray-700 leading-relaxed mb-3">
          当サイトでは、厚生労働省のオープンデータを元に市区町村ごとの「入所系施設カバー率」「介護認定率」を独自に算出しています。
        </p>
        <Link
          href="/data/metrics"
          className="text-sm text-primary hover:underline font-medium"
        >
          指標の計算方法と見方を詳しく見る →
        </Link>
      </div>
    </>
  );
}
