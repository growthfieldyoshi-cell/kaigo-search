"use client";

import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isDev = process.env.NODE_ENV === "development";

  return (
    <div className="max-w-xl mx-auto text-center py-12 sm:py-16">
      <div className="bg-bg-card border border-gray-200 rounded-lg px-6 py-10 sm:px-8 sm:py-12">
        <h1 className="font-serif text-2xl font-bold text-primary mb-4">
          一時的なエラーが発生しました
        </h1>
        <p className="text-sm text-gray-600 leading-relaxed mb-8">
          ページの読み込み中に問題が発生しました。しばらく時間をおいて再度お試しください。
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="border border-primary text-primary text-sm font-medium rounded-md px-5 py-2.5 hover:bg-primary/5 transition-colors"
          >
            再読み込みする
          </button>
          <Link
            href="/"
            className="border border-gray-300 text-gray-700 text-sm font-medium rounded-md px-5 py-2.5 hover:bg-gray-50 transition-colors"
          >
            トップページへ戻る
          </Link>
        </div>

        {isDev && error?.message && (
          <p className="mt-8 text-xs text-gray-400 break-all">
            {error.message}
          </p>
        )}
      </div>
    </div>
  );
}
