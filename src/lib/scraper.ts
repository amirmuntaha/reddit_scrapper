import { supabase, RedditPost } from "./supabase";

const REDDIT_TOP_URL = "https://www.reddit.com/r/all/top.json?t=day&limit=50";

interface RedditApiChild {
  data: {
    id: string;
    title: string;
    subreddit: string;
    author: string;
    permalink: string;
    score: number;
    created_utc: number;
    url: string;
    post_hint?: string;
    is_video: boolean;
    over_18: boolean;
    preview?: {
      images?: Array<{
        source: {
          url: string;
          width: number;
          height: number;
        };
      }>;
    };
  };
}

interface RedditApiResponse {
  data: {
    children: RedditApiChild[];
  };
}

/**
 * Checks if a URL points to a valid image
 */
function isImageUrl(url: string): boolean {
  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
  const lowerUrl = url.toLowerCase();
  return imageExtensions.some((ext) => lowerUrl.includes(ext));
}

/**
 * Extracts the best image URL from a Reddit post
 */
function getImageUrl(post: RedditApiChild["data"]): string | null {
  // Direct image link (i.redd.it, i.imgur.com, etc.)
  if (isImageUrl(post.url)) {
    return post.url;
  }

  // Check post_hint for image type
  if (post.post_hint === "image") {
    return post.url;
  }

  // Fallback to preview image
  if (post.preview?.images?.[0]?.source?.url) {
    // Reddit encodes the URL with HTML entities
    return post.preview.images[0].source.url.replace(/&amp;/g, "&");
  }

  return null;
}

/**
 * Generates a caption suitable for Instagram from the post title
 */
function generateCaption(post: RedditApiChild["data"]): string {
  const title = post.title;
  const subreddit = post.subreddit;
  const caption = `${title}\n\n📍 from r/${subreddit}\n\n#reddit #${subreddit} #viral #trending #memes #funny #popular`;
  return caption;
}

/**
 * Fetches top posts from Reddit and filters for image posts
 */
export async function fetchTopRedditPosts(): Promise<
  Omit<RedditPost, "id" | "scraped_at" | "created_at">[]
> {
  const response = await fetch(REDDIT_TOP_URL, {
    headers: {
      "User-Agent": "RedditScraper/1.0 (Next.js App)",
    },
  });

  if (!response.ok) {
    throw new Error(`Reddit API error: ${response.status} ${response.statusText}`);
  }

  const data: RedditApiResponse = await response.json();
  const posts: Omit<RedditPost, "id" | "scraped_at" | "created_at">[] = [];

  for (const child of data.data.children) {
    const post = child.data;

    // Skip NSFW posts, videos, and non-image posts
    if (post.over_18 || post.is_video) continue;

    const imageUrl = getImageUrl(post);
    if (!imageUrl) continue;

    posts.push({
      reddit_id: post.id,
      title: post.title,
      image_url: imageUrl,
      caption: generateCaption(post),
      subreddit: post.subreddit,
      author: post.author,
      reddit_url: `https://reddit.com${post.permalink}`,
      score: post.score,
      posted_to_instagram: false,
      reddit_created_at: new Date(post.created_utc * 1000).toISOString(),
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
