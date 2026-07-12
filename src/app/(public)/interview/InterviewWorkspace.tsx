/**
 * InterviewWorkspace — Three-Column Interview Experience
 *
 * Production-grade, desktop-first workspace for a single Interview Folder:
 *   • Left  (~30%) Video Workspace  — multi-video tabs, never cropped (CSS aspect-ratio), notes.
 *   • Center(~45%) Answer Workspace  — tabbed (Short Summary / Detailed / Personalized), internal scroll.
 *   • Right (~25%) Question Navigator— search + difficulty filter + sticky scrollable list, keyboard nav.
 *
 * Layout is structurally constant across question switches (only inner content
 * cross-fades), so there is zero layout shift. Videos are never cropped because
 * every player box uses the resolved `aspect-ratio`. Fully responsive: 3-col on
 * xl, 2-col (Video+Answer) with a navigator drawer on lg, single-column on smaller.
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
import { motion, AnimatePresence } from "framer-motion";
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
  { key: "easy", label: "🟢 Easy" },
  { key: "medium", label: "🟡 Medium" },
  { key: "hard", label: "🔴 Hard" },
];

const ICON_EMOJI: Record<string, string> = {
  user: "👤",
  code: "💻",
  cpu: "⚙️",
  briefcase: "💼",
  award: "🏆",
  brain: "🧠",
  bookopen: "📖",
};

function categoryIcon(category: WorkspaceCategory | null): string {
  return ICON_EMOJI[(category?.icon || "").toLowerCase()] || "📁";
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
  const [search, setSearch] = useState(() => searchParams.get("q") || "");
  const [difficulty, setDifficulty] = useState<DifficultyFilter>(
    () => (searchParams.get("diff") as DifficultyFilter) || "all"
  );
  const [navOpen, setNavOpen] = useState(false);

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

  // Keyboard navigation: ArrowUp / ArrowDown switch questions in the filtered list.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const el = document.activeElement;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA")) return;
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      if (filtered.length === 0) return;
      const curIdx = activeQuestion
        ? filtered.findIndex((q) => q._id === activeQuestion._id)
        : -1;
      e.preventDefault();
      let nextIdx: number;
      if (e.key === "ArrowDown") {
        nextIdx = curIdx < 0 ? 0 : Math.min(curIdx + 1, filtered.length - 1);
      } else {
        nextIdx = curIdx <= 0 ? 0 : curIdx - 1;
      }
      const next = filtered[nextIdx];
      if (next) router.push(buildHref(next.slug));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [filtered, activeQuestion, router, buildHref]);

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

  const navigator = (
    <QuestionNavigator
      questions={filtered}
      activeId={activeQuestion._id}
      search={search}
      difficulty={difficulty}
      onSearchChange={(v) => {
        setSearch(v);
        if (v.length >= 3) {
          trackEvent("search_questions", { categorySlug: category.slug, query: v });
        }
      }}
      onDifficultyChange={(d) => {
        setDifficulty(d);
        trackEvent("filter_difficulty", { categorySlug: category.slug, difficulty: d });
      }}
      onSelect={(slug) => {
        router.push(buildHref(slug));
        setNavOpen(false);
      }}
    />
  );

  return (
    <div className="flex flex-col xl:h-[calc(100dvh-4rem)]">
      {/* Compact toolbar header */}
      <WorkspaceHeader
        category={category}
        activeQuestion={activeQuestion}
        onOpenNav={() => setNavOpen(true)}
      />

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-[30fr_45fr_25fr] gap-4 p-3 sm:p-4">
        {/* LEFT — Video Workspace */}
        <section className="min-h-0 xl:overflow-y-auto" aria-label="Video workspace">
          <VideoWorkspace key={activeQuestion._id} question={activeQuestion} isLocked={isLocked} />
        </section>

        {/* CENTER — Answer Workspace */}
        <section className="min-h-0 xl:overflow-y-auto" aria-label="Answer workspace">
          <AnswerWorkspace
            key={activeQuestion._id}
            question={activeQuestion}
            isLocked={isLocked}
            userHasPremium={userHasPremium}
            categorySlug={category.slug}
          />
        </section>

        {/* RIGHT — Question Navigator (desktop) */}
        <aside className="hidden xl:flex min-h-0 xl:overflow-hidden flex-col" aria-label="Question navigator">
          {navigator}
        </aside>
      </div>

      {/* Navigator drawer (below xl) */}
      <AnimatePresence>
        {navOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/40 xl:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setNavOpen(false)}
            />
            <motion.aside
              className="fixed top-0 right-0 z-50 h-full w-[88%] max-w-sm bg-[var(--color-bg)] shadow-2xl flex flex-col xl:hidden border-l-2 border-[var(--color-border)]"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
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
                  className="px-3 py-1 border-2 border-[var(--color-border)] font-[family-name:var(--font-heading)] font-bold text-sm"
                  aria-label="Close navigator"
                >
                  ✕
                </button>
              </div>
              <div className="flex-1 min-h-0">{navigator}</div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Workspace Header (compact toolbar)                                          */
