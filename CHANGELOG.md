# Changelog

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
