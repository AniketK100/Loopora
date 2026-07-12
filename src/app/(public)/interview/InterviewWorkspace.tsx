/**
 * InterviewWorkspace — Three-Column Interview Experience (flagship)
 *
 * Production-grade, desktop-first workspace for a single Interview Folder:
 *   • Left  (30%) Video Workspace  — browser-style presenter tabs (platform icons) above a
 *              flush, never-cropped player (CSS aspect-ratio) + Notes tab + Resources.
 *   • Center(40%) Answer Workspace  — tabbed (Short Summary / Detailed / Personalized) with
 *              copy/share actions and internal scroll for an optimal reading line length.
 *   • Right (30%) Question Navigator— dense, animated question list with status badges.
 *
 * Layout is structurally constant across question switches (only inner content cross-fades),
 * so there is zero layout shift. Responsive: 3-col from lg, 2-col (Video+Answer) + drawer on
 * tablet, single column with a sticky bottom nav on mobile.
 *
 * @module app/(public)/interview/InterviewWorkspace
 */

"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Card,
  Button,
  Badge,
  Input,
  FavoriteToggle,
  PracticedToggle,
} from "@/components/ui";
import { trackEvent } from "@/lib/analytics";
import posthog from "posthog-js";
import { usePersonalizedAnswers } from "@/hooks/usePersonalizedAnswers";
import type {
  WorkspaceActiveQuestion,
  WorkspaceCategory,
  WorkspaceQuestionNav,
} from "./workspace-data";

type DifficultyFilter = "all" | "easy" | "medium" | "hard";
type AnswerTab = "summary" | "detailed" | "personalized";

const DIFFICULTIES: { key: DifficultyFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "easy", label: "Easy" },
  { key: "medium", label: "Medium" },
  { key: "hard", label: "Hard" },
];

const DIFF_META: Record<string, { label: string; dot: string }> = {
  easy: { label: "Easy", dot: "🟢" },
  medium: { label: "Medium", dot: "🟡" },
  hard: { label: "Hard", dot: "🔴" },
};

const ICON_EMOJI: Record<string, string> = {
  user: "👤",
  code: "💻",
  cpu: "⚙️",
  briefcase: "💼",
  award: "🏆",
  brain: "🧠",
  bookopen: "📖",
};

const PLATFORM_ICON: Record<string, string> = {
  youtube: "▶️",
  vimeo: "🎥",
  loom: "🎬",
  drive: "📁",
  mp4: "🎞️",
  instagram: "📸",
};

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--color-bg)]";

const categoryIcon = (category: WorkspaceCategory | null): string =>
  ICON_EMOJI[(category?.icon || "").toLowerCase()] || "📁";

const platformIcon = (provider: string): string => PLATFORM_ICON[provider] || "🗣️";

function stripHtml(html: string): string {
  if (typeof document === "undefined") return html.replace(/<[^>]+>/g, "");
  const el = document.createElement("div");
  el.innerHTML = html;
  return el.textContent || "";
}

interface InterviewWorkspaceProps {
  category: WorkspaceCategory;
  questions: WorkspaceQuestionNav[];
  activeQuestion: WorkspaceActiveQuestion | null;
  userHasPremium: boolean;
}

