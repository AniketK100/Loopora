/**
 * Card Component — InterviewLoop Design System
 *
 * Wobbly-bordered container with optional decoration (tape, tack, or none).
 * Implements the hand-drawn card style with offset shadows that intensify
 * on hover or when expanded.
 *
 * @module components/ui/Card
 * @see 04_UIUX_Design_Brief.md §3 — Accordion row (Question card)
 * @see 04_UIUX_Design_Brief.md §4 — Motion Spec (card hover)
 */

import React from "react";

export type CardDecoration = "tape" | "tack" | "none";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Visual decoration on the card */
  decoration?: CardDecoration;
  /** Whether to show the emphasized (expanded) shadow */
  isEmphasized?: boolean;
  /** Enables hover rotation effect (±1deg) */
  hoverEffect?: boolean;
  /** Optional colored footer strip (6-8px bar at bottom) */
  footerStripColor?: string;
  children: React.ReactNode;
}

/**
 * Decorative tape element — simulates a strip of tape on the top of the card.
 */
function TapeDecoration() {
  return (
    <div
      className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-5 opacity-70 z-10"
      style={{
        backgroundColor: "var(--color-post-it)",
        borderRadius: "2px",
        transform: "translateX(-50%) rotate(-2deg)",
        boxShadow: "1px 1px 2px rgba(0,0,0,0.1)",
      }}
      aria-hidden="true"
    />
  );
}

/**
 * Decorative tack element — simulates a pushpin/thumbtack on the card.
 */
function TackDecoration() {
  return (
    <div
      className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full z-10"
      style={{
        backgroundColor: "var(--color-accent)",
        boxShadow: "0 2px 3px rgba(0,0,0,0.2)",
        border: "2px solid var(--color-border)",
      }}
      aria-hidden="true"
    />
  );
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      decoration = "none",
      isEmphasized = false,
      hoverEffect = false,
      footerStripColor,
      children,
      className = "",
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={[
          "relative wobbly-md border-2 overflow-hidden",
          "bg-[var(--color-bg)]",
          "border-[var(--color-border)]",
          // Shadow transitions
          "transition-all duration-[var(--transition-fast)]",
          "motion-reduce:transition-none",
          // Hover effect
          hoverEffect
            ? "hover:rotate-[1deg] hover:shadow-[var(--shadow-hover)] cursor-pointer"
            : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        style={{
          boxShadow: isEmphasized
            ? "var(--shadow-emphasized)"
            : "var(--shadow-default)",
        }}
        {...props}
      >
        {/* Decorations */}
        {decoration === "tape" && <TapeDecoration />}
        {decoration === "tack" && <TackDecoration />}

        {/* Content */}
        <div className={decoration !== "none" ? "pt-2" : ""}>
          {children}
        </div>

        {/* Footer strip */}
        {footerStripColor && (
          <div
            className="absolute bottom-0 left-0 right-0 h-[6px]"
            style={{ backgroundColor: footerStripColor }}
            aria-hidden="true"
          />
        )}
      </div>
    );
  }
);

Card.displayName = "Card";
