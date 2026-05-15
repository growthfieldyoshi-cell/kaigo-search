import type { Metadata } from "next";
import Link from "next/link";
import {
  getFacilityById,
  getRelatedFacilitiesByService,
  getMappedCityAgg,
  getCanonicalCityForFacility,
} from "@/lib/queries";
import type { RelatedFacility } from "@/lib/queries";
import { notFound, permanentRedirect } from "next/navigation";
import { slugFromPrefecture } from "@/lib/prefecture-slugs";
import {
  classifyCareService,
  CARE_SERVICE_GROUP_GUIDANCE,
} from "@/lib/care-service-groups";

export const revalidate = 86400;

const BASE = "https://www.kaigosagashi.jp";

export async function generateMetadata({ params }: { params: Promise<{ prefecture: string; city: string; service_code: string; id: string }> }): Promise<Metadata> {
  const { prefecture, city, service_code, id } = await params;
  const pref = decodeURIComponent(prefecture);
  const c = decodeURIComponent(city);

  const cityAgg = await getMappedCityAgg(pref, c);
  if (cityAgg) {
    permanentRedirect(`/${encodeURIComponent(pref)}/${encodeURIComponent(cityAgg)}/${service_code}/${id}`);
  }

  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    return { title: "事業所が見つかりません" };
  }
  const facility = await getFacilityById(numericId);
  if (!facility) return { title: "事業所が見つかりません" };

  // canonical / title / description は URL params ではなく facility 実データ由来で組み立てる。
  // URL params が施設と不一致でも、ここで返す canonical は常に正規 URL を指す。
  // 実 HTTP の正規化は本体側 permanentRedirect が担う。
  const canonicalCity = await getCanonicalCityForFacility(
    facility.prefecture,
    facility.city,
  );
  const canonicalUrl = `${BASE}/${encodeURIComponent(facility.prefecture)}/${encodeURIComponent(canonicalCity)}/${facility.service_code}/${facility.id}`;
  const title = `${facility.name} | ${canonicalCity}の${facility.service_name}`;
  const description = `${canonicalCity}の${facility.service_name}『${facility.name}』の住所・電話番号・定員などを掲載しています。`;

  // 低品質ページの noindex 判定:
  // 住所・電話・定員いずれも欠損している施設はインデックス対象から外す。
  // 詳細ページとしての情報価値が乏しく、検索結果に出ても利用者の利益にならないため。
  const hasMeaningfulAddress =
    !!facility.address && isMeaningfulStringValue(facility.address);
  const hasMeaningfulTel =
    !!facility.tel && isMeaningfulStringValue(facility.tel);
  const hasMeaningfulCapacity = !!facility.capacity && facility.capacity > 0;
  const isLowQuality =
    !hasMeaningfulAddress && !hasMeaningfulTel && !hasMeaningfulCapacity;

  const meta: Metadata = {
    title,
    description,
    openGraph: { title, description },
    alternates: { canonical: canonicalUrl },
  };
  if (isLowQuality) {
    meta.robots = { index: false, follow: true };
  }
  return meta;
}

