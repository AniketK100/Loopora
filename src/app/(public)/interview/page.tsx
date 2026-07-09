/**
 * Interview Workspace — Primary Page
 *
 * Server component that serves as the main interview workspace.
 * Displays resume upload, folder selection, and category grid.
 *
 * @route /interview
 */

import { Metadata } from "next";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db/connection";
import { Category } from "@/lib/db/models/Category";
import { User } from "@/lib/db/models/User";
import { InterviewWorkspaceWrapper } from "./InterviewWorkspaceWrapper";

export const revalidate = 3600; // Revalidate every hour (ISR)

export const metadata: Metadata = {
  title: "Interview Workspace — Loopora",
  description: "Upload your resume, select interview folders, and practice with personalized AI answers.",
  alternates: {
    canonical: "/interview",
  },
};

export default async function InterviewWorkspacePage() {
  await connectDB();

  // Get current user
  const session = await auth();
  const userId = session?.user?.id;

  // Fetch user's resume status
  let latestResumeId = null;
  let hasSelectedFolders = false;

  if (userId) {
    const user = await User.findById(userId).select("selectedFolders");
    if (user) {
      hasSelectedFolders = user.selectedFolders && user.selectedFolders.length > 0;

      // Check for resume
      const { Resume } = await import("@/lib/db/models/Resume");
      const resume = await Resume.findOne({ user: userId }).sort({ createdAt: -1 });
      if (resume) {
        latestResumeId = resume._id.toString();
      }
    }
  }

  // Fetch all published categories
  const categories = await Category.find({ isPublished: true })
    .sort({ order: 1 })
    .select("name slug description icon type questionCount");

  const serializedCategories = categories.map((cat) => ({
    _id: cat._id.toString(),
    name: cat.name,
    slug: cat.slug,
    description: cat.description || "",
    icon: cat.icon || "",
    type: cat.type,
    questionCount: cat.questionCount || 0,
  }));

  return (
    <div className="paper-grain min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Page Header */}
        <div className="space-y-2">
          <h1
            className="text-3xl md:text-4xl font-bold text-[var(--color-fg)]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            📚 Interview Workspace
          </h1>
          <p className="text-base text-[var(--color-fg-muted)] font-[family-name:var(--font-body)]">
            Upload your resume, select folders, and practice with personalized AI-powered answers.
          </p>
        </div>

        {/* Interactive Workspace */}
        <InterviewWorkspaceWrapper
          categories={serializedCategories}
          latestResumeId={latestResumeId}
          hasResume={hasSelectedFolders}
        />
      </div>
    </div>
  );
}
