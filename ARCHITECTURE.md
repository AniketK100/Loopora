# InterviewLoop — Architecture Guide

> Living document. Updated as each phase progresses.
> Last updated: Phase 0 (Project Setup)

---

## 1. Project Overview

**InterviewLoop** is an SEO-optimized interview preparation SaaS platform built with Next.js (App Router), MongoDB, and a hand-drawn design system. Users browse interview categories, expand questions to see written model answers and embedded video explanations, and switch between multiple video sources per question.

### Key Technical Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Framework | Next.js 15 (App Router) | SSR/SSG/ISR for SEO; file-based routing; React Server Components |
| Rendering | ISR (revalidate: 3600) | Static-fast for visitors, fresh after admin edits |
| Styling | Tailwind CSS v4 + CSS custom properties | Design tokens as CSS vars consumed by Tailwind |
| Database | MongoDB Atlas + Mongoose | Document model fits Q&A nesting; team familiarity |
| Auth | NextAuth.js (Credentials + Google OAuth) | JWT sessions, HttpOnly cookies, RBAC middleware |
| Video | External embeds only (YouTube/Vimeo/Loom/Drive/mp4) | Zero storage cost; lazy-loaded iframes for performance |
| Images | Cloudinary + next/image | CDN-optimized thumbnails and OG images |
| Motion | Framer Motion | Scroll reveals, layout animations, shared transitions |
| Validation | Zod | Schema validation on all API routes |
| Icons | lucide-react (strokeWidth: 2.5) | Consistent line-art style matching hand-drawn aesthetic |

---

## 2. Folder Structure

```
interviewloop/
├── src/
│   ├── app/                           # Next.js App Router
│   │   ├── (public)/                  # Route group: public pages
│   │   │   ├── interview/             # Category + question pages
│   │   │   ├── search/                # Search results
│   │   │   ├── login/                 # Auth pages
│   │   │   ├── signup/
│   │   │   └── ...
│   │   ├── (admin)/admin/             # Route group: admin dashboard
│   │   │   ├── categories/            # Category CRUD
│   │   │   ├── questions/             # Question CRUD
│   │   │   ├── flags/                 # Feature flags
│   │   │   ├── users/                 # User management
│   │   │   ├── audit-log/             # Audit log viewer
│   │   │   └── layout.tsx             # Admin shell (sidebar, nav)
│   │   ├── api/                       # API routes
│   │   │   ├── auth/                  # NextAuth endpoints
│   │   │   ├── categories/            # Category CRUD API
│   │   │   ├── questions/             # Question CRUD API
│   │   │   ├── search/                # Search API
│   │   │   ├── suggestions/           # Public suggestion form
│   │   │   ├── flags/                 # Feature flag API
│   │   │   └── health/                # Health check
│   │   ├── globals.css                # Design tokens + global styles
│   │   ├── layout.tsx                 # Root layout (fonts, metadata)
│   │   └── page.tsx                   # Landing page
│   │
│   ├── components/                    # React components
│   │   ├── ui/                        # Base design system (Button, Card, Input, Badge, Accordion)
│   │   ├── layout/                    # Header, Footer, Sidebar
│   │   ├── question/                  # QuestionAccordion, VideoPlayer, VideoSwitcher
│   │   ├── category/                  # CategoryCard, CategoryGrid
│   │   ├── admin/                     # Admin-specific components
│   │   └── shared/                    # Shared utilities (SEO, Analytics wrapper)
│   │
│   ├── lib/                           # Server-side utilities
│   │   ├── db/                        # MongoDB connection + models
│   │   │   ├── connection.ts          # Singleton connection manager
│   │   │   ├── index.ts               # Barrel export
│   │   │   └── models/               # Mongoose models (Phase 2)
│   │   ├── auth/                      # Auth config + RBAC middleware (Phase 3)
│   │   ├── validators/                # Zod schemas (Phase 2)
│   │   ├── embed/                     # Video URL normalization + allowlist (Phase 2)
│   │   ├── analytics/                 # Abstract analytics layer (Phase 10)
│   │   └── utils/                     # General utilities
│   │
│   ├── styles/                        # Additional style modules (if needed)
│   │
│   └── types/                         # TypeScript type definitions
│       └── index.ts                   # Core types mirroring Mongoose schemas
│
├── scripts/                           # Seed scripts, migrations
│   └── seed.ts                        # Database seed script (Phase 2)
│
├── public/                            # Static assets
│   ├── images/                        # Category icons, OG images
│   └── fonts/                         # (next/font handles this, but fallback location)
│
├── .env.example                       # Environment variable template
├── .env.local                         # Local dev env (gitignored)
├── .prettierrc                        # Prettier configuration
├── eslint.config.mjs                  # ESLint configuration
├── next.config.ts                     # Next.js configuration
├── package.json                       # Dependencies + scripts
└── tsconfig.json                      # TypeScript configuration
```

