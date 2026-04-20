// 都道府県別カバー率記事のデータ型定義
// 各県のデータファイル（osaka.ts 等）はこの型に従う

export interface CityRankEntry {
  rank: number;
  city: string;
  rate: string;
}

export interface CityDescription {
  city: string;
  rate: string;
  text: string;
}

export interface TrendItem {
  title: string;
  text: string;
}

export interface SufficiencyArticleData {
  slug: string;              // 英語スラッグ（osaka 等）
  prefecture: string;        // 日本語都道府県名（大阪府 等）
  prefAvgSufficiency: string; // 府県平均カバー率

  top10: CityRankEntry[];
  top5Descriptions: CityDescription[];
  prefTrends: TrendItem[];
}

// 公開済みの県データをまとめてエクスポート
// 新しい県を追加する場合はここに import + 登録する

import osaka from "./osaka";
import kanagawa from "./kanagawa";
import tokyo from "./tokyo";
import saitama from "./saitama";
import chiba from "./chiba";
import aichi from "./aichi";
import fukuoka from "./fukuoka";
import hokkaido from "./hokkaido";
import hyogo from "./hyogo";
import shizuoka from "./shizuoka";
import miyagi from "./miyagi";
import niigata from "./niigata";
import nagano from "./nagano";
import gifu from "./gifu";
import okayama from "./okayama";
import hiroshima from "./hiroshima";
import kagawa from "./kagawa";
import ehime from "./ehime";
import kumamoto from "./kumamoto";
import oita from "./oita";
import aomori from "./aomori";
import akita from "./akita";
import iwate from "./iwate";
import yamagata from "./yamagata";
import fukushima from "./fukushima";
import ibaraki from "./ibaraki";
import tochigi from "./tochigi";
import gunma from "./gunma";
import yamanashi from "./yamanashi";
import toyama from "./toyama";
import ishikawa from "./ishikawa";
import fukui from "./fukui";
import mie from "./mie";
import shiga from "./shiga";
import kyoto from "./kyoto";
import nara from "./nara";
import wakayama from "./wakayama";
import tottori from "./tottori";
import shimane from "./shimane";
import yamaguchi from "./yamaguchi";
import tokushima from "./tokushima";
import kochi from "./kochi";
import saga from "./saga";
import nagasaki from "./nagasaki";
import miyazaki from "./miyazaki";
import kagoshima from "./kagoshima";
import okinawa from "./okinawa";

const allData: Record<string, SufficiencyArticleData> = {
  osaka,
  kanagawa,
  tokyo,
  saitama,
  chiba,
  aichi,
  fukuoka,
  hokkaido,
  hyogo,
  shizuoka,
  miyagi,
  niigata,
  nagano,
  gifu,
  okayama,
  hiroshima,
  kagawa,
  ehime,
  kumamoto,
  oita,
  aomori,
  akita,
  iwate,
  yamagata,
  fukushima,
  ibaraki,
  tochigi,
  gunma,
  yamanashi,
  toyama,
  ishikawa,
  fukui,
  mie,
  shiga,
  kyoto,
  nara,
  wakayama,
  tottori,
  shimane,
  yamaguchi,
  tokushima,
  kochi,
  saga,
  nagasaki,
  miyazaki,
  kagoshima,
  okinawa,
};

export function getArticleData(slug: string): SufficiencyArticleData | null {
  return allData[slug] ?? null;
}

export function getAllArticleSlugs(): string[] {
  return Object.keys(allData);
}
