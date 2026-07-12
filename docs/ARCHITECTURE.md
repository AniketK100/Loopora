# Architecture

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js | 16.2.10 |
| Language | TypeScript | ^5 |
| Styling | Tailwind CSS | ^4 |
| Database | MongoDB + Mongoose | ^9.7.3 |
| Auth | NextAuth v5 | ^5.0.0-beta.31 |
| Animation | GSAP | ^3.15.0 |
| Scroll | Lenis | ^1.3.25 |
| Motion | Framer Motion | ^12.42.2 |
| Icons | Lucide React | ^1.23.0 |
| Validation | Zod | ^4.4.3 |
| AI | Google Gemini (via @google/genai) | ^2.10.0 |

## Application Architecture

```
src/
├── app/                   # Next.js App Router
│   ├── (admin)/          # Admin dashboard (route group)
│   ├── (public)/         # Public pages (route group)
│   ├── api/              # API routes
│   ├── design-system/    # Design system playground
│   ├── globals.css       # Global styles + design tokens
│   ├── layout.tsx        # Root layout
│   ├── robots.ts         # SEO robots.txt
│   └── sitemap.ts        # Dynamic sitemap
├── components/           # Shared UI components
│   └── ui/              # Primitive UI components
├── lib/                  # Utilities, DB, models, AI
├── auth.config.ts       # Edge-safe NextAuth config
├── auth.ts              # NextAuth initialization (Node.js)
├── middleware.ts        # Edge middleware (auth + security headers)
└── types/               # TypeScript type definitions
```

## Route Structure

### Public Routes
- `/` — Landing page (PremiumLandingPage)
- `/interview` — Interview library
- `/interview/[category]` — Category questions
- `/interview/[category]/[question]` — Question detail
- `/login` — Authentication
- `/signup` — Registration
- `/search` — Global search
- `/profile` — User profile (resume upload, personalization, favorites, practiced)
- `/privacy` — Privacy policy
- `/terms` — Terms of service
- `/cookies` — Cookie policy

### Admin Routes
- `/admin` — Dashboard overview
- `/admin/questions` — Question CRUD
- `/admin/categories` — Category CRUD
- `/admin/suggestions` — Suggestion moderation
- `/admin/audit-logs` — Audit trail
- `/admin/users` — User management
- `/admin/flags` — Feature flags
- `/admin/bulk-import` — Bulk import
- `/admin/sessions` — Session management
- `/admin/security` — Security settings
- `/admin/system` — System health

## Interview Workspace (Three-Column Experience)

The Interview Folder experience (`/interview/[categorySlug]` and `/interview/[categorySlug]/[questionSlug]`) is rendered by a single shared client component, `src/app/(public)/interview/InterviewWorkspace.tsx`, backed by the server loader `workspace-data.ts`.

### Layout
| Column | Width (xl) | Responsibility |
|--------|-----------|----------------|
| Video Workspace | ~30% | Multi-video player (presenter tabs), aspect-ratio-correct embed, Notes tab, Resources, Favorite/Practiced toggles |
| Answer Workspace | ~45% | Tabs: Short Summary / Detailed / Personalized; internal scroll; collapsible suggest-edit console |
| Question Navigator | ~25% | Search + difficulty filter + sticky scrollable list with status badges |

### Architecture
- **Single source of truth:** `getWorkspaceData(categorySlug, activeQuestionSlug?)` (server) fetches the category, the published question list (navigator), and the active question's full content (videos resolved via `getEmbedUrl` with `aspectRatio`) in one round-trip. Both routes feed the same `InterviewWorkspace`.
- **No layout shift:** the 3-column grid structure is constant across question switches; only inner column content re-animates (Framer Motion `AnimatePresence`), so pages never jump.
- **State preservation:** search/difficulty filters are initialized from `useSearchParams` and carried in every navigator `<Link>` href, so they survive question navigation and back/forward without a remount glitch.
- **Keyboard nav:** `ArrowUp`/`ArrowDown` move between questions in the filtered navigator list.
- **Responsive:** 3 columns ≥1280px; 2 columns + navigator drawer (1024–1279px); single column with a sticky question selector below 1024px.
- **Premium gating:** `isPremium && !userHasPremium` locks the video, detailed answer, worked example and personalized answer.

### Component Tree
```
InterviewWorkspace
├── WorkspaceHeader                 # compact folder toolbar + "☰ Questions" (drawer trigger)
├── VideoWorkspace                  # left column (keyed per question → resets player)
│   └── FavoriteToggle / PracticedToggle
├── AnswerWorkspace                 # center column (keyed per question → resets tab)
│   ├── usePersonalizedAnswers       # AI personalized answers (context)
│   └── SuggestEditForm              # /api/suggestions
└── QuestionNavigator               # right column + slide-over drawer (<xl)
```

