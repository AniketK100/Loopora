/**
 * Loopora Landing Page — Server Component
 *
 * Renders the candidate-facing homepage featuring:
 * 1. Animated Hero Banner with wobbly CTA buttons.
 * 2. Sticky Post-It Wall showcasing typical interview questions.
 * 3. Interactive features card grid.
 *
 * Consumes framer-motion client wrapper for interactive elements.
 *
 * @route /
 * @see 04_UIUX_Design_Brief.md §1 — Design Direction
 */

import React from "react";
import Link from "next/link";
import { connectDB } from "@/lib/db/connection";
import { Category } from "@/lib/db/models/Category";
import { Question } from "@/lib/db/models/Question";
import { Card, Button, Badge } from "@/components/ui";
import { LandingMotionWrapper } from "./LandingMotionWrapper";

export const metadata = {
  description:
    "Ace your interviews with Loopora's curated Q&A lists, worked examples, and video walkthroughs.",
};

export default async function PublicHomePage() {
  await connectDB();

  // Retrieve counts to show live stats
  const [totalQuestions, totalCategories] = await Promise.all([
    Question.countDocuments({ isPublished: true }),
    Category.countDocuments({ isPublished: true }),
  ]);

  return (
    <div className="paper-grain min-h-screen flex flex-col items-center">
      {/* 1. Hero Section */}
      <section className="max-w-4xl mx-auto px-4 pt-16 pb-12 text-center space-y-6">
        <LandingMotionWrapper type="hero">
          <Badge variant="accent" className="mb-4 text-base tracking-wider uppercase">
            ✏️ Notebook Prep
          </Badge>
          <h1
            className="text-5xl md:text-7xl font-bold tracking-tight text-[var(--color-fg)] leading-tight"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Master the Interview, <br />
            <span className="text-[var(--color-accent)]">One Loop</span> at a Time.
          </h1>
          <p
            className="text-lg md:text-xl text-[var(--color-fg-muted)] max-w-2xl mx-auto mt-4 font-[family-name:var(--font-body)]"
          >
            Ditch generic dumps. Loopora organizes interview questions into wobbly notebook folders with clear explanations, worked STAR examples, and video tutorial layers.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-6">
            <Link href="/interview">
              <Button variant="primary" className="text-lg py-3 px-8 font-[family-name:var(--font-heading)] font-bold shadow-lg">
                Explore Questions Library &rarr;
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="text-lg py-3 px-8 font-[family-name:var(--font-heading)] font-bold">
                Join Free
              </Button>
            </Link>
          </div>
        </LandingMotionWrapper>
      </section>

      {/* 2. Interactive Stats Strip */}
      <section className="w-full bg-[var(--color-bg-alt)] border-y-2 border-[var(--color-border)] py-8 my-8">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center font-[family-name:var(--font-heading)] font-bold">
          <div>
            <p className="text-3xl text-[var(--color-accent)]">{totalQuestions}+</p>
            <p className="text-xs uppercase text-[var(--color-fg-muted)] font-[family-name:var(--font-body)] mt-1">Curated Questions</p>
          </div>
          <div>
            <p className="text-3xl text-[var(--color-secondary)]">{totalCategories}</p>
            <p className="text-xs uppercase text-[var(--color-fg-muted)] font-[family-name:var(--font-body)] mt-1">Interview Folders</p>
          </div>
          <div>
            <p className="text-3xl text-[var(--color-success)]">100%</p>
            <p className="text-xs uppercase text-[var(--color-fg-muted)] font-[family-name:var(--font-body)] mt-1">Verified Answers</p>
          </div>
          <div>
            <p className="text-3xl text-[var(--color-warning)]">STAR</p>
            <p className="text-xs uppercase text-[var(--color-fg-muted)] font-[family-name:var(--font-body)] mt-1">Worked Breakdowns</p>
          </div>
        </div>
      </section>

      {/* 3. Sticky Post-It Wall Section */}
      <section className="max-w-6xl mx-auto px-4 py-12 space-y-8 w-full">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold font-[family-name:var(--font-heading)] text-[var(--color-fg)]">
            📌 Common Interview Questions
          </h2>
          <p className="text-base text-[var(--color-fg-muted)] font-[family-name:var(--font-body)]">
            A sneak-peek of questions from our folders. Ace behavioral, design, and coding queries.
          </p>
        </div>

        <LandingMotionWrapper type="post-its">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
            {/* Post-it 1 */}
            <div className="rotate-[-1.5deg] hover:rotate-0 transition-transform">
              <Card footerStripColor="var(--color-post-it-dark)" style={{ backgroundColor: "var(--color-post-it)" }}>
                <div className="p-6 h-56 flex flex-col justify-between">
                  <div>
                    <Badge variant="accent" className="text-xs">Behavioral</Badge>
                    <p className="text-lg font-bold font-[family-name:var(--font-heading)] text-[var(--color-fg)] mt-3">
                      &ldquo;Tell me about a time you disagreed with a decision.&rdquo;
                    </p>
                  </div>
                  <span className="text-xs text-[var(--color-fg-muted)] font-bold">HR Folder &rarr;</span>
                </div>
              </Card>
            </div>

            {/* Post-it 2 */}
            <div className="rotate-[2deg] hover:rotate-0 transition-transform">
              <Card footerStripColor="var(--color-secondary)" style={{ backgroundColor: "var(--color-bg)" }}>
                <div className="p-6 h-56 flex flex-col justify-between">
                  <div>
                    <Badge variant="secondary" className="text-xs">System Design</Badge>
                    <p className="text-lg font-bold font-[family-name:var(--font-heading)] text-[var(--color-fg)] mt-3">
                      &ldquo;How would you design a real-time notification push server?&rdquo;
                    </p>
                  </div>
                  <span className="text-xs text-[var(--color-fg-muted)] font-bold">Technical Folder &rarr;</span>
                </div>
              </Card>
            </div>

            {/* Post-it 3 */}
            <div className="rotate-[-1deg] hover:rotate-0 transition-transform">
              <Card footerStripColor="var(--color-success)" style={{ backgroundColor: "var(--color-bg-alt)" }}>
                <div className="p-6 h-56 flex flex-col justify-between">
                  <div>
                    <Badge variant="success" className="text-xs">General</Badge>
                    <p className="text-lg font-bold font-[family-name:var(--font-heading)] text-[var(--color-fg)] mt-3">
                      &ldquo;Why should we hire you over other candidates?&rdquo;
                    </p>
                  </div>
                  <span className="text-xs text-[var(--color-fg-muted)] font-bold">Situational Folder &rarr;</span>
                </div>
              </Card>
            </div>
          </div>
        </LandingMotionWrapper>
      </section>

      {/* 4. Features Card Grid */}
      <section className="max-w-5xl mx-auto px-4 py-16 w-full space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold font-[family-name:var(--font-heading)]">
            🎯 Engineered for Mastery
          </h2>
          <p className="text-base text-[var(--color-fg-muted)] font-[family-name:var(--font-body)]">
            We combined educational design frameworks with clean interactive tools.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card decoration="tape" className="p-6">
            <h3 className="text-xl font-bold font-[family-name:var(--font-heading)] text-[var(--color-fg)]">
              💼 Worked STAR Breakdowns
            </h3>
            <p className="text-sm text-[var(--color-fg-muted)] mt-2 font-[family-name:var(--font-body)]">
              Every situational question includes a mock narrative broken down by Situation, Task, Action, and Result. Learn exactly how to formulate stories that highlight leadership and technical execution.
            </p>
          </Card>

          <Card decoration="tape" className="p-6">
            <h3 className="text-xl font-bold font-[family-name:var(--font-heading)] text-[var(--color-fg)]">
              🎥 Video Switcher Panel
            </h3>
            <p className="text-sm text-[var(--color-fg-muted)] mt-2 font-[family-name:var(--font-body)]">
              Pasted video tutorials from diverse creators (YouTube, Loom, Vimeo, Drive) render in an inline switcher player. Toggle between different presentation styles to find the explanation that clicks.
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
}
