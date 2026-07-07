/**
 * CableSystem — Continuous SVG copper wire path connecting all stations.
 * 
 * Draws one long serpentine path that follows the scroll journey.
 * Uses strokeDashoffset and MotionPath animation to flow an amber light pulse.
 */

"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

interface CableSystemProps {
  poweredOn: boolean;
  reducedMotion: boolean;
}

export function CableSystem({ poweredOn, reducedMotion }: CableSystemProps) {
  const wirePathRef = useRef<SVGPathElement>(null);
  const glowPathRef = useRef<SVGPathElement>(null);
  const pulseRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    if (reducedMotion || !poweredOn) return;

    const wire = wirePathRef.current;
    const glow = glowPathRef.current;
    const pulse = pulseRef.current;
    if (!wire || !pulse || !glow) return;

    const length = wire.getTotalLength();

    // Set initial dash states
    gsap.set([wire, glow], { strokeDasharray: length, strokeDashoffset: length });
    gsap.set(pulse, { opacity: 0 });

    const ctx = gsap.context(() => {
      // Sync cable lighting and pulse with scroll progression
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ".premium-landing",
          start: "top top",
          end: "bottom bottom",
          scrub: 0.5,
        },
      });

      // Illuminate the wire as the user scrolls
      tl.to([wire, glow], { strokeDashoffset: 0, ease: "none" }, 0);
      tl.to(pulse, { opacity: 1, ease: "none", duration: 0.05 }, 0);
      
      // Animate the pulse dot along the path
      tl.to(
        pulse,
        {
          motionPath: {
            path: wire,
            align: wire,
            alignOrigin: [0.5, 0.5],
          },
          ease: "none",
        },
        0
      );
    });

    return () => ctx.revert();
  }, [poweredOn, reducedMotion]);

  // If power is off or reduced motion is active, render simple static wires
  const isGlowing = poweredOn && !reducedMotion;

  return (
    <div className="cable-system" aria-hidden="true">
      <svg
        viewBox="0 0 1000 6000"
        preserveAspectRatio="none"
        style={{ width: "100%", height: "100%" }}
      >
        <defs>
          <linearGradient id="cable-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--lamp-amber)" />
            <stop offset="20%" stopColor="var(--copper-glow)" />
            <stop offset="40%" stopColor="var(--accent-blue)" />
            <stop offset="60%" stopColor="var(--accent-violet)" />
            <stop offset="80%" stopColor="var(--accent-green)" />
            <stop offset="100%" stopColor="var(--lamp-amber)" />
          </linearGradient>
        </defs>

        {/* Shadow glow layer */}
        <path
          ref={glowPathRef}
          className="cable-path-glow"
          d="M 500 500 C 500 800, 200 1200, 200 1500 C 200 1800, 500 2200, 500 2500 C 500 2800, 300 3200, 300 3500 C 300 3800, 700 4200, 700 4500 C 700 4800, 500 5200, 500 5500"
          style={{ stroke: isGlowing ? "url(#cable-gradient)" : "var(--copper)" }}
        />

        {/* Core copper/gradient wire path */}
        <path
          ref={wirePathRef}
          className="cable-path"
          d="M 500 500 C 500 800, 200 1200, 200 1500 C 200 1800, 500 2200, 500 2500 C 500 2800, 300 3200, 300 3500 C 300 3800, 700 4200, 700 4500 C 700 4800, 500 5200, 500 5500"
          style={{ stroke: isGlowing ? "url(#cable-gradient)" : "var(--copper)" }}
        />

        {/* Pulse of active charge flow */}
        {isGlowing && (
          <circle
            ref={pulseRef}
            className="cable-pulse"
            r="8"
          />
        )}
      </svg>
    </div>
  );
}
