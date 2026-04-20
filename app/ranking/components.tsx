import Link from "next/link";
import type { RankingEntry } from "@/lib/queries";
import { slugFromPrefecture } from "@/lib/prefecture-slugs";

function ConfidenceBadge({ confidence }: { confidence: string }) {
  if (confidence === 'high') return <span className="text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">高</span>;
  if (confidence === 'medium') return <span className="text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">中</span>;
  return <span className="text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">参考</span>;
}

export function RankingTable({
  entries,
  valueKey,
  showBadge = false,
}: {
  entries: RankingEntry[];
  valueKey: 'sufficiency_rate' | 'certification_rate';
  showBadge?: boolean;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left text-xs text-gray-500">
            <th className="py-2 pr-2 w-10">順位</th>
            <th className="py-2 pr-2">都道府県</th>
            <th className="py-2 pr-2">市区町村</th>
            <th className="py-2 pr-2 text-right">
              {valueKey === 'sufficiency_rate' ? 'カバー率' : '認定率'}
            </th>
            {showBadge && <th className="py-2 w-12">信頼度</th>}
          </tr>
        </thead>
        <tbody>
          {entries.map((e, i) => {
            const val = e[valueKey];
            return (
              <tr key={`${e.prefecture}-${e.city_agg}`} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="py-2.5 pr-2 text-gray-400 text-xs">{i + 1}</td>
                <td className="py-2.5 pr-2 text-gray-600">
                  <Link href={`/prefecture/${slugFromPrefecture(e.prefecture) ?? e.prefecture}`} className="hover:text-primary hover:underline">
                    {e.prefecture}
                  </Link>
                </td>
                <td className="py-2.5 pr-2">
                  <Link
                    href={`/${e.prefecture}/${e.city_agg}`}
                    className="text-gray-800 hover:text-primary hover:underline font-medium"
                  >
                    {e.city_agg}
                  </Link>
                </td>
                <td className="py-2.5 pr-2 text-right tabular-nums font-medium text-gray-800">
                  {val != null ? Number(val).toFixed(1) : '-'}%
                </td>
                {showBadge && (
                  <td className="py-2.5"><ConfidenceBadge confidence={e.metric_confidence} /></td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function RankingPrefTable({
  entries,
  prefecture,
  valueKey,
  showBadge = false,
}: {
  entries: RankingEntry[];
  prefecture: string;
  valueKey: 'sufficiency_rate' | 'certification_rate';
  showBadge?: boolean;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left text-xs text-gray-500">
            <th className="py-2 pr-2 w-10">順位</th>
            <th className="py-2 pr-2">市区町村</th>
            <th className="py-2 pr-2 text-right">
              {valueKey === 'sufficiency_rate' ? 'カバー率' : '認定率'}
            </th>
            {showBadge && <th className="py-2 w-12">信頼度</th>}
          </tr>
        </thead>
        <tbody>
          {entries.map((e, i) => {
            const val = e[valueKey];
            return (
              <tr key={e.city_agg} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="py-2.5 pr-2 text-gray-400 text-xs">{i + 1}</td>
                <td className="py-2.5 pr-2">
                  <Link
                    href={`/${prefecture}/${e.city_agg}`}
                    className="text-gray-800 hover:text-primary hover:underline font-medium"
                  >
                    {e.city_agg}
                  </Link>
                </td>
                <td className="py-2.5 pr-2 text-right tabular-nums font-medium text-gray-800">
                  {val != null ? Number(val).toFixed(1) : '-'}%
                </td>
                {showBadge && (
                  <td className="py-2.5"><ConfidenceBadge confidence={e.metric_confidence} /></td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function RankingDisclaimer() {
  return (
    <div className="bg-amber-50 rounded-lg px-4 py-3 mt-6">
      <p className="text-xs text-amber-700">
        本ランキングは入所系施設の定員データをもとに算出した参考指標です。分母は要介護認定者全体（在宅サービス利用者含む）のため、数値は構造的に低く出ます。「入所希望者に対する不足率」ではありません。
        施設の空き状況や利用可否については各施設へ直接お問い合わせください。
      </p>
    </div>
  );
}

export function RankingFooterLinks({ prefecture }: { prefecture?: string }) {
  return (
    <div className="bg-bg-card border border-gray-200 rounded-lg px-5 py-4 mt-6">
      <p className="text-sm font-medium text-gray-800 mb-2">関連ページ</p>
      <ul className="text-sm space-y-1.5">
        <li>
          <Link href="/data/metrics" className="text-primary hover:underline">
            指標の計算方法と見方について
          </Link>
        </li>
        {prefecture && (
          <li>
            <Link href={`/prefecture/${slugFromPrefecture(prefecture) ?? prefecture}`} className="text-primary hover:underline">
              {prefecture}の介護施設一覧
            </Link>
          </li>
        )}
        <li>
          <Link href="/" className="text-primary hover:underline">
            都道府県から介護施設を探す
          </Link>
        </li>
      </ul>
    </div>
  );
}
