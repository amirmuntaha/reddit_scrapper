# Architecture Overview

This document describes the system architecture for AI agents working on this codebase.

## System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Vercel (Hosting)                         │
│                                                             │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │  Next.js    │  │  API Routes  │  │  Vercel Cron     │   │
│  │  Dashboard  │  │              │  │  (daily 8AM UTC) │   │
│  │  (page.tsx) │  │ /api/scrape  │  │                  │   │
│  │             │  │ /api/download│  └────────┬──────────┘   │
│  │             │  │ /api/instagram│           │              │
│  └──────┬──────┘  └──────┬───────┘           │              │
│         │                 │                   │              │
└─────────┼─────────────────┼───────────────────┼──────────────┘
          │                 │                   │
          │                 ▼                   ▼
          │   ┌─────────────────────────────────────┐
          │   │         src/lib/scraper.ts           │
          │   │                                     │
          │   │  1. Fetch RSS from Reddit           │
          │   │  2. Parse Atom XML                  │
          │   │  3. Filter images (strict)          │
          │   │  4. Store in Supabase               │
          │   └──────────────────┬──────────────────┘
          │                      │
          ▼                      ▼
┌──────────────────┐   ┌─────────────────────────┐
│  Reddit RSS Feed │   │  Supabase PostgreSQL     │
│                  │   │                          │
│  /r/all/top.rss  │   │  Table: reddit_posts     │
│  ?t=day&limit=50 │   │  - reddit_id (unique)    │
│                  │   │  - title, image_url      │
│  Auth: feed= &   │   │  - caption, subreddit    │
│  user= params    │   │  - posted_to_instagram   │
└──────────────────┘   └─────────────────────────┘
```

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | Next.js 15 (App Router) | TypeScript, `src/` directory |
| Styling | Tailwind CSS 4 | Dark theme, responsive |
| Database | Supabase PostgreSQL | Service role key for server-side |
| Hosting | Vercel | Auto-deploy from GitHub `main` branch |
| Cron | Vercel Cron Jobs | `vercel.json` → daily at 8:00 AM UTC |
| Testing | Playwright | E2E tests against deployed URL |
| Data Source | Reddit RSS (Atom XML) | No API key needed, uses auth params |

## Data Flow

### Scraping (daily cron or manual trigger)
1. `GET /api/scrape` → protected by `CRON_SECRET`
2. `scraper.ts` → `fetchRedditRSS()` fetches RSS with browser headers + auth params
3. `parseAtomFeed()` → regex-based XML parsing into `ParsedPost[]`
4. `getBestImageUrl()` → strict filter: ONLY `i.redd.it` or `i.imgur.com` direct links
5. `storePostsInSupabase()` → upsert with deduplication on `reddit_id`

### Viewing (dashboard)
1. `page.tsx` → server component reads query params (`?page=X&perPage=Y`)
2. Supabase query with `.range(from, to)` for pagination
3. Renders grid of post cards with images

### Download for Instagram (manual)
1. User clicks "📸 Download for IG"
2. `GET /api/download?url=<image>` → proxy fetches image (bypasses CORS)
3. Browser downloads image + copies caption to clipboard

## Key Design Decisions

1. **RSS over API** — Reddit closed self-service API access in 2025. RSS feeds are free and public.
2. **Browser headers** — Reddit blocks datacenter IPs. Full Chrome-like headers bypass this.
3. **RSS auth params** — `feed=` and `user=` params bypass the 1 req/min rate limit.
4. **Strict image filtering** — Only `i.redd.it`/`i.imgur.com` direct links accepted. No thumbnail fallbacks.
5. **Server-side pagination** — Supabase `.range()` instead of loading all posts.
6. **Download proxy** — `/api/download` route proxies images to bypass CORS for browser downloads.

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Server-side DB access (bypasses RLS) |
| `CRON_SECRET` | ✅ | Protects `/api/scrape` endpoint |
| `REDDIT_RSS_FEED` | ⚡ Recommended | RSS auth token (bypasses rate limit) |
| `REDDIT_RSS_USER` | ⚡ Recommended | Reddit username for RSS auth |
| `INSTAGRAM_USER_ID` | ❌ Optional | For future Instagram Graph API integration |
| `INSTAGRAM_ACCESS_TOKEN` | ❌ Optional | For future Instagram Graph API integration |
