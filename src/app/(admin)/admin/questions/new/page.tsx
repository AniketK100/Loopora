/**
 * Admin Create Question Page — Server Component
 *
 * Fetches all folders and renders the QuestionForm in creation mode.
 *
 * @route /admin/questions/new
 */

import { Metadata } from "next";
import { connectDB } from "@/lib/db/connection";
import { Category } from "@/lib/db/models/Category";
import { QuestionForm } from "../QuestionForm";

export const metadata: Metadata = {
  title: "Write Question — Admin",
};

export default async function AdminNewQuestionPage() {
  await connectDB();

  // Fetch folders list for selection dropdown
  const categories = await Category.find({}, "name").sort({ order: 1 });

  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-3xl font-bold text-[var(--color-fg)]"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          📝 Write New Model Q&A
        </h2>
        <p
          className="text-base text-[var(--color-fg-muted)] mt-1"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Add a detailed answer explanation, worked examples, and video tutorials.
        </p>
      </div>

      <QuestionForm categories={categories.map((c) => ({ _id: c._id.toString(), name: c.name }))} />
    </div>
  );
}
