<div align="center">

# ✏️ Loopora

### Ace Every Kind of Interview Question

**Text answers on the left. Video proof on the right.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/atlas)
[![Tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![AI](https://img.shields.io/badge/Gemini-2.5_Flash-8E75B2?style=for-the-badge&logo=googlegemini)](https://deepmind.google/gemini/)
[![Auth](https://img.shields.io/badge/NextAuth-v5-FF6F00?style=for-the-badge&logo=auth0)](https://next-auth.js.org/)
[![License](https://img.shields.io/badge/License-Private-red?style=for-the-badge)](#)

---

*Structured interview preparation platform with 500+ frequently asked questions, written model answers, and real video explanations across HR, Technical, Situational, and 5+ more interview types.*

</div>

---

## 🎯 What is Loopora?

Loopora is an **SEO-optimized interview preparation SaaS** where candidates can:

- 📋 **Browse by category** — HR, Technical, Situational, Managerial, Aptitude, and more
- 📊 **See frequency rankings** — know which questions are actually asked the most
- 📝 **Read model answers** — structured written responses with examples
- 🎬 **Watch video explanations** — multiple video sources per question, switchable inline
- 🔗 **Share deep links** — every question has a unique, shareable URL

> **Think of it as Leetcode-style structured practice, but for every kind of interview question.**

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🎨 **Hand-Drawn Design System** | Unique notebook/sketchbook aesthetic with wobbly borders, paper textures, and marker-pen colors |
| 📹 **Multi-Video Switcher** | Switch between multiple video sources per question without collapsing the panel |
| ⚡ **ISR + SSR** | Incremental Static Regeneration for fast page loads with always-fresh content |
| 🔍 **Full-Text Search** | Search across questions, answers, and tags instantly |
| 🛡️ **Admin CMS** | Full content management with bulk import, feature flags, and audit logging |
| 🧠 **AI Resume Personalization** | Upload your resume; Gemini AI generates tailored answers using your background |
| 📄 **Resume Upload** | Secure multi-layer validation: magic bytes, MIME, extension, 5MB limit, 8-page cap, macro detection |
| 📊 **SEO-First** | FAQPage JSON-LD, dynamic sitemap, OG cards, semantic HTML |
| ♿ **Accessible** | WCAG 2.1 AA — keyboard-navigable, screen-reader friendly, reduced-motion support |
| 🔒 **Secure** | RBAC, input sanitization, embed URL allowlisting, rate limiting, CSP headers, SHA-256 dedup |

---

## 🏗️ Tech Stack

```
Frontend        → Next.js 16 (App Router) + React 19 + TypeScript
Styling         → Tailwind CSS v4 + CSS Custom Properties (design tokens)
Database        → MongoDB Atlas + Mongoose ODM
Authentication  → NextAuth.js v5 (Credentials + Google OAuth)
Animations      → GSAP 3 + Lenis + Framer Motion
Icons           → Lucide React
Validation      → Zod (all API routes)
Fonts           → Kalam + Patrick Hand (self-hosted via next/font)
Hosting         → Vercel + MongoDB Atlas
```

---

## 📁 Project Structure

```
src/
├── app/                        # Next.js App Router
│   ├── (public)/               # Public pages (code-split from admin)
│   │   ├── interview/          # Category + question pages
│   │   ├── search/             # Global search
│   │   ├── login/ & signup/    # Auth pages
│   │   └── ...
│   ├── (admin)/admin/          # Admin dashboard (separate JS bundle)
│   │   ├── categories/         # Category CRUD
│   │   ├── questions/          # Question CRUD + video manager
│   │   ├── flags/              # Feature flags
│   │   └── ...
│   ├── api/                    # API routes
│   └── globals.css             # Design tokens + global styles
│
├── components/                 # React components
│   ├── ui/                     # Design system (Button, Card, Input, etc.)
│   ├── question/               # Accordion, VideoPlayer, VideoSwitcher
│   └── ...
│
├── lib/                        # Server-side utilities
│   ├── db/                     # MongoDB connection + models
│   ├── auth/                   # Auth config + RBAC
│   ├── validators/             # Zod schemas
│   └── embed/                  # Video URL normalization
│
└── types/                      # TypeScript definitions
```

> **Route groups** `(public)` and `(admin)` ensure admin code is never shipped to public visitors.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- **MongoDB Atlas** account ([free tier](https://www.mongodb.com/atlas/database))

### 1. Clone the repository

```bash
git clone https://github.com/AniketK100/Loopora.git
cd Loopora
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your **MongoDB Atlas connection string** and other required values. See [`.env.example`](.env.example) for all available options with inline documentation.

### 4. Start development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### 5. Verify setup

```bash
# Health check (should return { status: "ok", db: "connected" })
curl http://localhost:3000/api/health
```

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server (Turbopack) |
| `npm run build` | Create production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint checks |
| `npm run lint:fix` | Auto-fix ESLint issues |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check code formatting |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run seed` | Seed database with sample data |
| `npm run promote` | Promote user to admin/editor role |

---

## 🎨 Design System

Loopora uses a **hand-drawn notebook aesthetic** with carefully crafted design tokens:

| Token | Value | Usage |
|---|---|---|
| 🟡 Paper White | `#FAF8F5` | Background |
| ⚫ Pencil Black | `#2D2D2D` | Text, borders |
| 🔴 Marker Red | `#E63946` | CTAs, accent |
| 🔵 Ballpoint Blue | `#457B9D` | Links, secondary |
| 🟡 Post-it Yellow | `#FFE066` | Badges, highlights |

Borders use **wobbly radius** values to simulate imperfect hand-drawn shapes. All tokens are defined as CSS custom properties in [`src/app/globals.css`](src/app/globals.css).

---

## 🏛️ Architecture

See [docs/](docs/) for comprehensive documentation:

| Document | Description |
|---|---|
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | System architecture, tech stack, route structure |
| [LANDING_PAGE.md](docs/LANDING_PAGE.md) | Landing page component guide |
| [ANIMATION_SYSTEM.md](docs/ANIMATION_SYSTEM.md) | GSAP, Lenis, Framer Motion integration |
| [GIT_WORKFLOW.md](docs/GIT_WORKFLOW.md) | Branch strategy, safe workflows |
| [ROLLBACK.md](docs/ROLLBACK.md) | Recovery procedures, emergency checklist |
| [PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md) | Complete file tree |
| [API.md](docs/API.md) | API route reference |
| [AI.md](docs/AI.md) | Gemini integration, resume parsing, personalized answers |
| [SECURITY.md](docs/SECURITY.md) | Security features and validation |
| [DEPENDENCIES.md](docs/DEPENDENCIES.md) | Package inventory and scripts |

---

## 📋 Development Phases

| Phase | Status | Description |
|---|---|---|
| 0 — Project Setup | ✅ | Next.js, fonts, DB connection, health-check |
| 1 — Design Tokens & Components | ✅ | CSS tokens, base UI components |
| 2 — Data Layer & Schema | ✅ | Mongoose models, CRUD APIs, seed script |
| 3 — Auth & RBAC | ✅ | NextAuth, role guards, login/signup |
| 4 — Admin Dashboard | ✅ | CMS, video manager, bulk import, flags |
| 5 — Public Pages | ✅ | Landing, categories, accordion + video component |
| 6 — Content Seeding | ✅ | 50+ questions per category |
| 7 — SEO Layer | ✅ | JSON-LD, sitemap, OG tags |
| 8 — Security Hardening | ✅ | CSP, sanitization, audit |
| 9 — Performance & A11y | ✅ | Lighthouse, keyboard nav, WCAG |
| 10 — Launch Readiness | ✅ | Legal pages, analytics, monitoring |
| 11 — AI Personalization | ✅ | Gemini integration, resume upload, personalized answers |

---

---

## 🛡️ Security Architecture

Loopora implements **defense-in-depth** across every layer:

| Layer | Controls |
|---|---|
| **Authentication** | JWT with 30-day expiry, rate-limited login (10/min/IP), CSRF protection, HTTP-only cookies |
| **Authorization** | Role-based access (user/editor/admin) enforced server-side on every mutating API route |
| **Premium Gating** | Premium content (`isPremium`) enforced server-side — free users never receive full answers |
| **Input Validation** | Zod schemas on every API route — type coercion, regex allowlisting, length limits |
| **HTML Sanitization** | All rich-text answers sanitized via `sanitize-html` before storage |
| **NoSQL Injection** | All query params explicitly validated — MongoDB operators cannot be injected |
| **Rate Limiting** | DB-backed sliding window: register (10/min), login (10/min), uploads (5/min), search (30/min), AI (10/min) |
| **Resume Upload** | 16-step pipeline: magic bytes → MIME verification → encryption detect → macro scan → prompt injection scan → page limit → content hash → heuristics + AI classification |
| **Video Embed** | Strict URL allowlisting — only YouTube, Vimeo, Loom, Google Drive, Instagram MP4 embed URLs are accepted |
| **Security Headers** | CSP, HSTS (2 years), X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy, Permissions-Policy |
| **Error Handling** | All server errors return generic `"Internal Server Error"` — stack traces logged server-side only |
| **Audit Logging** | All mutating actions logged with actor, action, entity, and before/after diff |
| **DPDP Compliance** | Account deletion cascades: anonymizes audit logs, deletes sessions, erases user record |

### Security Headers (CSP)

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: res.cloudinary.com img.youtube.com i.vimeocdn.com; font-src 'self' data:; frame-src 'self' https://www.youtube.com/ https://www.youtube-nocookie.com/ https://player.vimeo.com/ https://www.loom.com/ https://drive.google.com/ https://www.instagram.com/; connect-src 'self' ws: wss:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; block-all-mixed-content; upgrade-insecure-requests
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

---

## 🧠 Premium Features & AI Pipeline

| Feature | Free | Premium |
|---|---|---|
| Resume Storage | 1 resume | Up to 3 resumes |
| Personalized Answers | Top 10 questions | All questions |
| AI Resume Analysis | ✓ | ✓ |
| Resume Quality Score | ✓ | ✓ |

The AI pipeline uses **Google Gemini 2.5 Flash** with structured JSON output:
1. **Heuristic Classification** — regex-based resume signal detection (email, phone, skills, etc.)
2. **AI Classification** — Gemini classifies document as resume/non-resume (confidence ≥ 0.75)
3. **Quality Analysis** — Gemini scores 0-100, identifies missing sections, gives suggestions
4. **Personalized Answers** — Gemini generates tailored answers using resume context

---

## 🚢 Production Deployment

### Vercel (Recommended)

```bash
# 1. Set environment variables in Vercel dashboard
# Required: MONGODB_URI, NEXTAUTH_SECRET, NEXTAUTH_URL, GEMINI_API_KEY

# 2. Build and deploy
npm run build
npx vercel --prod
```

### MongoDB Atlas

- **Cluster**: M0 free tier (suitable for production-scale read-heavy workloads)
- **Indexes**: Compound + text indexes on questions; unique indexes on user email, resume hash
- **TTL Indexes**: Rate limits (auto-expire), sessions (30-day), personalized answers (90-day)

### PostHog Analytics

- Client-side via `posthog-js` (ingress proxied through Next.js rewrites)
- Server-side via `posthog-node` for backend events
- Session recording (masked), autocapture (masked), feature flags

---

## 📈 Performance Optimizations

| Optimization | Implementation |
|---|---|
| Bundle Splitting | Admin and public routes are separate route groups — admin code never ships to visitors |
| Dynamic Imports | PDF parser (`pdfjs-dist`) imported lazily in upload route |
| Image Optimization | Next.js Image component with Cloudinary + YouTube/Vimeo thumbnails |
| Font Loading | Self-hosted via `next/font` — no render-blocking external requests |
| API Light Fields | List endpoints exclude `answer.detailed` and `videos` arrays |
| DB Indexes | Text indexes, compound unique indexes, TTL indexes |
| Caching | Resume analysis cached by SHA-256 content hash; personalized answers cached per (user, question, hash, model) |
| ISR | Sitemap regenerated hourly; static pages served from edge |

---

## 🔑 Environment Variables

Copy `.env.example` to `.env.local` for development. Required variables:

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | ✅ | MongoDB Atlas connection string |
| `NEXTAUTH_SECRET` | ✅ | JWT encryption secret |
| `NEXTAUTH_URL` | ✅ | Canonical app URL |
| `GEMINI_API_KEY` | ✅ | Google Gemini AI API key |
| `GOOGLE_CLIENT_ID` | ❌ | Google OAuth (optional) |
| `CLOUDINARY_API_KEY` | ❌ | Image CDN (optional) |

See [`.env.example`](.env.example) for the complete list with documentation.

---

## 🤝 Contributing

This is a private project. Please contact the repository owner for access.

---

<div align="center">

**Built with ☕ and ✏️**

*Because every interview question deserves a great answer — and a video to prove it.*

</div>
