/**
 * StationSearch — "The Workspace Shelf"
 * 
 * Cable curves to a wall-mounted shelf below the desk.
 * A laptop sits tilted on the shelf, showing a search interface
 * that types a query and reveals results with company filters.
 *
 * Features demonstrated: Search + Company Questions
 */

"use client";

import { useEffect, useRef } from "react";
import { Search } from "lucide-react";

interface StationSearchProps {
  progress: number;
  reducedMotion: boolean;
}

const searchResults = [
  { badge: "Behavioral", badgeClass: "badge-behavioral", title: "Tell me about a time you led a team under pressure", difficulty: "Medium" },
  { badge: "System", badgeClass: "badge-system", title: "Design a URL shortener at scale", difficulty: "Hard" },
  { badge: "React", badgeClass: "badge-react", title: "Explain React reconciliation and fiber architecture", difficulty: "Hard" },
  { badge: "Behavioral", badgeClass: "badge-behavioral", title: "How do you handle disagreements with your manager?", difficulty: "Easy" },
];

const companies = ["Google", "Meta", "Amazon", "Microsoft", "Stripe"];

export function StationSearch({ progress, reducedMotion }: StationSearchProps) {
  const stationRef = useRef<HTMLElement>(null);
  const typedRef = useRef<HTMLSpanElement>(null);
  const lastProgress = useRef(0);

  const isActive = progress > 0.15;

  // Typing animation for search bar
  useEffect(() => {
    if (reducedMotion || !typedRef.current) return;
    
    const text = "system design";
    const el = typedRef.current;

    if (progress > 0.2 && lastProgress.current <= 0.2) {
      // Start typing
      let i = 0;
      const interval = setInterval(() => {
        if (i <= text.length) {
          el.textContent = text.slice(0, i);
          i++;
        } else {
          clearInterval(interval);
        }
      }, 60);
      return () => clearInterval(interval);
    }
    lastProgress.current = progress;
  }, [progress, reducedMotion]);

  return (
    <section
      ref={stationRef}
      className={`station station-search ${isActive ? "active" : ""}`}
      aria-label="Search and Company Questions station"
    >
      <div className="station-inner">
        {/* Environment: Shelf with tilted laptop */}
        <div className="shelf-environment">
          <div className="shelf-book" aria-hidden="true" />
          <div className="shelf-surface">
            <div className="search-laptop">
              <div className="laptop-shell">
                <div className="laptop-screen-inner">
                  {/* Search bar */}
                  <div className="search-bar-demo">
                    <Search size={14} />
                    <span ref={typedRef}>{reducedMotion ? "system design" : ""}</span>
                    {!reducedMotion && <span className="cursor-blink" />}
                  </div>

                  {/* Search results */}
                  <div className="search-results-demo">
                    {searchResults.map((r, i) => (
                      <div key={i} className="result-card-demo">
                        <span className={`result-badge ${r.badgeClass}`}>{r.badge}</span>
                        <span className="result-title-demo">{r.title}</span>
                        <span className="result-difficulty">{r.difficulty}</span>
                      </div>
                    ))}
                  </div>

                  {/* Company filter chips */}
                  <div className="company-filter-demo">
                    {companies.map((c, i) => (
                      <span key={c} className={`company-chip ${i === 0 ? "active" : ""}`}>{c}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="laptop-led" />
              <div className="laptop-hinge" />
            </div>
          </div>
        </div>

        {/* Station copy */}
        <div>
          <p className="station-eyebrow">Signal first</p>
          <h2 className="station-title">Search with precision, not noise.</h2>
          <p className="station-body">
            Prioritized interview questions with category context, difficulty signals,
            and company-specific filters — all in one searchable system. Find exactly
            what you need to practice, instantly.
          </p>
        </div>
      </div>
    </section>
  );
}
