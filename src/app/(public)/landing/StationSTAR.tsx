/**
 * StationSTAR — "The Main Workstation"
 * 
 * Camera frames a symmetrical desktop layout.
 * A large monitor powers on, building the STAR framework.
 * Microphone and whiteboard sit adjacent, demonstrating active revision.
 */

"use client";

import { Mic } from "lucide-react";
import { Monitor } from "./components/Monitor";

interface StationSTARProps {
  progress: number;
  reducedMotion: boolean;
}

export function StationSTAR({ progress, reducedMotion }: StationSTARProps) {
  const isActive = progress > 0.15;

  const showS = progress > 0.28 || reducedMotion;
  const showT = progress > 0.45 || reducedMotion;
  const showA = progress > 0.65 || reducedMotion;
  const showR = progress > 0.82 || reducedMotion;

  return (
    <section
      className={`station station-star relative ${isActive ? "active" : ""}`}
      aria-label="STAR Workstation and AI Feedback Station"
    >
      <div className="station-inner relative z-10 flex flex-col items-center">
        {/* Environment Monitor & Whiteboard */}
        <div className="workstation-environment w-full max-w-[620px]">
          <Monitor isOn={isActive} className="w-full">
            <div className="flex flex-col gap-4 p-5 h-full justify-between">
              {/* Question heading */}
              <div className="border-b border-[#faf8f5]/5 pb-3">
                <span className="text-[0.62rem] text-amber-500 uppercase tracking-widest font-bold">Stripe Scenario</span>
                <p className="text-xs text-[#f0e6d6] italic mt-1">&quot;Tell me about a time you had to handle an API degradation...&quot;</p>
              </div>

              {/* STAR Layout */}
              <div className="grid grid-cols-4 gap-3 my-2">
                <div className={`star-letter transition-all duration-500 ${showS ? "revealed" : ""}`}>
                  <strong>S</strong>
                  <span>Situation</span>
                  <p className="text-[0.6rem] text-neutral-500 mt-1">Degradation hit webhook dispatchers.</p>
                </div>
                <div className={`star-letter transition-all duration-500 ${showT ? "revealed" : ""}`}>
                  <strong>T</strong>
                  <span>Task</span>
                  <p className="text-[0.6rem] text-neutral-500 mt-1">Prevent webhook request backlogs.</p>
                </div>
                <div className={`star-letter transition-all duration-500 ${showA ? "revealed" : ""}`}>
                  <strong>A</strong>
                  <span>Action</span>
                  <p className="text-[0.6rem] text-neutral-500 mt-1">Decoupled queue pool workers.</p>
                </div>
                <div className={`star-letter transition-all duration-500 ${showR ? "revealed" : ""}`}>
                  <strong>R</strong>
                  <span>Result</span>
                  <p className="text-[0.6rem] text-neutral-500 mt-1">Queue cleared within 8 minutes.</p>
                </div>
              </div>

              {/* AI Waveform bottom bar */}
              <div className="flex items-center gap-3 p-2 bg-black/40 border border-neutral-800 rounded">
                <Mic size={14} className="text-amber-500 animate-pulse" />
                <div className="text-[0.65rem] text-[#a89882] font-mono">AI Voice Pacing Check: Steady</div>
                <div className="ai-waveform flex gap-1 items-end h-3 ml-auto">
                  <span className="w-[2px] h-2 bg-amber-500 rounded" />
                  <span className="w-[2px] h-3 bg-amber-400 rounded animate-[wave_1.1s_infinite_alternate]" />
                  <span className="w-[2px] h-1.5 bg-amber-600 rounded animate-[wave_0.8s_infinite_alternate]" />
                  <span className="w-[2px] h-3 bg-amber-400 rounded" />
                </div>
              </div>
            </div>
          </Monitor>

          {/* Adjacent Whiteboard tip */}
          <div className="whiteboard-prop mt-4 p-3 bg-neutral-900/40 border border-dashed border-[#d4a052]/20 rounded-md text-center">
            <span className="text-[0.68rem] text-amber-500/80 font-mono">Whiteboard Notes: Align with Amazon Leadership Principles</span>
          </div>
        </div>

        {/* Copy */}
        <div className="text-center mt-6 max-w-xl">
          <p className="station-eyebrow">Answer Frameworks</p>
          <h2 className="station-title">Format narratives using the STAR method.</h2>
          <p className="station-body mx-auto">
            Build strong structured responses for behavioral reviews. Leverage integrated AI microphone checks
            to trace structure, highlight impacts, and improve delivery tone.
          </p>
        </div>
      </div>
    </section>
  );
}