### Route Groups

The `(public)` and `(admin)` route groups serve two purposes:
1. **Code splitting**: Admin JS bundle is completely separate from the public bundle, so admin dashboard code is never shipped to public visitors.
2. **Layout isolation**: Admin pages use a different layout (sidebar nav, calmer visual variant) without affecting public pages.

---

## 3. Design Token System

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

Fonts are self-hosted via `next/font` (no external requests):
- **Kalam**: Headings, hero text, badges
- **Patrick Hand**: Body text, question text, UI labels

---

## 4. Data Flow

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
    └── Client Components → fetch() to API routes (for mutations)
```

### Key Patterns
- **Read path (public)**: Server Components query MongoDB directly — no API round-trip needed
- **Write path (admin)**: Client-side forms → API routes → Zod validation → Mongoose → audit log
- **ISR**: Category and question pages use Incremental Static Regeneration (revalidate: 3600s), with on-demand revalidation triggered by admin publish actions

---

## 5. Security Architecture

| Layer | Implementation | Phase |
|---|---|---|
| Auth | NextAuth.js JWT, HttpOnly/Secure/SameSite cookies | 3 |
| RBAC | `requireRole()` middleware on all admin routes + mutating APIs | 3 |
| Input validation | Zod schemas on every API route | 2 |
| XSS prevention | `sanitize-html` allowlist on rich-text before storage | 8 |
| Embed safety | URL normalization to strict templates; reject unknown patterns | 2 |
| Rate limiting | IP-based on auth + public write endpoints | 3 |
| CSP | `frame-src` restricted to embed provider allowlist | 8 |
| CSRF | SameSite cookies + explicit tokens on admin forms | 8 |

---

## 6. Dependencies

### Production
| Package | Version | Purpose |
|---|---|---|
| `next` | 16.x | Framework |
| `react` / `react-dom` | 19.x | UI library |
| `mongoose` | latest | MongoDB ODM |
| `next-auth` | beta (v5) | Authentication |
| `bcryptjs` | latest | Password hashing |
| `zod` | latest | Schema validation |
| `framer-motion` | latest | Animations |
| `lucide-react` | latest | Icons |
| `sanitize-html` | latest | XSS prevention |

### Development
| Package | Version | Purpose |
|---|---|---|
| `typescript` | ^5 | Type checking |
| `tailwindcss` | ^4 | Styling |
| `eslint` + `eslint-config-next` | latest | Linting |
| `prettier` + `eslint-config-prettier` | latest | Formatting |
| `tsx` | latest | Run TypeScript scripts (seed, etc.) |

---

## 7. Phase Status

| Phase | Status | Notes |
|---|---|---|
| 0 — Project Setup | ✅ Complete | Fonts, DB connection, health-check, config |
| 1 — Design Tokens & Components | 🔲 Not started | |
| 2 — Data Layer & Schema | 🔲 Not started | |
| 3 — Auth & RBAC | 🔲 Not started | |
| 4 — Admin Dashboard | 🔲 Not started | |
| 5 — Public Pages | 🔲 Not started | |
| 6 — Content Seeding | 🔲 Not started | Decoupled from engineering |
| 7 — SEO Layer | 🔲 Not started | |
| 8 — Security Hardening | 🔲 Not started | |
| 9 — Performance & A11y | 🔲 Not started | |
| 10 — Launch Readiness | 🔲 Not started | |
