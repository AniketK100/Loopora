/**
 * QuestionForm Client Component — Admin Question Editor
 *
 * Provides a rich-text Q&A editor featuring:
 * 1. Automatic slugification of question text.
 * 2. Comma-separated tags parsing.
 * 3. Dynamic inline video manager with live URL provider validation.
 * 4. Structured STAR template helper link.
 *
 * @module app/(admin)/admin/questions/QuestionForm
 * @see 03_App_Flow.md §5 — Admin Content Flow
 */

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Select, Toggle, Card } from "@/components/ui";
import { Difficulty } from "@/types";
import { parseVideoUrl } from "@/lib/video/parseVideoUrl";

interface QuestionFormProps {
  categories: { _id: string; name: string }[];
  initialData?: {
    _id: string;
    category: string;
    slug: string;
    question: string;
    answer: {
      short?: string;
      detailed: string;
      example?: string;
    };
    videos: { label: string; url: string; order: number }[];
    difficulty: Difficulty;
    frequencyRank: number;
    tags: string[];
    isPremium: boolean;
    isPublished: boolean;
  };
}

interface VideoRow {
  localId: string; // Dynamic unique key for key mapping in list
  label: string;
  url: string;
  order: number;
  status: string; // Live parsed provider status
  embedUrl: string | null;
  embedKind: "iframe" | "video" | null;
  aspectRatio?: string; // Suggested CSS aspect-ratio for the preview box
}

