/**
 * StationCommunity — "The Sticky Notes"
 * 
 * Cable connects to a pushpin on sticky notes.
 * Translucent yellow post-it showing community updates and checklist verification.
 *
 * Features demonstrated: Community Suggestions + Quality
 */

"use client";

import { MessageSquare, ShieldAlert } from "lucide-react";

interface StationCommunityProps {
  progress: number;
  reducedMotion: boolean;
}

export function StationCommunity({ progress, reducedMotion }: StationCommunityProps) {
  const isActive = progress > 0.15;

  const showChecks = progress > 0.4 || reducedMotion;

  return (
    <section
      className={`station station-community ${isActive ? "active" : ""}`}
      aria-label="Community suggestions and quality controls station"
    >
      <div className="station-inner">
        {/* Environment: Post-it notes and quality checks */}
        <div className="sticky-environment">
          <div className="sticky-note-main">
            <div className="pushpin" />
            <div style={{ display: "flex", gap: "0.45rem", alignItems: "center", borderBottom: "1px solid rgba(0,0,0,0.1)", paddingBottom: "0.4rem", marginBottom: "0.5rem" }}>
              <MessageSquare size={14} />
              <strong style={{ fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Suggestion #492</strong>
            </div>

            <div className="sticky-handwriting">
              <p style={{ margin: 0, fontSize: "0.85rem", fontStyle: "italic", fontWeight: 600 }}>
                &quot;In Question 24 (Stripe API system design), we should clarify idempotency key mechanisms and database locking models...&quot;
              </p>
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem" }}>
                <span className={`status-badge ${progress > 0.6 ? "status-published" : "status-suggested"}`}>
                  {progress > 0.6 ? "Published" : "Suggested"}
                </span>
                <span style={{ fontSize: "0.6rem", color: "#555" }}>by senior-stripe-eng</span>
              </div>
            </div>
          </div>

          {/* Quality check list checklist */}
          <div className="quality-checklist">
            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.65rem", color: "var(--ink-dim)", marginBottom: "0.35rem", fontWeight: 700, textTransform: "uppercase" }}>
              <ShieldAlert size={10} />
              <span>Admin Moderation Checks</span>
            </div>
            
            <div className={`checklist-item ${showChecks ? "checked" : ""}`}>
              Plagiarism & AI spam scan clean
            </div>
            <div className={`checklist-item ${progress > 0.5 ? "checked" : ""}`}>
              Formatting & grammar check
            </div>
            <div className={`checklist-item ${progress > 0.7 ? "checked" : ""}`}>
              Technical accuracy approved
            </div>
          </div>
        </div>

        {/* Copy */}
        <div>
          <p className="station-eyebrow">Community & Quality</p>
          <h2 className="station-title">Crowdsourced intelligence, admin verified.</h2>
          <p className="station-body">
            Contribute answers or suggest corrections to existing tracks. Every submission undergoes
            rigorous technical reviews by administrators before merging, keeping our revision bank clean and reliable.
          </p>
        </div>
      </div>
    </section>
  );
}
