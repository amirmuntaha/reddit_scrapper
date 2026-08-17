import { supabase, RedditPost } from "./supabase";

/**
 * Reddit RSS Feed Scraper
 * 
 * Uses Reddit's public RSS/Atom feed endpoints with browser-like headers
 * to avoid being blocked by Reddit's anti-bot detection.
 * 
 * Reddit blocks datacenter IPs (like Vercel) unless the request looks
 * like it's coming from a real browser. Full browser headers are required.
 */

const REDDIT_RSS_URL = "https://www.reddit.com/r/all/top.rss?t=day&limit=50";

/**
 * Browser-like headers that bypass Reddit's anti-bot detection.
 * Reddit blocks requests that don't look like they're from a real browser,
 * especially from cloud/datacenter IPs (Vercel, AWS, etc.)
 */
const BROWSER_HEADERS: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Accept-Encoding": "gzip, deflate, br",
  Connection: "keep-alive",
  "Cache-Control": "max-age=0",
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Sec-Fetch-User": "?1",
  "Upgrade-Insecure-Requests": "1",
};

interface ParsedPost {
  id: string;
  title: string;
  author: string;
  subreddit: string;
  link: string;
  thumbnail: string | null;
  imageUrl: string | null;
  published: string;
}

/**
 * Parses the Atom XML feed from Reddit into structured post data
 */
function parseAtomFeed(xml: string): ParsedPost[] {
  const posts: ParsedPost[] = [];

  // Match all <entry> blocks
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let entryMatch;

  while ((entryMatch = entryRegex.exec(xml)) !== null) {
    const entry = entryMatch[1];

    // Extract post ID (format: t3_xxxxx)
    const idMatch = entry.match(/<id>(.*?)<\/id>/);
    const id = idMatch ? idMatch[1].replace("t3_", "") : "";

    // Extract title
    const titleMatch = entry.match(/<title>(.*?)<\/title>/);
    const title = titleMatch ? decodeHtmlEntities(titleMatch[1]) : "";

    // Extract author
    const authorMatch = entry.match(/<name>(.*?)<\/name>/);
    const author = authorMatch ? authorMatch[1].replace("/u/", "") : "";

    // Extract subreddit from category
    const categoryMatch = entry.match(/<category term="(.*?)"/);
    const subreddit = categoryMatch ? categoryMatch[1] : "";

    // Extract link (permalink)
    const linkMatch = entry.match(/<link href="(.*?)"/);
    const link = linkMatch ? linkMatch[1] : "";

    // Extract thumbnail from media:thumbnail
    const thumbnailMatch = entry.match(/<media:thumbnail url="(.*?)"/);
    const thumbnail = thumbnailMatch
      ? decodeHtmlEntities(thumbnailMatch[1])
      : null;

    // Extract direct image URL from content (the [link] href)
    const contentMatch = entry.match(
      /<content type="html">([\s\S]*?)<\/content>/
    );
    let imageUrl: string | null = null;

    if (contentMatch) {
      const content = decodeHtmlEntities(contentMatch[1]);
      // Look for direct image links (i.redd.it, i.imgur.com)
      const imgLinkMatch = content.match(
        /href="(https:\/\/i\.redd\.it\/[^"]+|https:\/\/i\.imgur\.com\/[^"]+)"/
      );
      if (imgLinkMatch) {
        imageUrl = imgLinkMatch[1];
      }
    }

    // Extract published date
    const publishedMatch = entry.match(/<published>(.*?)<\/published>/);
    const published = publishedMatch ? publishedMatch[1] : "";

    if (id && title) {
      posts.push({
        id,
        title,
        author,
        subreddit,
        link,
        thumbnail,
        imageUrl,
        published,
      });
    }
  }

  return posts;
}

/**
 * Decodes HTML entities in a string
 */
function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#32;/g, " ");
}

/**
 * Checks if a URL is a direct image link
 */
function isImageUrl(url: string): boolean {
  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
  const lowerUrl = url.toLowerCase();
  return imageExtensions.some((ext) => lowerUrl.includes(ext));
}

/**
 * Gets the best image URL from a parsed post
 * Prioritizes: direct image URL > thumbnail (if it's a real image)
 */
