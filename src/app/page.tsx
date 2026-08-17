import { createClient } from "@supabase/supabase-js";
import Image from "next/image";
import ScrapeButton from "./components/ScrapeButton";
import InstagramButton from "./components/InstagramButton";
import Pagination from "./components/Pagination";
import { Suspense } from "react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface RedditPost {
  id: number;
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
  scraped_at: string;
}

async function getTotalPostCount(): Promise<number> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { count, error } = await supabase
    .from("reddit_posts")
    .select("*", { count: "exact", head: true });

  if (error) {
    console.error("Error fetching count:", error);
    return 0;
  }

  return count || 0;
}

async function getPaginatedPosts(
  page: number,
  perPage: number
): Promise<RedditPost[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  const { data, error } = await supabase
    .from("reddit_posts")
    .select("*")
    .order("scraped_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Error fetching posts:", error);
    return [];
  }

  return data || [];
}

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page as string) || 1);
  const perPage = [6, 9, 12, 15].includes(parseInt(params.perPage as string))
    ? parseInt(params.perPage as string)
    : 9;

  const [posts, totalPosts] = await Promise.all([
    getPaginatedPosts(page, perPage),
    getTotalPostCount(),
  ]);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          {/* Mobile: stack vertically, Desktop: single row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xs sm:text-sm">R</span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold">Reddit Scraper</h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="text-xs sm:text-sm text-gray-400 hidden sm:inline">
                {totalPosts} posts scraped
              </span>
              <span className="text-xs text-gray-400 sm:hidden">
                {totalPosts}
              </span>
              <ScrapeButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8 flex-1 w-full">
        {totalPosts === 0 ? (
          <div className="text-center py-12 sm:py-20">
            <div className="text-5xl sm:text-6xl mb-4">📭</div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2">No posts scraped yet</h2>
            <p className="text-gray-400 mb-6 text-sm sm:text-base px-4">
              Click &quot;Run Scrape&quot; to fetch the top Reddit posts of the day.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-colors"
                >
                  {/* Image */}
                  <div className="relative aspect-square bg-gray-800">
                    <Image
                      src={post.image_url}
                      alt={post.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    {post.posted_to_instagram && (
                      <div className="absolute top-2 right-2 bg-green-500/90 px-2 py-1 rounded text-xs font-medium">
                        ✓ Posted
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">
                        r/{post.subreddit}
                      </span>
                      <span className="text-xs text-gray-500">
                        ⬆ {post.score.toLocaleString()}
                      </span>
                    </div>

                    <h3 className="font-medium text-sm line-clamp-2 mb-2">
                      {post.title}
                    </h3>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="truncate mr-2">u/{post.author}</span>
                      <span className="flex-shrink-0">
                        {new Date(post.scraped_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <a
                        href={post.reddit_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:text-blue-300"
                      >
                        View on Reddit ↗
                      </a>
                      <InstagramButton
                        postId={post.id}
                        imageUrl={post.image_url}
                        caption={post.caption || post.title}
                        title={post.title}
                        alreadyPosted={post.posted_to_instagram}
                      />
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination */}
            <Suspense fallback={null}>
              <Pagination
                totalPosts={totalPosts}
                currentPage={page}
                perPage={perPage}
              />
            </Suspense>
          </>
        )}
      </main>

      {/* Footer with Quick Links */}
      <footer className="border-t border-gray-800 bg-gray-900/30">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm">
            <a
              href="https://github.com/amirmuntaha/reddit_scrapper"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors flex items-center gap-1"
            >
              📂 GitHub
            </a>
            <a
              href="https://vercel.com/amirmuntaha/reddit-scrapper"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors flex items-center gap-1"
            >
              🚀 Vercel
            </a>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors flex items-center gap-1"
            >
              🗄️ Supabase
            </a>
            <a
              href="https://vercel.com/amirmuntaha/reddit-scrapper/logs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors flex items-center gap-1"
            >
              📋 Logs
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
