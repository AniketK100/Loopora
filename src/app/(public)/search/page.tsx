/**
 * Search Questions Page — Global Search Interface
 *
 * Client-side search interface with live query execution, paginated results,
 * wobbly search input, loading skeletons, and accordion result renders.
 *
 * @route /search
 */

"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, Input, Button, Badge, Accordion } from "@/components/ui";
import { QuestionListItem, PaginatedResponse } from "@/types";
import { trackEvent } from "@/lib/analytics";

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<QuestionListItem[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
    hasMore: false,
  });

  // Debounce search query to prevent hammering API
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  // Sync search query parameter to URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (debouncedQuery) {
      params.set("q", debouncedQuery);
    } else {
      params.delete("q");
    }
    router.replace(`/search?${params.toString()}`);
  }, [debouncedQuery, router]);

  // Fetch search results on query change
  useEffect(() => {
    async function fetchResults() {
      if (!debouncedQuery.trim()) {
        setResults([]);
        setPagination({
          total: 0,
          page: 1,
          limit: 20,
          totalPages: 0,
          hasMore: false,
        });
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}&page=1&limit=20`);
        const json: PaginatedResponse<QuestionListItem> = await res.json();
        if (json.success && json.data) {
          setResults(json.data);
          if (json.pagination) {
            setPagination(json.pagination);
          }
          trackEvent("search_questions", { query: debouncedQuery, resultsCount: json.data.length });
        }
      } catch (err) {
        console.error("[Search] Failed to fetch query results:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchResults();
  }, [debouncedQuery]);

  // Handle Load More
  const loadMore = async () => {
    if (loading || !pagination.hasMore) return;
    setLoading(true);
    try {
      const nextPage = pagination.page + 1;
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(debouncedQuery)}&page=${nextPage}&limit=${pagination.limit}`
      );
      const json: PaginatedResponse<QuestionListItem> = await res.json();
      if (json.success && json.data) {
        setResults((prev) => [...prev, ...json.data]);
        if (json.pagination) {
          setPagination(json.pagination);
        }
      }
    } catch (err) {
      console.error("[Search] Failed to load more results:", err);
    } finally {
      setLoading(false);
    }
  };

  // Convert results to Accordion items
  const accordionItems = results.map((q) => {
    const difficultyBadgeVariant = `difficulty-${q.difficulty}` as
      | "difficulty-easy"
      | "difficulty-medium"
      | "difficulty-hard";

    return {
      id: q._id,
      trigger: (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full pr-4 text-left gap-2 sm:gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-[var(--color-secondary)] uppercase tracking-wider font-mono">
              📁 {q.categoryName || "Uncategorized"}
            </span>
            <span className="font-bold font-[family-name:var(--font-heading)] text-lg text-[var(--color-fg)]">
              {q.question}
            </span>
          </div>
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

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2">
            <span className="text-xs text-[var(--color-fg-muted)] font-mono font-[family-name:var(--font-body)]">
              Tags: {q.tags && q.tags.length > 0 ? q.tags.join(", ") : "none"}
            </span>

            <Link href={`/interview/${q.categorySlug}/${q.slug}`}>
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

  return (
    <div className="paper-grain min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="text-sm font-[family-name:var(--font-heading)] font-bold text-[var(--color-fg-muted)]">
          <Link href="/interview" className="hover:underline">
            &larr; Back to Library
          </Link>
        </div>

        {/* Binder Header Panel */}
        <Card
          decoration="tape"
          className="p-6 md:p-8"
          style={{ borderLeftWidth: "6px", borderLeftColor: "var(--color-accent)" }}
        >
          <div>
            <span className="capitalize text-xs font-bold text-[var(--color-fg-muted)] font-[family-name:var(--font-body)]">
              🔍 Global Search
            </span>
            <h1
              className="text-3xl md:text-4xl font-bold text-[var(--color-fg)] mt-1"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Search Questions & Answers
            </h1>
            <p className="text-base text-[var(--color-fg-muted)] mt-2 max-w-2xl font-[family-name:var(--font-body)]">
              Search across all published categories, detailed model solutions, and topic tags.
            </p>
          </div>
        </Card>

        {/* Search Input Box */}
        <div className="bg-[var(--color-bg)] border-2 border-[var(--color-border)] wobbly-sm p-4">
          <Input
            placeholder="Type key terms, e.g. recursion, database, behavioral..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="text-lg"
          />
        </div>

        {/* Search Results */}
        <div className="space-y-6">
          {loading && results.length === 0 ? (
            // Skeleton loader state
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="bg-[var(--color-bg)] border-2 border-[var(--color-border)] wobbly-sm p-6 animate-pulse space-y-3"
                >
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : results.length === 0 ? (
            debouncedQuery ? (
              <div className="text-center py-12 bg-[var(--color-bg)] border-2 border-dashed border-[var(--color-border-light)] wobbly-sm text-[var(--color-fg-muted)] font-[family-name:var(--font-body)]">
                No questions match &ldquo;{debouncedQuery}&rdquo;. Try another term.
              </div>
            ) : (
              <div className="text-center py-12 bg-[var(--color-bg)] border-2 border-dashed border-[var(--color-border-light)] wobbly-sm text-[var(--color-fg-muted)] font-[family-name:var(--font-body)]">
                Enter search terms above to start querying the notebook.
              </div>
            )
          ) : (
            <div className="space-y-6">
              <Accordion
                items={accordionItems}
                onExpandedChange={(ids) => {
                  if (ids.length > 0) {
                    const expandedId = ids[ids.length - 1];
                    const matchingQ = results.find((q) => q._id === expandedId);
                    if (matchingQ) {
                      trackEvent("expand_question", {
                        categorySlug: matchingQ.categorySlug,
                        questionSlug: matchingQ.slug,
                        isPremium: matchingQ.isPremium,
                        source: "global_search",
                      });
                    }
                  }
                }}
              />

              {pagination.hasMore && (
                <div className="flex justify-center pt-4">
                  <Button
                    onClick={loadMore}
                    variant="primary"
                    disabled={loading}
                    className="font-[family-name:var(--font-heading)] font-bold text-base px-6 py-2"
                  >
                    {loading ? "Loading..." : "Load More Results 👇"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="paper-grain min-h-screen py-12 flex items-center justify-center">
          <div className="text-[var(--color-fg-muted)] font-[family-name:var(--font-heading)] text-xl animate-pulse">
            Loading Search Notebook...
          </div>
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
