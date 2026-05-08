import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description: "介護さがしのプライバシーポリシーです。",
  alternates: {
    canonical: "https://www.kaigosagashi.jp/privacy",
  },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="font-serif text-lg font-bold text-primary mb-3">{title}</h2>
      <div className="text-sm text-gray-700 leading-relaxed space-y-2">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <>
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-primary">トップ</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-800">プライバシーポリシー</span>
      </nav>

      <h1 className="font-serif text-2xl font-bold text-primary mb-8">プライバシーポリシー</h1>

      <div className="bg-bg-card border border-gray-200 rounded-lg p-6 sm:p-8">
        <p className="text-sm text-gray-700 leading-relaxed mb-8">
          介護さがし（以下「当サイト」）は、ユーザーの個人情報の取扱いについて、以下のとおりプライバシーポリシーを定めます。
        </p>

        <Section title="個人情報の利用目的">
          <p>
            当サイトでは、お問い合わせフォーム等を通じて、お名前やメールアドレス等の個人情報をご提供いただく場合があります。取得した個人情報は、お問い合わせへの回答やご連絡のためにのみ利用し、それ以外の目的には使用いたしません。
          </p>
        </Section>

        <Section title="広告について">
          <p>
            当サイトでは、第三者配信の広告サービス（Google AdSense）を利用する場合があります。広告配信事業者は、ユーザーの興味に応じた広告を表示するために、Cookie（クッキー）を使用することがあります。
          </p>
          <p>
            Cookie を無効にする設定やGoogle アドセンスに関する詳細は、
            <a
              href="https://policies.google.com/technologies/ads"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              広告 - ポリシーと規約 - Google
            </a>
            をご確認ください。
          </p>
        </Section>

        <Section title="アクセス解析ツールについて">
          <p>
            当サイトでは、Google LLC が提供するアクセス解析ツール「Google Analytics」を利用しています。Google Analytics は、トラフィックデータの収集のために Cookie を使用しています。このトラフィックデータは匿名で収集されており、個人を特定するものではありません。
          </p>
          <p>
            この機能は Cookie を無効にすることで収集を拒否できますので、お使いのブラウザの設定をご確認ください。Google Analytics の利用規約については、
            <a
              href="https://marketingplatform.google.com/about/analytics/terms/jp/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Google アナリティクス利用規約
            </a>
            をご確認ください。
          </p>
        </Section>

        <Section title="個人情報の第三者提供">
          <p>
            当サイトは、ユーザーの同意なく個人情報を第三者に提供することはありません。ただし、法令に基づく場合はこの限りではありません。
          </p>
        </Section>

        <Section title="免責事項">
          <p>
            当サイトに掲載されている情報の正確性には万全を期しておりますが、その内容について保証するものではありません。当サイトの利用により生じた損害について、一切の責任を負いかねます。
          </p>
          <p>
            当サイトからリンクやバナーなどによって他のサイトに移動された場合、移動先サイトで提供される情報やサービス等について一切の責任を負いません。
          </p>
        </Section>

        <Section title="プライバシーポリシーの変更">
          <p>
            当サイトは、必要に応じて本ポリシーを変更することがあります。変更後のプライバシーポリシーは、当サイトに掲載した時点より効力を生じるものとします。
          </p>
        </Section>

        <p className="text-sm text-gray-400 mt-8">制定日：2025年4月</p>
      </div>
    </>
  );
}
