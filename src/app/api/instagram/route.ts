import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GRAPH_API_URL = "https://graph.facebook.com/v21.0";

/**
 * POST /api/instagram
 * 
 * Publishes a scraped Reddit post to Instagram using the Graph API.
 * Two-step process: create media container → publish it.
 * 
 * Body: { postId: number }
 */
export async function POST(request: Request) {
  try {
    const { postId } = await request.json();

    if (!postId) {
      return NextResponse.json({ error: "postId is required" }, { status: 400 });
    }

    const igUserId = process.env.INSTAGRAM_USER_ID;
    const igAccessToken = process.env.INSTAGRAM_ACCESS_TOKEN;

    if (!igUserId || !igAccessToken) {
      return NextResponse.json(
        { error: "Instagram API not configured. Set INSTAGRAM_USER_ID and INSTAGRAM_ACCESS_TOKEN in Vercel." },
        { status: 500 }
      );
    }

    // Fetch the post from Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: post, error: fetchError } = await supabase
      .from("reddit_posts")
      .select("*")
      .eq("id", postId)
      .single();

    if (fetchError || !post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.posted_to_instagram) {
      return NextResponse.json({ error: "Already posted to Instagram" }, { status: 400 });
    }

    // Step 1: Create media container
    const containerResponse = await fetch(
      `${GRAPH_API_URL}/${igUserId}/media`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_url: post.image_url,
          caption: post.caption,
          access_token: igAccessToken,
        }),
      }
    );

    const containerData = await containerResponse.json();

    if (!containerResponse.ok || containerData.error) {
      return NextResponse.json(
        {
          error: "Failed to create Instagram media container",
          details: containerData.error?.message || containerData,
        },
        { status: 500 }
      );
    }

    const containerId = containerData.id;

    // Step 2: Wait briefly for container to process, then publish
    // Instagram needs a moment to download and process the image
    await new Promise((resolve) => setTimeout(resolve, 5000));

    const publishResponse = await fetch(
      `${GRAPH_API_URL}/${igUserId}/media_publish`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creation_id: containerId,
          access_token: igAccessToken,
        }),
      }
    );

    const publishData = await publishResponse.json();

    if (!publishResponse.ok || publishData.error) {
      return NextResponse.json(
        {
          error: "Failed to publish to Instagram",
          details: publishData.error?.message || publishData,
        },
        { status: 500 }
      );
    }

    // Step 3: Mark post as published in Supabase
    await supabase
      .from("reddit_posts")
      .update({ posted_to_instagram: true })
      .eq("id", postId);

    return NextResponse.json({
      success: true,
      instagram_media_id: publishData.id,
      message: "Successfully posted to Instagram!",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
