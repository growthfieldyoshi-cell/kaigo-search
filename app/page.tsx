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
    description: `全国${totalStr}件の介護施設を都道府県・市区町村・サービス別に検索できる介護施設検索サイトです。`,
    openGraph: {
      title: `介護さがし | 全国${totalStr}件の介護施設検索`,
      description: `全国${totalStr}件の介護施設を都道府県・市区町村・サービス別に検索できる介護施設検索サイトです。`,
    },
  };
}

export default async function HomePage() {
  const prefectures = await getPrefectures();

  return (
    <>
      <h1 className="font-serif text-2xl font-bold text-primary mb-2">
        都道府県から探す
      </h1>
      <p className="text-gray-600 mb-8">
        介護サービス事業所を都道府県から検索できます。
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
      {/* ── ランキング・記事導線 ── */}
      <section className="mt-12">
        <h2 className="font-serif text-xl font-bold text-primary mb-4">
          介護指標で地域を知る
        </h2>
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
        </div>
      </section>
    </>
  );
}
