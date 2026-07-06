/**
 * Admin Suggestions Page — Server Component
 *
 * Renders user-suggested interview questions and feedback details.
 * Lists prompts, optional categories, notes, status, and administrative action buttons.
 *
 * @route /admin/suggestions
 * @see 05_Backend_Schema_Data_Auth.md §2.7 — Suggestion Schema
 */

import { Metadata } from "next";
import { connectDB } from "@/lib/db/connection";
import { Suggestion } from "@/lib/db/models/Suggestion";
import { Card } from "@/components/ui";
import { SuggestionReviewRow } from "./SuggestionReviewRow";

export const metadata: Metadata = {
  title: "User Q&A Suggestions — Admin",
};

export default async function AdminSuggestionsPage() {
  await connectDB();

  // Fetch suggestions sorted by newest first
  const suggestions = await Suggestion.find().sort({ createdAt: -1 });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2
          className="text-3xl font-bold text-[var(--color-fg)]"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          💡 Candidate Q&A Suggestions
        </h2>
        <p
          className="text-base text-[var(--color-fg-muted)] mt-1"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Review question ideas and notes submitted by the candidate prep community.
        </p>
      </div>

      {/* Main Table Card */}
      <Card decoration="none">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left font-[family-name:var(--font-body)]">
            <thead>
              <tr className="border-b-2 border-[var(--color-border)] bg-[var(--color-bg-alt)] text-sm font-bold font-[family-name:var(--font-heading)]">
                <th className="p-4 w-44">Date Submitted</th>
                <th className="p-4">Suggested Question Prompt</th>
                <th className="p-4 w-44">Target Category</th>
                <th className="p-4 w-28 text-center">Status</th>
                <th className="p-4 w-40 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[var(--color-border-light)] text-base">
              {suggestions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[var(--color-fg-muted)] font-[family-name:var(--font-body)]">
                    No community suggestions submitted yet.
                  </td>
                </tr>
              ) : (
                suggestions.map((s) => (
                  <tr key={s._id.toString()} className="hover:bg-[var(--color-bg-alt)]/50 transition-colors">
                    <td className="p-4 text-xs font-mono text-[var(--color-fg-muted)]">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-[var(--color-fg)] whitespace-pre-line">
                        {s.questionText}
                      </p>
                      {s.notes && (
                        <p className="text-xs text-[var(--color-fg-muted)] mt-2 bg-[var(--color-bg-alt)] p-2 wobbly-sm border border-dashed border-[var(--color-border-light)] max-w-lg">
                          💬 Notes: {s.notes}
                        </p>
                      )}
                    </td>
                    <td className="p-4 text-sm font-bold text-[var(--color-fg-muted)]">
                      {s.categorySuggestion || (
                        <span className="italic text-gray-400">None specified</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {s.status === "new" ? (
                        <span className="inline-block px-2.5 py-0.5 text-xs font-bold bg-amber-50 text-[var(--color-warning)] wobbly-sm border border-[var(--color-warning)]">
                          Pending
                        </span>
                      ) : (
                        <span className="inline-block px-2.5 py-0.5 text-xs font-bold bg-green-50 text-[var(--color-success)] wobbly-sm border border-[var(--color-success)]">
                          Reviewed
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <SuggestionReviewRow id={s._id.toString()} initialStatus={s.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
