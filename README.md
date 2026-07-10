<div align="center">

# ✏️ Loopora

### Ace Every Interview Question

**Text answers on the left. Video proof on the right.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/atlas)
[![Tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Gemini](https://img.shields.io/badge/Gemini-2.5_Flash-8E75B2?style=for-the-badge&logo=googlegemini)](https://deepmind.google/gemini/)
[![NextAuth](https://img.shields.io/badge/NextAuth-v5-FF6F00?style=for-the-badge&logo=auth0)](https://next-auth.js.org/)
[![PostHog](https://img.shields.io/badge/PostHog-Analytics-000?style=for-the-badge&logo=posthog)](https://posthog.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000?style=for-the-badge&logo=vercel)](https://vercel.com/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)
[![GitHub](https://img.shields.io/badge/GitHub-AniketK100-181717?style=for-the-badge&logo=github)](https://github.com/AniketK100)

---

Structured interview preparation platform with 500+ frequently asked questions, written model answers, and real video explanations across HR, Technical, Situational, Managerial, Aptitude, and Case Study interview types.

[Live Demo](https://loopora.vercel.app) · [Report Bug](https://github.com/AniketK100/Loopora/issues) · [Request Feature](https://github.com/AniketK100/Loopora/issues)

</div>

---

## Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Screenshots](#-screenshots)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Deployment](#-deployment)
- [Security](#-security)
- [API Overview](#-api-overview)
- [Performance](#-performance)
- [Roadmap](#-roadmap)
- [Documentation](#-documentation)
- [Contributing](#-contributing)
- [Developer](#-developer)
- [License](#-license)

---

## 📌 Overview

Loopora is a **production-grade interview preparation SaaS** that helps candidates prepare for any interview type. Unlike scattered YouTube videos or generic question banks, Loopora provides:

- **Curated questions** organized by interview type (HR, Technical, Situational, etc.)
- **Model answers** written by experienced professionals
- **Video walkthroughs** from multiple sources per question
- **AI-powered personalization** — upload your resume and get answers tailored to your background
- **Premium tier** with extended storage and unlimited personalized answers

> *"Like LeetCode for interview questions — but covering every category, not just coding."*

---

## ✨ Features

### Core Platform

| Feature | Description |
|---|---|
| **Question Library** | 500+ curated questions across 8 interview categories with frequency rankings |
| **Model Answers** | Structured written responses with short summaries, detailed answers, and STAR examples |
| **Video Learning** | Multiple video sources per question (YouTube, Vimeo, Loom, Drive, Instagram) with inline switching |
| **Full-Text Search** | MongoDB-powered search across questions, answers, and tags |
| **Deep Linking** | Every question has a unique, shareable URL |

### AI & Personalization

| Feature | Description |
|---|---|
| **Resume Upload** | Secure 16-step validation pipeline with magic bytes, encryption detection, prompt injection scanning, and AI classification |
| **Resume Analysis** | Google Gemini extracts target role, skills, and experience from uploaded resumes |
| **Resume Quality Score** | AI-powered 0-100 quality assessment with missing section detection and suggestions |
| **Personalized Answers** | Gemini generates tailored interview answers using your resume context |
| **Folder Personalization** | Select up to 2 interview folders and get AI-personalized answers for every question |

### Admin & Management

| Feature | Description |
|---|---|
| **Admin Dashboard** | Full CMS for questions, categories, feature flags, and user management |
| **Bulk Import** | Import questions and categories in bulk via JSON |
| **Audit Logging** | Complete audit trail for all data mutations |
| **Session Management** | Track and revoke user sessions |
| **Rate Limit Management** | Admin can clear rate-limited IPs |

### Security

| Feature | Description |
|---|---|
| **RBAC** | Three-tier role system (user, editor, admin) with server-side enforcement |
| **Premium Gating** | Premium content enforced server-side — free users never receive full answers |
| **Rate Limiting** | DB-backed sliding window on auth, upload, search, and AI endpoints |
| **Input Validation** | Zod schemas on every API route |
| **CSP + HSTS** | Comprehensive security headers via edge middleware |
| **Audit Trail** | Every mutation logged with actor, action, entity, and diff |

---

## 📸 Screenshots

<div align="center">

| Landing Page | Interview Workspace | Resume Upload |
|---|---|---|
| *[Screenshot placeholder]* | *[Screenshot placeholder]* | *[Screenshot placeholder]* |

| AI Personalized Answers | Admin Dashboard | Search |
|---|---|---|
| *[Screenshot placeholder]* | *[Screenshot placeholder]* | *[Screenshot placeholder]* |

</div>

---

## 🏗️ Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| [Next.js 16](https://nextjs.org/) (App Router) | React framework with server components, ISR, and edge runtime |
| [TypeScript 5](https://www.typescriptlang.org/) | Type safety across the entire codebase |
| [Tailwind CSS v4](https://tailwindcss.com/) | Utility-first styling with custom design tokens |
| [GSAP 3](https://gsap.com/) + [Lenis](https://lenis.studiofreight.com/) | Scroll-triggered animations and smooth scrolling |
| [Framer Motion](https://www.framer.com/motion/) | UI micro-interactions |
| [Lucide React](https://lucide.dev/) | Consistent icon set |

### Backend & Data

| Technology | Purpose |
|---|---|
| [MongoDB Atlas](https://www.mongodb.com/atlas) | Document database with text search and TTL indexes |
| [Mongoose 9](https://mongoosejs.com/) | ODM with schema validation, hooks, and indexes |
| [NextAuth v5](https://next-auth.js.org/) (beta) | Authentication with JWT, credentials, and Google OAuth |
| [Zod 4](https://zod.dev/) | Runtime validation on all API inputs |

### AI & Analytics

| Technology | Purpose |
|---|---|
| [Google Gemini 2.5 Flash](https://deepmind.google/gemini/) | Resume classification, quality analysis, and personalized answer generation |
| [PostHog](https://posthog.com/) | Product analytics, session recording, and feature flags |
| [sanitize-html](https://www.npmjs.com/package/sanitize-html) | XSS prevention on rich-text content |

### Deployment

| Technology | Purpose |
|---|---|
| [Vercel](https://vercel.com/) | Hosting with edge functions and automatic HTTPS |
| [MongoDB Atlas](https://www.mongodb.com/atlas) | Managed database with free tier |

---

## 🏛️ Architecture

### Request Flow

```
                         ┌─────────────────┐
                         │    Vercel Edge   │
                         │    Middleware    │
                         │  (CSP, HSTS,    │
                         │   Auth Guard)   │
                         └────────┬────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
                    ▼                           ▼
          ┌─────────────────┐         ┌─────────────────┐
          │   Public Pages   │         │   Admin Pages   │
          │  (Server-rendered)│         │ (Role-protected)│
          └────────┬────────┘         └────────┬────────┘
                   │                           │
                   ▼                           ▼
          ┌─────────────────┐         ┌─────────────────┐
          │   API Routes    │         │   Admin APIs    │
          │ (Zod validated) │         │ (RBAC enforced) │
          └────────┬────────┘         └────────┬────────┘
                   │                           │
                   └─────────────┬─────────────┘
                                 │
                                 ▼
                      ┌─────────────────┐
                      │   MongoDB Atlas  │
                      │  (Mongoose ODM)  │
                      └─────────────────┘
```

### Authentication Flow

```
User → Login Form → Credentials Provider → bcrypt verify → JWT issued
                                                           │
                    ┌──────────────────────────────────────┘
                    ▼
         ┌─────────────────────┐
         │  NextAuth JWT       │
         │  (30-day expiry)    │
         │  role + isPremium   │
         └─────────────────────┘
                    │
          ┌─────────┴─────────┐
          ▼                   ▼
   Edge Middleware        API Routes
   (admin guard)          (requireRole)
```

### Resume Upload & AI Pipeline

```
Upload PDF → Magic Bytes → Encryption Check → Macro Scan → Text Extraction
                                                              │
                                                              ▼
                                              ┌──────────────────────┐
                                              │  Content Security    │
                                              │  Scan (Prompt Inj.)  │
                                              └──────────────────────┘
                                                              │
                                                              ▼
                                              ┌──────────────────────┐
                                              │  SHA-256 Hash →      │
                                              │  Check Cache         │
                                              └──────────────────────┘
                                                      │
                                            ┌─────────┴─────────┐
                                            ▼                   ▼
                                    Cache Hit            Cache Miss
                                    (Return              (Classify via
                                     cached)              Heuristics)
                                                              │
                                                              ▼
                                                    ┌──────────────────┐
                                                    │  AI Classify +   │
                                                    │  Quality + Role  │
                                                    │  (Gemini)        │
                                                    └──────────────────┘
                                                              │
                                                              ▼
                                                    ┌──────────────────┐
                                                    │  Store Resume +  │
                                                    │  Analysis        │
                                                    └──────────────────┘
```

### Database Schema

```
┌──────────┐     ┌──────────────┐     ┌────────────────┐
│  User    │────>│  Session     │     │  Resume        │
│──────────│     │──────────────│     │────────────────│
│ email*   │     │ ip           │     │ user           │
│ role     │     │ device       │     │ contentHash*   │
│ isPremium│     │ expiresAt(TTL)│    │ extractedText  │
│ bookmarks│     └──────────────┘     │ classification │
│ practiced│                         │ qualityScore   │
└──────────┘                         └───────┬────────┘
                                             │
                                    ┌────────┴────────┐
                                    │                 │
                            ┌──────────────┐  ┌────────────────┐
                            │ ResumeAnalysis│  │ Personalized   │
                            │──────────────│  │ Answer         │
                            │ contentHash* │  │────────────────│
                            │ summary      │  │ user + question │
                            │ quality      │  │ + contentHash* │
                            │ modelVersion │  │ personalizedText│
                            └──────────────┘  │ TTL: 90 days   │
                                              └────────────────┘
┌──────────┐     ┌──────────────┐     ┌────────────────┐
│ Category │────>│  Question    │     │ RateLimit      │
│──────────│     │──────────────│     │────────────────│
│ name     │     │ category     │     │ ip + endpoint* │
│ slug*    │     │ slug*        │     │ hits           │
│ type     │     │ question     │     │ expiresAt(TTL) │
│ isPublished│   │ answer.detailed│   └────────────────┘
└──────────┘     │ isPremium    │
                 │ difficulty   │
                 │ tags(text)   │
                 │ videos[]     │
                 └──────────────┘
```

---

## 📁 Project Structure

```
src/
├── app/                        # Next.js App Router
│   ├── (public)/               # Public pages (code-split from admin)
│   │   ├── interview/          # Category + question browsing
│   │   ├── search/             # Global full-text search
│   │   ├── profile/            # Resume upload, personalization, favorites
│   │   ├── login/ & signup/    # Authentication pages
│   │   └── landing/            # Home page animated sections
│   ├── (admin)/admin/          # Admin dashboard (separate JS bundle)
│   │   ├── categories/         # Category CRUD
│   │   ├── questions/          # Question CRUD with video manager
│   │   ├── users/              # User management
│   │   ├── bulk-import/        # Bulk JSON import
│   │   └── ...                 # Audit logs, flags, sessions, security
│   ├── api/                    # API routes
│   │   ├── questions/          # Question CRUD + favorite + practiced
│   │   ├── resume/             # Upload, list, manage
│   │   ├── interview/          # Personalized answers
│   │   ├── admin/              # Admin-only endpoints
│   │   └── ...                 # Auth, categories, search, profile, flags
│   ├── layout.tsx              # Root layout with fonts + JSON-LD
│   ├── middleware.ts           # Edge middleware (auth + security headers)
│   ├── sitemap.ts              # Dynamic sitemap generation
│   └── robots.ts               # Robots.txt configuration
│
├── components/                 # React components
│   ├── ui/                     # Design system primitives
│   │   ├── Button.tsx, Card.tsx, Input.tsx, Select.tsx ...
│   │   ├── Accordion.tsx, Badge.tsx, Toggle.tsx
│   │   ├── CookieConsent.tsx, FavoriteToggle.tsx
│   │   └── PracticedToggle.tsx
│   ├── Providers.tsx           # Session + PostHog providers
│   ├── ResumeManager.tsx       # Resume upload/manage UI
│   ├── JsonLd.tsx              # JSON-LD structured data
│   ├── PremiumUpgradeModal.tsx # Premium upsell
│   └── ImpersonationBanner.tsx # Admin impersonation UI
│
├── lib/                        # Business logic
│   ├── ai/                     # AI provider layer
│   │   ├── types.ts            # AIService interface
│   │   ├── provider.ts         # Provider singleton
│   │   └── gemini.ts           # Gemini implementation
│   ├── auth/                   # Auth utilities
│   │   ├── rbac.ts             # Role-based access control
│   │   └── rateLimit.ts        # DB-backed rate limiter
│   ├── db/                     # Database layer
│   │   ├── connection.ts       # MongoDB singleton connection
│   │   └── models/             # Mongoose models (10 models)
│   ├── validators/             # Zod schemas + file sniffing
│   ├── utils/                  # PDF parsing, HTML sanitization, polyfills
│   ├── embed/                  # Video URL normalization
│   ├── classification/         # Resume heuristic classifier
│   ├── analytics.ts            # Abstract analytics layer
│   └── flags.ts                # Feature flag helpers
│
└── types/                      # TypeScript definitions
    └── index.ts                # All shared types
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x
- **MongoDB Atlas** account ([free tier](https://www.mongodb.com/atlas/database))
- **Google Gemini** API key ([get one free](https://aistudio.google.com/app/apikey))

### 1. Clone

```bash
git clone https://github.com/AniketK100/Loopora.git
cd Loopora
```

### 2. Install

```bash
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` and add these required variables:

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `http://localhost:3000` |
| `GEMINI_API_KEY` | Your Gemini API key |

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Verify

```bash
curl http://localhost:3000/api/health
# → { "status": "ok", "db": "connected", ... }
```

### Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Development server (Turbopack) |
| `npm run build` | Production build |
| `npm start` | Production server |
| `npm run lint` | ESLint check |
| `npm run typecheck` | TypeScript type check |
| `npm run format` | Prettier format |

---

## 🚢 Deployment

### Vercel (Recommended)

```bash
# 1. Push to GitHub
# 2. Import in Vercel dashboard
# 3. Set environment variables
# 4. Deploy
npm run build
npx vercel --prod
```

### Required Environment Variables (Production)

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | ✅ | MongoDB Atlas SRV connection string |
| `NEXTAUTH_SECRET` | ✅ | JWT encryption key |
| `NEXTAUTH_URL` | ✅ | Production URL |
| `GEMINI_API_KEY` | ✅ | Google Gemini API key |
| `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` | ❌ | PostHog analytics |
| `GOOGLE_CLIENT_ID` | ❌ | Google OAuth |
| `GOOGLE_CLIENT_SECRET` | ❌ | Google OAuth |

### PostHog Setup

1. Create project at [us.posthog.com](https://us.posthog.com)
2. Copy Project API key to `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN`
3. Set `NEXT_PUBLIC_ANALYTICS_PROVIDER=posthog`

---

## 🛡️ Security

Loopora implements **defense-in-depth** across every layer:

| Layer | Implementation |
|---|---|
| **Authentication** | JWT with 30-day expiry, HTTP-only/Secure/SameSite cookies, CSRF protection |
| **Authorization** | Three-tier RBAC (user/editor/admin) enforced server-side on every API route |
| **Premium Gating** | Server-side enforcement — free users never receive premium answer content |
| **Input Validation** | Zod schemas on every API route with type coercion and regex allowlisting |
| **NoSQL Injection** | Query parameters explicitly validated against allowlists before database queries |
| **HTML Sanitization** | All rich-text content sanitized via `sanitize-html` before storage |
| **Rate Limiting** | DB-backed sliding window: login (10/min), register (10/min), upload (5/min), search (30/min), AI (10/min) |
| **Resume Upload** | 16-step pipeline: magic bytes → MIME check → encryption detect → macro scan → prompt injection scan → page limit → SHA-256 hash → heuristics → AI classification |
| **Security Headers** | CSP, HSTS (2 years), X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy, Permissions-Policy |
| **Error Handling** | Generic error messages to clients; full details logged server-side only |
| **Audit Logging** | All mutations logged with actor, action, entity, and before/after diff |
| **DPDP Compliance** | Account data export and cascading deletion endpoints |

### Security Headers

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; ...
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

---

## 📡 API Overview

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/health` | GET | None | Server health check |
| `/api/auth/register` | POST | None | User registration |
| `/api/auth/[...nextauth]` | GET/POST | Varies | NextAuth handlers |
| `/api/categories` | GET | None | List categories |
| `/api/categories/[id]` | GET/PATCH/DELETE | Admin/Editor | Category CRUD |
| `/api/questions` | GET | None | List questions (filtered, paginated) |
| `/api/questions/[id]` | GET/PATCH/DELETE | Varies | Question detail + CRUD |
| `/api/questions/[id]/favorite` | POST | User | Toggle bookmark |
| `/api/questions/[id]/practiced` | POST | User | Toggle practiced |
| `/api/search?q=` | GET | None | Full-text search |
| `/api/resume/upload` | POST | User | Upload resume (16-step validation) |
| `/api/resume/list` | GET | User | List my resumes |
| `/api/resume/[id]` | PATCH/DELETE | User | Manage resume |
| `/api/interview/[folder]/personalized` | GET | User | AI personalized answers |
| `/api/profile` | GET/PATCH/DELETE | User | Profile management |
| `/api/profile/folders` | POST | User | Select personalization folders |
| `/api/suggestions` | POST | None | Submit suggestion |
| `/api/admin/users/[id]` | PATCH | Admin | User management |
| `/api/admin/impersonate` | POST | Admin | User impersonation |
| `/api/bulk-import` | POST | Admin | Bulk content import |

---

## 📈 Performance

| Optimization | Implementation |
|---|---|
| **Code Splitting** | Route groups separate admin and public bundles |
| **Dynamic Imports** | PDF parser (`pdfjs-dist`) and Gemini SDK imported lazily |
| **Light Projections** | List APIs exclude heavy fields (`answer.detailed`, `videos`) |
| **Caching** | Resume analysis cached via SHA-256 hash; personalized answers cached per (user, question, hash) |
| **ISR** | Sitemap regenerated hourly |
| **Font Loading** | Self-hosted via `next/font` — no render-blocking requests |
| **DB Indexes** | Text indexes, compound unique indexes, TTL auto-cleanup |

---

## 🗺️ Roadmap

### Short-term
- [ ] Stripe subscription for automated premium upsells
- [ ] Email verification flow
- [ ] Password reset
- [ ] Sentry error monitoring

### Medium-term
- [ ] Company dashboard for hiring teams
- [ ] Interview simulator with timed responses
- [ ] AI-powered answer feedback
- [ ] Community Q&A

### Long-term
- [ ] Mobile app (React Native)
- [ ] AI interviewer (voice-based)
- [ ] Collaborative interview prep
- [ ] Enterprise SSO (SAML/OIDC)

---

## 📚 Documentation

| Document | Description |
|---|---|
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | System architecture, tech stack, route structure |
| [SECURITY.md](docs/SECURITY.md) | Security features, validation, rate limiting |
| [API.md](docs/API.md) | Complete API route reference |
| [AI.md](docs/AI.md) | Gemini integration, resume pipeline, personalized answers |
| [DEPLOYMENT.md](docs/DEPLOYMENT.md) | Production deployment guide |
| [PERFORMANCE.md](docs/PERFORMANCE.md) | Performance optimizations |
| [PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md) | Complete file tree |
| [DEPENDENCIES.md](docs/DEPENDENCIES.md) | Package inventory |
| [ROADMAP.md](docs/ROADMAP.md) | Future plans |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Contribution guidelines |

---

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create your feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

---

## 👨‍💻 Developer

**Aniket Kakad**

- GitHub: [@AniketK100](https://github.com/AniketK100)
- Project: [Loopora on GitHub](https://github.com/AniketK100/Loopora)

Built with Next.js, TypeScript, MongoDB Atlas, Google Gemini, and ❤️.

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

---

## 🙏 Acknowledgements

- [Next.js](https://nextjs.org/) — The React framework
- [MongoDB Atlas](https://www.mongodb.com/atlas) — Database platform
- [Google Gemini](https://deepmind.google/gemini/) — AI capabilities
- [NextAuth.js](https://next-auth.js.org/) — Authentication
- [PostHog](https://posthog.com/) — Product analytics
- [Vercel](https://vercel.com/) — Hosting platform
- [Tailwind CSS](https://tailwindcss.com/) — Styling framework
- [Lucide](https://lucide.dev/) — Icon library
- [GSAP](https://gsap.com/) — Animation library
- [Zod](https://zod.dev/) — Schema validation

---

<div align="center">

**Built with ☕ and ✏️**

*Because every interview question deserves a great answer — and a video to prove it.*

</div>
