# AI Integration

## Overview

InterviewLoop uses Google Gemini AI for two primary features:
1. **Resume Analysis** — Extracts target role, skills, and experience from uploaded resumes
2. **Personalized Answers** — Generates tailored interview answers based on the candidate's resume

## Provider Abstraction

The AI layer follows a provider abstraction pattern for future-proofing:

- **Interface:** `lib/ai/types.ts` defines the `AIService` contract
- **Implementation:** `lib/ai/gemini.ts` implements the interface using `@google/genai`
- **Selector:** `lib/ai/provider.ts` provides a singleton `getAIService()` function
- **Swapping:** To change providers, implement the `AIService` interface and update `provider.ts`

## Gemini Integration

### Configuration

- **SDK:** `@google/genai` ^2.10.0
- **Model:** `gemini-2.5-flash` (configured in `gemini.ts`)
- **API Key:** `GEMINI_API_KEY` environment variable (required, validated at construction)

### Resume Analysis

`analyzeResume(extractedText: string): Promise<ResumeAnalysisSummary>`

1. Sends extracted text with a structured prompt for ATS parsing
2. Requests JSON response with schema:
   - `detectedRole` (string)
   - `skills` (string[])
   - `yearsExperience` (integer)
3. Response is parsed via `responseSchema` configuration (structured output)

### Resume Image Analysis

`analyzeResumeImage(imageBuffer: Buffer, mimeType: string): Promise<{ extractedText, summary }>`

1. Sends image as `inlineData` with base64 encoding
2. Prompts Gemini to extract all legible text AND perform ATS analysis
3. Returns both extracted text and structured summary

### Personalized Answer Generation

`generatePersonalizedAnswer(question: string, sampleAnswer: string, resumeExtractedText: string): Promise<string>`

1. Constructs a prompt instructing Gemini to act as a career coach
2. Personalizes the canonical answer using the candidate's resume
3. Requirements: first-person voice, integrate real achievements, clean HTML output
4. Post-processes to strip any accidental markdown code fences
5. Length target: 150-300 words

## Resume Parsing

### Text Extraction Pipeline

- **PDF:** `pdf-parse` library extracts text and page count
- **DOCX:** `mammoth` extracts raw text; page count estimated (~400 words/page)
- **Images:** Sent directly to Gemini multimodal for text extraction
- **Security:** DOCX files are scanned for `vbaProject.bin` (macro rejection)

### Validation Pipeline

1. Magic byte verification (file sniffer)
2. Extension-MIME consistency check
3. 5MB maximum file size
4. 8-page maximum for documents
5. SHA-256 content hashing for duplicate detection
6. Macro detection for DOCX files

## Personalized Answers

### Caching Strategy

- **Primary cache:** `PersonalizedAnswer` collection with compound unique index on `(user, question, resumeContentHash)`
- **Resume analysis cache:** `ResumeAnalysis` collection with unique index on `contentHash`
- **Cache hit:** On resume upload, if `contentHash` matches existing analysis, reuses cached summary
- **Cache miss:** Generates new analysis and caches it for future duplicates
- **Personalization cache:** Per-user, per-question, per-resume-hash — avoids regenerating on repeated views

### Prompt Flow

```
User uploads resume
  → File validation + text extraction
  → SHA-256 hash → check ResumeAnalysis cache
  → Cache HIT: return cached summary
  → Cache MISS: call Gemini analyzeResume()
  → Store Resume + ResumeAnalysis documents

User views question detail
  → Check latestResume on profile
  → Call GET /api/interview/[folder]/personalized?resumeId=...
  → For each question in folder:
    → Check PersonalizedAnswer cache (user + question + contentHash)
    → Cache HIT: return cached personalized answer
    → Cache MISS: call Gemini generatePersonalizedAnswer()
    → Store PersonalizedAnswer document
    → Fall back to sample answer on AI failure
```

### Error Handling

- AI API failures do NOT break the page — answers fall back to the canonical sample answer
- All AI errors are logged server-side with `console.error`
- Audit logging tracks AI spend via `ResumeAnalysis` entity type
- Empty responses from Gemini throw descriptive errors

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Google Gemini API key for AI features |
| `NEXT_PUBLIC_FREE_QUESTION_LIMIT` | No | Max personalized questions for free users (default: 10) |

## Rate Limiting & Cost Control

- Free users limited to top 10 questions per folder for personalization
- Premium users get all questions personalized
- Caching at multiple levels reduces redundant API calls
- Content hash deduplication prevents re-analysis of identical resumes
