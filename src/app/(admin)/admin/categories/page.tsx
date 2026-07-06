/**
 * Admin Categories Dashboard Page
 *
 * Server component fetching and listing all existing interview categories,
 * showing published status, item counts, and routing control.
 *
 * @route /admin/categories
 * @see 03_App_Flow.md §5 — Admin Content Flow
 */

import { Metadata } from "next";
import Link from "next/link";
import { connectDB } from "@/lib/db/connection";
import { Category } from "@/lib/db/models/Category";
import { Card, Button, Badge } from "@/components/ui";
import { DeleteCategoryButton } from "./DeleteCategoryButton";

export const metadata: Metadata = {
  title: "Manage Categories — Admin",
};

export default async function AdminCategoriesPage() {
  await connectDB();

  // Fetch all categories sorted by order
  const categories = await Category.find().sort({ order: 1 });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2
            className="text-3xl font-bold text-[var(--color-fg)]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            📁 Interview Folders / Categories
          </h2>
          <p
            className="text-base text-[var(--color-fg-muted)] mt-1"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Partition questions and specify accent colors for index view cards.
          </p>
        </div>
        <div>
          <Link href="/admin/categories/new">
            <Button variant="primary" className="font-[family-name:var(--font-heading)] font-bold">
              + New Category
            </Button>
          </Link>
        </div>
      </div>

      {/* Main List Container */}
      <Card decoration="none">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left font-[family-name:var(--font-body)]">
            <thead>
              <tr className="border-b-2 border-[var(--color-border)] bg-[var(--color-bg-alt)] text-sm font-bold font-[family-name:var(--font-heading)]">
                <th className="p-4 w-12">Order</th>
                <th className="p-4">Name</th>
                <th className="p-4">Slug</th>
                <th className="p-4">Type</th>
                <th className="p-4 w-28 text-center">Questions</th>
                <th className="p-4 w-28 text-center">Status</th>
                <th className="p-4 w-40 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[var(--color-border-light)] text-base">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[var(--color-fg-muted)] font-[family-name:var(--font-body)]">
                    No folders created yet. Click &quot;+ New Category&quot; above to create one.
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat._id.toString()} className="hover:bg-[var(--color-bg-alt)]/50 transition-colors">
                    <td className="p-4 font-bold text-[var(--color-fg-muted)]">{cat.order}</td>
                    <td className="p-4 font-bold text-[var(--color-fg)] flex items-center gap-2">
                      <span className="text-xl" aria-hidden="true">
                        {getIconEmoji(cat.icon)}
                      </span>
                      <span>{cat.name}</span>
                    </td>
                    <td className="p-4 text-[var(--color-fg-muted)] font-mono text-sm">{cat.slug}</td>
                    <td className="p-4">
                      <span className="capitalize text-xs font-bold text-[var(--color-fg-muted)]">
                        {cat.type.replace("-", " ")}
                      </span>
                    </td>
                    <td className="p-4 text-center font-bold">
                      <Badge variant="default">{cat.questionCount || 0}</Badge>
                    </td>
                    <td className="p-4 text-center">
                      {cat.isPublished ? (
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
                      <Link href={`/admin/categories/${cat._id}`}>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </Link>
                      <DeleteCategoryButton id={cat._id.toString()} name={cat.name} />
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
