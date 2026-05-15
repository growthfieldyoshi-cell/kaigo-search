import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "介護サービスの種類と選び方｜訪問・通所・入所の違いをわかりやすく解説",
  description:
    "訪問介護・通所介護・短期入所・グループホーム・老健・介護医療院など、介護サービスの違いをわかりやすく解説。自宅・通い・泊まり・入所の4分類で整理し、どんな人にどのサービスが向いているかの目安もご紹介します。",
  openGraph: {
    title: "介護サービスの種類と選び方｜訪問・通所・入所の違いをわかりやすく解説",
    description:
      "介護サービスの種類を4分類で整理。訪問介護・通所介護・短期入所・グループホーム・老健・介護医療院などの違いと選び方を解説します。",
  },
  alternates: {
    canonical: "https://www.kaigosagashi.jp/guides/care-service-types",
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

function ServiceCard({
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

export default function CareServiceTypesPage() {
  return (
    <>
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-primary">
          トップ
        </Link>
        <span className="mx-2">›</span>
        <span className="text-gray-800">介護サービスの種類と選び方</span>
      </nav>

      <article className="max-w-3xl">
        <h1 className="font-serif text-2xl font-bold text-primary mb-4 leading-tight">
          介護サービスの種類と選び方
        </h1>

        {/* ── 導入文 ── */}
        <div className="text-sm text-gray-700 leading-relaxed space-y-3 mb-10">
          <p>
            介護サービスには、自宅で利用するもの、日帰りで通うもの、短期間泊まるもの、長期的に入所するものなど、さまざまな種類があります。
          </p>
          <p>
            「訪問介護」「通所介護」「短期入所生活介護」「認知症対応型共同生活介護」——こうした名称だけでは、具体的にどんなサービスなのか分かりにくいと感じる方も多いのではないでしょうか。
          </p>
          <p>
            このページでは、主な介護サービスの種類を大きく4つに分類し、それぞれの特徴や向いている方の目安を整理します。
          </p>
          <p className="text-xs text-gray-500">
            ※ 実際にどのサービスを利用するかは、担当のケアマネジャー（介護支援専門員）やお住まいの地域包括支援センターに相談しながら決めるのが基本です。このページはあくまでサービスの全体像を把握するための参考情報です。
          </p>
        </div>

        {/* ── 4分類 ── */}
        <Section id="four-categories" title="まずは大きく4つに分けて理解する">
          <p>
            介護保険で利用できるサービスは、利用の仕方によって大きく4つに分けられます。
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
            <div className="bg-bg-card border border-gray-200 rounded-lg px-4 py-3">
              <p className="font-bold text-gray-800 text-sm mb-1">
                1. 自宅で利用するサービス
              </p>
              <p className="text-xs text-gray-600">
                ヘルパーや看護師が自宅に来てくれるサービス。住み慣れた家で生活を続けながら支援を受けられます。
              </p>
            </div>
            <div className="bg-bg-card border border-gray-200 rounded-lg px-4 py-3">
              <p className="font-bold text-gray-800 text-sm mb-1">
                2. 通って利用するサービス
              </p>
              <p className="text-xs text-gray-600">
                日帰りで施設に通い、食事や入浴、リハビリなどを受けるサービス。日中の活動や社会交流の場にもなります。
              </p>
            </div>
            <div className="bg-bg-card border border-gray-200 rounded-lg px-4 py-3">
              <p className="font-bold text-gray-800 text-sm mb-1">
                3. 短期間泊まるサービス
              </p>
              <p className="text-xs text-gray-600">
                数日〜数週間、施設に泊まるサービス。家族の休息（レスパイト）や退院後の一時利用などに活用されます。
              </p>
            </div>
            <div className="bg-bg-card border border-gray-200 rounded-lg px-4 py-3">
              <p className="font-bold text-gray-800 text-sm mb-1">
                4. 入所して利用するサービス
              </p>
              <p className="text-xs text-gray-600">
                施設に長期間入所して、日常生活全般の介護を受けるサービス。自宅での生活が難しくなった場合の選択肢です。
              </p>
            </div>
          </div>
        </Section>

        {/* ── 主なサービス種別 ── */}
        <Section id="service-types" title="主なサービス種別の説明">
          <p>
            以下では、利用頻度の高いサービスや名称が分かりにくいサービスを中心に、具体的な内容を説明します。
          </p>

          <div className="space-y-4 mt-2">
            {/* 自宅系 */}
            <ServiceCard name="訪問介護（ホームヘルプ）" category="自宅で利用するサービス">
              <p>
                ホームヘルパー（訪問介護員）が自宅を訪問し、食事・入浴・排泄の介助や、掃除・洗濯・買い物などの生活援助を行います。
              </p>
              <p>
                <strong>向いている方：</strong>自宅での生活を続けたいが、日常生活の一部に手助けが必要な方。一人暮らしや日中独居の高齢者にも多く利用されています。
              </p>
              <p className="text-xs text-gray-500">
                ※ 訪問看護との違い：訪問介護は生活援助・身体介護が中心。医療的なケア（点滴、褥瘡の処置など）が必要な場合は訪問看護が対応します。
              </p>
            </ServiceCard>

            <ServiceCard name="訪問看護" category="自宅で利用するサービス">
              <p>
                看護師や理学療法士などが自宅を訪問し、医師の指示に基づいて医療的なケアやリハビリを行います。体温・血圧の管理、服薬管理、褥瘡（床ずれ）の処置、ターミナルケアなどが含まれます。
              </p>
              <p>
                <strong>向いている方：</strong>退院後の在宅療養が必要な方、医療的なケアを受けながら自宅で暮らしたい方。訪問介護と組み合わせて利用するケースが多くあります。
              </p>
            </ServiceCard>

            <ServiceCard name="居宅介護支援（ケアマネジメント）" category="自宅で利用するサービス">
              <p>
                ケアマネジャー（介護支援専門員）がケアプラン（介護サービス計画）を作成し、サービス事業者との連絡調整を行います。利用者の自己負担はありません。
              </p>
              <p>
                <strong>向いている方：</strong>要介護認定を受けた方は基本的に全員が対象。介護サービスを利用するための最初の窓口となるサービスです。「どのサービスを使えばいいかわからない」という段階で、まず相談する先です。
              </p>
            </ServiceCard>

            <ServiceCard name="福祉用具貸与" category="自宅で利用するサービス">
              <p>
                車いす、介護用ベッド（特殊寝台）、歩行器、手すりなどの福祉用具をレンタルで利用できるサービスです。介護保険が適用されるため、原則1割（所得に応じて2〜3割）の負担で利用できます。
              </p>
              <p>
                <strong>向いている方：</strong>自宅での移動や起き上がりに不安がある方。用具の導入で自立した生活を維持しやすくなるケースが多くあります。
              </p>
              <p className="text-xs text-gray-500">
                ※ 購入が対象のもの（腰掛便座、入浴補助用具など）は「特定福祉用具販売」として別枠で利用できます。
              </p>
            </ServiceCard>

            {/* 通所系 */}
            <ServiceCard name="通所介護（デイサービス）" category="通って利用するサービス">
              <p>
                日帰りで施設に通い、食事や入浴、レクリエーション、機能訓練などを受けるサービスです。送迎付きで、朝出かけて夕方に帰宅するのが一般的です。
              </p>
              <p>
                <strong>向いている方：</strong>自宅での閉じこもりや運動不足を防ぎたい方、日中に家族が不在で見守りが必要な方。社会交流の機会としても重要な役割を果たしています。
              </p>
              <p className="text-xs text-gray-500">
                ※ 通所リハビリテーション（デイケア）との違い：デイサービスは生活支援・社会交流が中心。リハビリを重点的に行いたい場合はデイケア（医師の指示に基づくリハビリ）が向いています。
              </p>
            </ServiceCard>

            {/* 短期宿泊系 */}
            <ServiceCard name="短期入所生活介護（ショートステイ）" category="短期間泊まるサービス">
              <p>
                特別養護老人ホームなどの施設に数日〜最大30日程度宿泊し、食事・入浴・排泄などの介護を受けるサービスです。
              </p>
              <p>
                <strong>向いている方：</strong>介護をしている家族が旅行や冠婚葬祭で不在になるとき、家族の心身の休息（レスパイト）が必要なとき、退院後に在宅復帰までの準備期間が必要なとき。
              </p>
              <p className="text-xs text-gray-500">
                ※ 短期入所療養介護との違い：生活介護は特養などで行われ日常生活の支援が中心。療養介護は老健や病院で行われ、医療的なケアやリハビリも含みます。
              </p>
            </ServiceCard>

            {/* 入所系 */}
            <ServiceCard name="認知症対応型共同生活介護（グループホーム）" category="入所して利用するサービス">
              <p>
                認知症の方が少人数（5〜9人程度）で共同生活をしながら、食事の準備や掃除などを職員のサポートのもとで行う施設です。家庭的な環境で、できることは自分で行うことを大切にしています。
              </p>
              <p>
                <strong>向いている方：</strong>認知症の診断を受けており、少人数の落ち着いた環境での生活が合う方。地域密着型サービスのため、原則として施設がある市区町村に住民票がある方が対象です。
              </p>
            </ServiceCard>

            <ServiceCard name="介護老人保健施設（老健）" category="入所して利用するサービス">
              <p>
                病院での治療を終えた方が、在宅復帰を目指してリハビリテーションを受ける施設です。医師・看護師・理学療法士などが配置されており、医療ケアとリハビリの両方を受けられます。入所期間は原則3〜6か月が目安です。
              </p>
              <p>
                <strong>向いている方：</strong>退院後すぐに自宅に戻るのが難しい方、リハビリで身体機能の回復を目指したい方。長期入所が前提の特養とは役割が異なります。
              </p>
            </ServiceCard>

            <ServiceCard name="地域密着型介護老人福祉施設入所者生活介護（小規模特養）" category="入所して利用するサービス">
              <p>
                定員29人以下の小規模な特別養護老人ホームです。名称が長く行政用語的ですが、内容は「小規模な特養」と理解してください。要介護3以上の方が対象で、食事・入浴・排泄など日常生活全般の介護を受けながら長期間暮らす施設です。
              </p>
              <p>
                <strong>向いている方：</strong>要介護度が高く自宅での生活が難しい方で、少人数の環境を希望する方。地域密着型のため、原則として施設所在地の市区町村の住民が対象です。
              </p>
              <p className="text-xs text-gray-500">
                ※ 大規模な特別養護老人ホーム（広域型・定員30人以上）も同様のサービスを提供しますが、こちらは居住地の制限がありません。
              </p>
            </ServiceCard>

            <ServiceCard name="介護医療院" category="入所して利用するサービス">
              <p>
                長期的な医療ケアと日常生活の介護を同時に受けられる施設です。2018年に創設された比較的新しいサービスで、従来の介護療養型医療施設の転換先として位置づけられています。たんの吸引、経管栄養、インスリン注射など医療依存度の高い方にも対応できます。
              </p>
              <p>
                <strong>向いている方：</strong>日常的に医療的ケアが必要で、病院での入院治療は不要だが特養では対応が難しい方。医療と介護の両方が必要な状態が長期間続く場合の受け皿です。
              </p>
            </ServiceCard>
          </div>
        </Section>

        {/* ── 入所系介護施設とは ── */}
        <Section id="residential-care" title="「入所系介護施設」とは？">
          <p>
            入所系介護施設とは、入所や宿泊を伴う介護施設の総称です。特別養護老人ホーム（特養）、介護老人保健施設（老健）、グループホーム、介護医療院、有料老人ホームなどが含まれます。
          </p>
          <p>
            このサイトでは、入所系施設の供給状況を測る参考指標として<strong>「入所系施設カバー率」</strong>を掲載しています。これは、地域の要介護認定者数全体（在宅サービス利用者を含む）に対する入所系施設の定員割合を示したもので、地域の施設供給規模の目安です。
          </p>
          <div className="bg-amber-50 rounded-lg px-4 py-3 mt-2">
            <ul className="list-disc list-inside space-y-1.5 text-amber-700 text-xs">
              <li>
                カバー率は施設の<strong>定員</strong>をもとに算出しており、<strong>実際の空き状況や待機者数を直接示す指標ではありません</strong>。
              </li>
              <li>
                カバー率が高い地域でも満室の施設がありますし、低い地域でも空きのある施設はあります。
              </li>
              <li>
                小規模自治体では施設数が少ないため、<strong>1施設の開設・閉鎖で数値が大きく変動する</strong>ことがあります。
              </li>
            </ul>
          </div>
          <p>
            地域の介護環境を大まかに把握するための参考として、
            <Link href="/ranking/sufficiency" className="text-primary hover:underline">
              カバー率ランキング
            </Link>
            もあわせてご覧ください。
          </p>
        </Section>

        {/* ── 迷ったときの見方 ── */}
        <Section id="guide" title="迷ったときの見方">
          <p>
            「どのサービスを探せばいいかわからない」というときは、まず以下の目安を参考にしてみてください。
          </p>
          <div className="space-y-2 mt-2">
            <div className="flex items-start gap-2 bg-bg-card border border-gray-200 rounded-lg px-4 py-3">
              <span className="text-primary font-bold text-sm shrink-0">→</span>
              <div>
                <p className="text-sm font-medium text-gray-800">自宅で暮らしながら支援を受けたい</p>
                <p className="text-xs text-gray-600">訪問介護・訪問看護・福祉用具貸与など</p>
              </div>
            </div>
            <div className="flex items-start gap-2 bg-bg-card border border-gray-200 rounded-lg px-4 py-3">
              <span className="text-primary font-bold text-sm shrink-0">→</span>
              <div>
                <p className="text-sm font-medium text-gray-800">日中だけ通って利用したい</p>
                <p className="text-xs text-gray-600">通所介護（デイサービス）・通所リハビリテーション（デイケア）</p>
              </div>
            </div>
            <div className="flex items-start gap-2 bg-bg-card border border-gray-200 rounded-lg px-4 py-3">
              <span className="text-primary font-bold text-sm shrink-0">→</span>
              <div>
                <p className="text-sm font-medium text-gray-800">家族の休息や一時利用をしたい</p>
                <p className="text-xs text-gray-600">短期入所生活介護（ショートステイ）</p>
              </div>
            </div>
            <div className="flex items-start gap-2 bg-bg-card border border-gray-200 rounded-lg px-4 py-3">
              <span className="text-primary font-bold text-sm shrink-0">→</span>
              <div>
                <p className="text-sm font-medium text-gray-800">認知症で少人数の環境が合いそう</p>
                <p className="text-xs text-gray-600">認知症対応型共同生活介護（グループホーム）</p>
              </div>
            </div>
            <div className="flex items-start gap-2 bg-bg-card border border-gray-200 rounded-lg px-4 py-3">
              <span className="text-primary font-bold text-sm shrink-0">→</span>
              <div>
                <p className="text-sm font-medium text-gray-800">退院後のリハビリ・在宅復帰を目指したい</p>
                <p className="text-xs text-gray-600">介護老人保健施設（老健）</p>
              </div>
            </div>
            <div className="flex items-start gap-2 bg-bg-card border border-gray-200 rounded-lg px-4 py-3">
              <span className="text-primary font-bold text-sm shrink-0">→</span>
              <div>
                <p className="text-sm font-medium text-gray-800">長期入所を前提に施設を探したい</p>
                <p className="text-xs text-gray-600">特別養護老人ホーム・有料老人ホームなどの入所型施設を比較</p>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            ※ 上記はあくまで目安です。実際のサービス選びは、ご本人の状態や家族の状況、地域の施設の空き状況などを踏まえて、ケアマネジャーと相談しながら決めることをおすすめします。
          </p>
        </Section>
      </article>

      {/* ── 介護施設探しの関連ガイド ── */}
      <div className="max-w-3xl bg-bg-card border border-gray-200 rounded-lg px-5 py-4 mt-2">
        <p className="text-sm font-medium text-gray-800 mb-3">介護施設探しの関連ガイド</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            href="/guides/how-to-choose-care-facility"
            className="bg-bg border border-gray-200 rounded-lg px-4 py-3 hover:border-accent hover:shadow-sm transition-all"
          >
            <span className="font-medium text-gray-800 text-sm block mb-1">介護施設の探し方</span>
            <span className="text-xs text-gray-500">最初に確認すべき流れと相談先</span>
          </Link>
          <Link
            href="/guides/facility-visit-checklist"
            className="bg-bg border border-gray-200 rounded-lg px-4 py-3 hover:border-accent hover:shadow-sm transition-all"
          >
            <span className="font-medium text-gray-800 text-sm block mb-1">施設見学のチェックリスト</span>
            <span className="text-xs text-gray-500">家族が見るべき確認ポイント</span>
          </Link>
          <Link
            href="/guides/care-facility-cost"
            className="bg-bg border border-gray-200 rounded-lg px-4 py-3 hover:border-accent hover:shadow-sm transition-all"
          >
            <span className="font-medium text-gray-800 text-sm block mb-1">介護施設の費用の見方</span>
            <span className="text-xs text-gray-500">月額費用・入居一時金・自己負担の基本</span>
          </Link>
        </div>
      </div>

      {/* ── 関連リンク ── */}
      <div className="max-w-3xl bg-bg-card border border-gray-200 rounded-lg px-5 py-4 mt-3">
        <p className="text-sm font-medium text-gray-800 mb-2">関連ページ</p>
        <ul className="text-sm space-y-1.5">
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
              href="/ranking/sufficiency"
              className="text-primary hover:underline"
            >
              入所系施設カバー率ランキング（全国）
            </Link>
          </li>
          <li>
            <Link
              href="/ranking/certification"
              className="text-primary hover:underline"
            >
              介護認定率ランキング（全国）
            </Link>
          </li>
          <li>
            <Link
              href="/"
              className="text-primary hover:underline"
            >
              都道府県から介護施設を探す
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
}
