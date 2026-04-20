import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getArticleData,
  getAllArticleSlugs,
} from "@/lib/article-data/certification-ranking";

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
  const title = `${data.prefecture}の介護認定率ランキング｜要介護認定が多い市区町村はどこ？`;
  const description = `${data.prefecture}の介護認定率ランキング。65歳以上の高齢者に対する要介護認定者の割合が高い市区町村はどこか、上位地域の特徴と背景をデータで解説します。`;
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

export default async function PrefCertificationArticle({
  params,
}: {
  params: Promise<{ prefecture: string }>;
}) {
  const { prefecture: slug } = await params;
  const data = getArticleData(slug);
  if (!data) notFound();

  const { prefecture, prefAvgRate, top10, top5Descriptions, prefTrends } = data;

  return (
    <>
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-primary">
          トップ
        </Link>
        <span className="mx-2">›</span>
        <Link
          href="/articles/certification-ranking-japan"
          className="hover:text-primary"
        >
          認定率ランキング（全国版）
        </Link>
        <span className="mx-2">›</span>
        <span className="text-gray-800">{prefecture}</span>
      </nav>

      <article className="max-w-3xl">
        <h1 className="font-serif text-2xl font-bold text-primary mb-4 leading-tight">
          {prefecture}の介護認定率ランキング｜要介護認定が多い市区町村はどこ？
        </h1>

        <div className="text-sm text-gray-700 leading-relaxed space-y-3 mb-10">
          <p>
            「{prefecture}で介護サービスの需要が高い地域はどこだろう」——地域の介護事情を知るうえで、介護認定率は重要な手がかりになります。
          </p>
          <p>
            この記事では、{prefecture}の市区町村を対象に、
            <strong>介護認定率が高い地域</strong>
            をランキング形式でご紹介します。介護認定率とは、65歳以上の高齢者のうち要支援・要介護の認定を受けている人の割合です。全国平均は
            <strong>約56%</strong>、{prefecture}の平均は
            <strong>約{prefAvgRate}%</strong>
            です。
          </p>
          <p>
            ただし、認定率が高いことは「良い」「悪い」と単純に評価できるものではありません。高齢化の進行度、人口構成、介護サービスの利用しやすさなど、複数の要因が影響しています。地域の介護事情を多角的に見るための一つの指標としてご覧ください。
          </p>
        </div>

        {/* ── ランキング ── */}
        <Section
          id="ranking"
          title={`${prefecture}の介護認定率ランキング TOP10`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs text-gray-500">
                  <th className="py-2 pr-2 w-10">順位</th>
                  <th className="py-2 pr-2">市区町村</th>
                  <th className="py-2 pr-2 text-right">認定率</th>
                </tr>
              </thead>
              <tbody>
                {top10.map((r) => (
                  <tr
                    key={r.city}
                    className="border-b border-gray-50"
                  >
                    <td className="py-2.5 pr-2 text-gray-400 text-xs">
                      {r.rank}
                    </td>
                    <td className="py-2.5 pr-2">
                      <Link
                        href={`/${prefecture}/${r.city}`}
                        className="text-gray-800 hover:text-primary hover:underline font-medium"
                      >
                        {r.city}
                      </Link>
                    </td>
                    <td className="py-2.5 pr-2 text-right tabular-nums font-medium text-gray-800">
                      {r.rate}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p>
            {prefecture}の平均認定率は{prefAvgRate}%で、全国平均（約56%）を上回っています。
            1位の{top10[0].city}は{top10[0].rate}%と、{prefecture}
            平均をさらに大きく超える水準です。
          </p>
          <p className="text-xs text-gray-400">
            データ一覧は
            <Link
              href={`/ranking/certification/${slug}`}
              className="text-primary hover:underline"
            >
              {prefecture}の認定率ランキングページ
            </Link>
            で確認できます。
          </p>
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
                  （認定率 {d.rate}%）
                </h3>
                <p>{d.text}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ── 県の傾向 ── */}
        <Section
          id="trends"
          title={`${prefecture}の認定率にみられる傾向`}
        >
          {prefTrends.map((t) => (
            <div key={t.title}>
              <p>
                <strong>{t.title}</strong>
              </p>
              <p>{t.text}</p>
            </div>
          ))}
        </Section>

        {/* ── 共通パート: 認定率が高い＝問題とは限らない ── */}
        <Section
          id="context"
          title="認定率が高い＝「問題がある」とは限らない"
        >
          <p>
            認定率はあくまで「介護認定を受けている人の割合」であり、地域の介護環境の良し悪しを直接示すものではありません。以下の点を踏まえて総合的にとらえることが大切です。
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-gray-600">
            <li>
              <strong>認定を受けやすい環境</strong>
              が整っていることの表れでもあります。相談窓口や申請サポートが充実している地域では、必要な人が適切に認定を受けられている可能性があります。
            </li>
            <li>
              <strong>介護サービスの利用</strong>
              は認定を受けてから始まります。認定率が高い地域は、それだけ介護サービスが活用されているともいえます。
            </li>
            <li>
              逆に認定率が低い地域でも、
              <strong>潜在的な介護需要</strong>
              が見過ごされている可能性があります。
            </li>
          </ul>
        </Section>

        {/* ── 共通パート: 注意点 ── */}
        <Section id="caution" title="このランキングを見るときの注意点">
          <div className="bg-amber-50 rounded-lg px-4 py-3 space-y-2">
            <ul className="list-disc list-inside space-y-1.5 text-amber-700 text-xs">
              <li>
                認定率は「要介護認定者数 / 65歳以上人口」で算出しています。
                <strong>要支援1〜要介護5の全認定者</strong>を含みます。
              </li>
              <li>
                小規模自治体では人口変動の影響を受けやすく、
                <strong>数値が不安定になる場合</strong>があります。
              </li>
              <li>
                データは厚生労働省の公表データに基づいていますが、
                <strong>調査時点と現在で状況が異なる</strong>場合があります。
              </li>
            </ul>
          </div>
          <p className="text-gray-500 text-xs">
            認定率の計算方法について詳しくは、
            <Link
              href="/data/metrics"
              className="text-primary hover:underline"
            >
              指標の解説ページ
            </Link>
            をご覧ください。
          </p>
        </Section>

        {/* ── まとめ ── */}
        <Section id="summary" title="まとめ">
          <p>
            {prefecture}
            は認定率が全国平均を上回る地域で、上位の市町村にはそれぞれ異なる背景があります。人口規模や地域特性によって事情はさまざまですが、介護サービスの需要が大きい地域が多く含まれています。
          </p>
          <p>
            各指標の計算方法について詳しくは、
            <Link
              href="/data/metrics"
              className="text-primary hover:underline"
            >
              指標の解説ページ
            </Link>
            をご覧ください。全国版のランキングについては、
            <Link
              href="/articles/certification-ranking-japan"
              className="text-primary hover:underline"
            >
              全国版の認定率記事
            </Link>
            もあわせてどうぞ。
          </p>
        </Section>
      </article>

      {/* ── 関連リンク ── */}
      <div className="max-w-3xl bg-bg-card border border-gray-200 rounded-lg px-5 py-4 mt-2">
        <p className="text-sm font-medium text-gray-800 mb-2">関連ページ</p>
        <ul className="text-sm space-y-1.5">
          <li>
            <Link
              href={`/ranking/certification/${slug}`}
              className="text-primary hover:underline"
            >
              {prefecture}の認定率ランキング TOP50（データ一覧）
            </Link>
          </li>
          <li>
            <Link
              href="/articles/certification-ranking-japan"
              className="text-primary hover:underline"
            >
              介護認定率が高い地域ランキング（全国版）
            </Link>
          </li>
          <li>
            <Link
              href="/data/metrics"
              className="text-primary hover:underline"
            >
              指標の計算方法と見方について
            </Link>
          </li>
          <li>
            <Link
              href={`/prefecture/${slug}`}
              className="text-primary hover:underline"
            >
              {prefecture}の介護施設一覧
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
}
