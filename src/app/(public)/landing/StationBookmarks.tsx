/**
 * StationBookmarks — "The Drawer & Notebook"
 * 
 * Cable enters a partially open desk drawer.
 * Inside is a mini laptop with saved bookmarks and a physical notebook
 * with progress indicator rings that fill as the scroll advances.
 *
 * Features demonstrated: Bookmarks + Progress
 */

"use client";

import { Bookmark, Pin } from "lucide-react";

interface StationBookmarksProps {
  progress: number;
  reducedMotion: boolean;
}

export function StationBookmarks({ progress, reducedMotion }: StationBookmarksProps) {
  const isActive = progress > 0.15;
  const isFilled = progress > 0.5 || reducedMotion;

  return (
    <section
      className={`station station-bookmarks ${isActive ? "active" : ""}`}
      aria-label="Bookmarks and Progress tracking station"
    >
      <div className="station-inner">
        {/* Environment: Drawer and physical notebook */}
        <div className="drawer-environment">
          <div className="drawer-frame">
            {/* Drawer Laptop */}
            <div className="drawer-laptop">
              <div className="laptop-shell">
                <div className="laptop-screen-inner" style={{ padding: "0.6rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.7rem", color: "var(--lamp-amber)", marginBottom: "0.4rem" }}>
                    <Bookmark size={12} />
                    <strong>Saved for Revision</strong>
                  </div>
                  
                  <div className="bookmark-list-demo">
                    <div className="bookmark-card">
                      <Pin size={10} className="bookmark-pin" />
                      <span>Implement consistent hashing</span>
                    </div>
                    <div className="bookmark-card">
                      <Pin size={10} className="bookmark-pin" />
                      <span>Negotiation strategies: RSUs vs Base</span>
                    </div>
                    <div className="bookmark-card">
                      <Pin size={10} className="bookmark-pin" />
                      <span>STAR template: Database scaling</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="laptop-led" />
              <div className="laptop-hinge" />
            </div>

            {/* Notebook / Planner */}
            <div className="notebook-prop">
              <div className="notebook-title">Progress</div>
              
              <div className="progress-ring-demo" aria-hidden="true">
                <svg viewBox="0 0 60 60">
                  <circle className="progress-bg" cx="30" cy="30" r="25" />
                  <circle
                    className="progress-fill"
                    cx="30"
                    cy="30"
                    r="25"
                    style={{
                      strokeDashoffset: isFilled ? 47 : 157,
                      transition: reducedMotion ? "none" : "stroke-dashoffset 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                    }}
                  />
                </svg>
              </div>

              <div className="progress-label">
                <div style={{ fontSize: "0.78rem", fontWeight: 800, color: "var(--lamp-amber)" }}>
                  {isActive ? "70%" : "0%"}
                </div>
                <div>Questions Mastered</div>
              </div>

              {/* Decorative flags sticking out */}
              <div className="sticky-flag sticky-flag-1" />
              <div className="sticky-flag sticky-flag-2" />
              <div className="sticky-flag sticky-flag-3" />
            </div>
          </div>
        </div>

        {/* Copy */}
        <div>
          <p className="station-eyebrow">Bookmarks & Progress</p>
          <h2 className="station-title">Track your growth in physical detail.</h2>
          <p className="station-body">
            Save weak links or high-yield concepts to custom bookmarks. Follow a structured progress
            path that reveals your completion rates across behavioral, technical, and architectural categories.
          </p>
        </div>
      </div>
    </section>
  );
}
