import { NextResponse } from "next/server";
import { scrapeReddit } from "@/lib/scraper";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60; // Allow up to 60 seconds for scraping

/**
 * GET /api/scrape
 * 
 * This endpoint is called by the Vercel cron job daily.
 * It scrapes the top 10 image posts from Reddit and stores them in Supabase.
 * 
 * Protected by CRON_SECRET environment variable to prevent unauthorized access.
 */
export async function GET(request: Request) {
  // Verify the request is from Vercel Cron or has the correct secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  console.log(`[${new Date().toISOString()}] Starting Reddit scrape...`);

  const result = await scrapeReddit();

  console.log(
    `[${new Date().toISOString()}] Scrape complete:`,
    JSON.stringify(result)
  );

  if (!result.success) {
    return NextResponse.json(result, { status: 500 });
  }

  return NextResponse.json(result, { status: 200 });
}