function getSafeExternalUrl(url?: string | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

// 表示価値のないプレースホルダ値を判定するヘルパー
// 元データに "同上"、"-"、"なし"、"0" などのノイズ値が含まれることがあるため、
// 文字列値ではここで弾いて表示しない。
const PLACEHOLDER_TEXT_VALUES = new Set([
  "同上",
  "-",
  "ー",
  "−",
  "—",
  "ない",
  "なし",
  "未定",
  "不明",
  "null",
  "undefined",
  "n/a",
  "N/A",
]);

function isMeaningfulStringValue(s: string): boolean {
  const trimmed = s.trim();
  if (trimmed === "") return false;
  if (PLACEHOLDER_TEXT_VALUES.has(trimmed)) return false;
  if (PLACEHOLDER_TEXT_VALUES.has(trimmed.toLowerCase())) return false;
  return true;
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  // 文字列・数値値の場合は、空文字・プレースホルダ値・0などを弾く
  if (value == null) return null;
  if (typeof value === "string" && !isMeaningfulStringValue(value)) return null;
  if (typeof value === "number" && value === 0) return null;
  if (!value) return null;
  return (
    <div className="grid grid-cols-[120px_1fr] sm:grid-cols-[160px_1fr] gap-2 py-3 border-b border-gray-100">
      <dt className="text-sm text-gray-500 font-medium">{label}</dt>
      <dd className="text-sm text-gray-800">{value}</dd>
    </div>
  );
}

function OfficialSiteCTA({ url }: { url: string | null | undefined }) {
  const safeUrl = getSafeExternalUrl(url);
  if (!safeUrl) return null;
  return (
    <section className="bg-bg-card border border-gray-200 rounded-lg px-5 py-4 sm:px-6 sm:py-5 mt-6">
      <h2 className="font-serif text-base font-bold text-primary mb-2">
        公式情報を確認する
      </h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        空き状況・費用・対応内容などの最新情報は、公式サイトや事業所へ直接確認してください。
      </p>
      <a
        href={safeUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="公式サイトを見る（外部サイト）"
        className="inline-flex items-center gap-1 border border-primary text-primary text-sm font-medium rounded-md px-5 py-2.5 hover:bg-primary/5 transition-colors"
      >
        公式サイトを見る ↗
      </a>
    </section>
  );
}

function FacilityCheckPoints({
  serviceName,
  serviceCode,
}: {
  serviceName: string;
  serviceCode: string;
}) {
  const groupKey = classifyCareService(serviceName, serviceCode);
  const guidance = CARE_SERVICE_GROUP_GUIDANCE[groupKey];

  return (
    <section className="bg-bg-card border border-gray-200 rounded-lg px-5 py-4 sm:px-6 sm:py-5 mt-6">
      <h2 className="font-serif text-base font-bold text-primary mb-3">
        この施設を確認するときのポイント
      </h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-3">
        掲載している情報は、公開データをもとにした基本情報です。
        実際に利用を検討する場合は、空き状況・費用・対応できる介護内容・医療対応・認知症対応・送迎範囲などを、
        公式情報や事業所へ直接確認することが大切です。
      </p>
      <p className="text-sm text-gray-600 leading-relaxed mb-3">
        {guidance.description}
      </p>
      <ul className="text-sm text-gray-700 space-y-1.5 list-disc pl-5">
        {guidance.checkItems.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

function RelatedFacilitiesSection({
  pref,
  city,
  serviceCode,
  serviceName,
  facilities,
}: {
  pref: string;
  city: string;
  serviceCode: string;
  serviceName: string;
  facilities: RelatedFacility[];
}) {
  if (facilities.length === 0) return null;

  return (
    <section className="bg-bg-card border border-gray-200 rounded-lg px-5 py-4 sm:px-6 sm:py-5 mt-6">
      <h2 className="font-serif text-base font-bold text-primary mb-3">
        同じ地域の{serviceName}
      </h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        {city}で同じ{serviceName}に分類される施設・事業所を一部掲載しています。
        利用条件や対応内容は施設ごとに異なるため、詳細ページや公式情報をご確認ください。
      </p>
      <ul className="space-y-2">
        {facilities.map((f) => (
          <li key={f.id}>
            <Link
              href={`/${pref}/${city}/${serviceCode}/${f.id}`}
              className="block border border-gray-200 rounded-md px-4 py-3 hover:border-accent hover:shadow-sm transition-all"
            >
              <div className="text-sm font-medium text-gray-800 mb-0.5">
                {f.name}
              </div>
              <div className="text-xs text-gray-500">{f.address}</div>
              <div className="text-xs text-gray-400 mt-0.5">
                {f.service_name}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function FacilityComparisonGuides() {
  const guides = [
    {
      href: "/guides/how-to-choose-care-facility",
      title: "介護施設の探し方",
      description: "最初に確認すべき流れと相談先",
    },
    {
      href: "/guides/care-service-types",
      title: "介護サービスの種類と選び方",
      description: "訪問・通所・入所など主要サービスの違い",
    },
    {
      href: "/guides/facility-visit-checklist",
      title: "施設見学のチェックリスト",
      description: "家族が見るべき確認ポイント",
    },
    {
      href: "/guides/care-facility-cost",
      title: "介護施設の費用の見方",
      description: "月額費用・入居一時金・自己負担の基本",
    },
  ];

  return (
    <section className="bg-bg-card border border-gray-200 rounded-lg px-5 py-4 sm:px-6 sm:py-5 mt-6">
      <h2 className="font-serif text-base font-bold text-primary mb-2">
        介護施設を比較するときに確認したいこと
      </h2>
      <p className="text-sm text-gray-700 leading-relaxed mb-4">
        施設を選ぶときは、サービス種別・費用・見学時の確認項目もあわせて確認しましょう。空き状況や費用、医療対応などは施設や自治体、ケアマネジャー等へ直接確認することが大切です。
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {guides.map((g) => (
          <Link
            key={g.href}
            href={g.href}
            className="block border border-gray-200 rounded-lg px-4 py-3 hover:border-accent hover:shadow-sm transition-all"
          >
            <span className="font-medium text-gray-800 text-sm block mb-1">
              {g.title}
            </span>
            <span className="text-xs text-gray-500">{g.description}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function FacilityRelatedLinks({
  pref,
  city,
  serviceCode,
  serviceName,
}: {
  pref: string;
  city: string;
  serviceCode: string;
  serviceName: string;
}) {
  return (
    <section className="bg-bg-card border border-gray-200 rounded-lg px-5 py-4 sm:px-6 sm:py-5 mt-6">
      <h2 className="font-serif text-base font-bold text-primary mb-3">
        同じ地域の{serviceName}を探す
      </h2>
      <ul className="space-y-2">
        <li>
          <Link
            href={`/${pref}/${city}/${serviceCode}`}
            className="text-sm text-primary font-medium hover:underline"
          >
            {city}の{serviceName}一覧を見る →
          </Link>
        </li>
        <li>
          <Link
            href={`/${pref}/${city}`}
            className="text-sm text-primary font-medium hover:underline"
          >
            {city}の介護施設・介護サービス一覧を見る →
          </Link>
        </li>
        <li>
          <Link
            href="/guides/care-service-types"
            className="text-sm text-primary font-medium hover:underline"
          >
            介護サービスの種類を確認する →
          </Link>
        </li>
      </ul>
    </section>
  );
}

export default async function FacilityDetailPage({
  params,
}: {
  params: Promise<{ prefecture: string; city: string; service_code: string; id: string }>;
}) {
  const { prefecture, city, service_code, id } = await params;
  const pref = decodeURIComponent(prefecture);
  const c = decodeURIComponent(city);

  const cityAgg = await getMappedCityAgg(pref, c);
  if (cityAgg) {
    permanentRedirect(`/${encodeURIComponent(pref)}/${encodeURIComponent(cityAgg)}/${service_code}/${id}`);
  }

  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) notFound();

  const facility = await getFacilityById(numericId);
  if (!facility) notFound();

  // URL 整合性ガード: URL params が施設実データと一致しない場合は正規URLへ permanentRedirect。
  // 同一 id を異なる prefecture/city/service_code で叩いた場合の自己 canonical 汚染を防ぐ。
  // （city_raw URL も canonicalCity が city_agg を返すため、ここで一発で正規化される。）
  const canonicalCity = await getCanonicalCityForFacility(
    facility.prefecture,
    facility.city,
  );
  if (
    pref !== facility.prefecture ||
    c !== canonicalCity ||
    service_code !== facility.service_code ||
    id !== String(facility.id)
  ) {
    permanentRedirect(
      `/${encodeURIComponent(facility.prefecture)}/${encodeURIComponent(canonicalCity)}/${facility.service_code}/${facility.id}`,
    );
  }

  const relatedFacilities = await getRelatedFacilitiesByService(
    pref,
    c,
    service_code,
    numericId,
    5,
  );

  // building もプレースホルダ値（"同上" 等）の場合は連結しない
  const buildingPart =
    facility.building && isMeaningfulStringValue(facility.building)
      ? ` ${facility.building}`
      : "";
  const fullAddress = facility.address + buildingPart;
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
  const safeFacilityUrl = getSafeExternalUrl(facility.url);
  // プレースホルダ値（"同上" 等）の電話・FAX は非表示にする
  const cleanTel = facility.tel && isMeaningfulStringValue(facility.tel) ? facility.tel : null;
  const cleanFax = facility.fax && isMeaningfulStringValue(facility.fax) ? facility.fax : null;
  const cleanNameKana = facility.name_kana && isMeaningfulStringValue(facility.name_kana) ? facility.name_kana : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: facility.name,
    description: `${c}の${facility.service_name}`,
    address: {
      "@type": "PostalAddress",
      addressRegion: pref,
      addressLocality: c,
      streetAddress: facility.address,
    },
    ...(facility.tel && { telephone: facility.tel }),
    ...(safeFacilityUrl && { url: safeFacilityUrl }),
    ...(facility.lat && facility.lng && {
      geo: {
        "@type": "GeoCoordinates",
        latitude: facility.lat,
        longitude: facility.lng,
      },
    }),
    areaServed: {
      "@type": "AdministrativeArea",
      name: `${pref}${c}`,
    },
    ...(facility.capacity && {
      additionalProperty: {
        "@type": "PropertyValue",
        name: "定員",
        value: facility.capacity,
      },
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-primary">トップ</Link>
        <span className="mx-2">›</span>
        <Link href={`/prefecture/${slugFromPrefecture(pref) ?? pref}`} className="hover:text-primary">{pref}</Link>
        <span className="mx-2">›</span>
        <Link href={`/${pref}/${c}`} className="hover:text-primary">{c}</Link>
        <span className="mx-2">›</span>
        <Link href={`/${pref}/${c}/${service_code}`} className="hover:text-primary">{facility.service_name}</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-800">{facility.name}</span>
      </nav>

      <div className="bg-bg-card border border-gray-200 rounded-lg p-6 sm:p-8">
        <h1 className="font-serif text-2xl font-bold text-primary mb-1">
          {facility.name}
        </h1>
        {cleanNameKana && (
          <p className="text-sm text-gray-400 mb-6">{cleanNameKana}</p>
        )}

        <dl>
          <DetailRow label="サービス種別" value={facility.service_name} />
          <DetailRow label="住所" value={
            <span>
              {fullAddress}
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-primary hover:underline text-xs"
              >
                地図を見る↗
              </a>
            </span>
          } />
          <DetailRow label="電話番号" value={
            cleanTel && <a href={`tel:${cleanTel}`} className="text-primary hover:underline">{cleanTel}</a>
          } />
          <DetailRow label="FAX番号" value={cleanFax} />
          <DetailRow label="利用可能曜日" value={facility.available_days} />
          <DetailRow label="曜日特記事項" value={facility.available_days_note} />
          <DetailRow label="定員" value={facility.capacity ? `${facility.capacity}名` : null} />
          <DetailRow label="法人名" value={facility.corp_name} />
          <DetailRow label="法人番号" value={facility.corp_number} />
          <DetailRow label="事業所番号" value={facility.jigyosho_number} />
          <DetailRow label="URL" value={
            safeFacilityUrl && (
              <a href={safeFacilityUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">
                {safeFacilityUrl}
              </a>
            )
          } />
        </dl>
      </div>

      <OfficialSiteCTA url={facility.url} />

      <FacilityCheckPoints
        serviceName={facility.service_name}
        serviceCode={service_code}
      />

      <FacilityComparisonGuides />

      <RelatedFacilitiesSection
        pref={pref}
        city={c}
        serviceCode={service_code}
        serviceName={facility.service_name}
        facilities={relatedFacilities}
      />

      <FacilityRelatedLinks
        pref={pref}
        city={c}
        serviceCode={service_code}
        serviceName={facility.service_name}
      />
    </>
  );
}
