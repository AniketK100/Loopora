/**
 * SignupForm Client Component — InterviewLoop Design System
 *
 * Client form handling user account creation and Google OAuth entry.
 *
 * Accessibility:
 *   - Error region uses role="alert" + aria-live="assertive"
 *   - Buttons carry aria-label and aria-busy during loading states
 *   - All interactive targets meet WCAG 2.5.5 (≥44px touch target)
 *
 * @module app/(public)/signup/SignupForm
 * @see 03_App_Flow.md §4 — Auth Flow
 */

"use client";

import React, { useId, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button, Input, Card } from "@/components/ui";
import posthog from "posthog-js";

export function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorId = useId();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Guard against open-redirect
  const rawCallback = searchParams.get("callbackUrl") || "/";
  const callbackUrl =
    rawCallback.startsWith("/") && !rawCallback.startsWith("//")
      ? rawCallback
      : "/";

  const isAnyLoading = isLoading || isGoogleLoading || !!success;

  const handleGoogleSignIn = async () => {
    if (isAnyLoading) return; // prevent double click
    setError(null);
    setIsGoogleLoading(true);
    try {
      await signIn("google", { callbackUrl });
    } catch {
      setError("Could not connect to Google. Please try again.");
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAnyLoading) return; // prevent double click
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create account. Please try again.");
        setIsLoading(false);
        return;
      }

      setSuccess("Account created successfully! Redirecting to sign in...");
      posthog.capture("signup_completed");

      // Auto-redirect to sign in after 2 seconds
      setTimeout(() => {
        router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
      }, 2000);
    } catch {
      setError("An unexpected network error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <Card
      decoration="tape"
      className="max-w-md w-full p-6 sm:p-8"
      style={{ boxShadow: "var(--shadow-emphasized)" }}
    >
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold font-[family-name:var(--font-heading)] text-[var(--color-fg)]">
          Join Loopora!
        </h2>
        <p className="text-sm font-[family-name:var(--font-body)] text-[var(--color-fg-muted)] mt-1">
          Create an account to save bookmarks and track practice.
        </p>
      </div>

      {/* ── Alerts ────────────────────────────────────────────── */}
      <div
        id={errorId}
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        {error && (
          <div className="wobbly-sm border-2 border-[var(--color-error)] bg-red-50 p-3 mb-5 text-sm text-[var(--color-error)] font-[family-name:var(--font-body)]">
            ⚠️ {error}
          </div>
        )}
      </div>

      {success && (
        <div className="wobbly-sm border-2 border-[var(--color-success)] bg-green-50 p-3 mb-5 text-sm text-[var(--color-success)] font-[family-name:var(--font-body)]">
          🎉 {success}
        </div>
      )}

      {/* ── Google OAuth ─────────────────────────────────────── */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isAnyLoading}
        aria-label={isGoogleLoading ? "Connecting to Google…" : "Continue with Google"}
        aria-busy={isGoogleLoading}
        aria-describedby={error ? errorId : undefined}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 min-h-[44px] border-2 border-[var(--color-border)] rounded font-[family-name:var(--font-body)] font-semibold text-sm text-[var(--color-fg)] bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-secondary)]"
      >
        {isGoogleLoading ? (
          <span
            className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"
            aria-hidden="true"
          />
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
        )}
        <span>{isGoogleLoading ? "Connecting…" : "Continue with Google"}</span>
      </button>

      {/* ── Divider ─────────────────────────────────────────── */}
      <div className="relative flex items-center gap-3 my-4" role="separator" aria-hidden="true">
        <div className="flex-1 border-t border-dashed border-[var(--color-border-light)]" />
        <span className="text-xs font-[family-name:var(--font-body)] text-[var(--color-fg-muted)] shrink-0 select-none">
          or sign up with email
        </span>
        <div className="flex-1 border-t border-dashed border-[var(--color-border-light)]" />
      </div>

      {/* ── Credentials Form ─────────────────────────────────── */}
      <form
        onSubmit={handleSubmit}
        className="space-y-4"
        aria-label="Create your account with email and password"
        noValidate
      >
        <div className="ph-no-capture">
          <Input
            label="Your Name"
            type="text"
            autoComplete="name"
            required
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isAnyLoading}
            aria-describedby={error ? errorId : undefined}
          />
        </div>

        <div className="ph-no-capture">
          <Input
            label="Email Address"
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isAnyLoading}
          />
        </div>

        <div className="ph-no-capture">
          <Input
            label="Password"
            type="password"
            autoComplete="new-password"
            required
            placeholder="Minimum 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isAnyLoading}
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          isLoading={isLoading}
          disabled={isAnyLoading}
          aria-busy={isLoading}
        >
          Create Account
        </Button>
      </form>

      {/* ── Footer ──────────────────────────────────────────── */}
      <div className="text-center mt-6 pt-4 border-t-2 border-dashed border-[var(--color-border-light)] text-sm font-[family-name:var(--font-body)]">
        <span className="text-[var(--color-fg-muted)]">Already have an account? </span>
        <a
          href="/login"
          className="font-bold text-[var(--color-secondary)] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-secondary)] rounded-sm"
        >
          Sign in here
        </a>
      </div>
    </Card>
  );
}
