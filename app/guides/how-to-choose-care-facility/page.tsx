import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "介護施設の探し方｜最初に確認すべき流れと相談先",
  description:
    "介護施設を探し始める前に確認すべき手順を、家族向けにわかりやすく整理しました。要介護度の整理、地域包括支援センターやケアマネジャーへの相談、施設候補の比較、空き状況の確認など、最初に押さえるべき流れと相談先をまとめています。",
  openGraph: {
    title: "介護施設の探し方｜最初に確認すべき流れと相談先",
    description:
      "介護施設を探し始めるときに確認すべき手順と相談先を、家族向けに整理。要介護度の整理、ケアマネ相談、施設比較、費用・空き状況の確認まで段階ごとに解説します。",
  },
  alternates: {
    canonical: "https://www.kaigosagashi.jp/guides/how-to-choose-care-facility",
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

function StepCard({
  step,
  title,
  children,
}: {
  step: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-bg-card border border-gray-200 rounded-lg p-4 sm:p-5">
      <p className="text-xs text-gray-400 mb-1">{step}</p>
      <h3 className="font-serif text-base font-bold text-primary mb-2">
        {title}
      </h3>
      <div className="text-sm text-gray-700 leading-relaxed space-y-2">
        {children}
      </div>
    </div>
  );
}

export default function HowToChoosePage() {
  return (
    <>
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-primary">
          トップ
        </Link>
        <span className="mx-2">›</span>
        <span className="text-gray-800">介護施設の探し方</span>
      </nav>

      <article className="max-w-3xl">
        <h1 className="font-serif text-2xl font-bold text-primary mb-4 leading-tight">
          介護施設の探し方｜最初に確認すべき流れと相談先
        </h1>

        <div className="text-sm text-gray-700 leading-relaxed space-y-3 mb-10">
          <p>
            家族の介護が必要になったとき、介護施設をどう探せばよいか戸惑う方は少なくありません。「種類が多くて違いがわからない」「費用が見えない」「どこに相談すればいいかわからない」——いきなり施設名で検索しても、判断材料が揃わないまま情報量に圧倒されてしまうことがあります。
          </p>
          <p>
            このページでは、介護施設を探し始める前に確認すべき手順と、頼れる相談先を順を追ってご紹介します。施設選びは「本人の状態を整理する→相談する→候補を絞る→直接確認する」の流れで進めるのが基本です。
          </p>
          <p className="text-xs text-gray-500">
            ※ このページは介護施設探しの全体像を把握するための情報です。介護・医療・契約に関する最終判断は、必ずケアマネジャー・地域包括支援センター・自治体・主治医など、専門家にご相談のうえ行ってください。
          </p>
        </div>

        {/* ── Step 1: 状況の整理 ── */}
        <Section id="step1" title="STEP 1. まず本人と家族の状況を整理する">
          <p>
            施設探しに動き出す前に、本人の状態と家族の希望を整理することが、最初の一歩です。情報が整理できていれば、相談相手にも具体的に伝えやすくなります。
          </p>
          <div className="space-y-3 mt-2">
            <StepCard step="確認 1" title="要介護度を確認する">
              <p>
                介護保険の認定（要支援1〜要介護5）を受けているかどうかで、利用できるサービスが変わります。認定を受けていない場合は、まず地域包括支援センターか市区町村の介護保険担当窓口に相談してください。
              </p>
            </StepCard>
            <StepCard step="確認 2" title="本人の状態を整理する">
              <p>
                日常生活のどこに支援が必要か（食事・排泄・入浴・移動）、認知症の有無や程度、医療的ケア（たんの吸引・経管栄養・インスリン注射など）の必要性を、できるだけ具体的に書き出します。
              </p>
            </StepCard>
            <StepCard step="確認 3" title="家族の希望と制約を整理する">
              <p>
                自宅介護を続けたいか、施設入居を検討したいか。希望地域（本人の馴染みの地域 / 家族が通いやすい地域）、月額費用の上限、面会の頻度などを家族で話し合います。
              </p>
            </StepCard>
          </div>
        </Section>

        {/* ── Step 2: 自宅介護か施設か ── */}
        <Section id="step2" title="STEP 2. 自宅介護か施設入居かを考える">
          <p>
            介護は「施設に入る」だけが選択肢ではありません。自宅で訪問介護や通所介護を利用しながら生活を続ける方法、短期入所（ショートステイ）を組み合わせる方法など、複数の選択肢があります。
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-gray-700">
            <li>
              <strong>自宅で暮らし続けたい場合：</strong>
              訪問介護・訪問看護・通所介護（デイサービス）・福祉用具貸与などを組み合わせる
            </li>
            <li>
              <strong>家族の介護負担が大きい場合：</strong>
              短期入所（ショートステイ）でレスパイト（休息）を確保しながら自宅介護を続ける選択肢もある
            </li>
            <li>
              <strong>本人の状態的に自宅生活が難しい場合：</strong>
              入所系の施設（特養・老健・グループホーム・介護医療院・有料老人ホームなど）を検討する
            </li>
          </ul>
          <p>
            それぞれのサービスの違いは、
            <Link href="/guides/care-service-types" className="text-primary hover:underline">
              介護サービスの種類と選び方
            </Link>
            で詳しく解説しています。
          </p>
        </Section>

        {/* ── Step 3: 相談先 ── */}
        <Section id="step3" title="STEP 3. 地域包括支援センター・ケアマネジャーに相談する">
          <p>
            介護施設探しで最も重要なのが「相談先を持つこと」です。一人で情報を集めて判断するのではなく、地域の専門家に状況を共有しながら進めることをおすすめします。
          </p>
          <div className="space-y-3 mt-2">
            <StepCard step="相談先 1" title="地域包括支援センター">
              <p>
                市区町村ごとに設置されている、高齢者の総合相談窓口です。要介護認定の申請、介護サービスの利用相談、地域の介護資源の情報提供などを無料で受けられます。担当地域はお住まいの自治体ごとに決まっているので、市区町村の介護保険担当窓口に問い合わせると教えてもらえます。
              </p>
            </StepCard>
            <StepCard step="相談先 2" title="ケアマネジャー（介護支援専門員）">
              <p>
                要介護認定を受けた方は、居宅介護支援事業所のケアマネジャーがケアプランを作成します。本人の状態や家族の希望を踏まえ、利用できるサービス・施設の候補を提案してくれます。利用者の自己負担はありません。地域包括支援センターから紹介を受けるのが一般的です。
              </p>
            </StepCard>
            <StepCard step="相談先 3" title="自治体の介護保険担当窓口">
              <p>
                市区町村の高齢福祉課・介護保険課などです。要介護認定の申請、介護保険負担割合の確認、自治体独自の支援制度の情報を確認できます。
              </p>
            </StepCard>
          </div>
        </Section>

        {/* ── Step 4: 種類を理解 ── */}
        <Section id="step4" title="STEP 4. 介護サービスの種類を理解する">
          <p>
            「特養」「老健」「グループホーム」「サ高住」など、施設名の違いがわからないと、ケアマネからの提案も理解しにくくなります。施設・サービスは大きく次の4分類で整理できます。
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-gray-700">
            <li>
              <strong>自宅で利用するサービス：</strong>訪問介護、訪問看護、福祉用具貸与など
            </li>
            <li>
              <strong>通って利用するサービス：</strong>通所介護（デイサービス）、通所リハビリテーション（デイケア）
            </li>
            <li>
              <strong>短期間泊まるサービス：</strong>短期入所生活介護（ショートステイ）
            </li>
            <li>
              <strong>入所して利用するサービス：</strong>特養、老健、グループホーム、介護医療院、有料老人ホームなど
            </li>
          </ul>
          <p>
            <Link href="/guides/care-service-types" className="text-primary hover:underline font-medium">
              → 介護サービスの種類と選び方を見る
            </Link>
          </p>
        </Section>

        {/* ── Step 5: 候補を比較 ── */}
        <Section id="step5" title="STEP 5. 施設候補を比較する">
          <p>
            ケアマネや地域包括支援センターから候補を紹介してもらったら、複数の施設を比較します。施設名だけで決めず、以下のような観点を整理しておくと、後で見学・問い合わせがしやすくなります。
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-gray-700">
            <li>サービスの種類（特養・老健・グループホームなど）</li>
            <li>立地・アクセス（家族の通いやすさ）</li>
            <li>定員規模・職員配置</li>
            <li>提供サービスの内容（リハビリ・医療対応・認知症対応など）</li>
            <li>月額費用・入居一時金の有無</li>
          </ul>
          <p>
            実際の見学で確認すべきポイントは、
            <Link href="/guides/facility-visit-checklist" className="text-primary hover:underline">
              施設見学のチェックリスト
            </Link>
            にまとめています。費用の見方は、
            <Link href="/guides/care-facility-cost" className="text-primary hover:underline">
              介護施設の費用の見方
            </Link>
            もあわせてご覧ください。
          </p>
        </Section>

        {/* ── Step 6: 直接確認 ── */}
        <Section id="step6" title="STEP 6. 空き状況・費用・医療対応は必ず施設へ直接確認する">
          <p>
            候補を絞ったら、最終判断の前に必ず各施設へ直接問い合わせます。公開情報やインターネットで把握できる範囲には限りがあるためです。
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-gray-700">
            <li>
              <strong>空き状況・待機状況：</strong>
              特養などは入所待ちがあることが多く、待機期間の目安や優先順位の付け方は施設・自治体によって異なります。
            </li>
            <li>
              <strong>費用の詳細：</strong>
              月額費用に含まれるもの・含まれないもの、入居一時金の有無、追加料金の発生条件を必ず確認します。
            </li>
            <li>
              <strong>医療対応：</strong>
              たんの吸引、経管栄養、インスリン注射、看取りなどに対応できるか、夜間の医療体制はどうかは施設ごとに大きく異なります。
            </li>
            <li>
              <strong>退去条件：</strong>
              要介護度が変わったとき、医療依存度が高くなったとき、認知症が進行したときに退去が必要になるかは、契約前に確認しておくべき重要事項です。
            </li>
          </ul>
        </Section>

        {/* ── 介護さがしでできること ── */}
        <Section id="this-site" title="介護さがしでできること・できないこと">
          <p>
            介護さがしは、介護施設探しの「最初の情報整理」を支援する情報サイトです。当サイトでできること・できないことを正しく把握したうえでご利用ください。
          </p>
          <div className="bg-bg-card border border-gray-200 rounded-lg px-5 py-4">
            <p className="text-sm font-bold text-gray-800 mb-2">介護さがしでできること</p>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>全国の介護事業所を都道府県・市区町村・サービス種別で探す</li>
              <li>施設の住所・連絡先・サービス種別などの基本情報を確認する</li>
              <li>地域ごとの介護指標（カバー率・認定率など）の参考値を確認する</li>
              <li>介護サービスの種類や違いを知る</li>
            </ul>
          </div>
          <div className="bg-amber-50 rounded-lg px-5 py-4 mt-2">
            <p className="text-sm font-bold text-amber-800 mb-2">介護さがしではできないこと</p>
            <ul className="list-disc list-inside space-y-1 text-amber-700 text-xs">
              <li>空き状況・待機状況の確認（各施設へ直接お問い合わせください）</li>
              <li>料金・費用の確定的な提示（施設・本人の状況により大きく異なります）</li>
              <li>医療対応や受け入れ条件の確認（施設にお問い合わせください）</li>
              <li>介護・医療判断のアドバイス（必ず専門家にご相談ください）</li>
              <li>施設の申し込み・予約代行</li>
            </ul>
          </div>
        </Section>

        {/* ── まとめ ── */}
        <Section id="summary" title="まとめ">
          <p>
            介護施設探しは「本人の状態と家族の希望を整理する」「専門家に相談する」「複数候補を比較する」「直接施設に確認する」という流れで進めるのが基本です。一人で抱え込まず、地域包括支援センターやケアマネジャーといった専門家を頼ることが、納得のいく施設選びにつながります。
          </p>
          <p>
            介護さがしでは、施設探しの最初の情報整理に役立つコンテンツを提供しています。あわせて
            <Link href="/guides/care-service-types" className="text-primary hover:underline">
              介護サービスの種類と選び方
            </Link>
            、
            <Link href="/guides/facility-visit-checklist" className="text-primary hover:underline">
              施設見学のチェックリスト
            </Link>
            、
            <Link href="/guides/care-facility-cost" className="text-primary hover:underline">
              費用の見方
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
            <Link href="/guides/care-service-types" className="text-primary hover:underline">
              介護サービスの種類と選び方
            </Link>
          </li>
          <li>
            <Link href="/guides/facility-visit-checklist" className="text-primary hover:underline">
              介護施設の見学で確認すべきポイント
            </Link>
          </li>
          <li>
            <Link href="/guides/care-facility-cost" className="text-primary hover:underline">
              介護施設の費用の見方
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
