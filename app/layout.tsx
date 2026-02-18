import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "MFLIX - Watch Free HD Movies, Series & Anime Online",
  description:
    "Stream the latest HD Movies, Web Series, and Anime for free on MFLIX. Daily updates, fast streaming, and no registration required.",
  robots: { index: true, follow: true }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#050505"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="monetag" content="dec24ca6ed6742189aa4e80dbd721552" />
      </head>
      <body className={inter.className}>
        {children}

        {/* Monetag scripts (lazy-loaded) */}
        <Script
          id="monetag-tag-min"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html:
              "(function(s){s.dataset.zone='10510766',s.src='https://al5sm.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))"
          }}
        />
        <Script
          id="monetag-vignette"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html:
              "(function(s){s.dataset.zone='10511469',s.src='https://gizokraijaw.net/vignette.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))"
          }}
        />
      </body>
    </html>
  );
}

