/**
 * Admin Edit Category Page
 *
 * Server component fetching the selected category by ID and
 * rendering the CategoryForm in edit/update mode.
 *
 * @route /admin/categories/[id]
 */

import { Metadata } from "next";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db/connection";
import { Category } from "@/lib/db/models/Category";
import { CategoryForm } from "../CategoryForm";

interface EditCategoryPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Edit Category — Admin",
};

export default async function AdminEditCategoryPage({ params }: EditCategoryPageProps) {
  await connectDB();
  const { id } = await params;

  const categoryDoc = await Category.findById(id);

  if (!categoryDoc) {
    notFound();
  }

  // Convert mongoose document to a plain JSON object to serialize over the boundary safely
  const initialData = {
    _id: categoryDoc._id.toString(),
    name: categoryDoc.name,
    slug: categoryDoc.slug,
    description: categoryDoc.description || "",
    icon: categoryDoc.icon || "",
    type: categoryDoc.type,
    order: categoryDoc.order,
    isPublished: categoryDoc.isPublished,
  };

  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-3xl font-bold text-[var(--color-fg)]"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          📂 Edit Interview Folder: {initialData.name}
        </h2>
        <p
          className="text-base text-[var(--color-fg-muted)] mt-1"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Update the settings, ordering, or publish status for this category.
        </p>
      </div>

      <CategoryForm initialData={initialData} />
    </div>
  );
}
