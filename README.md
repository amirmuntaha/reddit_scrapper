# Reddit Scraper 🤖📸

🌐 **Live Demo:** [https://reddit-scrapper-phi.vercel.app](https://reddit-scrapper-phi.vercel.app)

## Quick Links

| Service | Link |
|---------|------|
| 🌐 **Live App** | [reddit-scrapper-phi.vercel.app](https://reddit-scrapper-phi.vercel.app) |
| 📂 **GitHub Repo** | [github.com/amirmuntaha/reddit_scrapper](https://github.com/amirmuntaha/reddit_scrapper) |
| 🚀 **Vercel Dashboard** | [vercel.com/dashboard](https://vercel.com/amirmuntaha/reddit-scrapper) |
| 🗄️ **Supabase Dashboard** | [supabase.com/dashboard](https://supabase.com/dashboard) |

A Next.js application that scrapes the top 10 most popular image posts from Reddit daily and stores them in Supabase PostgreSQL. Designed to be deployed on Vercel with a daily cron job, providing content ready to be posted to Instagram.

## Features

- 🔄 **Daily Automated Scraping** — Runs via Vercel Cron every day at 8:00 AM UTC
- 📸 **Image-Only Posts** — Filters for posts with valid images (skips videos & NSFW)
- 📝 **Instagram-Ready Captions** — Auto-generates captions with hashtags
- 🗄️ **Supabase Storage** — Stores posts in PostgreSQL with deduplication
- 📊 **Dashboard** — View all scraped posts with images, scores, and metadata
- 🔒 **Secure Cron Endpoint** — Protected by `CRON_SECRET` bearer token
- 📚 **Original Content & Policy Pages** — Curation guide, about, editorial policy, contact, privacy, terms
- 🔎 **SEO Metadata** — Per-route canonical/Open Graph tags, `robots.txt`, `sitemap.xml`
- 💰 **Optional AdSense** — Ads render only on article pages, and only when a real publisher ID is configured

## Public Pages

| Route | Purpose | Ads allowed |
|-------|---------|-------------|
| `/` | Dynamic discovery dashboard (scraped records, scrape control, pagination) | ❌ No |
| `/guides/responsible-curation` | Long-form original guide on rights, verification, attribution | ✅ Yes |
| `/about` | Project purpose, automation scope, independence, limitations | ✅ Yes |
| `/editorial-policy` | How records are discovered, filtered, ordered, corrected | ❌ No |
| `/contact` | GitHub-issue contact route for corrections/removal/privacy/security | ❌ No |
| `/privacy` | Data handling, third-party hosts, advertising disclosures | ❌ No |
| `/terms` | Acceptable use, third-party rights, disclaimers | ❌ No |
| `/robots.txt`, `/sitemap.xml` | Crawler directives and canonical URL list | — |
| `/ads.txt` | Authorized seller line (404 until a publisher ID is set) | — |

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database:** Supabase PostgreSQL
- **Styling:** Tailwind CSS
- **Deployment:** Vercel
- **Cron:** Vercel Cron Jobs

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/amirmuntaha/reddit_scrapper.git
cd reddit_scrapper
npm install
```

### 2. Set up Supabase

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run the migration file at `supabase/migrations/001_create_reddit_posts.sql`
4. Copy your project URL and Service Role Key from **Settings > API**

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
CRON_SECRET=any-random-secret-string
```

### 4. Run locally

```bash
npm run dev
```

Visit `http://localhost:3000` to see the dashboard.

### 5. Test the scraper

```bash
curl http://localhost:3000/api/scrape
```

## Deploy to Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Add the environment variables in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `CRON_SECRET`
4. Deploy! The cron job will automatically run daily at 8:00 AM UTC

## Enabling Google AdSense (optional)

The site ships ad-free. Advertising activates only when both variables are set:

```
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXX   # AdSense > Account > Settings
NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE=XXXXXXXXXX             # AdSense > Ads > By ad unit > Display ads
```

Add them in **Vercel > Settings > Environment Variables** and redeploy. Then:

- ad units render only on the routes in `AD_ELIGIBLE_ROUTES` (`src/lib/adsense.ts`)
- `/ads.txt` starts serving `google.com, pub-…, DIRECT, f08c47fec0942fa0`
- the privacy policy automatically switches to its "ads enabled" disclosures

Invalid or missing values mean **no** loader script, **no** `<ins>` markup, and a 404 `/ads.txt`.
To change which pages may show ads, edit `AD_ELIGIBLE_ROUTES` and render `<AdSenseLoader />`
plus `<ContentAd />` in that page — never in the root layout, so excluded pages stay clean.

> ⚠️ Approval is Google's decision. Pages built mainly from scraped third-party media
> need real curation and original commentary; see `/guides/responsible-curation`.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── scrape/route.ts       # Cron job endpoint
│   │   ├── download/route.ts     # Image proxy for manual IG download
│   │   └── instagram/route.ts    # Reserved for future Graph API use
│   ├── about/page.tsx            # About (ads allowed)
│   ├── guides/
│   │   └── responsible-curation/page.tsx  # Long-form guide (ads allowed)
│   ├── editorial-policy/page.tsx # Transparency policy
│   ├── contact/page.tsx          # GitHub-issue contact route
│   ├── privacy/page.tsx          # Privacy policy (ad-state aware)
│   ├── terms/page.tsx            # Terms of use
│   ├── components/               # SiteHeader, SiteFooter, StaticContent, ads, buttons
│   ├── ads.txt/route.ts          # Authorized seller line (404 when unconfigured)
│   ├── robots.ts                 # Crawler rules + sitemap pointer
│   ├── sitemap.ts                # Canonical public routes
│   ├── page.tsx                  # Dashboard UI
│   └── layout.tsx                # Root layout, shared chrome, base metadata
├── lib/
│   ├── adsense.ts            # Publisher ID validation & ad-eligible routes
│   ├── metadata.ts           # Per-page canonical/OG/Twitter metadata helper
│   ├── scraper.ts            # Reddit scraping logic
│   └── supabase.ts           # Supabase client & types
supabase/
└── migrations/
    └── 001_create_reddit_posts.sql  # Database schema
vercel.json                   # Cron job configuration
```

## Database Schema

| Column | Type | Description |
|--------|------|-------------|
| `id` | BIGSERIAL | Primary key |
| `reddit_id` | TEXT | Unique Reddit post ID |
| `title` | TEXT | Post title |
| `image_url` | TEXT | Direct image URL |
| `caption` | TEXT | Generated Instagram caption |
| `subreddit` | TEXT | Source subreddit |
| `author` | TEXT | Reddit author |
| `reddit_url` | TEXT | Link to original post |
| `score` | INTEGER | Upvote score |
| `posted_to_instagram` | BOOLEAN | Tracking flag |
| `reddit_created_at` | TIMESTAMPTZ | When posted on Reddit |
| `scraped_at` | TIMESTAMPTZ | When scraped |

## Automation Tests

This project uses [Playwright](https://playwright.dev/) to run end-to-end tests against the deployed website.

### Running tests

```bash
# Run tests against the default deployed URL
npm test

# Run tests against a specific URL
BASE_URL=https://your-production-url.vercel.app npm test

# Run tests with browser visible (headed mode)
npm run test:headed

# View the test report
npm run test:report
```

### Test Suites

| File | Description |
|------|-------------|
| `tests/homepage.spec.ts` | Dashboard UI — header, post grid, empty state, links |
| `tests/api-scrape.spec.ts` | API endpoint — response codes, JSON structure, timing |
| `tests/performance.spec.ts` | Performance, responsiveness, accessibility checks |
| `tests/content-pages.spec.ts` | Content/policy routes, navigation, crawler files, ad placement rules |

### Note on Deployment Protection

If Vercel's **Deployment Protection** is enabled, homepage and performance tests will be skipped automatically (the site redirects to a Vercel login page). To run the full test suite:

1. Go to **Vercel Dashboard** → your project → **Settings** → **Deployment Protection**
2. Set **Standard Protection** to **Only Preview Deployments** (keeps production public)
3. Re-run: `npm test`

## Future Enhancements

- [ ] Instagram auto-posting integration
- [ ] Configurable subreddits to scrape
- [ ] Post scheduling queue
- [ ] Analytics dashboard
