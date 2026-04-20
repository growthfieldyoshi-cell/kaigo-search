// 都道府県別認定率記事のデータ型定義
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

export interface PrefArticleData {
  slug: string;          // 英語スラッグ（osaka, hokkaido 等）
  prefecture: string;    // 日本語都道府県名（大阪府 等）
  prefAvgRate: string;   // 県平均認定率

  top10: CityRankEntry[];
  top5Descriptions: CityDescription[];
  prefTrends: TrendItem[];
}

// 公開済みの県データをまとめてエクスポート
// 新しい県を追加する場合はここに import + 登録する

import osaka from "./osaka";
import fukushima from "./fukushima";
import hokkaido from "./hokkaido";
import nara from "./nara";
import miyagi from "./miyagi";
import nagano from "./nagano";
import gunma from "./gunma";
import tottori from "./tottori";
import ehime from "./ehime";
import nagasaki from "./nagasaki";
import akita from "./akita";
import yamagata from "./yamagata";
import kochi from "./kochi";
import shimane from "./shimane";
import wakayama from "./wakayama";
import tokushima from "./tokushima";
import kagoshima from "./kagoshima";
import yamaguchi from "./yamaguchi";
import oita from "./oita";
import saga from "./saga";
import kumamoto from "./kumamoto";
import miyazaki from "./miyazaki";
import iwate from "./iwate";
import aomori from "./aomori";
import fukuoka from "./fukuoka";
import hiroshima from "./hiroshima";
import gifu from "./gifu";
import toyama from "./toyama";
import ishikawa from "./ishikawa";
import fukui from "./fukui";
import mie from "./mie";
import okayama from "./okayama";
import yamanashi from "./yamanashi";
import shizuoka from "./shizuoka";
import niigata from "./niigata";
import tochigi from "./tochigi";
import ibaraki from "./ibaraki";
import aichi from "./aichi";
import saitama from "./saitama";
import chiba from "./chiba";
import kyoto from "./kyoto";
import hyogo from "./hyogo";
import shiga from "./shiga";
import tokyo from "./tokyo";
import kanagawa from "./kanagawa";
import kagawa from "./kagawa";
import okinawa from "./okinawa";

const allData: Record<string, PrefArticleData> = {
  osaka,
  fukushima,
  hokkaido,
  nara,
  miyagi,
  nagano,
  gunma,
  tottori,
  ehime,
  nagasaki,
  akita,
  yamagata,
  kochi,
  shimane,
  wakayama,
  tokushima,
  kagoshima,
  yamaguchi,
  oita,
  saga,
  kumamoto,
  miyazaki,
  iwate,
  aomori,
  fukuoka,
  hiroshima,
  gifu,
  toyama,
  ishikawa,
  fukui,
  mie,
  okayama,
  yamanashi,
  shizuoka,
  niigata,
  tochigi,
  ibaraki,
  aichi,
  saitama,
  chiba,
  kyoto,
  hyogo,
  shiga,
  tokyo,
  kanagawa,
  kagawa,
  okinawa,
};

export function getArticleData(slug: string): PrefArticleData | null {
  return allData[slug] ?? null;
}

export function getAllArticleSlugs(): string[] {
  return Object.keys(allData);
}
