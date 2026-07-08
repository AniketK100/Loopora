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
1. User selects up to 2 folders for personalization
2. `GET /api/interview/[folder]/personalized?resumeId=...`
3. Iterates questions in folder, checks cache (`PersonalizedAnswer`)
4. Cache miss: calls Gemini to generate personalized answer from resume
5. Falls back to sample answer on AI failure
6. Free users limited to top 10 questions per folder

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

## Security Architecture

| Layer | Implementation | Phase |
|-------|---------------|-------|
| Auth | NextAuth.js JWT, HttpOnly/Secure/SameSite cookies | 3 |
| RBAC | `requireRole()` middleware on admin routes + mutating APIs | 3 |
| Input validation | Zod schemas on every API route | 2 |
| XSS prevention | `sanitize-html` allowlist before storage | 8 |
| Embed safety | URL normalization to strict templates; reject unknown patterns | 2 |
| Resume validation | Magic bytes + MIME + extension + size + page count | 2 |
| Duplicate detection | SHA-256 content hash dedup | 2 |
| Rate limiting | IP-based on auth + public write endpoints | 3 |
| CSP | `frame-src` restricted to embed provider allowlist | 8 |
| CSRF | SameSite cookies + explicit tokens on admin forms | 8 |
