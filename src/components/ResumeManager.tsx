/**
 * ResumeManager Component
 *
 * Full resume management UI for premium users with multiple resumes.
 * Shows all resumes with quality scores, classification status,
 * and allows rename/delete/set active actions.
 *
 * @module components/ResumeManager
 */

"use client";

import React, { useState, useRef, useCallback } from "react";
import { Card, Badge, Button } from "@/components/ui";
import type { UploadStage } from "@/hooks/useResumeUpload";

interface ResumeItem {
  _id: string;
  displayName: string;
  originalFilename: string;
  pageCount: number;
  status: "pending" | "clean" | "rejected";
  isActive: boolean;
  classificationScore: number;
  isClassifiedAsResume: boolean;
  qualityScore: number;
  missingSections: string[];
  suggestions: string[];
  createdAt: string;
}

interface ResumeManagerProps {
  resumes: ResumeItem[];
  maxResumes: number;
  isPremium: boolean;
  isUploading: boolean;
  uploadStage: UploadStage;
  onSetActive: (_resumeId: string) => Promise<boolean>;
  onDelete: (_resumeId: string) => Promise<boolean>;
  onRename: (_resumeId: string, _displayName: string) => Promise<boolean>;
  onUploadNew: () => void;
}

function QualityIndicator({ score }: { score: number }) {
  if (score >= 80) return <Badge variant="success">Score: {score}/100</Badge>;
  if (score >= 50) return <Badge variant="warning">Score: {score}/100</Badge>;
  return <Badge variant="difficulty-hard">Score: {score}/100</Badge>;
}

export function ResumeManager({
  resumes,
  maxResumes,
  isPremium: _isPremium,
  isUploading,
  uploadStage,
  onSetActive,
  onDelete,
  onRename,
  onUploadNew,
}: ResumeManagerProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activatingId, setActivatingId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const renameInputRef = useRef<HTMLInputElement>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await onDelete(id);
    setDeletingId(null);
  };

  const handleSetActive = async (id: string) => {
    setActivatingId(id);
    await onSetActive(id);
    setActivatingId(null);
  };

  const startRename = useCallback((id: string, currentName: string) => {
    setRenamingId(id);
    setRenameValue(currentName);
    setTimeout(() => renameInputRef.current?.focus(), 50);
  }, []);

  const confirmRename = useCallback(async (id: string) => {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed.length >= 1 && trimmed.length <= 100) {
      await onRename(id, trimmed);
    }
    setRenamingId(null);
    setRenameValue("");
  }, [renameValue, onRename]);

  const cancelRename = useCallback(() => {
    setRenamingId(null);
    setRenameValue("");
  }, []);

  const canUploadMore = resumes.length < maxResumes;

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">📋</span>
            <h3
              className="text-lg font-bold text-[var(--color-fg)]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Resume Manager
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--color-fg-muted)]">
              {resumes.length}/{maxResumes} resumes
            </span>
            {canUploadMore && (
              <Button variant="primary" size="sm" onClick={onUploadNew}>
                + New
              </Button>
            )}
          </div>
        </div>

        {/* Resume List */}
        <div className="space-y-3">
          {resumes.map((resume) => (
            <div
              key={resume._id}
              className={[
                "border-2 p-4 wobbly-sm space-y-2",
                resume.isActive
                  ? "border-[var(--color-accent)] bg-[var(--color-bg-alt)]/20"
                  : "border-[var(--color-border)] bg-[#faf8f5]",
                resume.status === "rejected"
                  ? "border-[var(--color-accent)] opacity-70"
                  : "",
              ].join(" ")}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-lg shrink-0">📄</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {renamingId === resume._id ? (
                        <div className="flex items-center gap-1">
                          <input
                            ref={renameInputRef}
                            type="text"
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") confirmRename(resume._id);
                              if (e.key === "Escape") cancelRename();
                            }}
                            className="px-2 py-1 text-sm border border-[var(--color-border)] bg-[var(--color-bg)] wobbly-sm font-bold"
                            maxLength={100}
                          />
                          <Button variant="primary" size="sm" onClick={() => confirmRename(resume._id)}>
                            ✓
                          </Button>
                          <Button variant="ghost" size="sm" onClick={cancelRename}>
                            ✕
                          </Button>
                        </div>
                      ) : (
                        <span
                          className="font-bold text-[var(--color-fg)] truncate text-sm cursor-pointer hover:underline"
                          onClick={() => startRename(resume._id, resume.displayName || resume.originalFilename)}
                          title="Click to rename"
                        >
                          {resume.displayName || resume.originalFilename}
                        </span>
                      )}
                      {resume.isActive && <Badge variant="success">Active</Badge>}
                      {resume.status === "rejected" && (
                        <Badge variant="warning">Rejected</Badge>
                      )}
                    </div>
                    <div className="text-xs text-[var(--color-fg-muted)]">
                      {resume.pageCount} pages • {new Date(resume.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {resume.qualityScore > 0 && (
                    <QualityIndicator score={resume.qualityScore} />
                  )}
                  {!resume.isActive && resume.status === "clean" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetActive(resume._id)}
                      disabled={activatingId === resume._id}
                    >
                      {activatingId === resume._id ? "Setting..." : "Set Active"}
                    </Button>
                  )}
                  {resumes.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(resume._id)}
                      disabled={deletingId === resume._id}
                      className="text-[var(--color-accent)] hover:text-[var(--color-accent)]"
                    >
                      {deletingId === resume._id ? "..." : "Delete"}
                    </Button>
                  )}
                </div>
              </div>

              {/* Classification Score */}
              {resume.classificationScore > 0 && (
                <div className="text-xs text-[var(--color-fg-muted)]">
                  Classification confidence: {Math.round(resume.classificationScore * 100)}%
                </div>
              )}

              {/* Missing Sections */}
              {resume.missingSections.length > 0 && (
                <div className="text-xs text-amber-700">
                  Missing: {resume.missingSections.join(", ")}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {resumes.length === 0 && !isUploading && (
          <div className="text-center py-4 text-sm text-[var(--color-fg-muted)]">
            No resumes uploaded yet.
          </div>
        )}

        {/* Upload Progress */}
        {isUploading && (
          <div className="bg-[var(--color-bg-alt)]/25 p-3 border border-[var(--color-border-light)] text-xs text-[var(--color-fg-muted)]">
            Processing new resume: {uploadStage.replace("_", " ")}...
          </div>
        )}
      </div>
    </Card>
  );
}
