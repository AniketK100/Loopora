/**
 * StationCommunity — "The Sticky Notes"
 * 
 * Camera frames a dark wood corkboard wall.
 * Pinned sticky notes represent community revisions.
 * Moderator verification stamps fade in and flip slightly on hover.
 */

"use client";

import { MessageSquare, ShieldAlert } from "lucide-react";

interface StationCommunityProps {
  progress: number;
  reducedMotion: boolean;
}

export function StationCommunity({ progress, reducedMotion }: StationCommunityProps) {
  const isActive = progress > 0.15;
  const showChecks = progress > 0.45 || reducedMotion;

  return (
    <section
      className={`station station-community relative ${isActive ? "active" : ""}`}
      aria-label="Community Pinned Suggestions and Moderation checks Station"
    >
      <div className="station-inner relative z-10">
        {/* Environment: Pinned Board with Translucent notes */}
        <div className="sticky-environment w-full max-w-[480px]">
          <div className="sticky-note-main border border-neutral-300 transform -rotate-2 hover:rotate-0 hover:-translate-y-1 transition-all duration-300">
            <div className="pushpin" />
            <div className="flex items-center gap-2 border-b border-black/10 pb-2 mb-3">
              <MessageSquare size={14} className="text-neutral-700" />
              <span className="text-[0.62rem] font-bold uppercase tracking-widest text-neutral-800">Suggestion #1092</span>
            </div>

            <div className="sticky-handwriting text-neutral-800">
              <p style={{ margin: 0, fontSize: "0.85rem", fontStyle: "italic", fontWeight: 700, lineHeight: 1.4 }}>
                &quot;For Stripe Question 24, make sure to detail how idempotency keys prevent double charge processing during connection retries.&quot;
              </p>
              
              <div className="flex justify-between items-center mt-6">
                <span className={`status-badge text-[0.6rem] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${progress > 0.6 ? "status-published" : "status-suggested"}`}>
                  {progress > 0.6 ? "Published" : "Suggested"}
                </span>
                <span style={{ fontSize: "0.6rem", color: "#555", fontStyle: "italic" }}>by stripe-lead-dev</span>
              </div>
            </div>
          </div>

          {/* Quality checklist */}
          <div className="quality-checklist bg-black/40 border border-neutral-800 rounded p-4 mt-4">
            <div className="flex items-center gap-2 text-[0.62rem] text-amber-500/80 font-bold uppercase tracking-wider mb-2">
              <ShieldAlert size={12} />
              <span>Safety & Authenticity Controls</span>
            </div>
            
            <div className="space-y-1">
              <div className={`checklist-item text-[0.7rem] transition-opacity duration-500 ${showChecks ? "checked opacity-100" : "opacity-30"}`}>
                Plagiarism & copy scan cleared
              </div>
              <div className={`checklist-item text-[0.7rem] transition-opacity duration-500 ${progress > 0.5 ? "checked opacity-100" : "opacity-30"}`}>
                Company validation approved
              </div>
              <div className={`checklist-item text-[0.7rem] transition-opacity duration-500 ${progress > 0.7 ? "checked opacity-100" : "opacity-30"}`}>
                Revision bank updated
              </div>
            </div>
          </div>
        </div>

        {/* Copy */}
        <div>
          <p className="station-eyebrow">Community & Validation</p>
          <h2 className="station-title">Verified feedback loops.</h2>
          <p className="station-body">
            Contribute answers or suggest improvements to any track. Every submission undergoes technical reviews
            by platform administrators before integration, ensuring absolute content reliability.
          </p>
        </div>
      </div>
    </section>
  );
}
