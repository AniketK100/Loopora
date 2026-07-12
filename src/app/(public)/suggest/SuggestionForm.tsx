/**
 * Suggestion Form — Client Component
 *
 * Submits a new interview question suggestion to the public /api/suggestions
 * endpoint with proper loading, success and error states.
 *
 * @module app/(public)/suggest/SuggestionForm
 */

"use client";

import React, { useState } from "react";
import { Button, Input } from "@/components/ui";

type Status = "idle" | "submitting" | "success" | "error";

export function SuggestionForm() {
  const [questionText, setQuestionText] = useState("");
  const [categorySuggestion, setCategorySuggestion] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setMessage(null);

    try {
      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionText, categorySuggestion, notes }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Please try again.");
        return;
      }

      setStatus("success");
      setMessage(
        data.message ||
          "Thank you! Your suggestion has been recorded for review.",
      );
      setQuestionText("");
      setCategorySuggestion("");
      setNotes("");
    } catch {
      setStatus("error");
      setMessage("A network error occurred. Please try again.");
    }
  };

  if (status === "success" && message) {
    return (
      <div
        role="status"
        className="wobbly-sm border-2 border-[var(--color-success)] bg-green-50 p-4 text-sm text-[var(--color-fg)] font-[family-name:var(--font-body)]"
      >
        <p className="font-bold font-[family-name:var(--font-heading)] mb-1">
          ✅ Suggestion received!
        </p>
        <p>{message}</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => {
            setStatus("idle");
            setMessage(null);
          }}
        >
          Submit another
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {status === "error" && message && (
        <div
          role="alert"
          className="wobbly-sm border-2 border-[var(--color-error)] bg-red-50 p-3 text-sm text-[var(--color-error)] font-[family-name:var(--font-body)]"
        >
          ⚠️ {message}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="questionText"
          className="text-sm font-bold font-[family-name:var(--font-heading)] text-[var(--color-fg)]"
        >
          Your suggested question <span className="text-[var(--color-error)]">*</span>
        </label>
        <textarea
          id="questionText"
          rows={3}
          required
          minLength={5}
          placeholder="e.g. How would you design a rate limiter for a public API?"
          className="wobbly-sm border-2 px-4 py-2.5 bg-[var(--color-bg)] text-[var(--color-fg)] font-[family-name:var(--font-body)] border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-1"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          disabled={status === "submitting"}
        />
      </div>

      <Input
        label="Suggested category (optional)"
        placeholder="e.g. System Design, React, Behavioral"
        value={categorySuggestion}
        onChange={(e) => setCategorySuggestion(e.target.value)}
        disabled={status === "submitting"}
        maxLength={100}
      />

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="notes"
          className="text-sm font-bold font-[family-name:var(--font-heading)] text-[var(--color-fg)]"
        >
          Notes / context (optional)
        </label>
        <textarea
          id="notes"
          rows={3}
          maxLength={500}
          placeholder="Any extra detail, links or context that helps us evaluate the suggestion."
          className="wobbly-sm border-2 px-4 py-2.5 bg-[var(--color-bg)] text-[var(--color-fg)] font-[family-name:var(--font-body)] border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-1"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={status === "submitting"}
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" variant="primary" isLoading={status === "submitting"}>
          Submit Suggestion
        </Button>
      </div>
    </form>
  );
}
