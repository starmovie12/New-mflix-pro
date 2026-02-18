"use client";

export default function SkeletonLoader() {
  return (
    <div className="p-4 flex flex-col gap-4 animate-pulse">
      <div className="h-7 w-[70%] bg-white/10 rounded skeleton-shimmer" />
      <div className="h-5 w-[40%] bg-white/10 rounded skeleton-shimmer" />
      <div className="h-12 w-full bg-white/10 rounded skeleton-shimmer" />
      <div className="h-5 w-full bg-white/10 rounded skeleton-shimmer" />
      <div className="h-5 w-full bg-white/10 rounded skeleton-shimmer" />
      <div className="h-5 w-[60%] bg-white/10 rounded skeleton-shimmer" />
    </div>
  );
}
