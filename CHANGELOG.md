# Changelog

## [3.0.0] - 2026-07-14 — Final Phase 2 Production Release & Enterprise Stabilization

### Added (SaaS Admin Features)
- **Enterprise Delete Flow** — Added administrative user deletion support (`DELETE /api/admin/users/[id]`). Supports both soft-deletion (`isDeleted: true` blocking active logins) and cascading hard-deletion (cleaning up bookmarks, progress, resumes, AI analyses, sessions, and audits).
- **Deletion UI Confirmation Modal** — Interactive modal in User Accounts page warning about related user data, offering soft/hard selection, and requiring typing `DELETE` to unlock.
- **Throttled Live Timestamps** — Dynamic `lastLoginAt` tracking in `auth.config.ts` JWT callbacks, throttled to 1 update per minute. Live UTC time rendering + absolute format, auto-refreshing client-side every 60 seconds.

### Fixed
- **Admin Sidebar Layout** — Replaced `h-screen` sticky sidebar layouts with a fixed-height `h-screen overflow-hidden` grid container on desktop, fixing scroll clipping, banner offsets, and footer overlapping.
- **Navigation Indicator** — Swapped solid black active indicator blocks with the primary brand accent color.
- **ESLint & Compiler Warnings** — Cleaned up all unused variables, parameters, and imports to ensure zero compilation or linter warnings.

## [2.6.0] - 2026-07-12 — Production audit: security hardening, perf indexes, landing & progress-card fixes

### Security
- **Anti user-enumeration (timing)** — credentials `authorize()` now always runs `bcrypt.compare()` against a constant dummy hash when the email is unknown, equalizing response timing (OWASP A07 / CWE-203).
- **Open-redirect fix** — login `callbackUrl` is validated to a same-origin relative path before `window.location.href` navigation (rejects `//evil.com` and absolute URLs).
- **Middleware hardening** — edge `authorized` callback now also gates `/api/admin/*` (defense-in-depth alongside per-route `requireRole()`).

### Performance
- **MongoDB indexes** — added `{ category: 1, isPublished: 1, frequencyRank: -1 }` covering index on `Question` (workspace navigator + personalized queries); added `{ user: 1, status: 1 }` index on `Resume` (upload-limit count query).

### UI / UX
- **Landing hero** — wrapped into a centered `max-w-[1440px]` container with `100svh` min-height, added a credibility/trust strip under the CTAs; full-bleed desk-surface backdrop. Fills large monitors without dead space.
- **Bookmarks progress card (landing "Knowledge Hub")** — rebuilt with a centered large circular progress ring + a CSS-Grid metric row (`min-w-0`, `tabular-nums`, `whitespace-nowrap` labels) so `Saved / Topics / Streak` never overlap at 100%–200% browser zoom.

## [2.5.0] - 2026-07-12 — Workspace header redesign, density & reading experience

### Changed (Interview Workspace)
- **Cohesive workspace header** — replaced the disconnected label/pills row with one aligned toolbar: `← Library` back link + folder icon + name + question count + top-tags subtitle on the left; centered difficulty-distribution pills (🟢/🟡/🔴 counts) and a resume-status pill (`✅ Resume Loaded` / `📄 No Resume`) divided by a border; search box + difficulty filter on the right. Single baseline, ~110px max.
- **Full-width layout** — outer wrapper widened (`max-w-[1800px]`, tighter padding) to use more viewport width; columns rebalanced to **30% / 40% / 30%** (Video / Answer / Navigator).
- **Denser question list** — `React.memo` cards now show difficulty badge, title, priority `#`, video count, a 🎯 personalized indicator (when a resume-personalized answer exists), plus favorite/practiced marks; tighter spacing, hover lift, accent active state.
- **Reading workspace (Answer panel)** — optimal line length (`max-w-prose`), plus **Copy** and **Share** actions in the tab bar (clipboard / `navigator.share`).
- **Video tabs** — presenter tabs sit above the player, scroll horizontally when many, keep resolved aspect-ratio (16:9 / 9:16 / 1:1) and never crop.
- **Top tags** — derived from the most frequent question tags across the folder and shown as the header subtitle for at-a-glance topic context.

### Performance
- **Field projection in `workspace-data.ts`** — the navigator list now queries only `slug, question, difficulty, isPremium, tags, frequencyRank, videos`; the active question is fetched separately, in full. Large `answer.detailed` HTML is no longer serialized for every question in the folder (cuts payload for big folders).
- `personalizedSlugs` computed once from `usePersonalizedAnswers` and passed to the list (no per-card hook calls).

