# Deployment Guide

## Prerequisites

- Node.js >= 18.x
- npm >= 9.x
- MongoDB Atlas account (free tier suitable for production)
- Vercel account (recommended hosting)
- Google Gemini API key
- PostHog account (optional, for analytics)

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes | MongoDB Atlas connection string |
| `NEXTAUTH_SECRET` | Yes | JWT encryption key (generate via `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | Yes | Production URL (e.g., `https://loopora.vercel.app`) |
| `GEMINI_API_KEY` | Yes | Google Gemini API key |
| `GOOGLE_CLIENT_ID` | No | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth client secret |
| `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` | No | PostHog project token |
| `NEXT_PUBLIC_ANALYTICS_PROVIDER` | No | Analytics provider (`posthog` / `none`) |

## Vercel Deployment

### 1. Connect Repository

Push to GitHub, then import the repository in Vercel.

### 2. Configure Environment Variables

Add all required variables in Vercel project settings. Never commit secrets.

### 3. Deploy

Vercel auto-deploys on push to `main`. Or deploy manually:

```bash
npm run build
npx vercel --prod
```

### 4. Verify

```bash
curl https://your-domain.vercel.app/api/health
# Expected: { "status": "ok", "db": "connected", ... }
```

## MongoDB Atlas Setup

1. Create an M0 free cluster
2. Whitelist Vercel IPs or use `0.0.0.0/0` (with strong auth)
3. Create database user with readWrite permissions
4. Copy connection string to `MONGODB_URI`

### Indexes

Required indexes are auto-created by Mongoose on first run:
- Questions: compound unique `(category, slug)`, text index on `(question, answer.detailed, tags)`
- Users: unique `email`
- Resumes: compound unique `(user, contentHash)`
- RateLimits: TTL on `expiresAt` (auto-cleanup)
- Sessions: TTL on `expiresAt` (30-day auto-cleanup)
- PersonalizedAnswer: compound unique `(user, question, resumeContentHash, modelVersion)`, TTL on `updatedAt` (90-day)

## PostHog Setup

1. Create a PostHog project at https://us.posthog.com
2. Copy Project API key to `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN`
3. Set `NEXT_PUBLIC_ANALYTICS_PROVIDER=posthog`

## Production Checklist

- [ ] Environment variables configured
- [ ] MongoDB Atlas connection verified
- [ ] NextAuth secret generated
- [ ] Gemini API key valid
- [ ] PostHog configured (optional)
- [ ] SSL/TLS active (Vercel handles automatically)
- [ ] Custom domain configured (optional)
- [ ] Rate limits tuned for expected traffic
- [ ] Security headers verified (CSP, HSTS)
- [ ] Build passes with `npm run build`
- [ ] Sitemap accessible at `/sitemap.xml`
- [ ] Robots.txt accessible at `/robots.txt`
