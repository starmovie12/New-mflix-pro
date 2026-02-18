import type { Metadata } from "next";
import Script from "next/script";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

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
    "2026 movies",
  ],
  robots: { index: true, follow: true },
  authors: [{ name: "MFLIX Team" }],
  alternates: { canonical: "https://mflix.yoursite.com" },
  openGraph: {
    type: "website",
    url: "https://mflix.yoursite.com",
    title: "MFLIX - Free HD Movies & Series",
    description: "Watch thousands of movies and series in HD quality without ads.",
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        {children}

        {/* Monetag scripts (lazy-loaded) */}
        <Script
          id="monetag-tag"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html:
              '(function(s){s.dataset.zone="10510766";s.src="https://al5sm.com/tag.min.js"})([document.documentElement,document.body].filter(Boolean).pop().appendChild(document.createElement("script")))',
          }}
        />
        <Script
          id="monetag-vignette"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html:
              '(function(s){s.dataset.zone="10511469";s.src="https://gizokraijaw.net/vignette.min.js"})([document.documentElement,document.body].filter(Boolean).pop().appendChild(document.createElement("script")))',
          }}
        />
      </body>
    </html>
  );
}

