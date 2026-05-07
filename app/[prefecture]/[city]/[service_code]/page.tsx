import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getFacilities, getServiceName } from "@/lib/queries";
import { slugFromPrefecture } from "@/lib/prefecture-slugs";

export const revalidate = 86400;

const PER_PAGE = 20;

export async function generateMetadata({ params }: { params: Promise<{ prefecture: string; city: string; service_code: string }> }): Promise<Metadata> {
  const { prefecture, city, service_code } = await params;
  const c = decodeURIComponent(city);
  const serviceName = await getServiceName(service_code);
  const title = `${c}の${serviceName}一覧`;
  const description = `${c}の${serviceName}を提供する介護施設一覧です。`;
  return {
    title,
    description,
    openGraph: { title, description },
  };
}

export default async function ServicePage({
  params,
  searchParams,
}: {
  params: Promise<{ prefecture: string; city: string; service_code: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { prefecture, city, service_code } = await params;
  const pref = decodeURIComponent(prefecture);
  const c = decodeURIComponent(city);
  const sp = await searchParams;

  let page = 1;
  if (sp.page !== undefined) {
    const parsed = Number(sp.page);
    if (!Number.isInteger(parsed) || parsed <= 0) notFound();
    page = parsed;
  }
  const offset = (page - 1) * PER_PAGE;

  const { facilities, totalCount } = await getFacilities(pref, c, service_code, PER_PAGE, offset);
  if (totalCount === 0) notFound();
  const totalPages = Math.ceil(totalCount / PER_PAGE);
  if (page > totalPages) notFound();
  const serviceName = facilities[0]?.service_name ?? `サービス${service_code}`;

  return (
    <>
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-primary">トップ</Link>
        <span className="mx-2">›</span>
        <Link href={`/prefecture/${slugFromPrefecture(pref) ?? pref}`} className="hover:text-primary">{pref}</Link>
        <span className="mx-2">›</span>
        <Link href={`/${pref}/${c}`} className="hover:text-primary">{c}</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-800">{serviceName}</span>
      </nav>

      <h1 className="font-serif text-2xl font-bold text-primary mb-1">
        {serviceName}
      </h1>
      <p className="text-gray-600 mb-6">
        {pref}{c}（全{totalCount.toLocaleString()}件）
      </p>

      <div className="space-y-3 mb-8">
        {facilities.map((f) => (
          <Link
            key={f.id}
            href={`/${pref}/${c}/${service_code}/${f.id}`}
            className="bg-bg-card border border-gray-200 rounded-lg px-5 py-4 hover:border-accent hover:shadow-md transition-all block"
          >
            <h2 className="font-medium text-gray-900">{f.name}</h2>
            <p className="text-sm text-gray-500 mt-1">{f.address}{f.building ? ` ${f.building}` : ""}</p>
            {f.tel && <p className="text-sm text-gray-500">TEL: {f.tel}</p>}
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 flex-wrap">
          {page > 1 && (
            <Link
              href={`/${pref}/${c}/${service_code}?page=${page - 1}`}
              className="px-3 py-1.5 rounded border border-gray-300 text-sm hover:bg-accent/20 transition-colors"
            >
              前へ
            </Link>
          )}
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
            .reduce<(number | "...")[]>((acc, p, i, arr) => {
              if (i > 0 && p - (arr[i - 1]) > 1) acc.push("...");
              acc.push(p);
              return acc;
            }, [])
            .map((p, i) =>
              p === "..." ? (
                <span key={`ellipsis-${i}`} className="px-2 py-1.5 text-sm text-gray-400">…</span>
              ) : (
                <Link
                  key={p}
                  href={`/${pref}/${c}/${service_code}?page=${p}`}
                  className={`px-3 py-1.5 rounded border text-sm transition-colors ${
                    p === page
                      ? "bg-primary text-white border-primary"
                      : "border-gray-300 hover:bg-accent/20"
                  }`}
                >
                  {p}
                </Link>
              )
            )}
          {page < totalPages && (
            <Link
              href={`/${pref}/${c}/${service_code}?page=${page + 1}`}
              className="px-3 py-1.5 rounded border border-gray-300 text-sm hover:bg-accent/20 transition-colors"
            >
              次へ
            </Link>
          )}
        </div>
      )}
    </>
  );
}
