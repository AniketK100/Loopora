/**
 * LandingHero — Dark desk scene with power switch.
 *
 * Scene 0: Near-total darkness. A desk lamp with a clickable power switch
 * is the only visible element.
 * 
 * Scene 1 (power-on): Lamp glows amber → desk surface reveals → monitor
 * flickers on with "Crack the Interview" → cable materializes.
 *
 * Returning visitors see a "Skip Intro / Enter Library" button.
 */

"use client";

import { useEffect, useState, useRef } from "react";
import { Power, ArrowRight, SkipForward } from "lucide-react";
import Link from "next/link";
import { gsap } from "gsap";

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
  const heroRef = useRef<HTMLElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    try {
      if (typeof window !== "undefined" && localStorage.getItem("loopora-visited") === "true") {
        const timer = setTimeout(() => {
          setIsReturning(true);
        }, 0);
        return () => clearTimeout(timer);
      }
    } catch {
      // localStorage not available
    }
  }, []);

  // Power-on animation sequence
  useEffect(() => {
    if (!poweredOn || hasAnimated.current || reducedMotion) return;
    hasAnimated.current = true;

    const hero = heroRef.current;
    if (!hero) return;

    const tl = gsap.timeline();

    // 1. Lamp lights up (CSS handles this via .powered-on class)
    // 2. Monitor fades in (CSS transition handles this)
    // 3. Animate the hero text inside the monitor
    tl.fromTo(
      hero.querySelectorAll(".monitor-letter"),
      { yPercent: 100, opacity: 0 },
      { yPercent: 0, opacity: 1, stagger: 0.05, duration: 0.6, ease: "power3.out", delay: 0.8 }
    );

    // 4. Animate the subtitle
    tl.fromTo(
      hero.querySelector(".monitor-subtitle"),
      { y: 12, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
      "-=0.2"
    );

    // 5. Animate the CTA buttons
    tl.fromTo(
      hero.querySelectorAll(".hero-cta"),
      { y: 16, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.1, duration: 0.5, ease: "power3.out" },
      "-=0.2"
    );

    return () => { tl.kill(); };
  }, [poweredOn, reducedMotion]);

  const handlePowerOn = () => {
    if (!poweredOn) {
      onPowerOn();
    }
  };

  return (
    <section
      ref={heroRef}
      className={`landing-hero ${poweredOn ? "powered-on" : ""}`}
      aria-labelledby="landing-title"
    >
      {/* Desk surface (revealed on power-on) */}
      <div className="desk-surface" aria-hidden="true" />

      {/* Desk lamp visual */}
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
            aria-label="Power on the desk — start the experience"
          >
            <Power size={22} />
          </button>
        )}
        {!poweredOn && (
          <span className="switch-hint">Click to power on</span>
        )}
      </div>

      {/* Monitor — appears after power-on */}
      <div className="hero-monitor">
        <div className="monitor-topbar">
          <span /><span /><span />
          <strong>Loopora</strong>
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
            Curated questions, model answers, video context,
            and community review — all in one connected prep system. Prep with {totalQuestions}+ questions across {totalCategories} tracks.
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

      {/* Returning visitor skip button */}
      {isReturning && !poweredOn && (
        <div style={{ position: "fixed", bottom: "2rem", right: "2rem", zIndex: 100, display: "flex", gap: "0.5rem" }}>
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
