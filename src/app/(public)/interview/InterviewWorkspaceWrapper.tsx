/**
 * InterviewWorkspaceWrapper Client Component
 *
 * Client-side wrapper for the Interview Workspace.
 * Handles resume upload, folder selection, category navigation,
 * premium upgrade modal, and resume manager.
 *
 * @module app/(public)/interview/InterviewWorkspaceWrapper
 */

"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import { Card, Badge } from "@/components/ui";
import { ResumeUploadPanel } from "./ResumeUploadPanel";
import { FolderSelectionDialog } from "./FolderSelectionDialog";
import { PremiumUpgradeModal } from "@/components/PremiumUpgradeModal";
import { ResumeManager } from "@/components/ResumeManager";
import { useResumeUpload } from "@/hooks/useResumeUpload";

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  type: string;
  questionCount: number;
}

interface InterviewWorkspaceWrapperProps {
  categories: Category[];
  latestResumeId?: string | null;
  hasResume: boolean;
}

export function InterviewWorkspaceWrapper({
  categories,
  latestResumeId,
  hasResume,
}: InterviewWorkspaceWrapperProps) {
  const [showFolderDialog, setShowFolderDialog] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showResumeManager, setShowResumeManager] = useState(false);
  const [uploadedResumeId, setUploadedResumeId] = useState<string | null>(
    latestResumeId || null
  );

  const {
    resumes,
    maxResumes,
    isPremium,
    isUploading,
    uploadStage,
    setActiveResume,
    deleteResume,
    renameResume,
    refreshResumes: _refreshResumes,
  } = useResumeUpload();

  const handleResumeUploaded = useCallback((resumeId: string) => {
    setUploadedResumeId(resumeId);
    setShowFolderDialog(true);
  }, []);

  const handleFoldersSelected = useCallback(() => {
    // Folders selected, user can now navigate to a category
  }, []);

  const getIconEmoji = (iconName?: string): string => {
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
  };

  const getStripColor = (index: number): string => {
    const colors = [
      "var(--color-accent)",
      "var(--color-secondary)",
      "var(--color-post-it-dark)",
      "var(--color-success)",
      "var(--color-warning)",
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="space-y-8">
      {/* Resume Upload Section */}
      <ResumeUploadPanel
        onResumeUploaded={handleResumeUploaded}
        onShowPremiumModal={() => setShowPremiumModal(true)}
        onShowResumeManager={() => setShowResumeManager(true)}
      />

      {/* Resume Manager (only when multiple resumes) */}
      {showResumeManager && resumes.length > 0 && (
        <ResumeManager
          resumes={resumes}
          maxResumes={maxResumes}
          isPremium={isPremium}
          isUploading={isUploading}
          uploadStage={uploadStage}
          onSetActive={setActiveResume}
          onDelete={deleteResume}
          onRename={renameResume}
          onUploadNew={() => setShowResumeManager(false)}
        />
      )}

      {/* Folder Selection Prompt */}
      {uploadedResumeId && !hasResume && (
        <Card className="p-6 text-center">
          <p className="text-sm text-[var(--color-fg-muted)] font-[family-name:var(--font-body)] mb-4">
            Resume uploaded! Select folders to generate personalized answers.
          </p>
          <button
            onClick={() => setShowFolderDialog(true)}
            className="text-sm font-bold text-[var(--color-accent)] hover:underline font-[family-name:var(--font-heading)]"
          >
            Select Interview Folders →
          </button>
        </Card>
      )}

      {/* Categories Grid */}
      <div>
        <h2
          className="text-2xl font-bold text-[var(--color-fg)] mb-6"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          📁 Interview Folders
        </h2>

        {categories.length === 0 ? (
          <div className="text-center py-12 bg-[var(--color-bg)] border-2 border-dashed border-[var(--color-border-light)] wobbly-sm text-[var(--color-fg-muted)] font-[family-name:var(--font-body)]">
            No interview categories available yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat, index) => (
              <Link
                key={cat._id}
                href={`/interview/${cat.slug}`}
                className="block group"
              >
                <Card
                  hoverEffect
                  footerStripColor={getStripColor(index)}
                  className="h-56 flex flex-col justify-between p-5 transition-all duration-[var(--transition-fast)]"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="capitalize text-xs font-bold text-[var(--color-fg-muted)] font-[family-name:var(--font-body)]">
                        🏷️ {cat.type.replace("-", " ")}
                      </span>
                      <span className="text-2xl group-hover:scale-110 transition-transform" aria-hidden="true">
                        {getIconEmoji(cat.icon)}
                      </span>
                    </div>

                    <h3
                      className="text-xl font-bold text-[var(--color-fg)] group-hover:text-[var(--color-accent)] transition-colors"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {cat.name}
                    </h3>

                    <p className="text-sm text-[var(--color-fg-muted)] line-clamp-2 mt-2 font-[family-name:var(--font-body)]">
                      {cat.description || "Browse questions and practice."}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-dashed border-[var(--color-border-light)] font-[family-name:var(--font-body)] text-xs font-bold">
                    <span className="text-[var(--color-fg-muted)]">Questions:</span>
                    <Badge variant="default">{cat.questionCount}</Badge>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Folder Selection Dialog */}
      <FolderSelectionDialog
        isOpen={showFolderDialog}
        onClose={() => setShowFolderDialog(false)}
        resumeId={uploadedResumeId || ""}
        onFoldersSelected={handleFoldersSelected}
      />

      {/* Premium Upgrade Modal */}
      <PremiumUpgradeModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
      />
    </div>
  );
}
