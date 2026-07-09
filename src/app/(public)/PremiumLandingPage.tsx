/**
 * Premium landing experience for Loopora.
 *
 * Integrates LandingHero, CableSystem, 4 unique learning stations,
 * and the StudyRoom ending into a unified, scroll-driven cinematic journey.
 * Lenis smooth scroll is scoped to this component only.
 */

"use client";

import { useScrollOrchestrator } from "./landing/useScrollOrchestrator";
import { LandingHero } from "./landing/LandingHero";
import { CableSystem } from "./landing/CableSystem";
import { StationSearch } from "./landing/StationSearch";
import { StationSTAR } from "./landing/StationSTAR";
import { StationBookmarks } from "./landing/StationBookmarks";
import { StationCommunity } from "./landing/StationCommunity";
import { FinalScene } from "./landing/FinalScene";
import { LenisProvider } from "@/components/LenisProvider";

interface PremiumLandingPageProps {
  totalQuestions: number;
  totalCategories: number;
  session?: {
    user?: {
      name?: string | null;
      email?: string | null;
      role?: string | null;
    } | null;
  } | null;
}

/**
 * CustomCursor — themed cursor style.
 * Trailing ring effect removed per user request; native cursor styled via CSS to match the warm-dark theme.
 */
function CustomCursor() {
  return null;
}

export function PremiumLandingPage({ totalQuestions, totalCategories, session }: PremiumLandingPageProps) {
  const {
    progress,
    stations,
    reducedMotion,
    poweredOn,
    rootRef,
  } = useScrollOrchestrator();

  return (
    <LenisProvider>
      <div ref={rootRef} className="premium-landing">
        {/* Custom Sleek Mouse Cursor */}
        <CustomCursor />

        {/* Serpentine copper cable system overlay */}
        <CableSystem
          poweredOn={poweredOn}
          reducedMotion={reducedMotion}
        />

        {/* Hero: The Desk & Power Switch */}
        <LandingHero
          poweredOn={poweredOn}
          reducedMotion={reducedMotion}
          totalQuestions={totalQuestions}
          totalCategories={totalCategories}
          session={session}
        />

        {/* Feature Station 1: Workspace Shelf (Search & Company Questions) */}
        <StationSearch
          progress={stations.search}
          reducedMotion={reducedMotion}
        />

        {/* Feature Station 2: Main Workstation (STAR Builder & AI) */}
        <StationSTAR
          progress={stations.star}
          reducedMotion={reducedMotion}
        />

        {/* Feature Station 3: Drawer & Notebook (Bookmarks & Progress) */}
        <StationBookmarks
          progress={stations.bookmarks}
          reducedMotion={reducedMotion}
        />

        {/* Feature Station 4: Sticky Notes (Community & Quality Validation) */}
        <StationCommunity
          progress={stations.community}
          reducedMotion={reducedMotion}
        />

        {/* Final Scene Ending: Navigable Developer Workspace */}
        <FinalScene
          progress={progress}
          reducedMotion={reducedMotion}
        />
      </div>
    </LenisProvider>
  );
}
