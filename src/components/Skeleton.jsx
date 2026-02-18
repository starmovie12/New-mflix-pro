import { memo } from 'react';

export const MovieCardSkeleton = memo(function MovieCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="w-full aspect-[2/3] rounded-lg animate-shimmer" />
      <div className="mt-2 h-3 w-3/4 rounded animate-shimmer" />
      <div className="mt-1 flex justify-between">
        <div className="h-3 w-10 rounded animate-shimmer" />
        <div className="h-3 w-10 rounded animate-shimmer" />
      </div>
    </div>
  );
});

export const MovieGridSkeleton = memo(function MovieGridSkeleton({ count = 12 }) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 px-3">
      {Array.from({ length: count }).map((_, i) => (
        <MovieCardSkeleton key={i} />
      ))}
    </div>
  );
});

export const HeroBannerSkeleton = memo(function HeroBannerSkeleton() {
  return (
    <div className="relative w-full aspect-[16/9] max-h-[500px] animate-shimmer rounded-xl mx-3" />
  );
});

export const RowSkeleton = memo(function RowSkeleton() {
  return (
    <div className="mb-6">
      <div className="h-5 w-40 rounded animate-shimmer mx-3 mb-3" />
      <div className="flex gap-3 px-3 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex-shrink-0 w-32">
            <div className="w-full aspect-[2/3] rounded-lg animate-shimmer" />
            <div className="mt-2 h-3 w-3/4 rounded animate-shimmer" />
          </div>
        ))}
      </div>
    </div>
  );
});

export const DetailSkeleton = memo(function DetailSkeleton() {
  return (
    <div className="p-4 space-y-4 animate-pulse">
      <div className="h-8 w-3/4 rounded animate-shimmer" />
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-8 w-20 rounded-lg animate-shimmer" />
        ))}
      </div>
      <div className="h-12 w-full rounded-xl animate-shimmer" />
      <div className="space-y-2">
        <div className="h-4 w-full rounded animate-shimmer" />
        <div className="h-4 w-5/6 rounded animate-shimmer" />
        <div className="h-4 w-2/3 rounded animate-shimmer" />
      </div>
    </div>
  );
});
