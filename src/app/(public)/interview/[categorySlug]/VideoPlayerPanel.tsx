/**
 * VideoPlayerPanel Component
 *
 * Professional SaaS-style video player panel with tabs for different content types.
 * Uses existing video utilities (getEmbedUrl, normalizeVideoUrl) for URL processing.
 * Sticky on desktop, supports YouTube/Vimeo/Loom/Google Drive/MP4.
 *
 * @module app/(public)/interview/[categorySlug]/VideoPlayerPanel
 */

"use client";

import React, { useState, useMemo } from "react";
import { getEmbedUrl } from "@/lib/video/getEmbedUrl";
import type { ResolvedEmbed } from "@/lib/video/getEmbedUrl";

interface Video {
  url: string;
  title?: string;
  provider?: string;
  embedUrl?: string;
}

interface VideoPlayerPanelProps {
  videos: Video[];
  questionTitle: string;
  activeTab?: "video" | "explanation" | "notes";
  onTabChange?: (_tab: "video" | "explanation" | "notes") => void;
}

export function VideoPlayerPanel({
  videos,
  questionTitle,
  activeTab: externalActiveTab,
  onTabChange,
}: VideoPlayerPanelProps) {
  const [internalActiveTab, setInternalActiveTab] = useState<"video" | "explanation" | "notes">("video");
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);

  const activeTab = externalActiveTab ?? internalActiveTab;

  const handleTabChange = (tab: "video" | "explanation" | "notes") => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setInternalActiveTab(tab);
    }
  };

  // Resolve embed URLs for all videos
  const resolvedVideos = useMemo(() => {
    return videos
      .map((video) => {
        try {
          const resolved: ResolvedEmbed = getEmbedUrl(video.url, video.embedUrl);
          return {
            ...video,
            resolved,
            isValid: resolved.type !== "unsupported",
          };
        } catch {
          return {
            ...video,
            resolved: { type: "unsupported" as const, src: "" },
            isValid: false,
          };
        }
      })
      .filter((v) => v.isValid);
  }, [videos]);

  const currentVideo = resolvedVideos[selectedVideoIndex];

  return (
    <div className="w-full">
      {/* Tab Bar */}
      <div className="flex items-center gap-0 border-2 border-b-0 border-[var(--color-border-light)] bg-[var(--color-bg-alt)]/20 p-1 font-[family-name:var(--font-heading)]">
        <TabButton
          label="Video"
          isActive={activeTab === "video"}
          onClick={() => handleTabChange("video")}
          icon="🎬"
        />
        <TabButton
          label="Explanation"
          isActive={activeTab === "explanation"}
          onClick={() => handleTabChange("explanation")}
          icon="📖"
        />
        <TabButton
          label="Notes"
          isActive={activeTab === "notes"}
          onClick={() => handleTabChange("notes")}
          icon="📝"
        />
      </div>

      {/* Tab Content */}
      <div className="border-2 border-[var(--color-border-light)] bg-[var(--color-bg)]">
        {activeTab === "video" && (
          <div className="space-y-3">
            {/* Video Player */}
            {resolvedVideos.length === 0 ? (
              <div className="aspect-video flex items-center justify-center bg-[var(--color-bg-alt)]/10 border-b-2 border-[var(--color-border-light)]">
                <div className="text-center space-y-3 p-6">
                  <div className="text-4xl">🎬</div>
                  <h3
                    className="text-lg font-bold text-[var(--color-fg)]"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    Video Coming Soon
                  </h3>
                  <p className="text-sm text-[var(--color-fg-muted)] font-[family-name:var(--font-body)]">
                    A walkthrough for this question is being prepared.
                  </p>
                </div>
              </div>
            ) : (
              <div
                className="bg-black"
                style={{ aspectRatio: currentVideo?.resolved.aspectRatio || "16 / 9" }}
              >
                {currentVideo?.resolved.type === "iframe" ? (
                  <iframe
                    src={currentVideo.resolved.src}
                    title={currentVideo.title || questionTitle}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    sandbox="allow-scripts allow-same-origin allow-popups"
                  />
                ) : currentVideo?.resolved.type === "video" ? (
                  <video
                    src={currentVideo.resolved.src}
                    controls
                    className="w-full h-full object-contain"
                    preload="metadata"
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : null}
              </div>
            )}

            {/* Video Selector (if multiple videos) */}
            {resolvedVideos.length > 1 && (
              <div className="px-4 pb-3 space-y-2">
                <p className="text-xs font-bold text-[var(--color-fg-muted)] font-[family-name:var(--font-heading)]">
                  More videos for this question:
                </p>
                <div className="flex flex-wrap gap-2">
                  {resolvedVideos.map((video, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedVideoIndex(index)}
                      className={[
                        "px-3 py-1 text-xs font-bold font-[family-name:var(--font-heading)] border-2 transition-all",
                        index === selectedVideoIndex
                          ? "bg-[var(--color-accent)] text-[var(--color-bg)] border-[var(--color-accent)]"
                          : "bg-[var(--color-bg)] text-[var(--color-fg)] border-[var(--color-border-light)] hover:border-[var(--color-border)]",
                      ].join(" ")}
                    >
                      {video.title || `Video ${index + 1}`}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "explanation" && (
          <div className="p-6 min-h-[300px]">
            <div className="space-y-4">
              <h3
                className="text-xl font-bold text-[var(--color-fg)]"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                📖 Video Explanation
              </h3>
              <p className="text-sm text-[var(--color-fg-muted)] font-[family-name:var(--font-body)] leading-relaxed">
                Watch the video explanation above for a detailed walkthrough of this question.
                The video covers key concepts, common mistakes, and best practices.
              </p>
              {resolvedVideos.length === 0 && (
                <p className="text-sm text-[var(--color-fg-muted)] italic font-[family-name:var(--font-body)]">
                  No video explanation available yet for this question.
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === "notes" && (
          <div className="p-6 min-h-[300px]">
            <div className="space-y-4">
              <h3
                className="text-xl font-bold text-[var(--color-fg)]"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                📝 Study Notes
              </h3>
              <p className="text-sm text-[var(--color-fg-muted)] font-[family-name:var(--font-body)] leading-relaxed">
                Use the space below to take notes while watching the video.
                Key points from the video explanation will help you prepare for similar questions.
              </p>
              <textarea
                placeholder="Write your study notes here..."
                className="w-full h-40 p-3 bg-[var(--color-bg)] border-2 border-[var(--color-border-light)] font-[family-name:var(--font-body)] text-sm text-[var(--color-fg)] placeholder-[var(--color-fg-muted)]/50 focus:outline-none focus:border-[var(--color-accent)] resize-none"
                aria-label="Study notes"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({
  label,
  isActive,
  onClick,
  icon,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
  icon: string;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "flex items-center gap-1.5 px-3 py-2 text-xs font-bold transition-all font-[family-name:var(--font-heading)]",
        isActive
          ? "bg-[var(--color-fg)] text-[var(--color-bg)]"
          : "text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] hover:bg-[var(--color-bg-alt)]/30",
      ].join(" ")}
    >
      <span aria-hidden="true">{icon}</span>
      <span>{label}</span>
    </button>
  );
}
