import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MFLIX - Watch Free HD Movies, Series & Anime Online",
  description:
    "Stream the latest HD Movies, Web Series, and Anime for free on MFLIX. Daily updates, fast streaming, and no registration required.",
  keywords:
    "free movies, watch online, hd movies, web series, anime, mflix, streaming, bollywood, hollywood, 2026 movies",
  authors: [{ name: "MFLIX Team" }],
  robots: "index, follow",
  openGraph: {
    type: "website",
    url: "https://mflix.yoursite.com",
    title: "MFLIX - Free HD Movies & Series",
    description:
      "Watch thousands of movies and series in HD quality without ads. Join MFLIX today.",
    images: ["https://via.placeholder.com/1200x630?text=MFLIX+Movies"],
  },
  twitter: {
    card: "summary_large_image",
    title: "MFLIX - Watch Movies Online",
    description: "Stream latest movies and anime for free.",
    images: ["https://via.placeholder.com/1200x630?text=MFLIX+Movies"],
  },
  other: {
    monetag: "dec24ca6ed6742189aa4e80dbd721552",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "MFLIX",
    url: "https://mflix.yoursite.com",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://mflix.yoursite.com?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="en" className={`${poppins.variable} ${inter.variable}`}>
      <head>
        <meta name="theme-color" content="#050505" />
        <link rel="canonical" href="https://mflix.yoursite.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-poppins bg-mflix-bg text-white overflow-x-hidden">
        {children}

        <Script
          id="monetag-tag"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `(function(s){s.dataset.zone='10510766';s.src='https://al5sm.com/tag.min.js'})(document.body.appendChild(document.createElement('script')))`,
          }}
        />
        <Script
          id="monetag-vignette"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `(function(s){s.dataset.zone='10511469';s.src='https://gizokraijaw.net/vignette.min.js'})(document.body.appendChild(document.createElement('script')))`,
          }}
        />
      </body>
    </html>
  );
}
