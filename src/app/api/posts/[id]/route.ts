import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function secretsMatch(provided: string, expected: string): boolean {
  const providedDigest = createHash("sha256").update(provided).digest();
  const expectedDigest = createHash("sha256").update(expected).digest();
  return timingSafeEqual(providedDigest, expectedDigest);
}

/** Deletes one saved dashboard record. The source Reddit post is unaffected. */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const configuredSecret = process.env.CRON_SECRET;

  // A destructive endpoint must fail closed when its server-side secret is
  // missing, unlike a public read endpoint.
  if (!configuredSecret) {
    return NextResponse.json(
      { error: "Record deletion is not configured." },
      { status: 503 }
    );
  }

  const authorization = request.headers.get("authorization") ?? "";
  const providedSecret = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : "";

  if (!providedSecret || !secretsMatch(providedSecret, configuredSecret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: rawId } = await params;
  if (!/^[1-9]\d*$/.test(rawId)) {
    return NextResponse.json({ error: "Invalid record ID." }, { status: 400 });
  }

  const id = Number(rawId);
  if (!Number.isSafeInteger(id)) {
    return NextResponse.json({ error: "Invalid record ID." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("reddit_posts")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error(`Failed to delete saved record ${id}:`, error.message);
    return NextResponse.json(
      { error: "Failed to delete the saved record." },
      { status: 500 }
    );
  }

  // DELETE is intentionally idempotent: if a prior request removed the row but
  // its response was lost or timed out, retrying still lets the client refresh
  // its stale card safely.
  if (!data) {
    return NextResponse.json({
      success: true,
      deletedId: id,
      alreadyDeleted: true,
    });
  }

  return NextResponse.json({
    success: true,
    deletedId: data.id,
    alreadyDeleted: false,
  });
}
