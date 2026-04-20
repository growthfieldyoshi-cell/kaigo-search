import type { Metadata } from "next";
import Link from "next/link";
import { slugFromPrefecture } from "@/lib/prefecture-slugs";

export const metadata: Metadata = {
  title: "要介護認定者数が多い市区町村ランキング｜全国の介護需要が大きい地域はどこ？【全国版】",
  description:
    "要介護認定者数が多い市区町村を全国ランキングで紹介。人口規模の大きい都市が上位に入ります。認定率とは異なる、介護需要の絶対量を把握するための参考データです。",
  openGraph: {
    title: "要介護認定者数が多い市区町村ランキング【全国版】",
    description:
      "要介護認定者数が多い市区町村を全国ランキングで紹介。介護需要の絶対量を地域別に比較します。",
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

const TOP10 = [
  { rank: 1, pref: "神奈川県", city: "横浜市", count: 564936, rate: "60.1" },
  { rank: 2, pref: "大阪府", city: "大阪市", count: 561728, rate: "83.3" },
  { rank: 3, pref: "北海道", city: "札幌市", count: 361880, rate: "65.1" },
  { rank: 4, pref: "愛知県", city: "名古屋市", count: 360362, rate: "62.7" },
  { rank: 5, pref: "京都府", city: "京都市", count: 299247, rate: "76.2" },
  { rank: 6, pref: "兵庫県", city: "神戸市", count: 287900, rate: "66.3" },
  { rank: 7, pref: "福岡県", city: "福岡市", count: 219312, rate: "61.5" },
  { rank: 8, pref: "福岡県", city: "北九州市", count: 199310, rate: "68.8" },
  { rank: 9, pref: "神奈川県", city: "川崎市", count: 189707, rate: "61.2" },
  { rank: 10, pref: "広島県", city: "広島市", count: 180428, rate: "58.3" },
] as const;

export default function CertificationCountRankingArticle() {
  return (
    <>
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-primary">トップ</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-800">記事</span>
      </nav>

      <article className="max-w-3xl">
        <h1 className="font-serif text-2xl font-bold text-primary mb-4 leading-tight">
          要介護認定者数が多い市区町村ランキング｜全国の介護需要が大きい地域はどこ？【全国版】
        </h1>

        <div className="text-sm text-gray-700 leading-relaxed space-y-3 mb-10">
          <p>
            「介護サービスの需要が大きい地域はどこだろう」——地域の介護事情を知るうえで、要介護認定者の数は基本的な情報のひとつです。
          </p>
          <p>
            この記事では、全国の市区町村を対象に、<strong>要介護認定者数が多い地域</strong>をランキング形式でご紹介します。認定者数は、要支援1〜要介護5の認定を受けている方の合計です。
          </p>
          <p>
            ただし、認定者数は<strong>人口規模に強く影響される指標</strong>です。人口の多い大都市が上位に入るのは当然であり、認定者数が多いこと自体が「問題」を意味するわけではありません。人口あたりの割合を見たい場合は<Link href="/articles/certification-ranking-japan" className="text-primary hover:underline">認定率ランキング</Link>をご参照ください。
          </p>
        </div>

        {/* ── ランキング TOP10 ── */}
        <Section id="ranking" title="要介護認定者数ランキング TOP10">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs text-gray-500">
                  <th className="py-2 pr-2 w-10">順位</th>
                  <th className="py-2 pr-2">都道府県</th>
                  <th className="py-2 pr-2">市区町村</th>
                  <th className="py-2 pr-2 text-right">認定者数</th>
                  <th className="py-2 pr-2 text-right">認定率</th>
                </tr>
              </thead>
              <tbody>
                {TOP10.map((r) => (
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
                    <td className="py-2.5 pr-2 text-right tabular-nums font-medium text-gray-800">{r.count.toLocaleString()}人</td>
                    <td className="py-2.5 pr-2 text-right tabular-nums text-gray-500 text-xs">{r.rate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            上位はすべて政令指定都市です。1位の横浜市（約56.5万人）と2位の大阪市（約56.2万人）はほぼ同規模で、3位以下とは大きな差があります。
          </p>
        </Section>

        {/* ── 上位5地域 ── */}
        <Section id="top5" title="上位5地域の特徴と背景">
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-gray-800 mb-1">
                1位 <Link href="/神奈川県/横浜市" className="text-primary hover:underline">神奈川県 横浜市</Link>（約56.5万人）
              </h3>
              <p>
                日本最大の市で65歳以上人口は約93.9万人。認定率は60.1%で全国平均をやや上回る程度ですが、高齢者人口の絶対数が多いため認定者数も突出しています。介護施設は約5,000件と全国最多級です。
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800 mb-1">
                2位 <Link href="/大阪府/大阪市" className="text-primary hover:underline">大阪府 大阪市</Link>（約56.2万人）
              </h3>
              <p>
                西日本最大の都市で65歳以上人口は約67.5万人。認定率は83.3%と全国的にも非常に高い水準で、高い認定率と大きな人口の両方が認定者数を押し上げています。介護施設は約6,700件です。
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800 mb-1">
                3位 <Link href="/北海道/札幌市" className="text-primary hover:underline">北海道 札幌市</Link>（約36.2万人）
              </h3>
              <p>
                北海道の人口の約3分の1が集中する都市で、65歳以上人口は約55.6万人。認定率65.1%は全国平均を上回っており、北海道全体の介護需要の中心となっています。
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800 mb-1">
                4位 <Link href="/愛知県/名古屋市" className="text-primary hover:underline">愛知県 名古屋市</Link>（約36.0万人）
              </h3>
              <p>
                中部地方最大の都市で65歳以上人口は約57.4万人。認定率は62.7%と、横浜市・札幌市と同程度の水準です。介護施設は約4,400件と中部圏最多です。
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800 mb-1">
                5位 <Link href="/京都府/京都市" className="text-primary hover:underline">京都府 京都市</Link>（約29.9万人）
              </h3>
              <p>
                65歳以上人口は約39.3万人で、認定率76.2%は政令市の中でも特に高い水準です。人口規模は4位までの都市より小さいものの、高い認定率が認定者数を押し上げています。
              </p>
            </div>
          </div>
        </Section>

        {/* ── 傾向 ── */}
        <Section id="trends" title="ランキングに見られる傾向">
          <p><strong>1. 上位はすべて政令指定都市</strong></p>
          <p>
            TOP10はすべて政令指定都市です。認定者数は人口規模に強く依存するため、人口集中地域が上位に入るのは構造的な特徴です。
          </p>
          <p><strong>2. 認定率が高い都市は認定者数も多くなりやすい</strong></p>
          <p>
            大阪市（認定率83.3%）や京都市（76.2%）のように、人口規模に加えて認定率が高い都市は、認定者数がさらに大きくなります。一方、横浜市（60.1%）は認定率は全国平均に近いものの、人口の大きさで1位に入っています。
          </p>
          <p><strong>3. 認定者数が多い＝介護体制が不十分とは限らない</strong></p>
          <p>
            認定者数が多い大都市は、同時に介護施設や在宅サービスの供給も多い傾向があります。認定者数だけでなく、施設数やカバー率と組み合わせて地域の介護環境を見ることが大切です。
          </p>
        </Section>

        {/* ── 注意点 ── */}
        <Section id="caution" title="このランキングを見るときの注意点">
          <div className="bg-amber-50 rounded-lg px-4 py-3 space-y-2">
            <ul className="list-disc list-inside space-y-1.5 text-amber-700 text-xs">
              <li>
                認定者数は<strong>人口規模の影響を強く受ける指標</strong>です。人口の多い都市が上位に入るのは当然であり、ランキング順位だけで地域の介護環境を判断することは避けてください。
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
            要介護認定者数は、地域の介護需要の規模感を把握するための基本指標です。大都市が上位に入るのは自然なことですが、認定率やカバー率と組み合わせることで、地域ごとの介護環境をより立体的に理解できます。
          </p>
          <p>
            各指標の計算方法について詳しくは、
            <Link href="/data/metrics" className="text-primary hover:underline">指標の解説ページ</Link>
            をご覧ください。認定率のランキングについては、
            <Link href="/articles/certification-ranking-japan" className="text-primary hover:underline">認定率ランキング（全国版）</Link>
            もあわせてどうぞ。
          </p>
        </Section>
      </article>

      {/* ── 関連リンク ── */}
      <div className="max-w-3xl bg-bg-card border border-gray-200 rounded-lg px-5 py-4 mt-2">
        <p className="text-sm font-medium text-gray-800 mb-2">関連ページ</p>
        <ul className="text-sm space-y-1.5">
          <li>
            <Link href="/articles/certification-ranking-japan" className="text-primary hover:underline">
              介護認定率が高い地域ランキング（全国版）
            </Link>
          </li>
          <li>
            <Link href="/articles/sufficiency-ranking-japan" className="text-primary hover:underline">
              入所系施設カバー率が高い地域ランキング（全国版）
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
        </ul>
      </div>
    </>
  );
}
