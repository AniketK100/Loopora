/**
 * CookieConsent Component — Public UI Banner
 *
 * Renders a wobbly on-brand cookie notification banner at the bottom
 * of the page unless consent has been accepted in localStorage.
 *
 * @module components/ui/CookieConsent
 * @see 06_Implementation_Plan_Build_Order.md Phase 10 — Launch Readiness
 */

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "./index";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if consent has already been given
    const consent = localStorage.getItem("loopora_cookie_consent");
    if (!consent) {
      // Small delay to make entry feel smooth and premium
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("loopora_cookie_consent", "true");
    setIsVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem("loopora_cookie_consent", "false");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 md:bottom-4 md:left-auto md:right-4 md:max-w-md z-50 animate-fade-in-up pb-[env(safe-area-inset-bottom)]">
      <div
        role="dialog"
        aria-label="Cookie notice"
        className="bg-[var(--color-bg-alt)] border-t-2 md:border-2 border-[var(--color-border)] wobbly-sm p-5 space-y-3 relative overflow-hidden"
        style={{ boxShadow: "var(--shadow-emphasized)" }}
      >
        {/* Binder accent strip */}
        <div className="absolute top-0 left-0 bottom-0 w-2 bg-[var(--color-accent)]" />

        <div className="pl-3 space-y-2">
          <h4 className="text-base font-bold text-[var(--color-fg)] font-[family-name:var(--font-heading)] flex items-center gap-1.5">
            <span>🍪</span>
            <span>Cookie Notice</span>
          </h4>
          <p className="text-xs text-[var(--color-fg-muted)] leading-relaxed font-[family-name:var(--font-body)]">
            We use cookies to maintain your login session, protect forms against spam, and optimize interview lists. By continuing, you agree to our{" "}
            <Link href="/cookies" className="text-[var(--color-secondary)] hover:underline font-bold">
              Cookie Policy
            </Link>.
          </p>
        </div>

        <div className="pl-3 flex items-center justify-end gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReject}
            className="text-xs font-bold"
          >
            Reject
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleAccept}
            className="text-xs font-bold"
          >
            Accept Cookies
          </Button>
        </div>
      </div>
    </div>
  );
}
