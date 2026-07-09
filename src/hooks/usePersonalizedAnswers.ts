/**
 * usePersonalizedAnswers Hook
 *
 * Fetches and caches personalized answers for a specific folder/category.
 * Handles loading states, error handling, and cache management.
 *
 * @module hooks/usePersonalizedAnswers
 */

"use client";

import { useState, useCallback } from "react";
import { trackEvent } from "@/lib/analytics";

interface PersonalizedQuestion {
  questionId: string;
  slug: string;
  question: string;
  sampleAnswer: string;
  personalizedAnswer: string;
}

interface PersonalizedAnswersResponse {
  success: boolean;
  category: string;
  isPremium: boolean;
  questions: PersonalizedQuestion[];
  error?: string;
}

interface UsePersonalizedAnswersReturn {
  personalizedAnswers: Record<string, string>;
  isLoading: boolean;
  error: string | null;
  generateAnswers: (_folderSlug: string, _resumeId: string) => Promise<void>;
  clearError: () => void;
}

export function usePersonalizedAnswers(): UsePersonalizedAnswersReturn {
  const [personalizedAnswers, setPersonalizedAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateAnswers = useCallback(async (folderSlug: string, resumeId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/interview/${folderSlug}/personalized?resumeId=${resumeId}`
      );

      const json: PersonalizedAnswersResponse = await res.json();

      if (!res.ok || !json.success) {
        const errorMsg = json.error || "Failed to generate personalized answers.";
        setError(errorMsg);
        return;
      }

      // Build a map of questionId -> personalizedAnswer
      const answersMap: Record<string, string> = {};
      for (const q of json.questions) {
        if (q.personalizedAnswer) {
          answersMap[q.questionId] = q.personalizedAnswer;
        }
      }

      setPersonalizedAnswers((prev) => ({
        ...prev,
        ...answersMap,
      }));

      trackEvent("generate_personalized_answers", {
        folderSlug,
        questionCount: json.questions.length,
      });
    } catch (err) {
      console.error("[usePersonalizedAnswers] Error:", err);
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    personalizedAnswers,
    isLoading,
    error,
    generateAnswers,
    clearError,
  };
}
