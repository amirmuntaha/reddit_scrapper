import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/download?url=<image_url>
 * 
 * Proxies image downloads to avoid CORS issues when downloading
 * Reddit images from the browser. Only allows Reddit image domains.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get("url");

  if (!imageUrl) {
    return NextResponse.json({ error: "url parameter required" }, { status: 400 });
  }

  // Only allow Reddit image domains
  const allowedDomains = [
    "i.redd.it",
    "i.imgur.com",
    "preview.redd.it",
    "external-preview.redd.it",
  ];

  try {
    const url = new URL(imageUrl);
    if (!allowedDomains.includes(url.hostname)) {
      return NextResponse.json(
        { error: "Domain not allowed" },
        { status: 403 }
      );
    }
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  try {
    const response = await fetch(imageUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch image: ${response.status}` },
        { status: response.status }
      );
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="reddit-image.jpg"`,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Download failed: ${error}` },
      { status: 500 }
    );
  }
}