export function QuestionForm({ categories, initialData }: QuestionFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;

  const [question, setQuestion] = useState(initialData?.question || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [category, setCategory] = useState(initialData?.category || categories[0]?._id || "");
  const [difficulty, setDifficulty] = useState<Difficulty>(initialData?.difficulty || "medium");
  const [frequencyRank, setFrequencyRank] = useState<number>(initialData?.frequencyRank || 0);
  const [tagsString, setTagsString] = useState(initialData?.tags.join(", ") || "");
  const [isPremium, setIsPremium] = useState(initialData?.isPremium || false);
  const [isPublished, setIsPublished] = useState(initialData?.isPublished || false);

  // Split answer fields
  const [shortAnswer, setShortAnswer] = useState(initialData?.answer.short || "");
  const [detailedAnswer, setDetailedAnswer] = useState(initialData?.answer.detailed || "");
  const [exampleAnswer, setExampleAnswer] = useState(initialData?.answer.example || "");

  // Video management
  const initialVideos: VideoRow[] = (initialData?.videos || []).map((v, i) => {
    const parsed = parseVideoUrl(v.url);
    return {
      localId: `initial-${i}`,
      label: v.label,
      url: v.url,
      order: v.order,
      status: parsed.status,
      embedUrl: parsed.embedUrl,
      embedKind: parsed.embedKind,
      aspectRatio: parsed.aspectRatio,
    };
  });
  const [videos, setVideos] = useState<VideoRow[]>(initialVideos);

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Parse pasted video URLs on the fly for live provider feedback.
  function resolveVideoRow(url: string): Pick<VideoRow, "status" | "embedUrl" | "embedKind" | "aspectRatio"> {
    const parsed = parseVideoUrl(url);
    return {
      status: parsed.status,
      embedUrl: parsed.embedUrl,
      embedKind: parsed.embedKind,
      aspectRatio: parsed.aspectRatio,
    };
  }

  // Handle live slug generation
  const handleQuestionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuestion(val);
    if (!isEditing) {
      const slugified = val
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .substring(0, 80); // Restrict length
      setSlug(slugified);
    }
  };

  // Video CRUD Helpers
  const addVideoRow = () => {
    setVideos([
      ...videos,
      {
        localId: Math.random().toString(36).substr(2, 9),
        label: "",
        url: "",
        order: videos.length,
        status: "",
        embedUrl: null,
        embedKind: null,
      },
    ]);
  };

  const removeVideoRow = (localId: string) => {
    setVideos(videos.filter((v) => v.localId !== localId));
  };

  const handleVideoChange = (localId: string, field: "label" | "url", value: string) => {
    setVideos(
      videos.map((v) => {
        if (v.localId !== localId) return v;
        const updated = { ...v, [field]: value };
        if (field === "url") {
          const resolved = resolveVideoRow(value);
          updated.status = resolved.status;
          updated.embedUrl = resolved.embedUrl;
          updated.embedKind = resolved.embedKind;
          updated.aspectRatio = resolved.aspectRatio;
        }
        return updated;
      })
    );
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(false);

    // Build the video payload. NEVER silently drop a valid, previewed video:
    // - truly blank rows (no url AND no label) are skipped
    // - a URL with no label auto-defaults to the detected platform name
    // - an invalid/unsupported URL blocks submission with a clear error
    // (Previously the filter `v.url && v.label` discarded any row missing a
    //  label, so a pasted, previewed URL was saved as an empty videos array.)
    const videoErrors: string[] = [];
    const cleanedVideos: { label: string; url: string; order: number }[] = [];
    let videoOrder = 0;
    for (const v of videos) {
      const url = v.url.trim();
      const label = v.label.trim();
      if (!url && !label) continue; // truly blank row
      if (!url) {
        videoErrors.push(`A video row is missing its URL (label "${label}").`);
        continue;
      }
      const parsed = parseVideoUrl(url);
      if (!parsed.ok || !parsed.embedUrl) {
        videoErrors.push(`Video URL "${url}" is not a supported platform.`);
        continue;
      }
      cleanedVideos.push({ label: label || parsed.platformName, url, order: videoOrder++ });
    }

    if (videoErrors.length > 0) {
      setError(videoErrors.join(" "));
      setIsLoading(false);
      return;
    }

    // Parse tags to trim array
    const parsedTags = tagsString
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t !== "");

    const payload = {
      category,
      slug,
      question,
      answer: {
        short: shortAnswer,
        detailed: detailedAnswer,
        example: exampleAnswer,
      },
      videos: cleanedVideos,
      difficulty,
      frequencyRank: Number(frequencyRank),
      tags: parsedTags,
      isPremium,
      isPublished,
    };

    setIsLoading(true);

    try {
      const url = isEditing ? `/api/questions/${initialData._id}` : "/api/questions";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to save question. Please try again.");
        setIsLoading(false);
        return;
      }

      router.push("/admin/questions");
      router.refresh();
    } catch {
      setError("A network error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const categoryOptions = categories.map((c) => ({
    value: c._id,
    label: c.name,
  }));

  const difficultyOptions = [
    { value: "easy", label: "Easy" },
    { value: "medium", label: "Medium" },
    { value: "hard", label: "Hard" },
  ];

  return (
    <Card decoration="none" className="p-6 md:p-8">
      {error && (
        <div className="wobbly-sm border-2 border-[var(--color-error)] bg-red-50 p-3 mb-6 text-sm text-[var(--color-error)] font-[family-name:var(--font-body)]">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Question Prompt"
            placeholder="e.g. Explain the differences between interface and type."
            required
            value={question}
            onChange={handleQuestionChange}
            disabled={isLoading}
          />

          <Input
            label="Slug (lowercase, hyphens)"
            placeholder="e.g. interface-vs-type"
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
            disabled={isLoading}
            helperText="Used in URLs: /interview/category-slug/question-slug"
          />

          <Select
            label="Target Category / Folder"
            options={categoryOptions}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={isLoading}
          />

          <Select
            label="Difficulty Rating"
            options={difficultyOptions}
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            disabled={isLoading}
          />

          <Input
            label="Priority Rank / Sorting Index"
            type="number"
            min="0"
            required
            value={frequencyRank}
            onChange={(e) => setFrequencyRank(Number(e.target.value))}
            disabled={isLoading}
            helperText="Lower ranks float to the top of list filters (drives sorted display order)"
          />

          <Input
            label="Tags (comma separated)"
            placeholder="typescript, OOP, webdev"
            value={tagsString}
            onChange={(e) => setTagsString(e.target.value)}
            disabled={isLoading}
            helperText="Tag keywords driving list filters and search lookups"
          />

          <div className="flex items-center pt-8">
            <Toggle
              checked={isPremium}
              onChange={setIsPremium}
              label="Premium Only (Restricts full details to premium tier users)"
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center pt-8">
            <Toggle
              checked={isPublished}
              onChange={setIsPublished}
              label="Publish Question (makes visible on public pages)"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Answer Explanations */}
        <div className="space-y-6 pt-4 border-t-2 border-dashed border-[var(--color-border-light)]">
          <h3 className="text-xl font-bold font-[family-name:var(--font-heading)]">
            📝 Q&A Explanations
          </h3>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="shortAnswer"
              className="text-sm font-bold font-[family-name:var(--font-heading)] text-[var(--color-fg)]"
            >
              Short Summary Answer (List view preview, max 250 chars)
            </label>
            <textarea
              id="shortAnswer"
              rows={2}
              maxLength={250}
              placeholder="A concise 1-2 sentence overview of the answer..."
              className={[
                "wobbly-sm border-2 px-4 py-2.5 bg-[var(--color-bg)] text-[var(--color-fg)] font-[family-name:var(--font-body)] border-[var(--color-border)]",
              ].join(" ")}
              value={shortAnswer}
              onChange={(e) => setShortAnswer(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="detailedAnswer"
              className="text-sm font-bold font-[family-name:var(--font-heading)] text-[var(--color-fg)]"
            >
              Detailed Answer (Full explanation, supports HTML/Markdown markup)
            </label>
            <textarea
              id="detailedAnswer"
              rows={6}
              required
              placeholder="Describe the solution in detail. Use standard HTML tags (<p>, <ul>, <code>, <table>) for rich formatting..."
              className={[
                "wobbly-sm border-2 px-4 py-2.5 bg-[var(--color-bg)] text-[var(--color-fg)] font-[family-name:var(--font-body)] border-[var(--color-border)]",
              ].join(" ")}
              value={detailedAnswer}
              onChange={(e) => setDetailedAnswer(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label
                htmlFor="exampleAnswer"
                className="text-sm font-bold font-[family-name:var(--font-heading)] text-[var(--color-fg)]"
              >
                Structured worked example / STAR format breakdown (Optional)
              </label>
              <span className="text-xs text-[var(--color-fg-muted)] font-[family-name:var(--font-body)]">
                STAR: Situation, Task, Action, Result
              </span>
            </div>
            <textarea
              id="exampleAnswer"
              rows={4}
              placeholder="Situation: In my last project... Action: I migrated... Result: Performance increased by..."
              className={[
                "wobbly-sm border-2 px-4 py-2.5 bg-[var(--color-bg)] text-[var(--color-fg)] font-[family-name:var(--font-body)] border-[var(--color-border)]",
              ].join(" ")}
              value={exampleAnswer}
              onChange={(e) => setExampleAnswer(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Dynamic Video Manager */}
        <div className="space-y-6 pt-4 border-t-2 border-dashed border-[var(--color-border-light)]">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold font-[family-name:var(--font-heading)]">
              🎥 Video Explanations
            </h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addVideoRow}
              disabled={isLoading}
            >
              + Add Video
            </Button>
          </div>

          {videos.length === 0 ? (
            <p className="text-sm text-[var(--color-fg-muted)] font-[family-name:var(--font-body)]">
              No video tutorials linked yet. Click &quot;+ Add Video&quot; to associate explanations.
            </p>
          ) : (
            <div className="space-y-4">
              {videos.map((vid) => (
                <div
                  key={vid.localId}
                  className="flex flex-col gap-4 p-4 border-2 border-dashed border-[var(--color-border-light)] wobbly-sm bg-[var(--color-bg-alt)]/30"
                >
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <div className="w-full sm:w-1/3">
                      <Input
                        label="Video Presenter Label"
                        placeholder="e.g. Explained by Priya"
                        value={vid.label}
                        onChange={(e) => handleVideoChange(vid.localId, "label", e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="w-full sm:flex-1">
                      <Input
                        label="URL (YouTube, YouTube Shorts, Vimeo, Loom, Google Drive, Instagram, direct MP4)"
                        placeholder="e.g. https://www.instagram.com/reel/ABC123/"
                        value={vid.url}
                        onChange={(e) => handleVideoChange(vid.localId, "url", e.target.value)}
                        disabled={isLoading}
                        helperText={vid.status ? `Detected: ${vid.status}` : undefined}
                        error={vid.url.trim() !== "" && vid.embedUrl === null ? "Unsupported URL format" : undefined}
                      />
                    </div>
                    <div className="pt-6">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeVideoRow(vid.localId)}
                        disabled={isLoading}
                        className="!border-[var(--color-error)] !text-[var(--color-error)] hover:!bg-red-50"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>

                  {vid.embedUrl && (
                    <div className="w-full pt-2">
                      <p className="text-xs font-semibold text-[var(--color-fg-muted)] font-[family-name:var(--font-body)] mb-2">
                        Preview
                      </p>
                      <div
                        className="w-full max-w-md overflow-hidden rounded-lg border-2 border-[var(--color-border)] bg-black/5"
                        style={{ aspectRatio: vid.aspectRatio || "16 / 9" }}
                      >
                        {vid.embedKind === "iframe" ? (
                          <iframe
                            src={vid.embedUrl}
                            title={`Preview for ${vid.label || vid.url}`}
                            className="h-full w-full"
                            loading="lazy"
                            allowFullScreen
                          />
                        ) : (
                          <video
                            src={vid.embedUrl}
                            controls
                            className="h-full w-full object-contain"
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex justify-end gap-3 pt-6 border-t-2 border-dashed border-[var(--color-border-light)]">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/questions")}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {isEditing ? "Save Changes" : "Create Question"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
