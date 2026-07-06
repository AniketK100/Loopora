/**
 * Admin Questions Dashboard Page — Server Component
 *
 * Renders the administrative panel list of all questions.
 * Supports:
 * 1. Filtering by Category folder.
 * 2. Full-text search or title search.
 * 3. Quick routing for editing and cascading deletes.
 *
 * @route /admin/questions
 * @see 03_App_Flow.md §5 — Admin Content Flow
 */

import { Metadata } from "next";
import Link from "next/link";
import { connectDB } from "@/lib/db/connection";
import { Category } from "@/lib/db/models/Category";
import { Question } from "@/lib/db/models/Question";
import { Card, Button, Badge } from "@/components/ui";
import { DeleteQuestionButton } from "./DeleteQuestionButton";
import { AdminQuestionsFilter } from "./AdminQuestionsFilter";

export const metadata: Metadata = {
  title: "Manage Questions — Admin",
};

interface AdminQuestionsPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    page?: string;
  }>;
}

export default async function AdminQuestionsPage({ searchParams }: AdminQuestionsPageProps) {
  await connectDB();
  
  const params = await searchParams;
  const searchQ = params.q || "";
  const selectedCategory = params.category || "";
  const page = Math.max(1, parseInt(params.page || "1"));
  const limit = 25; // 25 questions per page

  // 1. Fetch categories for filters dropdown
  const categories = await Category.find().sort({ order: 1 });

  // 2. Build Mongoose query
  const query: { category?: string; question?: { $regex: string; $options: string } } = {};

  if (selectedCategory) {
    query.category = selectedCategory;
  }

  if (searchQ) {
    // Perform standard fuzzy match on question title
    query.question = { $regex: searchQ, $options: "i" };
  }

  // 3. Execute query with pagination
  const total = await Question.countDocuments(query);
  const totalPages = Math.ceil(total / limit);
  const skip = (page - 1) * limit;

  const questions = await Question.find(query)
    .sort({ createdAt: -1 }) // Newest first for admin efficiency
    .skip(skip)
    .limit(limit)
    .populate("category", "name slug");

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2
            className="text-3xl font-bold text-[var(--color-fg)]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            📝 Model Interview Q&As
          </h2>
          <p
            className="text-base text-[var(--color-fg-muted)] mt-1"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Review, author, edit, and link video explanations to questions.
          </p>
        </div>
        <div>
          <Link href="/admin/questions/new">
            <Button variant="primary" className="font-[family-name:var(--font-heading)] font-bold">
              + Write Question
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters Form Panel (Client Component) */}
      <AdminQuestionsFilter
        key={`${searchQ}-${selectedCategory}`}
        categories={categories.map((c) => ({ id: c._id.toString(), name: c.name }))}
        currentSearch={searchQ}
        currentCategory={selectedCategory}
      />

      {/* Main Table Card */}
      <Card decoration="none">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left font-[family-name:var(--font-body)]">
            <thead>
              <tr className="border-b-2 border-[var(--color-border)] bg-[var(--color-bg-alt)] text-sm font-bold font-[family-name:var(--font-heading)]">
                <th className="p-4">Question</th>
                <th className="p-4 w-44">Category</th>
                <th className="p-4 w-28 text-center">Difficulty</th>
                <th className="p-4 w-24 text-center">Videos</th>
                <th className="p-4 w-24 text-center">Premium</th>
                <th className="p-4 w-24 text-center">Status</th>
                <th className="p-4 w-40 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[var(--color-border-light)] text-base">
              {questions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[var(--color-fg-muted)] font-[family-name:var(--font-body)]">
                    No questions found. Adjust filters or write a new question.
                  </td>
                </tr>
              ) : (
                questions.map((q) => (
                  <tr key={q._id.toString()} className="hover:bg-[var(--color-bg-alt)]/50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-[var(--color-fg)] truncate max-w-md">
                        {q.question}
                      </p>
                      {q.answer.short && (
                        <p className="text-xs text-[var(--color-fg-muted)] truncate max-w-md mt-0.5">
                          {q.answer.short}
                        </p>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-[var(--color-fg-muted)] text-sm">
                        {(q.category as unknown as { name: string })?.name || "Uncategorized"}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <Badge variant={`difficulty-${q.difficulty}` as "difficulty-easy" | "difficulty-medium" | "difficulty-hard"}>
                        {q.difficulty}
                      </Badge>
                    </td>
                    <td className="p-4 text-center font-bold">
                      <Badge variant="default">{q.videos?.length || 0}</Badge>
                    </td>
                    <td className="p-4 text-center">
                      {q.isPremium ? (
                        <span className="inline-block px-2.5 py-0.5 text-xs font-bold bg-amber-50 text-[var(--color-warning)] wobbly-sm border border-[var(--color-warning)]">
                          Yes
                        </span>
                      ) : (
                        <span className="text-xs text-[var(--color-fg-muted)]">Free</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {q.isPublished ? (
                        <span className="inline-block px-2.5 py-0.5 text-xs font-bold bg-green-50 text-[var(--color-success)] wobbly-sm border border-[var(--color-success)]">
                          Published
                        </span>
                      ) : (
                        <span className="inline-block px-2.5 py-0.5 text-xs font-bold bg-gray-100 text-gray-500 wobbly-sm border border-gray-300">
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <Link href={`/admin/questions/${q._id}`}>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </Link>
                      <DeleteQuestionButton id={q._id.toString()} questionText={q.question} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Simple Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t-2 border-[var(--color-border)] bg-[var(--color-bg-alt)] flex items-center justify-between font-[family-name:var(--font-heading)] font-bold text-sm">
            <span className="text-[var(--color-fg-muted)]">
              Showing page {page} of {totalPages} ({total} total questions)
            </span>
            <div className="flex gap-2">
              <Link
                href={`/admin/questions?q=${searchQ}&category=${selectedCategory}&page=${page - 1}`}
                className={page <= 1 ? "pointer-events-none opacity-50" : ""}
              >
                <Button variant="outline" size="sm">
                  &larr; Prev
                </Button>
              </Link>
              <Link
                href={`/admin/questions?q=${searchQ}&category=${selectedCategory}&page=${page + 1}`}
                className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
              >
                <Button variant="outline" size="sm">
                  Next &rarr;
                </Button>
              </Link>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
