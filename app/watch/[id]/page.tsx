import type { Metadata } from "next";
import { WatchClient } from "@/components/WatchClient";
import { fetchMovieById } from "@/lib/movies";

type WatchPageProps = {
  params: { id: string };
};

export async function generateMetadata({
  params
}: WatchPageProps): Promise<Metadata> {
  const decodedId = decodeURIComponent(params.id);
  const movie = await fetchMovieById(decodedId);

  if (!movie) {
    return {
      title: "Watch | MFLIX"
    };
  }

  const title = `${movie.title} (${movie.year})`;
  const description =
    movie.description && movie.description !== "No synopsis available."
      ? movie.description.slice(0, 160)
      : `Watch ${movie.title} online free in HD on MFLIX.`;

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://mflix.yoursite.com");
  const watchUrl = `${siteUrl}/watch/${encodeURIComponent(movie.id)}`;

  return {
    title: `Watch ${movie.title}`,
    description,
    alternates: {
      canonical: `/watch/${encodeURIComponent(movie.id)}`
    },
    openGraph: {
      type: "video.other",
      url: watchUrl,
      title: `Watch ${title} Online Free | MFLIX`,
      description,
      images: movie.poster ? [{ url: movie.poster, alt: movie.title }] : undefined,
      siteName: "MFLIX"
    },
    twitter: {
      card: "summary_large_image",
      title: `Watch ${movie.title} | MFLIX`,
      description,
      images: movie.poster ? [movie.poster] : undefined
    }
  };
}

export default function WatchPage({ params }: WatchPageProps) {
  return <WatchClient id={decodeURIComponent(params.id)} />;
}
