/**
 * StationSearch — "The Workspace Shelf"
 * 
 * Scaled up elements and margins to look premium, clear, and high-fidelity.
 */

"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Shelf } from "./components/Shelf";
import { Laptop } from "./components/Laptop";

interface StationSearchProps {
  progress: number;
  reducedMotion: boolean;
}

const searchResults = [
  { badge: "Behavioral", badgeClass: "badge-behavioral", title: "Tell me about a time you led a project under pressure", difficulty: "Medium" },
  { badge: "System Design", badgeClass: "badge-system", title: "Design a scalable live chat application", difficulty: "Hard" },
  { badge: "Algorithms", badgeClass: "badge-react", title: "Implement an LRU Cache with O(1) ops", difficulty: "Medium" },
];

export function StationSearch({ progress, reducedMotion }: StationSearchProps) {
  const [typedText, setTypedText] = useState("");
  const isActive = progress > 0.15;
  const isTypingTriggered = progress > 0.35 || reducedMotion;

  // Typing animation
  useEffect(() => {
    if (reducedMotion || !isTypingTriggered) return;

    const fullText = "scalable real-time app";
    let index = 0;
    const interval = setInterval(() => {
      setTypedText(fullText.slice(0, index));
      index++;
      if (index > fullText.length) {
        clearInterval(interval);
      }
    }, 60);

    return () => clearInterval(interval);
  }, [isTypingTriggered, reducedMotion]);

  return (
    <section
      className={`station station-search relative ${isActive ? "active" : ""}`}
      aria-label="Workspace Search Shelf Station"
    >
      <div className="station-inner relative z-10 flex flex-col md:flex-row items-center justify-between gap-12 max-w-[1350px] w-full px-6">
        
        {/* Layer 1: Shelf Background & Environment (Scaled Up) */}
        <div className="relative w-full max-w-[760px] transition-all duration-1000">
          <Shelf>
            {/* Layer 3: Foreground Laptop sitting on shelf */}
            <Laptop isOn={isActive} className="w-full">
              <div className="flex flex-col gap-3.5 p-5 h-full text-left">
                {/* Search field mock */}
                <div className="flex items-center gap-2.5 px-4 py-2.5 bg-[#12100d] border border-[#d4a052]/20 rounded-md">
                  <Search size={16} className="text-amber-500/80" />
                  <span className="text-sm text-[#f0e6d6] font-mono">
                    {reducedMotion ? "scalable real-time app" : typedText}
                  </span>
                  <span className="w-1.5 h-4 bg-amber-500 animate-pulse" />
                </div>

                {/* Results listing */}
                <div
                  className={`flex flex-col gap-2 mt-2 transition-all duration-700 ${
                    isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  }`}
                >
                  {searchResults.map((res, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 bg-neutral-900/60 border border-neutral-800 hover:border-amber-500/30 rounded transition-all duration-300 hover:translate-x-1"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`text-[0.65rem] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${res.badgeClass}`}>
                          {res.badge}
                        </span>
                        <span className="text-xs text-[#faf8f5]/90 truncate max-w-[200px]">
                          {res.title}
                        </span>
                      </div>
                      <span className="text-[0.65rem] text-neutral-500 uppercase font-bold">{res.difficulty}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Laptop>
          </Shelf>
        </div>

        {/* Text descriptions */}
        <div className="flex flex-col gap-4 flex-1 text-left">
          <p className="station-eyebrow">Search Intelligence</p>
          <h2 className="station-title">Find clarity. Avoid the search noise.</h2>
          <p className="station-body">
            Directly search through Stripe, Google, or Meta questions. Filter by topic, difficulty,
            and common pitfalls. Every folder acts as a targeted study track.
          </p>
        </div>

      </div>
    </section>
  );
}
