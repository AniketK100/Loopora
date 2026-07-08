/**
 * StationBookmarks — "The Knowledge Hub"
 *
 * A premium open notebook with color-coded divider tabs, curated bookmark cards,
 * and an intelligent progress dashboard — blending analog study rituals
 * with digital tracking insights.
 */

"use client";

import { Pin, Bookmark, TrendingUp } from "lucide-react";
import { NotebookAsset } from "./components/NotebookAsset";

interface StationBookmarksProps {
  progress: number;
  reducedMotion: boolean;
}

const BOOKMARK_ITEMS = [
  {
    category: "System Design",
    accent: "amber" as const,
    title: "Consistent Hashing & DB partitioning strategies",
    difficulty: "Hard",
  },
  {
    category: "Behavioral",
    accent: "green" as const,
    title: "How to structure salary negotiations",
    difficulty: "Medium",
  },
  {
    category: "Core CS",
    accent: "violet" as const,
    title: "LRU Cache — O(1) get/put implementation",
    difficulty: "Hard",
  },
];

export function StationBookmarks({ progress, reducedMotion }: StationBookmarksProps) {
  const isActive = progress > 0.15;
  const showCards = progress > 0.30 || reducedMotion;
  const showProgress = progress > 0.50 || reducedMotion;
  const circumference = 125.6;
  const offset = circumference * 0.3;

  return (
    <section
      className={`station station-bookmarks relative ${isActive ? "active" : ""}`}
      aria-label="Bookmarks and Notebook Progress Station"
    >
      <div className="station-inner relative z-10 flex flex-col md:flex-row items-start justify-between gap-x-12 max-w-[1920px] w-full pl-2 pr-6 mx-auto">

        {/* Visual: Notebook — dominant hero at ~72% */}
        <div className="drawer-environment flex-[70] transition-all duration-1000 relative">

            <NotebookAsset isOpen={true} className="w-full relative rounded-md border border-neutral-300">

              {/* Header Row */}
              <div className="flex items-center gap-2 pb-3 mb-4 border-b border-neutral-200/70">
                <Bookmark size={15} className="text-amber-600 shrink-0" />
                <span className="text-sm font-black uppercase tracking-widest text-neutral-800">
                  Bookmarks
                </span>
                <span className="ml-auto text-[0.6rem] text-neutral-400 font-mono">3 items</span>
              </div>

              {/* Two-column layout: bookmark list + progress */}
              <div className="flex gap-6 flex-1">

                {/* Left: Bookmark items */}
                <div className="flex-[3] flex flex-col justify-start gap-5 pt-2">
                  {BOOKMARK_ITEMS.map((item, i) => {
                    const dotColor =
                      item.accent === "amber" ? "#d4a052" : item.accent === "green" ? "#7cb88a" : "#9b85a8";
                    return (
                      <div
                        key={item.title}
                        className={`flex items-center gap-3 py-3 border-b border-neutral-200/30 last:border-b-0 transition-all duration-500 ${
              showCards ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-3"
            }`}
                        style={{ transitionDelay: `${i * 100}ms` }}
                      >
                        <Pin size={12} className="text-amber-500/60 rotate-45 shrink-0" />
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: dotColor }} />
                        <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider shrink-0 w-[5.5rem]">
                          {item.category}
                        </span>
                        <span className="text-sm font-bold text-neutral-800 truncate flex-1">
                          {item.title}
                        </span>
                        <span
                          className={`text-[0.6rem] font-bold uppercase tracking-wider shrink-0 ${
                            item.difficulty === "Hard" ? "text-red-400" : "text-amber-600"
                          }`}
                        >
                          {item.difficulty}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Right: Progress dashboard */}
                <div
                  className={`flex-[2] p-[18px] bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-lg border border-amber-200/60 transition-all duration-700 ${
              showProgress ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
            }`}
                >
                  <div className="flex items-center gap-1.5 mb-4">
                    <TrendingUp size={14} className="text-amber-600" />
                    <span className="text-xs font-black uppercase tracking-widest text-neutral-700">
                      Progress
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative w-[55px] h-[55px] shrink-0">
                      <svg viewBox="0 0 48 48" className="w-full h-full -rotate-90">
                        <defs>
                          <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#d4a052" />
                            <stop offset="100%" stopColor="#b87333" />
                          </linearGradient>
                        </defs>
                        <circle cx="24" cy="24" r="20" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                        <circle
                          cx="24" cy="24" r="20" fill="none"
                          stroke="url(#progressGrad)" strokeWidth="3" strokeLinecap="round"
                          style={{
                            strokeDasharray: circumference,
                            strokeDashoffset: showProgress ? offset : circumference,
                            transition: reducedMotion ? "none" : "stroke-dashoffset 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                          }}
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-neutral-800">
                        {showProgress ? "70%" : "0%"}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 flex-1">
                      <div className="text-center">
                        <div className="text-lg font-black text-neutral-800 leading-none">24</div>
                        <div className="text-[0.6rem] text-neutral-500 uppercase tracking-wider font-bold">Saved</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-black text-neutral-800 leading-none">12</div>
                        <div className="text-[0.6rem] text-neutral-500 uppercase tracking-wider font-bold">Topics</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-black text-neutral-800 leading-none">5d</div>
                        <div className="text-[0.6rem] text-neutral-500 uppercase tracking-wider font-bold">Streak</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-amber-200/40">
                    {BOOKMARK_ITEMS.slice(0, 2).map((item, i) => {
                      const pct = item.category === "System Design" ? 85 : 60;
                      return (
                        <div key={item.category}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[0.55rem] font-bold text-neutral-600">{item.category}</span>
                            <span className="text-[0.55rem] font-bold text-neutral-500">{pct}%</span>
                          </div>
                           <div className="h-[10px] bg-neutral-200/70 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: showProgress ? `${pct}%` : "0%",
                                background: "linear-gradient(90deg, #d4a052, #b87333)",
                                transition: reducedMotion ? "none" : `width 1.2s ${i * 0.15}s cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

            </NotebookAsset>
        </div>

        {/* Copy Column — anchored to upper third of notebook */}
        <div className="flex-[30] flex flex-col gap-4 text-left md:pt-[40px]">
          <p className="station-eyebrow">Knowledge Hub</p>
          <h2 className="station-title text-balance">
            Your revision log, organized by topic.
          </h2>
          <p className="station-body max-w-[440px] leading-relaxed">
            Pin key questions, patterns, and frameworks — then track your mastery across every category.
            Progress insights reveal weak spots so you know exactly where to focus.
          </p>
        </div>

      </div>
    </section>
  );
}
