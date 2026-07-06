/**
 * BulkImportForm Client Component — Admin Content Loader
 *
 * Provides a text editor console supporting:
 * 1. JSON seeding inputs (structured with categories/questions).
 * 2. Pre-import JSON schema syntax validation.
 * 3. Detailed response reporting showing successes and skipped errors.
 *
 * @module app/(admin)/admin/bulk-import/BulkImportForm
 */

"use client";

import React, { useState } from "react";
import { Button, Card } from "@/components/ui";

export function BulkImportForm() {
  const [jsonText, setJsonText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [importReport, setImportReport] = useState<{
    categoriesCreated: number;
    categoriesSkipped: number;
    questionsCreated: number;
    questionsSkipped: number;
    errors: string[];
  } | null>(null);

  // Set template example helper to make administrator experience easy
  const handleInsertTemplate = () => {
    const template = {
      categories: [
        {
          name: "System Design",
          slug: "system-design",
          type: "technical",
          icon: "Cpu",
          order: 3,
          description: "Distributed systems, database scaling, API caching, and microservices.",
          isPublished: true
        }
      ],
      questions: [
        {
          categorySlug: "system-design",
          slug: "scale-sql-database",
          question: "How do you scale a SQL database?",
          answer: {
            short: "Scale database reads via replicas, scale writes via partitioning/sharding, and apply caching.",
            detailed: "<p>Scaling a SQL database requires different strategies for reads vs writes:</p><ul><li>Read Replicas: Direct read queries to replicas.</li><li>Sharding: Partition tables across servers.</li></ul>",
            example: "Situation: Our product experienced a 5x increase in traffic... Action: I set up read replicas and sharded the main database... Result: Latency fell by 40%."
          },
          difficulty: "hard",
          frequencyRank: 1,
          tags: ["sql", "scaling", "architecture"],
          isPremium: true,
          isPublished: true
        }
      ]
    };
    setJsonText(JSON.stringify(template, null, 2));
    setError(null);
    setSuccess(null);
    setImportReport(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setImportReport(null);
    setIsLoading(true);

    let parsedPayload;
    try {
      parsedPayload = JSON.parse(jsonText.trim());
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Invalid JSON formatting";
      setError(`JSON Parse Error: ${msg}. Please ensure your syntax is correct.`);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/bulk-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsedPayload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to execute bulk import.");
        setIsLoading(false);
        return;
      }

      setSuccess(data.message || "Bulk import executed successfully.");
      setImportReport(data.data);
    } catch {
      setError("A network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-[family-name:var(--font-body)]">
      <Card decoration="none" className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h3 className="text-lg font-bold font-[family-name:var(--font-heading)]">
            📥 Import JSON Console
          </h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleInsertTemplate}
            disabled={isLoading}
            className="font-bold text-xs"
          >
            📋 Insert Sample Template
          </Button>
        </div>

        {error && (
          <div className="wobbly-sm border-2 border-[var(--color-error)] bg-red-50 p-3 mb-6 text-sm text-[var(--color-error)]">
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div className="wobbly-sm border-2 border-[var(--color-success)] bg-green-50 p-3 mb-6 text-sm text-[var(--color-success)]">
            🎉 {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="jsonPayload" className="text-sm font-bold font-[family-name:var(--font-heading)] text-[var(--color-fg)]">
              JSON Seeding Payload
            </label>
            <textarea
              id="jsonPayload"
              rows={12}
              required
              placeholder="Paste raw JSON array structured with categories and questions here..."
              className={[
                "wobbly-sm border-2 px-4 py-2.5 bg-[var(--color-bg)] text-[var(--color-fg)] font-mono text-sm",
                "border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]",
              ].join(" ")}
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t-2 border-dashed border-[var(--color-border-light)]">
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="font-[family-name:var(--font-heading)] font-bold text-base"
            >
              Start Bulk Import
            </Button>
          </div>
        </form>
      </Card>

      {/* Detailed Import Report Details */}
      {importReport && (
        <Card decoration="none" className="p-6 bg-[var(--color-bg-alt)]/20 border-dashed">
          <h4 className="text-md font-bold font-[family-name:var(--font-heading)] mb-3">
            📋 Execution Audit Report
          </h4>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-6">
            <div className="p-3 bg-white wobbly-sm border border-[var(--color-border-light)]">
              <p className="text-xs text-[var(--color-fg-muted)]">Cat Created</p>
              <p className="text-2xl font-bold text-[var(--color-success)] mt-1">{importReport.categoriesCreated}</p>
            </div>
            <div className="p-3 bg-white wobbly-sm border border-[var(--color-border-light)]">
              <p className="text-xs text-[var(--color-fg-muted)]">Cat Skipped</p>
              <p className="text-2xl font-bold text-[var(--color-fg-muted)] mt-1">{importReport.categoriesSkipped}</p>
            </div>
            <div className="p-3 bg-white wobbly-sm border border-[var(--color-border-light)]">
              <p className="text-xs text-[var(--color-fg-muted)]">Q&A Created</p>
              <p className="text-2xl font-bold text-[var(--color-success)] mt-1">{importReport.questionsCreated}</p>
            </div>
            <div className="p-3 bg-white wobbly-sm border border-[var(--color-border-light)]">
              <p className="text-xs text-[var(--color-fg-muted)]">Q&A Skipped</p>
              <p className="text-2xl font-bold text-[var(--color-fg-muted)] mt-1">{importReport.questionsSkipped}</p>
            </div>
          </div>

          {importReport.errors.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-bold text-[var(--color-error)]">Skipped Items & Warnings:</p>
              <ul className="list-disc pl-5 text-xs text-[var(--color-error)] space-y-1 font-mono bg-red-50/50 p-3 wobbly-sm border border-red-200">
                {importReport.errors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
