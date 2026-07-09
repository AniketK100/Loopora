/**
 * Toggle Component — InterviewLoop Design System
 *
 * Hand-drawn styled toggle switch for boolean controls.
 * Used in the admin feature flag table and filter toggles.
 *
 * @module components/ui/Toggle
 * @see 04_UIUX_Design_Brief.md §2.4 — hand-drawn on/off sliders
 */

"use client";

import React from "react";

export interface ToggleProps {
  /** Whether the toggle is on */
  checked: boolean;
  /** Callback when toggled */
  onChange: (_checked: boolean) => void;
  /** Accessible label */
  label?: string;
  /** Whether the toggle is disabled */
  disabled?: boolean;
  /** Size variant */
  size?: "sm" | "md";
  className?: string;
}

export function Toggle({
  checked,
  onChange,
  label,
  disabled = false,
  size = "md",
  className = "",
}: ToggleProps) {
  const dimensions = size === "sm"
    ? { track: "w-9 h-5", thumb: "w-3.5 h-3.5", translate: "translate-x-4" }
    : { track: "w-12 h-7", thumb: "w-5 h-5", translate: "translate-x-5" };

  return (
    <label
      className={[
        "inline-flex items-center gap-2 cursor-pointer",
        disabled ? "opacity-50 cursor-not-allowed" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={[
          dimensions.track,
          "relative inline-flex items-center rounded-full border-2",
          "border-[var(--color-border)]",
          "transition-colors duration-[var(--transition-fast)]",
          "motion-reduce:transition-none",
          "focus-visible:outline-none focus-visible:ring-2",
          "focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2",
          checked
            ? "bg-[var(--color-accent)]"
            : "bg-[var(--color-muted)]",
        ].join(" ")}
        style={{
          borderRadius: "var(--radius-wobbly-sm)",
        }}
      >
        <span
          className={[
            dimensions.thumb,
            "rounded-full border-2 border-[var(--color-border)]",
            "bg-[var(--color-bg)]",
            "transition-transform duration-[var(--transition-fast)]",
            "motion-reduce:transition-none",
            "shadow-sm ml-0.5",
            checked ? dimensions.translate : "translate-x-0",
          ].join(" ")}
          aria-hidden="true"
        />
      </button>

      {label && (
        <span className="text-sm font-[family-name:var(--font-body)] text-[var(--color-fg)]">
          {label}
        </span>
      )}
    </label>
  );
}
