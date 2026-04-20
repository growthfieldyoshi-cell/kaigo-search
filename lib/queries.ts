import { sql } from './db';

export interface Prefecture {
  prefecture: string;
  facility_count: number;
}

export interface City {
  city: string;
  facility_count: number;
}

export interface ServiceType {
  service_code: string;
  service_name: string;
  facility_count: number;
}

export interface Facility {
  id: number;
  pref_code: number;
  prefecture: string;
  city: string;
  name: string;
  name_kana: string;
  service_code: string;
  service_name: string;
  address: string;
  building: string | null;
  lat: number | null;
  lng: number | null;
  tel: string | null;
  fax: string | null;
  corp_number: string | null;
  corp_name: string | null;
  jigyosho_number: string | null;
  available_days: string | null;
  available_days_note: string | null;
  capacity: number | null;
  url: string | null;
}

/** 都道府県一覧（施設数付き） */
export async function getPrefectures(): Promise<Prefecture[]> {
  const rows = await sql`
    SELECT prefecture, COUNT(*) AS facility_count
    FROM facilities
    GROUP BY prefecture
    ORDER BY MIN(pref_code)
  `;
  return rows as Prefecture[];
}

/** 指定都道府県の市区町村一覧（施設数付き） */
export async function getCitiesByPref(prefecture: string): Promise<City[]> {
  const rows = await sql`
    SELECT city, COUNT(*) AS facility_count
    FROM facilities
    WHERE prefecture = ${prefecture}
    GROUP BY city
    ORDER BY city
  `;
  return rows as City[];
}

/** 施設一覧（都道府県・市区町村必須、サービスコード任意、ページネーション対応） */
export async function getFacilities(
  prefecture: string,
  city: string,
  serviceCode?: string,
  limit = 20,
  offset = 0,
): Promise<{ facilities: Facility[]; totalCount: number }> {
  if (serviceCode) {
    const [rows, countRows] = await Promise.all([
      sql`
        SELECT *
        FROM facilities
        WHERE prefecture = ${prefecture}
          AND city = ${city}
          AND service_code = ${serviceCode}
        ORDER BY name
        LIMIT ${limit} OFFSET ${offset}
      `,
      sql`
        SELECT COUNT(*) AS count
        FROM facilities
        WHERE prefecture = ${prefecture}
          AND city = ${city}
          AND service_code = ${serviceCode}
      `,
    ]);
    return {
      facilities: rows as Facility[],
      totalCount: Number(countRows[0].count),
    };
  }

  const [rows, countRows] = await Promise.all([
    sql`
      SELECT *
      FROM facilities
      WHERE prefecture = ${prefecture}
        AND city = ${city}
      ORDER BY service_code, name
      LIMIT ${limit} OFFSET ${offset}
    `,
    sql`
      SELECT COUNT(*) AS count
      FROM facilities
      WHERE prefecture = ${prefecture}
        AND city = ${city}
    `,
  ]);
  return {
    facilities: rows as Facility[],
    totalCount: Number(countRows[0].count),
  };
}

/** 施設詳細（ID指定） */
export async function getFacilityById(id: number): Promise<Facility | null> {
  const rows = await sql`
    SELECT * FROM facilities WHERE id = ${id}
  `;
  return (rows[0] as Facility) ?? null;
}

/** サービスコードからサービス名を取得（metadata用の軽量クエリ） */
export async function getServiceName(serviceCode: string): Promise<string> {
  const rows = await sql`
    SELECT service_name FROM facilities WHERE service_code = ${serviceCode} LIMIT 1
  `;
  return (rows[0]?.service_name as string) ?? `サービス${serviceCode}`;
}

/** 都道府県内の介護指標ランキング（カバー率TOP + 認定率TOP を1クエリで取得） */
export interface CityRanking {
  city_agg: string;
  sufficiency_rate: number | null;
  certification_rate: number | null;
  metric_confidence: string;
}

export interface PrefectureRankings {
  sufficiencyTop: CityRanking[];
  certificationTop: CityRanking[];
}

