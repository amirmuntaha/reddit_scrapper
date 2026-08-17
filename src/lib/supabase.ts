import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Use service role key for server-side operations (scraping & inserting)
export const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Types for our reddit_posts table
export interface RedditPost {
  id?: number;
  reddit_id: string;
  title: string;
  image_url: string;
  caption: string | null;
  subreddit: string;
  author: string;
  reddit_url: string;
  score: number;
  posted_to_instagram: boolean;
  reddit_created_at: string | null;
  scraped_at?: string;
  created_at?: string;
}
