/**
 * QuestionDetailContainer Client Component
 *
 * Implements the core interactive features on the Q&A detail page:
 * 1. Signature Video Switcher Panel rendering presenter tabs and responsive iframe embeds.
 * 2. Premium Paywall block rendering overlay locks.
 * 3. Suggest Correction / Alternative Solution feedback console.
 *
 * @module app/(public)/interview/[categorySlug]/[questionSlug]/QuestionDetailContainer
 * @see 04_UIUX_Design_Brief.md §2.4 — Detailed Q&A view switcher
 */

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card, Button, Badge, FavoriteToggle, PracticedToggle } from "@/components/ui";
import { trackEvent } from "@/lib/analytics";
import { getEmbedUrl } from "@/lib/video/getEmbedUrl";
import posthog from "posthog-js";

interface VideoData {
  label: string;
  url: string;
  order: number;
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
  videos: VideoData[];
  difficulty: string;
  frequencyRank: number;
  tags: string[];
  isPremium: boolean;
  category: string;
}

interface QuestionDetailContainerProps {
  categoryName: string;
  question: QuestionData;
  userHasPremium: boolean;
  initialIsFavorited?: boolean;
  initialIsPracticed?: boolean;
}

export function QuestionDetailContainer({
  categoryName,
  question,
  userHasPremium,
  initialIsFavorited = false,
  initialIsPracticed = false,
}: QuestionDetailContainerProps) {
  // Paywall check: premium questions are locked if user does not have premium status
  const isLocked = question.isPremium && !userHasPremium;

  useEffect(() => {
    if (isLocked) {
      posthog.capture("premium_paywall_encountered", {
        question_slug: question.slug,
        category: categoryName,
        difficulty: question.difficulty,
      });
    }
  // Only fire once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Personalization hooks
  interface ResumeMetadata {
    _id: string;
    originalFilename: string;
    mimeTypeSniffed: string;
    pageCount: number;
    createdAt: string;
  }
  interface PersonalizedQuestion {
    questionId: string;
    personalizedAnswer: string;
  }

  const [latestResume, setLatestResume] = useState<ResumeMetadata | null>(null);
  const [personalizedAnswer, setPersonalizedAnswer] = useState<string | null>(null);
  const [personalizationLoading, setPersonalizationLoading] = useState(false);

  useEffect(() => {
    async function loadPersonalizedAnswer() {
      try {
        const profileRes = await fetch("/api/profile");
        const profileJson = await profileRes.json();
        if (profileJson.success && profileJson.data) {
          const user = profileJson.data;
          const resume = user.latestResume;
          if (resume) {
            setLatestResume(resume);
            setPersonalizationLoading(true);
            
            const catId = question.category;
            const catRes = await fetch(`/api/interview/${catId}/personalized?resumeId=${resume._id}`);
            const catJson = await catRes.json();
            
            if (catRes.ok && catJson.success) {
              const matched = catJson.questions.find((q: PersonalizedQuestion) => q.questionId === question._id);
              if (matched) {
                setPersonalizedAnswer(matched.personalizedAnswer);
              }
            }
          }
        }
      } catch (err) {
        console.error("Failed to load personalization:", err);
      } finally {
        setPersonalizationLoading(false);
      }
    }
    
    if (!isLocked) {
      loadPersonalizedAnswer();
    }
  }, [question, isLocked]);

  // Video switcher state
  const hasVideos = question.videos && question.videos.length > 0;
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const selectedVideo = hasVideos ? question.videos[activeVideoIndex] : null;

  // Suggestion form state
  const [notes, setNotes] = useState("");
  const [suggestionSuccess, setSuggestionSuccess] = useState<string | null>(null);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const handleSuggestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuggestionSuccess(null);
    setSuggestionError(null);
    setIsSending(true);

    try {
      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionText: `Feedback for Q: "${question.question}" (Slug: ${question.slug})`,
          categorySuggestion: categoryName,
          notes: notes.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSuggestionError(data.error || "Failed to submit suggestion.");
      } else {
        setSuggestionSuccess("Thank you! Your feedback has been queued for review.");
        posthog.capture("suggestion_submitted", {
          question_slug: question.slug,
          category: categoryName,
        });
        setNotes("");
      }
    } catch (err) {
      posthog.captureException(err);
      setSuggestionError("A network error occurred. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const embedInfo = selectedVideo ? getEmbedUrl(selectedVideo.url) : null;
  const difficultyBadgeVariant = `difficulty-${question.difficulty}` as
    | "difficulty-easy"
    | "difficulty-medium"
    | "difficulty-hard";

  return (
    <div className="space-y-10 font-[family-name:var(--font-body)]">
      
      {/* 1. Core Question & Preview Panel */}
      <Card decoration="none" className="p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b-2 border-dashed border-[var(--color-border-light)] pb-4 mb-6">
          <div className="flex items-center gap-2">
            <Badge variant={difficultyBadgeVariant}>{question.difficulty}</Badge>
            {question.isPremium && (
              <span className="px-2 py-0.5 text-xs font-bold uppercase tracking-wider bg-amber-50 text-[var(--color-warning)] border border-[var(--color-warning)] wobbly-sm">
                👑 Premium Only
              </span>
            )}
          </div>
          <span className="text-xs text-[var(--color-fg-muted)] font-mono">
            Priority Index: #{question.frequencyRank}
          </span>
        </div>

        <div className="flex items-start justify-between gap-4 mb-4">
          <h2
            className="text-2xl md:text-3xl font-bold text-[var(--color-fg)] flex-1"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {question.question}
          </h2>
          <div className="flex items-center gap-2 shrink-0">
            <FavoriteToggle questionId={question._id} initialIsFavorited={initialIsFavorited} />
            <PracticedToggle questionId={question._id} initialIsPracticed={initialIsPracticed} />
          </div>
        </div>

        {question.answer.short && (
          <div className="bg-[var(--color-bg-alt)]/40 p-4 border-2 border-dashed border-[var(--color-border-light)] wobbly-sm mb-6">
            <p className="text-sm font-bold uppercase tracking-wider text-[var(--color-fg-muted)] font-[family-name:var(--font-heading)]">
              🔑 Short Summary Answer
            </p>
            <p className="text-base text-[var(--color-fg)] italic mt-1 font-[family-name:var(--font-body)]">
              &ldquo;{question.answer.short}&rdquo;
            </p>
          </div>
        )}

        {/* 2. Premium Paywall block vs Detailed Explanations */}
        {isLocked ? (
          <div className="wobbly border-2 border-[var(--color-warning)] bg-amber-50/50 p-6 md:p-8 text-center space-y-4 my-8">
            <span className="text-4xl" role="img" aria-label="Padlock">🔒</span>
            <h3 className="text-xl font-bold text-[var(--color-fg)] font-[family-name:var(--font-heading)]">
              Unlock Premium Solutions Layer
            </h3>
            <p className="text-sm text-[var(--color-fg-muted)] max-w-md mx-auto font-[family-name:var(--font-body)]">
              This detailed model answer explanation, worked STAR narratives, and creator video tutorials require a Loopora Premium subscription.
            </p>
            <div className="pt-2">
              <Link href="/signup">
                <Button variant="primary" className="px-6 font-[family-name:var(--font-heading)] font-bold text-sm shadow">
                  Upgrade to Premium Account &rarr;
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Detailed Explanation */}
            <div>
              <h4 className="text-lg font-bold font-[family-name:var(--font-heading)] text-[var(--color-fg)] border-b border-[var(--color-border-light)] pb-1 mb-3">
                💡 Detailed Model Explanation
              </h4>
              <div
                className="text-base text-[var(--color-fg)] leading-relaxed space-y-4 font-[family-name:var(--font-body)]"
                dangerouslySetInnerHTML={{ __html: question.answer.detailed }}
              />
            </div>

            {/* Personalized AI Explanation */}
            {personalizationLoading && (
              <div className="p-4 bg-[var(--color-bg-alt)]/25 border-2 border-dashed border-[var(--color-border-light)] wobbly-sm animate-pulse">
                <span className="text-sm font-[family-name:var(--font-heading)] text-[var(--color-fg-muted)]">
                  Tailoring solution to your resume background...
                </span>
              </div>
            )}

            {personalizedAnswer && (
              <div className="border-2 border-[var(--color-border)] wobbly-sm p-6 bg-[#faf6ef] relative overflow-hidden ph-no-autocapture" style={{ boxShadow: "var(--shadow-default)" }}>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="success">✓ Personalized to your resume</Badge>
                  {latestResume && (
                    <span className="text-xs text-[var(--color-fg-muted)] font-mono">
                      Based on: {latestResume.originalFilename}
                    </span>
                  )}
                </div>
                <div
                  className="text-base text-[var(--color-fg)] leading-relaxed space-y-3 font-[family-name:var(--font-body)]"
                  dangerouslySetInnerHTML={{ __html: personalizedAnswer }}
                />
              </div>
            )}

            {latestResume && !personalizedAnswer && !personalizationLoading && !userHasPremium && (
              <div className="border-2 border-dashed border-[var(--color-warning)] bg-amber-50/30 p-5 wobbly-sm text-sm text-[var(--color-fg-muted)]">
                <div className="flex items-center gap-2 font-bold text-[var(--color-warning)] font-[family-name:var(--font-heading)]">
                  <span>🔒</span>
                  <span>AI Personalization Locked</span>
                </div>
                <p className="mt-1 font-[family-name:var(--font-body)]">
                  Resume-personalized answers are capped at the top 10 questions for free candidate accounts. Upgrade to Premium to personalize all solutions in this folder!
                </p>
              </div>
            )}

            {/* STAR Worked Narrative */}
            {question.answer.example && (
              <div className="bg-[var(--color-post-it)] border-2 border-[var(--color-border)] wobbly-sm p-6 relative overflow-hidden" style={{ boxShadow: "var(--shadow-default)" }}>
                {/* Wobbly tape overlay graphic */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 h-3.5 w-20 bg-[var(--color-accent)] opacity-20 border-x border-b border-[var(--color-border)] rotate-[-1deg]" />
                
                <h4 className="text-lg font-bold font-[family-name:var(--font-kalam)] text-[var(--color-fg)] mb-3">
                  📌 Worked Example (STAR Method Breakdown)
                </h4>
                <div
                  className="text-base text-[var(--color-fg)] leading-relaxed space-y-2 font-[family-name:var(--font-body)]"
                  dangerouslySetInnerHTML={{ __html: question.answer.example }}
                />
              </div>
            )}

            {/* Signature Video Switcher Panel */}
            {hasVideos && selectedVideo && (
              <div className="space-y-4 pt-4">
                <h4 className="text-lg font-bold font-[family-name:var(--font-heading)] text-[var(--color-fg)]">
                  🎥 Signature Video Explanations switcher
                </h4>

                {/* Presenter Tabs */}
                <div className="flex flex-wrap gap-2">
                  {question.videos.map((vid, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setActiveVideoIndex(idx);
                        trackEvent("switch_video_presenter", {
                          questionSlug: question.slug,
                          presenterLabel: vid.label,
                          url: vid.url,
                        });
                      }}
                      className={[
                        "px-4 py-2 text-xs font-bold font-[family-name:var(--font-heading)] border-2 wobbly-sm transition-all",
                        activeVideoIndex === idx
                          ? "bg-[var(--color-accent)] text-[var(--color-bg)] border-[var(--color-accent)]"
                          : "bg-[var(--color-bg)] text-[var(--color-fg)] border-[var(--color-border)] hover:bg-[var(--color-bg-alt)]",
                      ].join(" ")}
                    >
                      🗣️ {vid.label}
                    </button>
                  ))}
                </div>

                {/* Embedded Player Card */}
                <Card decoration="none" className="overflow-hidden bg-black aspect-video relative flex items-center justify-center border-2 border-[var(--color-border)] wobbly-sm">
                  {embedInfo?.type === "iframe" && (
                    <iframe
                      src={embedInfo.src}
                      title={selectedVideo.label}
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
                    <div className="p-8 text-center text-white space-y-3 font-[family-name:var(--font-body)]">
                      <p className="text-sm">Direct Video Link:</p>
                      <a
                        href={selectedVideo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-4 py-2 bg-white text-black font-bold wobbly-sm hover:scale-102 transition-transform"
                      >
                        Open External Tutorial &rarr;
                      </a>
                    </div>
                  )}
                </Card>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* 3. Suggest Alternative Solution / Correction drawer */}
      <Card decoration="none" className="p-6 md:p-8 bg-[var(--color-bg-alt)]/20 border-dashed">
        <h3 className="text-xl font-bold font-[family-name:var(--font-heading)] text-[var(--color-fg)] mb-2">
          💡 Improve This Solution / Suggest Edit
        </h3>
        <p className="text-sm text-[var(--color-fg-muted)] mb-4">
          Spotted a typo? Have a more optimal code sample or behavioral narrative? Submit ideas to assist the candidate prep community.
        </p>

        {suggestionSuccess && (
          <div className="wobbly-sm border-2 border-[var(--color-success)] bg-green-50 p-3 mb-4 text-sm text-[var(--color-success)]">
            {suggestionSuccess}
          </div>
        )}

        {suggestionError && (
          <div className="wobbly-sm border-2 border-[var(--color-error)] bg-red-50 p-3 mb-4 text-sm text-[var(--color-error)]">
            ⚠️ {suggestionError}
          </div>
        )}

        <form onSubmit={handleSuggestionSubmit} className="space-y-4">
          <div className="flex flex-col gap-1.5 ph-no-autocapture">
            <textarea
              rows={3}
              required
              placeholder="Paste alternate code block, worked STAR steps, or describe the correction..."
              className={[
                "wobbly-sm border-2 px-4 py-2.5 bg-[var(--color-bg)] text-[var(--color-fg)] font-[family-name:var(--font-body)] border-[var(--color-border)]",
              ].join(" ")}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isSending}
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              isLoading={isSending}
              className="font-[family-name:var(--font-heading)] font-bold text-sm"
            >
              Submit Idea
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
