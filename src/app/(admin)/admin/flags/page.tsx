/**
 * Admin Feature Flags Page — Server Component
 *
 * Fetches feature flag documents and seeds initial presets if none are present.
 * Fetches lists of categories and questions to support granular target scopes in the FlagsManager.
 *
 * @route /admin/flags
 */

import { Metadata } from "next";
import { connectDB } from "@/lib/db/connection";
import { FeatureFlag } from "@/lib/db/models/FeatureFlag";
import { Category } from "@/lib/db/models/Category";
import { Question } from "@/lib/db/models/Question";
import { FlagsManager } from "./FlagsManager";

export const metadata: Metadata = {
  title: "Feature Flags Configuration — Admin",
};

export default async function AdminFeatureFlagsPage() {
  await connectDB();

  // 1. Fetch all flags
  let flags = await FeatureFlag.find().sort({ key: 1 });

  // 2. Auto-seed default flags if empty
  if (flags.length === 0) {
    const defaultFlags = [
      {
        key: "maintenance-mode",
        enabled: false,
        scope: "global" as const,
        note: "System-wide maintenance mode: restricts general access and displays maintenance banner.",
      },
      {
        key: "beta-star-worked-examples",
        enabled: true,
        scope: "global" as const,
        note: "Beta release of STAR format worked examples on question detailed views.",
      },
      {
        key: "google-oauth-login",
        enabled: false,
        scope: "global" as const,
        note: "Enables Google OAuth fallback authentication option on sign in/up forms.",
      },
    ];

    await FeatureFlag.create(defaultFlags);
    flags = await FeatureFlag.find().sort({ key: 1 });
  }

  // 3. Fetch categories and questions for target selection
  const [categoriesRaw, questionsRaw] = await Promise.all([
    Category.find().select("name").sort({ name: 1 }),
    Question.find().select("question").sort({ question: 1 }),
  ]);

  const categories = categoriesRaw.map((c) => ({
    id: c._id.toString(),
    name: c.name,
  }));

  const questions = questionsRaw.map((q) => ({
    id: q._id.toString(),
    name: q.question,
  }));

  // Map mongoose flags documents to plain objects for FlagsManager
  const serializedFlags = flags.map((f) => ({
    _id: f._id.toString(),
    key: f.key,
    enabled: f.enabled,
    scope: f.scope,
    targetId: f.targetId ? f.targetId.toString() : null,
    note: f.note || "",
  }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2
          className="text-3xl font-bold text-[var(--color-fg)]"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          🚩 Feature Flags & Granular Scopes
        </h2>
        <p
          className="text-base text-[var(--color-fg-muted)] mt-1"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Configure system behaviors, target releases to specific folders or questions, or toggle maintenance mode.
        </p>
      </div>

      {/* Render the core Flags manager dashboard component */}
      <FlagsManager
        initialFlags={serializedFlags}
        categories={categories}
        questions={questions}
      />
    </div>
  );
}
