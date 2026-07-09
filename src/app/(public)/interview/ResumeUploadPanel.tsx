/**
 * ResumeUploadPanel Component
 *
 * Premium SaaS-style resume upload panel for the Interview Workspace.
 * Accepts ONLY PDF files with comprehensive validation.
 * Shows progress stages, limit messaging, quality scores, and classification feedback.
 *
 * @module app/(public)/interview/ResumeUploadPanel
 */

"use client";

import React, { useState, useRef, useCallback } from "react";
import { Card, Badge } from "@/components/ui";
import { useResumeUpload, type UploadStage } from "@/hooks/useResumeUpload";

interface ResumeUploadPanelProps {
  onResumeUploaded?: (_resumeId: string, _contentHash: string) => void;
  onShowPremiumModal?: () => void;
  onShowResumeManager?: () => void;
}

const PROGRESS_STAGES: UploadStage[] = [
  "validating",
  "parsing",
  "security_scan",
  "classification",
  "quality_analysis",
  "saving",
];

function QualityBadge({ score }: { score: number }) {
  if (score >= 80) return <Badge variant="success">{score}/100</Badge>;
  if (score >= 50) return <Badge variant="warning">{score}/100</Badge>;
  return <Badge variant="difficulty-hard">{score}/100</Badge>;
}

