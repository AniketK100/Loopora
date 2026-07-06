/**
 * Admin Bulk Import Page — Server Component
 *
 * Renders the bulk data loader panel.
 *
 * @route /admin/bulk-import
 * @see 06_Implementation_Plan_Build_Order.md Phase 4 — Admin Dashboard (CMS)
 */

import { Metadata } from "next";
import { BulkImportForm } from "./BulkImportForm";

export const metadata: Metadata = {
  title: "Bulk Import Library — Admin",
};

export default function AdminBulkImportPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2
          className="text-3xl font-bold text-[var(--color-fg)]"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          📥 Bulk Import Q&A Library
        </h2>
        <p
          className="text-base text-[var(--color-fg-muted)] mt-1"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Seeding files directly into your database. Import new interview folders and questions in one action.
        </p>
      </div>

      <BulkImportForm />
    </div>
  );
}
