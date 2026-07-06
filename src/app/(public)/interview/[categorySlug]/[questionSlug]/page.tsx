/**
 * Q&A Detailed Solution Page — Server Component
 *
 * Fetches selected question details and current user session.
 * Evaluates premium paywall gating and registers SEO metadata before mounting
 * the client viewer container.
 *
 * @route /interview/[categorySlug]/[questionSlug]
 * @see 03_App_Flow.md §1 — Site Map
 */

import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { connectDB } from "@/lib/db/connection";
import { Category } from "@/lib/db/models/Category";
import { Question } from "@/lib/db/models/Question";
import { auth } from "@/auth";
import { QuestionDetailContainer } from "./QuestionDetailContainer";

export const revalidate = 3600; // Revalidate every hour (ISR)

interface QuestionDetailPageProps {
  params: Promise<{
    categorySlug: string;
    questionSlug: string;
  }>;
}

export async function generateMetadata({
  params,
}: QuestionDetailPageProps): Promise<Metadata> {
  await connectDB();
  const { categorySlug, questionSlug } = await params;
  const question = await Question.findOne({ slug: questionSlug.toLowerCase() });

  if (!question) return {};

  return {
    title: `${question.question} Solution`,
    description: question.answer.short || "Ace your interview loop with our targeted model solutions.",
    alternates: {
      canonical: `/interview/${categorySlug}/${question.slug}`,
    },
  };
}

export default async function QuestionDetailPage({ params }: QuestionDetailPageProps) {
  await connectDB();
  const { categorySlug, questionSlug } = await params;

  // Retrieve details
  const [categoryDoc, questionDoc] = await Promise.all([
    Category.findOne({ slug: categorySlug.toLowerCase() }),
    Question.findOne({ slug: questionSlug.toLowerCase() }).populate("category", "slug name"),
  ]);

  if (!categoryDoc || !questionDoc) {
    notFound();
  }

  const categoryObject = questionDoc.category as unknown as { slug: string; name: string } | null;
  const belongsToCategory =
    categoryObject?.slug.toLowerCase() === categorySlug.toLowerCase();
  
  if (!belongsToCategory) {
    notFound();
  }

  // Retrieve current user authorization status
  const session = await auth();
  const user = session?.user;

  // Determine if user has premium status (Admins/Editors get auto-clearance)
  const userHasPremium =
    user ? user.role === "admin" || user.role === "editor" || !!user.isPremium : false;

  // Serialize Question Data
  const questionData = {
    _id: questionDoc._id.toString(),
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
  };

  return (
    <div className="paper-grain min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        
        {/* Navigation Breadcrumbs */}
        <div className="text-sm font-[family-name:var(--font-heading)] font-bold text-[var(--color-fg-muted)] space-x-2">
          <Link href="/interview" className="hover:underline">
            Library
          </Link>
          <span>/</span>
          <Link href={`/interview/${categorySlug}`} className="hover:underline">
            {categoryDoc.name}
          </Link>
          <span>/</span>
          <span className="text-[var(--color-fg)]">Solution</span>
        </div>

        {/* Core viewer container */}
        <QuestionDetailContainer
          categoryName={categoryDoc.name}
          question={questionData}
          userHasPremium={userHasPremium}
        />
      </div>
    </div>
  );
}
