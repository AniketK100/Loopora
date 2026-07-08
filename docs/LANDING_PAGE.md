# Landing Page

## Overview

The Loopora landing page is a scroll-driven cinematic experience. It guides visitors through a curated narrative — from hero to workspace — using GSAP ScrollTrigger and Lenis smooth scrolling.

## Sections

### 1. Hero (LandingHero.tsx)
- Left column: "Crack the Interview" heading with slot-machine scramble animation on the trailing word
- Hacker terminal typing effect cycling through category names
- Two CTAs: "Start Preparing" (primary gold) and "Sign up free" (secondary outline)
- Right column: Three floating note cards pinned to a corkboard:
  - System Design card with Consist Hashing notes (ruled paper, red margin)
  - Algorithms card with Reverse Linked List code snippet
  - Behavioral card with STAR method details
- GSAP Paper Wind scroll animation: cards scatter and fade as user scrolls
- Auth-aware CTAs (shows "Resume Preparation" when logged in)

### 2. Cable System (CableSystem.tsx)
- SVG copper wire emanating from lamp base
- GSAP-drawn path animation synced to scroll progress
- Fades out after initial scroll

### 3. Station: Search (StationSearch.tsx)
- "Workspace Shelf" theme
- Typing animation in search input
- Category-filtered search results with badges (Behavioral, System Design, Algorithms)
- Uses Shelf + Laptop visual components

### 4. Station: STAR (StationSTAR.tsx)
- "Main Workstation" theme
- Sequential reveal of S-T-A-R letters as user scrolls
- Situational, Task, Action, Result cards
- Uses Monitor component

### 5. Station: Bookmarks (StationBookmarks.tsx)
- "Knowledge Hub" theme
- Color-coded bookmark cards:
  - System Design (amber) — "Consistent Hashing & DB partitioning"
  - Behavioral (green) — "Salary negotiations"
  - Core CS (violet) — "LRU Cache implementation"
- SVG gradient progress ring (70%)
- Per-category progress bars
- Saved/Topics/Streak metrics
- Uses NotebookAsset component

### 6. Station: Community (StationCommunity.tsx)
- "Community & Validation" theme
- Corkboard with pinned sticky note
- Pushpin SVG with needle shadow
- Quality checklist: Plagiarism scan, Company validation, Revision bank
- ShieldCheck verification icons

### 7. Final Scene (FinalScene.tsx)
- "Premium Developer Workspace Footer"
- Fixed 340px height, absolute-positioned room layout
- Shelf with books (Sys/DSA/STAR/API) + plant
- Wall decor: Terms, Privacy, Cert frames + calendar (live JUL date) + sticky note
- Sleeping kitten SVG with animated ZZZs and breathing animation
- Large monitor displaying "LOOPORA LIBRARY"
- Keyboard, mouse, notebook, lamp (scroll-to-top)
- Coffee mug with random coding quote popup
- Headphones linking to walkthroughs
- Magnetic hover GSAP effect on all `.study-prop` elements

## Key Design Decisions

- Footer is a `<footer>` element (not `<section>`) for semantic HTML
- Props use CSS absolute positioning with `bottom-[32%]` for desk alignment
- All interactive elements use the `study-prop` class for magnetic hover
- Clock updates via `setInterval` every 60 seconds
- Coffee quotes rotate from a curated list of 5 quotes