### SEO
- **OpenGraph + Twitter cards** added to both interview routes' `generateMetadata` (article/website type, title, description, canonical URL).

### Accessibility
- Header, list and tabs carry `role`/`aria-*`; `prefers-reduced-motion` disables Framer transitions; global `:focus-visible` ring retained.

## [2.4.0] - 2026-07-12 — Final production polish (Interview Workspace refinements)

### Changed (Interview Workspace)
- **Workspace-style header** — replaced the plain-text folder label with a VS Code-like project header: folder icon, name, description, `{N} Questions` count, difficulty-distribution pills (🟢/🟡/🔴 counts) and a resume-status pill ("Resume" / "No resume"). Sticky under the site header.
- **Search + difficulty filter moved into the workspace toolbar** (visible `lg`+); the right navigator column is now a pure, denser question list. On `<lg` the filter lives in the navigator drawer header.
- **Video presenter tabs moved ABOVE the player** as browser-style tabs, each with a platform icon (YouTube ▶️, Vimeo 🎥, Loom 🎬, Drive 📁, MP4 🎞️, Instagram 📸) and the active tab highlighted; a 📝 Notes tab is appended. The old bottom selector was removed.
- **Flush, no-wasted-margin player** — the embed now renders edge-to-edge in a bordered box (no card padding), so it uses the full column width. Still never cropped (resolved `aspect-ratio`).
- **Column widths redistributed to 30% / 42% / 28%** (Video / Answer / Navigator) for better visual balance.
- **Compact, animated question cards** — tighter padding, 13px title, hover lift + border emphasis, active item gets an accent left-border + tinted background; list items are `React.memo`-ized.
- **3 columns from `lg` (≥1024px)** instead of only `xl`; tablet (md) shows 2 columns (Video+Answer) with the navigator drawer; mobile gets a single column plus a **sticky bottom navigation** (☰ Questions + Prev/Next).
- **Reduced-motion support** — Framer Motion transitions are disabled when `prefers-reduced-motion` is set; list cross-fades respect it.
- **Consistent focus rings + ARIA** — `role="tablist"/"tab"` on tab groups, `aria-current` on the active question, unified `focus-visible` ring on every interactive element.

### Performance
- `React.memo` on question list items; `useCallback` for navigation/filter handlers; `useMemo` for filtered list and difficulty distribution; single `usePersonalizedAnswers` read in the header (resume status) instead of a second fetch.

### Accessibility
- Keyboard question switching (↑/↓), focus-visible rings, `aria-pressed`/`aria-current`/`role="tab"`, `prefers-reduced-motion` honored.

## [2.3.0] - 2026-07-12 — Interview Folder Experience redesign (three-column workspace)

### Added
- **Three-column Interview Workspace** — Replaced the stacked accordion + single-question layout with a production-grade, desktop-first workspace rendered by a single shared `InterviewWorkspace` component on both the category and question-detail routes:
  - **Left (~30%) Video Workspace** — question context + Favorite/Practiced toggles, a multi-video player with presenter tabs, an aspect-ratio-correct embed (`never cropped`), and a "Notes" tab for study notes. Inline `Resources` list below.
  - **Center (~45%) Answer Workspace** — always-visible tabs (🔑 Short Summary / 💡 Detailed / 🎯 Personalized) with an internal scroll region, plus a collapsible "Improve this solution / suggest edit" console.
  - **Right (~25%) Question Navigator** — search box + difficulty filter (All/Easy/Medium/Hard), a sticky scrollable question list showing difficulty/video/premium/favorite/practiced status, the active question auto-scrolled into view.
- **Compact toolbar header** — folder icon, name and item count in one row; the active question title is shown beneath on smaller screens. A "☰ Questions" button opens the navigator on viewports below `xl`.
- **Responsive behavior** — 3 columns at `xl` (≥1280px); 2 columns (Video + Answer) with the navigator in a slide-over drawer at `lg` (1024–1279px); single column with a sticky question selector on tablet/phone.
- **Framer Motion transitions** — content cross-fades on question/tab change (no layout shift; no CLS). Navigator drawer slides via `AnimatePresence`.
- **Keyboard navigation** — `ArrowUp` / `ArrowDown` (when not typing in an input) move between questions in the filtered navigator list.
- **No layout shift on question switch** — the three-column grid structure is constant; only the inner column content updates/re-animates, so the page never jumps.
- **Shared data loader** `src/app/(public)/interview/workspace-data.ts` fetches the category, the published question list (navigator), and the active question's full content (SSR/SEO) in a single round-trip and is the single source of truth for both routes.
- **SEO preserved** — each question keeps its own URL (`/interview/[category]/[question]`) with canonical metadata; the category page keeps its FAQPage JSON-LD and breadcrumb. The category page opens directly into the first published question.

