/**
 * Admin Content Export Page Ã¢â‚¬â€ Server Component
 *
 * Renders the database backup console. Shows current entity counts and
 * provides a download trigger pointing to the streaming export endpoint.
 *
 * @route /admin/content-export
 */

import { Metadata } from "next";
import { Database, Download, AlertTriangle } from "lucide-react";
import { connectDB } from "@/lib/db/connection";
import { Category } from "@/lib/db/models/Category";
import { Question } from "@/lib/db/models/Question";
import { Suggestion } from "@/lib/db/models/Suggestion";
import { Card, Button } from "@/components/ui";

export const metadata: Metadata = {
  title: "Database Backup & Export Ã¢â‚¬â€ Admin",
};

export default async function AdminContentExportPage() {
  await connectDB();

  const [categoryCount, questionCount, suggestionCount] = await Promise.all([
    Category.countDocuments(),
    Question.countDocuments(),
    Suggestion.countDocuments(),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2
          className="text-3xl font-bold text-[var(--color-fg)]"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Ã°Å¸â€œÂ¥ Database Backup & Content Export
        </h2>
        <p
          className="text-base text-[var(--color-fg-muted)] mt-1"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Download a complete structured JSON copy of all seeded folder structures, questions, and user suggestion sheets.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Statistics Sheet */}
        <Card decoration="tape" className="p-6 space-y-4">
          <h3 className="text-xl font-bold flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
            <Database size={20} className="text-[var(--color-accent)]" /> Backup Summary Details
          </h3>
          
          <div className="space-y-2 text-sm font-[family-name:var(--font-body)]">
            <div className="flex justify-between border-b border-[var(--color-border-light)] pb-2">
              <span className="text-[var(--color-fg-muted)]">Ã°Å¸â€œÂ Folders / Categories:</span>
              <strong className="text-[var(--color-fg)]">{categoryCount} records</strong>
            </div>
            <div className="flex justify-between border-b border-[var(--color-border-light)] pb-2">
              <span className="text-[var(--color-fg-muted)]">Ã°Å¸â€œÂ Questions / Explanations:</span>
              <strong className="text-[var(--color-fg)]">{questionCount} records</strong>
            </div>
            <div className="flex justify-between border-b border-[var(--color-border-light)] pb-2">
              <span className="text-[var(--color-fg-muted)]">Ã°Å¸â€™Â¡ Suggestion logs:</span>
              <strong className="text-[var(--color-fg)]">{suggestionCount} records</strong>
            </div>
          </div>

          <div className="pt-2">
            <a href="/api/admin/export" download>
              <Button
                variant="primary"
                className="w-full inline-flex items-center justify-center gap-2 font-[family-name:var(--font-heading)] font-bold text-base py-3"
              >
                <Download size={18} /> Export Loopora Backup
              </Button>
            </a>
          </div>
        </Card>

        {/* Security / Operational Warning */}
        <Card decoration="none" className="p-6 bg-red-50/20 border-2 border-red-200/50 wobbly-sm space-y-4">
          <h3 className="text-xl font-bold flex items-center gap-2 text-red-700" style={{ fontFamily: "var(--font-heading)" }}>
            <AlertTriangle size={20} /> Operational Safety Warnings
          </h3>
          <p className="text-xs text-[var(--color-fg-muted)] leading-relaxed font-[family-name:var(--font-body)]">
            Exported backup files contain sensitive layout schemas, question contents, and draft suggestion logs. 
            Store backups in a secure location and do not expose them to public public index routes.
          </p>
          <div className="text-xs text-red-800 space-y-1 font-[family-name:var(--font-body)] font-bold bg-red-100/50 p-3 rounded border border-red-200">
            <p>&bull; This backup does not contain passwords or user profile details.</p>
            <p>&bull; MongoDB Atlas backup retention policies are continuously active on database hosts.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
