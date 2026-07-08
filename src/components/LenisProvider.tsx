/**
 * Lenis Smooth Scroll Provider — Client Component
 *
 * Implements inertial smooth scrolling across the public interface.
 * Aligns scroll animations with GSAP ScrollTrigger timelines.
 * Integrates prefers-reduced-motion accessibility bypass guard.
 *
 * @module components/LenisProvider
 */

"use client";

import React, { useEffect } from "react";
import Lenis from "lenis";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface LenisProviderProps {
  children: React.ReactNode;
}

export function LenisProvider({ children }: { children: LenisProviderProps["children"] }) {
  useEffect(() => {
    // 1. Accessibility check: skip smooth scroll if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    // 2. Initialize Lenis smooth scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Standard easeOutExpo curve
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    // Sync GSAP ScrollTrigger immediately on Lenis scroll frames
    lenis.on("scroll", () => {
      ScrollTrigger.update();
    });

    // 3. Drive Lenis with a single self-scheduling requestAnimationFrame loop.
    // Each frame advances Lenis and re-arms itself; cancelAnimationFrame stops it.
    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    // 4. Cleanup
    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
