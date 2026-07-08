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
├── lib/                  # Utilities, DB, models
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
- `/profile` — User profile
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

## Authentication Flow

1. NextAuth v5 handles credentials and OAuth
2. Session is fetched server-side in layouts
3. RBAC middleware protects admin routes
4. Rate limiting on auth endpoints
