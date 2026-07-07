/**
 * Practiced Toggle Component — Client Component
 *
 * Renders a checkbox-style checklist/checkmark indicator (✅) to toggle
 * marking questions as practiced/solved in the candidate's personal logs.
 *
 * Uses Framer Motion for active press states.
 * Uses optimistic UI updates for instant interaction feedback.
 *
 * @module components/ui/PracticedToggle
 */

"use client";

import React, { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface PracticedToggleProps {
  questionId: string;
  initialIsPracticed: boolean;
  className?: string;
}

export function PracticedToggle({
  questionId,
  initialIsPracticed,
  className = "",
}: PracticedToggleProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [isPracticed, setIsPracticed] = useState(initialIsPracticed);
  const [prevInitial, setPrevInitial] = useState(initialIsPracticed);

  // Sync state if initial value changes during rendering
  if (initialIsPracticed !== prevInitial) {
    setIsPracticed(initialIsPracticed);
    setPrevInitial(initialIsPracticed);
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
    const previousState = isPracticed;
    setIsPracticed(!previousState);
    setLoading(true);

    try {
      const res = await fetch(`/api/questions/${questionId}/practiced`, {
        method: "POST",
      });
      const json = await res.json();

      if (!json.success) {
        // Rollback state if server returns failure
        setIsPracticed(previousState);
      } else {
        setIsPracticed(json.data.isPracticed);
      }
    } catch (err) {
      console.error("[PracticedToggle] Failed to toggle practiced status:", err);
      setIsPracticed(previousState);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.button
      type="button"
      onClick={handleToggle}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className={[
        "p-1.5 rounded-full border border-dashed transition-colors duration-150 relative group",
        isPracticed
          ? "bg-green-50 border-green-500 text-green-600"
          : "bg-transparent border-gray-300 text-gray-400 hover:text-gray-600 hover:border-gray-400",
        className,
      ].join(" ")}
      title={isPracticed ? "Mark as Unpracticed" : "Mark as Practiced / Solved"}
      aria-label={isPracticed ? "Mark as Unpracticed" : "Mark as Practiced / Solved"}
      disabled={loading}
    >
      <CheckCircle2
        size={18}
        className={[
          "stroke-[2.5]",
          isPracticed ? "fill-green-200" : "fill-none",
        ].join(" ")}
      />
    </motion.button>
  );
}
