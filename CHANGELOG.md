# Changelog

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
