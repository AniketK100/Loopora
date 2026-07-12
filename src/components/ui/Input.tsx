/**
 * Input Component — InterviewLoop Design System
 *
 * Wobbly-bordered text input with focus ring and label support.
 * Uses design tokens for all visual properties.
 *
 * @module components/ui/Input
 */

import React, { useId } from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Label text displayed above the input */
  label?: string;
  /** Error message displayed below the input */
  error?: string;
  /** Helper text displayed below the input (hidden when error is present) */
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = "", id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-") || generatedId;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-bold font-[family-name:var(--font-heading)] text-[var(--color-fg)]"
          >
            {label}
          </label>
        )}

        <input
          ref={ref}
          id={inputId}
          className={[
            "wobbly-sm border-2 px-4 py-2.5",
            "bg-[var(--color-bg)] text-[var(--color-fg)]",
            "font-[family-name:var(--font-body)]",
            "placeholder:text-[var(--color-fg-muted)]",
            "transition-all duration-[var(--transition-fast)]",
            "motion-reduce:transition-none",
            // Focus state
            "focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-1",
            // Border color
            error
              ? "border-[var(--color-error)]"
              : "border-[var(--color-border)]",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={
            error
              ? `${inputId}-error`
              : helperText
                ? `${inputId}-helper`
                : undefined
          }
          {...props}
        />

        {error && (
          <p
            id={`${inputId}-error`}
            className="text-sm text-[var(--color-error)] font-[family-name:var(--font-body)]"
            role="alert"
          >
            {error}
          </p>
        )}

        {!error && helperText && (
          <p
            id={`${inputId}-helper`}
            className="text-sm text-[var(--color-fg-muted)] font-[family-name:var(--font-body)]"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
