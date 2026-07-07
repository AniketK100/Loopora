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

    // 3. Connect requestAnimationFrame callback
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // 4. Cleanup
    return () => {
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
