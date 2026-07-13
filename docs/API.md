# API Reference

## Health

### GET /api/health

Returns server health status and database connection state.

- **Auth:** None
- **Response:**
  ```json
  { "status": "ok", "db": "connected" }
  ```

---

## Authentication

### POST /api/auth/register

Creates a new user account.

- **Auth:** None
- **Body:**
  ```json
  { "name": "string", "email": "string", "password": "string (min 8 chars)" }
  ```
- **Response:** `{ "success": true, "data": { "id": "...", "name": "...", "email": "..." } }`
- **Validation:** Zod schema — email must be valid, password min 8 chars
- **Errors:** 400 validation, 409 email conflict, 500 server

### POST /api/auth/[...nextauth]

NextAuth.js catch-all route for sign-in, sign-out, session, and callback handling.

- **Auth:** Varies by endpoint
- **Providers:** Credentials (email/password) + Google OAuth (conditional)
- **Session:** JWT-based, 30-day expiry

---

## Categories

### GET /api/categories

Returns all published categories.

- **Auth:** None
- **Response:** `{ "success": true, "data": [...] }`

### GET /api/categories/[id]

Returns a single category by ID.

- **Auth:** Admin/Editor for unpublished

### POST /api/categories

Creates a new category.

- **Auth:** Admin/Editor
- **Body:** `{ "name": "string", "slug": "string", "type": "string", "description": "string", "icon": "string", "order": "number" }`

### PATCH /api/categories/[id]

Updates a category.

- **Auth:** Admin/Editor

### DELETE /api/categories/[id]

Deletes a category and cascades to its questions.

- **Auth:** Admin/Editor
- **Security:** Cascading delete removes all questions in the category + audit log entry

---

## Questions

### GET /api/questions

Returns published questions with optional filters.

- **Auth:** None (public)
- **Query Params:** `category`, `difficulty`, `search`, `page`, `limit`
- **Response:** Paginated response with `QuestionListItem[]`

### GET /api/questions/[id]

Returns a single question with full details.
Premium content (`isPremium: true`) is gated server-side.

- **Auth:** None (public)
- **Premium gating:**
  - Free users receive: `_id`, `category`, `slug`, `question`, `difficulty`, `tags`, `isPremium`, `viewCount`, `answer.short`
  - Premium users receive full question including `answer.detailed`, `answer.example`, and `videos`
  - Gating is enforced server-side, not frontend-hidden

### POST /api/questions

Creates a new question.

- **Auth:** Admin/Editor
- **Body:** `{ "category": "ObjectId", "question": "string", "answer": {...}, "difficulty": "string", ... }`

### PATCH /api/questions/[id]

Updates a question.

- **Auth:** Admin/Editor

### DELETE /api/questions/[id]

Deletes a question.

- **Auth:** Admin/Editor

### POST /api/questions/[id]/favorite

Toggles favorite/bookmark status for the authenticated user.

- **Auth:** User
- **Response:** `{ "success": true, "favorited": true|false }`

### POST /api/questions/[id]/practiced

Toggles practiced status for the authenticated user.

- **Auth:** User
- **Response:** `{ "success": true, "practiced": true|false }`

---

## Search

### GET /api/search?q=...

Full-text search across questions, answers, and tags.

- **Auth:** None
- **Query:** `q` (search term), `category` (optional filter), `page`, `limit`

---

## Suggestions

### GET /api/suggestions

Returns suggestions list (admin only).

- **Auth:** Admin/Editor

### POST /api/suggestions

Submits a public suggestion or correction.

- **Auth:** None (public)
- **Body:** `{ "questionText": "string", "categorySuggestion": "string", "notes": "string" }`
- **Rate Limited:** Yes

### PATCH /api/suggestions/[id]

Updates suggestion status (reviewed/added/rejected).

- **Auth:** Admin/Editor

---

## Profile

### GET /api/profile

Returns the authenticated user's profile including latest resume and analysis.

