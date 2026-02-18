import type { Metadata } from "next";
import Script from "next/script";
import { Poppins } from "next/font/google";

import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"]
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://mflix.yoursite.com");

const defaultTitle = "MFLIX - Watch Free HD Movies, Series & Anime Online";
const defaultDescription =
  "Stream the latest HD Movies, Web Series, and Anime for free on MFLIX. Daily updates, fast streaming, and no registration required.";
const ogImage = "https://via.placeholder.com/1200x630?text=MFLIX+Movies";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: "%s | MFLIX"
  },
  description: defaultDescription,
  keywords: [
    "free movies",
    "watch online",
    "hd movies",
    "web series",
    "anime",
    "mflix",
    "streaming",
    "bollywood",
    "hollywood",
    "2026 movies"
  ],
  authors: [{ name: "MFLIX Team" }],
  robots: {
    index: true,
    follow: true
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "MFLIX - Free HD Movies & Series",
    description:
      "Watch thousands of movies and series in HD quality without ads. Join MFLIX today.",
    images: [{ url: ogImage, width: 1200, height: 630, alt: "MFLIX - Free HD Movies & Series" }],
    siteName: "MFLIX"
  },
  twitter: {
    card: "summary_large_image",
    title: "MFLIX - Watch Movies Online",
    description: "Stream latest movies and anime for free.",
    images: [ogImage]
  },
  other: {
    monetag: "dec24ca6ed6742189aa4e80dbd721552"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "MFLIX",
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${poppins.className} bg-[#050505] text-white`}>
        {children}

        <Script id="monetag-tag-min" strategy="lazyOnload">
          {`(function(s){s.dataset.zone='10510766';s.src='https://al5sm.com/tag.min.js';})([document.documentElement,document.body].filter(Boolean).pop().appendChild(document.createElement('script')));`}
        </Script>
        <Script id="monetag-vignette-min" strategy="lazyOnload">
          {`(function(s){s.dataset.zone='10511469';s.src='https://gizokraijaw.net/vignette.min.js';})([document.documentElement,document.body].filter(Boolean).pop().appendChild(document.createElement('script')));`}
        </Script>
      </body>
    </html>
  );
}
