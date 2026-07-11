"use client";

import React, { useState } from "react";
import { Accordion, Input, Badge } from "@/components/ui";
import { Difficulty } from "@/types";
import { trackEvent } from "@/lib/analytics";
import { VideoPlayerPanel } from "./VideoPlayerPanel";
import { AccordionAnswerContent } from "./AccordionAnswerContent";
import { usePersonalizedAnswers } from "@/hooks/usePersonalizedAnswers";

interface VideoData {
  label: string;
  url: string;
  provider: string;
  order: number;
}

interface PersonalizedAnswer {
  answer: string;
  updatedAt: string;
}

interface QuestionData {
  _id: string;
  slug: string;
  question: string;
  answer: {
    short?: string;
    detailed: string;
    example?: string;
  };
  difficulty: Difficulty;
  isPremium: boolean;
  tags: string[];
  videos: VideoData[];
  resources?: { title: string; url: string }[];
  personalizedAnswer?: PersonalizedAnswer | null;
}

interface CategoryData {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
}

interface CategoryQuestionsContainerProps {
  category: CategoryData;
  questions: QuestionData[];
  userHasPremium: boolean;
}

export function CategoryQuestionsContainer({
  category,
  questions,
  userHasPremium,
}: CategoryQuestionsContainerProps) {
  const [search, setSearch] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all");
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [activeVideoTab, setActiveVideoTab] = useState<"video" | "explanation" | "notes">("video");

  const {
    personalizedAnswers,
    isGenerating,
    activeResumeName,
    activeResumeId,
  } = usePersonalizedAnswers(category.slug);

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch =
      q.question.toLowerCase().includes(search.toLowerCase()) ||
      (q.tags && q.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase())));

    const matchesDifficulty =
      filterDifficulty === "all" || q.difficulty === filterDifficulty;

    return matchesSearch && matchesDifficulty;
  });

  const activeQuestion = questions.find((q) => q._id === activeQuestionId);
  const activeVideos = activeQuestion?.videos.map((v) => ({
    url: v.url,
    title: v.label,
    provider: v.provider,
  })) || [];

  const accordionItems = filteredQuestions.map((q) => {
    const difficultyBadgeVariant = `difficulty-${q.difficulty}` as
      | "difficulty-easy"
      | "difficulty-medium"
      | "difficulty-hard";

    const questionPersonalizedAnswer =
      personalizedAnswers[q.slug] || q.personalizedAnswer;

    return {
      id: q._id,
      trigger: (
        <div className="flex items-center justify-between w-full pr-4 text-left gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-bold font-[family-name:var(--font-heading)] text-lg text-[var(--color-fg)] truncate">
              {q.question}
            </span>
            {questionPersonalizedAnswer && (
              <span
                className="inline-block px-1.5 py-0.5 text-[10px] font-bold bg-green-100 text-green-800 border border-green-300 wobbly-sm shrink-0"
                aria-label="Has personalized answer"
              >
                🎯 Personalized
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {q.isPremium && (
              <span
                className="inline-block px-1.5 py-0.5 text-xs bg-amber-50 text-[var(--color-warning)] border border-[var(--color-warning)] wobbly-sm font-bold"
                aria-label="Premium content lock"
              >
                🔒 Premium
              </span>
            )}
            <Badge variant={difficultyBadgeVariant}>{q.difficulty}</Badge>
          </div>
        </div>
      ),
      content: (
        <AccordionAnswerContent
          questionId={q._id}
          slug={q.slug}
          categorySlug={category.slug}
          answer={q.answer}
          isPremium={q.isPremium}
          userHasPremium={userHasPremium}
          tags={q.tags}
          resources={q.resources}
          personalizedAnswer={questionPersonalizedAnswer}
          resumeName={activeResumeName}
          hasResume={!!activeResumeId}
          isGenerating={isGenerating && !questionPersonalizedAnswer}
        />
      ),
    };
  });

  const difficulties = [
    { key: "all", label: "All Difficulties" },
    { key: "easy", label: "🟢 Easy" },
    { key: "medium", label: "🟡 Medium" },
    { key: "hard", label: "🔴 Hard" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 lg:grid-cols-2 gap-6 lg:gap-8 items-start relative">

      {/* LEFT PANE: VideoPlayerPanel */}
      <div className={`w-full md:col-span-2 lg:col-span-1 lg:sticky lg:top-24 space-y-4 ${!activeQuestionId ? "hidden lg:block" : ""}`}>
        {activeQuestion ? (
          <VideoPlayerPanel
            videos={activeVideos}
            questionTitle={activeQuestion.question}
            activeTab={activeVideoTab}
            onTabChange={setActiveVideoTab}
          />
        ) : (
          <div className="border-2 border-dashed border-[var(--color-border-light)] wobbly-sm p-8 bg-[var(--color-bg)] text-center flex flex-col items-center justify-center h-[340px] text-[var(--color-fg-muted)] space-y-4 shadow-sm">
            <div className="text-5xl animate-bounce">📓</div>
            <p className="font-[family-name:var(--font-heading)] font-bold text-lg text-[var(--color-fg)]">
              Walkthrough Library
            </p>
            <p className="text-sm max-w-[280px] font-[family-name:var(--font-body)] leading-relaxed">
              Expand any question in the list to reveal its signature video explanations, logic walkthroughs, and expert presenter guidelines.
            </p>
          </div>
        )}
      </div>

      {/* RIGHT PANE: Search Filters & Accordion List */}
      <div className="w-full md:col-span-3 lg:col-span-1 space-y-6">
        {/* Search and Difficulty Filter Controls Panel */}
        <div className="flex flex-col md:flex-row gap-4 items-end bg-[var(--color-bg)] border-2 border-[var(--color-border)] wobbly-sm p-4 shadow-sm">
          <div className="w-full md:flex-1">
            <Input
              label="Search this folder"
              placeholder="Type key terms, e.g. recursion, arrays..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                if (e.target.value.length >= 3) {
                  trackEvent("search_questions", {
                    categorySlug: category.slug,
                    query: e.target.value,
                  });
                }
              }}
            />
          </div>

          <div className="w-full md:w-auto flex flex-col gap-1.5">
            <label className="text-sm font-bold font-[family-name:var(--font-heading)] text-[var(--color-fg)]">
              Difficulty Filter
            </label>
            <div className="flex border-2 border-[var(--color-border)] wobbly-sm bg-[var(--color-bg-alt)]/30 p-0.5">
              {difficulties.map((d) => (
                <button
                  key={d.key}
                  type="button"
                  onClick={() => {
                    setFilterDifficulty(d.key);
                    trackEvent("filter_difficulty", {
                      categorySlug: category.slug,
                      difficulty: d.key,
                    });
                  }}
                  className={[
                    "px-3 py-1 text-xs font-bold font-[family-name:var(--font-heading)] transition-all",
                    filterDifficulty === d.key
                      ? "bg-[var(--color-accent)] text-[var(--color-bg)] wobbly-sm"
                      : "text-[var(--color-fg)] hover:bg-[var(--color-bg-alt)]",
                  ].join(" ")}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Personalization status bar */}
        {activeResumeId && !isGenerating && (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 wobbly-sm text-xs text-green-800 font-[family-name:var(--font-body)]">
            <span>🎯</span>
            <span>
              <strong>{Object.keys(personalizedAnswers).length}</strong> of <strong>{filteredQuestions.length}</strong> questions personalized
              {activeResumeName && (
                <span> based on <strong>{activeResumeName}</strong></span>
              )}
            </span>
          </div>
        )}

        {isGenerating && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[var(--color-bg-alt)] border border-[var(--color-border-light)] wobbly-sm text-xs text-[var(--color-fg-muted)] animate-pulse font-[family-name:var(--font-body)]">
            <span>⏳</span>
            <span>Generating personalized answers...</span>
          </div>
        )}

        {!activeResumeId && (
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 wobbly-sm text-xs text-amber-800 font-[family-name:var(--font-body)]">
            <span>📄</span>
            <span>Upload a resume to unlock AI personalized answers.</span>
          </div>
        )}

        {/* Accordion List Results */}
        <div className="pt-2">
          {accordionItems.length === 0 ? (
            <div className="text-center py-12 bg-[var(--color-bg)] border-2 border-dashed border-[var(--color-border-light)] wobbly-sm text-[var(--color-fg-muted)] font-[family-name:var(--font-body)]">
              No questions match your current search or difficulty filter.
            </div>
          ) : (
            <Accordion
              items={accordionItems}
              onExpandedChange={(ids) => {
                if (ids.length > 0) {
                  const expandedId = ids[ids.length - 1];
                  setActiveQuestionId(expandedId);
                  setActiveVideoTab("video");
                  const matchingQ = questions.find((q) => q._id === expandedId);
                  if (matchingQ) {
                    trackEvent("expand_question", {
                      categorySlug: category.slug,
                      questionSlug: matchingQ.slug,
                      isPremium: matchingQ.isPremium,
                    });
                  }
                } else {
                  setActiveQuestionId(null);
                }
              }}
            />
          )}
        </div>
      </div>

    </div>
  );
}
