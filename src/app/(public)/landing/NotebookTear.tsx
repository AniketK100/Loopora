/**
 * NotebookTear component — Realistic physical page tearing transition asset.
 * Employs jagged SVG paths, paper fiber fragments, and 3D folding cover states.
 */

"use client";

import React, { useState, useRef } from "react";
import { gsap } from "gsap";
import { NotebookAsset } from "./components/NotebookAsset";

interface NotebookTearProps {
  onTearComplete: () => void;
  reducedMotion: boolean;
}

export function NotebookTear({ onTearComplete, reducedMotion }: NotebookTearProps) {
  const [isTorn, setIsTorn] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const fibersRef = useRef<HTMLDivElement>(null);

  const handleTearClick = () => {
    if (isTorn) return;
    setIsTorn(true);

    if (reducedMotion) {
      onTearComplete();
      return;
    }

    const container = containerRef.current;
    const fibers = fibersRef.current;
    if (!container) return;

    // Tearing animation timeline
    const tl = gsap.timeline({
      onComplete: onTearComplete,
    });

    // Spawn fiber dust particles
    if (fibers) {
      const fiberElements = fibers.querySelectorAll(".fiber");
      tl.to(fiberElements, {
        opacity: 0,
        x: () => gsap.utils.random(-150, 150),
        y: () => gsap.utils.random(-150, 150),
        rotation: () => gsap.utils.random(-180, 180),
        scale: 0.2,
        duration: 1.2,
        stagger: 0.02,
        ease: "power2.out",
      }, 0.2);
    }

    // Tear & fold the two cover halves
    tl.to(container.querySelector(".tear-left"), {
      xPercent: -120,
      rotateY: -75,
      scale: 0.9,
      opacity: 0,
      duration: 1.4,
      ease: "power3.inOut",
    }, 0);

    tl.to(container.querySelector(".tear-right"), {
      xPercent: 120,
      rotateY: 75,
      scale: 0.9,
      opacity: 0,
      duration: 1.4,
      ease: "power3.inOut",
    }, 0);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-md mx-auto aspect-[3/4] flex items-center justify-center cursor-pointer select-none"
      onClick={handleTearClick}
      style={{ perspective: "1200px" }}
    >
      {/* Fiber debris wrapper */}
      <div ref={fibersRef} className="absolute inset-0 pointer-events-none z-30 overflow-visible">
        {isTorn &&
          [...Array(24)].map((_, i) => (
            <div
              key={i}
              className="fiber absolute w-1 h-3 bg-[#e6e2da] rounded-full opacity-90"
              style={{
                left: `${50 + gsap.utils.random(-10, 10)}%`,
                top: `${20 + i * 3}%`,
                transform: `rotate(${gsap.utils.random(-45, 45)}deg)`,
              }}
            />
          ))}
      </div>

      {/* Left Cover Half */}
      <div
        className="tear-left absolute inset-y-0 left-0 w-1/2 overflow-hidden origin-right"
        style={{
          clipPath: "polygon(0 0, 100% 0, 90% 12%, 100% 25%, 88% 38%, 98% 50%, 85% 65%, 95% 78%, 88% 90%, 100% 100%, 0 100%)",
        }}
      >
        <div className="absolute top-0 bottom-0 left-0 w-[200%] h-full">
          <NotebookAsset isOpen={false} />
        </div>
      </div>

      {/* Right Cover Half */}
      <div
        className="tear-right absolute inset-y-0 right-0 w-1/2 overflow-hidden origin-left"
        style={{
          clipPath: "polygon(10% 12%, 2% 0, 100% 0, 100% 100%, 0 100%, 12% 90%, 5% 78%, 15% 65%, 2% 50%, 12% 38%, 0 25%)",
        }}
      >
        <div className="absolute top-0 bottom-0 right-0 w-[200%] h-full">
          <NotebookAsset isOpen={false} style={{ transform: "rotateY(0deg) scale(1)", boxShadow: "none" }} />
        </div>
      </div>

      {/* Opening hint */}
      {!isTorn && (
        <div className="absolute z-40 bg-[#161412]/90 border border-[#d4a052]/30 px-5 py-2.5 rounded-full text-[#d4a052] font-semibold text-xs tracking-wider uppercase wobbly-sm animate-pulse shadow-2xl">
          Open Notebook
        </div>
      )}
    </div>
  );
}
