import type { Metadata } from "next";
import Link from "next/link";
import { getCertificationRanking } from "@/lib/queries";
import { getAllPrefectureSlugs } from "@/lib/prefecture-slugs";
import { RankingTable, RankingDisclaimer, RankingFooterLinks } from "../components";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "介護認定率ランキング【全国版】| 高齢者の要介護認定が多い地域は？",
  description:
    "全国の介護認定率ランキング。65歳以上の高齢者に対する要介護認定者の割合を市区町村別に比較できます。",
  openGraph: {
    title: "介護認定率ランキング【全国版】",
    description: "全国の介護認定率ランキング。高齢者の要介護認定が多い地域を確認できます。",
  },
};

export default async function NationalCertificationPage() {
  const entries = await getCertificationRanking(undefined, 50);

  return (
    <>
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-primary">トップ</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-800">認定率ランキング（全国）</span>
      </nav>

      <h1 className="font-serif text-2xl font-bold text-primary mb-2">
        介護認定率ランキング【全国版】
      </h1>
      <p className="text-gray-600 mb-6">
        全国の市区町村を対象に、介護認定率が高い地域をランキング形式で紹介します。介護認定率は65歳以上の高齢者のうち要支援・要介護の認定を受けている人の割合です。
      </p>

      <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
        <h2 className="font-serif text-base font-bold text-primary mb-4">
          介護認定率 TOP50
        </h2>
        <RankingTable entries={entries} valueKey="certification_rate" />
      </div>

      <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
        <h2 className="font-serif text-base font-bold text-primary mb-3">ランキングの傾向</h2>
        <div className="text-sm text-gray-700 leading-relaxed space-y-2">
          <p>
            認定率が高い地域は、75歳以上の後期高齢者の割合が多い傾向があります。過疎地域や高齢化が進んだ町村に多く見られます。
          </p>
          <p>
            逆に、比較的若い世代が多い都市部やベッドタウンでは認定率が低くなる傾向があります。
          </p>
        </div>
      </div>

      <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
        <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
        <p className="text-sm text-gray-700 mb-2">
          上位地域の特徴や背景、認定率の見方を詳しく解説しています。
        </p>
        <Link
          href="/articles/certification-ranking-japan"
          className="text-sm text-primary hover:underline font-medium"
        >
          介護認定率が高い地域ランキング｜上位地域の特徴と背景を解説 →
        </Link>
      </div>

      <RankingDisclaimer />

      <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mt-6">
        <h2 className="font-serif text-base font-bold text-primary mb-3">都道府県別で見る</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {getAllPrefectureSlugs().map(({ slug, name }) => (
            <Link
              key={slug}
              href={`/ranking/certification/${slug}`}
              className="text-sm text-primary hover:underline"
            >
              {name}
            </Link>
          ))}
        </div>
      </div>

      <RankingFooterLinks />
    </>
  );
}