### Changed
- Premium paywall now gates the video player, detailed answer, worked example and personalized answer (previously only partially gated).
- Personalized (AI) answers are surfaced in a dedicated Answer Workspace tab instead of an accordion panel, sourced from `usePersonalizedAnswers`.
- Suggest-edit feedback console moved into the Answer Workspace (collapsible) instead of a separate full-width card.

### Removed
- Obsolete accordion-based components `CategoryQuestionsContainer`, `AccordionAnswerContent` and `QuestionDetailContainer` have been replaced by `InterviewWorkspace` + `workspace-data.ts`. The reusable `VideoPlayerPanel` remains available.

### Performance / A11y
- Per-column internal scrolling (`overflow-y-auto`) on `xl` keeps the heavy page chrome (sticky header/footer) stable.
- Question links are prefetched (Next `<Link>` default) for instant navigation; `aria-current`, `role="dialog"` on the drawer, and visible focus states included.

## [2.2.2] - 2026-07-12 — Repair video persistence pipeline (silent client-side drop)

### Fixed
- **Silent video loss in the admin form** — `QuestionForm.handleSubmit` filtered video rows with `v.url && v.label`, which discarded any row missing a presenter label. Because the live preview/validation is URL-based, an admin could paste a URL, see it preview correctly, and click Save with the label blank — the row was dropped, the request went out as `videos: []`, the API saved successfully with an empty array, and the video vanished from the edit page, question page and dedicated page (data WAS persisted as empty, not lost by the DB). The submit handler now never silently drops a previewed video:
  - A URL with a blank label auto-defaults to the detected platform name (e.g. "Instagram Reels").
  - An invalid/unsupported URL blocks submission with a clear error instead of being dropped.
  - Truly blank rows (no url and no label) are skipped.
- **Bulk import dropped videos** — `/api/bulk-import` validated questions with `questionCreateSchema` (whose `videos` only carries `label/url/order`) but called `Question.create(validated)` without normalizing, so imported videos lacked the required `provider`/`embedUrl` and the question create threw and was skipped. Imported videos are now normalized via `normalizeVideoUrl` like the main POST/PATCH routes.
- **ISR staleness on public pages** — `POST`/`PATCH /api/questions` now call `revalidatePath` for the category and question detail pages so a saved/edited video appears immediately instead of being hidden by the 1-hour ISR cache.

### Verified (against live MongoDB)
- Before fix: label-less reel → payload `videos: []` → Mongo doc `videos: []` (lost).
- After fix: same input → payload `videos: [{label:"Instagram Reels", url, order}]` → Mongo stores it → GET detail returns it → edit-page default values contain it.

## [2.2.1] - 2026-07-12 — Video persistence & platform coverage fix

### Fixed
- **Instagram `/reels/` (plural) now parses** — previously returned "Unsupported URL Format". Added an `instagram-reels` platform entry so both `/reel/` (singular) and `/reels/` (plural) are accepted.
- **Subdomain-agnostic Instagram detection** — `www.instagram.com`, `m.instagram.com`, `ig.instagram.com` and bare `instagram.com` are all handled.
- **End-to-end video persistence** — `normalizeVideoUrl` (used by `POST`/`PATCH /api/questions`) now delegates to the declarative `parseVideoUrl` registry instead of a duplicated, divergent regex set. This guarantees the stored `embedUrl` matches the client preview/resolvers, fixes Instagram Reels/TV embeds (previously forced to the `/p/` post path), and removes the 500 error that aborted the entire save when a `/reels/` URL was submitted.
- **Responsive aspect-ratio previews** — admin form preview, the public `QuestionDetailContainer` player and `VideoPlayerPanel` now size embeds with a real CSS `aspect-ratio` (Reels/IGTV/Shorts 9:16, posts 1:1, YouTube/Vimeo/Loom/Drive 16:9) via `parseVideoUrl`'s `aspectRatio` field, so portrait media is never stretched into a letterboxed landscape box.
- **Renderers use the stored, server-validated `embedUrl`** — `getEmbedUrl(url, storedEmbedUrl)` prefers the persisted embed and falls back to live parsing. Public question pages now pass the stored `embedUrl` through to the player.

