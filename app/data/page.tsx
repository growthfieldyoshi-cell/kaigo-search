import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "データについて",
  description: "介護さがしで掲載している介護施設データの出典・算出方法・更新方針・データの限界について解説しています。",
  alternates: {
    canonical: "https://www.kaigosagashi.jp/data",
  },
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

      {/* ── 施設情報の出典 ── */}
      <div className="bg-bg-card border border-gray-200 rounded-lg p-6 sm:p-8">
        <h2 className="font-serif text-lg font-bold text-primary mb-3">施設情報の出典</h2>
        <p className="text-sm text-gray-700 leading-relaxed mb-4">
          当サイトで掲載している介護事業所の情報は、以下のオープンデータを利用しています。
        </p>

        <dl className="divide-y divide-gray-100">
          {[
            ["データ名", "介護サービス情報公表システム 事業所情報"],
            ["提供元", "厚生労働省"],
            [
              "ライセンス",
              <>
                CC BY 4.0（クリエイティブ・コモンズ 表示 4.0 国際）
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

      {/* ── 独自指標の出典と算出方法 ── */}
      <div className="bg-bg-card border border-gray-200 rounded-lg p-6 sm:p-8 mt-6">
        <h2 className="font-serif text-lg font-bold text-primary mb-3">独自指標の出典と算出方法</h2>
        <p className="text-sm text-gray-700 leading-relaxed mb-3">
          当サイトでは、厚生労働省のオープンデータをもとに、市区町村ごとの「入所系施設カバー率」「介護認定率」を独自に算出しています。指標の意味・分子分母・算出ロジック・注意点は別ページで詳しく解説しています。
        </p>
        <dl className="divide-y divide-gray-100 mb-4">
          {[
            [
              "認定者数・65歳以上人口",
              "厚生労働省「介護保険事業状況報告」のオープンデータ",
            ],
            [
              "入所系施設定員",
              "厚生労働省「介護サービス情報公表システム」の定員データ（未入力施設は集計から除外）",
            ],
          ].map(([label, value]) => (
            <div key={String(label)} className="grid grid-cols-[140px_1fr] sm:grid-cols-[200px_1fr] gap-2 py-3">
              <dt className="text-sm text-gray-500 font-medium">{label}</dt>
              <dd className="text-sm text-gray-800">{value}</dd>
            </div>
          ))}
        </dl>
        <Link href="/data/metrics" className="text-sm text-primary hover:underline font-medium">
          指標の計算方法と見方を詳しく見る →
        </Link>
      </div>

      {/* ── データ更新方針 ── */}
      <div className="bg-bg-card border border-gray-200 rounded-lg p-6 sm:p-8 mt-6">
        <h2 className="font-serif text-lg font-bold text-primary mb-3">データ更新方針</h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          施設情報は、厚生労働省が公開するデータの更新タイミングに合わせて定期的に取り込みを行っています。データの内容は調査時点のものであり、施設の新規開設・閉鎖・移転、サービス内容の変更などが反映されるまで一定の時間がかかる場合があります。
        </p>
      </div>

      {/* ── 掲載データの限界 ── */}
      <div className="bg-bg-card border border-gray-200 rounded-lg p-6 sm:p-8 mt-6">
        <h2 className="font-serif text-lg font-bold text-primary mb-3">掲載データの限界</h2>
        <p className="text-sm text-gray-700 leading-relaxed mb-3">
          掲載情報は公開データに基づいていますが、以下のような限界があります。利用判断の前に、必ず各施設・自治体・ケアマネジャーへ直接ご確認ください。
        </p>
        <ul className="text-sm text-gray-700 leading-relaxed list-disc list-inside space-y-1.5 mb-4">
          <li>
            <strong>空き状況や費用は反映していません。</strong>
            掲載しているのは定員などの基本情報のみで、現時点で入所・利用できるかは別途確認が必要です。
          </li>
          <li>
            <strong>医療対応・受け入れ条件は掲載していません。</strong>
            たんの吸引・経管栄養などの医療的ケアの可否、認知症対応の可否、利用条件などは各施設にお問い合わせください。
          </li>
          <li>
            <strong>定員未入力の施設があります。</strong>
            元データに定員が記載されていない施設は、カバー率の集計に含まれていません。
          </li>
          <li>
            <strong>住所表記の揺れ・自治体名変更があります。</strong>
            元データの表記揺れや、市町村合併などの履歴により、最新の自治体名と一致しない場合があります。
          </li>
          <li>
            <strong>独自指標は参考値です。</strong>
            介護認定率・入所系施設カバー率は公開データから機械的に算出した参考値であり、地域の介護環境の良し悪しを直接示すものではありません。
          </li>
        </ul>
        <div className="bg-amber-50 rounded-lg px-4 py-3">
          <p className="text-xs text-amber-700 leading-relaxed">
            <strong>重要：</strong>
            介護・医療に関する判断は、必ずケアマネジャー・地域包括支援センター・自治体窓口・主治医など、専門家にご相談のうえ行ってください。
          </p>
        </div>
      </div>

      {/* ── データ修正依頼の受付方法 ── */}
      <div className="bg-bg-card border border-gray-200 rounded-lg p-6 sm:p-8 mt-6">
        <h2 className="font-serif text-lg font-bold text-primary mb-3">データ修正依頼・お問い合わせ</h2>
        <p className="text-sm text-gray-700 leading-relaxed mb-2">
          掲載情報に誤りがある場合や、情報の修正をご希望の場合は、お問い合わせフォームよりご連絡ください。施設の運営者・関係者の方からのご連絡も受け付けています。
        </p>
        <p className="text-xs text-gray-500 leading-relaxed mb-3">
          ※ 元データが厚生労働省提供のオープンデータであるため、原則として元データの更新に合わせて対応します。明らかな表記揺れや当サイトの集計バグについては、個別に対応します。
        </p>
        <Link href="/contact" className="text-sm text-primary hover:underline font-medium">
          お問い合わせフォームへ →
        </Link>
      </div>
    </>
  );
}
