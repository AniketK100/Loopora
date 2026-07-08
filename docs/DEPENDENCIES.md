# Dependencies

## Production Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `next` | 16.2.10 | React framework with App Router |
| `react` | 19.2.4 | UI library |
| `react-dom` | 19.2.4 | React DOM rendering |
| `next-auth` | ^5.0.0-beta.31 | Authentication (credentials + OAuth) |
| `mongoose` | ^9.7.3 | MongoDB ODM |
| `@google/genai` | ^2.10.0 | Google Gemini AI SDK |
| `gsap` | ^3.15.0 | High-performance animations |
| `lenis` | ^1.3.25 | Smooth scrolling |
| `framer-motion` | ^12.42.2 | React motion library (admin UI) |
| `lucide-react` | ^1.23.0 | Icon library |
| `zod` | ^4.4.3 | Schema validation |
| `bcryptjs` | ^3.0.3 | Password hashing |
| `sanitize-html` | ^2.17.5 | HTML sanitization |
| `pdf-parse` | ^2.4.5 | PDF text extraction for resumes |
| `mammoth` | ^1.12.0 | DOCX text extraction for resumes |

## Dev Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `typescript` | ^5 | Type checking |
| `tailwindcss` | ^4 | Utility-first CSS |
| `@tailwindcss/postcss` | ^4 | Tailwind PostCSS plugin |
| `eslint` | ^9 | Linting |
| `eslint-config-next` | 16.2.10 | Next.js ESLint config |
| `eslint-config-prettier` | ^10.1.8 | ESLint + Prettier compat |
| `prettier` | ^3.9.4 | Code formatting |
| `postcss` | ^8.5.16 | CSS processing |
| `tsx` | ^4.23.0 | TypeScript execution (scripts) |
| `@types/node` | ^20 | Node.js type definitions |
| `@types/react` | ^19 | React type definitions |
| `@types/react-dom` | ^19 | React DOM types |
| `@types/bcryptjs` | ^2.4.6 | bcryptjs type definitions |
| `@types/sanitize-html` | ^2.16.1 | sanitize-html types |

## Key Integration Notes

- **GSAP + Lenis**: Lenis syncs with GSAP ScrollTrigger via `lenis.on("scroll", () => ScrollTrigger.update())`
- **GSAP + React**: GSAP animations are triggered in `useEffect` hooks with cleanup via `.kill()`
- **NextAuth + Mongoose**: Custom session management using Mongoose models
- **Tailwind v4**: Uses CSS-first configuration (no tailwind.config.js)
- **Gemini AI**: Provider abstraction via `lib/ai/` — swap provider by changing `provider.ts`
- **Resume Parsing**: PDF via `pdf-parse`, DOCX via `mammoth`, images via Gemini multimodal

## Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `next dev` | Development server |
| `build` | `next build` | Production build |
| `start` | `next start` | Start production server |
| `lint` | `eslint .` | Run ESLint |
| `typecheck` | `tsc --noEmit` | TypeScript check |
| `format` | `prettier --write` | Format code |
| `seed` | `tsx scripts/seed.ts` | Seed database |
| `promote` | `tsx scripts/promote.ts` | Promote user role |
