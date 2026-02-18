import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Poppins } from "next/font/google";

import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"]
});

export const metadata: Metadata = {
  title: "MFLIX - Watch Free HD Movies, Series & Anime Online",
  description:
    "Stream the latest HD Movies, Web Series, and Anime for free on MFLIX. Daily updates, fast streaming, and no registration required.",
  applicationName: "MFLIX",
  metadataBase: new URL("https://mflix.yoursite.com"),
  alternates: {
    canonical: "/"
  },
  authors: [{ name: "MFLIX Team" }],
  keywords: [
    "free movies",
    "watch online",
    "hd movies",
    "web series",
    "anime",
    "mflix",
    "streaming"
  ],
  openGraph: {
    type: "website",
    url: "https://mflix.yoursite.com",
    title: "MFLIX - Free HD Movies & Series",
    description: "Watch thousands of movies and series in HD quality without ads.",
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
  robots: {
    index: true,
    follow: true
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