## Authentication Flow

1. NextAuth v5 handles credentials (email/password) and Google OAuth
2. Credentials validated against MongoDB via bcrypt password comparison
3. Session fetched server-side in layouts, persisted as JWT
4. RBAC middleware protects admin routes (requires "admin" or "editor" role)
5. Rate limiting on auth endpoints (configurable via env vars)
6. Session tracking records IP, user agent, device, login method per sign-in
7. Admin impersonation supported via JWT token injection

## AI Layer

- Provider abstraction: `lib/ai/types.ts` defines `AIService` interface
- Gemini implementation: `lib/ai/gemini.ts` uses `@google/genai` SDK
- Singleton provider: `lib/ai/provider.ts` returns `GeminiService`
- Requires `GEMINI_API_KEY` environment variable
- Supports both text and image-based resume analysis
- Generates personalized interview answers based on resume content

### Resume Processing Pipeline
1. Upload via `POST /api/resume/upload`
2. File validation (magic bytes, MIME, extension, size < 5MB, pages < 8)
3. Text extraction (PDF via pdf-parse, DOCX via mammoth)
4. SHA-256 hashing for duplicate detection
5. Gemini analysis (role, skills, experience extraction)
6. Cache hit/miss via content hash lookup in `ResumeAnalysis` collection

### Personalized Answers Pipeline
1. User uploads resume → 16-step validation pipeline → folder selection dialog opens
2. User selects up to 2 folders → `GET /api/interview/[folder]/personalized?resumeId=...` per folder
3. For each folder:
   - Fetches questions sorted by `frequencyRank`, limited to top 10 for free users
   - Checks `PersonalizedAnswer` cache (compound key: `user + question + resumeContentHash + modelVersion`)
   - Cache miss: calls Gemini `generatePersonalizedAnswer()` in batches of 4
   - Result cached in `PersonalizedAnswer` collection with 90-day TTL
   - Results returned with `updatedAt` timestamp for cache status display
   - **No fallback to generic answer** — returns `null` on failure to prevent content duplication
4. Answers stored in `PersonalizedAnswersContext` (React context) for shared access across components
5. **Instant display**: Answers appear in the 🎯 Personalized tab of the Answer Workspace — no page reload needed
6. **Auto-load on mount**: `InterviewWorkspace` lazy-loads cached answers via `usePersonalizedAnswers` when a user navigates to a folder
7. **Resume reactivity**: Context clears and regenerates when active resume changes or is deleted

## Landing Page Component Tree

```
PremiumLandingPage
├── CableSystem            # Copper wire SVG animation
├── LandingHero            # Hero with terminal + floating cards
├── StationSearch          # Search workspace shelf
├── StationSTAR            # STAR method workstation
├── StationBookmarks       # Bookmarks notebook
├── StationCommunity       # Community sticky notes
└── FinalScene             # Premium workspace footer
```

## Premium Content Gating

- `GET /api/questions/[id]` enforces server-side premium check
- Free users get question text, short answer, difficulty, tags only
- Listing endpoints (`GET /api/questions`, `GET /api/search`) exclude `answer.detailed` and videos by default

## JSON-LD Structured Data

- `WebSite`, `Organization`, `WebApplication` schema types injected via `JsonLd` component
- `SearchAction` enables rich search results for search engines
- Injected in root layout `<head>` via `src/components/JsonLd.tsx`

## Security Architecture

| Layer | Implementation |
|-------|---------------|
| Auth | NextAuth.js JWT, HttpOnly/Secure/SameSite cookies |
| Premium gating | Server-side `isPremium` check on question detail endpoint |
| RBAC | `requireRole()` middleware on admin routes + mutating APIs |
| Input validation | Zod schemas on every API route |
| NoSQL injection | Allowlist validation on query parameters |
| XSS prevention | `sanitize-html` allowlist before storage |
| Error handling | Generic `"Internal Server Error"` to clients; real errors logged server-side |
| Embed safety | URL normalization to strict templates; reject unknown patterns |
| Resume validation | 16-step pipeline: magic bytes + MIME + encryption + macro + prompt injection + page count + heuristics + AI |
| Duplicate detection | SHA-256 content hash dedup |
| Rate limiting | DB-backed sliding window: login (10/min), register (10/min), suggestions (5/min), upload (5/min), search (30/min), AI (10/min) |
| CSP | `frame-src` restricted to embed provider allowlist |
| HSTS | `max-age=63072000; includeSubDomains; preload` on all responses |
| CSRF | SameSite cookies + explicit tokens on admin forms |
