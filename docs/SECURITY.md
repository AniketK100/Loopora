# Security Documentation

## Authentication

- **NextAuth.js v5** with JWT strategy (HttpOnly/Secure/SameSite cookies)
- **Providers:** Email/password (credentials) + Google OAuth (optional)
- **Password hashing:** bcryptjs with salt rounds
- **Session expiry:** 30 days, with tracking in `Session` collection
- **Edge middleware** protects all `/admin` **and `/api/admin`** routes via the `authorized` callback (defense-in-depth; API routes also call `requireRole()`)
- **Anti-enumeration:** the credentials `authorize()` flow always runs a `bcrypt.compare()` against a constant dummy hash when the email is unknown, so response timing is identical for non-existent vs. wrong-password accounts (mitigates OWASP A07 / CWE-203 user enumeration via timing)
- **Open-redirect guard:** `callbackUrl` from `?callbackUrl=` is validated to be a same-origin relative path (`/...`, rejecting `//evil.com` and absolute URLs) before use in `window.location.href` on the login page
- **Rate limiting:** IP-based on auth endpoints (configurable via `RATE_LIMIT_AUTH_MAX`)

## Authorization (RBAC)

Three roles with hierarchical access:

| Role | Permissions |
|------|------------|
| `admin` | Full access — CRUD all entities, impersonation, user management, system config |
| `editor` | Content management — CRUD questions/categories, manage flags, moderate suggestions |
| `user` | Public access — read content, manage own profile, upload resume, personalize answers |

- `requireRole()` utility guards all mutating API routes
- Admin UI routes check role server-side and render/hide UI elements accordingly
- Impersonation is logged and reversible (JWT stores admin snapshot)

## Premium Content Gating

- `GET /api/questions/[id]` checks `isPremium` flag on the question
- Free users receive only: question text, short answer, difficulty, tags — never the full detailed answer or video links
- Gating is enforced server-side, not frontend-hidden
- Listing/search endpoints (`GET /api/questions`, `GET /api/search`) already exclude `answer.detailed` from their projections

## Resume Upload Validation

Multi-layer validation pipeline for uploaded resume files:

### 5 MB Upload Limit
- Checked via `Content-Length` header AND parsed `file.size`
- Rejected with 400 status and audit log entry

### 8 Page Validation
- PDF: uses `pdf-parse` `numpages` value
- Rejected if pageCount > 8

### Magic Byte Validation
File type verified by inspecting binary header bytes, not just file extension:

| Format | Magic Bytes | 
|--------|------------|
| PDF | `%PDF-` (25 50 44 46) |
| PNG | `\x89PNG\x0D\x0A\x1A\x0A` (89 50 4E 47 0D 0A 1A 0A) |
| JPEG | `\xFF\xD8\xFF` (FF D8 FF) |
| WEBP | `RIFF` + `WEBP` at offset 8 |
| DOCX | `PK\x03\x04` (ZIP container) |

If the magic bytes don't match the extension or declared MIME type, the upload is rejected.

### PDF Security Scan
- Detects encrypted/password-protected PDFs (rejects `/Encrypt`, `/Standard`, `/UR3`)
- Scans for embedded JavaScript, OpenAction, Launch actions, EmbeddedFile, JavaScript in Names

### MIME Validation
- Declared MIME type (`file.type` from browser) checked against magic byte signature
- Mismatch results in rejection with descriptive error

### Extension Validation
- Allowed extensions: `pdf`, `docx`, `png`, `jpg`, `jpeg`, `webp`
- Files without extension or with disallowed extension rejected immediately

### Content Security Scan
- Minimum 50 characters, maximum 100,000 characters
- 20+ prompt injection patterns blocked (ignore previous instructions, jailbreak, DAN, etc.)
- Unicode abuse detection (zero-width chars, directional overrides, homoglyph attacks)

### SHA-256 Hashing
- Normalized extracted text (lowercased, whitespace-collapsed) hashed with SHA-256
- Used for:
  - Duplicate detection (same content = same hash)
  - `ResumeAnalysis` cache key (skip re-analysis on re-upload)

### Duplicate Detection
- `contentHash` unique index on `ResumeAnalysis` collection
- On upload, checks if identical content already analyzed
- Cache hit: skips AI call, returns cached analysis

### Hybrid Classification Gate
- Heuristic confidence (0.4 weight) + AI confidence (0.6 weight)
- Both must pass: `heuristicResult.isResume` AND `aiClassification.isResume` AND `aiClassification.confidence >= 0.75`
- Non-resume documents are rejected with explanatory feedback

## Rate Limiting

All rate limits are DB-backed (MongoDB `RateLimit` collection with TTL index):

| Endpoint | Limit | Window | Scope |
|----------|-------|--------|-------|
| Auth login | 10 (configurable) | 1 minute | Per IP |
| Auth register | 10 | 1 minute | Per IP |
| Public suggestions | 5 | 1 minute | Per IP |
| Resume upload | 5 | 1 minute | Per user |
| Search | 30 | 1 minute | Per IP |
| Personalized answers | 10 | 1 minute | Per user |

When exceeded, endpoints return HTTP 429 with `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` headers. Rate limits can be cleared by admin via `DELETE /api/admin/ratelimits/[id]`.

## Error Handling

- All API routes return generic `"Internal Server Error"` to clients on unexpected failures
- Real error details (stack traces, Mongoose errors, file paths) are logged server-side via `console.error`
- This prevents information leakage of internal schema structure and implementation details

## NoSQL Injection Prevention

- Filter parameters in `GET /api/questions` are explicitly validated against allowlists
- `difficulty` parameter checked against enum `["easy", "medium", "hard"]` before query construction
- MongoDB `$text` operator used for search (safe from operator injection)
- All user inputs validated via Zod schemas before use in queries

## Security Headers

| Header | Value |
|--------|-------|
| `Content-Security-Policy` | `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: res.cloudinary.com img.youtube.com i.vimeocdn.com; font-src 'self' data:; frame-src 'self' [embed providers]; connect-src 'self' ws: wss:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; block-all-mixed-content; upgrade-insecure-requests` |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `X-XSS-Protection` | `1; mode=block` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |

## Environment Variables

| Variable | Sensitivity | Notes |
|----------|------------|-------|
| `MONGODB_URI` | High | Full database access |
| `NEXTAUTH_SECRET` | High | JWT encryption key |
| `GEMINI_API_KEY` | High | AI API access |
| `GOOGLE_CLIENT_ID` | Medium | OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | High | OAuth secret |
| `NEXTAUTH_URL` | Low | Canonical URL |
| `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` | Low | PostHog public token |
| `NEXT_PUBLIC_ANALYTICS_PROVIDER` | Low | Analytics provider selection |

Never commit secrets. Only `.env.example` is tracked in git.

## Security Best Practices

- **CSP headers** set via middleware — restricts script/style/frame sources
- **HSTS** enforced (2 years, includeSubDomains, preload) on all responses
- **Permission denied** for camera, microphone, geolocation
- **Input sanitization:** `sanitize-html` allowlist on all rich-text content before storage
- **Embed URL normalization:** Video URLs validated against strict provider templates
- **Audit logging:** All data mutations logged with actor, action, entity, and diff
- **DPDP compliance:** User data export and cascading deletion endpoints
- **Premium gating:** Server-side enforced on detailed question retrieval
