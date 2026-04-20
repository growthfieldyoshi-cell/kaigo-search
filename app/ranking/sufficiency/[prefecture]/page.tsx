import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSufficiencyRanking } from "@/lib/queries";
import { prefectureFromSlug, getAllPrefectureSlugs, slugFromPrefecture } from "@/lib/prefecture-slugs";
import { RankingPrefTable, RankingDisclaimer, RankingFooterLinks } from "../../components";

export const revalidate = 3600;

export function generateStaticParams() {
  return getAllPrefectureSlugs().map(({ slug }) => ({ prefecture: slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ prefecture: string }> }): Promise<Metadata> {
  const { prefecture: slug } = await params;
  const pref = prefectureFromSlug(slug);
  if (!pref) return { title: "ページが見つかりません" };
  const title = `${pref}の入所系施設カバー率ランキング | どの地域の施設供給が手厚いか`;
  const description = `${pref}の入所系施設カバー率ランキング。認定者数に対する入所系施設の定員割合を市区町村別に比較できます。`;
  return { title, description, openGraph: { title, description } };
}

export default async function PrefSufficiencyPage({ params }: { params: Promise<{ prefecture: string }> }) {
  const { prefecture: slug } = await params;
  const pref = prefectureFromSlug(slug);
  if (!pref) notFound();

  const entries = await getSufficiencyRanking(pref, 50);

  // 近隣県リンク用
  const allSlugs = getAllPrefectureSlugs();
  const currentIdx = allSlugs.findIndex((s) => s.slug === slug);

  return (
    <>
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-primary">トップ</Link>
        <span className="mx-2">›</span>
        <Link href="/ranking/sufficiency" className="hover:text-primary">カバー率ランキング</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-800">{pref}</span>
      </nav>

      <h1 className="font-serif text-2xl font-bold text-primary mb-2">
        {pref}の入所系施設カバー率ランキング
      </h1>
      <p className="text-gray-600 mb-6">
        {pref}内で入所系施設カバー率が高い市区町村をランキング形式で紹介します。カバー率は認定者全体に対する施設定員の割合です。
      </p>

      {entries.length > 0 ? (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-4">
            {pref} 入所系施設カバー率ランキング
          </h2>
          <RankingPrefTable entries={entries} prefecture={pref} valueKey="sufficiency_rate" showBadge />
        </div>
      ) : (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <p className="text-sm text-gray-500">
            {pref}では公開基準を満たすカバー率データがありません。
          </p>
        </div>
      )}

      {slug === 'osaka' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">
            上位地域の特徴や背景、カバー率の見方を詳しく解説しています。
          </p>
          <Link
            href="/articles/sufficiency-ranking/osaka"
            className="text-sm text-primary hover:underline font-medium"
          >
            大阪府の入所系施設カバー率ランキング｜上位地域の特徴と背景を解説 →
          </Link>
        </div>
      )}

      {slug === 'kanagawa' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">
            上位地域の特徴や背景、カバー率の見方を詳しく解説しています。
          </p>
          <Link
            href="/articles/sufficiency-ranking/kanagawa"
            className="text-sm text-primary hover:underline font-medium"
          >
            神奈川県の入所系施設カバー率ランキング｜上位地域の特徴と背景を解説 →
          </Link>
        </div>
      )}

      {slug === 'tokyo' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">
            上位地域の特徴や背景、カバー率の見方を詳しく解説しています。
          </p>
          <Link
            href="/articles/sufficiency-ranking/tokyo"
            className="text-sm text-primary hover:underline font-medium"
          >
            東京都の入所系施設カバー率ランキング｜上位地域の特徴と背景を解説 →
          </Link>
        </div>
      )}

      {slug === 'saitama' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">
            上位地域の特徴や背景、カバー率の見方を詳しく解説しています。
          </p>
          <Link
            href="/articles/sufficiency-ranking/saitama"
            className="text-sm text-primary hover:underline font-medium"
          >
            埼玉県の入所系施設カバー率ランキング｜上位地域の特徴と背景を解説 →
          </Link>
        </div>
      )}

      {slug === 'chiba' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">
            上位地域の特徴や背景、カバー率の見方を詳しく解説しています。
          </p>
          <Link
            href="/articles/sufficiency-ranking/chiba"
            className="text-sm text-primary hover:underline font-medium"
          >
            千葉県の入所系施設カバー率ランキング｜上位地域の特徴と背景を解説 →
          </Link>
        </div>
      )}

      {slug === 'aichi' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">
            上位地域の特徴や背景、カバー率の見方を詳しく解説しています。
          </p>
          <Link
            href="/articles/sufficiency-ranking/aichi"
            className="text-sm text-primary hover:underline font-medium"
          >
            愛知県の入所系施設カバー率ランキング｜上位地域の特徴と背景を解説 →
          </Link>
        </div>
      )}

      {slug === 'fukuoka' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">
            上位地域の特徴や背景、カバー率の見方を詳しく解説しています。
          </p>
          <Link
            href="/articles/sufficiency-ranking/fukuoka"
            className="text-sm text-primary hover:underline font-medium"
          >
            福岡県の入所系施設カバー率ランキング｜上位地域の特徴と背景を解説 →
          </Link>
        </div>
      )}

      {slug === 'hokkaido' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">
            上位地域の特徴や背景、カバー率の見方を詳しく解説しています。
          </p>
          <Link
            href="/articles/sufficiency-ranking/hokkaido"
            className="text-sm text-primary hover:underline font-medium"
          >
            北海道の入所系施設カバー率ランキング｜上位地域の特徴と背景を解説 →
          </Link>
        </div>
      )}

      {slug === 'hyogo' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">
            上位地域の特徴や背景、カバー率の見方を詳しく解説しています。
          </p>
          <Link
            href="/articles/sufficiency-ranking/hyogo"
            className="text-sm text-primary hover:underline font-medium"
          >
            兵庫県の入所系施設カバー率ランキング｜上位地域の特徴と背景を解説 →
          </Link>
        </div>
      )}

      {slug === 'shizuoka' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">
            上位地域の特徴や背景、カバー率の見方を詳しく解説しています。
          </p>
          <Link
            href="/articles/sufficiency-ranking/shizuoka"
            className="text-sm text-primary hover:underline font-medium"
          >
            静岡県の入所系施設カバー率ランキング｜上位地域の特徴と背景を解説 →
          </Link>
        </div>
      )}

      {slug === 'miyagi' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">上位地域の特徴や背景、カバー率の見方を詳しく解説しています。</p>
          <Link href="/articles/sufficiency-ranking/miyagi" className="text-sm text-primary hover:underline font-medium">宮城県の入所系施設カバー率ランキング｜上位地域の特徴と背景を解説 →</Link>
        </div>
      )}

      {slug === 'niigata' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">上位地域の特徴や背景、カバー率の見方を詳しく解説しています。</p>
          <Link href="/articles/sufficiency-ranking/niigata" className="text-sm text-primary hover:underline font-medium">新潟県の入所系施設カバー率ランキング｜上位地域の特徴と背景を解説 →</Link>
        </div>
      )}

      {slug === 'nagano' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">上位地域の特徴や背景、カバー率の見方を詳しく解説しています。</p>
          <Link href="/articles/sufficiency-ranking/nagano" className="text-sm text-primary hover:underline font-medium">長野県の入所系施設カバー率ランキング｜上位地域の特徴と背景を解説 →</Link>
        </div>
      )}

      {slug === 'gifu' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">上位地域の特徴や背景、カバー率の見方を詳しく解説しています。</p>
          <Link href="/articles/sufficiency-ranking/gifu" className="text-sm text-primary hover:underline font-medium">岐阜県の入所系施設カバー率ランキング｜上位地域の特徴と背景を解説 →</Link>
        </div>
      )}

      {slug === 'okayama' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">上位地域の特徴や背景、カバー率の見方を詳しく解説しています。</p>
          <Link href="/articles/sufficiency-ranking/okayama" className="text-sm text-primary hover:underline font-medium">岡山県の入所系施設カバー率ランキング｜上位地域の特徴と背景を解説 →</Link>
        </div>
      )}

      {slug === 'hiroshima' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">上位地域の特徴や背景、カバー率の見方を詳しく解説しています。</p>
          <Link href="/articles/sufficiency-ranking/hiroshima" className="text-sm text-primary hover:underline font-medium">広島県の入所系施設カバー率ランキング｜上位地域の特徴と背景を解説 →</Link>
        </div>
      )}

      {slug === 'kagawa' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">上位地域の特徴や背景、カバー率の見方を詳しく解説しています。</p>
          <Link href="/articles/sufficiency-ranking/kagawa" className="text-sm text-primary hover:underline font-medium">香川県の入所系施設カバー率ランキング｜上位地域の特徴と背景を解説 →</Link>
        </div>
      )}

      {slug === 'ehime' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">上位地域の特徴や背景、カバー率の見方を詳しく解説しています。</p>
          <Link href="/articles/sufficiency-ranking/ehime" className="text-sm text-primary hover:underline font-medium">愛媛県の入所系施設カバー率ランキング｜上位地域の特徴と背景を解説 →</Link>
        </div>
      )}

      {slug === 'kumamoto' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">上位地域の特徴や背景、カバー率の見方を詳しく解説しています。</p>
          <Link href="/articles/sufficiency-ranking/kumamoto" className="text-sm text-primary hover:underline font-medium">熊本県の入所系施設カバー率ランキング｜上位地域の特徴と背景を解説 →</Link>
        </div>
      )}

      {slug === 'oita' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">上位地域の特徴や背景、カバー率の見方を詳しく解説しています。</p>
          <Link href="/articles/sufficiency-ranking/oita" className="text-sm text-primary hover:underline font-medium">大分県の入所系施設カバー率ランキング｜上位地域の特徴と背景を解説 →</Link>
        </div>
      )}

      {slug === 'aomori' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">上位地域の特徴や背景、カバー率の見方を詳しく解説しています。</p>
          <Link href="/articles/sufficiency-ranking/aomori" className="text-sm text-primary hover:underline font-medium">青森県の入所系施設カバー率ランキング｜上位地域の特徴と背景を解説 →</Link>
        </div>
      )}

      {slug === 'akita' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">上位地域の特徴や背景、カバー率の見方を詳しく解説しています。</p>
          <Link href="/articles/sufficiency-ranking/akita" className="text-sm text-primary hover:underline font-medium">秋田県の入所系施設カバー率ランキング｜上位地域の特徴と背景を解説 →</Link>
        </div>
      )}

      {slug === 'iwate' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">上位地域の特徴や背景、カバー率の見方を詳しく解説しています。</p>
          <Link href="/articles/sufficiency-ranking/iwate" className="text-sm text-primary hover:underline font-medium">岩手県の入所系施設カバー率ランキング｜上位地域の特徴と背景を解説 →</Link>
        </div>
      )}

      {slug === 'yamagata' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">上位地域の特徴や背景、カバー率の見方を詳しく解説しています。</p>
          <Link href="/articles/sufficiency-ranking/yamagata" className="text-sm text-primary hover:underline font-medium">山形県の入所系施設カバー率ランキング｜上位地域の特徴と背景を解説 →</Link>
        </div>
      )}

      {slug === 'fukushima' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">上位地域の特徴や背景、カバー率の見方を詳しく解説しています。</p>
          <Link href="/articles/sufficiency-ranking/fukushima" className="text-sm text-primary hover:underline font-medium">福島県の入所系施設カバー率ランキング｜上位地域の特徴と背景を解説 →</Link>
        </div>
      )}

      {slug === 'ibaraki' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">上位地域の特徴や背景、カバー率の見方を詳しく解説しています。</p>
          <Link href="/articles/sufficiency-ranking/ibaraki" className="text-sm text-primary hover:underline font-medium">茨城県の入所系施設カバー率ランキング｜上位地域の特徴と背景を解説 →</Link>
        </div>
      )}

      {slug === 'tochigi' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">上位地域の特徴や背景、カバー率の見方を詳しく解説しています。</p>
          <Link href="/articles/sufficiency-ranking/tochigi" className="text-sm text-primary hover:underline font-medium">栃木県の入所系施設カバー率ランキング｜上位地域の特徴と背景を解説 →</Link>
        </div>
      )}

      {slug === 'gunma' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">上位地域の特徴や背景、カバー率の見方を詳しく解説しています。</p>
          <Link href="/articles/sufficiency-ranking/gunma" className="text-sm text-primary hover:underline font-medium">群馬県の入所系施設カバー率ランキング｜上位地域の特徴と背景を解説 →</Link>
        </div>
      )}

      {slug === 'yamanashi' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">上位地域の特徴や背景、カバー率の見方を詳しく解説しています。</p>
          <Link href="/articles/sufficiency-ranking/yamanashi" className="text-sm text-primary hover:underline font-medium">山梨県の入所系施設カバー率ランキング｜上位地域の特徴と背景を解説 →</Link>
        </div>
      )}

      {slug === 'toyama' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">上位地域の特徴や背景、カバー率の見方を詳しく解説しています。</p>
          <Link href="/articles/sufficiency-ranking/toyama" className="text-sm text-primary hover:underline font-medium">富山県の入所系施設カバー率ランキング｜上位地域の特徴と背景を解説 →</Link>
        </div>
      )}

      {slug === 'ishikawa' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">上位地域の特徴や背景、カバー率の見方を詳しく解説しています。</p>
          <Link href="/articles/sufficiency-ranking/ishikawa" className="text-sm text-primary hover:underline font-medium">石川県の入所系施設カバー率ランキング｜上位地域の特徴と背景を解説 →</Link>
        </div>
      )}

      {slug === 'fukui' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">上位地域の特徴や背景、カバー率の見方を詳しく解説しています。</p>
          <Link href="/articles/sufficiency-ranking/fukui" className="text-sm text-primary hover:underline font-medium">福井県の入所系施設カバー率ランキング｜上位地域の特徴と背景を解説 →</Link>
        </div>
      )}

      {slug === 'mie' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">上位地域の特徴や背景、カバー率の見方を詳しく解説しています。</p>
          <Link href="/articles/sufficiency-ranking/mie" className="text-sm text-primary hover:underline font-medium">三重県の入所系施設カバー率ランキング｜上位地域の特徴と背景を解説 →</Link>
        </div>
      )}

      {slug === 'shiga' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">上位地域の特徴や背景、カバー率の見方を詳しく解説しています。</p>
          <Link href="/articles/sufficiency-ranking/shiga" className="text-sm text-primary hover:underline font-medium">滋賀県の入所系施設カバー率ランキング｜上位地域の特徴と背景を解説 →</Link>
        </div>
      )}

      {slug === 'kyoto' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">上位地域の特徴や背景、カバー率の見方を詳しく解説しています。</p>
          <Link href="/articles/sufficiency-ranking/kyoto" className="text-sm text-primary hover:underline font-medium">京都府の入所系施設カバー率ランキング｜上位地域の特徴と背景を解説 →</Link>
        </div>
      )}

      {slug === 'nara' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">上位地域の特徴や背景、カバー率の見方を詳しく解説しています。</p>
          <Link href="/articles/sufficiency-ranking/nara" className="text-sm text-primary hover:underline font-medium">奈良県の入所系施設カバー率ランキング｜上位地域の特徴と背景を解説 →</Link>
        </div>
      )}

      {slug === 'wakayama' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">上位地域の特徴や背景、カバー率の見方を詳しく解説しています。</p>
          <Link href="/articles/sufficiency-ranking/wakayama" className="text-sm text-primary hover:underline font-medium">和歌山県の入所系施設カバー率ランキング｜上位地域の特徴と背景を解説 →</Link>
        </div>
      )}

      {slug === 'tottori' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">上位地域の特徴や背景、カバー率の見方を詳しく解説しています。</p>
          <Link href="/articles/sufficiency-ranking/tottori" className="text-sm text-primary hover:underline font-medium">鳥取県の入所系施設カバー率ランキング｜上位地域の特徴と背景を解説 →</Link>
        </div>
      )}

      {slug === 'shimane' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">上位地域の特徴や背景、カバー率の見方を詳しく解説しています。</p>
          <Link href="/articles/sufficiency-ranking/shimane" className="text-sm text-primary hover:underline font-medium">島根県の入所系施設カバー率ランキング｜上位地域の特徴と背景を解説 →</Link>
        </div>
      )}

      {slug === 'yamaguchi' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">上位地域の特徴や背景、カバー率の見方を詳しく解説しています。</p>
          <Link href="/articles/sufficiency-ranking/yamaguchi" className="text-sm text-primary hover:underline font-medium">山口県の入所系施設カバー率ランキング｜上位地域の特徴と背景を解説 →</Link>
        </div>
      )}

      {slug === 'tokushima' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">上位地域の特徴や背景、カバー率の見方を詳しく解説しています。</p>
          <Link href="/articles/sufficiency-ranking/tokushima" className="text-sm text-primary hover:underline font-medium">徳島県の入所系施設カバー率ランキング｜上位地域の特徴と背景を解説 →</Link>
        </div>
      )}

      {slug === 'kochi' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">上位地域の特徴や背景、カバー率の見方を詳しく解説しています。</p>
          <Link href="/articles/sufficiency-ranking/kochi" className="text-sm text-primary hover:underline font-medium">高知県の入所系施設カバー率ランキング｜上位地域の特徴と背景を解説 →</Link>
        </div>
      )}

      {slug === 'saga' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">上位地域の特徴や背景、カバー率の見方を詳しく解説しています。</p>
          <Link href="/articles/sufficiency-ranking/saga" className="text-sm text-primary hover:underline font-medium">佐賀県の入所系施設カバー率ランキング｜上位地域の特徴と背景を解説 →</Link>
        </div>
      )}

      {slug === 'nagasaki' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">上位地域の特徴や背景、カバー率の見方を詳しく解説しています。</p>
          <Link href="/articles/sufficiency-ranking/nagasaki" className="text-sm text-primary hover:underline font-medium">長崎県の入所系施設カバー率ランキング｜上位地域の特徴と背景を解説 →</Link>
        </div>
      )}

      {slug === 'miyazaki' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">上位地域の特徴や背景、カバー率の見方を詳しく解説しています。</p>
          <Link href="/articles/sufficiency-ranking/miyazaki" className="text-sm text-primary hover:underline font-medium">宮崎県の入所系施設カバー率ランキング｜上位地域の特徴と背景を解説 →</Link>
        </div>
      )}

      {slug === 'kagoshima' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">上位地域の特徴や背景、カバー率の見方を詳しく解説しています。</p>
          <Link href="/articles/sufficiency-ranking/kagoshima" className="text-sm text-primary hover:underline font-medium">鹿児島県の入所系施設カバー率ランキング｜上位地域の特徴と背景を解説 →</Link>
        </div>
      )}

      {slug === 'okinawa' && (
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-base font-bold text-primary mb-2">解説記事</h2>
          <p className="text-sm text-gray-700 mb-2">上位地域の特徴や背景、カバー率の見方を詳しく解説しています。</p>
          <Link href="/articles/sufficiency-ranking/okinawa" className="text-sm text-primary hover:underline font-medium">沖縄県の入所系施設カバー率ランキング｜上位地域の特徴と背景を解説 →</Link>
        </div>
      )}

      <RankingDisclaimer />

      {/* 他の都道府県リンク */}
      <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6 mt-6">
        <h2 className="font-serif text-base font-bold text-primary mb-3">他の都道府県</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {allSlugs.map(({ slug: s, name }) => (
            <Link
              key={s}
              href={`/ranking/sufficiency/${s}`}
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
