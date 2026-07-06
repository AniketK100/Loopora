/**
 * Design System Showcase — Client Component
 *
 * Interactive preview of all components with live state management.
 * Separated from the page.tsx server component so interactive
 * elements (accordion, toggles) work correctly.
 *
 * @module app/design-system/DesignSystemShowcase
 */

"use client";

import React, { useState } from "react";
import {
  Button,
  Card,
  Input,
  Badge,
  RankTab,
  Accordion,
  Select,
  Toggle,
} from "@/components/ui";
import type { AccordionItem } from "@/components/ui";

export function DesignSystemShowcase() {
  const [toggleStates, setToggleStates] = useState({
    sm: false,
    md: true,
  });

  const accordionItems: AccordionItem[] = [
    {
      id: "q1",
      trigger: (
        <div className="flex items-center gap-3">
          <RankTab rank={1} />
          <span className="font-bold" style={{ fontFamily: "var(--font-body)" }}>
            Tell me about yourself
          </span>
          <Badge variant="difficulty-easy">Easy</Badge>
        </div>
      ),
      content: (
        <p style={{ fontFamily: "var(--font-body)" }}>
          This is the most frequently asked HR question. A good answer follows a
          Present-Past-Future structure: start with your current role, briefly
          mention relevant past experience, and connect to why you&apos;re
          excited about this opportunity.
        </p>
      ),
    },
    {
      id: "q2",
      trigger: (
        <div className="flex items-center gap-3">
          <RankTab rank={2} />
          <span className="font-bold" style={{ fontFamily: "var(--font-body)" }}>
            What are your strengths and weaknesses?
          </span>
          <Badge variant="difficulty-medium">Medium</Badge>
        </div>
      ),
      content: (
        <p style={{ fontFamily: "var(--font-body)" }}>
          Pick a genuine strength with a concrete example. For weaknesses, choose
          something real but show how you&apos;re actively improving.
          Avoid clichés like &quot;I&apos;m a perfectionist.&quot;
        </p>
      ),
    },
    {
      id: "q3",
      trigger: (
        <div className="flex items-center gap-3">
          <RankTab rank={3} />
          <span className="font-bold" style={{ fontFamily: "var(--font-body)" }}>
            Explain the concept of closures in JavaScript
          </span>
          <Badge variant="difficulty-hard">Hard</Badge>
        </div>
      ),
      content: (
        <p style={{ fontFamily: "var(--font-body)" }}>
          A closure is a function that retains access to its lexical scope even
          when executed outside that scope. This enables powerful patterns like
          data privacy, function factories, and callback management.
        </p>
      ),
    },
    {
      id: "q4-disabled",
      disabled: true,
      trigger: (
        <div className="flex items-center gap-3">
          <span className="font-bold" style={{ fontFamily: "var(--font-body)" }}>
            Premium Question (locked)
          </span>
          <Badge variant="warning">Premium</Badge>
        </div>
      ),
      content: <p>This content is locked.</p>,
    },
  ];

  return (
    <div className="space-y-16">
      {/* ================================================================
          SECTION: Color Palette
          ================================================================ */}
      <section>
        <SectionTitle>Color Palette</SectionTitle>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {[
            { name: "Background", var: "--color-bg", text: "dark" },
            { name: "Background Alt", var: "--color-bg-alt", text: "dark" },
            { name: "Foreground", var: "--color-fg", text: "light" },
            { name: "Muted", var: "--color-muted", text: "dark" },
            { name: "Accent (Red)", var: "--color-accent", text: "light" },
            { name: "Secondary (Blue)", var: "--color-secondary", text: "light" },
            { name: "Post-it Yellow", var: "--color-post-it", text: "dark" },
            { name: "Border", var: "--color-border", text: "light" },
            { name: "Success", var: "--color-success", text: "light" },
            { name: "Warning", var: "--color-warning", text: "dark" },
          ].map((color) => (
            <div key={color.var} className="text-center">
              <div
                className="wobbly-sm border-2 border-[var(--color-border)] h-16 mb-2"
                style={{ backgroundColor: `var(${color.var})` }}
              />
              <p className="text-xs font-bold" style={{ fontFamily: "var(--font-heading)" }}>
                {color.name}
              </p>
              <p className="text-xs" style={{ color: "var(--color-fg-muted)" }}>
                {color.var}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================================
          SECTION: Typography
          ================================================================ */}
      <section>
        <SectionTitle>Typography</SectionTitle>
        <div className="space-y-4">
          <div>
            <p className="text-xs text-[var(--color-fg-muted)] mb-1">
              font-heading (Kalam)
            </p>
            <p className="text-3xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
              The quick brown fox jumps over the lazy dog
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--color-fg-muted)] mb-1">
              font-body (Patrick Hand)
            </p>
            <p className="text-xl" style={{ fontFamily: "var(--font-body)" }}>
              The quick brown fox jumps over the lazy dog
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--color-fg-muted)] mb-1">
              font-mono (monospace)
            </p>
            <p className="text-base" style={{ fontFamily: "var(--font-mono)" }}>
              const answer = &quot;Hello, World!&quot;;
            </p>
          </div>
        </div>
      </section>

      {/* ================================================================
          SECTION: Buttons
          ================================================================ */}
      <section>
        <SectionTitle>Buttons</SectionTitle>

        <div className="space-y-6">
          {/* Variants */}
          <div>
            <SubTitle>Variants</SubTitle>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
          </div>

          {/* Sizes */}
          <div>
            <SubTitle>Sizes</SubTitle>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>
          </div>

          {/* States */}
          <div>
            <SubTitle>States</SubTitle>
            <div className="flex flex-wrap items-center gap-3">
              <Button>Default</Button>
              <Button disabled>Disabled</Button>
              <Button isLoading>Loading...</Button>
              <Button variant="secondary" isLoading>
                Saving
              </Button>
            </div>
          </div>

          {/* Full Width */}
          <div>
            <SubTitle>Full Width</SubTitle>
            <Button fullWidth>Full Width Button</Button>
          </div>
        </div>
      </section>

      {/* ================================================================
          SECTION: Cards
          ================================================================ */}
      <section>
        <SectionTitle>Cards</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card decoration="none">
            <div className="p-5">
              <h3
                className="text-lg font-bold mb-2"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                No Decoration
              </h3>
              <p style={{ fontFamily: "var(--font-body)" }}>
                Standard wobbly-bordered card with default shadow.
              </p>
            </div>
          </Card>

          <Card decoration="tape" hoverEffect>
            <div className="p-5">
              <h3
                className="text-lg font-bold mb-2"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Tape + Hover
              </h3>
              <p style={{ fontFamily: "var(--font-body)" }}>
                Hover me — I rotate and shadow changes.
              </p>
            </div>
          </Card>

          <Card decoration="tack" isEmphasized>
            <div className="p-5">
              <h3
                className="text-lg font-bold mb-2"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Tack + Emphasized
              </h3>
              <p style={{ fontFamily: "var(--font-body)" }}>
                Strong shadow for expanded/active state.
              </p>
            </div>
          </Card>

          {/* Category cards with footer strips */}
          <Card footerStripColor="var(--color-category-hr)" hoverEffect>
            <div className="p-5 pb-4">
              <h3
                className="text-lg font-bold mb-1"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                HR / General
              </h3>
              <p className="text-sm" style={{ fontFamily: "var(--font-body)", color: "var(--color-fg-muted)" }}>
                45 questions · Red strip
              </p>
            </div>
          </Card>

          <Card footerStripColor="var(--color-category-technical)" hoverEffect>
            <div className="p-5 pb-4">
              <h3
                className="text-lg font-bold mb-1"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Technical
              </h3>
              <p className="text-sm" style={{ fontFamily: "var(--font-body)", color: "var(--color-fg-muted)" }}>
                60 questions · Blue strip
              </p>
            </div>
          </Card>

          <Card footerStripColor="var(--color-category-situational)" hoverEffect>
            <div className="p-5 pb-4">
              <h3
                className="text-lg font-bold mb-1"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Situational
              </h3>
              <p className="text-sm" style={{ fontFamily: "var(--font-body)", color: "var(--color-fg-muted)" }}>
                35 questions · Gold strip
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* ================================================================
          SECTION: Inputs & Select
          ================================================================ */}
      <section>
        <SectionTitle>Inputs & Select</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
          <Input label="Search Questions" placeholder="e.g. tell me about yourself" />
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            helperText="We'll never share your email."
          />
          <Input
            label="With Error"
            placeholder="Required field"
            error="This field is required."
          />
          <Input label="Disabled" placeholder="Can't edit" disabled />
          <Select
            label="Difficulty"
            placeholder="Select difficulty..."
            options={[
              { value: "easy", label: "Easy" },
              { value: "medium", label: "Medium" },
              { value: "hard", label: "Hard" },
            ]}
          />
          <Select
            label="Category"
            options={[
              { value: "hr", label: "HR / General" },
              { value: "technical", label: "Technical" },
              { value: "situational", label: "Situational" },
            ]}
            error="Please select a category."
          />
        </div>
      </section>

      {/* ================================================================
          SECTION: Badges & Rank Tabs
          ================================================================ */}
      <section>
        <SectionTitle>Badges & Rank Tabs</SectionTitle>
        <div className="space-y-4">
          <div>
            <SubTitle>Badge Variants</SubTitle>
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">Default</Badge>
              <Badge variant="accent">Accent</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="difficulty-easy">Easy</Badge>
              <Badge variant="difficulty-medium">Medium</Badge>
              <Badge variant="difficulty-hard">Hard</Badge>
            </div>
          </div>
          <div>
            <SubTitle>Rank Tabs</SubTitle>
            <div className="flex flex-wrap gap-3">
              <RankTab rank={1} />
              <RankTab rank={2} />
              <RankTab rank={3} />
              <RankTab rank={10} />
              <RankTab rank={50} />
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          SECTION: Toggle
          ================================================================ */}
      <section>
        <SectionTitle>Toggles</SectionTitle>
        <div className="space-y-3">
          <Toggle
            size="sm"
            checked={toggleStates.sm}
            onChange={(v) => setToggleStates((s) => ({ ...s, sm: v }))}
            label={`Small toggle: ${toggleStates.sm ? "ON" : "OFF"}`}
          />
          <Toggle
            size="md"
            checked={toggleStates.md}
            onChange={(v) => setToggleStates((s) => ({ ...s, md: v }))}
            label={`Medium toggle: ${toggleStates.md ? "ON" : "OFF"}`}
          />
          <Toggle
            checked={false}
            onChange={() => {}}
            disabled
            label="Disabled toggle"
          />
        </div>
      </section>

      {/* ================================================================
          SECTION: Accordion
          ================================================================ */}
      <section>
        <SectionTitle>Accordion (Single-Open Mode)</SectionTitle>
        <p
          className="mb-4 text-sm"
          style={{
            fontFamily: "var(--font-body)",
            color: "var(--color-fg-muted)",
          }}
        >
          Navigate with keyboard: ↑↓ arrows between items, Enter/Space to
          toggle, Home/End to jump.
        </p>
        <Accordion items={accordionItems} defaultExpandedId="q1" />
      </section>

      {/* ================================================================
          SECTION: Shadows
          ================================================================ */}
      <section>
        <SectionTitle>Shadows</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { name: "Default", var: "var(--shadow-default)" },
            { name: "Hover", var: "var(--shadow-hover)" },
            { name: "Emphasized", var: "var(--shadow-emphasized)" },
            { name: "Button Active", var: "var(--shadow-button-active)" },
          ].map((shadow) => (
            <div
              key={shadow.name}
              className="wobbly-sm border-2 border-[var(--color-border)] bg-[var(--color-bg)] p-6 text-center"
              style={{ boxShadow: shadow.var }}
            >
              <p className="font-bold text-sm" style={{ fontFamily: "var(--font-heading)" }}>
                {shadow.name}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================================
          SECTION: Wobbly Border Variants
          ================================================================ */}
      <section>
        <SectionTitle>Wobbly Border Variants</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { name: "wobbly", cls: "wobbly" },
            { name: "wobbly-md", cls: "wobbly-md" },
            { name: "wobbly-sm", cls: "wobbly-sm" },
            { name: "wobbly-lg", cls: "wobbly-lg" },
          ].map((w) => (
            <div
              key={w.name}
              className={`${w.cls} border-2 border-[var(--color-border)] bg-[var(--color-bg)] p-6 text-center`}
              style={{ boxShadow: "var(--shadow-default)" }}
            >
              <p className="font-bold text-sm" style={{ fontFamily: "var(--font-heading)" }}>
                {w.name}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// =============================================================================
// Helper components for section layout
// =============================================================================

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-2xl font-bold mb-6 pb-2 border-b-2 border-dashed border-[var(--color-border-light)]"
      style={{ fontFamily: "var(--font-heading)" }}
    >
      {children}
    </h2>
  );
}

function SubTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3
      className="text-sm font-bold mb-2 text-[var(--color-fg-muted)]"
      style={{ fontFamily: "var(--font-heading)" }}
    >
      {children}
    </h3>
  );
}
