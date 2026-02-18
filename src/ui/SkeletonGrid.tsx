import React from 'react';

export function SkeletonGrid({ count = 12 }: { count?: number }) {
  const items = Array.from({ length: count });
  return (
    <div className="skeleton-grid" aria-hidden="true">
      {items.map((_, i) => (
        <div key={i} className="sk" />
      ))}
    </div>
  );
}

