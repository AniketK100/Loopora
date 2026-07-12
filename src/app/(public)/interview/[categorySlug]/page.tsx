/**
 * Category Questions List Page — Server Component
 *
 * Renders the shared three-column Interview Workspace for a folder. The active
 * question defaults to the first published question so the folder opens directly
 * into the experience; every question keeps its own URL for SEO / sharing.
 *
 * @route /interview/[categorySlug]
 * @see 03_App_Flow.md §1 — Site Map
 */

import { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { connectDB } from "@/lib/db/connection";
import { Category } from "@/lib/db/models/Category";
import { getWorkspaceData } from "../workspace-data";
import { InterviewWorkspace } from "../InterviewWorkspace";

export const revalidate = 3600; // Revalidate every hour (ISR)

interface CategoryQuestionsPageProps {
  params: Promise<{ categorySlug: string }>;
}

export async function generateMetadata({
  params,
}: CategoryQuestionsPageProps): Promise<Metadata> {
  await connectDB();
  const { categorySlug } = await params;
  const category = await Category.findOne({ slug: categorySlug.toLowerCase() });

  if (!category) return {};

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://loopora.app";
  const canonical = `/interview/${category.slug}`;
  const description = category.description || `Practice model answers for ${category.name} interviews.`;

  return {
    title: `${category.name} Interview Questions`,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      title: `${category.name} Interview Questions`,
      description,
      url: `${SITE_URL}${canonical}`,
      siteName: "Loopora",
    },
    twitter: {
      card: "summary_large_image",
      title: `${category.name} Interview Questions`,
      description,
    },
  };
}

export default async function CategoryQuestionsPage({ params }: CategoryQuestionsPageProps) {
  await connectDB();
  const { categorySlug } = await params;

  const data = await getWorkspaceData(categorySlug, null);

  if (!data.category) {
    notFound();
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: data.questions.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.question,
      },
    })),
  };

  return (
    <div className="paper-grain min-h-screen">
      {/* FAQPage JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="max-w-[1800px] mx-auto px-2 sm:px-3 lg:px-4 py-2">
        {/* Breadcrumb */}
        <nav
          className="text-sm font-[family-name:var(--font-heading)] font-bold text-[var(--color-fg-muted)] mb-2"
          aria-label="Breadcrumb"
        >
          <Link href="/interview" className="hover:underline">
            &larr; Folders Library
          </Link>
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