export async function getPrefectureCareRankings(
  prefecture: string,
  limit = 10,
): Promise<PrefectureRankings> {
  // 1クエリでカバー率TOP10 + 認定率TOP10 を UNION ALL で取得。
  // city_care_metrics_v2 は集計済みテーブルなので生集計コストゼロ。
  // カバー率: publishable かつ hide でないもの（high/medium/low）のみ対象。
  // 認定率: NOT NULL のみ。
  const rows = await sql`
    (
      SELECT 'sufficiency' AS ranking_type,
             city_agg, sufficiency_rate, certification_rate, metric_confidence
      FROM city_care_metrics_v2
      WHERE prefecture = ${prefecture}
        AND is_sufficiency_publishable = true
        AND metric_confidence IN ('high', 'medium', 'low')
      ORDER BY sufficiency_rate DESC
      LIMIT ${limit}
    )
    UNION ALL
    (
      SELECT 'certification' AS ranking_type,
             city_agg, sufficiency_rate, certification_rate, metric_confidence
      FROM city_care_metrics_v2
      WHERE prefecture = ${prefecture}
        AND certification_rate IS NOT NULL
      ORDER BY certification_rate DESC
      LIMIT ${limit}
    )
  `;

  const sufficiencyTop: CityRanking[] = [];
  const certificationTop: CityRanking[] = [];

  for (const r of rows) {
    const item: CityRanking = {
      city_agg: r.city_agg as string,
      sufficiency_rate: r.sufficiency_rate != null ? Number(r.sufficiency_rate) : null,
      certification_rate: r.certification_rate != null ? Number(r.certification_rate) : null,
      metric_confidence: r.metric_confidence as string,
    };
    if (r.ranking_type === 'sufficiency') sufficiencyTop.push(item);
    else certificationTop.push(item);
  }

  return { sufficiencyTop, certificationTop };
}

/** ランキングページ用: カバー率ランキング（全国 or 都道府県） */
export interface RankingEntry {
  prefecture: string;
  city_agg: string;
  sufficiency_rate: number | null;
  certification_rate: number | null;
  metric_confidence: string;
}

export async function getSufficiencyRanking(
  prefecture?: string,
  limit = 50,
): Promise<RankingEntry[]> {
  if (prefecture) {
    return await sql`
      SELECT prefecture, city_agg, sufficiency_rate, certification_rate, metric_confidence
      FROM city_care_metrics_v2
      WHERE prefecture = ${prefecture}
        AND is_sufficiency_publishable = true
        AND metric_confidence IN ('high', 'medium', 'low')
      ORDER BY sufficiency_rate DESC
      LIMIT ${limit}
    ` as RankingEntry[];
  }
  return await sql`
    SELECT prefecture, city_agg, sufficiency_rate, certification_rate, metric_confidence
    FROM city_care_metrics_v2
    WHERE is_sufficiency_publishable = true
      AND metric_confidence IN ('high', 'medium', 'low')
    ORDER BY sufficiency_rate DESC
    LIMIT ${limit}
  ` as RankingEntry[];
}

/** ランキングページ用: 認定率ランキング（全国 or 都道府県） */
export async function getCertificationRanking(
  prefecture?: string,
  limit = 50,
): Promise<RankingEntry[]> {
  if (prefecture) {
    return await sql`
      SELECT prefecture, city_agg, sufficiency_rate, certification_rate, metric_confidence
      FROM city_care_metrics_v2
      WHERE prefecture = ${prefecture}
        AND certification_rate IS NOT NULL
      ORDER BY certification_rate DESC
      LIMIT ${limit}
    ` as RankingEntry[];
  }
  return await sql`
    SELECT prefecture, city_agg, sufficiency_rate, certification_rate, metric_confidence
    FROM city_care_metrics_v2
    WHERE certification_rate IS NOT NULL
    ORDER BY certification_rate DESC
    LIMIT ${limit}
  ` as RankingEntry[];
}

/** 指定市区町村のサービス種別一覧（施設数付き） */
export async function getServicesByCity(
  prefecture: string,
  city: string,
): Promise<ServiceType[]> {
  const rows = await sql`
    SELECT service_code, service_name, COUNT(*) AS facility_count
    FROM facilities
    WHERE prefecture = ${prefecture}
      AND city = ${city}
    GROUP BY service_code, service_name
    ORDER BY service_code
  `;
  return rows as ServiceType[];
}
