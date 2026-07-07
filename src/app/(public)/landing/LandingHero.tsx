/**
 * LandingHero — The dark desk environment with the cinematic opening flow.
 * 
 * Flow:
 * 1. User lands: NotebookCover lies on the dark wooden desk.
 * 2. User clicks "Open Notebook" -> Tearing split (NotebookTear) with fibers and dust.
 * 3. Sleeping desk silhouettes appear (lamp shade, monitor silhouette, keyboard).
 * 4. User clicks vintage power switch -> Lamp turns on, monitor wakes, desk glows.
 * 
 * Returning visitors skip the opening intro automatically.
 */

"use client";

import { useEffect, useState, useRef } from "react";
import { Power, ArrowRight, SkipForward } from "lucide-react";
import Link from "next/link";
import { gsap } from "gsap";
import { NotebookTear } from "./NotebookTear";

interface LandingHeroProps {
  poweredOn: boolean;
  onPowerOn: () => void;
  reducedMotion: boolean;
  totalQuestions: number;
  totalCategories: number;
}

export function LandingHero({
  poweredOn,
  onPowerOn,
  reducedMotion,
  totalQuestions,
  totalCategories,
}: LandingHeroProps) {
  const [isReturning, setIsReturning] = useState(false);
  const [notebookOpened, setNotebookOpened] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const hasAnimated = useRef(false);

  // Check returning visitor
  useEffect(() => {
    try {
      if (typeof window !== "undefined" && localStorage.getItem("loopora-visited") === "true") {
        const timer = setTimeout(() => {
          setIsReturning(true);
          // Auto-skip opening transitions for returning visitors
          setNotebookOpened(true);
        }, 0);
        return () => clearTimeout(timer);
      }
    } catch {
      // localStorage not available
    }
  }, []);

  // Monitor text boot-up sequence on power on
  useEffect(() => {
    if (!poweredOn || hasAnimated.current || reducedMotion) return;
    hasAnimated.current = true;

    const hero = heroRef.current;
    if (!hero) return;

    const tl = gsap.timeline();

    tl.fromTo(
      hero.querySelectorAll(".monitor-letter"),
      { yPercent: 100, opacity: 0 },
      { yPercent: 0, opacity: 1, stagger: 0.05, duration: 0.6, ease: "power3.out", delay: 0.8 }
    );

    tl.fromTo(
      hero.querySelector(".monitor-subtitle"),
      { y: 12, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
      "-=0.2"
    );

    tl.fromTo(
      hero.querySelectorAll(".hero-cta"),
      { y: 16, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.1, duration: 0.5, ease: "power3.out" },
      "-=0.2"
    );

    return () => {
      tl.kill();
    };
  }, [poweredOn, reducedMotion]);

  const handleTearComplete = () => {
    setNotebookOpened(true);
  };

  const handlePowerOn = () => {
    if (!poweredOn) {
      onPowerOn();
    }
  };

  return (
    <section
      ref={heroRef}
      className={`landing-hero relative ${poweredOn ? "powered-on" : ""}`}
      aria-labelledby="landing-title"
    >
      {/* Desk Surface shadow background */}
      <div className="desk-surface" aria-hidden="true" />

      {/* STEP 1: Closed notebook waiting to tear */}
      {!notebookOpened && (
        <div className="relative z-10 w-full max-w-md mx-auto py-12">
          <NotebookTear onTearComplete={handleTearComplete} reducedMotion={reducedMotion} />
        </div>
      )}

      {/* STEP 2 & 3: Lined room silhouettes & power controls appear behind */}
      {notebookOpened && (
        <div className="w-full flex flex-col items-center justify-center relative z-10 gap-8">
          {/* Vintage Power Switch (The only illuminated indicator before power-on) */}
          <div className="power-switch-container">
            <div className="desk-lamp" aria-hidden="true">
              <div className="lamp-shade" />
              <div className="lamp-arm" />
              <div className="lamp-base" />
            </div>

            {!poweredOn && (
              <button
                className="power-switch"
                onClick={handlePowerOn}
                aria-label="Power on the desk"
              >
                <Power size={22} />
              </button>
            )}
            {!poweredOn && <span className="switch-hint">Toggle Switch</span>}
          </div>

          {/* Workstation Monitor Display */}
          <div className="hero-monitor">
            <div className="monitor-topbar">
              <span />
              <span />
              <span />
              <strong>Loopora OS</strong>
            </div>
            <div className="monitor-content">
              <h1 id="landing-title">
                {["Crack", " the", " interview"].map((word, i) => (
                  <span
                    key={i}
                    className="monitor-letter"
                    style={{ display: "inline-block", overflow: "hidden" }}
                  >
                    {word}
                  </span>
                ))}
              </h1>
              <p className="monitor-subtitle">
                Curated questions, model answers, video context, and community review — all in one connected prep
                system. Prep with {totalQuestions}+ questions across {totalCategories} tracks.
              </p>
              <div style={{ display: "flex", gap: "0.8rem", marginTop: "1.2rem", flexWrap: "wrap", justifyContent: "center" }}>
                <Link href="/interview" className="study-main-cta hero-cta">
                  Start Preparing <ArrowRight size={18} />
                </Link>
                <Link
                  href="/signup"
                  className="hero-cta"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.65rem 1.2rem",
                    border: "1px solid rgba(240, 230, 214, 0.12)",
                    borderRadius: "8px",
                    color: "var(--ink-muted)",
                    textDecoration: "none",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    transition: "all 0.25s ease",
                  }}
                >
                  Sign up free
                </Link>
              </div>
            </div>
            <div className="monitor-glow" aria-hidden="true" />
          </div>
        </div>
      )}

      {/* Skip Button for Returning visitors */}
      {isReturning && !poweredOn && (
        <div className="fixed bottom-8 right-8 z-50 flex gap-2">
          <button className="skip-intro" onClick={handlePowerOn}>
            <SkipForward size={14} /> Skip Intro
          </button>
          <Link href="/interview" className="skip-intro">
            Enter Library <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </section>
  );
}
