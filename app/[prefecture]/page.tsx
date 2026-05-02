import { permanentRedirect } from "next/navigation";
import { slugFromPrefecture } from "@/lib/prefecture-slugs";

export const revalidate = 86400;

export default async function PrefecturePage({ params }: { params: Promise<{ prefecture: string }> }) {
  const { prefecture } = await params;
  const pref = decodeURIComponent(prefecture);
  const slug = slugFromPrefecture(pref);

  if (slug) {
    permanentRedirect(`/prefecture/${slug}`);
  }

  // slug が見つからない場合（都道府県名でないパス）は 404
  const { notFound } = await import("next/navigation");
  notFound();
}
