# InterviewLoop — Architecture Guide

> Living document. Updated as each phase progresses.
> Last updated: Phase 11 (AI Personalization)

---

## 1. Project Overview

**InterviewLoop** is an SEO-optimized interview preparation SaaS platform built with Next.js (App Router), MongoDB, and a hand-drawn design system. Users browse interview categories, expand questions to see written model answers and embedded video explanations, switch between multiple video sources per question, upload resumes for AI-powered personalization, and receive tailored interview answers from Gemini.

### Key Technical Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Framework | Next.js 16 (App Router) | SSR/SSG/ISR for SEO; file-based routing; React Server Components |
| Rendering | ISR (revalidate: 3600) | Static-fast for visitors, fresh after admin edits |
| Styling | Tailwind CSS v4 + CSS custom properties | Design tokens as CSS vars consumed by Tailwind |
| Database | MongoDB Atlas + Mongoose | Document model fits Q&A nesting; team familiarity |
| Auth | NextAuth.js v5 (Credentials + Google OAuth) | JWT sessions, HttpOnly cookies, RBAC middleware |
| AI | Google Gemini (via @google/genai) | Resume analysis + personalized answer generation |
| Video | External embeds only (YouTube/Vimeo/Loom/Drive/mp4) | Zero storage cost; lazy-loaded iframes for performance |
| Images | Cloudinary + next/image | CDN-optimized thumbnails and OG images |
| Motion | GSAP + Lenis (landing), Framer Motion (admin UI) | Scroll-triggered animations, smooth scrolling |
| Validation | Zod | Schema validation on all API routes |
| Icons | lucide-react (strokeWidth: 2.5) | Consistent line-art style matching hand-drawn aesthetic |

---

## 2. Architecture Overview

```
User Browser
    │
    ▼
Next.js App Router (SSR/ISR)
    │
    ├── Server Components → Direct DB queries via Mongoose
    │
    ├── API Routes (/api/*) → Zod validation → Mongoose → MongoDB Atlas
    │
    ├── AI Layer (/api/resume/upload, /api/interview/*/personalized)
    │   → Gemini API → Resume + PersonalizedAnswer caching
    │
    └── Client Components → fetch() to API routes (for mutations)
```

### Key Patterns
- **Read path (public)**: Server Components query MongoDB directly — no API round-trip needed
- **Write path (admin)**: Client-side forms → API routes → Zod validation → Mongoose → audit log
- **ISR**: Category and question pages use Incremental Static Regeneration (revalidate: 3600s)
- **AI pipeline**: Resume upload → multi-layer security validation → Gemini analysis → cached results

---

## 3. Folder Structure

See [docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md) for the complete file tree.

### Route Groups

The `(public)` and `(admin)` route groups serve two purposes:
1. **Code splitting**: Admin JS bundle is completely separate from the public bundle
2. **Layout isolation**: Admin pages use a different layout without affecting public pages

---

## 4. Design Token System

All visual styling flows through CSS custom properties defined in `globals.css`:

| Token | Value | Usage |
|---|---|---|
| `--color-bg` | `#FAF8F5` | Warm paper background |
| `--color-fg` | `#2D2D2D` | Pencil black text |
| `--color-accent` | `#E63946` | Marker red (CTAs, active states) |
| `--color-secondary` | `#457B9D` | Ballpoint blue (links) |
| `--color-post-it` | `#FFE066` | Post-it yellow (badges) |
| `--color-muted` | `#E8E4DF` | Eraser grey |
| `--shadow-default` | `3px 3px 0px 0px rgba(45,45,45,0.1)` | Card shadows |
| `--shadow-emphasized` | `8px 8px 0px 0px #2d2d2d` | Expanded card shadows |
| `--radius-wobbly` | `255px 15px 225px 15px / ...` | Hand-drawn border radius |

Fonts are self-hosted via `next/font`:
- **Kalam**: Headings, hero text, badges
- **Patrick Hand**: Body text, question text, UI labels

---

## 5. AI Architecture

### Provider Abstraction

