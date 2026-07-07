/**
 * StationBookmarks — "The Drawer & Notebook"
 * 
 * Camera tilts down-right over a desk drawer that slides open.
 * Inside the drawer, a physical notebook opens.
 * Bookmarks pin themselves, and progress ring indicators fill.
 */

"use client";

import { Pin, Bookmark } from "lucide-react";
import { NotebookAsset } from "./components/NotebookAsset";

interface StationBookmarksProps {
  progress: number;
  reducedMotion: boolean;
}

export function StationBookmarks({ progress, reducedMotion }: StationBookmarksProps) {
  const isActive = progress > 0.15;
  const isFilled = progress > 0.45 || reducedMotion;

  return (
    <section
      className={`station station-bookmarks relative ${isActive ? "active" : ""}`}
      aria-label="Bookmarks and Notebook Progress Station"
    >
      <div className="station-inner relative z-10">
        {/* Environment: Sliding Drawer containing an open notebook */}
        <div className="drawer-environment w-full max-w-[500px]">
          <div className="drawer-frame">
            <NotebookAsset isOpen={true} className="w-full">
              <div className="flex flex-col gap-4 p-2 h-full">
                {/* Header */}
                <div className="flex items-center gap-2 border-b border-neutral-200 pb-2">
                  <Bookmark size={14} className="text-red-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-700">Bookmarks & Progress</span>
                </div>

                {/* Bookmark cards inside notebook */}
                <div className="flex flex-col gap-2 mt-1">
                  <div className="bookmark-card bg-[#faf8f5] border border-neutral-300 text-neutral-700 flex items-center gap-2 p-2 rounded shadow-sm hover:translate-x-1 transition-all">
                    <Pin size={10} className="text-red-500 rotate-45" />
                    <span className="text-xs font-semibold">Consistent Hashing & DB partitioning</span>
                  </div>
                  <div className="bookmark-card bg-[#faf8f5] border border-neutral-300 text-neutral-700 flex items-center gap-2 p-2 rounded shadow-sm hover:translate-x-1 transition-all">
                    <Pin size={10} className="text-red-500 rotate-45" />
                    <span className="text-xs font-semibold">How to structure salary negotiations</span>
                  </div>
                </div>

                {/* Progress Indicators */}
                <div className="mt-4 flex items-center justify-between bg-neutral-100/50 p-2.5 rounded border border-neutral-200">
                  <div className="text-left">
                    <div className="text-lg font-black text-neutral-800">{isFilled ? "70%" : "0%"}</div>
                    <div className="text-[0.62rem] text-neutral-500 uppercase font-bold tracking-wider">Completion Rate</div>
                  </div>
                  
                  {/* Vector progress indicator */}
                  <div className="progress-ring-demo relative w-12 h-12" aria-hidden="true">
                    <svg viewBox="0 0 60 60" className="w-full h-full">
                      <circle className="progress-bg stroke-neutral-200" cx="30" cy="30" r="25" fill="none" strokeWidth="4" />
                      <circle
                        className="progress-fill stroke-red-500"
                        cx="30"
                        cy="30"
                        r="25"
                        fill="none"
                        strokeWidth="4"
                        style={{
                          strokeDasharray: 157,
                          strokeDashoffset: isFilled ? 47 : 157,
                          transition: reducedMotion ? "none" : "stroke-dashoffset 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                        }}
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </NotebookAsset>
          </div>
        </div>

        {/* Copy */}
        <div className="flex flex-col gap-4">
          <p className="station-eyebrow">Bookmarks & Progress</p>
          <h2 className="station-title">Revision sheets, physically organized.</h2>
          <p className="station-body">
            Pin critical questions, code snippets, or architecture tips to your personal revision log.
            Monitor completion percentages and master your weak points one by one.
          </p>
        </div>
      </div>
    </section>
  );
}
