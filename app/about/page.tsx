import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "運営者情報",
  description: "介護さがしの運営者情報・運営方針・広告掲載方針・お問い合わせ先について掲載しています。",
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

      {/* ── 運営会社 ── */}
      <div className="bg-bg-card border border-gray-200 rounded-lg p-6 sm:p-8">
        <h2 className="font-serif text-lg font-bold text-primary mb-4">運営会社</h2>
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

      {/* ── サイト運営目的 ── */}
      <div className="bg-bg-card border border-gray-200 rounded-lg p-6 sm:p-8 mt-6">
        <h2 className="font-serif text-lg font-bold text-primary mb-3">サイト運営目的</h2>
        <p className="text-sm text-gray-700 leading-relaxed mb-3">
          介護さがしは、ご家族や本人の介護施設探しを支援する情報サイトです。日本各地に20万件以上ある介護施設・介護サービス事業所の情報は、公的なデータベースに公開されているものの、地域や種別を横断して比較しづらいのが現状です。
        </p>
        <p className="text-sm text-gray-700 leading-relaxed mb-3">
          当サイトでは、厚生労働省「介護サービス情報公表システム」のオープンデータを整理し、都道府県・市区町村・サービス種別ごとに探しやすい形で提供しています。また、公開データから独自に算出した地域の介護指標（入所系施設カバー率・介護認定率）を併せて掲載し、地域ごとの介護環境を把握する手がかりとして役立てていただくことを目指しています。
        </p>
        <p className="text-sm text-gray-700 leading-relaxed">
          初めて介護施設を探す方、家族の介護に直面した方、ケアマネジャーや自治体への相談前に情報を整理したい方を、主な利用者として想定しています。
        </p>
      </div>

      {/* ── 掲載情報の位置づけ ── */}
      <div className="bg-bg-card border border-gray-200 rounded-lg p-6 sm:p-8 mt-6">
        <h2 className="font-serif text-lg font-bold text-primary mb-3">掲載情報の位置づけ</h2>
        <p className="text-sm text-gray-700 leading-relaxed mb-3">
          当サイトに掲載している施設情報は、厚生労働省が公開しているオープンデータをもとに整理した参考情報です。以下の点をあらかじめご了承ください。
        </p>
        <ul className="text-sm text-gray-700 leading-relaxed list-disc list-inside space-y-1.5">
          <li>掲載情報は調査時点のものであり、最新の状況と異なる場合があります。</li>
          <li>空き状況・料金・受け入れ条件・医療対応の可否などは掲載していません。</li>
          <li>独自指標は公開データから機械的に算出した参考値であり、各施設・地域の介護サービスの質を直接示すものではありません。</li>
        </ul>
        <div className="bg-amber-50 rounded-lg px-4 py-3 mt-4">
          <p className="text-xs text-amber-700 leading-relaxed">
            <strong>重要：</strong>
            介護・医療に関する判断は、必ずケアマネジャー・地域包括支援センター・自治体窓口・主治医など、専門家にご相談のうえ行ってください。当サイトの情報は、専門家への相談前に地域や施設の概要を把握するための補助資料としてご活用ください。
          </p>
        </div>
      </div>

      {/* ── 広告・アフィリエイト掲載方針 ── */}
      <div className="bg-bg-card border border-gray-200 rounded-lg p-6 sm:p-8 mt-6">
        <h2 className="font-serif text-lg font-bold text-primary mb-3">広告・アフィリエイト掲載方針</h2>
        <p className="text-sm text-gray-700 leading-relaxed mb-3">
          当サイトは、サイト運営のための費用を賄うため、Google AdSense をはじめとする広告サービスおよびアフィリエイトプログラムを利用する場合があります。広告・アフィリエイトを掲載する際は、以下の方針に沿って運営します。
        </p>
        <ul className="text-sm text-gray-700 leading-relaxed list-disc list-inside space-y-1.5">
          <li>広告・アフィリエイトリンクは、コンテンツと明確に区別できる形で表示します。</li>
          <li>広告主・アフィリエイト先からの依頼や報酬によって、記事や指標の解説内容を歪めることはしません。</li>
          <li>介護に関する判断を誤らせる恐れのある誇大広告・断定的な表現は掲載しません。</li>
        </ul>
      </div>

      {/* ── データ出典 ── */}
      <div className="bg-bg-card border border-gray-200 rounded-lg p-6 sm:p-8 mt-6">
        <h2 className="font-serif text-lg font-bold text-primary mb-3">データ出典</h2>
        <p className="text-sm text-gray-700 leading-relaxed mb-2">
          施設情報は厚生労働省「介護サービス情報公表システム」のオープンデータ（CC BY 4.0）を利用しています。データの出典・算出方法・更新方針については、データ解説ページに詳しく掲載しています。
        </p>
        <Link href="/data" className="text-sm text-primary hover:underline font-medium">
          データについて詳しく見る →
        </Link>
      </div>

      {/* ── お問い合わせ ── */}
      <div className="bg-bg-card border border-gray-200 rounded-lg p-6 sm:p-8 mt-6">
        <h2 className="font-serif text-lg font-bold text-primary mb-3">お問い合わせ</h2>
        <p className="text-sm text-gray-700 leading-relaxed mb-2">
          掲載情報の誤りに関する修正依頼、運営に関するご意見・ご要望は、お問い合わせフォームよりご連絡ください。
        </p>
        <Link href="/contact" className="text-sm text-primary hover:underline font-medium">
          お問い合わせフォームへ →
        </Link>
      </div>
    </>
  );
}
