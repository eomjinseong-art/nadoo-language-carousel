import type { ReactNode } from "react";
import type { Metadata } from "next";
import { IBM_Plex_Sans_KR } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { AnalyticsEvents } from "@/components/AnalyticsEvents";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/shared";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const plex = IBM_Plex_Sans_KR({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-plex",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko" className={`${plex.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-full focus:bg-ink focus:px-3 focus:py-2 focus:text-paper"
        >
          본문으로 건너뛰기
        </a>
        <Header />
        <main id="content" className="mx-auto w-full max-w-5xl flex-1 px-4 pb-12">
          {children}
        </main>
        <Footer />
        <Analytics />
        <AnalyticsEvents />
      </body>
    </html>
  );
}
