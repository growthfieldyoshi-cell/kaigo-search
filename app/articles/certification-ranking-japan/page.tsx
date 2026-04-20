import type { Metadata } from "next";
import Link from "next/link";
import { slugFromPrefecture } from "@/lib/prefecture-slugs";

export const metadata: Metadata = {
  title: "介護認定率が高い地域ランキング｜要介護認定が多い市区町村はどこ？【全国版】",
  description:
    "介護認定率が高い地域を全国ランキングで紹介。65歳以上の高齢者に対する要介護認定者の割合が高い市区町村はどこか、その背景と特徴をデータで解説します。",
  openGraph: {
    title: "介護認定率が高い地域ランキング｜要介護認定が多い市区町村はどこ？【全国版】",
    description:
      "全国の介護認定率ランキング。要介護認定者の割合が高い地域を市区町村別に比較。上位地域の特徴と背景を解説します。",
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
  { rank: 1, pref: "福島県", city: "只見町", rate: "92.3" },
  { rank: 2, pref: "宮城県", city: "七ヶ宿町", rate: "86.5" },
  { rank: 3, pref: "長野県", city: "天龍村", rate: "85.8" },
  { rank: 4, pref: "北海道", city: "三笠市", rate: "84.7" },
  { rank: 5, pref: "奈良県", city: "五條市", rate: "84.6" },
  { rank: 6, pref: "大阪府", city: "大阪市", rate: "83.3" },
  { rank: 7, pref: "愛媛県", city: "久万高原町", rate: "83.2" },
  { rank: 8, pref: "群馬県", city: "南牧村", rate: "82.5" },
  { rank: 9, pref: "北海道", city: "小樽市", rate: "80.5" },
  { rank: 10, pref: "鳥取県", city: "日南町", rate: "79.5" },
] as const;

export default function CertificationRankingArticle() {
  return (
    <>
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-primary">トップ</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-800">記事</span>
      </nav>

      <article className="max-w-3xl">
        <h1 className="font-serif text-2xl font-bold text-primary mb-4 leading-tight">
          介護認定率が高い地域ランキング｜要介護認定が多い市区町村はどこ？【全国版】
        </h1>

        <div className="text-sm text-gray-700 leading-relaxed space-y-3 mb-10">
          <p>
            「高齢者が多い地域では、介護サービスの需要はどれくらいあるのだろう」——地域の介護環境を考えるうえで、介護認定率は重要な手がかりになります。
          </p>
          <p>
            この記事では、全国の市区町村を対象に、<strong>介護認定率が高い地域</strong>をランキング形式でご紹介します。介護認定率とは、65歳以上の高齢者のうち要支援・要介護の認定を受けている人の割合です。全国平均は<strong>約56%</strong>で、この数値が高いほど、その地域では介護サービスを必要とする高齢者の割合が多いことを意味します。
          </p>
          <p>
            ただし、認定率が高いことは「良い」「悪い」と単純に評価できるものではありません。高齢化の進行度、人口構成、介護サービスの利用しやすさなど、複数の要因が影響しています。地域の介護事情を多角的に見るための一つの指標としてご覧ください。
          </p>
        </div>

        {/* ── ランキング TOP10 ── */}
        <Section id="ranking" title="介護認定率が高い地域ランキング TOP10">
          <p className="text-xs text-gray-500 mb-2">
            ※65歳以上人口が500人以上の市区町村を対象としています。
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs text-gray-500">
                  <th className="py-2 pr-2 w-10">順位</th>
                  <th className="py-2 pr-2">都道府県</th>
                  <th className="py-2 pr-2">市区町村</th>
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
                    <td className="py-2.5 pr-2 text-right tabular-nums font-medium text-gray-800">{r.rate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p>
            全国平均の56%に対して、上位の地域は80%を超える高い認定率を示しています。1位の福島県只見町は92.3%と、65歳以上の高齢者の9割以上が要介護認定を受けている計算です。
          </p>
          <p className="text-xs text-gray-400">
            TOP50のデータ一覧は
            <Link href="/ranking/certification" className="text-primary hover:underline">認定率ランキングページ</Link>
            で確認できます。
          </p>
        </Section>

        {/* ── 上位5地域の解説 ── */}
        <Section id="top5" title="上位5地域の特徴と背景">
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-gray-800 mb-1">
                1位 福島県 只見町（認定率 92.3%）
              </h3>
              <p>
                福島県南西部の豪雪地帯にある人口約4,000人の町です。65歳以上人口は約1,800人で、そのうち約1,700人が要介護認定を受けています。全国1位の認定率ですが、これは高齢化率の高さに加え、豪雪地帯特有の生活環境が介護需要を押し上げている可能性が考えられます。
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-800 mb-1">
                2位 宮城県 七ヶ宿町（認定率 86.5%）
              </h3>
              <p>
                宮城県南西部の山間地域にある人口約1,200人の町です。65歳以上人口は約550人。東北地方の中山間地域に位置し、高齢化が進んだ典型的な過疎地域です。人口規模が小さいため、わずかな人数の変動で認定率が大きく動く点には留意が必要です。
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-800 mb-1">
                3位 長野県 天龍村（認定率 85.8%）
              </h3>
              <p>
                長野県南端に位置する人口約1,100人の村で、全国的にも高齢化率が高いことで知られています。65歳以上人口は約620人で、介護需要が非常に高い地域です。山間部で医療・介護へのアクセスが限られる中、介護認定を積極的に申請している可能性もあります。
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-800 mb-1">
                4位 北海道 三笠市（認定率 84.7%）
              </h3>
              <p>
                かつて炭鉱で栄えた北海道中部の市で、人口は約7,500人。65歳以上人口は約3,500人です。炭鉱閉山後の人口流出により高齢化が進行した地域で、上位5地域の中では比較的人口規模が大きく、データの安定性が高い地域といえます。
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-800 mb-1">
                5位 奈良県 五條市（認定率 84.6%）
              </h3>
              <p>
                奈良県南部に位置する人口約2万7,000人の市で、65歳以上人口は約10,900人。上位10地域の中では最も人口規模が大きく、認定者数も約9,200人と多い地域です。市街地と山間部が混在する地域構造が特徴で、山間部の高い介護需要が全体の認定率を押し上げている可能性があります。
              </p>
            </div>
          </div>
        </Section>

        {/* ── 共通する傾向 ── */}
        <Section id="trends" title="認定率が高い地域に共通する傾向">
          <p><strong>1. 過疎地域・中山間地域が多い</strong></p>
          <p>
            TOP10のうち多くが山間部や豪雪地帯に位置する町村です。若年層の流出により高齢化が進み、後期高齢者（75歳以上）の割合が特に高い傾向にあります。
          </p>

          <p><strong>2. 大都市も含まれる</strong></p>
          <p>
            6位に大阪市（83.3%）が入っています。人口規模が極めて大きい大都市でも認定率が高い地域はあります。大阪市の場合は、高齢者の単身世帯率の高さや、一部地域の高齢化集中が影響している可能性が指摘されています。
          </p>

          <p><strong>3. 人口規模による数値の振れ幅</strong></p>
          <p>
            人口数百人〜数千人の小規模町村では、少数の認定者の増減で認定率が大きく変動します。一方、人口1万人以上の市では数値が比較的安定しています。ランキングを見る際は、人口規模もあわせて確認するのがおすすめです。
          </p>
        </Section>

        {/* ── 認定率が高い＝問題があるとは限らない ── */}
        <Section id="context" title="認定率が高い＝「問題がある」とは限らない">
          <p>
            認定率はあくまで「介護認定を受けている人の割合」であり、地域の介護環境の良し悪しを直接示すものではありません。以下の点を踏まえて総合的にとらえることが大切です。
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-gray-600">
            <li><strong>認定を受けやすい環境</strong>が整っていることの表れでもあります。相談窓口や申請サポートが充実している地域では、必要な人が適切に認定を受けられている可能性があります。</li>
            <li><strong>介護サービスの利用</strong>は認定を受けてから始まります。認定率が高い地域は、それだけ介護サービスが活用されているともいえます。</li>
            <li>逆に認定率が低い地域でも、<strong>潜在的な介護需要</strong>が見過ごされている可能性があります。</li>
          </ul>
        </Section>

        {/* ── 認定率とカバー率の関係 ── */}
        <Section id="relation" title="認定率とカバー率の関係">
          <p>
            認定率が高い地域では介護サービスの需要が大きいため、入所系施設カバー率にも影響します。認定率が高いのにカバー率が低い地域では、認定者数に対して施設供給が少なめの傾向があります。
          </p>
          <p>
            両方の指標をあわせて見ることで、「需要は多いが施設供給が少なめの地域」と「需要に見合った施設がある地域」を区別できます。カバー率のランキングについては、
            <Link href="/articles/sufficiency-ranking-japan" className="text-primary hover:underline">カバー率が高い地域の記事</Link>
            もあわせてご覧ください。
          </p>
        </Section>

        {/* ── 注意点 ── */}
        <Section id="caution" title="このランキングを見るときの注意点">
          <div className="bg-amber-50 rounded-lg px-4 py-3 space-y-2">
            <ul className="list-disc list-inside space-y-1.5 text-amber-700 text-xs">
              <li>
                認定率は「要介護認定者数 / 65歳以上人口」で算出しています。<strong>要支援1〜要介護5の全認定者</strong>を含みます。
              </li>
              <li>
                小規模自治体では人口変動の影響を受けやすく、<strong>数値が不安定になる場合</strong>があります。
              </li>
              <li>
                認定を受けていても<strong>実際に介護サービスを利用していない方</strong>も含まれます。
              </li>
              <li>
                データは厚生労働省の公表データに基づいていますが、<strong>調査時点と現在で状況が異なる</strong>場合があります。
              </li>
            </ul>
          </div>
          <p className="text-gray-500 text-xs">
            認定率の計算方法について詳しくは、
            <Link href="/data/metrics" className="text-primary hover:underline">指標の解説ページ</Link>
            をご覧ください。
          </p>
        </Section>

        {/* ── まとめ ── */}
        <Section id="summary" title="まとめ">
          <p>
            介護認定率は、地域の介護需要の大きさを知るための重要な指標です。認定率が高い地域には過疎の町村が多い一方、大阪市のような大都市も含まれており、地域ごとに背景は異なります。
          </p>
          <p>
            認定率だけでなく、入所系施設カバー率や在宅サービスの状況もあわせて見ることで、地域の介護環境をより正確に把握できます。各指標の計算方法について詳しくは、
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
            <Link href="/articles/certification-ranking/osaka" className="text-primary hover:underline">
              大阪府の介護認定率ランキング（都道府県別記事）
            </Link>
            <span className="text-xs text-gray-400 ml-1">— 大阪府内の上位地域を詳しく解説</span>
          </li>
          <li>
            <Link href="/articles/certification-ranking/fukushima" className="text-primary hover:underline">
              福島県の介護認定率ランキング（都道府県別記事）
            </Link>
            <span className="text-xs text-gray-400 ml-1">— 福島県内の上位地域を詳しく解説</span>
          </li>
          <li>
            <Link href="/articles/certification-ranking/hokkaido" className="text-primary hover:underline">
              北海道の介護認定率ランキング（都道府県別記事）
            </Link>
            <span className="text-xs text-gray-400 ml-1">— 北海道内の上位地域を詳しく解説</span>
          </li>
          <li>
            <Link href="/articles/certification-ranking" className="text-primary hover:underline font-medium">
              都道府県別の介護認定率記事一覧
            </Link>
            <span className="text-xs text-gray-400 ml-1">— 他の県の記事もこちらから</span>
          </li>
          <li>
            <Link href="/ranking/certification" className="text-primary hover:underline">
              認定率ランキング TOP50（データ一覧）
            </Link>
          </li>
          <li>
            <Link href="/articles/sufficiency-ranking-japan" className="text-primary hover:underline">
              介護施設が充実している地域ランキング（記事）
            </Link>
          </li>
          <li>
            <Link href="/articles/sufficiency-shortage-ranking-japan" className="text-primary hover:underline">
              介護施設が不足している地域ランキング（記事）
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
