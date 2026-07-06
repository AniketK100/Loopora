/**
 * CategoryQuestionsContainer Client Component
 *
 * Manages search filtering and difficulty rating tabs for a folder's questions.
 * Renders list items inside our keyboard-accessible Accordion component.
 *
 * @module app/(public)/interview/[categorySlug]/CategoryQuestionsContainer
 */

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Accordion, Input, Badge, Button } from "@/components/ui";
import { Difficulty } from "@/types";

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

  // Filter list based on search term & difficulty tab selection
  const filteredQuestions = questions.filter((q) => {
    const matchesSearch =
      q.question.toLowerCase().includes(search.toLowerCase()) ||
      (q.tags && q.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase())));
      
    const matchesDifficulty =
      filterDifficulty === "all" || q.difficulty === filterDifficulty;

    return matchesSearch && matchesDifficulty;
  });

  // Map to Accordion items format
  const accordionItems = filteredQuestions.map((q) => {
    // Choose appropriate indicator colors
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
    <div className="space-y-6">
      {/* Search and Difficulty Filter Controls Panel */}
      <div className="flex flex-col md:flex-row gap-4 items-end bg-[var(--color-bg)] border-2 border-[var(--color-border)] wobbly-sm p-4">
        {/* Live Search */}
        <div className="w-full md:flex-1">
          <Input
            label="Search this folder"
            placeholder="Type key terms, e.g. recursion, arrays..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
                onClick={() => setFilterDifficulty(d.key)}
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
          <Accordion items={accordionItems} />
        )}
      </div>
    </div>
  );
}
