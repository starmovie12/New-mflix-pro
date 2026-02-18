import type { Metadata } from "next";
import { AdScripts } from "@/components/AdScripts";
import "./globals.css";

export const metadata: Metadata = {
  title: "MFLIX - Watch Free HD Movies, Series & Anime Online",
  description:
    "Stream the latest HD Movies, Web Series, and Anime for free on MFLIX. Daily updates, fast streaming, and no registration required.",
  keywords:
    "free movies, watch online, hd movies, web series, anime, mflix, streaming, bollywood, hollywood, 2026 movies",
  robots: "index, follow",
  authors: [{ name: "MFLIX Team" }],
  openGraph: {
    type: "website",
    url: "https://mflix.yoursite.com",
    title: "MFLIX - Free HD Movies & Series",
    description: "Watch thousands of movies and series in HD quality without ads. Join MFLIX today.",
    images: ["https://via.placeholder.com/1200x630?text=MFLIX+Movies"],
  },
  twitter: {
    card: "summary_large_image",
    title: "MFLIX - Watch Movies Online",
    description: "Stream latest movies and anime for free.",
    images: ["https://via.placeholder.com/1200x630?text=MFLIX+Movies"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="monetag" content="dec24ca6ed6742189aa4e80dbd721552" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <link rel="canonical" href="https://mflix.yoursite.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "MFLIX",
              url: "https://mflix.yoursite.com",
              potentialAction: {
                "@type": "SearchAction",
                target: "https://mflix.yoursite.com?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </head>
      <body>{children}</body>
      <AdScripts />
    </html>
  );
}
