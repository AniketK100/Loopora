/**
 * PremiumUpgradeModal Component
 *
 * Shown when a free user attempts to upload beyond their 1-resume limit.
 * Displays Premium plan benefits and prompts upgrade.
 *
 * @module components/PremiumUpgradeModal
 */

"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";

interface PremiumUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PremiumUpgradeModal({ isOpen, onClose }: PremiumUpgradeModalProps) {
  const router = useRouter();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleUpgrade = () => {
    onClose();
    router.push("/profile");
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Upgrade to Premium"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[var(--color-bg)] border-2 border-[var(--color-border)] wobbly p-8 max-w-md w-full mx-4 shadow-[var(--shadow-hover)]">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] text-lg"
        >
          ✕
        </button>

        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <span className="text-4xl">⭐</span>
            <h2
              className="text-2xl font-bold text-[var(--color-fg)]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Upgrade to Premium
            </h2>
            <p className="text-sm text-[var(--color-fg-muted)]">
              Free accounts can store up to 1 resume.
            </p>
          </div>

          {/* Benefits */}
          <div className="bg-[#faf8f5] border-2 border-[var(--color-border)] wobbly-sm p-4 space-y-3">
            <h3
              className="font-bold text-[var(--color-fg)]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Premium includes:
            </h3>
            <ul className="space-y-2 text-sm text-[var(--color-fg)]">
              <li className="flex items-start gap-2">
                <span className="text-[var(--color-success)] shrink-0">✓</span>
                <span>Up to <strong>3 resumes</strong> with quality analysis</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--color-success)] shrink-0">✓</span>
                <span><strong>Resume classification</strong> to reject non-resume uploads</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--color-success)] shrink-0">✓</span>
                <span><strong>Quality scoring</strong> with improvement suggestions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--color-success)] shrink-0">✓</span>
                <span><strong>Personalized answers</strong> powered by your resume</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--color-success)] shrink-0">✓</span>
                <span><strong>Resume manager</strong> — replace, delete, set active</span>
              </li>
            </ul>
          </div>

          {/* Price */}
          <div className="text-center">
            <span
              className="text-3xl font-bold text-[var(--color-fg)]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              ₹50
            </span>
            <span className="text-sm text-[var(--color-fg-muted)]">/month</span>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" fullWidth onClick={onClose}>
              Maybe Later
            </Button>
            <Button variant="primary" fullWidth onClick={handleUpgrade}>
              Upgrade Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
