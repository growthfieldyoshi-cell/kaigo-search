import type { Metadata } from "next";
import Link from "next/link";
import { slugFromPrefecture } from "@/lib/prefecture-slugs";

export const metadata: Metadata = {
  title: "介護施設が不足している地域ランキング｜カバー率が低い市区町村はどこ？【全国版】",
  description:
    "介護施設のカバー率が低い地域を全国ランキングで紹介。入所系施設の供給が需要に追いついていない市区町村はどこか、その背景と特徴をデータで解説します。",
  openGraph: {
    title: "介護施設が不足している地域ランキング｜カバー率が低い市区町村はどこ？【全国版】",
    description:
      "全国の介護施設カバー率ワーストランキング。入所系施設の供給が不足している地域を市区町村別に比較します。",
  },
};

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-10">
      <h2 className="font-serif text-lg font-bold text-primary mb-3">{title}</h2>
      <div className="text-sm text-gray-700 leading-relaxed space-y-3">{children}</div>
    </section>
  );
}

const BOTTOM10 = [
  { rank: 1, pref: "京都府", city: "京田辺市", rate: "0.9" },
  { rank: 2, pref: "宮城県", city: "東松島市", rate: "0.9" },
  { rank: 3, pref: "愛知県", city: "碧南市", rate: "0.9" },
  { rank: 4, pref: "島根県", city: "大田市", rate: "0.9" },
  { rank: 5, pref: "愛知県", city: "愛西市", rate: "0.9" },
  { rank: 6, pref: "福島県", city: "須賀川市", rate: "0.9" },
  { rank: 7, pref: "兵庫県", city: "三木市", rate: "1.0" },
  { rank: 8, pref: "大阪府", city: "柏原市", rate: "1.0" },
  { rank: 9, pref: "兵庫県", city: "尼崎市", rate: "1.0" },
  { rank: 10, pref: "東京都", city: "福生市", rate: "1.0" },
] as const;

