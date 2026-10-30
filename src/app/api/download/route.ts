// src/app/api/download/route.ts
// POST /api/download  { url, format }  ->  { videoUrl }
//
// YouTube only. format must be one of: 240p, 480p, 720p, 1080p, 1440p, 2160p.
// Credits: 15 for <=1080p, 25 for 1440p/2160p.

import { NextRequest, NextResponse } from "next/server";
import { fetchYouTubeDownload, detectPlatform } from "@/lib/videoApi";
import { rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

const ALLOWED_FORMATS = new Set([
  "240p",
  "480p",
  "720p",
  "1080p",
  "1440p",
  "2160p",
]);

export async function POST(request: NextRequest) {
  // Stricter than /api/fetch — each call costs 15–25 credits.
  const rl = rateLimit(request, 5, 60_000);
  if (!rl.ok) {
    const retryAfter = Math.max(1, Math.ceil((rl.resetAt - Date.now()) / 1000));
    return NextResponse.json(
      { error: "Too many download attempts. Please slow down." },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfter) },
      },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be JSON." },
      { status: 400 },
    );
  }

  const { url, format } = body as { url?: unknown; format?: unknown };

  if (typeof url !== "string" || url.length === 0) {
    return NextResponse.json(
      { error: "url is required." },
      { status: 400 },
    );
  }

  if (detectPlatform(url) !== "youtube") {
    return NextResponse.json(
      { error: "Quality selection is only available for YouTube." },
      { status: 400 },
    );
  }

  if (typeof format !== "string" || !ALLOWED_FORMATS.has(format)) {
    return NextResponse.json(
      { error: "Invalid format. Use 240p, 480p, 720p, 1080p, 1440p, or 2160p." },
      { status: 400 },
    );
  }

  try {
    const videoUrl = await fetchYouTubeDownload(url, format);
    return NextResponse.json({ videoUrl }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";

    if (/429|rate.?limit/i.test(message)) {
      return NextResponse.json(
        { error: "Too many requests right now. Try again in a minute." },
        { status: 429 },
      );
    }

    console.error("[/api/download] FastSaver error:", message);
    return NextResponse.json(
      { error: "Could not download at that quality. Try a lower quality." },
      { status: 502 },
    );
  }
}