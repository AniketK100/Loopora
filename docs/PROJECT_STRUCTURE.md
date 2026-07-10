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
│   ├── AI.md                 # AI pipeline documentation
│   ├── ANIMATION_SYSTEM.md   # Animation documentation
│   ├── API.md                # API route reference
│   ├── ARCHITECTURE.md       # System architecture
│   ├── DEPENDENCIES.md       # Dependency guide
│   ├── DEPLOYMENT.md         # Production deployment guide
│   ├── GIT_WORKFLOW.md       # Git procedures
│   ├── LANDING_PAGE.md       # Landing page guide
│   ├── PERFORMANCE.md        # Performance optimizations
│   ├── PROJECT_STRUCTURE.md  # This file
│   ├── ROADMAP.md            # Future plans
│   ├── ROLLBACK.md           # Recovery procedures
│   └── SECURITY.md           # Security documentation
│
├── public/                   # Static assets
│   └── og-image.png          # Open Graph image
│
├── scripts/                  # Utility scripts
│   ├── create-admin.ts       # Create admin user
│   ├── promote.ts            # Promote user role
│   ├── seed-content.ts       # Content seeding batch 1
│   ├── seed-content-batch2.ts# Content seeding batch 2
│   ├── seed-content-batch3.ts# Content seeding batch 3
│   └── seed.ts               # Database seeding
│
├── src/
│   ├── app/
│   │   ├── (admin)/admin/    # Admin dashboard CMS
│   │   │   ├── audit-logs/   # Audit trail viewer
│   │   │   ├── bulk-import/  # Bulk question import
│   │   │   ├── categories/   # Category CRUD
│   │   │   ├── content-export/ # Content export
│   │   │   ├── flags/        # Feature flag manager
│   │   │   ├── questions/    # Question CRUD
│   │   │   ├── security/     # Security dashboard
│   │   │   ├── sessions/     # Session management
│   │   │   ├── suggestions/  # Suggestion moderation
│   │   │   ├── system/       # System health
│   │   │   ├── users/        # User management
│   │   │   ├── layout.tsx    # Admin layout
│   │   │   ├── page.tsx      # Admin dashboard
│   │   │   └── SignOutButton.tsx
│   │   │
│   │   ├── (public)/         # Public pages
│   │   │   ├── cookies/      # Cookie policy
│   │   │   ├── interview/    # Category + question pages
│   │   │   ├── landing/      # Landing page sections
│   │   │   │   ├── components/ # Laptop, Monitor, etc.
│   │   │   │   ├── CableSystem.tsx
│   │   │   │   ├── FinalScene.tsx
│   │   │   │   ├── LandingHero.tsx
│   │   │   │   ├── NotebookTear.tsx
│   │   │   │   ├── StationBookmarks.tsx
│   │   │   │   ├── StationCommunity.tsx
│   │   │   │   ├── StationSearch.tsx
│   │   │   │   ├── StationSTAR.tsx
│   │   │   │   └── useScrollOrchestrator.ts
│   │   │   ├── login/        # Login page
│   │   │   ├── privacy/      # Privacy policy
│   │   │   ├── profile/      # User profile page
│   │   │   ├── search/       # Global search
│   │   │   ├── signup/       # Registration
│   │   │   ├── terms/        # Terms of service
│   │   │   ├── layout.tsx    # Public layout
│   │   │   ├── page.tsx      # Public entry
│   │   │   ├── PremiumLandingPage.tsx
│   │   │   └── PublicSignOutButton.tsx
│   │   │
│   │   ├── api/              # API routes
│   │   │   ├── admin/        # Admin-only APIs
│   │   │   ├── auth/         # Auth routes (NextAuth)
│   │   │   ├── bulk-import/  # Bulk import API
│   │   │   ├── categories/   # Category CRUD API
│   │   │   ├── flags/        # Feature flag API
│   │   │   ├── health/       # Health check
│   │   │   ├── interview/    # Personalized answers
│   │   │   ├── profile/      # User profile APIs
│   │   │   ├── questions/    # Question CRUD API
│   │   │   ├── resume/       # Resume upload API
│   │   │   ├── search/       # Search API
│   │   │   └── suggestions/  # Suggestion API
│   │   │
│   │   ├── design-system/    # Design system reference
│   │   ├── favicon.ico
│   │   ├── globals.css       # Design tokens + global styles
│   │   ├── layout.tsx        # Root layout
│   │   ├── robots.ts         # Robots.txt config
│   │   └── sitemap.ts        # Dynamic sitemap
│   │
│   ├── auth.config.ts        # NextAuth edge-safe config
│   ├── auth.ts               # NextAuth Node.js init
│   ├── middleware.ts          # Edge middleware
│   │
│   ├── components/           # Shared components
│   │   ├── ui/               # Primitive UI components
│   │   │   ├── Accordion.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── CookieConsent.tsx
│   │   │   ├── FavoriteToggle.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── PracticedToggle.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Toggle.tsx
│   │   │   ├── UnderMaintenance.tsx
│   │   │   └── index.ts
│   │   ├── ImpersonationBanner.tsx
│   │   ├── JsonLd.tsx            # JSON-LD structured data
│   │   ├── LenisProvider.tsx
│   │   └── Providers.tsx
│   │
│   ├── lib/                  # Business logic
│   │   ├── ai/               # AI provider layer
│   │   │   ├── gemini.ts     # Gemini implementation
│   │   │   ├── provider.ts   # Provider singleton
│   │   │   └── types.ts      # AIService interface
│   │   ├── auth/             # Auth utilities
│   │   │   ├── rateLimit.ts  # IP rate limiter
│   │   │   └── rbac.ts       # Role-based access
│   │   ├── db/               # Database layer
│   │   │   ├── connection.ts # MongoDB singleton
│   │   │   ├── index.ts      # Barrel export
│   │   │   └── models/       # Mongoose models
│   │   │       ├── AuditLog.ts
│   │   │       ├── Category.ts
│   │   │       ├── FeatureFlag.ts
│   │   │       ├── PersonalizedAnswer.ts
│   │   │       ├── Question.ts
│   │   │       ├── RateLimit.ts
│   │   │       ├── Resume.ts
│   │   │       ├── ResumeAnalysis.ts
│   │   │       ├── Session.ts
│   │   │       ├── Suggestion.ts
│   │   │       └── User.ts
│   │   ├── embed/            # Video embed normalization
│   │   │   └── normalize.ts
│   │   ├── utils/            # General utilities
│   │   │   ├── pdfPolyfills.ts  # DOMMatrix polyfills for pdfjs-dist
│   │   │   ├── resumeParser.ts  # PDF text extraction
│   │   │   └── sanitize.ts      # HTML sanitization
│   │   ├── validators/       # Zod schemas
│   │   │   ├── fileSniffer.ts   # Magic byte validation
│   │   │   └── index.ts
│   │   ├── video/            # Video utilities
│   │   │   └── getEmbedUrl.ts
│   │   ├── analytics.ts      # Abstract analytics layer
│   │   └── flags.ts          # Feature flag helpers
│   │
│   └── types/                # TypeScript type definitions
│       └── index.ts
│
└── scratch/                  # Temporary test files (gitignored)
```
