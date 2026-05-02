import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCertificationRanking } from "@/lib/queries";
import { prefectureFromSlug, getAllPrefectureSlugs } from "@/lib/prefecture-slugs";
import { RankingPrefTable, RankingDisclaimer, RankingFooterLinks } from "../../components";

export const revalidate = 86400;

export function generateStaticParams() {
  return getAllPrefectureSlugs().map(({ slug }) => ({ prefecture: slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ prefecture: string }> }): Promise<Metadata> {
  const { prefecture: slug } = await params;
  const pref = prefectureFromSlug(slug);
  if (!pref) return { title: "ページが見つかりません" };
  const title = `${pref}の介護認定率ランキング | 高齢者の要介護認定が多い地域は？`;
  const description = `${pref}の介護認定率ランキング。65歳以上の高齢者に対する要介護認定者の割合を市区町村別に比較できます。`;
  return { title, description, openGraph: { title, description } };
}

export default async function PrefCertificationPage({ params }: { params: Promise<{ prefecture: string }> }) {
  const { prefecture: slug } = await params;
  const pref = prefectureFromSlug(slug);
  if (!pref) notFound();

  const entries = await getCertificationRanking(pref, 50);
  const allSlugs = getAllPrefectureSlugs();

  return (
    <>
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-primary">トップ</Link>
        <span className="mx-2">›</span>
        <Link href="/ranking/certification" className="hover:text-primary">認定率ランキング</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-800">{pref}</span>
      </nav>

      <h1 className="font-serif text-2xl font-bold text-primary mb-2">
        {pref}の介護認定率ランキング
      </h1>
      <p className="text-gray-600 mb-6">
        {pref}内で介護認定率が高い市区町村をランキング形式で紹介します。認定率は65歳以上の高齢者のうち要介護認定を受けている人の割合です。
      </p>

      {entries.length > 0 ? (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-4">
            {pref} 介護認定率ランキング
          </h2>
          <RankingPrefTable entries={entries} prefecture={pref} valueKey="certification_rate" />
        </div>
      ) : (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <p className="text-sm text-gray-500">
            {pref}では認定率データがありません。
          </p>
        </div>
      )}

      {slug === 'osaka' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">
            上位地域の特徴や背景、認定率の見方を詳しく解説しています。
          </p>
          <Link
            href="/articles/certification-ranking/osaka"
            className="text-sm text-primary hover:underline font-medium"
          >
            大阪府の介護認定率ランキング｜上位地域の特徴と背景を解説 →
          </Link>
        </div>
      )}

      {slug === 'fukushima' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">
            上位地域の特徴や背景、認定率の見方を詳しく解説しています。
          </p>
          <Link
            href="/articles/certification-ranking/fukushima"
            className="text-sm text-primary hover:underline font-medium"
          >
            福島県の介護認定率ランキング｜上位地域の特徴と背景を解説 →
          </Link>
        </div>
      )}

      {slug === 'hokkaido' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">
            上位地域の特徴や背景、認定率の見方を詳しく解説しています。
          </p>
          <Link
            href="/articles/certification-ranking/hokkaido"
            className="text-sm text-primary hover:underline font-medium"
          >
            北海道の介護認定率ランキング｜上位地域の特徴と背景を解説 →
          </Link>
        </div>
      )}

      {slug === 'nara' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">
            上位地域の特徴や背景、認定率の見方を詳しく解説しています。
          </p>
          <Link
            href="/articles/certification-ranking/nara"
            className="text-sm text-primary hover:underline font-medium"
          >
            奈良県の介護認定率ランキング｜上位地域の特徴と背景を解説 →
          </Link>
        </div>
      )}

      {slug === 'miyagi' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">
            上位地域の特徴や背景、認定率の見方を詳しく解説しています。
          </p>
          <Link
            href="/articles/certification-ranking/miyagi"
            className="text-sm text-primary hover:underline font-medium"
          >
            宮城県の介護認定率ランキング｜上位地域の特徴と背景を解説 →
          </Link>
        </div>
      )}

      {slug === 'nagano' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">
            上位地域の特徴や背景、認定率の見方を詳しく解説しています。
          </p>
          <Link
            href="/articles/certification-ranking/nagano"
            className="text-sm text-primary hover:underline font-medium"
          >
            長野県の介護認定率ランキング｜上位地域の特徴と背景を解説 →
          </Link>
        </div>
      )}

      {slug === 'gunma' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">
            上位地域の特徴や背景、認定率の見方を詳しく解説しています。
          </p>
          <Link
            href="/articles/certification-ranking/gunma"
            className="text-sm text-primary hover:underline font-medium"
          >
            群馬県の介護認定率ランキング｜上位地域の特徴と背景を解説 →
          </Link>
        </div>
      )}

      {slug === 'tottori' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">
            上位地域の特徴や背景、認定率の見方を詳しく解説しています。
          </p>
          <Link
            href="/articles/certification-ranking/tottori"
            className="text-sm text-primary hover:underline font-medium"
          >
            鳥取県の介護認定率ランキング｜上位地域の特徴と背景を解説 →
          </Link>
        </div>
      )}

      {slug === 'ehime' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">
            上位地域の特徴や背景、認定率の見方を詳しく解説しています。
          </p>
          <Link
            href="/articles/certification-ranking/ehime"
            className="text-sm text-primary hover:underline font-medium"
          >
            愛媛県の介護認定率ランキング｜上位地域の特徴と背景を解説 →
          </Link>
        </div>
      )}

      {slug === 'nagasaki' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">
            上位地域の特徴や背景、認定率の見方を詳しく解説しています。
          </p>
          <Link
            href="/articles/certification-ranking/nagasaki"
            className="text-sm text-primary hover:underline font-medium"
          >
            長崎県の介護認定率ランキング｜上位地域の特徴と背景を解説 →
          </Link>
        </div>
      )}

      {slug === 'akita' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">
            上位地域の特徴や背景、認定率の見方を詳しく解説しています。
          </p>
          <Link
            href="/articles/certification-ranking/akita"
            className="text-sm text-primary hover:underline font-medium"
          >
            秋田県の介護認定率ランキング｜上位地域の特徴と背景を解説 →
          </Link>
        </div>
      )}

      {slug === 'yamagata' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">
            上位地域の特徴や背景、認定率の見方を詳しく解説しています。
          </p>
          <Link
            href="/articles/certification-ranking/yamagata"
            className="text-sm text-primary hover:underline font-medium"
          >
            山形県の介護認定率ランキング｜上位地域の特徴と背景を解説 →
          </Link>
        </div>
      )}

      {slug === 'kochi' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">
            上位地域の特徴や背景、認定率の見方を詳しく解説しています。
          </p>
          <Link
            href="/articles/certification-ranking/kochi"
            className="text-sm text-primary hover:underline font-medium"
          >
            高知県の介護認定率ランキング｜上位地域の特徴と背景を解説 →
          </Link>
        </div>
      )}

      {slug === 'shimane' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">
            上位地域の特徴や背景、認定率の見方を詳しく解説しています。
          </p>
          <Link
            href="/articles/certification-ranking/shimane"
            className="text-sm text-primary hover:underline font-medium"
          >
            島根県の介護認定率ランキング｜上位地域の特徴と背景を解説 →
          </Link>
        </div>
      )}

      {slug === 'wakayama' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">
            上位地域の特徴や背景、認定率の見方を詳しく解説しています。
          </p>
          <Link
            href="/articles/certification-ranking/wakayama"
            className="text-sm text-primary hover:underline font-medium"
          >
            和歌山県の介護認定率ランキング｜上位地域の特徴と背景を解説 →
          </Link>
        </div>
      )}

      {slug === 'tokushima' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">
            上位地域の特徴や背景、認定率の見方を詳しく解説しています。
          </p>
          <Link
            href="/articles/certification-ranking/tokushima"
            className="text-sm text-primary hover:underline font-medium"
          >
            徳島県の介護認定率ランキング｜上位地域の特徴と背景を解説 →
          </Link>
        </div>
      )}

      {slug === 'kagoshima' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">
            上位地域の特徴や背景、認定率の見方を詳しく解説しています。
          </p>
          <Link
            href="/articles/certification-ranking/kagoshima"
            className="text-sm text-primary hover:underline font-medium"
          >
            鹿児島県の介護認定率ランキング｜上位地域の特徴と背景を解説 →
          </Link>
        </div>
      )}

      {slug === 'yamaguchi' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">
            上位地域の特徴や背景、認定率の見方を詳しく解説しています。
          </p>
          <Link
            href="/articles/certification-ranking/yamaguchi"
            className="text-sm text-primary hover:underline font-medium"
          >
            山口県の介護認定率ランキング｜上位地域の特徴と背景を解説 →
          </Link>
        </div>
      )}

      {slug === 'oita' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">
            上位地域の特徴や背景、認定率の見方を詳しく解説しています。
          </p>
          <Link
            href="/articles/certification-ranking/oita"
            className="text-sm text-primary hover:underline font-medium"
          >
            大分県の介護認定率ランキング｜上位地域の特徴と背景を解説 →
          </Link>
        </div>
      )}

      {slug === 'saga' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">
            上位地域の特徴や背景、認定率の見方を詳しく解説しています。
          </p>
          <Link
            href="/articles/certification-ranking/saga"
            className="text-sm text-primary hover:underline font-medium"
          >
            佐賀県の介護認定率ランキング｜上位地域の特徴と背景を解説 →
          </Link>
        </div>
      )}

      {slug === 'kumamoto' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">
            上位地域の特徴や背景、認定率の見方を詳しく解説しています。
          </p>
          <Link
            href="/articles/certification-ranking/kumamoto"
            className="text-sm text-primary hover:underline font-medium"
          >
            熊本県の介護認定率ランキング｜上位地域の特徴と背景を解説 →
          </Link>
        </div>
      )}

      {slug === 'miyazaki' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">
            上位地域の特徴や背景、認定率の見方を詳しく解説しています。
          </p>
          <Link
            href="/articles/certification-ranking/miyazaki"
            className="text-sm text-primary hover:underline font-medium"
          >
            宮崎県の介護認定率ランキング｜上位地域の特徴と背景を解説 →
          </Link>
        </div>
      )}

      {slug === 'iwate' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">
            上位地域の特徴や背景、認定率の見方を詳しく解説しています。
          </p>
          <Link
            href="/articles/certification-ranking/iwate"
            className="text-sm text-primary hover:underline font-medium"
          >
            岩手県の介護認定率ランキング｜上位地域の特徴と背景を解説 →
          </Link>
        </div>
      )}

      {slug === 'aomori' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">
            上位地域の特徴や背景、認定率の見方を詳しく解説しています。
          </p>
          <Link
            href="/articles/certification-ranking/aomori"
            className="text-sm text-primary hover:underline font-medium"
          >
            青森県の介護認定率ランキング｜上位地域の特徴と背景を解説 →
          </Link>
        </div>
      )}

      {slug === 'fukuoka' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">
            上位地域の特徴や背景、認定率の見方を詳しく解説しています。
          </p>
          <Link
            href="/articles/certification-ranking/fukuoka"
            className="text-sm text-primary hover:underline font-medium"
          >
            福岡県の介護認定率ランキング｜上位地域の特徴と背景を解説 →
          </Link>
        </div>
      )}

      {slug === 'hiroshima' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">
            上位地域の特徴や背景、認定率の見方を詳しく解説しています。
          </p>
          <Link
            href="/articles/certification-ranking/hiroshima"
            className="text-sm text-primary hover:underline font-medium"
          >
            広島県の介護認定率ランキング｜上位地域の特徴と背景を解説 →
          </Link>
        </div>
      )}

      {slug === 'gifu' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">
            上位地域の特徴や背景、認定率の見方を詳しく解説しています。
          </p>
          <Link
            href="/articles/certification-ranking/gifu"
            className="text-sm text-primary hover:underline font-medium"
          >
            岐阜県の介護認定率ランキング｜上位地域の特徴と背景を解説 →
          </Link>
        </div>
      )}

      {slug === 'toyama' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">
            上位地域の特徴や背景、認定率の見方を詳しく解説しています。
          </p>
          <Link
            href="/articles/certification-ranking/toyama"
            className="text-sm text-primary hover:underline font-medium"
          >
            富山県の介護認定率ランキング｜上位地域の特徴と背景を解説 →
          </Link>
        </div>
      )}

      {slug === 'ishikawa' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">
            上位地域の特徴や背景、認定率の見方を詳しく解説しています。
          </p>
          <Link
            href="/articles/certification-ranking/ishikawa"
            className="text-sm text-primary hover:underline font-medium"
          >
            石川県の介護認定率ランキング｜上位地域の特徴と背景を解説 →
          </Link>
        </div>
      )}

      {slug === 'fukui' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">
            上位地域の特徴や背景、認定率の見方を詳しく解説しています。
          </p>
          <Link
            href="/articles/certification-ranking/fukui"
            className="text-sm text-primary hover:underline font-medium"
          >
            福井県の介護認定率ランキング｜上位地域の特徴と背景を解説 →
          </Link>
        </div>
      )}

      {slug === 'mie' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">
            上位地域の特徴や背景、認定率の見方を詳しく解説しています。
          </p>
          <Link
            href="/articles/certification-ranking/mie"
            className="text-sm text-primary hover:underline font-medium"
          >
            三重県の介護認定率ランキング｜上位地域の特徴と背景を解説 →
          </Link>
        </div>
      )}

      {slug === 'okayama' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">
            上位地域の特徴や背景、認定率の見方を詳しく解説しています。
          </p>
          <Link
            href="/articles/certification-ranking/okayama"
            className="text-sm text-primary hover:underline font-medium"
          >
            岡山県の介護認定率ランキング｜上位地域の特徴と背景を解説 →
          </Link>
        </div>
      )}

      {slug === 'yamanashi' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">
            上位地域の特徴や背景、認定率の見方を詳しく解説しています。
          </p>
          <Link
            href="/articles/certification-ranking/yamanashi"
            className="text-sm text-primary hover:underline font-medium"
          >
            山梨県の介護認定率ランキング｜上位地域の特徴と背景を解説 →
          </Link>
        </div>
      )}

      {slug === 'saitama' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">
            上位地域の特徴や背景、認定率の見方を詳しく解説しています。
          </p>
          <Link
            href="/articles/certification-ranking/saitama"
            className="text-sm text-primary hover:underline font-medium"
          >
            埼玉県の介護認定率ランキング｜上位地域の特徴と背景を解説 →
          </Link>
        </div>
      )}

      {slug === 'chiba' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">
            上位地域の特徴や背景、認定率の見方を詳しく解説しています。
          </p>
          <Link
            href="/articles/certification-ranking/chiba"
            className="text-sm text-primary hover:underline font-medium"
          >
            千葉県の介護認定率ランキング｜上位地域の特徴と背景を解説 →
          </Link>
        </div>
      )}

      {slug === 'kyoto' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">
            上位地域の特徴や背景、認定率の見方を詳しく解説しています。
          </p>
          <Link
            href="/articles/certification-ranking/kyoto"
            className="text-sm text-primary hover:underline font-medium"
          >
            京都府の介護認定率ランキング｜上位地域の特徴と背景を解説 →
          </Link>
        </div>
      )}

      {slug === 'hyogo' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">
            上位地域の特徴や背景、認定率の見方を詳しく解説しています。
          </p>
          <Link
            href="/articles/certification-ranking/hyogo"
            className="text-sm text-primary hover:underline font-medium"
          >
            兵庫県の介護認定率ランキング｜上位地域の特徴と背景を解説 →
          </Link>
        </div>
      )}

      {slug === 'shiga' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">
            上位地域の特徴や背景、認定率の見方を詳しく解説しています。
          </p>
          <Link
            href="/articles/certification-ranking/shiga"
            className="text-sm text-primary hover:underline font-medium"
          >
            滋賀県の介護認定率ランキング｜上位地域の特徴と背景を解説 →
          </Link>
        </div>
      )}

      {slug === 'tokyo' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">
            上位地域の特徴や背景、認定率の見方を詳しく解説しています。
          </p>
          <Link
            href="/articles/certification-ranking/tokyo"
            className="text-sm text-primary hover:underline font-medium"
          >
            東京都の介護認定率ランキング｜上位地域の特徴と背景を解説 →
          </Link>
        </div>
      )}

      {slug === 'kanagawa' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">
            上位地域の特徴や背景、認定率の見方を詳しく解説しています。
          </p>
          <Link
            href="/articles/certification-ranking/kanagawa"
            className="text-sm text-primary hover:underline font-medium"
          >
            神奈川県の介護認定率ランキング｜上位地域の特徴と背景を解説 →
          </Link>
        </div>
      )}

      {slug === 'kagawa' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">
            上位地域の特徴や背景、認定率の見方を詳しく解説しています。
          </p>
          <Link
            href="/articles/certification-ranking/kagawa"
            className="text-sm text-primary hover:underline font-medium"
          >
            香川県の介護認定率ランキング｜上位地域の特徴と背景を解説 →
          </Link>
        </div>
      )}

      {slug === 'okinawa' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">
            上位地域の特徴や背景、認定率の見方を詳しく解説しています。
          </p>
          <Link
            href="/articles/certification-ranking/okinawa"
            className="text-sm text-primary hover:underline font-medium"
          >
            沖縄県の介護認定率ランキング｜上位地域の特徴と背景を解説 →
          </Link>
        </div>
      )}

      <RankingDisclaimer />

      <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mt-6">
        <h2 className="font-serif text-base font-bold text-primary mb-3">他の都道府県</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {allSlugs.map(({ slug: s, name }) => (
            <Link
              key={s}
              href={`/ranking/certification/${s}`}
              className={`text-sm hover:underline ${s === slug ? 'text-gray-800 font-bold' : 'text-primary'}`}
            >
              {name}
            </Link>
          ))}
        </div>
      </div>

      <RankingFooterLinks prefecture={pref} />
    </>
  );
}
