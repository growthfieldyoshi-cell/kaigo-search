import type { Metadata } from "next";
import { Noto_Serif_JP, Noto_Sans_JP } from "next/font/google";
import Script from "next/script";
import Link from "next/link";
import "./globals.css";

const notoSerifJP = Noto_Serif_JP({
  variable: "--font-noto-serif-jp",
  subsets: ["latin"],
  weight: ["700"],
  display: "swap",
  preload: false,
});

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.kaigosagashi.jp'),
  title: {
    default: "介護さがし | 全国の介護施設検索",
    template: "%s | 介護さがし",
  },
  description: "全国の介護施設を都道府県・市区町村・サービス別に検索できる介護施設検索サイトです。",
  openGraph: {
    siteName: "介護さがし",
    locale: "ja_JP",
    type: "website",
    images: ["/og-image.png"],
  },
  verification: {
    google: 'T7t8IgfLvJ2Ln_8iq5kbKeXQVXyAltc_1q_hsdvYPJA',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${notoSerifJP.variable} ${notoSansJP.variable}`}>
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-BV60PBHFEQ"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-BV60PBHFEQ');
          `}
        </Script>
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5313429744754781"
          strategy="beforeInteractive"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <header className="bg-primary text-white">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
            <Link href="/" className="font-serif text-xl font-bold tracking-wide hover:opacity-80 transition-opacity">
              介護さがし
            </Link>
          </div>
        </header>
        <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
          {children}
        </main>
        <footer className="bg-primary text-white/70 text-sm">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <nav className="flex justify-center gap-x-6 gap-y-2 mb-4 flex-wrap">
              <Link href="/about" className="hover:text-white transition-colors">運営者情報</Link>
              <Link href="/privacy" className="hover:text-white transition-colors">プライバシーポリシー</Link>
              <Link href="/contact" className="hover:text-white transition-colors">お問い合わせ</Link>
              <Link href="/data" className="hover:text-white transition-colors">データについて</Link>
              <Link href="/data/metrics" className="hover:text-white transition-colors">介護指標の見方</Link>
              <Link href="/guides/care-service-types" className="hover:text-white transition-colors">介護サービスの種類</Link>
            </nav>
            <p className="text-center">&copy; 2025 介護さがし</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
