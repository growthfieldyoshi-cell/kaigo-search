import { cache } from 'react';
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
  capacity_sum: number | null;
  capacity_known_count: number;
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

/**
 * 指定都道府県の市区町村一覧（施設数付き）。
 *
 * facilities.city は政令指定都市の場合 city_raw（行政区単位、例: 「大阪市住吉区」）で格納されているため、
 * municipality_mapping を経由して city_agg（市単位、例: 「大阪市」）に集約してから返す。
 * sitemap の city_agg URL と内部リンクを揃えるため、出力 city は必ず city_agg に正規化済み。
 * 通常市区町村（mapping ヒットなし）は f.city がそのまま返る。
 */
export async function getCitiesByPref(prefecture: string): Promise<City[]> {
  const rows = await sql`
    SELECT
      COALESCE(NULLIF(m.city_agg, ''), f.city) AS city,
      COUNT(*)::int AS facility_count
    FROM facilities f
    LEFT JOIN municipality_mapping m
      ON m.source_table = 'facilities'
     AND m.prefecture = f.prefecture
     AND m.city_raw = f.city
     AND m.status = 'confirmed'
    WHERE f.prefecture = ${prefecture}
    GROUP BY COALESCE(NULLIF(m.city_agg, ''), f.city)
    ORDER BY COALESCE(NULLIF(m.city_agg, ''), f.city)
  `;
  return rows as City[];
}

/**
 * city_raw → city_agg を解決する軽量関数（redirect 判定専用）。
 *
 * 戻り値:
 * - municipality_mapping にヒットしない（通常市区町村）→ null
 * - city_agg が NULL / 空文字 → null
 * - city_agg === 引数 city（自分自身、無限リダイレクト防止）→ null
 * - それ以外 → city_agg を返す
 *
 * 同一リクエスト内で metadata と page の両方から呼ばれるため React.cache で SQL 1回に抑制。
 */
export const getMappedCityAgg = cache(
  async (prefecture: string, city: string): Promise<string | null> => {
    const rows = await sql`
      SELECT city_agg
      FROM municipality_mapping
      WHERE source_table = 'facilities'
        AND prefecture = ${prefecture}
        AND city_raw = ${city}
        AND status = 'confirmed'
      LIMIT 1
    `;
    const cityAgg = rows[0]?.city_agg as string | null | undefined;
    if (!cityAgg) return null;
    if (cityAgg.trim() === '') return null;
    if (cityAgg === city) return null;
    return cityAgg;
  },
);

/**
 * 施設データから canonical city を解決する。
 *
 * 用途: 施設詳細ページで facility.prefecture / facility.city（city_raw のことが多い）
 * から「正規 URL に使うべき city」を作る。
 *
 * 戻り値（必ず string を返す）:
 * - confirmed mapping にヒット かつ city_agg が非空 → city_agg
 * - それ以外（通常市・mapping 未確定など） → 引数 city をそのまま返す
 *
 * getMappedCityAgg と違って null を返さないため、canonical URL 構築に直接使える。
 */
export const getCanonicalCityForFacility = cache(
  async (prefecture: string, city: string): Promise<string> => {
    const rows = await sql`
      SELECT city_agg
      FROM municipality_mapping
      WHERE source_table = 'facilities'
        AND prefecture = ${prefecture}
        AND city_raw = ${city}
        AND status = 'confirmed'
      LIMIT 1
    `;
    const cityAgg = rows[0]?.city_agg as string | null | undefined;
    if (cityAgg && cityAgg.trim() !== '') return cityAgg;
    return city;
  },
);

