/**
 * ResumeUploadPanel Component
 *
 * Premium SaaS-style resume upload panel for the Interview Workspace.
 * Accepts ONLY PDF files with comprehensive validation.
 * Displays current resume status and upload functionality.
 *
 * @module app/(public)/interview/ResumeUploadPanel
 */

"use client";

import React, { useState, useRef, useCallback } from "react";
import { Card, Badge } from "@/components/ui";
import { useResumeUpload } from "@/hooks/useResumeUpload";

interface ResumeUploadPanelProps {
  onResumeUploaded?: (_resumeId: string, _contentHash: string) => void;
}

export function ResumeUploadPanel({ onResumeUploaded }: ResumeUploadPanelProps) {
  const {
    latestResume,
    resumeAnalysis,
    isUploading,
    uploadError,
    uploadSuccess,
    uploadResume,
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

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const result = await uploadResume(files[0]);
      if (result.success && result.resumeId && result.contentHash) {
        onResumeUploaded?.(result.resumeId, result.contentHash);
      }
    }
  }, [uploadResume, onResumeUploaded]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    clearMessages();
    const files = e.target.files;
    if (files && files.length > 0) {
      const result = await uploadResume(files[0]);
      if (result.success && result.resumeId && result.contentHash) {
        onResumeUploaded?.(result.resumeId, result.contentHash);
      }
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [uploadResume, onResumeUploaded, clearMessages]);

  const handleClick = useCallback(() => {
    clearMessages();
    fileInputRef.current?.click();
  }, [clearMessages]);

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
          {latestResume && (
            <Badge variant="success">Active</Badge>
          )}
        </div>

        {/* Current Resume Status */}
        {latestResume ? (
          <div className="bg-[#faf8f5] border-2 border-[var(--color-border)] wobbly-sm p-4 space-y-3">
            <div className="flex items-center justify-between border-b-2 border-dashed border-[var(--color-border-light)] pb-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-lg shrink-0">📁</span>
                <span className="font-bold text-[var(--color-fg)] truncate font-[family-name:var(--font-body)]">
                  {latestResume.originalFilename}
                </span>
              </div>
              <Badge variant="success">Validated</Badge>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs font-mono text-[var(--color-fg-muted)]">
              <div>Format: PDF</div>
              <div>Pages: {latestResume.pageCount}</div>
              <div>Uploaded: {new Date(latestResume.createdAt).toLocaleDateString()}</div>
            </div>

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
          </div>
        ) : (
          <div className="bg-amber-50/50 border-2 border-dashed border-[var(--color-warning)] p-4 wobbly-sm text-sm text-[var(--color-fg)] text-center">
            No resume uploaded yet. Upload your resume to unlock personalized answers.
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
            dragOver
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
            disabled={isUploading}
          />

          <div className="space-y-2 pointer-events-none">
            <span className="text-3xl">{isUploading ? "⏳" : "📥"}</span>
            <p className="font-bold text-[var(--color-fg)] font-[family-name:var(--font-heading)]">
              {isUploading
                ? "Validating and parsing PDF..."
                : "Drop your PDF resume here, or click to browse"}
            </p>
            <p className="text-xs text-[var(--color-fg-muted)] font-[family-name:var(--font-body)]">
              PDF only • Max 5MB • Up to 8 pages
            </p>
          </div>
        </div>

        {/* Messages */}
        {uploadError && (
          <div className="text-sm text-[var(--color-accent)] font-bold font-[family-name:var(--font-body)] flex items-center gap-2">
            <span>⚠️</span>
            <span>{uploadError}</span>
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
