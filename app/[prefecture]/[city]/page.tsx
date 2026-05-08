import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { getServicesByCity, getMappedCityAgg } from "@/lib/queries";
import type { ServiceType } from "@/lib/queries";
import { getCareMetrics } from "@/lib/care-metrics-presenter";
import type { CareMetricsPresentation } from "@/lib/care-metrics-presenter";
import { slugFromPrefecture } from "@/lib/prefecture-slugs";
import {
  CARE_SERVICE_GROUPS,
  classifyCareService,
} from "@/lib/care-service-groups";
import type { CareServiceGroupKey } from "@/lib/care-service-groups";

export const revalidate = 86400;

const BASE = "https://www.kaigosagashi.jp";

export async function generateMetadata({ params }: { params: Promise<{ prefecture: string; city: string }> }): Promise<Metadata> {
  const { prefecture, city } = await params;
  const pref = decodeURIComponent(prefecture);
  const c = decodeURIComponent(city);
  const cityAgg = await getMappedCityAgg(pref, c);
  if (cityAgg) {
    permanentRedirect(`/${encodeURIComponent(pref)}/${encodeURIComponent(cityAgg)}`);
  }
  const services = await getServicesByCity(pref, c);
  const title = `${c}の介護施設・${services.length}種類`;
  const description = `${c}で利用できる介護サービスを種類別に探せます。`;
  return {
    title,
    description,
    openGraph: { title, description },
    alternates: {
      canonical: `${BASE}/${encodeURIComponent(pref)}/${encodeURIComponent(c)}`,
    },
  };
}

