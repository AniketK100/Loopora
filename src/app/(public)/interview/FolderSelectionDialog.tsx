/**
 * FolderSelectionDialog Component
 *
 * Modal dialog for selecting exactly two interview folders after resume upload.
 * Triggers personalized answer generation for the selected folders.
 *
 * @module app/(public)/interview/FolderSelectionDialog
 */

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, Button, Badge } from "@/components/ui";
import { usePersonalizedAnswers } from "@/hooks/usePersonalizedAnswers";
import { trackEvent } from "@/lib/analytics";

interface Category {
  _id: string;
  name: string;
  slug: string;
  icon?: string;
  questionCount?: number;
}

interface FolderSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  resumeId: string;
  onFoldersSelected: (_folderIds: string[]) => void;
}

export function FolderSelectionDialog({
  isOpen,
  onClose,
  resumeId,
  onFoldersSelected,
}: FolderSelectionDialogProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedFolders, setSelectedFolders] = useState<string[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { generateAnswers } = usePersonalizedAnswers();

  // Fetch categories when dialog opens
  useEffect(() => {
    if (isOpen) {
      async function fetchCategories() {
        setIsLoadingCategories(true);
        try {
          const res = await fetch("/api/categories");
          const json = await res.json();
          if (json.success && json.data) {
            setCategories(json.data);
          }
        } catch (err) {
          console.error("[FolderSelectionDialog] Failed to fetch categories:", err);
          setError("Failed to load interview folders.");
        } finally {
          setIsLoadingCategories(false);
        }
      }
      fetchCategories();
    }
  }, [isOpen]);

  const handleToggleFolder = useCallback((categoryId: string) => {
    setError(null);
    setSuccess(null);
    setSelectedFolders((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId);
      } else {
        if (prev.length >= 2) {
          setError("You can select exactly 2 folders for personalization.");
          return prev;
        }
        return [...prev, categoryId];
      }
    });
  }, []);

  const handleSave = useCallback(async () => {
    if (selectedFolders.length !== 2) {
      setError("Please select exactly 2 folders.");
      return;
    }

    setIsSaving(true);
    setIsGenerating(true);
    setError(null);

    try {
      // Save folder selection to user profile
      const res = await fetch("/api/profile/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderIds: selectedFolders }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error || "Failed to save folder selection.");
        return;
      }

      trackEvent("save_personalization_folders", { count: selectedFolders.length });

      // Generate personalized answers for each selected folder
      // First, get the category slugs
      const selectedCategories = categories.filter((c) =>
        selectedFolders.includes(c._id)
      );

      for (const category of selectedCategories) {
        await generateAnswers(category.slug, resumeId);
      }

      setSuccess("Personalized answers generated successfully!");
      onFoldersSelected(selectedFolders);

      // Close dialog after brief delay
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error("[FolderSelectionDialog] Save error:", err);
      setError("Network error. Please try again.");
    } finally {
      setIsSaving(false);
      setIsGenerating(false);
    }
  }, [selectedFolders, categories, resumeId, generateAnswers, onFoldersSelected, onClose]);

  const handleClose = useCallback(() => {
    if (!isSaving && !isGenerating) {
      onClose();
    }
  }, [isSaving, isGenerating, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <Card className="max-w-lg w-full p-6 md:p-8 space-y-6 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="space-y-2">
          <h2
            className="text-2xl font-bold text-[var(--color-fg)]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            📁 Select Interview Folders
          </h2>
          <p className="text-sm text-[var(--color-fg-muted)] font-[family-name:var(--font-body)]">
            Choose exactly <span className="font-bold text-[var(--color-accent)]">2 folders</span> to generate personalized answers for your resume.
          </p>
        </div>

        {/* Selection Counter */}
        <div className="flex items-center justify-between bg-[var(--color-bg-alt)]/30 p-3 wobbly-sm border border-[var(--color-border-light)]">
          <span className="text-sm font-bold font-[family-name:var(--font-heading)]">
            Folders Selected
          </span>
          <Badge variant={selectedFolders.length === 2 ? "success" : "default"}>
            {selectedFolders.length} / 2
          </Badge>
        </div>

        {/* Categories List */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {isLoadingCategories ? (
            <div className="text-center py-8 text-[var(--color-fg-muted)] font-[family-name:var(--font-body)]">
              Loading folders...
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8 text-[var(--color-fg-muted)] font-[family-name:var(--font-body)]">
              No folders available.
            </div>
          ) : (
            categories.map((cat) => {
              const isSelected = selectedFolders.includes(cat._id);
              const isDisabled = !isSelected && selectedFolders.length >= 2;

              return (
                <label
                  key={cat._id}
                  className={[
                    "flex items-center gap-3 p-3 border-2 wobbly-sm cursor-pointer select-none transition-all",
                    isSelected
                      ? "bg-[var(--color-bg-alt)] border-[var(--color-accent)] shadow-sm"
                      : isDisabled
                      ? "bg-[var(--color-bg)] border-[var(--color-border-light)] opacity-50 cursor-not-allowed"
                      : "bg-[var(--color-bg)] border-[var(--color-border-light)] hover:bg-[var(--color-bg-alt)]/10 hover:border-[var(--color-border)]",
                  ].join(" ")}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    disabled={isDisabled}
                    onChange={() => handleToggleFolder(cat._id)}
                    className="accent-[var(--color-accent)] w-4 h-4 cursor-pointer"
                  />
                  <div className="flex-1">
                    <span className="font-bold text-sm text-[var(--color-fg)] font-[family-name:var(--font-heading)]">
                      {cat.name}
                    </span>
                    {cat.questionCount !== undefined && (
                      <span className="text-xs text-[var(--color-fg-muted)] ml-2">
                        ({cat.questionCount} questions)
                      </span>
                    )}
                  </div>
                  {isSelected && (
                    <span className="text-[var(--color-accent)] text-sm">✓</span>
                  )}
                </label>
              );
            })
          )}
        </div>

        {/* Messages */}
        {error && (
          <div className="text-sm text-[var(--color-accent)] font-bold font-[family-name:var(--font-body)] flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="text-sm text-[var(--color-success)] font-bold font-[family-name:var(--font-body)] flex items-center gap-2">
            <span>✓</span>
            <span>{success}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4 pt-2">
          <Button
            onClick={handleClose}
            variant="outline"
            disabled={isSaving || isGenerating}
            className="flex-1 font-[family-name:var(--font-heading)] font-bold text-sm"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="primary"
            disabled={selectedFolders.length !== 2 || isSaving || isGenerating}
            isLoading={isSaving || isGenerating}
            className="flex-1 font-[family-name:var(--font-heading)] font-bold text-sm"
          >
            {isGenerating ? "Generating..." : isSaving ? "Saving..." : "Generate Answers"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