### Added
- **`aspectRatio` metadata** on `ParsedVideo` / `ResolvedEmbed` returned by `parseVideoUrl` / `getEmbedUrl`.

## [2.2.0] - 2026-07-12 — Final UX, Performance, Responsive & Documentation Polish

### Added
- **Video URL parser (future-proof architecture)**: New declarative `parseVideoUrl` utility in `src/lib/video/parseVideoUrl.ts` with a platform registry. Supports YouTube, YouTube Shorts, Vimeo, Loom, Google Drive, Instagram posts, Instagram Reels, Instagram TV and direct video files (MP4/WebM/OGG + Cloudinary). Detects platform, normalizes URL, validates input, builds embed URLs and returns proper error messages.
- **Admin video preview**: Question editor now shows a live iframe/`<video>` preview for supported URLs alongside the detected-platform status.
- **Public "Suggest Q&A" page** (`/suggest`): Replaces the previously broken nav link with a real form posting to `POST /api/suggestions`. Added to the sitemap.
- **Mobile navigation**: Hamburger menu (`MobileNav`) on the public header for Library / Search / Suggest Q&A on small screens.
- **Route-level loading skeletons**: `loading.tsx` files for interview, category, question detail, search, profile and admin routes using a shared `Skeleton`/`SkeletonCard` design-system component for instant navigation feedback and zero CLS.
- **Compact footer**: New `Footer` component with GitHub, copyright, developer credit, version and primary navigation; replaces the oversized inline footer.
- **Cookie consent**: Added a "Reject" option, larger touch target, `role="dialog"` and `env(safe-area-inset-bottom)` padding.
- **Accessible inputs**: `Input` now generates a stable `useId` when no label is provided.

### Changed
- **Admin sidebar**: Sticky, full-height, responsive layout with a pinned brand header and pinned profile footer. Nav links scroll independently and highlight the active route.
- **Responsive answer rendering**: Rendered model answers now contain `pre`/`table`/`img` overflow (`[&_pre]:overflow-x-auto` etc.) and `break-words` to prevent horizontal page scroll on mobile.
- **Modals**: `ResumeUploadPanel` auth modal and `FolderSelectionDialog` now use valid design tokens (fixing an invisible/transparent background + button), are scrollable (`overflow-y-auto`), capped at `max-h-[90vh]`, and expose `role="dialog"` / `aria-modal`. `PremiumUpgradeModal` "Upgrade Now" now navigates to the profile page, is dismissable via Escape, and is scrollable.
- **Impersonation banner**: No longer `sticky`, eliminating overlap with the sticky public/admin headers.
- **Landing hero**: Title no longer forced to a single `whitespace-nowrap` line; it wraps gracefully on small viewports.
- **Category layout grid**: Simplified to a clean 2-column grid at `md` with the video panel visible from `md` up.

### Performance
- ISR (`revalidate = 3600`) already in place on interview, category and question-detail routes; added route-level `loading.tsx` skeletons to remove the perceived-slow-navigation gap.
- Shared `Skeleton` component avoids duplicated loading markup across routes.

### SEO
- **sitemap.ts**: Now includes `/search`, `/suggest`, `/privacy`, `/terms` and `/cookies` (previously missing).
- **robots.ts**: Now disallows `/profile` (authenticated, non-indexable).

### Docs
- README, CHANGELOG, llms.txt and architecture docs synchronized with the current codebase (video platform support, `/suggest` route, footer, sidebar behavior).

## [2.1.0] - 2026-07-10 — Final Production Hardening

### Security
- **Premium content enforcement**: `GET /api/questions/[id]` now checks `isPremium` flag — free users receive only a preview (question text, short answer, difficulty, tags) instead of full detailed answer. Backend-gated, not frontend-hidden.
- **Error handling lockdown**: All 26 API routes now return generic `"Internal Server Error"` to clients. Real error details are logged server-side only. This prevents Mongoose schema leaks, stack traces, and internal file paths from reaching production responses.
- **Rate limiting expanded**: Added DB-backed rate limiting to resume upload (5/min/user), search (30/min/IP), and personalized AI answers (10/min/user) — previously only register, login, and suggestions were rate-limited.
- **NoSQL injection prevention**: `difficulty` filter in `GET /api/questions` now validates against strict enum (`easy|medium|hard`) before being passed to MongoDB. Query parameter-based operator injection is blocked.
- **HSTS header**: Added `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` to all production responses.
- **Debug logs removed**: Stripped `console.log` statements from auth.ts authorize callback that leaked rate limit and validation details.

