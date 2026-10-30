// src/app/api/audio/route.ts
// POST /api/audio  { url }  ->  { audioUrl }
//
// No cache — FastSaver audio URLs expire in ~10 min. Rate limit is stricter
// (5/min) because YouTube audio extraction costs 15 credits per call.

import { NextRequest, NextResponse } from "next/server";
import { fetchAudioUrl } from "@/lib/videoApi";
import { rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

function isValidUrl(value: unknown): value is string {
  if (typeof value !== "string" || value.length === 0 || value.length > 2000) {
    return false;
  }
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  // ── 1. Rate limit (stricter — 5/min) ──────────────────────
  const rl = rateLimit(request, 5, 60_000);
  if (!rl.ok) {
    const retryAfter = Math.max(1, Math.ceil((rl.resetAt - Date.now()) / 1000));
    return NextResponse.json(
      { error: "Too many audio requests. Please slow down." },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfter),
          "X-RateLimit-Remaining": "0",
        },
      },
    );
  }

  // ── 2. Parse + validate body ──────────────────────────────
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be JSON." },
      { status: 400 },
    );
  }

  const url = (body as { url?: unknown })?.url;
  if (!isValidUrl(url)) {
    return NextResponse.json(
      { error: "Please provide a valid video URL." },
      { status: 400 },
    );
  }

  // ── 3. Extract audio ──────────────────────────────────────
  try {
    const audioUrl = await fetchAudioUrl(url);
    if (!audioUrl) {
      return NextResponse.json(
        { error: "Audio is not available for this platform." },
        { status: 404 },
      );
    }
    return NextResponse.json({ audioUrl }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";

    if (/429|rate.?limit/i.test(message)) {
      return NextResponse.json(
        { error: "Too many requests right now. Try again in a minute." },
        { status: 429 },
      );
    }

    console.error("[/api/audio] FastSaver error:", message);
    return NextResponse.json(
      { error: "Could not extract audio. Please try again." },
      { status: 502 },
    );
  }
}