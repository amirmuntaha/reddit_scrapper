# Technical Decisions & Context

This document captures the "why" behind key technical decisions, so future developers/AI don't repeat the same investigations.

## Reddit Data Access (August 2026)

### Decision: Use RSS feeds, not the Reddit API
**Why:**
- Reddit closed self-service API app creation in November 2025
- Creating an API app now requires approval via "Responsible Builder Policy" (3-7 days)
- The `.json` endpoints return 403 Forbidden since May 2026
- RSS feeds (`/r/all/top.rss`) are still public and free

**Trade-offs:**
- ❌ No upvote scores (RSS doesn't include them)
- ❌ No NSFW flag (can't explicitly filter)
- ❌ No `post_hint` field to reliably detect image vs video
- ✅ No API key needed
- ✅ No approval process
- ✅ Works immediately

### Decision: Use RSS auth params (feed= & user=)
**Why:**
- Reddit rate limits unauthenticated RSS to 1 request per 60 seconds (changed June 2026)
- Adding `feed=` and `user=` params (from reddit.com/prefs/feeds) bypasses this
- These are NOT OAuth tokens — they're RSS-specific identifiers

### Decision: Full browser headers required
**Why:**
- Reddit blocks requests from datacenter IPs (Vercel, AWS, etc.)
- Even RSS endpoints return 403 without proper browser-like headers
- Required: User-Agent (Chrome), Accept, Sec-Fetch-*, etc.
- This was discovered through trial and error — simple User-Agent strings get 429/403

## Image Filtering

### Decision: Strict image-only policy (no thumbnail fallbacks)
**Why:**
- Previous approach used `preview.redd.it` thumbnails as fallback
- Problem: video posts also have thumbnails with `.png` extensions
- `external-preview.redd.it` thumbnails return 403 when accessed externally
- Only reliable indicator: direct `i.redd.it` or `i.imgur.com` link in content

**Accepted images:**
- `i.redd.it/*.jpg|jpeg|png|gif|webp`
- `i.imgur.com/*.jpg|jpeg|png|gif|webp`

**Rejected:**
- Any post with `v.redd.it` in content (video)
- Any post with `external-preview.redd.it` thumbnail (video preview)
- Posts with only thumbnails but no direct image link

## Database

### Decision: Supabase with service_role key
**Why:**
- Supabase enables Row Level Security (RLS) by default
- The `anon` key respects RLS → inserts fail silently
- The `service_role` key bypasses RLS entirely
- Since all DB access is server-side (API routes), service_role is appropriate

### Decision: Upsert with `onConflict: "reddit_id"`
**Why:**
- Prevents duplicate posts when cron runs daily
- Same post appearing in multiple scrapes won't be re-inserted
- `ignoreDuplicates: true` means no error on conflict

## Instagram Integration

### Decision: Manual download + copy caption (not Graph API)
**Why:**
- Instagram Graph API requires:
  - Meta Developer App creation
  - App review and approval
  - Business/Creator IG account
  - Token refresh every 60 days
- This was too complex for initial version
- Current flow: download image + auto-copy caption → post manually
- The `/api/instagram` route exists for future Graph API integration

## Frontend

### Decision: Server Components + Client Components pattern
**Why:**
- `page.tsx` is a Server Component (fetches data from Supabase directly)
- Interactive elements (buttons, pagination) are Client Components (`"use client"`)
- This avoids exposing Supabase credentials to the browser

### Decision: URL-based pagination (?page=X&perPage=Y)
**Why:**
- Bookmarkable/shareable URLs
- Server-side data fetching with Supabase `.range()`
- No state management needed
- Works without JavaScript (progressive enhancement)

## Testing

### Decision: E2E tests against production URL
**Why:**
- No complex test infrastructure needed
- Tests verify the real deployed app
- Playwright can run from CI or locally
- Tests gracefully skip when Vercel Deployment Protection is active
