import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "介護施設の費用の見方｜月額費用・入居一時金・自己負担の基本",
  description:
    "介護施設の費用は施設種別によって大きく異なります。月額費用の内訳、入居一時金、介護保険の自己負担、追加費用の考え方など、費用を比較するときに押さえておきたい基本を家族向けに整理しています。",
  openGraph: {
    title: "介護施設の費用の見方｜月額費用・入居一時金・自己負担の基本",
    description:
      "介護施設の費用構造を家族向けに解説。月額費用の内訳、入居一時金、介護保険の自己負担、追加費用の考え方を整理します。",
  },
  alternates: {
    canonical: "https://www.kaigosagashi.jp/guides/care-facility-cost",
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
      <h2 className="font-serif text-lg font-bold text-primary mb-3">
        {title}
      </h2>
      <div className="text-sm text-gray-700 leading-relaxed space-y-3">
        {children}
      </div>
    </section>
  );
}

function CostCard({
  name,
  category,
  children,
}: {
  name: string;
  category: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-bg-card border border-gray-200 rounded-lg p-4 sm:p-5">
      <p className="text-xs text-gray-400 mb-1">{category}</p>
      <h3 className="font-serif text-base font-bold text-primary mb-2">
        {name}
      </h3>
      <div className="text-sm text-gray-700 leading-relaxed space-y-2">
        {children}
      </div>
    </div>
  );
}