```
lib/ai/types.ts        → AIService interface
lib/ai/gemini.ts       → GeminiService implementation (GoogleGenAI SDK)
lib/ai/provider.ts     → Singleton provider selector
```

### Resume Pipeline

1. User uploads file → `POST /api/resume/upload`
2. Multi-layer validation: magic bytes → MIME → extension → size (5MB) → pages (8)
3. Text extraction: PDF via `pdf-parse`, DOCX via `mammoth`, images via Gemini
4. SHA-256 hashing → duplicate detection via `contentHash`
5. Cache hit: return existing `ResumeAnalysis`
6. Cache miss: call Gemini → persist `Resume` + `ResumeAnalysis`

### Personalized Answers

1. User selects up to 2 folders for personalization
2. `GET /api/interview/[folder]/personalized?resumeId=...`
3. Checks `PersonalizedAnswer` cache per (user, question, resumeHash)
4. Cache miss: Gemini generates answer with resume context
5. Falls back to sample answer on AI failure
6. Free users: top 10 questions; Premium: all questions

---

## 6. Security Architecture

| Layer | Implementation |
|---|---|
| Auth | NextAuth.js JWT, HttpOnly/Secure/SameSite cookies |
| RBAC | `requireRole()` middleware on admin routes + mutating APIs |
| Input validation | Zod schemas on every API route |
| XSS prevention | `sanitize-html` allowlist before storage |
| Embed safety | URL normalization to strict templates; reject unknown patterns |
| Resume validation | Magic bytes + MIME + extension + size (5MB) + pages (8) |
| Duplicate detection | SHA-256 content hash dedup |
| Macro detection | DOCX vbaProject.bin scan |
| Rate limiting | IP-based on auth + public write endpoints |
| CSP | `frame-src` restricted to embed provider allowlist |
| CSRF | SameSite cookies + explicit tokens on admin forms |

---

## 7. Dependencies

### Production
| Package | Purpose |
|---|---|
| `next` 16.x / `react` 19.x / `react-dom` 19.x | Framework |
| `mongoose` | MongoDB ODM |
| `next-auth` v5 (beta) | Authentication |
| `@google/genai` | Gemini AI SDK |
| `bcryptjs` | Password hashing |
| `zod` | Schema validation |
| `gsap` + `lenis` + `framer-motion` | Animations |
| `lucide-react` | Icons |
| `sanitize-html` | XSS prevention |
| `pdf-parse` + `mammoth` | Resume text extraction |

### Development
| Package | Purpose |
|---|---|
| `typescript` ^5 | Type checking |
| `tailwindcss` ^4 + `@tailwindcss/postcss` | Styling |
| `eslint` + `eslint-config-next` | Linting |
| `prettier` + `eslint-config-prettier` | Formatting |
| `tsx` | TypeScript execution |

---

## 8. Phase Status

| Phase | Status | Notes |
|---|---|---|
| 0 — Project Setup | ✅ Complete | Fonts, DB connection, health-check, config |
| 1 — Design Tokens & Components | ✅ Complete | Wobbly borders, UI components, showcase |
| 2 — Data Layer & Schema | ✅ Complete | Mongoose models, seed script, Zod schemas, CRUD APIs |
| 3 — Auth & RBAC | ✅ Complete | NextAuth.js v5, middleware guards, rate limiting |
| 4 — Admin Dashboard | ✅ Complete | Category/Question CRUD, flags, audit logs, bulk import |
| 5 — Public Pages | ✅ Complete | Landing page, categories, Q&A detail, search |
| 6 — Content Seeding | ✅ Complete | 50+ questions per category |
| 7 — SEO Layer | ✅ Complete | JSON-LD, sitemap, OG tags |
| 8 — Security Hardening | ✅ Complete | CSP, sanitization, audit |
| 9 — Performance & A11y | ✅ Complete | Lighthouse, keyboard nav, WCAG |
| 10 — Launch Readiness | ✅ Complete | Legal pages, analytics, monitoring |
| 11 — AI Personalization | ✅ Complete | Gemini integration, resume upload, personalized answers |
