import type { Metadata } from "next";
import Link from "next/link";
import { getServicesByCity } from "@/lib/queries";
import { getCareMetrics } from "@/lib/care-metrics-presenter";
import type { CareMetricsPresentation } from "@/lib/care-metrics-presenter";
import { slugFromPrefecture } from "@/lib/prefecture-slugs";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ prefecture: string; city: string }> }): Promise<Metadata> {
  const { prefecture, city } = await params;
  const c = decodeURIComponent(city);
  const services = await getServicesByCity(decodeURIComponent(prefecture), c);
  const title = `${c}の介護施設・${services.length}種類`;
  const description = `${c}で利用できる介護サービスを種類別に探せます。`;
  return {
    title,
    description,
    openGraph: { title, description },
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

export default async function CityPage({ params }: { params: Promise<{ prefecture: string; city: string }> }) {
  const { prefecture, city } = await params;
  const pref = decodeURIComponent(prefecture);
  const c = decodeURIComponent(city);
  const [services, metrics] = await Promise.all([
    getServicesByCity(pref, c),
    getCareMetrics(pref, c),
  ]);

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
  );
}
