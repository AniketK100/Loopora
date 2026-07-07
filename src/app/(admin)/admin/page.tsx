/**
 * Admin Dashboard Overview Page
 *
 * Server component aggregating quick metrics (categories, questions, pending suggestions)
 * to provide a high-level administrative status summary.
 * Every stat card links to its corresponding management page.
 * Every admin sub-page is reachable via quick actions.
 *
 * @route /admin
 * @see 03_App_Flow.md §5 — Admin Content Flow
 */

import { Metadata } from "next";
import Link from "next/link";
import { connectDB } from "@/lib/db/connection";
import { Category } from "@/lib/db/models/Category";
import { Question } from "@/lib/db/models/Question";
import { Suggestion } from "@/lib/db/models/Suggestion";
import { FeatureFlag } from "@/lib/db/models/FeatureFlag";
import { AuditLog } from "@/lib/db/models/AuditLog";
import { Card } from "@/components/ui";

export const metadata: Metadata = {
  title: "Admin Dashboard Overview | Loopora",
};

export default async function AdminDashboardPage() {
  await connectDB();

  const [
    categoryCount,
    questionCount,
    pendingSuggestions,
    totalSuggestions,
    activeFlags,
    recentAuditCount,
  ] = await Promise.all([
    Category.countDocuments(),
    Question.countDocuments(),
    Suggestion.countDocuments({ status: "new" }),
    Suggestion.countDocuments(),
    FeatureFlag.countDocuments({ enabled: true }),
    AuditLog.countDocuments(),
  ]);

  return (
    <div className="space-y-10">
      {/* Title Header */}
      <div>
        <h2
          className="text-3xl font-bold text-[var(--color-fg)]"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          📊 Administration Overview
        </h2>
        <p
          className="text-base text-[var(--color-fg-muted)] mt-1"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Manage content, review user submissions, and toggle feature flags.
        </p>
      </div>

      {/* Stats Dashboard Grid — each card links to its management page */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Categories"
          value={categoryCount}
          subtitle="Seeded interview folders"
          footerStrip="var(--color-secondary)"
          href="/admin/categories"
        />
        <StatCard
          title="Questions"
          value={questionCount}
          subtitle="Model Q&A pairs"
          footerStrip="var(--color-accent)"
          href="/admin/questions"
        />
        <StatCard
          title="Pending Feedback"
          value={pendingSuggestions}
          subtitle={`${totalSuggestions - pendingSuggestions} reviewed suggestions`}
          footerStrip="var(--color-post-it-dark)"
          href="/admin/suggestions"
        />
        <StatCard
          title="Active Flags"
          value={activeFlags}
          subtitle="Runtime configurations"
          footerStrip="var(--color-success)"
          href="/admin/flags"
        />
      </div>

      {/* Quick Access Actions — covers all admin sub-pages */}
      <section className="space-y-4">
        <h3
          className="text-xl font-bold"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          ✏️ Quick Operations
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <QuickActionCard
            title="Create Category"
            description="Add a new interview topic and set custom visual strip colors."
            href="/admin/categories/new"
          />
          <QuickActionCard
            title="Write Question"
            description="Add a new model answer, associate video embeds, and specify tags."
            href="/admin/questions/new"
          />
          <QuickActionCard
            title="Configure Toggles"
            description="Manage maintenance modes, beta features, or granular target scopes."
            href="/admin/flags"
          />
          <QuickActionCard
            title="User Accounts"
            description="Manage roles (editors, admins), promote candidates, and run support impersonations."
            href="/admin/users"
          />
          <QuickActionCard
            title="Active Sessions"
            description="Audit logged-in devices, monitor origin IPs, and revoke active keys."
            href="/admin/sessions"
          />
          <QuickActionCard
            title="Security Center"
            description="Review active IP blocks, diagnostic status, and critical security audits."
            href="/admin/security"
          />
          <QuickActionCard
            title="System Health"
            description="Inspect database ping metrics, environment configurations, and exception feeds."
            href="/admin/system"
          />
          <QuickActionCard
            title="Review Suggestions"
            description={`${pendingSuggestions} pending community suggestions awaiting review.`}
            href="/admin/suggestions"
          />
          <QuickActionCard
            title="Audit Logs"
            description={`${recentAuditCount} total audit events recorded across all entities.`}
            href="/admin/audit-logs"
          />
          <QuickActionCard
            title="Content Backup"
            description="Download complete database content tables (categories, questions) in JSON."
            href="/admin/content-export"
          />
          <QuickActionCard
            title="Bulk Import"
            description="Import categories and questions from CSV or JSON files."
            href="/admin/bulk-import"
          />
        </div>
      </section>
    </div>
  );
}

/**
 * Clickable Metric Card Component — links to the corresponding management page.
 */
function StatCard({
  title,
  value,
  subtitle,
  footerStrip,
  href,
}: {
  title: string;
  value: number;
  subtitle: string;
  footerStrip: string;
  href: string;
}) {
  return (
    <Card footerStripColor={footerStrip} hoverEffect>
      <Link href={href} className="block p-6">
        <p
          className="text-sm font-bold uppercase tracking-wider text-[var(--color-fg-muted)]"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {title}
        </p>
        <p
          className="text-4xl font-bold text-[var(--color-fg)] mt-2"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {value}
        </p>
        <p
          className="text-sm text-[var(--color-fg-muted)] mt-2"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {subtitle}
        </p>
      </Link>
    </Card>
  );
}

/**
 * Quick Access Action Card Component
 */
function QuickActionCard({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Card hoverEffect>
      <Link href={href} className="block p-6 h-full">
        <h4
          className="text-lg font-bold text-[var(--color-fg)]"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {title} &rarr;
        </h4>
        <p
          className="text-sm text-[var(--color-fg-muted)] mt-2"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {description}
        </p>
      </Link>
    </Card>
  );
}