### SEO
- **JSON-LD structured data**: Added WebSite, Organization, and WebApplication schema markup with `SearchAction` to root layout.
- **README**: Expanded with security architecture section, premium features comparison, production deployment guide, and performance optimization table.

### Cleanup
- Removed `atlas_backup_production/`, `migration_dump/`, `migration_dump_atlas_backup/` directories (regenerable from MongoDB Atlas).
- Removed `posthog-setup-report.md` (temporary document).
- Removed `scratches/` directory.
- Removed unused `scripts/create-admin.ts` (functionality covered by admin panel).

## [2.0.0] - 2026-07-09 — Production Ready (MongoDB Atlas)

### Changed
- **Database:** Migrated from local MongoDB to **MongoDB Atlas** (`interviewloop` cluster). Local MongoDB retained as golden backup.
- **Login rate limiting:** Credentials login (`auth:login`) is now IP-based and rate-limited via the shared DB-backed limiter (`RATE_LIMIT_AUTH_MAX`).
- **CSP:** Production builds drop `unsafe-eval` while retaining `unsafe-inline` (required by Next.js App Router inline scripts). Development CSP unchanged.

### Security Hardening
- Verified authentication, RBAC, session validation, CSRF, and input validation.
- Resume upload pipeline verified: magic-byte + extension + MIME cross-validation, 5 MB and 8-page limits, SHA-256 duplicate detection, DOCX macro rejection.
- `.gitignore` updated to exclude all backup folders (`migration_dump/`, `migration_dump_atlas_backup/`, `atlas_backup_production/`) and temp/cache/log dirs.

### Added
- Fresh Atlas production backup (`atlas_backup_production/`).
- Database rollback procedure documented in `docs/ROLLBACK.md` (Atlas → Local MongoDB revert).

## [0.2.0] - 2026-07-09

### Added
- Gemini AI integration with provider abstraction layer
- Resume upload pipeline with multi-layer security validation
- Personalized interview answers powered by Gemini AI
- Profile page with resume management and folder personalization
- Folder selection UI (max 2 per user) for answer personalization
- Content hash deduplication for resume analysis caching
- Magic byte validation (PDF, DOCX, PNG, JPG, WEBP)
- DOCX macro detection (vbaProject.bin rejection)
- 5MB upload limit and 8-page validation
- SHA-256 content hashing for duplicate detection
- Resume and ResumeAnalysis Mongoose models
- PersonalizedAnswer caching model
- Selected folders support on User model
- API documentation (docs/API.md)
- AI integration documentation (docs/AI.md)
- Security documentation (docs/SECURITY.md)

### Updated
- Profile API route with resume and analysis payload
- AuditLog entity types to include Resume and ResumeAnalysis
- User model with selectedFolders array and validation
- TypeScript types with resume and folder fields
- Public layout with unified header and footer styling
- Architecture documentation with AI and security layers
- Project structure documentation with complete file tree
- Dependencies documentation with new packages
- Environment example with GEMINI_API_KEY
- .gitignore with additional pattern coverage

### Security
- Multi-layer resume upload validation pipeline
- Magic byte signature verification
- MIME/extension mismatch detection
- Macro rejection for DOCX files
- Content hash caching prevents re-analysis

## [0.1.0] - 2026-07-08

### Added
- Stable cinematic landing page recovery point
- Documentation: ARCHITECTURE.md, LANDING_PAGE.md, ANIMATION_SYSTEM.md, GIT_WORKFLOW.md, ROLLBACK.md, PROJECT_STRUCTURE.md, DEPENDENCIES.md

### Restored
- LandingHero: Hacker terminal, scramble animation, 3 floating note cards, GSAP Paper Wind scroll
- FinalScene: Premium Developer Workspace Footer with shelf, kitten, monitor, coffee, all props
- StationBookmarks: Color-coded bookmark cards, SVG progress ring, per-category bars
- StationCommunity: Corkboard with pushpin, quality checklist
- StationSearch: Typing animation, search results
- StationSTAR: S/T/A/R sequential reveal
- CableSystem: GSAP scroll-synced wire animation
- PremiumLandingPage: session prop, CustomCursor, all station wiring
- globals.css: Custom premium cursor, study-room sizing, removed old grid
- LenisProvider: ScrollTrigger sync with Lenis

### Previous Versions
- Phase 0–10: See commit history (0312a9d through 42bc877)
- Landing page redesign: 9326b60, 666fe3a
- Full changelog available in git log
