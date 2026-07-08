<div align="center">

# ✏️ Loopora

### Ace Every Kind of Interview Question

**Text answers on the left. Video proof on the right.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/atlas)
[![Tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
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
| 📊 **SEO-First** | FAQPage JSON-LD, dynamic sitemap, OG cards, semantic HTML |
| ♿ **Accessible** | WCAG 2.1 AA — keyboard-navigable, screen-reader friendly, reduced-motion support |
| 🔒 **Secure** | RBAC, input sanitization, embed URL allowlisting, rate limiting, CSP headers |

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

---

## 🔒 Environment Variables

Copy `.env.example` to `.env.local` for development. Required variables:

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | ✅ | MongoDB Atlas connection string |
| `NEXTAUTH_SECRET` | ✅ | JWT encryption secret |
| `NEXTAUTH_URL` | ✅ | Canonical app URL |
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