/* -------------------------------------------------------------------------- */

function WorkspaceHeader({
  category,
  activeQuestion,
  onOpenNav,
}: {
  category: WorkspaceCategory;
  activeQuestion: WorkspaceActiveQuestion;
  onOpenNav: () => void;
}) {
  return (
    <header className="shrink-0 border-b-2 border-[var(--color-border)] bg-[var(--color-bg)] px-3 sm:px-4 py-2.5 flex items-center gap-3">
      <span className="text-2xl shrink-0" aria-hidden="true">
        {categoryIcon(category)}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2 min-w-0">
          <h1 className="font-[family-name:var(--font-heading)] font-bold text-lg text-[var(--color-fg)] truncate">
            {category.name}
          </h1>
          <span className="text-xs text-[var(--color-fg-muted)] font-[family-name:var(--font-body)] shrink-0">
            {category.questionCount} items
          </span>
        </div>
        {/* Current question context (always visible on small screens) */}
        <p className="text-xs text-[var(--color-fg-muted)] truncate font-[family-name:var(--font-body)] xl:hidden">
          {activeQuestion.question}
        </p>
      </div>

      <button
        type="button"
        onClick={onOpenNav}
        className="xl:hidden shrink-0 px-3 py-1.5 border-2 border-[var(--color-border)] font-[family-name:var(--font-heading)] font-bold text-sm bg-[var(--color-bg-alt)] hover:bg-[var(--color-bg-alt)]/60"
      >
        ☰ Questions
      </button>
    </header>
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
  const [videoTab, setVideoTab] = useState<"video" | "notes">("video");
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);

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
          <div className="flex items-center gap-2 mb-1">
            <Badge variant={difficultyBadge}>{question.difficulty}</Badge>
            {question.isPremium && (
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-[var(--color-warning)] border border-[var(--color-warning)]">
                👑 Premium
              </span>
            )}
            <span className="text-xs text-[var(--color-fg-muted)] font-mono">
              #{question.frequencyRank}
            </span>
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

      {/* Player card */}
      <Card decoration="none" className="overflow-hidden border-2 border-[var(--color-border)]">
        {isLocked ? (
          <div className="aspect-video flex flex-col items-center justify-center bg-[var(--color-bg-alt)]/30 p-6 text-center space-y-3">
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
          <div className="aspect-video flex flex-col items-center justify-center bg-[var(--color-bg-alt)]/20 p-6 text-center space-y-2">
            <div className="text-4xl">🎬</div>
            <h3 className="font-[family-name:var(--font-heading)] font-bold text-[var(--color-fg)]">
              Video Coming Soon
            </h3>
            <p className="text-sm text-[var(--color-fg-muted)] font-[family-name:var(--font-body)]">
              A walkthrough for this question is being prepared.
            </p>
          </div>
        ) : (
          <div>
            {/* Video / Notes tabs */}
            <div className="flex border-b-2 border-[var(--color-border-light)] bg-[var(--color-bg-alt)]/20 font-[family-name:var(--font-heading)]">
              <TabButton label="🎬 Video" isActive={videoTab === "video"} onClick={() => setVideoTab("video")} />
              <TabButton label="📝 Notes" isActive={videoTab === "notes"} onClick={() => setVideoTab("notes")} />
            </div>

            {videoTab === "video" ? (
              <div>
                {/* Player — never cropped, uses resolved aspect-ratio */}
                <div
                  className="bg-black flex items-center justify-center"
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
                    <video src={current.resolvedSrc} controls className="w-full h-full object-contain" preload="metadata">
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
                        className="inline-block px-4 py-2 bg-white text-black font-bold hover:scale-105 transition-transform"
                      >
                        Open External Tutorial &rarr;
                      </a>
                    </div>
                  )}
                </div>

                {/* Multi-video selector */}
                {question.videos.length > 1 && (
                  <div className="p-3 flex flex-wrap gap-2">
                    {question.videos.map((v, idx) => (
                      <button
                        key={v.url + idx}
                        type="button"
                        onClick={() => {
                          setSelectedVideoIndex(idx);
                          trackEvent("switch_video_presenter", {
                            questionSlug: question.slug,
                            presenterLabel: v.label,
                            url: v.url,
                          });
                        }}
                        className={[
                          "px-3 py-1.5 text-xs font-bold font-[family-name:var(--font-heading)] border-2 transition-all",
                          idx === selectedVideoIndex
                            ? "bg-[var(--color-accent)] text-[var(--color-bg)] border-[var(--color-accent)]"
                            : "bg-[var(--color-bg)] text-[var(--color-fg)] border-[var(--color-border)] hover:bg-[var(--color-bg-alt)]",
                        ].join(" ")}
                      >
                        🗣️ {v.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4">
                <textarea
                  placeholder="Write your study notes while watching the video..."
                  className="w-full h-40 p-3 bg-[var(--color-bg)] border-2 border-[var(--color-border-light)] font-[family-name:var(--font-body)] text-sm text-[var(--color-fg)] placeholder-[var(--color-fg-muted)]/50 focus:outline-none focus:border-[var(--color-accent)] resize-none"
                  aria-label="Study notes"
                />
              </div>
            )}
          </div>
        )}
      </Card>

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
                  className="text-sm text-[var(--color-accent)] hover:underline font-[family-name:var(--font-body)] break-words"
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

function TabButton({
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
      onClick={onClick}
      className={[
        "px-4 py-2 text-xs font-bold transition-all font-[family-name:var(--font-heading)]",
        isActive
          ? "bg-[var(--color-fg)] text-[var(--color-bg)]"
          : "text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] hover:bg-[var(--color-bg-alt)]/30",
      ].join(" ")}
    >
      {label}
    </button>
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
}: {
  question: WorkspaceActiveQuestion;
  isLocked: boolean;
  userHasPremium: boolean;
  categorySlug: string;
}) {
  const [tab, setTab] = useState<AnswerTab>("summary");
  const { personalizedAnswers, isGenerating, activeResumeName, activeResumeId } =
    usePersonalizedAnswers(categorySlug);
  const personalized = personalizedAnswers[question.slug] || null;

  return (
    <Card decoration="none" className="border-2 border-[var(--color-border)] h-full flex flex-col">
      {/* Tabs */}
      <div className="flex border-b-2 border-[var(--color-border-light)] font-[family-name:var(--font-heading)] shrink-0">
        <AnswerTabButton label="🔑 Short Summary" isActive={tab === "summary"} onClick={() => setTab("summary")} />
        <AnswerTabButton label="💡 Detailed" isActive={tab === "detailed"} onClick={() => setTab("detailed")} />
        <AnswerTabButton label="🎯 Personalized" isActive={tab === "personalized"} onClick={() => setTab("personalized")} />
      </div>

      {/* Scrollable content (internal scroll — no page layout shift) */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${question._id}-${tab}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="font-[family-name:var(--font-body)]"
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

        {/* Suggest-edit console */}
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
      onClick={onClick}
      className={[
        "flex-1 px-2 py-2.5 text-xs sm:text-sm font-bold transition-all font-[family-name:var(--font-heading)] border-r-2 border-[var(--color-border-light)] last:border-r-0",
        isActive
          ? "bg-[var(--color-accent)] text-[var(--color-bg)]"
          : "text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] hover:bg-[var(--color-bg-alt)]/30",
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
            <span className="text-xs text-[var(--color-fg-muted)] font-mono">
              Based on: {activeResumeName}
            </span>
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
          className="text-sm font-[family-name:var(--font-heading)] font-bold text-[var(--color-fg-muted)] hover:text-[var(--color-accent)]"
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
            className="w-full border-2 px-3 py-2 bg-[var(--color-bg)] text-[var(--color-fg)] font-[family-name:var(--font-body)] border-[var(--color-border)] focus:outline-none focus:border-[var(--color-accent)]"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={sending}
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-3 py-1.5 text-sm font-bold border-2 border-[var(--color-border)] font-[family-name:var(--font-heading)]"
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
/* Question Navigator (right column / drawer)                                  */
/* -------------------------------------------------------------------------- */

function QuestionNavigator({
  questions,
  activeId,
  search,
  difficulty,
  onSearchChange,
  onDifficultyChange,
  onSelect,
}: {
  questions: WorkspaceQuestionNav[];
  activeId: string;
  search: string;
  difficulty: DifficultyFilter;
  onSearchChange: (v: string) => void;
  onDifficultyChange: (d: DifficultyFilter) => void;
  onSelect: (slug: string) => void;
}) {
  const activeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest" });
  }, [activeId]);

  const difficultyBadge = (d: WorkspaceQuestionNav["difficulty"]) =>
    `difficulty-${d}` as "difficulty-easy" | "difficulty-medium" | "difficulty-hard";

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Search + filter */}
      <div className="shrink-0 p-3 border-b-2 border-[var(--color-border)] space-y-2 bg-[var(--color-bg)]">
        <Input
          label="Search this folder"
          placeholder="e.g. recursion, arrays..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search questions"
        />
        <div className="flex border-2 border-[var(--color-border)] bg-[var(--color-bg-alt)]/30 p-0.5">
          {DIFFICULTIES.map((d) => (
            <button
              key={d.key}
              type="button"
              onClick={() => onDifficultyChange(d.key)}
              className={[
                "flex-1 px-2 py-1 text-xs font-bold font-[family-name:var(--font-heading)] transition-all",
                difficulty === d.key
                  ? "bg-[var(--color-accent)] text-[var(--color-bg)]"
                  : "text-[var(--color-fg)] hover:bg-[var(--color-bg-alt)]",
              ].join(" ")}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-1.5">
        {questions.length === 0 ? (
          <div className="text-center py-12 text-sm text-[var(--color-fg-muted)] font-[family-name:var(--font-body)]">
            No questions match your filter.
          </div>
        ) : (
          questions.map((q) => {
            const isActive = q._id === activeId;
            return (
              <button
                key={q._id}
                type="button"
                onClick={() => onSelect(q.slug)}
                ref={isActive ? activeRef : undefined}
                aria-current={isActive ? "true" : undefined}
                className={[
                  "w-full text-left p-3 border-2 transition-all flex items-start gap-2",
                  isActive
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 shadow-sm"
                    : "border-[var(--color-border-light)] bg-[var(--color-bg)] hover:border-[var(--color-border)] hover:bg-[var(--color-bg-alt)]/40",
                ].join(" ")}
              >
                <div className="min-w-0 flex-1">
                  <p className="font-[family-name:var(--font-heading)] font-bold text-sm text-[var(--color-fg)] leading-snug">
                    {q.question}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    <Badge variant={difficultyBadge(q.difficulty)}>{q.difficulty}</Badge>
                    {q.hasVideo && (
                      <span className="text-[10px] font-bold text-[var(--color-fg-muted)] font-[family-name:var(--font-body)]">
                        🎬 {q.videoCount}
                      </span>
                    )}
                    {q.isPremium && (
                      <span className="text-[10px] font-bold text-[var(--color-warning)]">🔒</span>
                    )}
                    {q.isFavorited && (
                      <span className="text-[10px]" title="Favorited" aria-label="Favorited">⭐</span>
                    )}
                    {q.isPracticed && (
                      <span className="text-[10px]" title="Practiced" aria-label="Practiced">✅</span>
                    )}
                  </div>
                </div>
                <span className="text-[10px] text-[var(--color-fg-muted)] font-mono shrink-0">#{q.frequencyRank}</span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