/**
 * 施設一覧（都道府県・市区町村必須、サービスコード任意、ページネーション対応）。
 *
 * facilities.city は政令指定都市の場合、行政区単位（例: 「大阪市北区」）で格納されているため、
 * getServicesByCity と同様に municipality_mapping を経由して city_agg → city_raw[] を解決する。
 * 通常市区町村（mapping ヒットなし）の場合は city = ${city} のみがヒットし、従来挙動と同じ。
 */
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
          AND service_code = ${serviceCode}
          AND (
            city = ${city}
            OR city IN (
              SELECT city_raw FROM municipality_mapping
              WHERE source_table = 'facilities'
                AND prefecture = ${prefecture}
                AND city_agg = ${city}
                AND status = 'confirmed'
            )
          )
        ORDER BY name
        LIMIT ${limit} OFFSET ${offset}
      `,
      sql`
        SELECT COUNT(*) AS count
        FROM facilities
        WHERE prefecture = ${prefecture}
          AND service_code = ${serviceCode}
          AND (
            city = ${city}
            OR city IN (
              SELECT city_raw FROM municipality_mapping
              WHERE source_table = 'facilities'
                AND prefecture = ${prefecture}
                AND city_agg = ${city}
                AND status = 'confirmed'
            )
          )
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
        AND (
          city = ${city}
          OR city IN (
            SELECT city_raw FROM municipality_mapping
            WHERE source_table = 'facilities'
              AND prefecture = ${prefecture}
              AND city_agg = ${city}
              AND status = 'confirmed'
          )
        )
      ORDER BY service_code, name
      LIMIT ${limit} OFFSET ${offset}
    `,
    sql`
      SELECT COUNT(*) AS count
      FROM facilities
      WHERE prefecture = ${prefecture}
        AND (
          city = ${city}
          OR city IN (
            SELECT city_raw FROM municipality_mapping
            WHERE source_table = 'facilities'
              AND prefecture = ${prefecture}
              AND city_agg = ${city}
              AND status = 'confirmed'
          )
        )
    `,
  ]);
  return {
    facilities: rows as Facility[],
    totalCount: Number(countRows[0].count),
  };
}

/** 関連施設リスト用の軽量型（一覧カードに必要なカラムのみ） */
export interface RelatedFacility {
  id: number;
  name: string;
  service_name: string;
  prefecture: string;
  city: string;
  address: string;
  tel: string | null;
  url: string | null;
  service_code: string;
}

/**
 * 同じ都道府県・市区町村・サービス種別の他施設を取得（現在施設は除外）。
 *
 * city 解決は getFacilities / getServicesByCity と同じ municipality_mapping パターン。
 * 政令指定都市（city_agg）の場合は行政区横断で取得、通常市は city = ${city} のみがヒット。
 *
 * 並び順は id ASC で固定（キャッシュ・表示安定性のためランダム禁止）。
 */
export async function getRelatedFacilitiesByService(
  prefecture: string,
  city: string,
  serviceCode: string,
  excludeId: number,
  limit = 5,
): Promise<RelatedFacility[]> {
  const rows = await sql`
    SELECT id, name, service_name, prefecture, city, address, tel, url, service_code
    FROM facilities
    WHERE prefecture = ${prefecture}
      AND service_code = ${serviceCode}
      AND id <> ${excludeId}
      AND (
        city = ${city}
        OR city IN (
          SELECT city_raw FROM municipality_mapping
          WHERE source_table = 'facilities'
            AND prefecture = ${prefecture}
            AND city_agg = ${city}
            AND status = 'confirmed'
        )
      )
    ORDER BY id ASC
    LIMIT ${limit}
  `;
  return rows.map((r) => ({
    id: Number(r.id),
    name: r.name as string,
    service_name: r.service_name as string,
    prefecture: r.prefecture as string,
    city: r.city as string,
    address: r.address as string,
    tel: (r.tel as string | null) ?? null,
    url: (r.url as string | null) ?? null,
    service_code: r.service_code as string,
  }));
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

/** sitemap 用: facilities に存在する市区町村を city_agg に集約して列挙 */
export async function getAllCityAggsForSitemap(): Promise<
  Array<{ prefecture: string; city: string }>
> {
  const rows = await sql`
    SELECT DISTINCT
      f.prefecture AS prefecture,
      COALESCE(m.city_agg, f.city) AS city
    FROM facilities f
    LEFT JOIN municipality_mapping m
      ON m.source_table = 'facilities'
     AND m.prefecture = f.prefecture
     AND m.city_raw = f.city
     AND m.status = 'confirmed'
    ORDER BY f.prefecture, city
  `;
  return rows.map((r) => ({
    prefecture: r.prefecture as string,
    city: r.city as string,
  }));
}

/** sitemap 用: facilities に存在する (city_agg, service_code) ペアを列挙（施設0件の組合せは含めない） */
export async function getAllCityServicesForSitemap(): Promise<
  Array<{ prefecture: string; city: string; service_code: string }>
> {
  const rows = await sql`
    SELECT DISTINCT
      f.prefecture AS prefecture,
      COALESCE(m.city_agg, f.city) AS city,
      f.service_code AS service_code
    FROM facilities f
    LEFT JOIN municipality_mapping m
      ON m.source_table = 'facilities'
     AND m.prefecture = f.prefecture
     AND m.city_raw = f.city
     AND m.status = 'confirmed'
    ORDER BY f.prefecture, city, f.service_code
  `;
  return rows.map((r) => ({
    prefecture: r.prefecture as string,
    city: r.city as string,
    service_code: r.service_code as string,
  }));
}

/**
 * 指定市区町村のサービス種別一覧（施設数・定員集計付き）。
 *
 * facilities.city は政令指定都市の場合、行政区単位（例: 「大阪市北区」）で格納されている。
 * 一方、ランキング等から市区町村ページへ来る URL は city_agg（市単位、例: 「大阪市」）。
 * そのため municipality_mapping を経由して、city_agg に紐づく city_raw[] を含めて集計する。
 * 通常市区町村（mapping ヒットなし）の場合は city = ${city} だけがヒットし、従来挙動と同じ。
 */
export async function getServicesByCity(
  prefecture: string,
  city: string,
): Promise<ServiceType[]> {
  const rows = await sql`
    SELECT
      service_code,
      service_name,
      COUNT(*)::int AS facility_count,
      SUM(capacity)::int AS capacity_sum,
      COUNT(capacity)::int AS capacity_known_count
    FROM facilities
    WHERE prefecture = ${prefecture}
      AND (
        city = ${city}
        OR city IN (
          SELECT city_raw FROM municipality_mapping
          WHERE source_table = 'facilities'
            AND prefecture = ${prefecture}
            AND city_agg = ${city}
            AND status = 'confirmed'
        )
      )
    GROUP BY service_code, service_name
    ORDER BY service_code
  `;
  return rows.map((r) => ({
    service_code: r.service_code as string,
    service_name: r.service_name as string,
    facility_count: Number(r.facility_count),
    capacity_sum: r.capacity_sum != null ? Number(r.capacity_sum) : null,
    capacity_known_count: Number(r.capacity_known_count),
  }));
}
