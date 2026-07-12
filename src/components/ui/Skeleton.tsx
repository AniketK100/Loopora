/**
 * Skeleton Component — InterviewLoop Design System
 *
 * Shimmering placeholder blocks used by route-level `loading.tsx` files to
 * give instant navigation feedback and prevent layout shift (CLS).
 *
 * @module components/ui/Skeleton
 */

import React from "react";

export interface SkeletonProps {
  className?: string;
  /** Render as a circle (avatars, icons). */
  rounded?: boolean;
}

export function Skeleton({ className = "", rounded = false }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={[
        "animate-pulse bg-[var(--color-bg-alt)] border-2 border-[var(--color-border-light)]",
        rounded ? "rounded-full" : "wobbly-sm",
        className,
      ].join(" ")}
    />
  );
}

/** A pre-composed card skeleton matching the binder/notebook card style. */
export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="p-6 md:p-8 border-2 border-[var(--color-border-light)] wobbly-sm bg-[var(--color-bg)] space-y-4">
      <Skeleton className="h-7 w-2/3" />
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            className={i === lines - 1 ? "h-4 w-1/2" : "h-4 w-full"}
          />
        ))}
      </div>
    </div>
  );
}
