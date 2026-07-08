/**
 * CableSystem — Simplified copper wire coming out of the lamp base.
 * Fades into transparency quickly as it goes down, keeping the rest of the page clean.
 */

"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface CableSystemProps {
  poweredOn: boolean;
  reducedMotion: boolean;
}

export function CableSystem({ poweredOn, reducedMotion }: CableSystemProps) {
  const wirePathRef = useRef<SVGPathElement>(null);
  const glowPathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (reducedMotion || !poweredOn) return;

    const wire = wirePathRef.current;
    const glow = glowPathRef.current;
    if (!wire || !glow) return;

    const length = wire.getTotalLength();

    // Set initial offsets
    gsap.set([wire, glow], { strokeDasharray: length, strokeDashoffset: length });

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ".premium-landing",
          start: "top top",
          end: "30% top",
          scrub: 0.5,
        },
      });

      tl.to([wire, glow], { strokeDashoffset: 0, ease: "none" }, 0);
    });

    return () => ctx.revert();
  }, [poweredOn, reducedMotion]);

  const isGlowing = poweredOn && !reducedMotion;
  // Sits on the right side (x=780) matching the desktop lamp base position
  const cablePathD = "M 780 250 L 780 4500";

  return (
    <div className="absolute inset-y-0 inset-x-0 pointer-events-none z-10 w-full h-full" aria-hidden="true">
      <svg
        viewBox="0 0 1000 6000"
        preserveAspectRatio="none"
        style={{ width: "100%", height: "100%" }}
      >
        <defs>
          <linearGradient id="copper-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--lamp-amber)" />
            <stop offset="40%" stopColor="var(--copper-glow)" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Ambient shadow/cork glow line */}
        <path
          ref={glowPathRef}
          d={cablePathD}
          fill="none"
          strokeWidth="6"
          strokeLinecap="round"
          className="transition-all duration-700"
          style={{
            stroke: isGlowing ? "url(#copper-fade)" : "rgba(0,0,0,0.5)",
            filter: isGlowing ? "blur(4px)" : "none",
          }}
        />

        {/* Core copper cable line */}
        <path
          ref={wirePathRef}
          d={cablePathD}
          fill="none"
          strokeWidth="3.5"
          strokeLinecap="round"
          className="transition-all duration-700"
          style={{
            stroke: isGlowing ? "url(#copper-fade)" : "var(--copper)",
          }}
        />
      </svg>
    </div>
  );
}
