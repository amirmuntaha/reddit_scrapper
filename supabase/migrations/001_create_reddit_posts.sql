-- Create the reddit_posts table to store scraped Reddit posts
CREATE TABLE IF NOT EXISTS reddit_posts (
  id BIGSERIAL PRIMARY KEY,
  reddit_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT,
  subreddit TEXT NOT NULL,
  author TEXT NOT NULL,
  reddit_url TEXT NOT NULL,
  score INTEGER DEFAULT 0,
  posted_to_instagram BOOLEAN DEFAULT FALSE,
  reddit_created_at TIMESTAMPTZ,
  scraped_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quick lookups by reddit_id to avoid duplicates
CREATE INDEX IF NOT EXISTS idx_reddit_posts_reddit_id ON reddit_posts(reddit_id);

-- Index for filtering posts not yet posted to Instagram
CREATE INDEX IF NOT EXISTS idx_reddit_posts_not_posted ON reddit_posts(posted_to_instagram) WHERE posted_to_instagram = FALSE;

-- Index for ordering by scrape date
CREATE INDEX IF NOT EXISTS idx_reddit_posts_scraped_at ON reddit_posts(scraped_at DESC);
