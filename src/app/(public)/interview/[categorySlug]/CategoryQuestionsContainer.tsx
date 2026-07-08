/**
 * CategoryQuestionsContainer Client Component
 *
 * Manages search filtering and difficulty rating tabs for a folder's questions.
 * Renders a responsive 50/50 split layout:
 * - Left Pane: Sticky Walkthrough Video Player (stacked above on mobile if active)
 * - Right Pane: Interactive Search + Accordion Questions List
 *
 * @module app/(public)/interview/[categorySlug]/CategoryQuestionsContainer
 */

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Accordion, Input, Badge, Button, Card } from "@/components/ui";
import { Difficulty } from "@/types";
import { trackEvent } from "@/lib/analytics";
import { getEmbedUrl } from "@/lib/video/getEmbedUrl";

interface VideoData {
  label: string;
  url: string;
  provider: string;
  order: number;
}

interface QuestionData {
  _id: string;
  slug: string;
  question: string;
  answer: {
    short?: string;
    detailed: string;
  };
  difficulty: Difficulty;
  isPremium: boolean;
  tags: string[];
  videos: VideoData[];
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
}

export function CategoryQuestionsContainer({
  category,
  questions,
}: CategoryQuestionsContainerProps) {
  const [search, setSearch] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all");

  // Video player split pane state
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);

  // Filter list based on search term & difficulty tab selection
  const filteredQuestions = questions.filter((q) => {
    const matchesSearch =
      q.question.toLowerCase().includes(search.toLowerCase()) ||
      (q.tags && q.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase())));
      
    const matchesDifficulty =
      filterDifficulty === "all" || q.difficulty === filterDifficulty;

    return matchesSearch && matchesDifficulty;
  });

  const activeQuestion = questions.find((q) => q._id === activeQuestionId);
  const activeVideos = activeQuestion?.videos || [];
  const activeVideo = activeVideos.length > 0 ? activeVideos[activeVideoIndex] : null;
  const embedInfo = activeVideo ? getEmbedUrl(activeVideo.url) : null;

  // Map to Accordion items format
  const accordionItems = filteredQuestions.map((q) => {
    const difficultyBadgeVariant = `difficulty-${q.difficulty}` as
      | "difficulty-easy"
      | "difficulty-medium"
      | "difficulty-hard";

    return {
      id: q._id,
      trigger: (
        <div className="flex items-center justify-between w-full pr-4 text-left gap-4">
          <span className="font-bold font-[family-name:var(--font-heading)] text-lg text-[var(--color-fg)]">
            {q.question}
          </span>
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
        <div className="space-y-4 pt-2">
          {q.answer.short ? (
            <p className="text-base text-[var(--color-fg-muted)] leading-relaxed italic bg-[var(--color-bg-alt)]/30 p-4 border border-dashed border-[var(--color-border-light)] wobbly-sm font-[family-name:var(--font-body)]">
              &ldquo;{q.answer.short}&rdquo;
            </p>
          ) : (
            <p className="text-sm italic text-gray-400 font-[family-name:var(--font-body)]">
              No preview summary available.
            </p>
          )}

          <div className="flex justify-between items-center pt-2">
            <span className="text-xs text-[var(--color-fg-muted)] font-mono font-[family-name:var(--font-body)]">
              Tags: {q.tags.length > 0 ? q.tags.join(", ") : "none"}
            </span>

            <Link href={`/interview/${category.slug}/${q.slug}`}>
              <Button
                variant="primary"
                size="sm"
                className="font-[family-name:var(--font-heading)] font-bold text-xs"
              >
                Read Full Detailed Solution &rarr;
              </Button>
            </Link>
          </div>
        </div>
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start relative">
      
      {/* LEFT PANE: Walkthrough Video Player (Sticky on Desktop, Stacked on Mobile) */}
      <div className={`w-full lg:sticky lg:top-24 space-y-4 ${!activeQuestionId ? "hidden lg:block" : ""}`}>
        {activeQuestion && activeVideo ? (
          <div className="space-y-4 bg-[var(--color-bg)] border-2 border-[var(--color-border)] wobbly-sm p-6 shadow-md">
            <h3 className="text-xl font-bold font-[family-name:var(--font-heading)] text-[var(--color-fg)] flex items-center gap-2 border-b-2 border-dashed border-[var(--color-border-light)] pb-2">
              <span>🎥</span>
              <span>Presenter Walkthrough</span>
            </h3>
            <p className="text-xs text-[var(--color-fg-muted)] font-bold font-[family-name:var(--font-body)]">
              Question: &ldquo;{activeQuestion.question}&rdquo;
            </p>

            {/* Presenter Tabs (Only if multiple walkthroughs) */}
            {activeVideos.length > 1 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {activeVideos.map((vid, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setActiveVideoIndex(idx);
                      trackEvent("switch_video_presenter", {
                        questionSlug: activeQuestion.slug,
                        presenterLabel: vid.label,
                        url: vid.url,
                      });
                    }}
                    className={[
                      "px-3 py-1.5 text-xs font-bold font-[family-name:var(--font-heading)] border-2 wobbly-sm transition-all",
                      activeVideoIndex === idx
                        ? "bg-[var(--color-accent)] text-[var(--color-bg)] border-[var(--color-accent)]"
                        : "bg-[var(--color-bg)] text-[var(--color-fg)] border-[var(--color-border)] hover:bg-[var(--color-bg-alt)]",
                    ].join(" ")}
                  >
                    🗣️ {vid.label}
                  </button>
                ))}
              </div>
            )}

            {/* Embed Video Card */}
            <Card
              decoration="none"
              className="overflow-hidden bg-black aspect-video relative flex items-center justify-center border-2 border-[var(--color-border)] wobbly-sm shadow-inner mt-4"
            >
              {embedInfo?.type === "iframe" && (
                <iframe
                  src={embedInfo.src}
                  title={activeVideo.label}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              )}

              {embedInfo?.type === "video" && (
                <video
                  src={embedInfo.src}
                  controls
                  className="absolute inset-0 w-full h-full object-contain"
                />
              )}

              {embedInfo?.type === "unsupported" && (
                <div className="p-6 text-center text-white space-y-2 font-[family-name:var(--font-body)]">
                  <p className="text-xs">Direct Walkthrough URL:</p>
                  <a
                    href={activeVideo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-4 py-2 bg-white text-black font-bold wobbly-sm hover:scale-102 transition-transform text-xs"
                  >
                    Open Tutorial &rarr;
                  </a>
                </div>
              )}
            </Card>
          </div>
        ) : activeQuestion ? (
          <div className="border-2 border-dashed border-[var(--color-border-light)] wobbly-sm p-8 bg-[var(--color-bg)] text-center flex flex-col items-center justify-center h-[340px] text-[var(--color-fg-muted)] space-y-2">
            <span className="text-4xl">📭</span>
            <p className="font-[family-name:var(--font-heading)] font-bold text-lg text-[var(--color-fg)]">
              No Walkthrough Video
            </p>
            <p className="text-sm max-w-[280px]">
              We haven&apos;t uploaded a video walkthrough for this question yet. Check back soon!
            </p>
          </div>
        ) : (
          /* Empty/Idle State on desktop */
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
      <div className="space-y-6">
        {/* Search and Difficulty Filter Controls Panel */}
        <div className="flex flex-col md:flex-row gap-4 items-end bg-[var(--color-bg)] border-2 border-[var(--color-border)] wobbly-sm p-4 shadow-sm">
          {/* Live Search */}
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

          {/* Difficulty Tabs */}
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
                  setActiveVideoIndex(0); // reset presenter selector on expand swap
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
