/**
 * Category Questions List Page — Server Component
 *
 * Fetches the selected category by slug and its associated questions list.
 * Renders the briefing header and delegates list interactive state to the container.
 *
 * @route /interview/[categorySlug]
 * @see 03_App_Flow.md §1 — Site Map
 */

import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { connectDB } from "@/lib/db/connection";
import { Category } from "@/lib/db/models/Category";
import { Question } from "@/lib/db/models/Question";
import { Card } from "@/components/ui";
import { CategoryQuestionsContainer } from "./CategoryQuestionsContainer";

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

  return {
    title: `${category.name} Interview Questions`,
    description: category.description || `Practice model answers for ${category.name} interviews.`,
    alternates: {
      canonical: `/interview/${category.slug}`,
    },
  };
}

export default async function CategoryQuestionsPage({ params }: CategoryQuestionsPageProps) {
  await connectDB();
  const { categorySlug } = await params;

  // Retrieve category
  const categoryDoc = await Category.findOne({ slug: categorySlug.toLowerCase() });
  if (!categoryDoc) {
    notFound();
  }

  // Retrieve all published questions for this category
  const questionDocs = await Question.find({
    category: categoryDoc._id,
    isPublished: true,
  }).sort({ frequencyRank: 1 }); // Sort by rank index (lower = floats to top)

  // Serialize Category
  const categoryData = {
    name: categoryDoc.name,
    slug: categoryDoc.slug,
    description: categoryDoc.description || "",
    icon: categoryDoc.icon || "",
  };

  // Serialize Questions
  const questionsData = questionDocs.map((q) => ({
    _id: q._id.toString(),
    slug: q.slug,
    question: q.question,
    answer: {
      short: q.answer.short || "",
      detailed: q.answer.detailed,
    },
    difficulty: q.difficulty,
    isPremium: q.isPremium,
    tags: q.tags || [],
  }));

  const iconEmoji = getIconEmoji(categoryDoc.icon);

  // Generate FAQPage JSON-LD structured data for SEO
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": questionsData.map((q) => ({
      "@type": "Question",
      "name": q.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": q.answer.short || q.answer.detailed.replace(/<[^>]+>/g, "").trim(),
      },
    })),
  };

  return (
    <div className="paper-grain min-h-screen py-12">
      {/* FAQPage JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div className="text-sm font-[family-name:var(--font-heading)] font-bold text-[var(--color-fg-muted)]">
          <Link href="/interview" className="hover:underline">
            &larr; Folders Library
          </Link>
        </div>

        {/* Binder Header Panel */}
        <Card decoration="tape" className="p-6 md:p-8" style={{ borderLeftWidth: "6px", borderLeftColor: "var(--color-accent)" }}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="capitalize text-xs font-bold text-[var(--color-fg-muted)] font-[family-name:var(--font-body)]">
                🏷️ {categoryDoc.type.replace("-", " ")} Folder
              </span>
              <h1
                className="text-3xl md:text-4xl font-bold text-[var(--color-fg)] mt-1 flex items-center gap-2"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                <span>{iconEmoji}</span>
                <span>{categoryData.name}</span>
              </h1>
              <p
                className="text-base text-[var(--color-fg-muted)] mt-2 max-w-2xl font-[family-name:var(--font-body)]"
              >
                {categoryData.description || "Review targeted Q&As and practice worked examples."}
              </p>
            </div>
            
            <div className="hidden sm:block">
              <span className="inline-block px-3 py-1 bg-[var(--color-bg-alt)] text-[var(--color-fg-muted)] wobbly-sm border border-[var(--color-border-light)] font-bold font-[family-name:var(--font-heading)] text-sm">
                {questionsData.length} items
              </span>
            </div>
          </div>
        </Card>

        {/* Questions filter & list container (Client Component) */}
        <CategoryQuestionsContainer
          category={categoryData}
          questions={questionsData}
        />
      </div>
    </div>
  );
}

/**
 * Fallback Emoji resolver for common folder icons
 */
function getIconEmoji(iconName?: string): string {
  switch (iconName?.toLowerCase()) {
    case "user":
      return "👤";
    case "code":
      return "💻";
    case "cpu":
      return "⚙️";
    case "briefcase":
      return "💼";
    case "award":
      return "🏆";
    case "brain":
      return "🧠";
    case "bookopen":
      return "📖";
    default:
      return "📁";
  }
}
