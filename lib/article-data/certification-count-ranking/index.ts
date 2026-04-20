// 都道府県別認定数記事のデータ型定義

export interface CityCountEntry {
  rank: number;
  city: string;
  count: number;
  rate: string; // 認定率（参考表示用）
}

export interface CityCountDescription {
  city: string;
  count: number;
  text: string;
}

export interface TrendItem {
  title: string;
  text: string;
}

export interface CountArticleData {
  slug: string;
  prefecture: string;
  prefTotalCount: string; // 県の認定者合計（表示用、カンマ区切り前の数値文字列）
  top10: CityCountEntry[];
  top5Descriptions: CityCountDescription[];
  prefTrends: TrendItem[];
}

import osaka from "./osaka";
import tokyo from "./tokyo";
import kanagawa from "./kanagawa";
import saitama from "./saitama";
import chiba from "./chiba";
import aichi from "./aichi";
import hokkaido from "./hokkaido";
import fukuoka from "./fukuoka";
import hyogo from "./hyogo";
import shizuoka from "./shizuoka";
import miyagi from "./miyagi";
import niigata from "./niigata";
import nagano from "./nagano";
import okayama from "./okayama";
import hiroshima from "./hiroshima";
import kumamoto from "./kumamoto";

const allData: Record<string, CountArticleData> = {
  osaka,
  tokyo,
  kanagawa,
  saitama,
  chiba,
  aichi,
  hokkaido,
  fukuoka,
  hyogo,
  shizuoka,
  miyagi,
  niigata,
  nagano,
  okayama,
  hiroshima,
  kumamoto,
};

export function getArticleData(slug: string): CountArticleData | null {
  return allData[slug] ?? null;
}

export function getAllArticleSlugs(): string[] {
  return Object.keys(allData);
}