export default function SufficiencyShortageArticle() {
  return (
    <>
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-primary">トップ</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-800">記事</span>
      </nav>

      <article className="max-w-3xl">
        <h1 className="font-serif text-2xl font-bold text-primary mb-4 leading-tight">
          介護施設が不足している地域ランキング｜カバー率が低い市区町村はどこ？【全国版】
        </h1>

        <div className="text-sm text-gray-700 leading-relaxed space-y-3 mb-10">
          <p>
            「老人ホームに空きがない」「入所まで何年も待つ」——介護施設の不足は、多くの家族にとって切実な問題です。
          </p>
          <p>
            この記事では、全国の市区町村を対象に、入所系施設カバー率が低い地域をランキング形式でご紹介します。カバー率とは、要介護認定者数全体に対する入所系施設の定員割合を示す参考指標です。全国平均は<strong>約3.0%</strong>で、分母には在宅サービス利用者も含まれるため数値は構造的に低くなりますが、その中でもさらに低い地域には一定の傾向があります。
          </p>
          <p>
            ただし、カバー率が低いことが「必ずしも悪い」とは限りません。在宅介護サービスが充実している地域や、近隣自治体の施設を利用できる地域もあります。あくまで介護需要と施設供給のバランスを見るための一つの参考指標としてご覧ください。
          </p>
        </div>

        {/* ── ランキング ── */}
        <Section id="ranking" title="介護施設が不足している地域ランキング TOP10（カバー率が低い市区町村）">
          <p className="text-xs text-gray-500 mb-2">
            ※施設数10件以上の市区町村に限定し、データの安定性を確保しています。
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs text-gray-500">
                  <th className="py-2 pr-2 w-10">順位</th>
                  <th className="py-2 pr-2">都道府県</th>
                  <th className="py-2 pr-2">市区町村</th>
                  <th className="py-2 pr-2 text-right">カバー率</th>
                </tr>
              </thead>
              <tbody>
                {BOTTOM10.map((r) => (
                  <tr key={`${r.pref}-${r.city}`} className="border-b border-gray-50">
                    <td className="py-2.5 pr-2 text-gray-400 text-xs">{r.rank}</td>
                    <td className="py-2.5 pr-2 text-gray-600">
                      <Link href={`/prefecture/${slugFromPrefecture(r.pref) ?? r.pref}`} className="hover:text-primary hover:underline">{r.pref}</Link>
                    </td>
                    <td className="py-2.5 pr-2">
                      <Link href={`/${r.pref}/${r.city}`} className="text-gray-800 hover:text-primary hover:underline font-medium">
                        {r.city}
                      </Link>
                    </td>
                    <td className="py-2.5 pr-2 text-right tabular-nums font-medium text-gray-800">{r.rate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p>
            全国平均の3.0%に対して、上位の地域はいずれも<strong>1.0%前後</strong>と、全国平均の3分の1以下の水準です。要介護認定者100人に対して、入所できる施設の定員が1人分にも満たない計算になります。
          </p>
          <p className="text-xs text-gray-400">
            カバー率が高い地域のランキングは
            <Link href="/articles/sufficiency-ranking-japan" className="text-primary hover:underline">カバー率が高い地域の記事</Link>
            をご覧ください。データ一覧は
            <Link href="/ranking/sufficiency" className="text-primary hover:underline">カバー率ランキングページ</Link>
            で確認できます。
          </p>
        </Section>

        {/* ── 上位5地域の解説 ── */}
        <Section id="top5" title="カバー率が低い上位5地域の特徴と背景">
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-gray-800 mb-1">
                1位 <Link href="/京都府/京田辺市" className="text-primary hover:underline">京都府 京田辺市</Link>（カバー率 0.9%）
              </h3>
              <p>
                京都府南部に位置する人口約7万人のベッドタウンです。高齢者人口は約17,700人、要介護認定者は約9,800人。入所系施設は11件ありますが、定員データが確認できた施設の定員合計は88人にとどまります。大阪・京都の通勤圏として人口が増えた地域で、高齢化の進行に施設整備が追いついていない可能性が考えられます。
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-800 mb-1">
                2位 <Link href="/宮城県/東松島市" className="text-primary hover:underline">宮城県 東松島市</Link>（カバー率 0.9%）
              </h3>
              <p>
                仙台市の北東に位置する人口約4万人の市です。東日本大震災で大きな被害を受けた地域でもあります。入所系施設は11件ありますが、定員が確認できた施設のデータは限られています。復興途上で施設整備が進行中の可能性もあり、今後数値が改善する余地がある地域です。
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-800 mb-1">
                3位 <Link href="/愛知県/碧南市" className="text-primary hover:underline">愛知県 碧南市</Link>（カバー率 0.9%）
              </h3>
              <p>
                愛知県三河地方の市で、高齢者人口は約17,400人。グループホーム6件を含む15件の入所系施設がありますが、定員データの収集率が低いことがカバー率を押し下げている可能性があります。実際の供給力は数値以上にある可能性もあり、注意が必要です。
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-800 mb-1">
                4位 <Link href="/島根県/大田市" className="text-primary hover:underline">島根県 大田市</Link>（カバー率 0.9%）
              </h3>
              <p>
                世界遺産・石見銀山を擁する人口約3万人の市です。入所系施設は23件と多いにもかかわらずカバー率が低いのは、定員データの取得率が低いことが主因とみられます。認定率は69.8%と高く、介護需要そのものが大きい地域です。
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-800 mb-1">
                5位 <Link href="/愛知県/愛西市" className="text-primary hover:underline">愛知県 愛西市</Link>（カバー率 0.9%）
              </h3>
              <p>
                名古屋市の西に隣接する人口約6万人の市です。入所系施設は12件ありますが、定員合計は93人で、高齢者人口（約19,200人）に対して少ない水準です。名古屋市への通勤圏として宅地開発が進んだ地域で、高齢化に対する施設供給のタイムラグが生じている可能性があります。
              </p>
            </div>
          </div>
        </Section>

        {/* ── 共通する傾向 ── */}
        <Section id="trends" title="カバー率が低い地域に共通する傾向">
          <p><strong>1. 中規模以上の「市」が多い</strong></p>
          <p>
            カバー率が高い地域には小規模町村が多かったのに対し、低い地域は人口数万人規模の「市」が中心です。人口が多い分だけ要介護認定者数も多くなり、カバー率が低くなりやすい構造があります。
          </p>

          <p><strong>2. 大都市の近郊に位置する地域が多い</strong></p>
          <p>
            京田辺市（京都・大阪圏）、碧南市・愛西市（名古屋圏）、福生市（東京圏）など、大都市のベッドタウンが目立ちます。住宅開発で人口が増えた地域では、施設整備が後追いになるケースがあると考えられます。
          </p>

          <p><strong>3. 定員データの収集率が影響している場合がある</strong></p>
          <p>
            施設は存在するものの、定員データが未入力の施設が多い地域もあります。このような場合、実際の施設供給力よりもカバー率が低く算出されます。ランキングの数値だけで「施設がない」と判断するのは早計です。
          </p>
        </Section>

        {/* ── カバー率が低い＝悪いとは限らない ── */}
        <Section id="context" title="カバー率が低い＝「悪い」とは限らない">
          <p>
            カバー率はあくまで入所系施設の定員と要介護認定者数の比率です。以下の点を踏まえて総合的にとらえることが大切です。
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-gray-600">
            <li>訪問介護やデイサービスなど、<strong>在宅介護サービスが充実している地域</strong>では、入所施設が少なくても介護環境が整っている場合があります。</li>
            <li>隣接する市区町村の施設を利用する<strong>広域利用</strong>が一般的な地域もあります。</li>
            <li>地域包括ケアシステムの推進により、<strong>在宅での介護を重視する方針</strong>の自治体もあります。</li>
          </ul>
        </Section>

        {/* ── 注意点 ── */}
        <Section id="caution" title="このランキングを見るときの注意点">
          <div className="bg-amber-50 rounded-lg px-4 py-3 space-y-2">
            <ul className="list-disc list-inside space-y-1.5 text-amber-700 text-xs">
              <li>
                このカバー率は施設の「定員」をもとに算出しており、<strong>実際の空き状況を反映しているわけではありません</strong>。
              </li>
              <li>
                定員データが未入力の施設は集計に含まれていないため、<strong>実際の供給力よりも低く算出されている可能性</strong>があります。
              </li>
              <li>
                今回のランキングは施設数10件以上の市区町村に限定しています。極端に施設が少ない地域は除外しています。
              </li>
            </ul>
          </div>
          <p className="text-gray-500 text-xs">
            カバー率の計算方法について詳しくは、
            <Link href="/data/metrics" className="text-primary hover:underline">指標の解説ページ</Link>
            をご覧ください。
          </p>
        </Section>

        {/* ── まとめ ── */}
        <Section id="summary" title="まとめ">
          <p>
            カバー率が低い地域は、大都市近郊のベッドタウンや中規模都市に多い傾向が見られます。ただし、定員データの収集率や在宅介護サービスの充実度によって実態は異なるため、数値だけで判断することは避けたいところです。
          </p>
          <p>
            気になる地域があれば、各市区町村の介護施設一覧ページで施設の種類や所在地を確認してみてください。カバー率が高い地域に関心がある方は、
            <Link href="/articles/sufficiency-ranking-japan" className="text-primary hover:underline">カバー率が高い地域の記事</Link>
            もあわせてご覧ください。
          </p>
        </Section>
      </article>

      {/* ── 関連リンク ── */}
      <div className="max-w-3xl bg-bg-card border border-gray-200 rounded-lg px-5 py-4 mt-2">
        <p className="text-sm font-medium text-gray-800 mb-2">関連ページ</p>
        <ul className="text-sm space-y-1.5">
          <li>
            <Link href="/articles/sufficiency-ranking-japan" className="text-primary hover:underline">
              介護施設が充実している地域ランキング（記事）
            </Link>
          </li>
          <li>
            <Link href="/articles/certification-ranking-japan" className="text-primary hover:underline">
              介護認定率が高い地域ランキング（記事）
            </Link>
            <span className="text-xs text-gray-400 ml-1">— 認定率の高い地域の背景を解説</span>
          </li>
          <li>
            <Link href="/ranking/sufficiency" className="text-primary hover:underline">
              カバー率ランキング TOP50（データ一覧）
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
