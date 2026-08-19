# Contributing & Development Guide

This guide is for AI agents and developers making changes to this project.

## Quick Start

```bash
git clone https://github.com/amirmuntaha/reddit_scrapper.git
cd reddit_scrapper
npm install
cp .env.example .env.local   # Fill in your values
npm run dev                   # http://localhost:3000
```

## Project Structure

```
reddit_scrapper/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── scrape/route.ts       # Cron endpoint — triggers RSS scrape
│   │   │   ├── download/route.ts     # Image proxy — bypasses CORS for downloads
│   │   │   └── instagram/route.ts    # Instagram Graph API (future use)
│   │   ├── components/
│   │   │   ├── ScrapeButton.tsx      # "Run Scrape" button (prompts for CRON_SECRET)
│   │   │   ├── InstagramButton.tsx   # "Download for IG" + copy caption
│   │   │   └── Pagination.tsx        # Page nav + per-page selector
│   │   ├── page.tsx                  # Main dashboard (server component)
│   │   ├── layout.tsx                # Root layout
│   │   └── globals.css               # Tailwind imports
│   └── lib/
│       ├── scraper.ts                # Core scraping logic (RSS fetch + parse + store)
│       └── supabase.ts               # Supabase client + TypeScript types
├── supabase/
│   └── migrations/
│       └── 001_create_reddit_posts.sql  # Database schema
├── tests/
│   ├── homepage.spec.ts              # Dashboard UI tests
│   ├── api-scrape.spec.ts            # API endpoint tests
│   └── performance.spec.ts           # Performance + accessibility tests
├── vercel.json                       # Cron job config (daily 8AM UTC)
├── playwright.config.ts              # Test config (points to production URL)
├── next.config.ts                    # Image domains whitelist
└── .env.example                      # Template for environment variables
```

## How to Make Changes

### Adding a new API route
1. Create `src/app/api/{name}/route.ts`
2. Export `GET` or `POST` handler function
3. Add `export const runtime = "nodejs"` and `export const dynamic = "force-dynamic"`

### Adding a new client component
1. Create `src/app/components/{Name}.tsx`
2. Add `"use client"` at the top
3. Import in `page.tsx`

### Modifying the scraper
- All logic is in `src/lib/scraper.ts`
- Key functions: `fetchRedditRSS()`, `parseAtomFeed()`, `getBestImageUrl()`, `fetchTopRedditPosts()`
- Video detection: check for `v.redd.it` in content AND `external-preview.redd.it` in thumbnail

### Adding a database column
1. Create `supabase/migrations/002_your_change.sql`
2. Run it in Supabase SQL Editor
3. Update the `RedditPost` interface in `src/lib/supabase.ts`

### Running tests
```bash
npm test                                    # Run all E2E tests
BASE_URL=http://localhost:3000 npm test     # Test locally
npm run test:headed                         # With visible browser
```

## Common Pitfalls

### Reddit blocks the request (403)
- Must include full browser headers (see `BROWSER_HEADERS` in scraper.ts)
- Vercel's datacenter IPs get extra scrutiny
- Solution: browser-like headers + RSS auth params

### Reddit rate limits (429)
- Unauthenticated RSS: 1 request per 60 seconds
- With `feed=` + `user=` params: much higher limit
- NEVER make multiple RSS requests in one scrape invocation

### Supabase inserts fail silently
- Check RLS is disabled on `reddit_posts` table OR use service_role key
- The `service_role` key bypasses RLS; the `anon` key does not
- Response includes `debug.has_service_key` to verify

### Video posts getting scraped
- Only accept posts with `i.redd.it` or `i.imgur.com` direct links in content
- Reject any post where content contains `v.redd.it`
- Reject any post where thumbnail is from `external-preview.redd.it`
- Do NOT use thumbnails as fallbacks — they're unreliable

### Images not loading on dashboard
- `next.config.ts` must whitelist the image domain
- Currently allowed: `i.redd.it`, `i.imgur.com`, `preview.redd.it`, `external-preview.redd.it`

## Git Workflow

1. Create a feature branch from `main`
2. Make changes, verify TypeScript compiles: `npx tsc --noEmit`
3. Push branch, create PR against `main`
4. Merge → Vercel auto-deploys

## Deployment

- **Auto-deploy**: Any push to `main` triggers Vercel deployment
- **Cron**: Runs daily at 8:00 AM UTC (configured in `vercel.json`)
- **Manual scrape**: Click "Run Scrape" on dashboard or `curl` with auth header
