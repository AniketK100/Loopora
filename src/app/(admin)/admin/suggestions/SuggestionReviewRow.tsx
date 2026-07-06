/**
 * SuggestionReviewRow Client Button — Suggestions CMS
 *
 * Provides the interactive toggle action to mark a suggestion as reviewed.
 *
 * @module app/(admin)/admin/suggestions/SuggestionReviewRow
 */

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";

interface SuggestionReviewRowProps {
  id: string;
  initialStatus: string;
}

export function SuggestionReviewRow({ id, initialStatus }: SuggestionReviewRowProps) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [isLoading, setIsLoading] = useState(false);

  const handleReview = async () => {
    setIsLoading(true);
    const nextStatus = status === "new" ? "reviewed" : "new";

    try {
      const res = await fetch(`/api/suggestions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to update suggestion.");
      } else {
        setStatus(nextStatus);
        router.refresh();
      }
    } catch {
      alert("A network error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleReview}
      isLoading={isLoading}
      className={
        status === "new"
          ? "!border-[var(--color-success)] !text-[var(--color-success)] hover:!bg-green-50"
          : "!border-gray-300 !text-gray-500 hover:!bg-gray-50"
      }
    >
      {status === "new" ? "Mark Reviewed" : "Mark Pending"}
    </Button>
  );
}
