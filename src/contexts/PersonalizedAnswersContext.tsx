"use client";

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

interface PersonalizedAnswerMeta {
  answer: string;
  updatedAt: string;
}

interface PersonalizedAnswersContextValue {
  answers: Record<string, Record<string, PersonalizedAnswerMeta>>;
  isGenerating: Record<string, boolean>;
  activeResumeId: string | null;
  activeResumeName: string | null;
  error: string | null;
  generateForFolder: (_folderSlug: string, _resumeId: string) => Promise<void>;
  loadForFolder: (_folderSlug: string, _resumeId: string) => Promise<boolean>;
  clearForFolder: (_folderSlug: string) => void;
  clearAll: () => void;
  setActiveResume: (_resumeId: string, _resumeName: string | null) => void;
  setError: (_err: string | null) => void;
}

const PersonalizedAnswersContext = createContext<PersonalizedAnswersContextValue | null>(null);

export function usePersonalizedAnswersContext(): PersonalizedAnswersContextValue {
  const ctx = useContext(PersonalizedAnswersContext);
  if (!ctx) {
    throw new Error("usePersonalizedAnswersContext must be used within PersonalizedAnswersProvider");
  }
  return ctx;
}

interface PersonalizedAnswersProviderProps {
  children: React.ReactNode;
}

export function PersonalizedAnswersProvider({ children }: PersonalizedAnswersProviderProps) {
  const [answers, setAnswers] = useState<Record<string, Record<string, PersonalizedAnswerMeta>>>({});
  const [isGenerating, setIsGenerating] = useState<Record<string, boolean>>({});
  const [activeResumeId, setActiveResumeId] = useState<string | null>(null);
  const [activeResumeName, setActiveResumeName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activeResumeIdRef = useRef(activeResumeId);
  const answersRef = useRef(answers);
  useEffect(() => {
    activeResumeIdRef.current = activeResumeId;
  }, [activeResumeId]);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  const generateForFolder = useCallback(async (folderSlug: string, resumeId: string) => {
    setIsGenerating((prev) => ({ ...prev, [folderSlug]: true }));
    setError(null);

    try {
      const res = await fetch(`/api/interview/${folderSlug}/personalized?resumeId=${resumeId}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        const errorMsg = json.error || "Failed to generate personalized answers.";
        setError(errorMsg);
        return;
      }

      const folderAnswers: Record<string, PersonalizedAnswerMeta> = {};
      for (const q of json.questions) {
        if (q.personalizedAnswer) {
          folderAnswers[q.slug] = {
            answer: q.personalizedAnswer,
            updatedAt: q.updatedAt || new Date().toISOString(),
          };
        }
      }

      setAnswers((prev) => ({
        ...prev,
        [folderSlug]: {
          ...(prev[folderSlug] || {}),
          ...folderAnswers,
        },
      }));

      trackEvent("generate_personalized_answers", {
        folderSlug,
        questionCount: json.questions.length,
      });
    } catch (err) {
      console.error("[PersonalizedAnswersContext] Generate error:", err);
      setError("Network error. Please try again.");
    } finally {
      setIsGenerating((prev) => ({ ...prev, [folderSlug]: false }));
    }
  }, []);

  const loadForFolder = useCallback(async (folderSlug: string, resumeId: string): Promise<boolean> => {
    if (answersRef.current[folderSlug] && Object.keys(answersRef.current[folderSlug]).length > 0) {
      return true;
    }

    setIsGenerating((prev) => ({ ...prev, [folderSlug]: true }));

    try {
      const res = await fetch(`/api/interview/${folderSlug}/personalized?resumeId=${resumeId}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        return false;
      }

      const folderAnswers: Record<string, PersonalizedAnswerMeta> = {};
      for (const q of json.questions) {
        if (q.personalizedAnswer) {
          folderAnswers[q.slug] = {
            answer: q.personalizedAnswer,
            updatedAt: q.updatedAt || new Date().toISOString(),
          };
        }
      }

      setAnswers((prev) => ({
        ...prev,
        [folderSlug]: {
          ...(prev[folderSlug] || {}),
          ...folderAnswers,
        },
      }));

      return true;
    } catch (err) {
      console.error("[PersonalizedAnswersContext] Load error:", err);
      return false;
    } finally {
      setIsGenerating((prev) => ({ ...prev, [folderSlug]: false }));
    }
  }, []);

  const clearForFolder = useCallback((folderSlug: string) => {
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[folderSlug];
      return next;
    });
    setIsGenerating((prev) => ({
      ...prev,
      [folderSlug]: false,
    }));
  }, []);

  const clearAll = useCallback(() => {
    setAnswers({});
    setIsGenerating({});
  }, []);

  const setActiveResume = useCallback((resumeId: string, resumeName: string | null) => {
    if (resumeId !== activeResumeIdRef.current) {
      setAnswers({});
      setIsGenerating({});
      setActiveResumeId(resumeId);
      setActiveResumeName(resumeName);
    }
  }, []);

  return (
    <PersonalizedAnswersContext.Provider
      value={{
        answers,
        isGenerating,
        activeResumeId,
        activeResumeName,
        error,
        generateForFolder,
        loadForFolder,
        clearForFolder,
        clearAll,
        setActiveResume,
        setError,
      }}
    >
      {children}
    </PersonalizedAnswersContext.Provider>
  );
}
