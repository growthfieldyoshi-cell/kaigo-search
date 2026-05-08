import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "入所系施設カバー率とは？計算方法と見方をわかりやすく解説",
  description:
    "入所系施設カバー率の意味・計算方法・見方を解説。要介護認定者全体に対する入所系施設の定員割合を示す参考指標です。介護認定率との違い、注意点もわかりやすく説明します。",
  openGraph: {
    title: "入所系施設カバー率とは？計算方法と見方をわかりやすく解説",
    description:
      "入所系施設カバー率の意味・計算方法・見方を解説。要介護認定者全体に対する入所系施設の定員割合を示す参考指標です。",
  },
  alternates: {
    canonical: "https://www.kaigosagashi.jp/data/metrics",
  },
};

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
      <h2 className="font-serif text-lg font-bold text-primary mb-3">{title}</h2>
      <div className="text-sm text-gray-700 leading-relaxed space-y-3">
        {children}
      </div>
    </section>
  );
}

function SubSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-4">
      <h3 className="text-sm font-bold text-gray-800 mb-2">{title}</h3>
      <div className="text-sm text-gray-700 leading-relaxed space-y-2">
        {children}
      </div>
    </div>
  );
}

export default function MetricsExplainerPage() {
  return (
    <>
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-primary">
          トップ
        </Link>
        <span className="mx-2">›</span>
        <Link href="/data" className="hover:text-primary">
          データについて
        </Link>
        <span className="mx-2">›</span>
        <span className="text-gray-800">指標の解説</span>
      </nav>

      <h1 className="font-serif text-2xl font-bold text-primary mb-3">
        入所系施設カバー率とは？計算方法と見方を解説
      </h1>
      <p className="text-gray-600 mb-8">
        このサイトでは、市区町村ごとの介護施設の状況を把握するために、独自に「入所系施設カバー率」と「介護認定率」を算出しています。ここでは、これらの指標の意味・計算方法・見方をわかりやすく説明します。
      </p>

      <div className="bg-bg-card border border-gray-200 rounded-lg p-6 sm:p-8">
        {/* ── 目次 ── */}
        <nav className="mb-10 pb-6 border-b border-gray-100">
          <p className="text-xs font-bold text-gray-500 mb-2">目次</p>
          <ol className="text-sm text-primary space-y-1 list-decimal list-inside">
            <li><a href="#what" className="hover:underline">入所系施設カバー率とは</a></li>
            <li><a href="#formula" className="hover:underline">計算方法</a></li>
            <li><a href="#why-low" className="hover:underline">なぜ数値が低く見えるのか</a></li>
            <li><a href="#certification" className="hover:underline">介護認定率とは</a></li>
            <li><a href="#how-to-read" className="hover:underline">指標の見方</a></li>
            <li><a href="#confidence" className="hover:underline">信頼度について</a></li>
            <li><a href="#caution" className="hover:underline">注意事項</a></li>
            <li><a href="#usage" className="hover:underline">このデータの使い方</a></li>
          </ol>
        </nav>

        {/* ── 1. 入所系施設カバー率とは ── */}
        <Section id="what" title="1. 入所系施設カバー率とは">
          <p>
            入所系施設カバー率は、ある地域の<strong>要介護認定者数全体</strong>に対して、<strong>入所系施設の定員がどれくらいの割合を占めるか</strong>を示す参考指標です。
          </p>
          <p>
            ここでいう「認定者数全体」には、訪問介護や通所介護など<strong>在宅サービスを利用している方も含まれます</strong>。すべての認定者が入所を必要としているわけではないため、数値は構造的に低くなります。
          </p>
          <p>
            全国平均はおよそ<strong>3%前後</strong>です。この数値は「入所を必要とする人に対して3%しか足りていない」という意味ではなく、<strong>認定者全体に対する入所系施設の供給規模の目安</strong>です。数値が高い地域ほど、認定者数に対して入所系施設の定員が手厚いことを意味します。
          </p>
          <div className="bg-gray-50 rounded-lg px-4 py-3 mt-2">
            <p className="text-xs text-gray-500">
              <strong>名称変更のお知らせ:</strong> 本指標は従来「入所系介護充足率」と表記していましたが、「入所希望者に対する充足度」と誤解されやすいため、指標の実態をより正確に表す「入所系施設カバー率」に名称を改めました。計算方法に変更はありません。
            </p>
          </div>
        </Section>

        {/* ── 2. 計算方法 ── */}
        <Section id="formula" title="2. 計算方法">
          <div className="bg-bg rounded-lg px-4 py-3 text-center">
            <p className="text-sm text-gray-500 mb-1">計算式</p>
            <p className="text-base font-medium text-gray-800">
              入所系施設カバー率（%）= 入所系施設の定員合計 ÷ 要介護認定者数 × 100
            </p>
          </div>

          <SubSection title="分子：入所系施設の定員合計">
            <p className="text-gray-600">
              地域内の入所系介護施設の定員（受け入れ可能人数）を合計したものです。以下の施設が対象です。
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>介護老人保健施設（老健）</li>
              <li>地域密着型介護老人福祉施設（小規模特養）</li>
              <li>介護医療院</li>
              <li>認知症対応型共同生活介護（グループホーム）</li>
              <li>特定施設入居者生活介護（有料老人ホーム・軽費老人ホーム・サービス付き高齢者向け住宅）</li>
              <li>短期入所生活介護・短期入所療養介護（ショートステイ）</li>
            </ul>
          </SubSection>

          <SubSection title="分母：要介護認定者数">
            <p className="text-gray-600">
              要支援1〜要介護5のすべての認定者が対象です。在宅サービスのみ利用している方も含むため、「入所を希望・必要としている人の数」ではない点にご注意ください。
            </p>
          </SubSection>

          <SubSection title="対象に含まれないサービス">
            <p className="text-gray-600">
              訪問介護、通所介護（デイサービス）、居宅介護支援などの在宅サービスは含まれません。本指標はあくまで「入所・居住系の施設」に限定しています。
            </p>
          </SubSection>

          <SubSection title="データの前処理">
            <p className="text-gray-600">
              施設の定員データには、未入力（0件）や明らかな異常値が含まれる場合があります。当サイトでは以下の処理を行っています。
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>定員が未入力・0の場合 → 集計から除外</li>
              <li>定員が500以上の場合 → 異常値として除外</li>
              <li>上記以外の値のみを合計に使用</li>
            </ul>
            <p className="text-gray-500 text-xs">
              なお、元データの定員入力率は全体で約93%あり、定員欠損が数値を大きく押し下げている主因ではありません。カバー率が低く見える主な理由は次のセクションで説明します。
            </p>
          </SubSection>
        </Section>

        {/* ── 3. なぜ数値が低く見えるのか ── */}
        <Section id="why-low" title="3. なぜ数値が低く見えるのか">
          <p>
            全国平均が約3%と聞くと「入所系施設がまったく足りていない」と感じるかもしれません。しかし、この数値が低く出る主な理由は<strong>分母が認定者全体であること</strong>にあります。
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-gray-600">
            <li>
              要介護認定を受けた方のうち、実際に入所系施設を利用している方は一部です。多くの方は訪問介護や通所介護などの<strong>在宅サービスを利用しながら自宅で生活</strong>しています。
            </li>
            <li>
              実際には、在宅サービスを利用しながら自宅で生活を続ける方が多数を占めます。
            </li>
            <li>
              そのため、カバー率3%は「入所が必要な方の3%しかカバーできていない」のではなく、<strong>認定者全体に対する施設定員の規模感を示している</strong>にすぎません。
            </li>
          </ul>
          <p>
            この指標は、地域間で入所系施設の供給規模を相対的に比較するための目安として設計されています。「何%あれば十分」という絶対的な基準はありません。
          </p>
        </Section>

        {/* ── 4. 介護認定率とは ── */}
        <Section id="certification" title="4. 介護認定率とは">
          <p>
            介護認定率は、<strong>65歳以上の高齢者のうち、要支援・要介護の認定を受けている人の割合</strong>です。
          </p>
          <div className="bg-bg rounded-lg px-4 py-3 text-center">
            <p className="text-sm text-gray-500 mb-1">計算式</p>
            <p className="text-base font-medium text-gray-800">
              介護認定率（%）= 要介護認定者数 ÷ 65歳以上人口 × 100
            </p>
          </div>
          <p>
            全国平均はおよそ<strong>56%前後</strong>です。高齢化が進んだ地域や、後期高齢者（75歳以上）の割合が多い地域では認定率が高くなる傾向があります。
          </p>
        </Section>

        {/* ── 5. 指標の見方 ── */}
        <Section id="how-to-read" title="5. 指標の見方">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-bg rounded-lg px-4 py-3">
              <p className="font-medium text-gray-800 text-sm mb-1">カバー率が高い地域</p>
              <p className="text-gray-600 text-xs">認定者数に対して入所系施設の定員が比較的多い地域です。施設の選択肢が多い可能性があります。</p>
            </div>
            <div className="bg-bg rounded-lg px-4 py-3">
              <p className="font-medium text-gray-800 text-sm mb-1">カバー率が低い地域</p>
              <p className="text-gray-600 text-xs">認定者数に対して入所系施設の定員が少なめの地域です。大都市圏に多い傾向があります。</p>
            </div>
            <div className="bg-bg rounded-lg px-4 py-3">
              <p className="font-medium text-gray-800 text-sm mb-1">認定率が高い地域</p>
              <p className="text-gray-600 text-xs">高齢化が進み、介護サービスの需要が高い地域です。</p>
            </div>
            <div className="bg-bg rounded-lg px-4 py-3">
              <p className="font-medium text-gray-800 text-sm mb-1">認定率が低い地域</p>
              <p className="text-gray-600 text-xs">比較的若い高齢者が多い、または元気な高齢者が多い地域です。</p>
            </div>
          </div>

          <SubSection title="組み合わせの読み方">
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li><strong>カバー率 高 × 認定率 高</strong> → 需要・供給ともに高い地域</li>
              <li><strong>カバー率 低 × 認定率 高</strong> → 需要に対して施設供給が少なめの地域</li>
              <li><strong>カバー率 高 × 認定率 低</strong> → 供給が比較的多い地域</li>
              <li><strong>カバー率 低 × 認定率 低</strong> → 需要・供給ともに全国平均以下</li>
            </ul>
          </SubSection>
        </Section>

        {/* ── 6. 信頼度について ── */}
        <Section id="confidence" title="6. 信頼度について">
          <p>
            当サイトでは、各市区町村の指標に<strong>信頼度</strong>を付けています。これは「データがどれくらい揃っているか」を示すもので、数値の精度を判断する目安です。
          </p>

          <div className="space-y-2 mt-3">
            <div className="flex items-start gap-3">
              <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full whitespace-nowrap mt-0.5">信頼度：高</span>
              <p className="text-gray-600 text-xs">定員データが十分に揃っており、比較・意思決定の参考にできます。</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full whitespace-nowrap mt-0.5">信頼度：中</span>
              <p className="text-gray-600 text-xs">一部データが不足していますが、一般的な参考値として利用できます。</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-amber-50 text-amber-700 text-xs px-2 py-0.5 rounded-full whitespace-nowrap mt-0.5">参考値</span>
              <p className="text-gray-600 text-xs">データ不足のため参考程度の数値です。注意文が表示されます。</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-gray-400 text-xs px-2 py-0.5 rounded-full border border-gray-200 whitespace-nowrap mt-0.5">非表示</span>
              <p className="text-gray-600 text-xs">データが大幅に不足しており、カバー率を表示していません。誤解を防ぐための措置です。</p>
            </div>
          </div>
        </Section>

        {/* ── 7. 注意事項 ── */}
        <Section id="caution" title="7. 注意事項">
          <div className="bg-amber-50 rounded-lg px-4 py-3 space-y-2">
            <p className="text-amber-800 text-sm font-medium">この指標をご利用の際は、以下の点にご注意ください。</p>
            <ul className="list-disc list-inside space-y-1.5 text-amber-700 text-xs">
              <li>
                <strong>分母は認定者全体です。</strong>
                在宅サービスのみ利用している方も含むため、「入所を必要としている人に対する不足率」ではありません。
              </li>
              <li>
                <strong>実際の空き状況は反映していません。</strong>
                定員に空きがあるかどうかは別の情報です。入所可能かどうかは各施設に直接お問い合わせください。
              </li>
              <li>
                <strong>施設数が少ない自治体では、数値が不安定になります。</strong>
                1施設の増減でカバー率が大きく変動するため、小規模自治体の数値は参考程度にお考えください。
              </li>
              <li>
                <strong>定員データが未入力の施設があります。</strong>
                一部の施設は定員が未入力のため集計に含まれていませんが、全体の定員入力率は約93%あり、大幅な欠損が主因ではありません。
              </li>
              <li>
                <strong>広域利用（他の市区町村の施設を利用するケース）は考慮していません。</strong>
                実際には隣接する自治体の施設を利用することも多くあります。
              </li>
              <li>
                <strong>あくまで参考指標です。</strong>
                施設選びや地域比較の一つの材料としてご活用ください。最終的な判断は、ケアマネジャーや自治体の相談窓口と相談されることをおすすめします。
              </li>
            </ul>
          </div>
        </Section>

        {/* ── 8. このデータの使い方 ── */}
        <Section id="usage" title="8. このデータの使い方">
          <ul className="list-disc list-inside space-y-1.5 text-gray-600">
            <li><strong>地域比較:</strong> 候補地域の介護環境を比較する際に、カバー率と認定率を並べて確認できます。</li>
            <li><strong>引っ越し・住み替え検討:</strong> 入所系施設の供給規模が大きい地域を探す際の参考になります。</li>
            <li><strong>施設選びの前段階:</strong> 地域の全体像を把握したうえで、個別の施設情報を確認できます。</li>
          </ul>
        </Section>
      </div>

      {/* ── サービス種別ガイドへの導線 ── */}
      <div className="mt-8 bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6">
        <h2 className="font-serif text-base font-bold text-primary mb-2">介護サービスの種類がわからない方へ</h2>
        <p className="text-sm text-gray-700 mb-2">
          訪問介護・通所介護・短期入所・グループホーム・老健など、介護サービスにはさまざまな種類があります。それぞれの違いや選び方をわかりやすく整理しています。
        </p>
        <Link
          href="/guides/care-service-types"
          className="text-sm text-primary hover:underline font-medium"
        >
          介護サービスの種類と選び方を見る →
        </Link>
      </div>

      {/* ── 内部リンク ── */}
      <div className="mt-6 space-y-3">
        <div className="bg-bg-card border border-gray-200 rounded-lg px-5 py-4">
          <p className="text-sm font-medium text-gray-800 mb-2">関連ページ</p>
          <ul className="text-sm space-y-1.5">
            <li>
              <Link href="/" className="text-primary hover:underline">
                都道府県から介護施設を探す
              </Link>
            </li>
            <li>
              <Link href="/data" className="text-primary hover:underline">
                データの出典・ライセンスについて
              </Link>
            </li>
            <li>
              <Link href="/about" className="text-primary hover:underline">
                運営者情報
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