export default function CareFacilityCostPage() {
  return (
    <>
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-primary">
          トップ
        </Link>
        <span className="mx-2">›</span>
        <span className="text-gray-800">介護施設の費用の見方</span>
      </nav>

      <article className="max-w-3xl">
        <h1 className="font-serif text-2xl font-bold text-primary mb-4 leading-tight">
          介護施設の費用の見方｜月額費用・入居一時金・自己負担の基本
        </h1>

        <div className="text-sm text-gray-700 leading-relaxed space-y-3 mb-10">
          <p>
            介護施設を検討するとき、費用は最も気になる項目のひとつです。ただし、施設の費用は「月◯万円」と一言で示せるほど単純ではありません。施設種別・要介護度・部屋タイプ・追加サービスによって、実際の負担額は大きく変わります。
          </p>
          <p>
            このページでは、介護施設の費用を比較するときに押さえておきたい基本的な構造を、家族向けに整理しました。具体的な金額は施設ごとに異なるため、本ページでは「どの項目を確認すべきか」「なぜ費用に差が出るのか」に焦点を当てています。
          </p>
          <p className="text-xs text-gray-500">
            ※ このページは費用の見方を整理する参考情報です。実際の費用は施設・本人の状況により異なります。利用判断は、ケアマネジャー・地域包括支援センター・自治体・施設に直接確認のうえ行ってください。
          </p>
        </div>

        {/* ── 施設種別で費用構造が異なる ── */}
        <Section id="by-type" title="費用は施設種別によって大きく異なる">
          <p>
            介護施設の費用構造は、施設種別によって以下のように大きく傾向が分かれます。
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-gray-700">
            <li>
              <strong>特別養護老人ホーム（特養）：</strong>
              公的施設で、入居一時金は不要。月額費用は比較的安価ですが、要介護3以上が原則で、入居待ちが発生しやすい傾向があります。
            </li>
            <li>
              <strong>介護老人保健施設（老健）：</strong>
              在宅復帰を目指す施設で、入居一時金は不要。月額費用は特養と同水準で、入所期間は原則3〜6か月が目安です。
            </li>
            <li>
              <strong>介護医療院：</strong>
              医療と介護を併せて受けられる施設で、入居一時金は不要。医療依存度が高い方向けの長期療養型です。
            </li>
            <li>
              <strong>グループホーム：</strong>
              認知症の方向けの小規模共同生活施設。入居一時金がある場合とない場合があり、月額費用は施設によって幅があります。
            </li>
            <li>
              <strong>有料老人ホーム・サ高住：</strong>
              民間運営の施設で、費用幅が最も大きいタイプです。入居一時金が数百万〜数千万円かかる施設もあれば、月額制で一時金不要の施設もあります。
            </li>
          </ul>
          <p>
            施設種別の違いは、
            <Link href="/guides/care-service-types" className="text-primary hover:underline">
              介護サービスの種類と選び方
            </Link>
            に詳しくまとめています。
          </p>
        </Section>

        {/* ── 月額費用の主な内訳 ── */}
        <Section id="monthly" title="月額費用の主な内訳">
          <p>
            「月額費用◯万円」と提示されたとき、その金額に何が含まれているかを必ず確認してください。施設によって「月額」の意味が異なります。
          </p>

          <div className="space-y-3 mt-2">
            <CostCard name="介護サービス費の自己負担分" category="月額費用の構成要素 1">
              <p>
                介護保険サービスを利用した分の自己負担額です。要介護度が高いほど利用するサービスが多くなるため、自己負担額も増えます。
              </p>
              <p className="text-xs text-gray-500">
                ※ 自己負担割合は1〜3割で、所得によって異なります。詳細は自治体の介護保険担当窓口にご確認ください。
              </p>
            </CostCard>

            <CostCard name="居住費（家賃相当）" category="月額費用の構成要素 2">
              <p>
                部屋を使用するための費用です。個室・多床室（相部屋）・ユニット型個室など、部屋タイプによって金額が大きく変わります。
              </p>
            </CostCard>

            <CostCard name="食費" category="月額費用の構成要素 3">
              <p>
                1日3食分の食事代です。特養・老健などでは1日あたりの金額が定められており、外泊・欠食時の返金条件は施設ごとに異なります。
              </p>
            </CostCard>

            <CostCard name="日用品費" category="月額費用の構成要素 4">
              <p>
                オムツ・タオル・歯ブラシ・ティッシュなどの消耗品費用です。施設によっては定額制の場合と、実費精算の場合があります。
              </p>
            </CostCard>

            <CostCard name="管理費・サービス費" category="月額費用の構成要素 5">
              <p>
                光熱費・共用部の維持費・スタッフサービス費などです。有料老人ホーム・サ高住で発生することが多い項目です。
              </p>
            </CostCard>
          </div>
        </Section>

        {/* ── 介護保険自己負担 ── */}
        <Section id="insurance" title="介護保険の自己負担について">
          <p>
            介護施設で利用する介護サービス費は、介護保険が適用されると<strong>1割〜3割の自己負担</strong>で利用できます。割合は所得によって決まり、自治体から送付される「介護保険負担割合証」で確認できます。
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-gray-700">
            <li>1割負担：多くの方が該当</li>
            <li>2割負担：一定以上の所得がある場合</li>
            <li>3割負担：現役並み所得の場合</li>
          </ul>
          <p className="text-xs text-gray-500">
            ※ 高額介護サービス費制度・特定入所者介護サービス費（補足給付）など、自己負担を軽減する公的制度もあります。適用可否は自治体・ケアマネジャーへご相談ください。
          </p>
        </Section>

        {/* ── 入居一時金 ── */}
        <Section id="initial-fee" title="入居一時金がある施設とない施設">
          <p>
            入居一時金は、有料老人ホームやサ高住の一部で発生する初期費用です。施設に入居する権利・居住する権利の対価として支払うもので、施設によって金額や償却条件が大きく異なります。
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-gray-700">
            <li>
              <strong>入居一時金がない施設：</strong>
              特養、老健、介護医療院、グループホーム（多くの場合）、月払い型の有料老人ホーム・サ高住
            </li>
            <li>
              <strong>入居一時金がある施設：</strong>
              一部の有料老人ホーム・サ高住。金額は数十万円〜数千万円と幅広い
            </li>
          </ul>
          <div className="bg-amber-50 rounded-lg px-4 py-3 mt-2">
            <p className="text-xs text-amber-700 leading-relaxed">
              <strong>注意：</strong>
              入居一時金がある施設では、入居後一定期間で「償却」される仕組みが一般的です。短期間で退去・死亡した場合に、未償却分が返還されるかどうかは契約内容で大きく変わります。契約前に重要事項説明書をしっかり確認してください。
            </p>
          </div>
        </Section>

        {/* ── 追加費用 ── */}
        <Section id="extra" title="医療費・薬代・理美容代などの追加費用">
          <p>
            月額費用とは別に、以下のような追加費用が発生することがあります。施設の見積もりにこれらが含まれているか必ず確認してください。
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-gray-700">
            <li>医療費（受診時の自己負担、入院時の費用）</li>
            <li>薬代・処方箋料</li>
            <li>理美容代（訪問理美容を利用する場合）</li>
            <li>レクリエーション・行事の参加費</li>
            <li>外出・外泊時の交通費・付き添い費</li>
            <li>嗜好品費（おやつ・新聞・タバコなど）</li>
            <li>オムツ代（施設によっては実費精算）</li>
            <li>感染症対応費（インフルエンザ等の流行時）</li>
          </ul>
        </Section>

        {/* ── 必ず施設に確認 ── */}
        <Section id="confirm" title="費用は必ず施設に直接確認する">
          <p>
            施設の月額費用は、本人の要介護度・部屋タイプ・利用するサービスによって異なります。本ページの内容はあくまで一般的な目安を整理したものであり、具体的な金額は次の方法で必ず確認してください。
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-gray-700">
            <li>
              <strong>施設に見積もりを依頼する：</strong>
              本人の要介護度・希望する部屋タイプを伝えて、月額費用の総額と内訳の試算をもらう
            </li>
            <li>
              <strong>重要事項説明書を読む：</strong>
              月額費用の構成、追加料金の発生条件、入居一時金の償却条件、退去時の返還ルールを契約前に確認する
            </li>
            <li>
              <strong>ケアマネジャーに相談する：</strong>
              本人の状況に対して妥当な費用かを第三者目線で確認してもらう
            </li>
          </ul>
        </Section>

        {/* ── 公的制度 ── */}
        <Section id="public-support" title="公的制度・減免制度は自治体・専門家へ確認する">
          <p>
            介護費用の自己負担を軽減する公的制度として、以下のような仕組みがあります。適用可否や手続きは自治体ごとに異なるため、必ず市区町村の介護保険担当窓口またはケアマネジャーにご相談ください。
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-gray-700">
            <li>
              <strong>高額介護サービス費：</strong>
              1か月の介護保険自己負担額が上限を超えた場合、超過分が払い戻される制度
            </li>
            <li>
              <strong>特定入所者介護サービス費（補足給付）：</strong>
              所得が一定以下の方が施設利用する際の食費・居住費を軽減する制度
            </li>
            <li>
              <strong>高額医療・高額介護合算療養費制度：</strong>
              医療と介護の自己負担を合算して上限を超えた場合の軽減制度
            </li>
            <li>
              <strong>自治体独自の助成制度：</strong>
              市区町村ごとに独自の補助制度がある場合があります
            </li>
          </ul>
          <div className="bg-amber-50 rounded-lg px-4 py-3 mt-2">
            <p className="text-xs text-amber-700 leading-relaxed">
              <strong>重要：</strong>
              公的制度は要件・適用範囲が頻繁に変わるため、本ページの情報を根拠に判断せず、必ず最新の情報を自治体・ケアマネジャー・社会福祉協議会などにご確認ください。
            </p>
          </div>
        </Section>

        {/* ── まとめ ── */}
        <Section id="summary" title="まとめ">
          <p>
            介護施設の費用は、施設種別・部屋タイプ・要介護度・追加サービスによって大きく変わります。月額費用の内訳、入居一時金の有無、追加費用の発生条件を見積もり・重要事項説明書で確認し、複数施設を同じ条件で比較することが、納得のいく施設選びにつながります。
          </p>
          <p>
            施設の費用相談は、ケアマネジャーや地域包括支援センターでも受けられます。あわせて
            <Link href="/guides/how-to-choose-care-facility" className="text-primary hover:underline">
              介護施設の探し方
            </Link>
            、
            <Link href="/guides/facility-visit-checklist" className="text-primary hover:underline">
              施設見学のチェックリスト
            </Link>
            もご活用ください。
          </p>
        </Section>
      </article>

      {/* ── 関連リンク ── */}
      <div className="max-w-3xl bg-bg-card border border-gray-200 rounded-lg px-5 py-4 mt-2">
        <p className="text-sm font-medium text-gray-800 mb-2">関連ページ</p>
        <ul className="text-sm space-y-1.5">
          <li>
            <Link href="/guides/how-to-choose-care-facility" className="text-primary hover:underline">
              介護施設の探し方｜最初に確認すべき流れと相談先
            </Link>
          </li>
          <li>
            <Link href="/guides/facility-visit-checklist" className="text-primary hover:underline">
              介護施設の見学で確認すべきポイント
            </Link>
          </li>
          <li>
            <Link href="/guides/care-service-types" className="text-primary hover:underline">
              介護サービスの種類と選び方
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
