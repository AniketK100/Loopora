/**
 * Suggest Q&A Page — Public Route
 *
 * Lets visitors submit interview question suggestions and feedback. Posts to
 * the public /api/suggestions endpoint.
 *
 * @route /suggest
 */

import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui";
import { SuggestionForm } from "./SuggestionForm";

export const metadata = {
  title: "Suggest a Q&A",
  description:
    "Help us grow the Loopora interview library. Suggest a new question, category or share feedback with the team.",
};

export default function SuggestPage() {
  return (
    <div className="paper-grain min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4 space-y-8">
        <div className="text-sm font-[family-name:var(--font-heading)] font-bold text-[var(--color-fg-muted)]">
          <Link href="/" className="hover:underline">
            &larr; Home
          </Link>
        </div>

        <Card decoration="tape" className="p-8 space-y-6">
          <div className="space-y-2">
            <h1
              className="text-4xl font-bold text-[var(--color-fg)] border-b border-[var(--color-border-light)] pb-2"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              💡 Suggest a Q&amp;A
            </h1>
            <p className="text-sm text-[var(--color-fg-muted)] font-[family-name:var(--font-body)]">
              Know a great interview question we&apos;re missing? Share it below.
              Suggestions are reviewed by our team and added to the library.
            </p>
          </div>

          <SuggestionForm />
        </Card>
      </div>
    </div>
  );
}