- **Auth:** User
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "_id": "...",
      "name": "...",
      "email": "...",
      "role": "...",
      "isPremium": false,
      "selectedFolders": [...],
      "latestResume": { ... } | null,
      "resumeAnalysis": { "detectedRole": "...", "skills": [...], "yearsExperience": 0 } | null
    }
  }
  ```

### PATCH /api/profile

Updates the user's display name.

- **Auth:** User
- **Body:** `{ "name": "string (2-50 chars)" }`
- **Validation:** Zod schema, min 2 max 50 chars

### DELETE /api/profile

Permanently deletes the user account and associated data (DPDP-compliant).

- **Auth:** User
- **Cascading:**
  1. Anonymizes audit log actor references
  2. Deletes all active sessions
  3. Removes user document
- **Response:** `{ "success": true, "message": "..." }`

### POST /api/profile/password

Updates the user's password (credentials-only accounts).

- **Auth:** User
- **Body:** `{ "currentPassword": "string", "newPassword": "string" }`
- **Security:** Validates current password against stored hash

### GET /api/profile/favorites

Returns the user's bookmarked questions list.

- **Auth:** User
- **Response:** `{ "success": true, "data": [...] }`

### GET /api/profile/practiced

Returns the user's practiced questions list.

- **Auth:** User
- **Response:** `{ "success": true, "data": [...] }`

### POST /api/profile/folders

Saves the user's selected folders for resume personalization.

- **Auth:** User
- **Body:** `{ "folderIds": ["ObjectId", ...] }`
- **Validation:** Max 2 folders enforced server-side
- **Response:** `{ "success": true, "selectedFolders": [...] }`

### GET /api/profile/export

Downloads the user's personal data as JSON (DPDP data portability).

- **Auth:** User
- **Response:** JSON file download

---

## Resume

### POST /api/resume/upload

Uploads, validates, and analyzes a resume file.

- **Auth:** User
- **Body:** `multipart/form-data` with `file` field
- **Accepted Formats:** PDF, DOCX, PNG, JPG, JPEG, WEBP
- **Validation Pipeline:**
  1. Authentication check
  2. Content-Length header validation (5MB max)
  3. File size validation (5MB max)
  4. Magic byte validation (PDF: `%PDF-`, PNG: `\x89PNG`, JPEG: `\xFF\xD8\xFF`, WEBP: `RIFF...WEBP`, DOCX: `PK\x03\x04`)
  5. Extension-MIME mismatch detection
  6. Page count validation (8 pages max for documents)
  7. DOCX macro rejection (vbaProject.bin detection)
  8. Text extraction (PDF via pdf-parse, DOCX via mammoth)
  9. SHA-256 hashing for duplicate detection
  10. Gemini AI analysis (text-based for docs, multimodal for images)
  11. Cache hit/miss via `ResumeAnalysis` collection
  12. Audit logging at every validation step
- **Errors:** 400 (validation), 401 (unauthorized), 500 (server)

---

## Personalized Answers

### GET /api/interview/[folder]/personalized?resumeId=...

Returns personalized interview answers for questions in a folder, tailored to the user's resume.

- **Auth:** User
- **Parameters:**
  - `folder`: Category ID or slug
  - `resumeId`: Resume document ID
- **Behavior:**
  1. Verifies folder selection limit (max 2 folders)
  2. Auto-adds folder to user's selected list
  3. Free users: top 10 questions by frequencyRank
  4. Premium users: all published questions
  5. Checks `PersonalizedAnswer` cache (user + question + contentHash + modelVersion)
  6. Cache miss: calls Gemini via `generatePersonalizedAnswer` in batches of 4 for concurrency control
  7. **Returns `null` for `personalizedAnswer` on generation failure** — no fallback to generic answer (prevents content duplication)
  8. Each question response includes `updatedAt` (from cache) and `isGenerated` flag
- **Caching:** Keyed by `(userId, questionId, resumeContentHash, modelVersion)` — compound unique index. TTL: 90 days.
- **Rate Limit:** 10 requests/minute per user

#### Response Format

```json
{
  "success": true,
  "category": "Behavioral",
  "isPremium": false,
  "questions": [
    {
      "questionId": "...",
      "slug": "tell-me-about-yourself",
      "question": "Tell me about yourself",
      "sampleAnswer": "<p>Generic answer...</p>",
      "personalizedAnswer": "<p>Tailored to your resume...</p>",
      "updatedAt": "2026-07-11T12:00:00.000Z",
      "isGenerated": true,
      "resumeContentHash": "abc123..."
    }
  ]
}
```

---

## Flags

### PATCH /api/flags/[id]

Toggles a feature flag on/off.

- **Auth:** Admin/Editor
- **Body:** `{ "enabled": true|false }`

---

## Bulk Import

### POST /api/bulk-import

Bulk imports questions from a JSON array.

- **Auth:** Admin/Editor
- **Body:** `{ "questions": [...] }`

---

## Admin

### GET /api/admin/export

Exports all content as JSON.

- **Auth:** Admin

### POST /api/admin/impersonate

Impersonates another user (admin only).

- **Auth:** Admin
- **Body:** `{ "userId": "ObjectId" }`

### Administrative User Management

#### DELETE /api/admin/users/[id]
Deletes a user account.
- **Auth:** Admin only
- **Query Params:**
  - `mode`: `"soft"` (default) or `"hard"`.
    - `"soft"` marks `isDeleted: true` and blocks future credentials/OAuth logins but keeps all user data.
    - `"hard"` deletes the user document.
  - `deleteRelated`: `"true"` or `"false"`. Cascades deletion of bookmarks, practiced progress, resumes, AI analyses, active sessions, and suggestion logs.
- **Response:** `{ "success": true, "message": "..." }`
- **Errors:** 400 invalid ID format or self-deletion attempt, 401 unauthorized, 404 user not found, 500 server error.

#### PATCH /api/admin/users/[id]
Updates a user profile's role or premium status.
- **Auth:** Admin only
- **Body:** `{ "role": "user" | "editor" | "admin", "isPremium": boolean }`
- **Response:** `{ "success": true, "message": "...", "user": { ... } }`

#### Other Admin Routes
- `GET/DELETE /api/admin/sessions/[id]` — Revoke/Delete active session tracking record.
- `GET/DELETE /api/admin/ratelimits/[id]` — Clear/Delete rate-limiting block records for an IP address.

---

## Error Response Format

All API routes return errors in the following format:

```json
{ "error": "Human-readable error message." }
```

For validation errors, additional detail may be included:

```json
{ "error": "Validation failed.", "issues": [...] }
```

Unexpected server errors return a generic message to prevent information leakage:

```json
{ "error": "Internal Server Error" }
```

Real error details (stack traces, Mongoose errors, internal paths) are logged server-side only.

## Security Notes

- All mutating admin routes require `admin` or `editor` role
- Premium content gated server-side on `GET /api/questions/[id]`
- Rate limiting applied to: login (10/min), register (10/min), suggestions (5/min), resume upload (5/min), search (30/min), AI personalization (10/min)
- Input sanitization via `sanitize-html` on rich-text content
- Audit logging on all create/update/delete operations
- CSP + HSTS headers set via middleware on all routes
- Resume upload validated by 16-step pipeline: magic bytes, MIME, encryption detection, macro scan, prompt injection, page count, heuristics + AI classification
- Personalized answers cached to reduce AI API costs
- NoSQL injection prevented via allowlist validation on query parameters
