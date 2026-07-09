/**
 * Favorite Toggle Pushpin Component — Client Component
 *
 * Renders a stylized hand-drawn-themed pushpin icon (📌) to toggle
 * bookmarking questions in the candidate's personal study list.
 *
 * Uses Framer Motion for wobbly hover/active states.
 * Uses optimistic UI updates for instant interaction feedback.
 *
 * @module components/ui/FavoriteToggle
 */

"use client";

import React, { useState } from "react";
import { Pin } from "lucide-react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";

interface FavoriteToggleProps {
  questionId: string;
  initialIsFavorited: boolean;
  className?: string;
}

export function FavoriteToggle({
  questionId,
  initialIsFavorited,
  className = "",
}: FavoriteToggleProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
  const [prevInitial, setPrevInitial] = useState(initialIsFavorited);

  // Sync state if initial value changes during rendering
  if (initialIsFavorited !== prevInitial) {
    setIsFavorited(initialIsFavorited);
    setPrevInitial(initialIsFavorited);
  }

  const [loading, setLoading] = useState(false);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Guard login requirement
    if (status !== "authenticated" || !session) {
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (loading) return;

    // Optimistic UI update
    const previousState = isFavorited;
    setIsFavorited(!previousState);
    setLoading(true);

    try {
      const res = await fetch(`/api/questions/${questionId}/favorite`, {
        method: "POST",
      });
      const json = await res.json();

      if (!json.success) {
        // Rollback state if server returns failure
        setIsFavorited(previousState);
      } else {
        setIsFavorited(json.data.isFavorited);
        if (json.data.isFavorited) {
          posthog.capture("question_favorited", { question_id: questionId });
        } else {
          posthog.capture("question_unfavorited", { question_id: questionId });
        }
      }
    } catch (err) {
      console.error("[FavoriteToggle] Failed to toggle favorite:", err);
      posthog.captureException(err);
      setIsFavorited(previousState);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.button
      type="button"
      onClick={handleToggle}
      whileHover={{ scale: 1.1, rotate: 5 }}
      whileTap={{ scale: 0.9, rotate: -5 }}
      className={[
        "p-1.5 rounded-full border border-dashed transition-colors duration-150 relative group",
        isFavorited
          ? "bg-red-50 border-[var(--color-accent)] text-[var(--color-accent)]"
          : "bg-transparent border-gray-300 text-gray-400 hover:text-gray-600 hover:border-gray-400",
        className,
      ].join(" ")}
      title={isFavorited ? "Remove from Favorites" : "Add to Favorites"}
      aria-label={isFavorited ? "Remove from Favorites" : "Add to Favorites"}
      disabled={loading}
    >
      <Pin
        size={18}
        className={[
          "stroke-[2.5]",
          isFavorited ? "fill-[var(--color-accent)]" : "fill-none",
        ].join(" ")}
      />
    </motion.button>
  );
}
