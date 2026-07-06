/**
 * Badge & RankTab Components — InterviewLoop Design System
 *
 * Badge: Small inline label with variant colors.
 * RankTab: Torn-paper/sticky-tab shape for frequency rank display,
 * styled with post-it yellow background and Kalam font.
 *
 * @module components/ui/Badge
 * @see 04_UIUX_Design_Brief.md §3 — Rank badge description
 */

import React from "react";

// =============================================================================
// Badge
// =============================================================================

export type BadgeVariant =
  | "default"
  | "accent"
  | "secondary"
  | "success"
  | "warning"
  | "difficulty-easy"
  | "difficulty-medium"
  | "difficulty-hard";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

const badgeVariantStyles: Record<BadgeVariant, string> = {
  default:
    "bg-[var(--color-muted)] text-[var(--color-fg)] border-[var(--color-border-light)]",
  accent:
    "bg-[var(--color-accent)] text-[var(--color-bg)] border-[var(--color-accent)]",
  secondary:
    "bg-[var(--color-secondary)] text-[var(--color-bg)] border-[var(--color-secondary)]",
  success:
    "bg-[var(--color-success)] text-[var(--color-bg)] border-[var(--color-success)]",
  warning:
    "bg-[var(--color-warning)] text-[var(--color-fg)] border-[var(--color-warning)]",
  "difficulty-easy":
    "bg-emerald-100 text-emerald-800 border-emerald-300",
  "difficulty-medium":
    "bg-amber-100 text-amber-800 border-amber-300",
  "difficulty-hard":
    "bg-red-100 text-red-800 border-red-300",
};

export function Badge({
  variant = "default",
  children,
  className = "",
  ...props
}: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center px-2.5 py-0.5 border text-xs font-bold",
        "font-[family-name:var(--font-heading)]",
        "wobbly-sm",
        badgeVariantStyles[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </span>
  );
}

// =============================================================================
// RankTab
// =============================================================================

export interface RankTabProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** The rank number to display, e.g. 1 → "#1" */
  rank: number;
}

/**
 * RankTab — torn-paper/sticky-tab shape showing frequency rank.
 * Uses an irregular clip-path for the torn-paper effect and
 * post-it yellow background per the design brief.
 */
export function RankTab({ rank, className = "", ...props }: RankTabProps) {
  return (
    <span
      className={[
        "inline-flex items-center justify-center",
        "px-2.5 py-1 min-w-[2.5rem]",
        "text-sm font-bold",
        "font-[family-name:var(--font-heading)]",
        "text-[var(--color-fg)]",
        "bg-[var(--color-post-it)]",
        "border-2 border-[var(--color-post-it-dark)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        // Irregular torn-paper clip-path for the sticky-tab look
        clipPath:
          "polygon(0% 5%, 8% 0%, 15% 3%, 25% 0%, 35% 2%, 45% 0%, 55% 3%, 65% 0%, 75% 2%, 85% 0%, 92% 4%, 100% 0%, 100% 95%, 93% 100%, 85% 97%, 75% 100%, 65% 98%, 55% 100%, 45% 97%, 35% 100%, 25% 98%, 15% 100%, 8% 97%, 0% 100%)",
      }}
      aria-label={`Rank ${rank}`}
      {...props}
    >
      #{rank}
    </span>
  );
}
