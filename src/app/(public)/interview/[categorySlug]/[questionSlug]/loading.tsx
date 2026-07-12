import React from "react";
import { Skeleton, SkeletonCard } from "@/components/ui";

export default function Loading() {
  return (
    <div className="paper-grain min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        <Skeleton className="h-4 w-48" />
        <div className="space-y-6">
          <Skeleton className="h-10 w-3/4" />
          <SkeletonCard lines={4} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SkeletonCard lines={2} />
            <SkeletonCard lines={2} />
          </div>
        </div>
      </div>
    </div>
  );
}
