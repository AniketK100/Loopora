/**
 * Admin Create Category Page
 *
 * Renders the CategoryForm in creation mode.
 *
 * @route /admin/categories/new
 */

import { Metadata } from "next";
import { CategoryForm } from "../CategoryForm";

export const metadata: Metadata = {
  title: "Create Category — Admin",
};

export default function AdminNewCategoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-3xl font-bold text-[var(--color-fg)]"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          📂 Create New Interview Folder
        </h2>
        <p
          className="text-base text-[var(--color-fg-muted)] mt-1"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Set up a folder structure to house specific interview questions.
        </p>
      </div>

      <CategoryForm />
    </div>
  );
}
