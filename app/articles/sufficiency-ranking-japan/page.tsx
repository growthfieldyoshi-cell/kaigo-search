import type { Metadata } from "next";
import Link from "next/link";
import { slugFromPrefecture } from "@/lib/prefecture-slugs";

export const metadata: Metadata = {
  title: "介護施設が充実している地域ランキング｜入所系施設が多い市区町村はどこ？【全国版】",
  description:
    "入所系施設カバー率の意味と全国ランキングTOP10を紹介。入所型の老人ホーム・介護施設が充実している地域はどこか、上位5地域の特徴や背景をデータで解説します。",
  openGraph: {
    title: "介護施設が充実している地域ランキング｜入所系施設が多い市区町村はどこ？【全国版】",
    description:
      "全国の入所系施設カバー率ランキング。入所系施設の供給状況を市区町村別に比較。上位地域の特徴と背景を解説します。",
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
  { rank: 1, pref: "山梨県", city: "山中湖村", rate: "26.8" },
  { rank: 2, pref: "熊本県", city: "嘉島町", rate: "22.8" },
  { rank: 3, pref: "鳥取県", city: "日野町", rate: "17.8" },
  { rank: 4, pref: "鳥取県", city: "江府町", rate: "15.9" },
  { rank: 5, pref: "静岡県", city: "小山町", rate: "14.7" },
  { rank: 6, pref: "和歌山県", city: "古座川町", rate: "14.3" },
  { rank: 7, pref: "福島県", city: "磐梯町", rate: "14.3" },
  { rank: 8, pref: "奈良県", city: "御杖村", rate: "14.1" },
  { rank: 9, pref: "埼玉県", city: "長瀞町", rate: "13.4" },
  { rank: 10, pref: "鳥取県", city: "倉吉市", rate: "12.5" },
] as const;

export default function SufficiencyRankingArticle() {
  return (
    <>
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-primary">トップ</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-800">記事</span>
      </nav>

      <article className="max-w-3xl">
        <h1 className="font-serif text-2xl font-bold text-primary mb-4 leading-tight">
          介護施設が充実している地域ランキング｜入所系施設が多い市区町村はどこ？【全国版】
        </h1>

        <div className="text-sm text-gray-700 leading-relaxed space-y-3 mb-10">
          <p>
            「親の介護が必要になったとき、近くに施設はあるのだろうか」「老人ホームや介護施設が充実している地域はどこだろう」——そんな不安や疑問を持つ方は少なくありません。
          </p>
          <p>
            この記事では、全国の市区町村を対象に、入所系施設カバー率が高い地域をランキング形式でご紹介します。「カバー率」とは、要介護認定者数全体に対して入所系施設の定員がどれくらいの割合を占めるかを示す参考指標です。全国平均は<strong>約3.0%</strong>。分母には在宅サービス利用者も含まれるため数値は低く出ますが、数値が高いほど認定者数に対して施設定員が手厚い地域です。
          </p>
          <p>
            地域ごとの入所系施設の供給規模を比較するための目安として、本ランキングを参考にしてみてください。
          </p>
        </div>

        {/* ── ランキング TOP10 ── */}
        <Section id="ranking" title="介護施設が多い地域ランキング TOP10（入所系施設カバー率）">
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
            全国平均の3.0%に対して、上位の地域は10%を大きく超えるカバー率を示しています。1位の山中湖村は全国平均の約9倍、10位の倉吉市でも約4倍の水準です。つまり、上位の地域は全国平均と比べて大幅に施設供給が手厚い地域といえます。
          </p>
          <p className="text-xs text-gray-400">
            TOP50のデータ一覧は
            <Link href="/ranking/sufficiency" className="text-primary hover:underline">カバー率ランキングページ</Link>
            で確認できます。
          </p>
        </Section>

        {/* ── 上位5地域の解説 ── */}
        <Section id="top5" title="上位5地域の特徴と背景">
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-gray-800 mb-1">
                1位 <Link href="/山梨県/山中湖村" className="text-primary hover:underline">山梨県 山中湖村</Link>（カバー率 26.8%）
              </h3>
              <p>
                富士山麓に位置する人口約5,000人の村です。介護老人保健施設「山中湖あんずの森」（定員90人）を中心に、ショートステイやグループホームを合わせて4施設が立地しています。高齢者人口が約1,900人と少ない中に中規模の老健施設があるため、カバー率が非常に高く算出されていると考えられます。観光地としての立地から、広域的な介護拠点として機能している可能性もあります。
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-800 mb-1">
                2位 <Link href="/熊本県/嘉島町" className="text-primary hover:underline">熊本県 嘉島町</Link>（カバー率 22.8%）
              </h3>
              <p>
                熊本市に隣接するベッドタウンで、高齢者人口は約2,500人。特別養護老人ホームやショートステイ施設など6施設が集まっています。定員300人規模のショートステイ施設があることがカバー率を押し上げている要因とみられます。都市近郊に位置するため、近隣自治体からの利用もあり得る地域です。
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-800 mb-1">
                3位 <Link href="/鳥取県/日野町" className="text-primary hover:underline">鳥取県 日野町</Link>（カバー率 17.8%）
              </h3>
              <p>
                鳥取県西部の山間地域にある人口約3,000人の町です。老健施設「おしどり荘」やグループホームなど4施設が整備されています。高齢化率が高く認定率も62.9%と全国平均を上回りますが、施設整備が比較的進んでおり、需要に対する供給のバランスが取れている地域といえそうです。
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-800 mb-1">
                4位 <Link href="/鳥取県/江府町" className="text-primary hover:underline">鳥取県 江府町</Link>（カバー率 15.9%）
              </h3>
              <p>
                大山の南麓に位置する人口約2,500人の町。介護老人保健施設「あやめ」を中心に6施設が所在しています。3位の日野町とともに鳥取県西部にあり、同エリアに介護施設が集中している傾向がうかがえます。
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-800 mb-1">
                5位 <Link href="/静岡県/小山町" className="text-primary hover:underline">静岡県 小山町</Link>（カバー率 14.7%）
              </h3>
              <p>
                御殿場市に隣接する人口約17,000人の町。2つの介護老人保健施設（定員各100人）と有料老人ホーム（定員90人）が立地しており、9施設で計370人超の定員を確保しています。上位5地域の中では最も施設数・定員ともに多く、比較的データの安定性が高い地域です。
              </p>
            </div>
          </div>
        </Section>

        {/* ── 共通する傾向 ── */}
        <Section id="trends" title="上位地域に共通する3つの傾向">
          <p><strong>1. 人口が比較的少ない町村が多い</strong></p>
          <p>
            TOP10のうち9つが町村です。65歳以上の高齢者人口が1,000〜5,000人程度の小規模自治体が中心となっています。唯一の例外は10位の鳥取県倉吉市（高齢者人口 約15,000人、施設数32件）で、中規模都市でも施設が充実している地域はあります。
          </p>

          <p><strong>2. 全国各地に分散している</strong></p>
          <p>
            上位は特定の地方に偏っておらず、関東（埼玉県）、中部（山梨県・静岡県）、近畿（和歌山県・奈良県）、中国（鳥取県）、東北（福島県）、九州（熊本県）と、全国に広がっています。
          </p>

          <p><strong>3. 施設数は少ないが「密度」が高い</strong></p>
          <p>
            上位地域の施設数は3〜9件程度が中心です。大都市のように100件以上の施設があるわけではありませんが、高齢者人口が少ない分、1人あたりの施設定員が手厚くなっています。
          </p>
        </Section>

        {/* ── なぜ小規模自治体が上位に ── */}
        <Section id="why" title="なぜ小規模自治体が上位に入りやすいのか">
          <p>
            これにはいくつかの背景が考えられます。
          </p>
          <p>
            まず、<strong>人口が少ない地域に一定規模の施設ができると、カバー率が一気に高くなる</strong>という構造的な要因があります。たとえば高齢者1,000人の地域に定員100人の施設が1つあれば、それだけでカバー率は10%です。
          </p>
          <p>
            また、地方の町村では<strong>広域的な介護拠点</strong>として施設が整備されているケースもあり、近隣自治体の利用者を受け入れている可能性もあります。
          </p>
          <p>
            一方で、大都市圏は人口集中により要介護認定者数が多く、施設供給が追いつきにくい傾向があります。このため、都市部の自治体はカバー率が低くなりやすい構造があります。
          </p>
        </Section>

        {/* ── 注意点 ── */}
        <Section id="caution" title="このランキングを見るときの注意点">
          <div className="bg-amber-50 rounded-lg px-4 py-3 space-y-2">
            <ul className="list-disc list-inside space-y-1.5 text-amber-700 text-xs">
              <li>
                このカバー率は施設の「定員」をもとに算出しており、<strong>実際の空き状況を反映しているわけではありません</strong>。カバー率が高い地域でも満室の場合がありますし、低い地域でも空きのある施設はあります。
              </li>
              <li>
                定員データが未入力の施設は集計に含まれていないため、<strong>実際の供給力よりも低く算出されている可能性</strong>があります。
              </li>
              <li>
                小規模自治体では施設数が少ないため、1施設の開設・閉鎖で数値が大きく変動する点にもご注意ください。
              </li>
            </ul>
          </div>
          <p className="text-gray-500 text-xs">
            あくまで「地域の介護環境を大まかに把握するための参考指標」としてお役立てください。
          </p>
        </Section>

        {/* ── まとめ ── */}
        <Section id="summary" title="まとめ">
          <p>
            介護施設のカバー率は、地域ごとの介護環境を知るための一つの手がかりです。カバー率が高い地域には小規模な町村が多い一方、10位の倉吉市のように中規模都市でも施設が充実している地域は存在します。
          </p>
          <p>
            気になる地域があれば、各市区町村の介護施設一覧ページで施設の種類や所在地を確認してみてください。カバー率や認定率の計算方法について詳しく知りたい方は、
            <Link href="/data/metrics" className="text-primary hover:underline">指標の解説ページ</Link>
            もあわせてご覧ください。
          </p>
        </Section>
      </article>

      {/* ── 関連リンク ── */}
      <div className="max-w-3xl bg-bg-card border border-gray-200 rounded-lg px-5 py-4 mt-2">
        <p className="text-sm font-medium text-gray-800 mb-2">関連ページ</p>
        <ul className="text-sm space-y-1.5">
          <li>
            <Link href="/articles/sufficiency-shortage-ranking-japan" className="text-primary hover:underline">
              介護施設が不足している地域ランキング（記事）
            </Link>
            <span className="text-xs text-gray-400 ml-1">— カバー率が低い地域の背景を解説</span>
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

      {/* ── 記事内で紹介した市区町村 ── */}
      <div className="max-w-3xl bg-bg-card border border-gray-200 rounded-lg px-5 py-4 mt-3">
        <p className="text-sm font-medium text-gray-800 mb-2">この記事で紹介した市区町村</p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {TOP10.map((r) => (
            <Link key={`${r.pref}-${r.city}`} href={`/${r.pref}/${r.city}`} className="text-primary hover:underline">
              {r.pref}{r.city}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