function ConfidenceBadge({ confidence }: { confidence: string }) {
  const styles: Record<string, string> = {
    high: "bg-primary/10 text-primary",
    medium: "bg-primary/10 text-primary",
    low: "bg-amber-50 text-amber-700",
  };
  const labels: Record<string, string> = {
    high: "信頼度：高",
    medium: "信頼度：中",
    low: "参考値",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${styles[confidence] ?? styles.low}`}>
      {labels[confidence] ?? "参考値"}
    </span>
  );
}

function CareMetricsSection({ metrics }: { metrics: CareMetricsPresentation }) {
  const showSufficiency = metrics.display_flag !== "hide";
  const hasCertification = metrics.certification_rate != null;

  if (!showSufficiency && !hasCertification) return null;

  return (
    <section className="bg-bg-card border border-gray-200 rounded-lg px-5 py-4 mb-8">
      <h2 className="font-serif text-base font-bold text-primary mb-3">
        この地域の介護指標
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 入所系施設カバー率 */}
        {showSufficiency && metrics.sufficiency_rate != null && (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-gray-500">{metrics.display_label}</span>
              <ConfidenceBadge confidence={metrics.metric_confidence} />
            </div>
            <p className="text-2xl font-bold text-gray-800">
              {metrics.sufficiency_rate.toFixed(1)}
              <span className="text-sm font-normal text-gray-500 ml-0.5">%</span>
            </p>
          </div>
        )}

        {/* 介護認定率 */}
        {hasCertification && (
          <div>
            <span className="text-xs text-gray-500 block mb-1">介護認定率</span>
            <p className="text-2xl font-bold text-gray-800">
              {metrics.certification_rate!.toFixed(1)}
              <span className="text-sm font-normal text-gray-500 ml-0.5">%</span>
            </p>
          </div>
        )}
      </div>

      {/* 説明文・地域特徴 */}
      {showSufficiency && (
        <p className="text-sm text-gray-600 mt-3 leading-relaxed">
          {metrics.display_description}
          {metrics.area_characteristics && (
            <span className="text-gray-400 ml-1">（{metrics.area_characteristics}）</span>
          )}
        </p>
      )}

      {/* 注意メッセージ */}
      {metrics.warning_message && (
        <p className="text-xs text-amber-600 bg-amber-50 rounded px-3 py-1.5 mt-3">
          {metrics.warning_message}
        </p>
      )}

      <p className="text-xs text-gray-400 mt-3">
        <Link href="/data/metrics" className="hover:text-primary hover:underline">
          指標の計算方法と見方について →
        </Link>
      </p>
    </section>
  );
}

interface ServiceGroupSummary {
  key: CareServiceGroupKey;
  label: string;
  facilityCount: number;
  capacitySum: number;
  capacityKnownCount: number;
}

function summarizeServiceGroups(services: ServiceType[]): {
  groups: ServiceGroupSummary[];
  totalFacilities: number;
} {
  const init = new Map<CareServiceGroupKey, ServiceGroupSummary>(
    CARE_SERVICE_GROUPS.map((g) => [
      g.key,
      {
        key: g.key,
        label: g.label,
        facilityCount: 0,
        capacitySum: 0,
        capacityKnownCount: 0,
      },
    ]),
  );

  let totalFacilities = 0;
  for (const s of services) {
    totalFacilities += s.facility_count;
    const key = classifyCareService(s.service_name, s.service_code);
    if (key === "other") continue;
    const acc = init.get(key)!;
    acc.facilityCount += s.facility_count;
    acc.capacitySum += s.capacity_sum ?? 0;
    acc.capacityKnownCount += s.capacity_known_count;
  }

  return {
    groups: CARE_SERVICE_GROUPS.map((g) => init.get(g.key)!),
    totalFacilities,
  };
}

function CityCareServiceSummary({
  city,
  services,
}: {
  city: string;
  services: ServiceType[];
}) {
  const { groups, totalFacilities } = summarizeServiceGroups(services);
  if (totalFacilities === 0) return null;

  const residential = groups.find((g) => g.key === "residential")!;
  const showResidentialCapacity =
    residential.facilityCount > 0 && residential.capacityKnownCount > 0;
  const partialCapacity =
    showResidentialCapacity &&
    residential.capacityKnownCount < residential.facilityCount;

  return (
    <section className="bg-bg-card border border-gray-200 rounded-lg px-5 py-4 mb-8">
      <h2 className="font-serif text-base font-bold text-primary mb-3">
        {city}の介護サービス種別の内訳
      </h2>

      <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3 mb-4">
        <div>
          <dt className="text-xs text-gray-500 mb-0.5">総施設・事業所数</dt>
          <dd className="text-xl font-bold text-gray-800">
            {totalFacilities.toLocaleString()}
            <span className="text-sm font-normal text-gray-500 ml-0.5">件</span>
          </dd>
        </div>
        {groups.map((g) => (
          <div key={g.key}>
            <dt className="text-xs text-gray-500 mb-0.5">{g.label}</dt>
            <dd className="text-xl font-bold text-gray-800">
              {g.facilityCount.toLocaleString()}
              <span className="text-sm font-normal text-gray-500 ml-0.5">件</span>
            </dd>
          </div>
        ))}
      </dl>

      {showResidentialCapacity && (
        <p className="text-sm text-gray-600 mb-3">
          入所系の定員合計:{" "}
          <span className="font-bold text-gray-800">
            {residential.capacitySum.toLocaleString()}人
          </span>
          {partialCapacity && (
            <span className="text-xs text-gray-400 ml-2">
              （定員情報のある施設のみ集計）
            </span>
          )}
        </p>
      )}

      <p className="text-sm text-gray-600 leading-relaxed">
        {city}には、入所系・通所系・訪問系など複数の介護サービスがあります。
        親の介護施設や在宅介護サービスを探す場合は、施設数だけでなく、サービスの種類や定員、
        実際の空き状況をあわせて確認することが大切です。
      </p>
    </section>
  );
}

function CareSearchAdviceCard() {
  return (
    <section className="bg-bg-card border border-gray-200 rounded-lg px-5 py-4 mb-8">
      <h2 className="font-serif text-base font-bold text-primary mb-3">
        介護施設を探すときの確認ポイント
      </h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        施設数や定員は地域の傾向を知る参考になりますが、実際の空き状況・費用・医療対応・認知症対応は
        施設ごとに異なります。気になる施設がある場合は、公式情報や相談窓口で最新情報を確認しましょう。
      </p>
      <Link
        href="/guides/care-service-types"
        className="inline-block text-sm text-primary font-medium hover:underline"
      >
        介護サービスの種類を確認する →
      </Link>
    </section>
  );
}

export default async function CityPage({ params }: { params: Promise<{ prefecture: string; city: string }> }) {
  const { prefecture, city } = await params;
  const pref = decodeURIComponent(prefecture);
  const c = decodeURIComponent(city);

  const cityAgg = await getMappedCityAgg(pref, c);
  if (cityAgg) {
    permanentRedirect(`/${encodeURIComponent(pref)}/${encodeURIComponent(cityAgg)}`);
  }

  const [services, metrics] = await Promise.all([
    getServicesByCity(pref, c),
    getCareMetrics(pref, c),
  ]);

  if (services.length === 0 && !metrics) notFound();

  return (
    <>
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-primary">トップ</Link>
        <span className="mx-2">›</span>
        <Link href={`/prefecture/${slugFromPrefecture(pref) ?? pref}`} className="hover:text-primary">{pref}</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-800">{c}</span>
      </nav>

      <h1 className="font-serif text-2xl font-bold text-primary mb-2">
        {pref}{c}
      </h1>
      <p className="text-gray-600 mb-6">
        サービスの種類を選択してください。
      </p>

      {metrics && <CareMetricsSection metrics={metrics} />}

      <CityCareServiceSummary city={c} services={services} />

      <CareSearchAdviceCard />

      {services.length > 0 && (
        <>
          <h2 className="font-serif text-lg font-bold text-primary mb-3">
            サービス種別から探す
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {services.map((s) => (
              <Link
                key={s.service_code}
                href={`/${pref}/${c}/${s.service_code}`}
                className="bg-bg-card border border-gray-200 rounded-lg px-5 py-4 hover:border-accent hover:shadow-md transition-all flex justify-between items-center"
              >
                <div>
                  <span className="font-medium text-gray-800 block">{s.service_name}</span>
                  <span className="text-xs text-gray-400">コード: {s.service_code}</span>
                </div>
                <span className="text-sm text-primary font-medium whitespace-nowrap ml-4">
                  {Number(s.facility_count).toLocaleString()}件
                </span>
              </Link>
            ))}
          </div>
        </>
      )}
    </>
  );
}
