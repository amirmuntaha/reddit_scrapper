import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { Suspense } from "react";
import Pagination from "./components/Pagination";
import PostCard from "./components/PostCard";
import ScrapeButton from "./components/ScrapeButton";

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

const focusLink =
  "rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-400";

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
    <div className="mx-auto w-full max-w-7xl px-3 py-6 sm:px-4 sm:py-10">
      <section aria-labelledby="dashboard-title" className="border-b border-gray-800 pb-10">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-400">
              Discovery dashboard
            </p>
            <h1
              id="dashboard-title"
              className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl"
            >
              Reddit Scraper
            </h1>
            <p className="mt-4 text-base leading-7 text-gray-300 sm:text-lg">
              This independent dashboard collects a narrow set of public Reddit
              image-post records so a person can inspect possible source material.
              It is not Reddit, an Instagram client, or an automatic publishing
              service. A saved record is a discovery lead—not permission to reuse
              media and not an editorial recommendation.
            </p>
          </div>
          <div className="flex shrink-0 items-center justify-between gap-4 rounded-xl border border-gray-800 bg-gray-900/60 p-4 sm:flex-col sm:items-end">
            <span className="text-sm text-gray-400">
              {totalPosts} posts scraped
            </span>
            <ScrapeButton />
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-orange-500/30 bg-orange-500/10 p-5 sm:flex sm:items-center sm:justify-between sm:gap-6">
          <div>
            <h2 className="font-semibold text-orange-100">
              Curation starts after discovery
            </h2>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-orange-100/80">
              Before publishing anything, verify the original source, rights,
              context, safety, attribution, and platform requirements.
            </p>
          </div>
          <Link
            href="/guides/responsible-curation"
            className={`mt-4 inline-flex shrink-0 items-center rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-400 sm:mt-0 ${focusLink}`}
          >
            Read the curation guide →
          </Link>
        </div>
      </section>

      <section aria-labelledby="record-meaning" className="py-10 sm:py-14">
        <div className="max-w-3xl">
          <h2 id="record-meaning" className="text-2xl font-bold tracking-tight sm:text-3xl">
            What a dashboard record means
          </h2>
          <p className="mt-4 leading-7 text-gray-300">
            Each card is a database snapshot created from a public Reddit RSS
            entry. It includes the feed title, author name, subreddit, source
            link, direct image URL, source publication time when available, and
            the time this project stored the record. The displayed score is a
            source-data field, not this project&apos;s rating or endorsement; the
            current RSS workflow records zero when the feed does not provide a
            score. The generated caption and download control are conveniences
            for review only. They do not prove authorship, establish a license,
            contact a creator, or post to Instagram.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5">
            <h3 className="font-semibold text-white">Source identity</h3>
            <p className="mt-2 text-sm leading-6 text-gray-400">
              The subreddit, author, title, and Reddit link help a reviewer return
              to the source discussion and investigate provenance.
            </p>
          </div>
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5">
            <h3 className="font-semibold text-white">Media reference</h3>
            <p className="mt-2 text-sm leading-6 text-gray-400">
              The image URL points to third-party media. Its presence here does
              not transfer ownership or grant a right to republish it.
            </p>
          </div>
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5">
            <h3 className="font-semibold text-white">Workflow state</h3>
            <p className="mt-2 text-sm leading-6 text-gray-400">
              Scrape time and the existing posted flag support operations. They
              are not evidence that a human completed a rights or safety review.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="workflow" className="border-y border-gray-800 py-10 sm:py-14">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <h2 id="workflow" className="text-2xl font-bold tracking-tight sm:text-3xl">
              Automated workflow and methodology
            </h2>
            <p className="mt-4 leading-7 text-gray-300">
              The scheduled process handles discovery and storage. Human judgment
              is still required for any use beyond this dashboard.
            </p>
          </div>
          <ol className="grid gap-4 sm:grid-cols-2">
            {[
              [
                "1. Fetch",
                "A daily Vercel cron request—or the protected Run Scrape control—requests Reddit top-post RSS feeds for the day.",
              ],
              [
                "2. Parse",
                "The server extracts feed identifiers, titles, authors, subreddits, source links, dates, and candidate media URLs.",
              ],
              [
                "3. Filter",
                "Only direct static-image links from i.redd.it or i.imgur.com with recognized image extensions are accepted; video and preview fallbacks are rejected.",
              ],
              [
                "4. Store and display",
                "Up to ten qualifying records are deduplicated by Reddit ID in Supabase, then the dashboard retrieves recent records in scrape-time order with server-side pagination.",
              ],
            ].map(([title, copy]) => (
              <li key={title} className="rounded-xl border border-gray-800 bg-gray-900/50 p-5">
                <h3 className="font-semibold text-orange-300">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-400">{copy}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-8 rounded-xl border border-gray-800 bg-gray-900/70 p-5 sm:p-6">
          <h3 className="font-semibold text-white">Why filter videos and previews?</h3>
          <p className="mt-2 leading-7 text-gray-300">
            A video thumbnail can look like a reusable still while actually being
            a temporary preview, a low-resolution derivative, or only one frame
            from a larger work. Preview hosts can also return transformed assets
            rather than the source image a reviewer expects. Restricting ingestion
            to recognizable direct image URLs makes the dashboard more predictable
            and reduces broken or misleading media records. It is a technical
            quality filter only—not a rights, accuracy, or suitability decision.
          </p>
        </div>
      </section>

      <section aria-labelledby="reuse-checklist" className="py-10 sm:py-14">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <h2 id="reuse-checklist" className="text-2xl font-bold tracking-tight sm:text-3xl">
              Responsible reuse checklist
            </h2>
            <p className="mt-4 leading-7 text-gray-300">
              Do not treat discovery as clearance. Complete a manual review for
              every candidate and preserve what you learned.
            </p>
          </div>
          <ul className="grid gap-3 text-sm leading-6 text-gray-300 sm:grid-cols-2">
            {[
              "Open the source post and verify that the record still matches it.",
              "Trace the media to its creator or earliest reliable publication.",
              "Ask the appropriate rights holder for permission or confirm a license that covers the planned use.",
              "Record the permission terms, scope, date, and any required attribution.",
              "Credit the creator and source clearly; a link alone is not always sufficient.",
              "Check context, captions, names, dates, and claims against reliable sources.",
              "Consider privacy, dignity, safety, minors, graphic material, and unintended harm.",
              "Follow Reddit, Instagram, host, community, and any other applicable platform rules.",
              "Write original commentary rather than copying the Reddit title or discussion as your own work.",
              "Perform a final human review of image quality, accessibility text, cropping, and publication context.",
            ].map((item) => (
              <li key={item} className="flex gap-3 rounded-lg border border-gray-800 bg-gray-900/40 p-4">
                <span className="mt-0.5 text-orange-400" aria-hidden="true">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="faq" className="border-t border-gray-800 py-10 sm:py-14">
        <h2 id="faq" className="text-2xl font-bold tracking-tight sm:text-3xl">
          Quick questions
        </h2>
        <div className="mt-7 grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="font-semibold text-white">Does a card mean the image is free to use?</h3>
            <p className="mt-2 text-sm leading-6 text-gray-400">
              No. Public visibility and technical accessibility do not establish
              reuse rights. Investigate ownership and obtain permission or a valid
              license for the intended use.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-white">Does the dashboard review or publish automatically?</h3>
            <p className="mt-2 text-sm leading-6 text-gray-400">
              No. It automates RSS discovery, filtering, storage, and display.
              Rights, verification, editorial judgment, and publication remain
              manual responsibilities outside the scrape operation.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-white">What should I do next?</h3>
            <p className="mt-2 text-sm leading-6 text-gray-400">
              Use the practical steps in the{" "}
              <Link
                href="/guides/responsible-curation"
                className={`font-medium text-orange-300 underline decoration-orange-400/50 underline-offset-4 hover:text-orange-200 ${focusLink}`}
              >
                Responsible Curation Guide
              </Link>{" "}
              to turn a discovery lead into a documented publication decision.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-white">How can a record be corrected or removed?</h3>
            <p className="mt-2 text-sm leading-6 text-gray-400">
              Follow the project&apos;s{" "}
              <Link
                href="/contact"
                className={`font-medium text-orange-300 underline decoration-orange-400/50 underline-offset-4 hover:text-orange-200 ${focusLink}`}
              >
                contact instructions
              </Link>{" "}
              and provide the dashboard record and original source URLs.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="saved-records" className="border-t border-gray-800 pt-10 sm:pt-14">
        <div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-400">
              Database view
            </p>
            <h2 id="saved-records" className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              Recent saved records
            </h2>
          </div>
          <p className="text-sm text-gray-500">Newest scrape time first</p>
        </div>

        {totalPosts === 0 ? (
          <div className="py-12 text-center sm:py-20">
            <div className="mb-4 text-5xl sm:text-6xl" aria-hidden="true">📭</div>
            <h2 className="mb-2 text-xl font-bold sm:text-2xl">No posts scraped yet</h2>
            <p className="mb-6 px-4 text-sm text-gray-400 sm:text-base">
              Click &quot;Run Scrape&quot; to fetch the top Reddit posts of the day.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>

            <Suspense fallback={null}>
              <Pagination
                totalPosts={totalPosts}
                currentPage={page}
                perPage={perPage}
              />
            </Suspense>
          </>
        )}
      </section>
    </div>
  );
}
