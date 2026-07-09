/**
 * AccordionAnswerContent Component
 *
 * Renders the full inline content for an accordion item:
 * - Short Summary
 * - Detailed Model Explanation
 * - Personalized Answer (from user's resume)
 * - Worked Example (STAR format)
 * - Resources (links)
 * - Tags
 *
 * @module app/(public)/interview/[categorySlug]/AccordionAnswerContent
 */

"use client";

import React from "react";
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
}: AccordionAnswerContentProps) {
  const isLocked = isPremium && !userHasPremium;

  return (
    <div className="space-y-5 pt-2">
      {/* Short Summary */}
      {answer.short ? (
        <div className="bg-[var(--color-bg-alt)]/30 p-4 border border-dashed border-[var(--color-border-light)] wobbly-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-fg-muted)] font-[family-name:var(--font-heading)] mb-1">
            🔑 Short Summary
          </p>
          <p className="text-base text-[var(--color-fg)] italic font-[family-name:var(--font-body)]">
            &ldquo;{answer.short}&rdquo;
          </p>
        </div>
      ) : (
        <p className="text-sm italic text-gray-400 font-[family-name:var(--font-body)]">
          No preview summary available.
        </p>
      )}

      {/* Detailed Model Explanation */}
      {answer.detailed ? (
        isLocked ? (
          <div className="wobbly border-2 border-[var(--color-warning)] bg-amber-50/50 p-4 text-center space-y-2">
            <span className="text-2xl" role="img" aria-label="Padlock">🔒</span>
            <p className="text-sm font-bold text-[var(--color-fg)] font-[family-name:var(--font-heading)]">
              Premium Content
            </p>
            <p className="text-xs text-[var(--color-fg-muted)] font-[family-name:var(--font-body)]">
              This detailed solution requires a Premium subscription.
            </p>
          </div>
        ) : (
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-fg-muted)] font-[family-name:var(--font-heading)] mb-2">
              💡 Detailed Model Explanation
            </p>
            <div
              className="text-base text-[var(--color-fg)] leading-relaxed space-y-3 font-[family-name:var(--font-body)] bg-[var(--color-bg)] border-2 border-[var(--color-border-light)] wobbly-sm p-4"
              dangerouslySetInnerHTML={{ __html: answer.detailed }}
            />
          </div>
        )
      ) : null}

      {/* Personalized Answer */}
      {personalizedAnswer ? (
        <div className="bg-[var(--color-bg-alt)]/20 p-4 border-2 border-[var(--color-accent)]/30 wobbly-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-accent)] font-[family-name:var(--font-heading)] mb-2">
            🎯 Personalized Answer (Based on Your Resume)
          </p>
          <div
            className="text-sm text-[var(--color-fg)] leading-relaxed space-y-2 font-[family-name:var(--font-body)]"
            dangerouslySetInnerHTML={{ 
              __html: typeof personalizedAnswer === "string" 
                ? personalizedAnswer 
                : personalizedAnswer.answer 
            }}
          />
          {typeof personalizedAnswer === "object" && personalizedAnswer.updatedAt && (
            <p className="text-xs text-[var(--color-fg-muted)] mt-3 font-[family-name:var(--font-body)]">
              Generated: {new Date(personalizedAnswer.updatedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      ) : null}

      {/* Worked Example */}
      {answer.example ? (
        isLocked ? (
          <div className="wobbly border-2 border-[var(--color-warning)] bg-amber-50/50 p-4 text-center space-y-2">
            <span className="text-2xl" role="img" aria-label="Padlock">🔒</span>
            <p className="text-sm font-bold text-[var(--color-fg)] font-[family-name:var(--font-heading)]">
              Premium Worked Example
            </p>
            <p className="text-xs text-[var(--color-fg-muted)] font-[family-name:var(--font-body)]">
              This worked example requires a Premium subscription.
            </p>
          </div>
        ) : (
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-fg-muted)] font-[family-name:var(--font-heading)] mb-2">
              📝 Worked Example (STAR Format)
            </p>
            <div
              className="text-sm text-[var(--color-fg)] leading-relaxed space-y-3 font-[family-name:var(--font-body)] bg-[var(--color-bg)] border-2 border-[var(--color-border-light)] wobbly-sm p-4"
              dangerouslySetInnerHTML={{ __html: answer.example }}
            />
          </div>
        )
      ) : null}

      {/* Resources */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-fg-muted)] font-[family-name:var(--font-heading)] mb-2">
          📚 Resources
        </p>
        {resources && resources.length > 0 ? (
          <div className="space-y-1.5">
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-3 border-t border-[var(--color-border-light)]">
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
