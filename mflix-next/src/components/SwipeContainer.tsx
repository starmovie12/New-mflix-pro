"use client";

import { useCallback, useRef, useState } from "react";

interface SwipeContainerProps {
  children: React.ReactNode[];
  activeIndex: number;
  onSwipe: (index: number) => void;
}

const MIN_SWIPE_DISTANCE = 50;

export function SwipeContainer({
  children,
  activeIndex,
  onSwipe,
}: SwipeContainerProps) {
  const [touchStart, setTouchStart] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStart(e.changedTouches[0].screenX);
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const touchEnd = e.changedTouches[0].screenX;
      const distance = touchEnd - touchStart;

      if (distance > MIN_SWIPE_DISTANCE && activeIndex > 0) {
        onSwipe(activeIndex - 1);
      } else if (distance < -MIN_SWIPE_DISTANCE && activeIndex < children.length - 1) {
        onSwipe(activeIndex + 1);
      }
    },
    [touchStart, activeIndex, children.length, onSwipe]
  );

  return (
    <div
      ref={containerRef}
      className="flex w-[500vw] transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] h-[calc(100vh-110px)]"
      style={{
        transform: `translateX(-${activeIndex * 100}vw)`,
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  );
}
