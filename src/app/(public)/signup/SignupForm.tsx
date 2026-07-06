/**
 * SignupForm Client Component — InterviewLoop Design System
 *
 * Client form handling user account creation.
 * Calls registration endpoint and provides clear error feedback.
 * Reuses design system buttons, inputs, and card containers.
 *
 * @module app/(public)/signup/SignupForm
 * @see 03_App_Flow.md §4 — Auth Flow
 */

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Card } from "@/components/ui";

export function SignupForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      
      // Auto-redirect to sign in after 2 seconds
      setTimeout(() => {
        router.push("/login?callbackUrl=/");
      }, 2000);
    } catch {
      setError("An unexpected network error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <Card decoration="tape" className="max-w-md w-full p-6 sm:p-8" style={{ boxShadow: "var(--shadow-emphasized)" }}>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold font-[family-name:var(--font-heading)] text-[var(--color-fg)]">
          Join Loopora!
        </h2>
        <p className="text-sm font-[family-name:var(--font-body)] text-[var(--color-fg-muted)] mt-1">
          Create an account to save bookmarks and track practice.
        </p>
      </div>

      {error && (
        <div className="wobbly-sm border-2 border-[var(--color-error)] bg-red-50 p-3 mb-5 text-sm text-[var(--color-error)] font-[family-name:var(--font-body)]">
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div className="wobbly-sm border-2 border-[var(--color-success)] bg-green-50 p-3 mb-5 text-sm text-[var(--color-success)] font-[family-name:var(--font-body)]">
          🎉 {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Your Name"
          type="text"
          required
          placeholder="John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isLoading || !!success}
        />

        <Input
          label="Email Address"
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading || !!success}
        />

        <Input
          label="Password"
          type="password"
          required
          placeholder="Minimum 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading || !!success}
        />

        <Button type="submit" variant="primary" fullWidth isLoading={isLoading} disabled={!!success}>
          Create Account
        </Button>
      </form>

      <div className="text-center mt-6 pt-4 border-t-2 border-dashed border-[var(--color-border-light)] text-sm font-[family-name:var(--font-body)]">
        <span className="text-[var(--color-fg-muted)]">Already have an account? </span>
        <a
          href="/login"
          className="font-bold text-[var(--color-secondary)] hover:underline"
        >
          Sign in here
        </a>
      </div>
    </Card>
  );
}
