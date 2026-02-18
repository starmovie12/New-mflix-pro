import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Poppins } from "next/font/google";

import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"]
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL && process.env.NEXT_PUBLIC_SITE_URL.length > 0
    ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
    : new URL("https://mflix.yoursite.com");

export const metadata: Metadata = {
  title: "MFLIX - Watch Free HD Movies, Series & Anime Online",
  description:
    "Stream the latest HD Movies, Web Series, and Anime for free on MFLIX. Daily updates, fast streaming, and no registration required.",
  metadataBase: siteUrl,
  alternates: {
    canonical: "/"
  },
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
    url: "/",
    title: "MFLIX - Free HD Movies & Series",
    description:
      "Watch thousands of movies and series in HD quality without ads. Join MFLIX today.",
    images: [
      {
        url: "https://via.placeholder.com/1200x630?text=MFLIX+Movies",
        width: 1200,
        height: 630,
        alt: "MFLIX Movies"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "MFLIX - Watch Movies Online",
    description: "Stream latest movies and anime for free.",
    images: ["https://via.placeholder.com/1200x630?text=MFLIX+Movies"]
  },
  other: {
    monetag: "dec24ca6ed6742189aa4e80dbd721552"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script id="schema-org-website" type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "MFLIX",
            url: siteUrl.toString(),
            potentialAction: {
              "@type": "SearchAction",
              target: `${siteUrl.toString()}?q={search_term_string}`,
              "query-input": "required name=search_term_string"
            }
          })}
        </Script>
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
