import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto text-center py-12 sm:py-16">
      <div className="bg-bg-card border border-gray-200 rounded-lg px-6 py-10 sm:px-8 sm:py-12">
        <h1 className="font-serif text-2xl font-bold text-primary mb-4">
          ページが見つかりません
        </h1>
        <p className="text-sm text-gray-600 leading-relaxed mb-8">
          URLが変更されたか、施設情報が更新された可能性があります。
          お探しの地域や介護サービスは、トップページまたは都道府県一覧から再度ご確認ください。
        </p>

        <ul className="space-y-3 text-sm">
          <li>
            <Link
              href="/"
              className="inline-block text-primary font-medium hover:underline"
            >
              トップページへ戻る →
            </Link>
          </li>
          <li>
            <Link
              href="/#prefectures"
              className="inline-block text-primary font-medium hover:underline"
            >
              都道府県から探す →
            </Link>
          </li>
          <li>
            <Link
              href="/guides/care-service-types"
              className="inline-block text-primary font-medium hover:underline"
            >
              介護サービスの種類を確認する →
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
