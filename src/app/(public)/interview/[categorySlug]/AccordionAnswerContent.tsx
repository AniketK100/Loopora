"use client";

import React, { useState } from "react";
import Link from "next/link";

interface PersonalizedAnswer {
  answer: string;
  updatedAt: string;
}

type PersonalizedAnswerData = PersonalizedAnswer | string | null;

interface AccordionAnswerContentProps {
  questionId: string;
  slug: string;
  categorySlug: string;
  answer: {
    short?: string;
    detailed: string;
    example?: string;
  };
  isPremium: boolean;
  userHasPremium: boolean;
  tags: string[];
  resources?: { title: string; url: string }[];
  personalizedAnswer?: PersonalizedAnswerData;
  resumeName?: string | null;
  hasResume?: boolean;
  isGenerating?: boolean;
}

function CollapsibleSection({
  defaultOpen,
  icon,
  title,
  badge,
  children,
}: {
  defaultOpen: boolean;
  icon: string;
  title: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-[var(--color-border-light)] wobbly-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-2 px-4 py-2.5 bg-[var(--color-bg-alt)]/20 hover:bg-[var(--color-bg-alt)]/40 transition-colors text-left"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm shrink-0">{icon}</span>
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-fg-muted)] font-[family-name:var(--font-heading)]">
            {title}
          </span>
          {badge}
        </div>
        <span className={`text-xs text-[var(--color-fg-muted)] transition-transform duration-200 shrink-0 ${open ? "rotate-180" : ""}`}>
          ▼
        </span>
      </button>
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          open ? "max-h-[9999px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="p-4 border-t border-[var(--color-border-light)]">
          {children}
        </div>
      </div>
    </div>
  );
}

