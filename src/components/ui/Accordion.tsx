/**
 * Accordion Component — InterviewLoop Design System
 *
 * Keyboard-navigable accordion for the question list.
 * Implements single-open mode (only one item expanded at a time),
 * with full ARIA support (aria-expanded, aria-controls) and
 * keyboard navigation (Enter/Space to toggle, Arrow keys to move).
 *
 * This is the foundation for the "signature component" described
 * in the UI/UX brief — the expanded question panel with answer + video
 * is built on top of this accordion.
 *
 * @module components/ui/Accordion
 * @see 02_TRD.md §7 — Accessibility (accordion keyboard requirements)
 * @see 04_UIUX_Design_Brief.md §2.3 — Question List expand behavior
 * @see 04_UIUX_Design_Brief.md §4 — Motion Spec (question expand)
 */

"use client";

import React, { useState, useCallback, useRef, useId } from "react";

// =============================================================================
// Types
// =============================================================================

export interface AccordionItem {
  /** Unique identifier for this item */
  id: string;
  /** Content rendered in the always-visible trigger/header row */
  trigger: React.ReactNode;
  /** Content rendered in the collapsible panel */
  content: React.ReactNode;
  /** Whether this item is disabled (cannot be expanded) */
  disabled?: boolean;
}

export interface AccordionProps {
  /** Array of accordion items */
  items: AccordionItem[];
  /** Allow multiple items open simultaneously (default: false = single-open mode) */
  allowMultiple?: boolean;
  /** Controlled: currently expanded item ID(s) */
  expandedIds?: string[];
  /** Callback when expanded state changes */
  onExpandedChange?: (_expandedIds: string[]) => void;
  /** Default expanded item ID (uncontrolled mode) */
  defaultExpandedId?: string;
  /** Additional className for the container */
  className?: string;
}

// =============================================================================
// Component
// =============================================================================

export function Accordion({
  items,
  allowMultiple = false,
  expandedIds: controlledIds,
  onExpandedChange,
  defaultExpandedId,
  className = "",
}: AccordionProps) {
  const [internalIds, setInternalIds] = useState<string[]>(
    defaultExpandedId ? [defaultExpandedId] : []
  );

  // Controlled vs uncontrolled
  const isControlled = controlledIds !== undefined;
  const activeIds = isControlled ? controlledIds : internalIds;

  const setActiveIds = useCallback(
    (ids: string[]) => {
      if (!isControlled) {
        setInternalIds(ids);
      }
      onExpandedChange?.(ids);
    },
    [isControlled, onExpandedChange]
  );

  const toggleItem = useCallback(
    (id: string) => {
      const isExpanded = activeIds.includes(id);
      if (isExpanded) {
        setActiveIds(activeIds.filter((i) => i !== id));
      } else if (allowMultiple) {
        setActiveIds([...activeIds, id]);
      } else {
        setActiveIds([id]);
      }
    },
    [activeIds, allowMultiple, setActiveIds]
  );

  // Refs for keyboard navigation between items
  const triggerRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      let targetIndex = -1;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          targetIndex = (index + 1) % items.length;
          break;
        case "ArrowUp":
          e.preventDefault();
          targetIndex = (index - 1 + items.length) % items.length;
          break;
        case "Home":
          e.preventDefault();
          targetIndex = 0;
          break;
        case "End":
          e.preventDefault();
          targetIndex = items.length - 1;
          break;
      }

      if (targetIndex >= 0) {
        triggerRefs.current[targetIndex]?.focus();
      }
    },
    [items.length]
  );

  return (
    <div className={`flex flex-col gap-3 ${className}`} role="list">
      {items.map((item, index) => (
        <AccordionItemRow
          key={item.id}
          item={item}
          isExpanded={activeIds.includes(item.id)}
          onToggle={() => toggleItem(item.id)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          triggerRef={(el) => {
            triggerRefs.current[index] = el;
          }}
        />
      ))}
    </div>
  );
}

// =============================================================================
// Accordion Item Row (internal)
// =============================================================================

interface AccordionItemRowProps {
  item: AccordionItem;
  isExpanded: boolean;
  onToggle: () => void;
  onKeyDown: (_e: React.KeyboardEvent) => void;
  triggerRef: (_el: HTMLButtonElement | null) => void;
}

function AccordionItemRow({
  item,
  isExpanded,
  onToggle,
  onKeyDown,
  triggerRef,
}: AccordionItemRowProps) {
  const uniqueId = useId();
  const triggerId = `accordion-trigger-${uniqueId}`;
  const panelId = `accordion-panel-${uniqueId}`;

  return (
    <div
      role="listitem"
      className={[
        "wobbly-md border-2 overflow-hidden",
        "bg-[var(--color-bg)]",
        "border-[var(--color-border)]",
        "transition-shadow duration-[var(--transition-fast)]",
        "motion-reduce:transition-none",
      ].join(" ")}
      style={{
        boxShadow: isExpanded
          ? "var(--shadow-emphasized)"
          : "var(--shadow-default)",
      }}
    >
      {/* Trigger / Header */}
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        onClick={() => !item.disabled && onToggle()}
        onKeyDown={onKeyDown}
        aria-expanded={isExpanded}
        aria-controls={panelId}
        disabled={item.disabled}
        className={[
          "w-full text-left px-5 py-4 flex items-center justify-between gap-3",
          "font-[family-name:var(--font-body)]",
          "cursor-pointer",
          "hover:bg-[var(--color-bg-alt)]",
          "transition-colors duration-[var(--transition-fast)]",
          "motion-reduce:transition-none",
          "focus-visible:outline-none focus-visible:ring-2",
          "focus-visible:ring-[var(--color-accent)] focus-visible:ring-inset",
          item.disabled ? "opacity-50 cursor-not-allowed" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="flex-1">{item.trigger}</div>

        {/* Expand/collapse chevron */}
        <svg
          className={[
            "w-5 h-5 flex-shrink-0",
            "transition-transform duration-200",
            "motion-reduce:transition-none",
            isExpanded ? "rotate-180" : "rotate-0",
          ].join(" ")}
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
      </button>

      {/* Collapsible Panel */}
      <div
        id={panelId}
        role="region"
        aria-labelledby={triggerId}
        hidden={!isExpanded}
        className={[
          "overflow-hidden",
          "transition-all duration-200 ease-out",
          "motion-reduce:transition-none",
        ].join(" ")}
      >
        {isExpanded && (
          <div className="px-5 pb-5 border-t-2 border-dashed border-[var(--color-border-light)]">
            <div className="pt-4">{item.content}</div>
          </div>
        )}
      </div>
    </div>
  );
}
