import React from "react";
import { Skeleton, SkeletonCard } from "@/components/ui";

export default function Loading() {
  return (
    <div className="paper-grain min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-9 w-1/2" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} lines={2} />
          ))}
        </div>
      </div>
    </div>
  );
}
