import type { Metadata } from "next";
import Link from "next/link";
import { getFacilityById } from "@/lib/queries";
import { notFound } from "next/navigation";
import { slugFromPrefecture } from "@/lib/prefecture-slugs";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ prefecture: string; city: string; id: string }> }): Promise<Metadata> {
  const { city, id } = await params;
  const c = decodeURIComponent(city);
  const facility = await getFacilityById(Number(id));
  if (!facility) return { title: "事業所が見つかりません" };
  const title = `${facility.name} | ${c}の${facility.service_name}`;
  const description = `${c}の${facility.service_name}『${facility.name}』の住所・電話番号・定員などを掲載しています。`;
  return {
    title,
    description,
    openGraph: { title, description },
  };
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value) return null;
  return (
    <div className="grid grid-cols-[120px_1fr] sm:grid-cols-[160px_1fr] gap-2 py-3 border-b border-gray-100">
      <dt className="text-sm text-gray-500 font-medium">{label}</dt>
      <dd className="text-sm text-gray-800">{value}</dd>
    </div>
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

  const facility = await getFacilityById(Number(id));
  if (!facility) notFound();

  const fullAddress = facility.address + (facility.building ? ` ${facility.building}` : "");
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;

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
    ...(facility.url && { url: facility.url }),
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
        {facility.name_kana && (
          <p className="text-sm text-gray-400 mb-6">{facility.name_kana}</p>
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
            facility.tel && <a href={`tel:${facility.tel}`} className="text-primary hover:underline">{facility.tel}</a>
          } />
          <DetailRow label="FAX番号" value={facility.fax} />
          <DetailRow label="利用可能曜日" value={facility.available_days} />
          <DetailRow label="曜日特記事項" value={facility.available_days_note} />
          <DetailRow label="定員" value={facility.capacity ? `${facility.capacity}名` : null} />
          <DetailRow label="法人名" value={facility.corp_name} />
          <DetailRow label="法人番号" value={facility.corp_number} />
          <DetailRow label="事業所番号" value={facility.jigyosho_number} />
          <DetailRow label="URL" value={
            facility.url && (
              <a href={facility.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">
                {facility.url}
              </a>
            )
          } />
        </dl>
      </div>
    </>
  );
}
