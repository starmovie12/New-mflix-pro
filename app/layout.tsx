import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Poppins } from "next/font/google";

import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"]
});

const SITE_URL = "https://mflix.yoursite.com";
const OG_IMAGE = "https://via.placeholder.com/1200x630?text=MFLIX+Movies";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false
};

export const metadata: Metadata = {
  title: "MFLIX - Watch Free HD Movies, Series & Anime Online",
  description:
    "Stream the latest HD Movies, Web Series, and Anime for free on MFLIX. Daily updates, fast streaming, and no registration required.",
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
  alternates: {
    canonical: SITE_URL
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: "MFLIX - Free HD Movies & Series",
    description:
      "Watch thousands of movies and series in HD quality without ads. Join MFLIX today.",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "MFLIX Movies" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "MFLIX - Watch Movies Online",
    description: "Stream latest movies and anime for free.",
    images: [OG_IMAGE]
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
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}?q={search_term_string}`,
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
