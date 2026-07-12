/**
 * Q&A Detailed Solution Page — Server Component
 *
 * Renders the shared three-column Interview Workspace for a single question
 * inside its folder. Fetches data via the shared loader (SSR/SEO) and mounts
 * the interactive workspace.
 *
 * @route /interview/[categorySlug]/[questionSlug]
 * @see 03_App_Flow.md §1 — Site Map
 */

import { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { connectDB } from "@/lib/db/connection";
import { Question } from "@/lib/db/models/Question";
import { getWorkspaceData } from "../../workspace-data";
import { InterviewWorkspace } from "../../InterviewWorkspace";

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
  const { categorySlug, questionSlug } = await params;
  const data = await getWorkspaceData(categorySlug, questionSlug);

  if (!data.category || !data.activeQuestion) {
    notFound();
  }

  return (
    <div className="paper-grain min-h-screen">
      <div className="max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6 py-3">
        {/* Breadcrumbs */}
        <nav
          className="text-sm font-[family-name:var(--font-heading)] font-bold text-[var(--color-fg-muted)] space-x-2 mb-2"
          aria-label="Breadcrumb"
        >
          <Link href="/interview" className="hover:underline">
            Library
          </Link>
          <span>/</span>
          <Link href={`/interview/${categorySlug}`} className="hover:underline">
            {data.category.name}
          </Link>
          <span>/</span>
          <span className="text-[var(--color-fg)]">Solution</span>
        </nav>

        <Suspense fallback={null}>
          <InterviewWorkspace
            category={data.category}
            questions={data.questions}
            activeQuestion={data.activeQuestion}
            userHasPremium={data.userHasPremium}
          />
        </Suspense>
      </div>
    </div>
  );
}
