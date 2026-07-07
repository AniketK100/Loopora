/**
 * useScrollOrchestrator — Shared GSAP ScrollTrigger controller.
 *
 * Provides normalized scroll progress (0–1) for the entire cinematic journey.
 * Stations receive progress values, they don't own ScrollTrigger instances.
 * Handles Lenis smooth scroll integration and reduced-motion fallback.
 */

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

interface StationProgress {
  search: number;
  star: number;
  bookmarks: number;
  community: number;
}

interface OrchestratorState {
  /** Overall scroll progress 0–1 */
  progress: number;
  /** Per-station progress 0–1 */
  stations: StationProgress;
  /** Whether the user prefers reduced motion */
  reducedMotion: boolean;
  /** Whether the power-on sequence has been triggered */
  poweredOn: boolean;
  /** Trigger power-on */
  powerOn: () => void;
  /** Container ref to attach to the root element */
  rootRef: React.RefObject<HTMLDivElement | null>;
}

export function useScrollOrchestrator(): OrchestratorState {
  const rootRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [poweredOn, setPoweredOn] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [stations, setStations] = useState<StationProgress>({
    search: 0,
    star: 0,
    bookmarks: 0,
    community: 0,
  });

  const powerOn = useCallback(() => {
    setPoweredOn(true);
    // Mark completion for returning visitor detection
    try {
      localStorage.setItem("loopora-visited", "true");
    } catch {
      // localStorage not available
    }
  }, []);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    
    // Set asynchronously to avoid warning of set-state-in-effect and cascading renders during mount
    const timer = setTimeout(() => {
      setReducedMotion(prefersReduced);

      if (prefersReduced) {
        setPoweredOn(true);
        setStations({ search: 1, star: 1, bookmarks: 1, community: 1 });
        setProgress(1);
      }
    }, 0);

    if (prefersReduced) {
      return () => clearTimeout(timer);
    }

    const root = rootRef.current;
    if (!root) return () => clearTimeout(timer);


    // Calculate station progress from overall scroll progress
    const stationRanges = [
      { key: "search" as const, start: 0.08, end: 0.28 },
      { key: "star" as const, start: 0.28, end: 0.50 },
      { key: "bookmarks" as const, start: 0.50, end: 0.72 },
      { key: "community" as const, start: 0.72, end: 0.88 },
    ];

    const ctx = gsap.context(() => {
      // Auto power-on if user starts scrolling without clicking
      ScrollTrigger.create({
        trigger: root,
        start: "top top",
        end: "10% top",
        onUpdate: (self) => {
          if (self.progress > 0.3 && !poweredOn) {
            powerOn();
          }
        },
      });

      // Main scroll progress tracker
      ScrollTrigger.create({
        trigger: root,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          const p = self.progress;
          setProgress(p);

          const newStations = {} as StationProgress;
          for (const range of stationRanges) {
            if (p < range.start) {
              newStations[range.key] = 0;
            } else if (p > range.end) {
              newStations[range.key] = 1;
            } else {
              newStations[range.key] = (p - range.start) / (range.end - range.start);
            }
          }
          setStations(newStations);
        },
      });
    }, root);

    return () => {
      clearTimeout(timer);
      ctx.revert();
    };
  }, [poweredOn, powerOn]);

  return {
    progress,
    stations,
    reducedMotion,
    poweredOn,
    powerOn,
    rootRef,
  };
}