function getBestImageUrl(post: ParsedPost): string | null {
  // Direct image link from content (i.redd.it, i.imgur.com)
  if (post.imageUrl && isImageUrl(post.imageUrl)) {
    return post.imageUrl;
  }

  // Thumbnail as fallback (these are preview.redd.it URLs with good resolution)
  if (post.thumbnail && isImageUrl(post.thumbnail)) {
    // Upgrade thumbnail to higher resolution by removing width constraint
    return post.thumbnail.replace(/width=\d+/, "width=1080");
  }

  return null;
}

/**
 * Generates a caption suitable for Instagram from the post title
 */
function generateCaption(title: string, subreddit: string): string {
  return `${title}\n\n📍 from r/${subreddit}\n\n#reddit #${subreddit} #viral #trending #memes #funny #popular`;
}

/**
 * Fetches the Reddit RSS feed with retry logic and multiple URL fallbacks.
 * Uses browser-like headers to bypass Reddit's datacenter IP blocking.
 */
async function fetchRedditRSS(): Promise<string> {
  const urls = [
    REDDIT_RSS_URL,
    "https://old.reddit.com/r/all/top.rss?t=day&limit=50",
    "https://www.reddit.com/r/pics+funny+aww+mildlyinteresting+interestingasfuck/top.rss?t=day&limit=50",
  ];

  let lastError = "";

  for (const url of urls) {
    try {
      const response = await fetch(url, {
        headers: BROWSER_HEADERS,
      });

      if (response.ok) {
        const text = await response.text();
        // Verify we got actual XML, not an error page
        if (text.includes("<feed") || text.includes("<entry>")) {
          return text;
        }
        lastError = `Got non-XML response from ${url}`;
        continue;
      }

      lastError = `${url} returned ${response.status} ${response.statusText}`;
    } catch (err) {
      lastError = `Failed to fetch ${url}: ${err}`;
    }
  }

  throw new Error(`All Reddit RSS endpoints failed. Last error: ${lastError}`);
}

/**
 * Fetches top posts from Reddit RSS feed and filters for image posts
 */
export async function fetchTopRedditPosts(): Promise<
  Omit<RedditPost, "id" | "scraped_at" | "created_at">[]
> {
  const xml = await fetchRedditRSS();
  const parsedPosts = parseAtomFeed(xml);
  const posts: Omit<RedditPost, "id" | "scraped_at" | "created_at">[] = [];

  for (const parsed of parsedPosts) {
    const imageUrl = getBestImageUrl(parsed);

    // Skip posts without images (videos, text posts, etc.)
    if (!imageUrl) continue;

    // Skip video links (v.redd.it)
    if (parsed.imageUrl && parsed.imageUrl.includes("v.redd.it")) continue;

    posts.push({
      reddit_id: parsed.id,
      title: parsed.title,
      image_url: imageUrl,
      caption: generateCaption(parsed.title, parsed.subreddit),
      subreddit: parsed.subreddit,
      author: parsed.author,
      reddit_url: parsed.link,
      score: 0, // RSS doesn't include scores
      posted_to_instagram: false,
      reddit_created_at: parsed.published
        ? new Date(parsed.published).toISOString()
        : null,
    });

    // Only take top 10 image posts
    if (posts.length >= 10) break;
  }

  return posts;
}

/**
 * Stores scraped posts in Supabase, skipping duplicates
 */
export async function storePostsInSupabase(
  posts: Omit<RedditPost, "id" | "scraped_at" | "created_at">[]
): Promise<{ inserted: number; skipped: number }> {
  let inserted = 0;
  let skipped = 0;

  for (const post of posts) {
    const { error } = await supabase.from("reddit_posts").upsert(
      {
        ...post,
        scraped_at: new Date().toISOString(),
      },
      {
        onConflict: "reddit_id",
        ignoreDuplicates: true,
      }
    );

    if (error) {
      console.error(`Error inserting post ${post.reddit_id}:`, error.message);
      skipped++;
    } else {
      inserted++;
    }
  }

  return { inserted, skipped };
}

/**
 * Main scrape function - fetches and stores posts
 */
export async function scrapeReddit(): Promise<{
  success: boolean;
  posts_found: number;
  inserted: number;
  skipped: number;
  error?: string;
}> {
  try {
    const posts = await fetchTopRedditPosts();
    const { inserted, skipped } = await storePostsInSupabase(posts);

    return {
      success: true,
      posts_found: posts.length,
      inserted,
      skipped,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Scrape failed:", message);
    return {
      success: false,
      posts_found: 0,
      inserted: 0,
      skipped: 0,
      error: message,
    };
  }
}
