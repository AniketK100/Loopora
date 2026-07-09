# Security Documentation

## Authentication

- **NextAuth.js v5** with JWT strategy (HttpOnly/Secure/SameSite cookies)
- **Providers:** Email/password (credentials) + Google OAuth (optional)
- **Password hashing:** bcryptjs with salt rounds
- **Session expiry:** 30 days, with tracking in `Session` collection
- **Edge middleware** protects all `/admin` routes via `authorized` callback
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

## Resume Upload Validation

Multi-layer validation pipeline for uploaded resume files:

### 5 MB Upload Limit
- Checked via `Content-Length` header AND parsed `file.size`
- Rejected with 400 status and audit log entry

### 8 Page Validation
- PDF: uses `pdf-parse` `numpages` value
- DOCX: estimated via word count (~400 words/page heuristic)
- Images: assumed 1 page
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

### MIME Validation
- Declared MIME type (`file.type` from browser) checked against magic byte signature
- Mismatch results in rejection with descriptive error

### Extension Validation
- Allowed extensions: `pdf`, `docx`, `png`, `jpg`, `jpeg`, `webp`
- Files without extension or with disallowed extension rejected immediately

### SHA-256 Hashing
- Normalized extracted text (lowercased, whitespace-collapsed) hashed with SHA-256
- Used for:
  - Duplicate detection (same content = same hash)
  - `ResumeAnalysis` cache key (skip re-analysis on re-upload)

### Duplicate Detection
- `contentHash` unique index on `ResumeAnalysis` collection
- On upload, checks if identical content already analyzed
- Cache hit: skips AI call, returns cached analysis

### DOCX Macro Detection
- Binary string scan for `vbaProject.bin` substring
- Rejected with error: "DOCX upload rejected: Macro elements detected."

## Rate Limiting

- **Auth endpoints:** IP-based, configurable max requests per minute per IP (`RATE_LIMIT_AUTH_MAX`).
  Applied to **both** the credentials **login** (`auth:login`) and **register** (`auth:register`) flows.
  When the limit is exceeded the login is blocked (NextAuth returns an authentication error); register returns HTTP `429`.
- **Public write endpoints:** Configurable max requests per minute per IP (`RATE_LIMIT_PUBLIC_WRITE_MAX`)
- Backed by MongoDB `RateLimit` collection with TTL index

## Environment Variables

| Variable | Sensitivity | Notes |
|----------|------------|-------|
| `MONGODB_URI` | High | Full database access |
| `NEXTAUTH_SECRET` | High | JWT encryption key |
| `GEMINI_API_KEY` | High | AI API access |
| `GOOGLE_CLIENT_ID` | Medium | OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | High | OAuth secret |
| `NEXTAUTH_URL` | Low | Canonical URL |

Never commit secrets. Only `.env.example` is tracked in git.

## Security Best Practices

- **CSP headers** set via middleware — restricts script/style/frame sources
- **X-Content-Type-Options:** nosniff
- **X-Frame-Options:** DENY
- **X-XSS-Protection:** 1; mode=block
- **Referrer-Policy:** strict-origin-when-cross-origin
- **Permissions-Policy:** restricts camera, microphone, geolocation
- **Input sanitization:** `sanitize-html` allowlist on all rich-text content before storage
- **Embed URL normalization:** Video URLs validated against strict provider templates
- **Audit logging:** All data mutations logged with actor, action, entity, and diff
- **DPDP compliance:** User data export and cascading deletion endpoints
