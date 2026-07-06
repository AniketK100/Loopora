/**
 * Admin Edit Question Page — Server Component
 *
 * Fetches selected question details and the categories list,
 * rendering the QuestionForm in edit/update mode.
 *
 * @route /admin/questions/[id]
 */

import { Metadata } from "next";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db/connection";
import { Category } from "@/lib/db/models/Category";
import { Question } from "@/lib/db/models/Question";
import { QuestionForm } from "../QuestionForm";

interface EditQuestionPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Edit Question — Admin",
};

export default async function AdminEditQuestionPage({ params }: EditQuestionPageProps) {
  await connectDB();
  const { id } = await params;

  // Retrieve details
  const [questionDoc, categories] = await Promise.all([
    Question.findById(id),
    Category.find({}, "name").sort({ order: 1 }),
  ]);

  if (!questionDoc) {
    notFound();
  }

  // Convert mongoose objects to plain JSON safely
  const initialData = {
    _id: questionDoc._id.toString(),
    category: questionDoc.category.toString(),
    slug: questionDoc.slug,
    question: questionDoc.question,
    answer: {
      short: questionDoc.answer.short || "",
      detailed: questionDoc.answer.detailed,
      example: questionDoc.answer.example || "",
    },
    videos: (questionDoc.videos || []).map((v) => ({
      label: v.label,
      url: v.url,
      order: v.order,
    })),
    difficulty: questionDoc.difficulty,
    frequencyRank: questionDoc.frequencyRank,
    tags: questionDoc.tags || [],
    isPremium: questionDoc.isPremium,
    isPublished: questionDoc.isPublished,
  };

  const categoriesData = categories.map((c) => ({
    _id: c._id.toString(),
    name: c.name,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-3xl font-bold text-[var(--color-fg)]"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          📝 Edit Question Prompt: {initialData.question}
        </h2>
        <p
          className="text-base text-[var(--color-fg-muted)] mt-1"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Update explanations, STAR examples, or manage linked video rows.
        </p>
      </div>

      <QuestionForm categories={categoriesData} initialData={initialData} />
    </div>
  );
}
