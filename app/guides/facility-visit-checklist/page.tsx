import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "介護施設の見学で確認すべきポイント｜家族が見るべきチェックリスト",
  description:
    "介護施設の見学で家族が確認すべきポイントを、チェックリスト形式でまとめました。立地・清潔感・職員対応・食事・医療対応・費用・退去条件まで、見学前後で押さえておきたい観点を整理しています。",
  openGraph: {
    title: "介護施設の見学で確認すべきポイント｜家族が見るべきチェックリスト",
    description:
      "介護施設の見学で家族が確認すべきポイントをチェックリスト形式で解説。立地・清潔感・職員対応・食事・医療対応・費用・退去条件まで網羅します。",
  },
  alternates: {
    canonical: "https://www.kaigosagashi.jp/guides/facility-visit-checklist",
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

function CheckBlock({
  title,
  items,
  note,
}: {
  title: string;
  items: string[];
  note?: string;
}) {
  return (
    <div className="bg-bg-card border border-gray-200 rounded-lg p-4 sm:p-5">
      <h3 className="font-serif text-base font-bold text-primary mb-2">
        {title}
      </h3>
      <ul className="text-sm text-gray-700 leading-relaxed space-y-1.5 list-disc list-inside">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      {note && <p className="text-xs text-gray-500 leading-relaxed mt-3">{note}</p>}
    </div>
  );
}

export default function FacilityVisitChecklistPage() {
  return (
    <>
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-primary">
          トップ
        </Link>
        <span className="mx-2">›</span>
        <span className="text-gray-800">施設見学のチェックリスト</span>
      </nav>

      <article className="max-w-3xl">
        <h1 className="font-serif text-2xl font-bold text-primary mb-4 leading-tight">
          介護施設の見学で確認すべきポイント｜家族が見るべきチェックリスト
        </h1>

        <div className="text-sm text-gray-700 leading-relaxed space-y-3 mb-10">
          <p>
            介護施設のパンフレットやウェブサイトの情報だけでは、実際の雰囲気や運営方針を判断することは難しいものです。可能であれば、契約前に必ず複数の施設を見学し、家族の目で確認することをおすすめします。
          </p>
          <p>
            このページでは、施設見学のときに家族が確認すべきポイントをチェックリスト形式でまとめました。「何を見ればいいかわからないまま見学が終わってしまった」とならないよう、事前に確認したい項目を整理しておきましょう。
          </p>
          <p className="text-xs text-gray-500">
            ※ このページは見学時の観点を整理する参考情報です。施設の評価や利用判断は、ケアマネジャー・地域包括支援センター・自治体・主治医など、専門家にもご相談のうえ行ってください。
          </p>
        </div>

        {/* ── 見学前の準備 ── */}
        <Section id="prepare" title="見学前に準備すること">
          <p>
            見学の予約を取る前に、確認したい観点や本人の状態を整理しておくと、限られた時間で必要な情報を集めやすくなります。
          </p>
          <CheckBlock
            title="準備チェック"
            items={[
              "本人の要介護度・既往症・服薬状況をメモにまとめる",
              "医療的ケア（たんの吸引、経管栄養、インスリン注射など）が必要か整理する",
              "認知症の有無、徘徊・暴言などの傾向を整理する",
              "家族が通いやすい距離・面会頻度の希望を共有する",
              "月額費用の上限・入居一時金の上限を家族で合意しておく",
              "見学日に同行する家族を決める（できれば複数人で）",
              "気になる点を質問リストにしておく",
            ]}
          />
        </Section>

        {/* ── 立地・アクセス ── */}
        <Section id="location" title="立地・アクセス">
          <CheckBlock
            title="立地のチェックポイント"
            items={[
              "家族が無理なく通える距離か",
              "公共交通機関でのアクセスはどうか（バス・電車の本数）",
              "車で通う場合の駐車場の有無",
              "周辺環境（騒音・治安・買い物の利便性）",
              "本人の馴染みの地域に近いか、または家族の生活圏に近いか",
            ]}
            note="本人にとっての馴染みの場所か、家族にとっての通いやすさか、優先順位を家族で話し合っておくと判断しやすくなります。"
          />
        </Section>

        {/* ── 施設内の清潔感 ── */}
        <Section id="cleanliness" title="施設内の清潔感">
          <CheckBlock
            title="施設環境のチェックポイント"
            items={[
              "玄関・廊下・共用スペースが清掃されているか",
              "トイレ・浴室の清潔さ",
              "におい（排泄・食事・薬品など）が気になりすぎないか",
              "リネン・寝具が清潔か",
              "車いす・歩行器などの福祉用具の整備状況",
              "館内の温度・湿度が快適か",
              "バリアフリー設計や手すりの設置状況",
            ]}
          />
        </Section>

        {/* ── 職員の対応 ── */}
        <Section id="staff" title="職員の対応">
          <CheckBlock
            title="職員のチェックポイント"
            items={[
              "見学時、職員が利用者にどう声をかけているか",
              "利用者の呼称（敬称付きで呼んでいるか）",
              "職員同士の連携・情報共有の様子",
              "見学者への対応が丁寧か（質問にきちんと答えてくれるか）",
              "夜勤帯の職員配置・人数",
              "職員の離職率や定着の状況（聞ける範囲で）",
            ]}
            note="職員の言葉づかい・表情・利用者との距離感は、入居後の生活の質に直結します。短時間でも雰囲気は感じ取れるので、複数人で見学して印象を共有しましょう。"
          />
        </Section>

        {/* ── 入居者・利用者の雰囲気 ── */}
        <Section id="residents" title="入居者・利用者の雰囲気">
          <CheckBlock
            title="入居者のチェックポイント"
            items={[
              "入居者・利用者の表情に穏やかさがあるか",
              "リビング・談話スペースで過ごしている人がいるか",
              "本人と同年代・同じ要介護度の人がどれくらいいるか",
              "認知症の方向けの配慮があるか（グループホーム等）",
              "私物の持ち込みや居室のカスタマイズが許可されているか",
            ]}
          />
        </Section>

        {/* ── 食事・入浴・リハビリ ── */}
        <Section id="daily-life" title="食事・入浴・リハビリ">
          <CheckBlock
            title="日常生活のチェックポイント"
            items={[
              "食事の提供回数・時間・献立サイクル",
              "嚥下機能に応じた食事形態（普通食・きざみ食・ミキサー食など）への対応",
              "アレルギー・嗜好への対応の柔軟さ",
              "入浴の頻度（週何回か）、機械浴の有無",
              "リハビリの種類・頻度（個別・集団）、専門職の配置",
              "レクリエーション・行事の有無と頻度",
              "外出・買い物の機会があるか",
            ]}
          />
        </Section>

        {/* ── 医療対応・夜間対応 ── */}
        <Section id="medical" title="医療対応・夜間対応">
          <CheckBlock
            title="医療体制のチェックポイント"
            items={[
              "協力医療機関の有無と関係性",
              "看護師の常駐時間（24時間体制か、日中のみか）",
              "夜間の医療緊急対応の体制",
              "たんの吸引・経管栄養・インスリン注射などの可否",
              "看取り（ターミナルケア）への対応",
              "服薬管理の方法",
              "受診同行・往診への対応",
            ]}
            note="医療依存度が高い方は、医療対応の可否で入居先が大きく絞られます。現時点で必要な対応だけでなく、将来的に必要になりそうな対応もあわせて確認しておくと、退去リスクを下げられます。"
          />
        </Section>

        {/* ── 費用 ── */}
        <Section id="cost" title="費用・追加料金">
          <CheckBlock
            title="費用のチェックポイント"
            items={[
              "月額費用に含まれるもの・含まれないもの",
              "入居一時金の有無と金額",
              "介護保険自己負担分の見込み額",
              "食費・居住費・日用品費の内訳",
              "医療費・薬代・理美容代などの追加費用",
              "オムツ代・洗濯代などの実費負担",
              "面会・外出時の同行スタッフ費用",
              "退去時の返還金・原状回復費用",
            ]}
            note="費用は施設・本人の状況により大きく異なります。基本的な構造は別ページに整理しています。"
          />
          <p>
            <Link href="/guides/care-facility-cost" className="text-primary hover:underline font-medium">
              → 介護施設の費用の見方を見る
            </Link>
          </p>
        </Section>

        {/* ── 退去条件・緊急時対応 ── */}
        <Section id="exit-emergency" title="退去条件・緊急時対応">
          <CheckBlock
            title="契約に関するチェックポイント"
            items={[
              "退去が必要になる条件（要介護度の変化、医療依存度、認知症の進行など）",
              "退去時に必要な手続き・期間",
              "緊急時の対応フロー（救急搬送・家族への連絡）",
              "感染症発生時の対応方針",
              "災害時（地震・水害など）の避難計画",
              "本人が亡くなった場合の対応・看取りの可否",
              "契約書・重要事項説明書の事前送付可否",
            ]}
          />
        </Section>

        {/* ── 見学後 ── */}
        <Section id="after-visit" title="見学後に家族で確認すること">
          <CheckBlock
            title="振り返りのチェックポイント"
            items={[
              "見学した複数施設を同じ観点で比較する",
              "気になった点・違和感を家族で言語化する",
              "本人の希望（聞ける場合）を最優先する",
              "ケアマネジャーや地域包括支援センターに見学結果を共有して意見を求める",
              "費用見積もりや契約書類を取り寄せて精査する",
              "可能であれば再見学・体験入居を検討する",
            ]}
          />
          <div className="bg-amber-50 rounded-lg px-4 py-3 mt-2">
            <p className="text-xs text-amber-700 leading-relaxed">
              <strong>重要：</strong>
              見学で感じた印象だけで決めるのは避け、複数施設の比較・専門家への相談を経て判断することをおすすめします。契約前には必ず重要事項説明書を熟読し、不明点は文書で施設に確認してください。
            </p>
          </div>
        </Section>

        {/* ── まとめ ── */}
        <Section id="summary" title="まとめ">
          <p>
            施設見学は、入居後の生活を左右する重要な判断材料です。事前に観点を整理し、複数施設を比較することで、本人と家族にとって納得のいく選択につながります。
          </p>
          <p>
            見学の前提となる「介護施設探しの全体の流れ」「介護サービスの種類」「費用の構造」もあわせてご確認ください。
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
            <Link href="/guides/care-service-types" className="text-primary hover:underline">
              介護サービスの種類と選び方
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
