/**
 * Category Index Page — Public Interview Library
 *
 * Server component fetching all published categories and rendering them
 * in a "briefing card" grid layout. Consumes custom card visual design properties.
 *
 * @route /interview
 * @see 03_App_Flow.md §1 — Site Map
 */

import { Metadata } from "next";
import Link from "next/link";
import { connectDB } from "@/lib/db/connection";
import { Category } from "@/lib/db/models/Category";
import { Card, Badge } from "@/components/ui";

export const revalidate = 3600; // Revalidate every hour (ISR)

export const metadata: Metadata = {
  title: "Interview Library folders",
  description: "Browse interview question folders across technical, HR, system design, and situational topics.",
};

export default async function InterviewLibraryPage() {
  await connectDB();

  // Fetch only published categories sorted by order index
  const categories = await Category.find({ isPublished: true }).sort({ order: 1 });

  return (
    <div className="paper-grain min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Page Header */}
        <div className="text-center space-y-2">
          <h2
            className="text-4xl font-bold text-[var(--color-fg)]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            📁 Interview Folders Library
          </h2>
          <p
            className="text-base text-[var(--color-fg-muted)] max-w-xl mx-auto font-[family-name:var(--font-body)]"
          >
            Select a divider tab below to access curated questions, expert explanations, and mock worked examples.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.length === 0 ? (
            <div className="col-span-full text-center py-12 text-[var(--color-fg-muted)] font-[family-name:var(--font-body)]">
              No interview categories are published yet. Please check back later or seed content.
            </div>
          ) : (
            categories.map((cat, index) => {
              // Distribute marker-pen accent colors for divider strips
              const stripColor = getCategoryStripColor(index);
              const iconEmoji = getIconEmoji(cat.icon);

              return (
                <Link key={cat._id.toString()} href={`/interview/${cat.slug}`} className="block group">
                  <Card
                    hoverEffect
                    footerStripColor={stripColor}
                    className="h-64 flex flex-col justify-between p-6 transition-all duration-[var(--transition-fast)]"
                  >
                    <div>
                      {/* Card Category Type & Icon */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="capitalize text-xs font-bold text-[var(--color-fg-muted)] font-[family-name:var(--font-body)]">
                          🏷️ {cat.type.replace("-", " ")}
                        </span>
                        <span className="text-2xl group-hover:scale-110 transition-transform" aria-hidden="true">
                          {iconEmoji}
                        </span>
                      </div>

                      {/* Title */}
                      <h3
                        className="text-2xl font-bold text-[var(--color-fg)] group-hover:text-[var(--color-accent)] transition-colors"
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        {cat.name}
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-[var(--color-fg-muted)] line-clamp-3 mt-2 font-[family-name:var(--font-body)]">
                        {cat.description || "Browse question banks and worked narrative templates."}
                      </p>
                    </div>

                    {/* Footer count badge */}
                    <div className="flex items-center justify-between pt-4 border-t border-dashed border-[var(--color-border-light)] font-[family-name:var(--font-body)] text-xs font-bold">
                      <span className="text-[var(--color-fg-muted)]">Questions in folder:</span>
                      <Badge variant="default">{cat.questionCount || 0}</Badge>
                    </div>
                  </Card>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Returns a custom marker strip color based on item loop index
 * to create a beautiful divider tab index card effect.
 */
function getCategoryStripColor(index: number): string {
  const colors = [
    "var(--color-accent)",       // Solid red/pink
    "var(--color-secondary)",    // Blue
    "var(--color-post-it-dark)", // Post-it yellow/orange
    "var(--color-success)",      // Green
    "var(--color-warning)",      // Orange
  ];
  return colors[index % colors.length];
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
