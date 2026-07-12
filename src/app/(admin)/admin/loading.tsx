import React from "react";
import { Skeleton, SkeletonCard } from "@/components/ui";

export default function Loading() {
  return (
    <div className="w-full space-y-6">
      <Skeleton className="h-9 w-64" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} lines={2} />
        ))}
      </div>
    </div>
  );
}
