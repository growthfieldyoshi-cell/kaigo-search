import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getArticleData,
  getAllArticleSlugs,
} from "@/lib/article-data/certification-count-ranking";

export function generateStaticParams() {
  return getAllArticleSlugs().map((slug) => ({ prefecture: slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ prefecture: string }>;
}): Promise<Metadata> {
  const { prefecture: slug } = await params;
  const data = getArticleData(slug);
  if (!data) return { title: "ページが見つかりません" };
  const title = `${data.prefecture}の要介護認定者数ランキング｜介護需要が大きい市区町村はどこ？`;
  const description = `${data.prefecture}の要介護認定者数ランキング。認定者数が多い市区町村と、その背景・特徴をデータで解説します。`;
  return { title, description, openGraph: { title, description } };
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mb-10">
      <h2 className="font-serif text-lg font-bold text-primary mb-3">
        {title}
      </h2>
      <div className="text-sm text-gray-700 leading-relaxed space-y-3">
        {children}
      </div>
    </section>
  );
}

export default async function PrefCountArticle({
  params,
}: {
  params: Promise<{ prefecture: string }>;
}) {
  const { prefecture: slug } = await params;
  const data = getArticleData(slug);
  if (!data) notFound();

  const { prefecture, prefTotalCount, top10, top5Descriptions, prefTrends } = data;
  const totalFormatted = Number(prefTotalCount).toLocaleString();

  return (
    <>
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-primary">トップ</Link>
        <span className="mx-2">›</span>
        <Link href="/articles/certification-count-ranking-japan" className="hover:text-primary">
          認定者数ランキング（全国版）
        </Link>
        <span className="mx-2">›</span>
        <span className="text-gray-800">{prefecture}</span>
      </nav>

      <article className="max-w-3xl">
        <h1 className="font-serif text-2xl font-bold text-primary mb-4 leading-tight">
          {prefecture}の要介護認定者数ランキング｜介護需要が大きい市区町村はどこ？
        </h1>

        <div className="text-sm text-gray-700 leading-relaxed space-y-3 mb-10">
          <p>
            この記事では、{prefecture}の市区町村を対象に、
            <strong>要介護認定者数が多い地域</strong>
            をランキング形式でご紹介します。{prefecture}全体の認定者数は約<strong>{totalFormatted}人</strong>です。
          </p>
          <p>
            認定者数は人口規模に強く影響される指標です。人口の多い都市が上位に入るのは自然なことであり、認定者数が多いこと自体が問題を意味するわけではありません。人口あたりの割合で見たい場合は<Link href={`/articles/certification-ranking/${slug}`} className="text-primary hover:underline">認定率ランキング</Link>をご参照ください。
          </p>
        </div>

        {/* ── ランキング ── */}
        <Section id="ranking" title={`${prefecture}の要介護認定者数ランキング TOP10`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs text-gray-500">
                  <th className="py-2 pr-2 w-10">順位</th>
                  <th className="py-2 pr-2">市区町村</th>
                  <th className="py-2 pr-2 text-right">認定者数</th>
                  <th className="py-2 pr-2 text-right">認定率</th>
                </tr>
              </thead>
              <tbody>
                {top10.map((r) => (
                  <tr key={r.city} className="border-b border-gray-50">
                    <td className="py-2.5 pr-2 text-gray-400 text-xs">{r.rank}</td>
                    <td className="py-2.5 pr-2">
                      <Link
                        href={`/${prefecture}/${r.city}`}
                        className="text-gray-800 hover:text-primary hover:underline font-medium"
                      >
                        {r.city}
                      </Link>
                    </td>
                    <td className="py-2.5 pr-2 text-right tabular-nums font-medium text-gray-800">
                      {r.count.toLocaleString()}人
                    </td>
                    <td className="py-2.5 pr-2 text-right tabular-nums text-gray-500 text-xs">
                      {r.rate}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* ── 上位5地域 ── */}
        <Section id="top5" title="上位5地域の特徴と背景">
          <div className="space-y-6">
            {top5Descriptions.map((d, i) => (
              <div key={d.city}>
                <h3 className="text-sm font-bold text-gray-800 mb-1">
                  {i + 1}位{" "}
                  <Link
                    href={`/${prefecture}/${d.city}`}
                    className="text-primary hover:underline"
                  >
                    {d.city}
                  </Link>
                  （{d.count.toLocaleString()}人）
                </h3>
                <p>{d.text}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ── 傾向 ── */}
        <Section id="trends" title={`${prefecture}の認定者数にみられる傾向`}>
          {prefTrends.map((t) => (
            <div key={t.title}>
              <p><strong>{t.title}</strong></p>
              <p>{t.text}</p>
            </div>
          ))}
        </Section>

        {/* ── 注意点 ── */}
        <Section id="caution" title="このランキングを見るときの注意点">
          <div className="bg-amber-50 rounded-lg px-4 py-3 space-y-2">
            <ul className="list-disc list-inside space-y-1.5 text-amber-700 text-xs">
              <li>
                認定者数は<strong>人口規模の影響を強く受ける指標</strong>です。人口の多い都市が上位に入るのは当然です。
              </li>
              <li>
                人口あたりの割合で比較したい場合は、<strong>認定率</strong>（認定者数 / 65歳以上人口）をご参照ください。
              </li>
              <li>
                データは厚生労働省の公表データに基づいていますが、<strong>調査時点と現在で状況が異なる</strong>場合があります。
              </li>
            </ul>
          </div>
        </Section>

        {/* ── まとめ ── */}
        <Section id="summary" title="まとめ">
          <p>
            {prefecture}の認定者数は、人口規模に比例して都市部に集中しています。認定者数は介護需要の規模感を把握する指標であり、認定率やカバー率と組み合わせることで地域の介護環境をより立体的に理解できます。
          </p>
          <p>
            各指標の計算方法について詳しくは、
            <Link href="/data/metrics" className="text-primary hover:underline">指標の解説ページ</Link>
            をご覧ください。
          </p>
        </Section>
      </article>

      {/* ── 関連リンク ── */}
      <div className="max-w-3xl bg-bg-card border border-gray-200 rounded-lg px-5 py-4 mt-2">
        <p className="text-sm font-medium text-gray-800 mb-2">関連ページ</p>
        <ul className="text-sm space-y-1.5">
          <li>
            <Link href={`/articles/certification-ranking/${slug}`} className="text-primary hover:underline">
              {prefecture}の認定率ランキング（記事）
            </Link>
          </li>
          <li>
            <Link href="/articles/certification-count-ranking-japan" className="text-primary hover:underline">
              認定者数ランキング（全国版）
            </Link>
          </li>
          <li>
            <Link href="/data/metrics" className="text-primary hover:underline">
              指標の計算方法と見方について
            </Link>
          </li>
          <li>
            <Link href={`/prefecture/${slug}`} className="text-primary hover:underline">
              {prefecture}の介護施設一覧
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
}
