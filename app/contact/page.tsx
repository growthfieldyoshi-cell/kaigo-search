import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "お問い合わせ",
  description: "介護さがしへのお問い合わせページです。",
};

export default function ContactPage() {
  return (
    <>
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-primary">トップ</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-800">お問い合わせ</span>
      </nav>

      <h1 className="font-serif text-2xl font-bold text-primary mb-8">お問い合わせ</h1>

      <div className="bg-bg-card border border-gray-200 rounded-lg p-6 sm:p-8">
        <p className="text-sm text-gray-700 leading-relaxed mb-6">
          介護さがしに関するご質問・ご要望・掲載内容の修正依頼などがございましたら、以下のメールアドレスまでお気軽にお問い合わせください。
        </p>
        <div className="bg-bg rounded-lg px-6 py-5 text-center">
          <p className="text-sm text-gray-500 mb-2">メールアドレス</p>
          <a
            href="mailto:info@kaigosagashi.jp"
            className="text-primary text-lg font-medium hover:underline"
          >
            info@kaigosagashi.jp
          </a>
        </div>
        <p className="text-sm text-gray-400 mt-6">
          ※ 返信までに数日いただく場合がございます。あらかじめご了承ください。
        </p>
      </div>
    </>
  );
}
