# Performance Optimizations

## Bundle Splitting

- **Route groups**: `(admin)` and `(public)` ensure admin code never ships to public visitors
- **Dynamic imports**: PDF parser (`pdfjs-dist`) imported lazily in upload route only
- **AI SDK**: `@google/genai` imported lazily inside `ensureAi()` — avoids crashing routes if SDK unavailable

## Data Fetching

- **Light projections**: List endpoints (`GET /api/questions`, `GET /api/search`) exclude `answer.detailed` and `videos` arrays
- **Pagination**: Every list endpoint supports `?page=` and `?limit=` with configurable page sizes (max 100)
- **ISR**: Sitemap regenerated hourly (`revalidate = 3600`)

## Caching

- **Resume analysis**: SHA-256 content hash deduplication — identical uploads skip AI analysis
- **Personalized answers**: Compound index `(user, question, resumeContentHash, modelVersion)` avoids regenerating answers
- **TTL cleanup**: Rate limits auto-expire, sessions auto-clean after 30 days, personalized answers auto-clean after 90 days
- **MongoDB connection**: Singleton connection pool reused across requests

## Database

- **Indexes**: Text indexes on questions, compound unique indexes, TTL indexes for auto-cleanup
- **Denormalization**: `Category.questionCount` updated via Mongoose hooks (avoids `$lookup` aggregation)

## Fonts

- **Self-hosted**: Google Fonts loaded via `next/font` — no render-blocking external requests
- **`display: swap`**: Ensures text remains visible during font load

## Images

- **Next.js Image**: Optimized via built-in image component
- **Remote patterns**: Allowlisted for Cloudinary, YouTube, Vimeo thumbnails

## React Rendering

- **Server components**: All data fetching done server-side in App Router
- **Client components**: Minimized to interactive elements only (accordions, toggles, forms)
