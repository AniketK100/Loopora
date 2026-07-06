/**
 * LoginForm Client Component — InterviewLoop Design System
 *
 * Client form handling user credentials authentication.
 * Reuses design system buttons, inputs, and card containers.
 *
 * @module app/(public)/login/LoginForm
 * @see 03_App_Flow.md §4 — Auth Flow
 */

"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button, Input, Card } from "@/components/ui";

export function LoginForm() {
  const searchParams = useSearchParams();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Get redirect URL from search parameters or fallback to home page
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (res?.error) {
        setError("Invalid email or password. Please try again.");
        setIsLoading(false);
      } else {
        // Success! Perform full reload to update layouts and router state
        window.location.href = callbackUrl;
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <Card decoration="tape" className="max-w-md w-full p-6 sm:p-8" style={{ boxShadow: "var(--shadow-emphasized)" }}>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold font-[family-name:var(--font-heading)] text-[var(--color-fg)]">
          Welcome Back!
        </h2>
        <p className="text-sm font-[family-name:var(--font-body)] text-[var(--color-fg-muted)] mt-1">
          Sign in to your notebook to track your progress.
        </p>
      </div>

      {error && (
        <div className="wobbly-sm border-2 border-[var(--color-error)] bg-red-50 p-3 mb-5 text-sm text-[var(--color-error)] font-[family-name:var(--font-body)]">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
        />

        <Input
          label="Password"
          type="password"
          required
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
        />

        <Button type="submit" variant="primary" fullWidth isLoading={isLoading}>
          Sign In
        </Button>
      </form>

      <div className="text-center mt-6 pt-4 border-t-2 border-dashed border-[var(--color-border-light)] text-sm font-[family-name:var(--font-body)]">
        <span className="text-[var(--color-fg-muted)]">Don&apos;t have an account? </span>
        <a
          href="/signup"
          className="font-bold text-[var(--color-secondary)] hover:underline"
        >
          Sign up here
        </a>
      </div>
    </Card>
  );
}
