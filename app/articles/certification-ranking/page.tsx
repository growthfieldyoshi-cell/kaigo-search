import type { Metadata } from "next";
import Link from "next/link";
import { getAllArticleSlugs, getArticleData } from "@/lib/article-data/certification-ranking";

export const metadata: Metadata = {
  title: "都道府県別 介護認定率ランキング記事一覧",
  description:
    "各都道府県の介護認定率が高い市区町村の特徴や背景を解説した記事の一覧です。都道府県ごとの認定率ランキングと上位地域の詳しい解説をご覧いただけます。",
  openGraph: {
    title: "都道府県別 介護認定率ランキング記事一覧",
    description:
      "各都道府県の介護認定率ランキング記事を一覧で紹介。上位地域の特徴と背景を都道府県別に解説しています。",
  },
};

export default function CertificationRankingIndexPage() {
  const slugs = getAllArticleSlugs();
  const articles = slugs
    .map((slug) => getArticleData(slug))
    .filter((d): d is NonNullable<typeof d> => d !== null);

  return (
    <>
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-primary">トップ</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-800">都道府県別 認定率ランキング記事</span>
      </nav>

      <h1 className="font-serif text-2xl font-bold text-primary mb-2">
        都道府県別 介護認定率ランキング記事一覧
      </h1>
      <p className="text-gray-600 mb-8">
        各都道府県の介護認定率が高い市区町村について、上位地域の特徴や背景をデータで解説しています。気になる都道府県を選んでご覧ください。
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-8">
        {articles.map((a) => (
          <Link
            key={a.slug}
            href={`/articles/certification-ranking/${a.slug}`}
            className="bg-bg-card border border-gray-200 rounded-lg px-5 py-4 hover:border-accent hover:shadow-md transition-all"
          >
            <span className="font-serif font-bold text-primary block text-lg">
              {a.prefecture}
            </span>
            <span className="text-sm text-gray-500">
              平均認定率 {a.prefAvgRate}%・上位地域の特徴を解説
            </span>
          </Link>
        ))}
      </div>

      <div className="bg-bg-card border border-gray-200 rounded-lg px-5 py-4 mb-6">
        <p className="text-sm text-gray-700">
          全国版のランキングや、認定率の計算方法についてはこちらをご覧ください。
        </p>
      </div>

      {/* ── 関連リンク ── */}
      <div className="bg-bg-card border border-gray-200 rounded-lg px-5 py-4">
        <p className="text-sm font-medium text-gray-800 mb-2">関連ページ</p>
        <ul className="text-sm space-y-1.5">
          <li>
            <Link href="/articles/certification-ranking-japan" className="text-primary hover:underline">
              介護認定率が高い地域ランキング（全国版記事）
            </Link>
          </li>
          <li>
            <Link href="/ranking/certification" className="text-primary hover:underline">
              認定率ランキング TOP50（データ一覧）
            </Link>
          </li>
          <li>
            <Link href="/data/metrics" className="text-primary hover:underline">
              指標の計算方法と見方について
            </Link>
          </li>
          <li>
            <Link href="/" className="text-primary hover:underline">
              都道府県から介護施設を探す
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
}
