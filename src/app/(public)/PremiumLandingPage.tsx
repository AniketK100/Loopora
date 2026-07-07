/**
 * Premium landing experience for Loopora.
 *
 * Integrates LandingHero, CableSystem, 4 unique learning stations,
 * and the StudyRoom ending into a unified, scroll-driven cinematic journey.
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

interface PremiumLandingPageProps {
  totalQuestions: number;
  totalCategories: number;
}

export function PremiumLandingPage({ totalQuestions, totalCategories }: PremiumLandingPageProps) {
  const {
    progress,
    stations,
    reducedMotion,
    poweredOn,
    powerOn,
    rootRef,
  } = useScrollOrchestrator();

  return (
    <div ref={rootRef} className="premium-landing">
      {/* Serpentine copper cable system overlay */}
      <CableSystem
        poweredOn={poweredOn}
        reducedMotion={reducedMotion}
      />

      {/* Hero: The Desk & Power Switch */}
      <LandingHero
        poweredOn={poweredOn}
        onPowerOn={powerOn}
        reducedMotion={reducedMotion}
        totalQuestions={totalQuestions}
        totalCategories={totalCategories}
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
  );
}
