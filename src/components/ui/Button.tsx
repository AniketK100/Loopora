/**
 * Button Component — InterviewLoop Design System
 *
 * Hand-drawn styled button with multiple variants and states.
 * Implements the press-flat active state, hover fill + shadow collapse,
 * and wobbly border radius per the design system spec.
 *
 * @module components/ui/Button
 * @see 04_UIUX_Design_Brief.md §3 — Component Notes
 * @see 04_UIUX_Design_Brief.md §4 — Motion Spec (button hover/active)
 */

import React from "react";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  /** Shows a loading spinner and disables the button */
  isLoading?: boolean;
  /** Renders as full width */
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: [
    "bg-[var(--color-accent)] text-[var(--color-bg)] border-[var(--color-border)]",
    "hover:bg-[var(--color-accent-hover)]",
    "shadow-[var(--shadow-default)]",
    "hover:shadow-[var(--shadow-hover)]",
    "active:shadow-[var(--shadow-button-active)]",
    "active:translate-x-[1px] active:translate-y-[1px]",
  ].join(" "),

  secondary: [
    "bg-[var(--color-secondary)] text-[var(--color-bg)] border-[var(--color-border)]",
    "hover:bg-[var(--color-secondary-hover)]",
    "shadow-[var(--shadow-default)]",
    "hover:shadow-[var(--shadow-hover)]",
    "active:shadow-[var(--shadow-button-active)]",
    "active:translate-x-[1px] active:translate-y-[1px]",
  ].join(" "),

  outline: [
    "bg-transparent text-[var(--color-fg)] border-[var(--color-border)]",
    "hover:bg-[var(--color-muted)]",
    "shadow-[var(--shadow-default)]",
    "hover:shadow-[var(--shadow-hover)]",
    "active:shadow-[var(--shadow-button-active)]",
    "active:translate-x-[1px] active:translate-y-[1px]",
  ].join(" "),

  ghost: [
    "bg-transparent text-[var(--color-fg)] border-transparent",
    "hover:bg-[var(--color-muted)]",
    "active:bg-[var(--color-border-light)]",
  ].join(" "),
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-base",
  lg: "px-7 py-3.5 text-lg",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      children,
      isLoading = false,
      fullWidth = false,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={[
          // Base styles
          "wobbly-sm border-2 font-bold cursor-pointer",
          "font-[family-name:var(--font-heading)]",
          "transition-all duration-[var(--transition-fast)]",
          "motion-reduce:transition-none",
          // Variant + size
          variantStyles[variant],
          sizeStyles[size],
          // Full width
          fullWidth ? "w-full" : "",
          // Disabled state
          isDisabled ? "opacity-50 cursor-not-allowed !shadow-none !translate-x-0 !translate-y-0" : "",
          // Custom classes
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            {children}
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