export function AccordionAnswerContent({
  slug,
  categorySlug,
  answer,
  isPremium,
  userHasPremium,
  tags,
  resources,
  personalizedAnswer,
  resumeName,
  hasResume,
  isGenerating,
}: AccordionAnswerContentProps) {
  const isLocked = isPremium && !userHasPremium;

  return (
    <div className="space-y-3 pt-2">
      {/* Short Summary */}
      <CollapsibleSection defaultOpen icon="🔑" title="Short Summary">
        {answer.short ? (
          <p className="text-base text-[var(--color-fg)] italic font-[family-name:var(--font-body)]">
            &ldquo;{answer.short}&rdquo;
          </p>
        ) : (
          <p className="text-sm italic text-gray-400 font-[family-name:var(--font-body)]">
            No preview summary available.
          </p>
        )}
      </CollapsibleSection>

      {/* Detailed Model Explanation */}
      <CollapsibleSection defaultOpen icon="💡" title="Detailed Model Explanation">
        {isLocked ? (
          <div className="text-center space-y-2 py-4">
            <span className="text-2xl" role="img" aria-label="Padlock">🔒</span>
            <p className="text-sm font-bold text-[var(--color-fg)] font-[family-name:var(--font-heading)]">
              Premium Content
            </p>
            <p className="text-xs text-[var(--color-fg-muted)] font-[family-name:var(--font-body)]">
              This detailed solution requires a Premium subscription.
            </p>
          </div>
        ) : (
          <div
            className="text-base text-[var(--color-fg)] leading-relaxed space-y-3 font-[family-name:var(--font-body)] break-words [&_pre]:overflow-x-auto [&_table]:overflow-x-auto [&_img]:max-w-full"
            dangerouslySetInnerHTML={{ __html: answer.detailed }}
          />
        )}
      </CollapsibleSection>

      {/* Personalized Answer */}
      <CollapsibleSection
        defaultOpen={!!personalizedAnswer}
        icon="🎯"
        title="Personalized Answer"
        badge={
          personalizedAnswer ? (
            <span className="inline-block px-1.5 py-0.5 text-[10px] font-bold bg-green-100 text-green-800 border border-green-300 wobbly-sm shrink-0">
              ✓ Based on your uploaded resume
            </span>
          ) : null
        }
      >
        {isGenerating ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-3 bg-[var(--color-border-light)] rounded w-3/4" />
            <div className="h-3 bg-[var(--color-border-light)] rounded w-1/2" />
            <div className="h-3 bg-[var(--color-border-light)] rounded w-5/6" />
            <div className="h-3 bg-[var(--color-border-light)] rounded w-2/3" />
            <p className="text-xs text-[var(--color-fg-muted)] mt-2 font-[family-name:var(--font-body)]">
              Generating personalized answer...
            </p>
          </div>
        ) : personalizedAnswer ? (
          <div>
            {/* Metadata row */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-3 pb-2 border-b border-dashed border-[var(--color-border-light)] text-[11px] text-[var(--color-fg-muted)] font-[family-name:var(--font-body)]">
              {resumeName && (
                <span className="flex items-center gap-1">
                  <span>📄</span>
                  <span>Resume: {resumeName}</span>
                </span>
              )}
              {typeof personalizedAnswer === "object" && personalizedAnswer.updatedAt && (
                <span className="flex items-center gap-1">
                  <span>⏱️</span>
                  <span>
                    Generated:{" "}
                    {new Date(personalizedAnswer.updatedAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </span>
              )}
              <span className="flex items-center gap-1 text-green-700">
                <span>✓</span>
                <span>Cached</span>
              </span>
            </div>
            <div
              className="text-sm text-[var(--color-fg)] leading-relaxed space-y-2 font-[family-name:var(--font-body)] break-words [&_pre]:overflow-x-auto [&_table]:overflow-x-auto [&_img]:max-w-full"
              dangerouslySetInnerHTML={{
                __html: typeof personalizedAnswer === "string"
                  ? personalizedAnswer
                  : personalizedAnswer.answer,
              }}
            />
          </div>
        ) : !hasResume ? (
          <div className="text-center py-6 space-y-3">
            <span className="text-3xl">📄</span>
            <p className="text-sm text-[var(--color-fg-muted)] font-[family-name:var(--font-body)]">
              Upload a resume to receive AI personalized answers.
            </p>
            <Link
              href="/interview"
              className="inline-block px-4 py-2 text-xs font-bold text-[var(--color-bg)] bg-[var(--color-accent)] wobbly-sm hover:opacity-90 transition-opacity font-[family-name:var(--font-heading)]"
            >
              Upload Resume →
            </Link>
          </div>
        ) : (
          <p className="text-sm text-[var(--color-fg-muted)] italic font-[family-name:var(--font-body)]">
            Select interview folders to generate personalized answers based on your resume.
          </p>
        )}
      </CollapsibleSection>

      {/* Worked Example (STAR) — only for non-locked content */}
      {!isLocked && answer.example ? (
        <CollapsibleSection defaultOpen icon="📝" title="Worked Example (STAR Format)">
          <div
            className="text-sm text-[var(--color-fg)] leading-relaxed space-y-3 font-[family-name:var(--font-body)] break-words [&_pre]:overflow-x-auto [&_table]:overflow-x-auto [&_img]:max-w-full"
            dangerouslySetInnerHTML={{ __html: answer.example }}
          />
        </CollapsibleSection>
      ) : isLocked && answer.example ? (
        <div className="border border-[var(--color-border-light)] wobbly-sm px-4 py-2.5 text-center space-y-2">
          <span className="text-lg" role="img" aria-label="Padlock">🔒</span>
          <p className="text-xs font-bold text-[var(--color-fg)] font-[family-name:var(--font-heading)]">
            Premium Worked Example
          </p>
          <p className="text-xs text-[var(--color-fg-muted)] font-[family-name:var(--font-body)]">
            This worked example requires a Premium subscription.
          </p>
        </div>
      ) : null}

      {/* Resources */}
      <div className="border border-[var(--color-border-light)] wobbly-sm px-4 py-2.5">
        <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-fg-muted)] font-[family-name:var(--font-heading)] mb-1">
          📚 Resources
        </p>
        {resources && resources.length > 0 ? (
          <div className="space-y-1">
            {resources.map((resource, index) => (
              <a
                key={index}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-[var(--color-accent)] hover:underline font-[family-name:var(--font-body)]"
              >
                <span className="shrink-0">🔗</span>
                <span>{resource.title}</span>
              </a>
            ))}
          </div>
        ) : (
          <p className="text-sm italic text-gray-400 font-[family-name:var(--font-body)]">
            No resources available.
          </p>
        )}
      </div>

      {/* Tags & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2">
        <div className="flex flex-wrap gap-1.5">
          {tags.length > 0 ? (
            tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-xs bg-[var(--color-bg-alt)]/30 border border-[var(--color-border-light)] text-[var(--color-fg-muted)] font-[family-name:var(--font-body)]"
              >
                {tag}
              </span>
            ))
          ) : (
            <span className="text-xs text-[var(--color-fg-muted)] font-[family-name:var(--font-body)]">
              No tags
            </span>
          )}
        </div>

        <Link
          href={`/interview/${categorySlug}/${slug}`}
          className="text-xs font-bold text-[var(--color-accent)] hover:underline font-[family-name:var(--font-heading)] whitespace-nowrap"
        >
          Open dedicated page ↗
        </Link>
      </div>
    </div>
  );
}
