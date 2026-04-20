import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getArticleData,
  getAllArticleSlugs,
} from "@/lib/article-data/sufficiency-ranking";

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
  const title = `${data.prefecture}の入所系施設カバー率ランキング｜入所系施設が充実している地域はどこ？`;
  const description = `${data.prefecture}の入所系施設カバー率ランキング。入所系施設の定員と認定者数の比率から、施設供給が手厚い市区町村を解説します。`;
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

export default async function PrefSufficiencyArticle({
  params,
}: {
  params: Promise<{ prefecture: string }>;
}) {
  const { prefecture: slug } = await params;
  const data = getArticleData(slug);
  if (!data) notFound();

  const { prefecture, prefAvgSufficiency, top10, top5Descriptions, prefTrends } = data;

  return (
    <>
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-primary">
          トップ
        </Link>
        <span className="mx-2">›</span>
        <Link
          href="/articles/sufficiency-ranking-japan"
          className="hover:text-primary"
        >
          カバー率ランキング（全国版）
        </Link>
        <span className="mx-2">›</span>
        <span className="text-gray-800">{prefecture}</span>
      </nav>

      <article className="max-w-3xl">
        <h1 className="font-serif text-2xl font-bold text-primary mb-4 leading-tight">
          {prefecture}の入所系施設カバー率ランキング｜入所系施設が充実している地域はどこ？
        </h1>

        <div className="text-sm text-gray-700 leading-relaxed space-y-3 mb-10">
          <p>
            「{prefecture}で介護施設が充実している地域はどこだろう」——施設探しの第一歩として、地域ごとの施設供給状況は重要な情報です。
          </p>
          <p>
            この記事では、{prefecture}の市区町村を対象に、
            <strong>入所系施設カバー率が高い地域</strong>
            をランキング形式でご紹介します。カバー率とは、要介護認定者数全体に対する入所系施設の定員割合です。分母には在宅サービス利用者も含まれるため数値は低く出ますが、地域の施設供給規模を比較するための参考指標です。全国平均は
            <strong>約3.0%</strong>、{prefecture}の平均は
            <strong>約{prefAvgSufficiency}%</strong>
            です。
          </p>
          <p>
            ただし、カバー率が高いことは「入所しやすい」と直接意味するわけではありません。定員ベースの指標であり、実際の空き状況は反映されていません。施設供給の手厚さを大まかに把握するための参考指標としてご覧ください。
          </p>
        </div>

        {/* ── ランキング ── */}
        <Section
          id="ranking"
          title={`${prefecture}の入所系施設カバー率ランキング TOP10`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs text-gray-500">
                  <th className="py-2 pr-2 w-10">順位</th>
                  <th className="py-2 pr-2">市区町村</th>
                  <th className="py-2 pr-2 text-right">カバー率</th>
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
            {prefecture}の平均カバー率は{prefAvgSufficiency}%で、全国平均（約3.0%）を下回っています。
            1位の{top10[0].city}は{top10[0].rate}%と、{prefecture}
            平均を大きく上回る水準です。
          </p>
          <p className="text-xs text-gray-400">
            データ一覧は
            <Link
              href={`/ranking/sufficiency/${slug}`}
              className="text-primary hover:underline"
            >
              {prefecture}のカバー率ランキングページ
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
                  （カバー率 {d.rate}%）
                </h3>
                <p>{d.text}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ── 県の傾向 ── */}
        <Section
          id="trends"
          title={`${prefecture}のカバー率にみられる傾向`}
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

        {/* ── カバー率が高い＝入りやすいとは限らない ── */}
        <Section
          id="context"
          title="カバー率が高い＝「入りやすい」とは限らない"
        >
          <p>
            カバー率はあくまで「入所系施設の定員 / 要介護認定者数全体」で算出した指標であり、実際の入所のしやすさを直接示すものではありません。分母には在宅サービスのみ利用している方も含まれるため、数値は構造的に低くなります。以下の点を踏まえて総合的にとらえることが大切です。
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-gray-600">
            <li>
              カバー率が高くても、<strong>施設が満室</strong>であれば入所できません。空き状況は施設に直接確認する必要があります。
            </li>
            <li>
              <strong>施設の種類や費用</strong>はさまざまです。特別養護老人ホーム、介護老人保健施設、グループホームなど、施設ごとに入所条件や費用が異なります。
            </li>
            <li>
              逆にカバー率が低い地域でも、<strong>近隣自治体の施設</strong>を利用できるケースが多くあります。介護施設の利用は居住地に限定されません。
            </li>
          </ul>
        </Section>

        {/* ── 注意点 ── */}
        <Section id="caution" title="このランキングを見るときの注意点">
          <div className="bg-amber-50 rounded-lg px-4 py-3 space-y-2">
            <ul className="list-disc list-inside space-y-1.5 text-amber-700 text-xs">
              <li>
                カバー率は施設の「定員」をもとに算出しています。
                <strong>実際の空き状況を反映しているわけではありません</strong>。
              </li>
              <li>
                定員データが未入力の施設は集計に含まれていないため、
                <strong>実際の供給力よりも低く算出されている可能性</strong>があります。
              </li>
              <li>
                小規模自治体では施設数が少ないため、
                <strong>1施設の開設・閉鎖で数値が大きく変動する</strong>点にもご注意ください。
              </li>
              <li>
                データは厚生労働省の公表データに基づいていますが、
                <strong>調査時点と現在で状況が異なる</strong>場合があります。
              </li>
            </ul>
          </div>
          <p className="text-gray-500 text-xs">
            カバー率の計算方法について詳しくは、
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
            のカバー率は全国平均を下回る地域が多いですが、上位の市町村にはそれぞれ異なる背景があります。小規模自治体でカバー率が高く出やすい面がある一方、箕面市や大東市のように一定の人口規模を持つ地域でも施設供給が手厚いケースがあります。
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
              href="/articles/sufficiency-ranking-japan"
              className="text-primary hover:underline"
            >
              全国版のカバー率記事
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
              href={`/ranking/sufficiency/${slug}`}
              className="text-primary hover:underline"
            >
              {prefecture}のカバー率ランキング TOP50（データ一覧）
            </Link>
          </li>
          <li>
            <Link
              href="/articles/sufficiency-ranking-japan"
              className="text-primary hover:underline"
            >
              介護施設が充実している地域ランキング（全国版）
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
              href="/guides/care-service-types"
              className="text-primary hover:underline"
            >
              介護サービスの種類と選び方
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
