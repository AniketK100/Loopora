/**
 * Select (Dropdown) Component — InterviewLoop Design System
 *
 * Styled native select element with wobbly border and label support.
 * Used for filters (difficulty, category) and admin forms.
 *
 * @module components/ui/Select
 */

import React from "react";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className = "", id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="text-sm font-bold font-[family-name:var(--font-heading)] text-[var(--color-fg)]"
          >
            {label}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={[
              "wobbly-sm border-2 px-4 py-2.5 pr-10 w-full appearance-none",
              "bg-[var(--color-bg)] text-[var(--color-fg)]",
              "font-[family-name:var(--font-body)]",
              "transition-all duration-[var(--transition-fast)]",
              "motion-reduce:transition-none",
              "focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-1",
              "cursor-pointer",
              error
                ? "border-[var(--color-error)]"
                : "border-[var(--color-border)]",
              className,
            ]
              .filter(Boolean)
              .join(" ")}
            aria-invalid={error ? "true" : undefined}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Custom dropdown arrow */}
          <svg
            className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-fg-muted)] pointer-events-none"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>

        {error && (
          <p
            className="text-sm text-[var(--color-error)] font-[family-name:var(--font-body)]"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
