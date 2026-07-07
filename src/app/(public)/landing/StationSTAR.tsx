/**
 * StationSTAR — "The Main Workstation"
 * 
 * Cable reaches a wall-mounted monitor.
 * S-T-A-R framework builds step-by-step.
 * AI practice widget with sound waveform is shown.
 *
 * Features demonstrated: STAR Answers + AI Practice
 */

"use client";

import { Mic } from "lucide-react";

interface StationSTARProps {
  progress: number;
  reducedMotion: boolean;
}

export function StationSTAR({ progress, reducedMotion }: StationSTARProps) {
  const isActive = progress > 0.15;

  // S-T-A-R letters revealed based on scroll progression
  const showS = progress > 0.25 || reducedMotion;
  const showT = progress > 0.45 || reducedMotion;
  const showA = progress > 0.65 || reducedMotion;
  const showR = progress > 0.85 || reducedMotion;

  return (
    <section
      className={`station station-star ${isActive ? "active" : ""}`}
      aria-label="STAR Answers and AI Practice station"
    >
      <div className="station-inner">
        {/* Environment: Wall monitor and whiteboard */}
        <div className="workstation-environment">
          <div className="wall-monitor">
            <div className="monitor-topbar">
              <span /><span /><span />
              <strong>STAR Builder & AI Practice</strong>
            </div>
            <div className="monitor-screen-content">
              <p className="star-question">
                &quot;Tell me about a time you resolved a major production bug...&quot;
              </p>

              {/* STAR Framework Building */}
              <div className="star-framework">
                <div className={`star-letter ${showS ? "revealed" : ""}`}>
                  <strong>S</strong>
                  <span>Situation</span>
                  <p>Production went down on Friday afternoon during a deploy.</p>
                </div>
                <div className={`star-letter ${showT ? "revealed" : ""}`}>
                  <strong>T</strong>
                  <span>Task</span>
                  <p>Had to coordinate rollbacks and debug the core connection leak.</p>
                </div>
                <div className={`star-letter ${showA ? "revealed" : ""}`}>
                  <strong>A</strong>
                  <span>Action</span>
                  <p>Isolated DB connections, applied quick patch, verified thread pool.</p>
                </div>
                <div className={`star-letter ${showR ? "revealed" : ""}`}>
                  <strong>R</strong>
                  <span>Result</span>
                  <p>Restored API within 12 mins. Set up alert checks to prevent repeat leaks.</p>
                </div>
              </div>

              {/* AI Practice Widget */}
              <div className="ai-widget">
                <div className="ai-indicator" />
                <Mic size={14} className="text-amber-500" />
                <div className="ai-label">AI Analysis: Active Voice & Structuring</div>
                <div className="ai-waveform" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </div>
          </div>

          {/* Whiteboard prop */}
          <div className="whiteboard-prop">
            <p style={{ fontSize: "0.68rem", color: "var(--ink-dim)", fontFamily: "monospace" }}>
              Core Tip: Keep Situation &amp; Task to 20% total. Action is the meat!
            </p>
          </div>
        </div>

        {/* Copy */}
        <div>
          <p className="station-eyebrow">Answer craft & feedback</p>
          <h2 className="station-title">Structure answers that build confidence.</h2>
          <p className="station-body">
            Rehearse structured responses with our interactive STAR Builder. Receive real-time
            feedback on your tone, metrics, structure, and pacing. Watch your answers sharpen.
          </p>
        </div>
      </div>
    </section>
  );
}
