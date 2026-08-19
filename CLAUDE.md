# AI Agent Instructions

Read this file before making any changes to this codebase.

## Essential Context

- **Framework:** Next.js 15 with App Router, TypeScript, Tailwind CSS 4
- **Database:** Supabase PostgreSQL (use service_role key, not anon key)
- **Deployment:** Vercel (auto-deploys from `main` branch)
- **Data Source:** Reddit public RSS feeds (NOT the JSON API — it's blocked)

## Before You Code

1. Read `ARCHITECTURE.md` for system overview and data flow
2. Read `DECISIONS.md` for "why" behind key choices (saves investigation time)
3. Read `CONTRIBUTING.md` for file structure and how to add features

## Critical Rules

### Reddit Access
- NEVER use `reddit.com/r/.../top.json` — it returns 403 since May 2026
- ALWAYS use RSS feeds: `reddit.com/r/all/top.rss?t=day&limit=50`
- ALWAYS include full browser headers (see `BROWSER_HEADERS` in `src/lib/scraper.ts`)
- ALWAYS append `feed=` and `user=` params via `buildRSSUrl()` for rate limit bypass
- NEVER make more than 1 RSS request per scrape invocation (rate limit: 1 req/60s without auth)

### Image Filtering
- ONLY accept posts with direct `i.redd.it` or `i.imgur.com` links
- REJECT any post with `v.redd.it` in content (video)
- REJECT any post with `external-preview.redd.it` thumbnail (video)
- NEVER fall back to thumbnails — they're unreliable for determining post type

### Database
- Use `SUPABASE_SERVICE_ROLE_KEY` (bypasses RLS)
- Deduplication: upsert on `reddit_id` unique constraint
- Always update `RedditPost` interface in `src/lib/supabase.ts` when adding columns

### Deployment
- Push to a branch, create PR, merge to `main` → Vercel auto-deploys
- Never push directly to `main`
- After merging, wait ~30s for Vercel to redeploy
- Test the live app at: https://reddit-scrapper-phi.vercel.app

## Common Tasks

### "Add a new scraping source/subreddit"
→ Modify the URLs array in `fetchRedditRSS()` in `src/lib/scraper.ts`

### "Change scraping schedule"
→ Edit `vercel.json` → `crons[0].schedule` (cron syntax)

### "Add a new field to posts"
→ 1. SQL migration in `supabase/migrations/`
→ 2. Update `RedditPost` interface in `src/lib/supabase.ts`
→ 3. Update scraper to populate the field
→ 4. Update `page.tsx` to display it

### "Fix 403 from Reddit"
→ Check `BROWSER_HEADERS` is being sent
→ Try `old.reddit.com` as fallback
→ Verify RSS auth params are set (`REDDIT_RSS_FEED`, `REDDIT_RSS_USER`)

### "Fix 429 rate limit"
→ Ensure only 1 RSS request per scrape
→ Ensure RSS auth params are set in environment variables

### "Posts not saving to database"
→ Check `SUPABASE_SERVICE_ROLE_KEY` (not `anon` key)
→ Check RLS is disabled on `reddit_posts` table
→ Check the `/api/scrape` response `debug` field for details

## File Quick Reference

| File | What it does |
|------|-------------|
| `src/lib/scraper.ts` | Core logic: fetch RSS → parse → filter → store |
| `src/lib/supabase.ts` | DB client + `RedditPost` type definition |
| `src/app/api/scrape/route.ts` | Cron endpoint, protected by CRON_SECRET |
| `src/app/api/download/route.ts` | Image download proxy (bypasses CORS) |
| `src/app/page.tsx` | Dashboard with pagination (Server Component) |
| `src/app/components/*.tsx` | Client Components (buttons, pagination) |
| `vercel.json` | Cron schedule |
| `next.config.ts` | Allowed image domains |
| `supabase/migrations/` | Database schema files |

## Testing

```bash
npx tsc --noEmit                    # Type check (run before every commit)
npm test                             # E2E tests against production
BASE_URL=http://localhost:3000 npm test  # Test locally
```