export function ResumeUploadPanel({
  onResumeUploaded,
  onShowPremiumModal,
  onShowResumeManager,
}: ResumeUploadPanelProps) {
  const {
    resumes,
    latestResume,
    resumeAnalysis,
    isUploading,
    uploadStage,
    uploadStageLabel,
    uploadError,
    uploadErrorType,
    uploadSuccess,
    maxResumes,
    isPremium,
    canUpload,
    uploadResume,
    setActiveResume: _setActiveResume,
    deleteResume: _deleteResume,
    clearMessages,
  } = useResumeUpload();

  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);

    if (!canUpload) {
      if (!isPremium) {
        onShowPremiumModal?.();
      } else {
        onShowResumeManager?.();
      }
      return;
    }

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const result = await uploadResume(files[0]);
      if (result.success && result.resumeId && result.contentHash) {
        onResumeUploaded?.(result.resumeId, result.contentHash);
      }
    }
  }, [canUpload, isPremium, uploadResume, onResumeUploaded, onShowPremiumModal, onShowResumeManager]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    clearMessages();
    const files = e.target.files;
    if (files && files.length > 0) {
      const result = await uploadResume(files[0]);
      if (result.success && result.resumeId && result.contentHash) {
        onResumeUploaded?.(result.resumeId, result.contentHash);
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [uploadResume, onResumeUploaded, clearMessages]);

  const handleClick = useCallback(() => {
    if (!canUpload) {
      if (!isPremium) {
        onShowPremiumModal?.();
      } else {
        onShowResumeManager?.();
      }
      return;
    }
    clearMessages();
    fileInputRef.current?.click();
  }, [canUpload, isPremium, clearMessages, onShowPremiumModal, onShowResumeManager]);

  const progressIndex = PROGRESS_STAGES.indexOf(uploadStage);
  const progressPercent = isUploading
    ? Math.round(((progressIndex + 1) / PROGRESS_STAGES.length) * 100)
    : uploadStage === "complete" ? 100 : 0;

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">📄</span>
            <h3
              className="text-lg font-bold text-[var(--color-fg)]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Resume Upload
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {latestResume && <Badge variant="success">Active</Badge>}
            <span className="text-xs text-[var(--color-fg-muted)]">
              {resumes.length}/{maxResumes}
            </span>
          </div>
        </div>

        {/* Current Resume Status */}
        {latestResume ? (
          <div className="bg-[#faf8f5] border-2 border-[var(--color-border)] wobbly-sm p-4 space-y-3">
            <div className="flex items-center justify-between border-b-2 border-dashed border-[var(--color-border-light)] pb-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-lg shrink-0">📁</span>
                <span className="font-bold text-[var(--color-fg)] truncate font-[family-name:var(--font-body)]">
                  {latestResume.displayName || latestResume.originalFilename}
                </span>
              </div>
              <div className="flex items-center gap-2">
                  {latestResume.status === "rejected" ? (
                  <Badge variant="warning">Rejected</Badge>
                ) : (
                  <Badge variant="success">Validated</Badge>
                )}
                {onShowResumeManager && (
                  <button
                    onClick={onShowResumeManager}
                    className="text-xs text-[var(--color-accent)] underline"
                  >
                    Manage
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs font-mono text-[var(--color-fg-muted)]">
              <div>Format: PDF</div>
              <div>Pages: {latestResume.pageCount}</div>
              <div>Uploaded: {new Date(latestResume.createdAt).toLocaleDateString()}</div>
            </div>

            {/* Quality Score */}
            {latestResume.qualityScore > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <span className="font-bold text-[var(--color-fg)]">Quality:</span>
                <QualityBadge score={latestResume.qualityScore} />
                {latestResume.missingSections.length > 0 && (
                  <span className="text-xs text-[var(--color-fg-muted)]">
                    Missing: {latestResume.missingSections.join(", ")}
                  </span>
                )}
              </div>
            )}

            {/* Classification Score */}
            {latestResume.classificationScore > 0 && (
              <div className="flex items-center gap-2 text-xs text-[var(--color-fg-muted)]">
                <span>Classification confidence:</span>
                <span className="font-mono">{Math.round(latestResume.classificationScore * 100)}%</span>
              </div>
            )}

            {/* AI Analysis */}
            {resumeAnalysis && (
              <div className="bg-[var(--color-bg-alt)]/25 p-3 border border-[var(--color-border-light)] text-sm space-y-2">
                <div className="font-bold text-[var(--color-fg)] font-[family-name:var(--font-heading)] text-xs">
                  Parsed Profile:
                </div>
                <div className="text-[var(--color-fg-muted)] text-xs">
                  <span className="font-bold">Role:</span> {resumeAnalysis.detectedRole}
                </div>
                <div className="text-[var(--color-fg-muted)] text-xs">
                  <span className="font-bold">Experience:</span> {resumeAnalysis.yearsExperience} year(s)
                </div>
                {resumeAnalysis.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {resumeAnalysis.skills.slice(0, 6).map((skill, i) => (
                      <span
                        key={i}
                        className="px-1.5 py-0.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded text-[10px] font-mono"
                      >
                        {skill}
                      </span>
                    ))}
                    {resumeAnalysis.skills.length > 6 && (
                      <span className="text-[10px] text-[var(--color-fg-muted)]">
                        +{resumeAnalysis.skills.length - 6} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Suggestions */}
            {latestResume.suggestions.length > 0 && (
              <div className="bg-amber-50/50 p-3 border border-amber-200 text-xs space-y-1">
                <div className="font-bold text-amber-800">Suggestions:</div>
                {latestResume.suggestions.slice(0, 3).map((s, i) => (
                  <div key={i} className="text-amber-700">• {s}</div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-amber-50/50 border-2 border-dashed border-[var(--color-warning)] p-4 wobbly-sm text-sm text-[var(--color-fg)] text-center">
            No resume uploaded yet. Upload your resume to unlock personalized answers.
          </div>
        )}

        {/* Upload Progress Bar */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-[var(--color-fg-muted)]">
              <span>{uploadStageLabel}</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full bg-[var(--color-border-light)] rounded-full h-2">
              <div
                className="bg-[var(--color-accent)] h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex flex-wrap gap-1">
              {PROGRESS_STAGES.map((stage, i) => (
                <span
                  key={stage}
                  className={`text-[10px] px-1.5 py-0.5 rounded ${
                    i <= progressIndex
                      ? "bg-[var(--color-accent)] text-white"
                      : "bg-[var(--color-border-light)] text-[var(--color-fg-muted)]"
                  }`}
                >
                  {stage.replace("_", " ")}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
          className={[
            "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200 wobbly-sm relative",
            !canUpload
              ? "border-[var(--color-border-light)] opacity-60 cursor-not-allowed"
              : dragOver
                ? "border-[var(--color-accent)] bg-[var(--color-bg-alt)]/30 scale-[1.02]"
                : "border-[var(--color-border-light)] hover:border-[var(--color-accent)] hover:bg-[var(--color-bg-alt)]/10",
          ].join(" ")}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={handleFileSelect}
            disabled={isUploading || !canUpload}
          />

          <div className="space-y-2 pointer-events-none">
            <span className="text-3xl">{isUploading ? "⏳" : canUpload ? "📥" : "🔒"}</span>
            <p className="font-bold text-[var(--color-fg)] font-[family-name:var(--font-heading)]">
              {isUploading
                ? uploadStageLabel
                : canUpload
                  ? "Drop your PDF resume here, or click to browse"
                  : !isPremium
                    ? "Free plan limit reached (1 resume)"
                    : "Resume limit reached"}
            </p>
            <p className="text-xs text-[var(--color-fg-muted)] font-[family-name:var(--font-body)]">
              {canUpload
                ? "PDF only • Max 5MB • Up to 8 pages"
                : !isPremium
                  ? "Upgrade to Premium for up to 3 resumes"
                  : "Delete a resume to upload a new one"}
            </p>
          </div>
        </div>

        {/* Messages */}
        {uploadError && (
          <div className="text-sm text-[var(--color-accent)] font-bold font-[family-name:var(--font-body)] flex items-center gap-2">
            <span>⚠️</span>
            <span>{uploadError}</span>
            {uploadErrorType === "limit_reached" && !isPremium && (
              <button
                onClick={onShowPremiumModal}
                className="underline text-[var(--color-accent)]"
              >
                Upgrade
              </button>
            )}
            {uploadErrorType === "limit_reached" && isPremium && (
              <button
                onClick={onShowResumeManager}
                className="underline text-[var(--color-accent)]"
              >
                Manage
              </button>
            )}
          </div>
        )}
        {uploadSuccess && (
          <div className="text-sm text-[var(--color-success)] font-bold font-[family-name:var(--font-body)] flex items-center gap-2">
            <span>✓</span>
            <span>{uploadSuccess}</span>
          </div>
        )}
      </div>
    </Card>
  );
}
