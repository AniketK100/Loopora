/**
 * StationCommunity — "The Sticky Notes"
 * 
 * Scaled up elements to be highly readable, bold, and visually detailed.
 */

"use client";

import { MessageSquare, ShieldCheck } from "lucide-react";

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
      <div className="station-inner relative z-10 flex flex-col md:flex-row items-center justify-between gap-12 max-w-[1350px] w-full px-6">
        
        {/* Environment: Pinned Board with Corkboard backdrop styling (Scaled Up to max-w-[700px]) */}
        <div className="sticky-environment w-full max-w-[700px] transition-all duration-1000 relative p-6 bg-amber-950/20 border border-amber-900/30 rounded-xl shadow-2xl">
          
          {/* Corkboard texture indicator pin dot patterns */}
          <div className="absolute inset-0 bg-[radial-gradient(#251c14_1px,transparent_1px)] [background-size:16px_16px] opacity-25 rounded-xl pointer-events-none" />

          {/* Main Pinned Note (Ruled sticky note, realistic shadows) */}
          <div className="sticky-note-main border border-neutral-300/40 p-8 transform -rotate-1 hover:rotate-0 hover:-translate-y-2 transition-all duration-500 shadow-[0_25px_60px_rgba(0,0,0,0.4)] bg-[var(--color-post-it)] relative rounded">
            {/* Pushpin at the top with a realistic dark drop shadow */}
            <div className="pushpin absolute -top-4 left-1/2 -translate-x-1/2 w-7 h-7 bg-gradient-to-b from-red-500 to-red-700 rounded-full border border-red-400 shadow-md flex items-center justify-center cursor-pointer">
              <div className="w-2 h-2 bg-white/40 rounded-full" />
              {/* Pin needle shadow */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[3px] h-3 bg-black/50 blur-[0.5px]" />
            </div>
            
            <div className="flex items-center gap-2 border-b border-black/10 pb-3 mb-5">
              <MessageSquare size={18} className="text-neutral-800" />
              <span className="text-[0.75rem] font-black uppercase tracking-widest text-neutral-900">Suggestion #1092</span>
            </div>

            <div className="sticky-handwriting text-neutral-900">
              <p style={{ margin: 0, fontSize: "1.1rem", fontStyle: "italic", fontWeight: 800, lineHeight: 1.6 }}>
                &quot;For Stripe Question 24, make sure to detail how idempotency keys prevent double charge processing during connection retries.&quot;
              </p>
              
              <div className="flex justify-between items-center mt-8">
                <span className={`status-badge text-[0.68rem] font-black px-3 py-1 rounded uppercase tracking-wider ${progress > 0.6 ? "status-published bg-green-500/10 text-green-700" : "status-suggested bg-amber-500/10 text-amber-700"}`}>
                  {progress > 0.6 ? "Published" : "Suggested"}
                </span>
                <span className="text-[0.72rem] text-neutral-600 font-bold font-mono">by stripe-lead-dev</span>
              </div>
            </div>
          </div>

          {/* Quality checklist */}
          <div className="quality-checklist bg-[#0c0a09] border border-neutral-800 rounded-lg p-6 mt-6 shadow-2xl relative z-10">
            <div className="flex items-center gap-2 text-[0.75rem] text-amber-500 font-black uppercase tracking-wider mb-4">
              <ShieldCheck size={16} className="text-amber-500" />
              <span>Safety & Authenticity Controls</span>
            </div>
            
            <div className="space-y-3">
              <div className={`checklist-item text-xs flex items-center gap-3.5 transition-opacity duration-500 ${showChecks ? "checked opacity-100 text-[#f0e6d6]" : "opacity-30 text-[#a89882]"}`}>
                <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                <span className="font-semibold text-[13px]">Plagiarism & copy scan cleared</span>
              </div>
              <div className={`checklist-item text-xs flex items-center gap-3.5 transition-opacity duration-500 ${progress > 0.5 ? "checked opacity-100 text-[#f0e6d6]" : "opacity-30 text-[#a89882]"}`}>
                <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                <span className="font-semibold text-[13px]">Company validation approved</span>
              </div>
              <div className={`checklist-item text-xs flex items-center gap-3.5 transition-opacity duration-500 ${progress > 0.7 ? "checked opacity-100 text-[#f0e6d6]" : "opacity-30 text-[#a89882]"}`}>
                <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                <span className="font-semibold text-[13px]">Revision bank updated</span>
              </div>
            </div>
          </div>

        </div>

        {/* Copy Column */}
        <div className="flex flex-col gap-4 flex-1 text-left">
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