export function InterviewWorkspace({
  category,
  questions,
  activeQuestion,
  userHasPremium,
}: InterviewWorkspaceProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reduceMotion = useReducedMotion();
  const [search, setSearch] = useState(() => searchParams.get("q") || "");
  const [difficulty, setDifficulty] = useState<DifficultyFilter>(
    () => (searchParams.get("diff") as DifficultyFilter) || "all"
  );
  const [navOpen, setNavOpen] = useState(false);

  const { personalizedAnswers, activeResumeName, activeResumeId } = usePersonalizedAnswers(category.slug);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return questions.filter((item) => {
      const matchesSearch =
        !q ||
        item.question.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q));
      const matchesDifficulty = difficulty === "all" || item.difficulty === difficulty;
      return matchesSearch && matchesDifficulty;
    });
  }, [questions, search, difficulty]);

  const difficultyDist = useMemo(() => {
    const dist = { easy: 0, medium: 0, hard: 0 };
    for (const q of questions) dist[q.difficulty]++;
    return dist;
  }, [questions]);

  const topTags = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const q of questions) for (const t of q.tags) counts[t] = (counts[t] || 0) + 1;
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([t]) => t);
  }, [questions]);

  const personalizedSlugs = useMemo(
    () => new Set(Object.keys(personalizedAnswers)),
    [personalizedAnswers]
  );

  const buildHref = useCallback(
    (slug: string) => {
      const params = new URLSearchParams();
      if (search.trim()) params.set("q", search.trim());
      if (difficulty !== "all") params.set("diff", difficulty);
      const qs = params.toString();
      return `/interview/${category.slug}/${slug}${qs ? `?${qs}` : ""}`;
    },
    [search, difficulty, category.slug]
  );

  const navigateTo = useCallback(
    (slug: string) => {
      router.push(buildHref(slug));
      setNavOpen(false);
    },
    [router, buildHref]
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const el = document.activeElement;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA")) return;
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      if (filtered.length === 0 || !activeQuestion) return;
      const curIdx = filtered.findIndex((q) => q._id === activeQuestion._id);
      if (curIdx < 0) return;
      e.preventDefault();
      const nextIdx =
        e.key === "ArrowDown"
          ? Math.min(curIdx + 1, filtered.length - 1)
          : Math.max(curIdx - 1, 0);
      const next = filtered[nextIdx];
      if (next) navigateTo(next.slug);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [filtered, activeQuestion, navigateTo]);

  const goRelative = useCallback(
    (delta: number) => {
      if (!activeQuestion) return;
      const idx = filtered.findIndex((q) => q._id === activeQuestion._id);
      const target = filtered[idx + delta];
      if (target) navigateTo(target.slug);
    },
    [activeQuestion, filtered, navigateTo]
  );

  if (!activeQuestion) {
    return (
      <div className="paper-grain min-h-[60vh] flex items-center justify-center">
        <Card decoration="tape" className="p-10 text-center max-w-md">
          <div className="text-5xl mb-4">🗂️</div>
          <h2 className="text-2xl font-bold font-[family-name:var(--font-heading)] text-[var(--color-fg)]">
            No questions yet
          </h2>
          <p className="text-sm text-[var(--color-fg-muted)] mt-2 font-[family-name:var(--font-body)]">
            This folder is being prepared. Check back soon for model answers and walkthroughs.
          </p>
          <div className="mt-6">
            <Link href="/interview">
              <Button variant="primary">Back to Library</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const isLocked = activeQuestion.isPremium && !userHasPremium;

  const filterBar = (
    <FilterBar
      search={search}
      difficulty={difficulty}
      onSearchChange={(v) => {
        setSearch(v);
        if (v.length >= 3) trackEvent("search_questions", { categorySlug: category.slug, query: v });
      }}
      onDifficultyChange={(d) => {
        setDifficulty(d);
        trackEvent("filter_difficulty", { categorySlug: category.slug, difficulty: d });
      }}
    />
  );

  const questionList = (
    <QuestionList
      questions={filtered}
      activeId={activeQuestion._id}
      personalizedSlugs={personalizedSlugs}
      onSelect={navigateTo}
    />
  );

  return (
    <div className="flex flex-col lg:h-[calc(100dvh-4rem)]">
      <WorkspaceHeader
        category={category}
        difficultyDist={difficultyDist}
        topTags={topTags}
        resumeName={activeResumeName}
        hasResume={!!activeResumeId}
        onOpenNav={() => setNavOpen(true)}
      >
        <div className="lg:flex-1 lg:justify-end">{filterBar}</div>
      </WorkspaceHeader>

      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[30fr_40fr_30fr] gap-3 p-2 sm:p-3 lg:p-4 pb-24 lg:pb-4">
        {/* LEFT — Video Workspace */}
        <section className="min-h-0 lg:overflow-y-auto" aria-label="Video workspace">
          <VideoWorkspace key={activeQuestion._id} question={activeQuestion} isLocked={isLocked} />
        </section>

        {/* CENTER — Answer Workspace */}
        <section className="min-h-0 lg:overflow-y-auto" aria-label="Answer workspace">
          <AnswerWorkspace
            key={activeQuestion._id}
            question={activeQuestion}
            isLocked={isLocked}
            userHasPremium={userHasPremium}
            categorySlug={category.slug}
            reduceMotion={!!reduceMotion}
          />
        </section>

        {/* RIGHT — Question Navigator (lg and up) */}
        <aside
          className="hidden lg:flex min-h-0 lg:overflow-hidden flex-col border-2 border-[var(--color-border-light)] bg-[var(--color-bg)]"
          aria-label="Question navigator"
        >
          {questionList}
        </aside>
      </div>

      {/* Navigator drawer (below lg) */}
      <AnimatePresence>
        {navOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setNavOpen(false)}
            />
            <motion.aside
              className="fixed top-0 right-0 z-50 h-full w-[88%] max-w-sm bg-[var(--color-bg)] shadow-2xl flex flex-col lg:hidden border-l-2 border-[var(--color-border)]"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={reduceMotion ? { duration: 0 } : { type: "tween", duration: 0.25, ease: "easeOut" }}
              role="dialog"
              aria-label="Question navigator"
            >
              <div className="flex items-center justify-between p-3 border-b-2 border-[var(--color-border)]">
                <span className="font-[family-name:var(--font-heading)] font-bold text-[var(--color-fg)]">
                  Questions ({filtered.length})
                </span>
                <button
                  type="button"
                  onClick={() => setNavOpen(false)}
                  className={`px-3 py-1 border-2 border-[var(--color-border)] font-[family-name:var(--font-heading)] font-bold text-sm ${FOCUS_RING}`}
                  aria-label="Close navigator"
                >
                  ✕
                </button>
              </div>
              <div className="p-3 border-b-2 border-[var(--color-border-light)]">{filterBar}</div>
              <div className="flex-1 min-h-0">{questionList}</div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Mobile sticky bottom navigation */}
      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 z-30 border-t-2 border-[var(--color-border)] bg-[var(--color-bg)]/95 backdrop-blur flex items-center justify-between gap-2 px-3 py-2"
        aria-label="Question navigation"
      >
        <button
          type="button"
          onClick={() => setNavOpen(true)}
          className={`px-3 py-2 border-2 border-[var(--color-border)] font-[family-name:var(--font-heading)] font-bold text-sm ${FOCUS_RING}`}
        >
          ☰ <span className="hidden sm:inline">Questions</span>
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => goRelative(-1)}
            disabled={filtered.findIndex((q) => q._id === activeQuestion._id) <= 0}
            className={`px-3 py-2 border-2 border-[var(--color-border)] font-[family-name:var(--font-heading)] font-bold text-sm disabled:opacity-40 ${FOCUS_RING}`}
            aria-label="Previous question"
          >
            <span aria-hidden="true">↑</span>
            <span className="hidden sm:inline"> Prev</span>
          </button>
          <button
            type="button"
            onClick={() => goRelative(1)}
            disabled={filtered.findIndex((q) => q._id === activeQuestion._id) >= filtered.length - 1}
            className={`px-3 py-2 border-2 border-[var(--color-border)] font-[family-name:var(--font-heading)] font-bold text-sm disabled:opacity-40 ${FOCUS_RING}`}
            aria-label="Next question"
          >
            <span className="hidden sm:inline">Next </span>
            <span aria-hidden="true">↓</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Workspace Header — one cohesive toolbar (back · title · meta · filter)      */
/* -------------------------------------------------------------------------- */

function WorkspaceHeader({
  category,
  difficultyDist,
  topTags,
  resumeName,
  hasResume,
  onOpenNav,
  children,
}: {
  category: WorkspaceCategory;
  difficultyDist: { easy: number; medium: number; hard: number };
  topTags: string[];
  resumeName?: string | null;
  hasResume: boolean;
  onOpenNav: () => void;
  children?: React.ReactNode;
}) {
  return (
    <header className="sticky top-16 z-20 shrink-0 border-b-2 border-[var(--color-border)] bg-[var(--color-bg)] px-2 sm:px-4">
      <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-4 py-2.5">
        {/* LEFT — back + title + subtitle */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Link
            href="/interview"
            className={`shrink-0 text-xs font-[family-name:var(--font-heading)] font-bold text-[var(--color-fg-muted)] hover:text-[var(--color-accent)] ${FOCUS_RING} rounded px-1`}
          >
            ← Library
          </Link>
          <span className="text-2xl shrink-0" aria-hidden="true">
            {categoryIcon(category)}
          </span>
          <div className="min-w-0">
            <div className="flex items-baseline gap-2 min-w-0">
              <h1 className="font-[family-name:var(--font-heading)] font-bold text-base sm:text-lg text-[var(--color-fg)] truncate">
                {category.name}
              </h1>
              <span className="text-xs text-[var(--color-fg-muted)] font-[family-name:var(--font-body)] shrink-0">
                {category.questionCount} Questions
              </span>
            </div>
            {topTags.length > 0 && (
              <p className="text-[11px] text-[var(--color-fg-muted)] truncate font-[family-name:var(--font-body)] hidden sm:block">
                {topTags.join(" • ")}
              </p>
            )}
          </div>
        </div>

        {/* CENTER — difficulty distribution + resume status */}
        <div className="hidden lg:flex flex-col items-center gap-1 shrink-0 px-3 border-x-2 border-[var(--color-border-light)]">
          <div className="flex items-center gap-2 text-[11px] font-[family-name:var(--font-heading)] font-bold">
            <span className="px-1.5 py-0.5 rounded-full bg-[var(--color-bg-alt)] border border-[var(--color-border-light)] text-[var(--color-fg-muted)]">
              {DIFF_META.easy.dot} {difficultyDist.easy}
            </span>
            <span className="px-1.5 py-0.5 rounded-full bg-[var(--color-bg-alt)] border border-[var(--color-border-light)] text-[var(--color-fg-muted)]">
              {DIFF_META.medium.dot} {difficultyDist.medium}
            </span>
            <span className="px-1.5 py-0.5 rounded-full bg-[var(--color-bg-alt)] border border-[var(--color-border-light)] text-[var(--color-fg-muted)]">
              {DIFF_META.hard.dot} {difficultyDist.hard}
            </span>
          </div>
          <div
            className={[
              "flex items-center gap-1 text-[11px] font-[family-name:var(--font-heading)] font-bold px-2 py-0.5 rounded-full border",
              hasResume
                ? "bg-green-50 border-[var(--color-success)] text-[var(--color-success)]"
                : "bg-[var(--color-bg-alt)] border-[var(--color-border-light)] text-[var(--color-fg-muted)]",
            ].join(" ")}
            title={hasResume ? `Resume: ${resumeName}` : "No resume uploaded"}
          >
            {hasResume ? "✅ Resume Loaded" : "📄 No Resume"}
          </div>
        </div>

        {/* RIGHT — search + filter (passed as children) */}
        <div className="flex items-center gap-2 shrink-0 lg:flex-1 lg:justify-end">{children}</div>

        <button
          type="button"
          onClick={onOpenNav}
          className={`lg:hidden shrink-0 px-3 py-1.5 border-2 border-[var(--color-border)] font-[family-name:var(--font-heading)] font-bold text-sm bg-[var(--color-bg-alt)] ${FOCUS_RING}`}
        >
          ☰
        </button>
      </div>
    </header>
  );
}

/* -------------------------------------------------------------------------- */
/* Filter Bar (search + difficulty) — toolbar (lg) and drawer                  */
/* -------------------------------------------------------------------------- */

function FilterBar({
  search,
  difficulty,
  onSearchChange,
  onDifficultyChange,
}: {
  search: string;
  difficulty: DifficultyFilter;
  onSearchChange: (v: string) => void;
  onDifficultyChange: (d: DifficultyFilter) => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-2 w-full">
      <div className="flex-1 min-w-0">
        <Input
          label="Search This Folder"
          placeholder="e.g. recursion, arrays..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search questions"
          className={FOCUS_RING}
        />
      </div>
      <div className="flex border-2 border-[var(--color-border)] bg-[var(--color-bg-alt)]/30 p-0.5 shrink-0">
        {DIFFICULTIES.map((d) => (
          <button
            key={d.key}
            type="button"
            onClick={() => onDifficultyChange(d.key)}
            aria-pressed={difficulty === d.key}
            className={[
              "px-2.5 py-1 text-xs font-bold font-[family-name:var(--font-heading)] transition-all",
              difficulty === d.key
                ? "bg-[var(--color-accent)] text-[var(--color-bg)]"
                : "text-[var(--color-fg)] hover:bg-[var(--color-bg-alt)]",
              FOCUS_RING,
            ].join(" ")}
          >
            {d.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Video Workspace (left column)                                               */
/* -------------------------------------------------------------------------- */

function VideoWorkspace({
  question,
  isLocked,
}: {
  question: WorkspaceActiveQuestion;
  isLocked: boolean;
}) {
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);
  const [showNotes, setShowNotes] = useState(false);

  const current = question.videos[selectedVideoIndex] || question.videos[0];
  const difficultyBadge = `difficulty-${question.difficulty}` as
    | "difficulty-easy"
    | "difficulty-medium"
    | "difficulty-hard";

  return (
    <div className="space-y-3">
      {/* Question context + toggles */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Badge variant={difficultyBadge}>{question.difficulty}</Badge>
            {question.isPremium && (
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-[var(--color-warning)] border border-[var(--color-warning)]">
                👑 Premium
              </span>
            )}
            <span className="text-xs text-[var(--color-fg-muted)] font-mono">#{question.frequencyRank}</span>
          </div>
          <h2 className="font-[family-name:var(--font-heading)] font-bold text-base sm:text-lg text-[var(--color-fg)] leading-snug">
            {question.question}
          </h2>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <FavoriteToggle questionId={question._id} initialIsFavorited={question.isFavorited} />
          <PracticedToggle questionId={question._id} initialIsPracticed={question.isPracticed} />
        </div>
      </div>

      {isLocked ? (
        <div className="border-2 border-[var(--color-border)] bg-[var(--color-bg-alt)]/30 flex flex-col items-center justify-center p-8 text-center space-y-3 min-h-[280px]">
          <span className="text-4xl" role="img" aria-label="Locked">🔒</span>
          <p className="font-[family-name:var(--font-heading)] font-bold text-[var(--color-fg)]">
            Video locked
          </p>
          <p className="text-sm text-[var(--color-fg-muted)] max-w-xs font-[family-name:var(--font-body)]">
            Upgrade to Premium to watch creator walkthroughs for this question.
          </p>
          <Link href="/signup">
            <Button variant="primary" className="text-sm">Upgrade &rarr;</Button>
          </Link>
        </div>
      ) : question.videos.length === 0 ? (
        <div className="border-2 border-[var(--color-border)] bg-[var(--color-bg-alt)]/20 flex flex-col items-center justify-center p-8 text-center space-y-2 min-h-[280px]">
          <div className="text-4xl">🎬</div>
          <h3 className="font-[family-name:var(--font-heading)] font-bold text-[var(--color-fg)]">
            Video Coming Soon
          </h3>
          <p className="text-sm text-[var(--color-fg-muted)] font-[family-name:var(--font-body)]">
            A walkthrough for this question is being prepared.
          </p>
        </div>
      ) : (
        <div className="border-2 border-[var(--color-border)] overflow-hidden bg-[var(--color-bg)]">
          {/* Browser-style presenter tabs ABOVE the player (scrollable if many) */}
          <div
            className="flex overflow-x-auto border-b-2 border-[var(--color-border-light)] bg-[var(--color-bg-alt)]/20 font-[family-name:var(--font-heading)]"
            role="tablist"
            aria-label="Video sources"
          >
            {question.videos.map((v, idx) => {
              const active = !showNotes && selectedVideoIndex === idx;
              return (
                <button
                  key={v.url + idx}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    setShowNotes(false);
                    setSelectedVideoIndex(idx);
                    trackEvent("switch_video_presenter", {
                      questionSlug: question.slug,
                      presenterLabel: v.label,
                      url: v.url,
                    });
                  }}
                  className={[
                    "px-3 py-2 text-xs font-bold transition-all border-r-2 border-[var(--color-border-light)] last:border-r-0 flex items-center gap-1.5 whitespace-nowrap shrink-0",
                    active
                      ? "bg-[var(--color-accent)] text-[var(--color-bg)]"
                      : "text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] hover:bg-[var(--color-bg-alt)]/40",
                    FOCUS_RING,
                  ].join(" ")}
                >
                  <span aria-hidden="true">{platformIcon(v.provider)}</span>
                  <span className="truncate max-w-[10rem]">{v.label}</span>
                </button>
              );
            })}
            <button
              type="button"
              role="tab"
              aria-selected={showNotes}
              onClick={() => setShowNotes(true)}
              className={[
                "px-3 py-2 text-xs font-bold transition-all border-l-2 border-[var(--color-border-light)] ml-auto flex items-center gap-1.5 shrink-0 whitespace-nowrap",
                showNotes
                  ? "bg-[var(--color-accent)] text-[var(--color-bg)]"
                  : "text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] hover:bg-[var(--color-bg-alt)]/40",
                FOCUS_RING,
              ].join(" ")}
            >
              📝 Notes
            </button>
          </div>

          {showNotes ? (
            <div className="p-4">
              <textarea
                placeholder="Write your study notes while watching the video..."
                className={`w-full h-48 p-3 bg-[var(--color-bg)] border-2 border-[var(--color-border-light)] font-[family-name:var(--font-body)] text-sm text-[var(--color-fg)] placeholder-[var(--color-fg-muted)]/50 focus:outline-none focus:border-[var(--color-accent)] resize-none ${FOCUS_RING}`}
                aria-label="Study notes"
              />
            </div>
          ) : (
            <div
              className="bg-black flex items-center justify-center w-full"
              style={{ aspectRatio: current?.aspectRatio || "16 / 9" }}
            >
              {current?.resolvedType === "iframe" && (
                <iframe
                  key={current.url}
                  src={current.resolvedSrc}
                  title={current.label}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              )}
              {current?.resolvedType === "video" && (
                <video
                  src={current.resolvedSrc}
                  controls
                  className="w-full h-full object-contain"
                  preload="metadata"
                >
                  Your browser does not support the video tag.
                </video>
              )}
              {current?.resolvedType === "unsupported" && (
                <div className="p-8 text-center text-white space-y-3 font-[family-name:var(--font-body)]">
                  <p className="text-sm">Direct Video Link:</p>
                  <a
                    href={current.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-block px-4 py-2 bg-white text-black font-bold hover:scale-105 transition-transform ${FOCUS_RING}`}
                  >
                    Open External Tutorial &rarr;
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Resources */}
      {question.resources.length > 0 && !isLocked && (
        <Card decoration="none" className="p-4 border-2 border-[var(--color-border-light)]">
          <h3 className="font-[family-name:var(--font-heading)] font-bold text-sm text-[var(--color-fg)] mb-2">
            📚 Resources
          </h3>
          <ul className="space-y-1.5">
            {question.resources.map((r, i) => (
              <li key={r.url + i}>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-sm text-[var(--color-accent)] hover:underline font-[family-name:var(--font-body)] break-words ${FOCUS_RING} rounded`}
                >
                  ↗ {r.title}
                </a>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Answer Workspace (center column)                                            */
/* -------------------------------------------------------------------------- */

function AnswerWorkspace({
  question,
  isLocked,
  userHasPremium,
  categorySlug,
  reduceMotion,
}: {
  question: WorkspaceActiveQuestion;
  isLocked: boolean;
  userHasPremium: boolean;
  categorySlug: string;
  reduceMotion: boolean;
}) {
  const [tab, setTab] = useState<AnswerTab>("summary");
  const [copied, setCopied] = useState(false);
  const { personalizedAnswers, isGenerating, activeResumeName, activeResumeId } =
    usePersonalizedAnswers(categorySlug);
  const personalized = personalizedAnswers[question.slug] || null;

  const handleCopy = useCallback(async () => {
    try {
      const text = `${question.question}\n\n${stripHtml(question.detailedExplanation)}`;
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  }, [question.question, question.detailedExplanation]);

  const handleShare = useCallback(async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({ title: question.question, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }
    } catch {
      /* share cancelled */
    }
  }, [question.question]);

  return (
    <Card decoration="none" className="border-2 border-[var(--color-border)] h-full flex flex-col">
      {/* Tabs + actions */}
      <div className="flex items-stretch border-b-2 border-[var(--color-border-light)] font-[family-name:var(--font-heading)] shrink-0">
        <div className="flex flex-1" role="tablist" aria-label="Answer sections">
          <AnswerTabButton label="🔑 Summary" isActive={tab === "summary"} onClick={() => setTab("summary")} />
          <AnswerTabButton label="💡 Detailed" isActive={tab === "detailed"} onClick={() => setTab("detailed")} />
          <AnswerTabButton label="🎯 Personalized" isActive={tab === "personalized"} onClick={() => setTab("personalized")} />
        </div>
        <div className="flex items-center gap-1 px-2 border-l-2 border-[var(--color-border-light)]">
          <button
            type="button"
            onClick={handleCopy}
            className={`px-2 py-1 text-xs font-bold border-2 border-[var(--color-border)] hover:bg-[var(--color-bg-alt)] ${FOCUS_RING} rounded`}
            aria-label="Copy answer"
          >
            {copied ? "✓ Copied" : "⧉ Copy"}
          </button>
          <button
            type="button"
            onClick={handleShare}
            className={`px-2 py-1 text-xs font-bold border-2 border-[var(--color-border)] hover:bg-[var(--color-bg-alt)] ${FOCUS_RING} rounded`}
            aria-label="Share question"
          >
            ↗ Share
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${question._id}-${tab}`}
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
            transition={{ duration: reduceMotion ? 0 : 0.18, ease: "easeOut" }}
            className="font-[family-name:var(--font-body)] max-w-prose"
          >
            {isLocked ? (
              <Paywall />
            ) : tab === "summary" ? (
              <div className="text-base text-[var(--color-fg)] leading-relaxed italic border-l-4 border-[var(--color-accent)] pl-4">
                &ldquo;{question.shortSummary || "A concise summary is being written for this question."}&rdquo;
              </div>
            ) : tab === "detailed" ? (
              <div className="space-y-4">
                <div
                  className="text-base text-[var(--color-fg)] leading-relaxed space-y-4 break-words [&_pre]:overflow-x-auto [&_table]:overflow-x-auto [&_img]:max-w-full"
                  dangerouslySetInnerHTML={{ __html: question.detailedExplanation }}
                />
                {question.example && (
                  <div className="bg-[var(--color-post-it)] border-2 border-[var(--color-border)] p-5 relative overflow-hidden mt-4">
                    <h4 className="font-[family-name:var(--font-heading)] font-bold text-[var(--color-fg)] mb-2">
                      📌 Worked Example (STAR Method)
                    </h4>
                    <div
                      className="text-base text-[var(--color-fg)] leading-relaxed space-y-2 break-words [&_pre]:overflow-x-auto [&_table]:overflow-x-auto [&_img]:max-w-full"
                      dangerouslySetInnerHTML={{ __html: question.example }}
                    />
                  </div>
                )}
              </div>
            ) : (
              <PersonalizedPanel
                personalized={personalized}
                isGenerating={isGenerating}
                activeResumeName={activeResumeName}
                hasResume={!!activeResumeId}
                userHasPremium={userHasPremium}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {!isLocked && <SuggestEditForm question={question} />}
      </div>
    </Card>
  );
}

function AnswerTabButton({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={onClick}
      className={[
        "flex-1 px-2 py-2.5 text-xs sm:text-sm font-bold transition-all font-[family-name:var(--font-heading)] border-r-2 border-[var(--color-border-light)] last:border-r-0",
        isActive
          ? "bg-[var(--color-accent)] text-[var(--color-bg)]"
          : "text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] hover:bg-[var(--color-bg-alt)]/30",
        FOCUS_RING,
      ].join(" ")}
    >
      {label}
    </button>
  );
}

function PersonalizedPanel({
  personalized,
  isGenerating,
  activeResumeName,
  hasResume,
  userHasPremium,
}: {
  personalized: string | null;
  isGenerating: boolean;
  activeResumeName?: string | null;
  hasResume: boolean;
  userHasPremium: boolean;
}) {
  if (isGenerating) {
    return (
      <div className="p-4 bg-[var(--color-bg-alt)]/25 border-2 border-dashed border-[var(--color-border-light)] animate-pulse text-sm font-[family-name:var(--font-heading)] text-[var(--color-fg-muted)]">
        Tailoring solution to your resume background...
      </div>
    );
  }
  if (personalized) {
    return (
      <div className="border-2 border-[var(--color-border)] p-5 bg-[#faf6ef]">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="success">✓ Personalized to your resume</Badge>
          {activeResumeName && (
            <span className="text-xs text-[var(--color-fg-muted)] font-mono">Based on: {activeResumeName}</span>
          )}
        </div>
        <div
          className="text-base text-[var(--color-fg)] leading-relaxed space-y-3 break-words [&_pre]:overflow-x-auto [&_table]:overflow-x-auto [&_img]:max-w-full"
          dangerouslySetInnerHTML={{ __html: personalized }}
        />
      </div>
    );
  }
  return (
    <div className="border-2 border-dashed border-[var(--color-warning)] bg-amber-50/30 p-5 text-sm text-[var(--color-fg-muted)] font-[family-name:var(--font-body)] space-y-1">
      <div className="flex items-center gap-2 font-bold text-[var(--color-warning)] font-[family-name:var(--font-heading)]">
        <span>🔒</span>
        <span>AI Personalization</span>
      </div>
      {hasResume ? (
        <p>
          Resume-personalized answers are capped at the top 10 questions for free accounts.
          {!userHasPremium && " Upgrade to Premium to personalize every solution!"}
        </p>
      ) : (
        <p>Upload a resume to unlock AI personalized answers tailored to your background.</p>
      )}
    </div>
  );
}

function Paywall() {
  return (
    <div className="border-2 border-[var(--color-warning)] bg-amber-50/50 p-6 md:p-8 text-center space-y-4">
      <span className="text-4xl" role="img" aria-label="Padlock">🔒</span>
      <h3 className="text-xl font-bold font-[family-name:var(--font-heading)] text-[var(--color-fg)]">
        Unlock Premium Solutions Layer
      </h3>
      <p className="text-sm text-[var(--color-fg-muted)] max-w-md mx-auto font-[family-name:var(--font-body)]">
        This detailed model answer, worked STAR narrative, and creator video tutorials require a Loopora Premium subscription.
      </p>
      <div className="pt-2">
        <Link href="/signup">
          <Button variant="primary" className="px-6 font-[family-name:var(--font-heading)] font-bold text-sm">
            Upgrade to Premium &rarr;
          </Button>
        </Link>
      </div>
    </div>
  );
}

function SuggestEditForm({ question }: { question: WorkspaceActiveQuestion }) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);
    setSending(true);
    try {
      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionText: `Feedback for Q: "${question.question}" (Slug: ${question.slug})`,
          categorySuggestion: question.category.name,
          notes: notes.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to submit suggestion.");
      } else {
        setSuccess("Thank you! Your feedback has been queued for review.");
        posthog.capture("suggestion_submitted", {
          questionSlug: question.slug,
          category: question.category.name,
        });
        setNotes("");
        setOpen(false);
      }
    } catch (err) {
      posthog.captureException(err);
      setError("A network error occurred. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mt-6 border-t-2 border-dashed border-[var(--color-border-light)] pt-4">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`text-sm font-[family-name:var(--font-heading)] font-bold text-[var(--color-fg-muted)] hover:text-[var(--color-accent)] ${FOCUS_RING} rounded`}
        >
          💡 Improve this solution / suggest an edit
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          {success && (
            <div className="border-2 border-[var(--color-success)] bg-green-50 p-2 text-sm text-[var(--color-success)]">
              {success}
            </div>
          )}
          {error && (
            <div className="border-2 border-[var(--color-error)] bg-red-50 p-2 text-sm text-[var(--color-error)]">
              ⚠️ {error}
            </div>
          )}
          <textarea
            rows={3}
            required
            placeholder="Paste an alternate code block, worked STAR steps, or describe the correction..."
            className={`w-full border-2 px-3 py-2 bg-[var(--color-bg)] text-[var(--color-fg)] font-[family-name:var(--font-body)] border-[var(--color-border)] focus:outline-none focus:border-[var(--color-accent)] ${FOCUS_RING}`}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={sending}
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className={`px-3 py-1.5 text-sm font-bold border-2 border-[var(--color-border)] font-[family-name:var(--font-heading)] ${FOCUS_RING}`}
            >
              Cancel
            </button>
            <Button type="submit" variant="primary" isLoading={sending} className="text-sm">
              Submit Idea
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Question List (right column / drawer) — dense, animated cards               */
/* -------------------------------------------------------------------------- */

const QuestionListItem = React.memo(function QuestionListItem({
  q,
  isActive,
  isPersonalized,
  onSelect,
}: {
  q: WorkspaceQuestionNav;
  isActive: boolean;
  isPersonalized: boolean;
  onSelect: (slug: string) => void;
}) {
  const difficultyBadge = `difficulty-${q.difficulty}` as
    | "difficulty-easy"
    | "difficulty-medium"
    | "difficulty-hard";

  return (
    <button
      type="button"
      onClick={() => onSelect(q.slug)}
      aria-current={isActive ? "true" : undefined}
      className={[
        "w-full text-left pl-3 pr-3 py-2 border-2 border-l-4 transition-all flex items-start gap-2 relative",
        isActive
          ? "border-[var(--color-accent)] border-l-[var(--color-accent)] bg-[var(--color-accent)]/10"
          : "border-[var(--color-border-light)] border-l-transparent bg-[var(--color-bg)] hover:border-[var(--color-border)] hover:bg-[var(--color-bg-alt)]/40 hover:-translate-y-px",
        FOCUS_RING,
      ].join(" ")}
    >
      <div className="min-w-0 flex-1">
        <p className="font-[family-name:var(--font-heading)] font-bold text-[13px] leading-snug text-[var(--color-fg)]">
          {q.question}
        </p>
        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
          <Badge variant={difficultyBadge}>{q.difficulty}</Badge>
          {q.hasVideo && (
            <span className="text-[10px] font-bold text-[var(--color-fg-muted)] font-[family-name:var(--font-body)]">
              🎬 {q.videoCount}
            </span>
          )}
          {isPersonalized && (
            <span className="text-[10px] font-bold text-green-700" title="Personalized answer available" aria-label="Personalized">
              🎯
            </span>
          )}
          {q.isPremium && <span className="text-[10px] font-bold text-[var(--color-warning)]" aria-label="Premium">🔒</span>}
          {q.isFavorited && <span className="text-[10px]" title="Favorited" aria-label="Favorited">⭐</span>}
          {q.isPracticed && <span className="text-[10px]" title="Practiced" aria-label="Practiced">✅</span>}
        </div>
      </div>
      <span className="text-[10px] text-[var(--color-fg-muted)] font-mono shrink-0 mt-0.5">#{q.frequencyRank}</span>
    </button>
  );
});

function QuestionList({
  questions,
  activeId,
  personalizedSlugs,
  onSelect,
}: {
  questions: WorkspaceQuestionNav[];
  activeId: string;
  personalizedSlugs: Set<string>;
  onSelect: (slug: string) => void;
}) {
  const activeRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest" });
  }, [activeId]);

  if (questions.length === 0) {
    return (
      <div className="text-center py-12 text-sm text-[var(--color-fg-muted)] font-[family-name:var(--font-body)]">
        No questions match your filter.
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-1">
      {questions.map((q) => {
        const isActive = q._id === activeId;
        return (
          <div key={q._id} ref={isActive ? activeRef : undefined}>
            <QuestionListItem
              q={q}
              isActive={isActive}
              isPersonalized={personalizedSlugs.has(q.slug)}
              onSelect={onSelect}
            />
          </div>
        );
      })}
    </div>
  );
}
