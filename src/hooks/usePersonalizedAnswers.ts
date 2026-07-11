"use client";

import { useEffect, useRef } from "react";
import { usePersonalizedAnswersContext } from "@/contexts/PersonalizedAnswersContext";

interface UsePersonalizedAnswersReturn {
  personalizedAnswers: Record<string, string>;
  isGenerating: boolean;
  error: string | null;
  generateAnswers: (_folderSlug: string, _resumeId: string) => Promise<void>;
  loadAnswers: (_folderSlug: string, _resumeId: string) => Promise<boolean>;
  clearForFolder: (_folderSlug: string) => void;
  clearAll: () => void;
  activeResumeId: string | null;
  activeResumeName: string | null;
  setActiveResume: (_resumeId: string, _resumeName: string | null) => void;
}

export function usePersonalizedAnswers(folderSlug?: string): UsePersonalizedAnswersReturn {
  const ctx = usePersonalizedAnswersContext();
  const loadedRef = useRef<Record<string, boolean>>({});

  const folderAnswers = folderSlug ? ctx.answers[folderSlug] || {} : {};
  const personalizedAnswers: Record<string, string> = {};
  for (const [slug, meta] of Object.entries(folderAnswers)) {
    personalizedAnswers[slug] = meta.answer;
  }

  useEffect(() => {
    if (typeof window !== "undefined" && folderSlug && ctx.activeResumeId && !loadedRef.current[folderSlug]) {
      const hasAnswers = ctx.answers[folderSlug] && Object.keys(ctx.answers[folderSlug]).length > 0;
      if (!hasAnswers && !ctx.isGenerating[folderSlug]) {
        loadedRef.current[folderSlug] = true;
        ctx.loadForFolder(folderSlug, ctx.activeResumeId);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- ctx is stable; answers/isGenerating checked via ref
  }, [folderSlug, ctx.activeResumeId]);

  return {
    personalizedAnswers,
    isGenerating: folderSlug ? !!ctx.isGenerating[folderSlug] : false,
    error: ctx.error,
    generateAnswers: ctx.generateForFolder,
    loadAnswers: ctx.loadForFolder,
    clearForFolder: ctx.clearForFolder,
    clearAll: ctx.clearAll,
    activeResumeId: ctx.activeResumeId,
    activeResumeName: ctx.activeResumeName,
    setActiveResume: ctx.setActiveResume,
  };
}
