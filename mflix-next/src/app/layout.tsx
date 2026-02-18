import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { MonetagScripts } from "@/components/MonetagScripts";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-poppins",
});

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
      </head>
      <body className={`${poppins.variable} font-sans antialiased`}>
        {children}
        <MonetagScripts />
      </body>
    </html>
  );
}
