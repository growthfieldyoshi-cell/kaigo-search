import type { Metadata } from "next";
import Link from "next/link";
import { getPrefectures } from "@/lib/queries";
import { slugFromPrefecture } from "@/lib/prefecture-slugs";

export async function generateMetadata(): Promise<Metadata> {
  const prefectures = await getPrefectures();
  const total = prefectures.reduce((sum, p) => sum + Number(p.facility_count), 0);
  const totalStr = total.toLocaleString();
  return {
    title: `介護さがし | 全国${totalStr}件の介護施設検索`,
    description: `全国${totalStr}件の介護施設・介護サービス事業所を、厚生労働省のオープンデータをもとに都道府県・市区町村・サービス別に整理して掲載しています。`,
    openGraph: {
      title: `介護さがし | 全国${totalStr}件の介護施設検索`,
      description: `全国${totalStr}件の介護施設・介護サービス事業所を、厚生労働省のオープンデータをもとに都道府県・市区町村・サービス別に整理して掲載しています。`,
    },
    alternates: {
      canonical: "https://www.kaigosagashi.jp/",
    },
  };
}

export default async function HomePage() {
  const prefectures = await getPrefectures();
  const total = prefectures.reduce((sum, p) => sum + Number(p.facility_count), 0);
  const totalStr = total.toLocaleString();

  return (
    <>
      {/* ── リード文（サイト概要） ── */}
      <section className="mb-10">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-primary mb-3 leading-tight">
          介護さがし｜全国の介護施設情報をまとめて整理
        </h1>
        <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-3">
          介護さがしは、ご家族や本人の介護施設探しを支援する情報サイトです。全国
          <strong>約{totalStr}件</strong>の介護施設・介護サービス事業所を、厚生労働省「介護サービス情報公表システム」のオープンデータをもとに、都道府県・市区町村・サービス種別ごとに整理して掲載しています。
        </p>
        <p className="text-sm text-gray-600 leading-relaxed">
          初めて介護施設を探す方、地域の介護環境を知りたい方、ケアマネジャーや自治体への相談前に情報を整理したい方を主な利用者として想定しています。
        </p>
        <div className="bg-amber-50 rounded-lg px-4 py-3 mt-4">
          <p className="text-xs text-amber-700 leading-relaxed">
            <strong>ご利用にあたっての注意：</strong>
            掲載情報はオープンデータに基づく参考情報です。空き状況・料金・医療対応・受け入れ条件など、利用判断に必要な情報は、各施設・自治体・担当ケアマネジャーへ直接ご確認ください。介護・医療に関する最終判断は専門家にご相談ください。
          </p>
        </div>
      </section>

      {/* ── 介護さがしを作った理由 ── */}
      <section className="mb-10">
        <h2 className="font-serif text-xl font-bold text-primary mb-3">
          介護さがしを作った理由
        </h2>
        <div className="bg-bg-card border border-gray-200 rounded-lg p-5 sm:p-6">
          <div className="text-sm text-gray-700 leading-relaxed space-y-3">
            <p>
              家族の介護が必要になったとき、最初にぶつかるのが「施設の種類が多くて違いがわからない」「地域ごとにどんな施設があるのか把握しにくい」という壁です。介護施設の情報は公的なデータベースに公開されているものの、地域・サービス種別を横断して比較しやすい形にはなっていません。
            </p>
            <p>
              介護さがしは、この「最初の比較・確認」が少しでもしやすくなるよう、公開データを整理し、都道府県・市区町村・サービス種別ごとに探せる入口として作っています。地域差や指標の意味も、家族目線で読めるように解説を添えるよう心がけています。
            </p>
            <p>
              ただし、掲載しているのは公開データに基づく基本情報です。空き状況・料金・医療対応・受け入れ条件など、実際の利用判断に直結する情報は、必ず各施設・自治体・担当ケアマネジャー等にもご確認ください。介護さがしは、専門家への相談前に情報を整理するための補助としてご活用いただくことを想定しています。
            </p>
          </div>
        </div>
      </section>

      {/* ── 介護施設を探す流れ（4ステップ図解） ── */}
      <section className="mb-10">
        <h2 className="font-serif text-xl font-bold text-primary mb-4">
          介護施設を探す流れ
        </h2>
        <ol className="relative space-y-3 sm:space-y-4">
          {/* 縦のコネクトライン（sm以上で表示） */}
          <div
            aria-hidden="true"
            className="hidden sm:block absolute left-[19px] top-3 bottom-3 w-px bg-gray-200"
          />
          {[
            {
              step: 1,
              title: "状態を整理する",
              body: "本人の要介護度・必要な支援・家族の希望（自宅介護か施設か、通える距離、費用上限など）を書き出します。",
              link: { href: "/guides/how-to-choose-care-facility", label: "整理の進め方を見る" },
            },
            {
              step: 2,
              title: "サービス種別を知る",
              body: "訪問介護・通所介護・特養・老健・グループホームなど、種類の違いを大まかに把握します。",
              link: { href: "/guides/care-service-types", label: "サービスの種類を見る" },
            },
            {
              step: 3,
              title: "地域で候補を探す",
              body: "都道府県 → 市区町村 → サービス種別の順で絞り込み、施設候補をリストアップします。",
              link: { href: "#prefectures", label: "都道府県から探す", isAnchor: true },
            },
            {
              step: 4,
              title: "施設・専門家に確認する",
              body: "空き状況・費用・医療対応などは各施設に直接確認し、判断はケアマネジャー等の専門家にも相談します。",
              link: { href: "/guides/facility-visit-checklist", label: "見学チェックリストを見る" },
            },
          ].map((s) => (
            <li key={s.step} className="relative pl-12 sm:pl-14">
              {/* ステップ番号バッジ */}
              <div
                aria-hidden="true"
                className="absolute left-0 top-0 w-10 h-10 rounded-full bg-primary text-white font-serif font-bold flex items-center justify-center text-base shadow-sm"
              >
                {s.step}
              </div>
              <div className="bg-bg-card border border-gray-200 rounded-lg px-5 py-4">
                <p className="text-xs text-gray-400 mb-1">STEP {s.step}</p>
                <p className="font-medium text-gray-800 text-sm sm:text-base mb-1">{s.title}</p>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{s.body}</p>
                {s.link.isAnchor ? (
                  <a
                    href={s.link.href}
                    className="text-xs text-primary hover:underline mt-2 inline-block"
                  >
                    {s.link.label} →
                  </a>
                ) : (
                  <Link
                    href={s.link.href}
                    className="text-xs text-primary hover:underline mt-2 inline-block"
                  >
                    {s.link.label} →
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ── 初めての方向けガイド ── */}
      <section className="mb-10">
        <h2 className="font-serif text-xl font-bold text-primary mb-3">
          初めて介護施設を探す方へ
        </h2>
        <p className="text-sm text-gray-700 leading-relaxed mb-4">
          家族の介護施設探しを始める前に、押さえておきたい基本をまとめた4つのガイドです。順番に読むことで、施設探しの全体像と判断材料を整理できます。
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href="/guides/how-to-choose-care-facility"
            className="bg-bg-card border border-gray-200 rounded-lg px-5 py-4 hover:border-accent hover:shadow-md transition-all"
          >
            <p className="text-xs text-gray-400 mb-1">ガイド 1</p>
            <span className="font-medium text-gray-800 block mb-1">介護施設の探し方</span>
            <span className="text-sm text-gray-500">最初に確認すべき流れと相談先</span>
          </Link>
          <Link
            href="/guides/care-service-types"
            className="bg-bg-card border border-gray-200 rounded-lg px-5 py-4 hover:border-accent hover:shadow-md transition-all"
          >
            <p className="text-xs text-gray-400 mb-1">ガイド 2</p>
            <span className="font-medium text-gray-800 block mb-1">介護サービスの種類と選び方</span>
            <span className="text-sm text-gray-500">訪問・通所・入所など主要サービスの違い</span>
          </Link>
          <Link
            href="/guides/facility-visit-checklist"
            className="bg-bg-card border border-gray-200 rounded-lg px-5 py-4 hover:border-accent hover:shadow-md transition-all"
          >
            <p className="text-xs text-gray-400 mb-1">ガイド 3</p>
            <span className="font-medium text-gray-800 block mb-1">施設見学のチェックリスト</span>
            <span className="text-sm text-gray-500">家族が見るべき確認ポイント</span>
          </Link>
          <Link
            href="/guides/care-facility-cost"
            className="bg-bg-card border border-gray-200 rounded-lg px-5 py-4 hover:border-accent hover:shadow-md transition-all"
          >
            <p className="text-xs text-gray-400 mb-1">ガイド 4</p>
            <span className="font-medium text-gray-800 block mb-1">介護施設の費用の見方</span>
            <span className="text-sm text-gray-500">月額費用・入居一時金・自己負担の基本</span>
          </Link>
        </div>
      </section>

      {/* ── 都道府県から探す ── */}
      <section id="prefectures" className="mb-12">
        <h2 className="font-serif text-xl font-bold text-primary mb-2">
          都道府県から探す
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          市区町村・サービス種別へ絞り込めます。
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {prefectures.map((pref) => (
            <Link
              key={pref.prefecture}
              href={`/prefecture/${slugFromPrefecture(pref.prefecture) ?? pref.prefecture}`}
              className="bg-bg-card border border-gray-200 rounded-lg px-4 py-3 hover:border-accent hover:shadow-md transition-all text-center"
            >
              <span className="font-serif font-bold text-primary block text-lg">
                {pref.prefecture}
              </span>
              <span className="text-sm text-gray-500">
                {Number(pref.facility_count).toLocaleString()}件
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── 介護指標で地域を知る ── */}
      <section className="mb-12">
        <h2 className="font-serif text-xl font-bold text-primary mb-3">
          介護指標で地域を知る
        </h2>
        <p className="text-sm text-gray-700 leading-relaxed mb-4">
          公開データから独自に算出した「入所系施設カバー率」「介護認定率」をもとに、地域ごとの介護環境を比較できます。指標はあくまで参考値であり、実際の入所のしやすさや介護サービスの質を直接示すものではありません。
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href="/ranking/sufficiency"
            className="bg-bg-card border border-gray-200 rounded-lg px-5 py-4 hover:border-accent hover:shadow-md transition-all"
          >
            <span className="font-medium text-gray-800 block">入所系施設カバー率ランキング</span>
            <span className="text-sm text-gray-500">認定者数に対する入所系施設の供給規模を地域別に比較</span>
          </Link>
          <Link
            href="/ranking/certification"
            className="bg-bg-card border border-gray-200 rounded-lg px-5 py-4 hover:border-accent hover:shadow-md transition-all"
          >
            <span className="font-medium text-gray-800 block">介護認定率ランキング</span>
            <span className="text-sm text-gray-500">要介護認定者の割合が高い地域を確認</span>
          </Link>
          <Link
            href="/articles/sufficiency-ranking-japan"
            className="bg-bg-card border border-gray-200 rounded-lg px-5 py-4 hover:border-accent hover:shadow-md transition-all"
          >
            <span className="font-medium text-gray-800 block">介護施設が充実している地域はどこ？</span>
            <span className="text-sm text-gray-500">カバー率上位の市区町村の特徴と背景を解説</span>
          </Link>
          <Link
            href="/articles/sufficiency-shortage-ranking-japan"
            className="bg-bg-card border border-gray-200 rounded-lg px-5 py-4 hover:border-accent hover:shadow-md transition-all"
          >
            <span className="font-medium text-gray-800 block">介護施設が不足している地域はどこ？</span>
            <span className="text-sm text-gray-500">カバー率が低い地域の傾向と注意点を解説</span>
          </Link>
          <Link
            href="/articles/certification-ranking-japan"
            className="bg-bg-card border border-gray-200 rounded-lg px-5 py-4 hover:border-accent hover:shadow-md transition-all"
          >
            <span className="font-medium text-gray-800 block">介護認定率が高い地域はどこ？</span>
            <span className="text-sm text-gray-500">要介護認定が多い市区町村の特徴と背景を解説</span>
          </Link>
          <Link
            href="/articles/certification-count-ranking-japan"
            className="bg-bg-card border border-gray-200 rounded-lg px-5 py-4 hover:border-accent hover:shadow-md transition-all"
          >
            <span className="font-medium text-gray-800 block">要介護認定者数が多い地域はどこ？</span>
            <span className="text-sm text-gray-500">介護需要の規模が大きい市区町村を確認</span>
          </Link>
        </div>
      </section>

      {/* ── データ・運営者情報への導線 ── */}
      <section className="mb-8">
        <h2 className="font-serif text-xl font-bold text-primary mb-3">
          このサイトについて
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            href="/data"
            className="bg-bg-card border border-gray-200 rounded-lg px-5 py-4 hover:border-accent hover:shadow-md transition-all"
          >
            <span className="font-medium text-gray-800 block mb-1">データについて</span>
            <span className="text-sm text-gray-500">出典・更新方針・データの限界</span>
          </Link>
          <Link
            href="/about"
            className="bg-bg-card border border-gray-200 rounded-lg px-5 py-4 hover:border-accent hover:shadow-md transition-all"
          >
            <span className="font-medium text-gray-800 block mb-1">運営者情報</span>
            <span className="text-sm text-gray-500">運営会社・運営方針・広告掲載方針</span>
          </Link>
          <Link
            href="/contact"
            className="bg-bg-card border border-gray-200 rounded-lg px-5 py-4 hover:border-accent hover:shadow-md transition-all"
          >
            <span className="font-medium text-gray-800 block mb-1">お問い合わせ</span>
            <span className="text-sm text-gray-500">データ修正依頼・ご意見はこちら</span>
          </Link>
        </div>
      </section>
    </>
  );
}
