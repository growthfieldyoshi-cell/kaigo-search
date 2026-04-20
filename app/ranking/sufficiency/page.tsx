import type { Metadata } from "next";
import Link from "next/link";
import { getSufficiencyRanking } from "@/lib/queries";
import { getAllPrefectureSlugs, slugFromPrefecture } from "@/lib/prefecture-slugs";
import { RankingTable, RankingDisclaimer, RankingFooterLinks } from "../components";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "入所系施設カバー率ランキング【全国版】| どの地域の施設供給が手厚いか",
  description:
    "全国の入所系施設カバー率ランキング。認定者数に対する入所系施設の定員割合を市区町村別に比較できます。",
  openGraph: {
    title: "入所系施設カバー率ランキング【全国版】",
    description: "全国の入所系施設カバー率ランキング。認定者数に対する入所系施設の定員割合を市区町村別に比較できます。",
  },
};

export default async function NationalSufficiencyPage() {
  const entries = await getSufficiencyRanking(undefined, 50);

  return (
    <>
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-primary">トップ</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-800">カバー率ランキング（全国）</span>
      </nav>

      <h1 className="font-serif text-2xl font-bold text-primary mb-2">
        入所系施設カバー率ランキング【全国版】
      </h1>
      <p className="text-gray-600 mb-6">
        全国の市区町村を対象に、入所系施設カバー率が高い地域をランキング形式で紹介します。カバー率は要介護認定者数全体に対する入所系施設の定員割合です。すべての認定者が入所を必要としているわけではないため、地域の施設供給規模の目安としてご覧ください。
      </p>

      <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
        <h2 className="font-serif text-base font-bold text-primary mb-4">
          入所系施設カバー率 TOP50
        </h2>
        <RankingTable entries={entries} valueKey="sufficiency_rate" showBadge />
      </div>

      <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
        <h2 className="font-serif text-base font-bold text-primary mb-3">ランキングの傾向</h2>
        <div className="text-sm text-gray-700 leading-relaxed space-y-2">
          <p>
            カバー率の上位には、比較的小規模な町村が多く含まれます。これは人口が少ない地域に一定規模の施設があると、カバー率が高くなりやすいためです。
          </p>
          <p>
            一方で、大都市圏の市区はカバー率が低い傾向にあります。人口集中地域では認定者数が多く、認定者全体に対する施設定員の割合が低くなりやすい構造があります。
          </p>
        </div>
      </div>

      <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
        <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
        <p className="text-sm text-gray-700 mb-2">
          上位地域の特徴や背景、ランキングの読み方を詳しく解説しています。
        </p>
        <Link
          href="/articles/sufficiency-ranking-japan"
          className="text-sm text-primary hover:underline font-medium"
        >
          介護施設が充実している地域ランキング｜上位地域の特徴と背景を解説 →
        </Link>
      </div>

      <RankingDisclaimer />

      <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mt-6">
        <h2 className="font-serif text-base font-bold text-primary mb-3">都道府県別で見る</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {getAllPrefectureSlugs().map(({ slug, name }) => (
            <Link
              key={slug}
              href={`/ranking/sufficiency/${slug}`}
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
