/**
 * FlagToggle Client Component — Feature Flag Toggle Trigger
 *
 * Client toggle component rendering an interactive toggle switch,
 * sending update request to /api/flags/[id] and triggering local routing update.
 *
 * @module app/(admin)/admin/flags/FlagToggle
 */

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Toggle } from "@/components/ui";

interface FlagToggleProps {
  id: string;
  initialEnabled: boolean;
}

export function FlagToggle({ id, initialEnabled }: FlagToggleProps) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(initialEnabled);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async (newVal: boolean) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/flags/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: newVal }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to update feature flag.");
        // Revert local state
        setEnabled(enabled);
      } else {
        setEnabled(newVal);
        router.refresh();
      }
    } catch {
      alert("A network error occurred.");
      // Revert local state
      setEnabled(enabled);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Toggle
      checked={enabled}
      onChange={handleToggle}
      disabled={isLoading}
    />
  );
}
