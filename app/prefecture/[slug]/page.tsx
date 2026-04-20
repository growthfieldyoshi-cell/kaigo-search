import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCitiesByPref, getPrefectureCareRankings } from "@/lib/queries";
import type { CityRanking } from "@/lib/queries";
import { prefectureFromSlug, getAllPrefectureSlugs } from "@/lib/prefecture-slugs";

export const revalidate = 3600;

const BASE = "https://www.kaigosagashi.jp";

export function generateStaticParams() {
  return getAllPrefectureSlugs().map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const pref = prefectureFromSlug(slug);
  if (!pref) return { title: "ページが見つかりません" };
  const title = `${pref}の介護施設一覧`;
  const description = `${pref}の介護施設を市区町村別に探せます。`;
  return {
    title,
    description,
    openGraph: { title, description },
    alternates: {
      canonical: `${BASE}/prefecture/${slug}`,
    },
  };
}

function ConfidenceBadge({ confidence }: { confidence: string }) {
  if (confidence === 'high') return <span className="text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded-full ml-1">高</span>;
  if (confidence === 'medium') return <span className="text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded-full ml-1">中</span>;
  return <span className="text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full ml-1">参考</span>;
}

function RankingList({
  pref,
  title,
  description,
  items,
  valueKey,
  unit,
  showBadge,
}: {
  pref: string;
  title: string;
  description: string;
  items: CityRanking[];
  valueKey: 'sufficiency_rate' | 'certification_rate';
  unit: string;
  showBadge: boolean;
}) {
  if (items.length === 0) return null;

  return (
    <div>
      <h3 className="text-sm font-bold text-gray-800 mb-1">{title}</h3>
      <p className="text-xs text-gray-500 mb-3">{description}</p>
      <ol className="space-y-1.5">
        {items.map((item, i) => {
          const val = item[valueKey];
          return (
            <li key={item.city_agg} className="flex items-center gap-2 text-sm">
              <span className="text-xs text-gray-400 w-5 text-right">{i + 1}.</span>
              <Link
                href={`/${pref}/${item.city_agg}`}
                className="text-gray-800 hover:text-primary hover:underline flex-1 truncate"
              >
                {item.city_agg}
              </Link>
              <span className="text-gray-600 font-medium tabular-nums whitespace-nowrap">
                {val != null ? val.toFixed(1) : '-'}{unit}
              </span>
              {showBadge && <ConfidenceBadge confidence={item.metric_confidence} />}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export default async function PrefectureSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pref = prefectureFromSlug(slug);
  if (!pref) notFound();

  const [cities, rankings] = await Promise.all([
    getCitiesByPref(pref),
    getPrefectureCareRankings(pref),
  ]);

  const hasRankings = rankings.sufficiencyTop.length > 0 || rankings.certificationTop.length > 0;

  return (
    <>
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-primary">トップ</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-800">{pref}</span>
      </nav>

      <h1 className="font-serif text-2xl font-bold text-primary mb-2">
        {pref}の市区町村
      </h1>
      <p className="text-gray-600 mb-8">
        市区町村を選択してください。
      </p>

      {hasRankings && (
        <section className="bg-bg-card border border-gray-200 rounded-lg px-5 py-4 mb-8">
          <h2 className="font-serif text-base font-bold text-primary mb-4">
            {pref}の介護指標ランキング
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <RankingList
              pref={pref}
              title="入所系施設カバー率 上位"
              description="認定者数に対する入所系施設の定員割合が高い市区町村です。"
              items={rankings.sufficiencyTop}
              valueKey="sufficiency_rate"
              unit="%"
              showBadge={true}
            />
            <RankingList
              pref={pref}
              title="介護認定率 上位"
              description="高齢者に対する要介護認定者の割合が高い市区町村です。"
              items={rankings.certificationTop}
              valueKey="certification_rate"
              unit="%"
              showBadge={false}
            />
          </div>

          <p className="text-xs text-gray-400 mt-4">
            <Link href="/data/metrics" className="hover:text-primary hover:underline">
              指標の計算方法と見方について →
            </Link>
          </p>
        </section>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {cities.map((c) => (
          <Link
            key={c.city}
            href={`/${pref}/${c.city}`}
            className="bg-bg-card border border-gray-200 rounded-lg px-4 py-3 hover:border-accent hover:shadow-md transition-all"
          >
            <span className="font-medium text-gray-800 block">{c.city}</span>
            <span className="text-sm text-gray-500">
              {Number(c.facility_count).toLocaleString()}件
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}
