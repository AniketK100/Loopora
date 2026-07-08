# Project Structure

```
interviewloop/
├── .env.example              # Environment variable template
├── .gitignore                # Git ignore rules
├── .prettierrc               # Prettier configuration
├── ARCHITECTURE.md           # Project architecture doc
├── CHANGELOG.md              # Version history
├── README.md                 # Project overview
├── eslint.config.mjs         # ESLint configuration
├── next.config.ts            # Next.js configuration
├── package.json              # Dependencies and scripts
├── postcss.config.mjs        # PostCSS configuration
├── tsconfig.json             # TypeScript configuration
│
├── docs/                     # Documentation
│   ├── ARCHITECTURE.md       # System architecture
│   ├── LANDING_PAGE.md       # Landing page guide
│   ├── ANIMATION_SYSTEM.md   # Animation documentation
│   ├── GIT_WORKFLOW.md       # Git procedures
│   ├── ROLLBACK.md           # Recovery procedures
│   ├── PROJECT_STRUCTURE.md  # This file
│   └── DEPENDENCIES.md       # Dependency guide
│
├── public/                   # Static assets
│
├── scripts/                  # Utility scripts
│   ├── seed.ts              # Database seeding
│   └── promote.ts           # User promotion
│
├── src/
│   ├── app/
│   │   ├── (admin)/         # Admin route group
│   │   ├── (public)/        # Public route group
│   │   ├── api/             # API endpoints
│   │   ├── design-system/   # Design system reference
│   │   ├── globals.css      # Design tokens + global styles
│   │   ├── layout.tsx       # Root layout
│   │   ├── robots.ts        # Robots.txt config
│   │   └── sitemap.ts       # Dynamic sitemap
│   │
│   │   └── (public)/
│   │       ├── PremiumLandingPage.tsx
│   │       ├── landing/
│   │       │   ├── CableSystem.tsx
│   │       │   ├── FinalScene.tsx
│   │       │   ├── LandingHero.tsx
│   │       │   ├── NotebookTear.tsx
│   │       │   ├── StationBookmarks.tsx
│   │       │   ├── StationCommunity.tsx
│   │       │   ├── StationSearch.tsx
│   │       │   ├── StationSTAR.tsx
│   │       │   ├── useScrollOrchestrator.ts
│   │       │   └── components/
│   │       │       ├── Laptop.tsx
│   │       │       ├── Monitor.tsx
│   │       │       ├── NotebookAsset.tsx
│   │       │       └── Shelf.tsx
│   │       └── ...
│   │
│   ├── components/          # Shared components
│   │   ├── ui/             # Primitive UI kit
│   │   ├── LenisProvider.tsx
│   │   ├── Providers.tsx
│   │   └── ImpersonationBanner.tsx
│   │
│   ├── lib/                 # Business logic
│   │   ├── auth/           # Auth utilities
│   │   ├── db/             # Database models + connection
│   │   ├── embed/          # Embed normalization
│   │   ├── utils/          # General utilities
│   │   └── validators/     # Zod schemas
│   │
│   ├── auth.config.ts      # Auth configuration
│   ├── auth.ts             # Auth setup
│   └── middleware.ts       # Next.js middleware
│
└── scratch/                 # Temporary test files
```
