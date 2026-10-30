// src/app/api/fetch/route.ts
// POST /api/fetch  { url }  ->  VideoResult
//
// Pipeline: rate limit -> reject profile URLs -> cache -> FastSaver -> cache store

import { NextRequest, NextResponse } from "next/server";
import { fetchVideoInfo, type VideoResult } from "@/lib/videoApi";
import { rateLimit } from "@/lib/rateLimit";
import { cacheGet, cacheSet, DEFAULT_TTL_MS } from "@/lib/cache";

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

function isProfileUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    const host = u.hostname.replace(/^www\./, "").toLowerCase();
    const path = u.pathname.replace(/^\/+/, "");

    // ── Instagram ──
    if (host.endsWith("instagram.com")) {
      if (
        path.startsWith("p/") ||
        path.startsWith("reel/") ||
        path.startsWith("tv/") ||
        path.startsWith("stories/")
      ) {
        return false;
      }
      return true;
    }

    // ── TikTok ──
    if (host.endsWith("tiktok.com")) {
      // Allow short share links explicitly
      if (host === "vm.tiktok.com" || host === "vt.tiktok.com") return false;
      // Allow standard video URLs
      if (path.startsWith("@") && path.includes("/video/")) return false;
      // Allow other short formats
      if (path.startsWith("t/") || path.startsWith("v/")) return false;
      return true;
    }

    // ── Facebook ──
    if (host.endsWith("facebook.com") || host === "fb.watch") {
      if (host === "fb.watch") return false;
      if (
        path.includes("/videos/") ||
        path.includes("/permalink") ||
        path.startsWith("watch") ||
        path.startsWith("share/")
      ) {
        return false;
      }
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  // 1. Rate limit
  const rl = rateLimit(request, 10, 60_000);
  if (!rl.ok) {
    const retryAfter = Math.max(1, Math.ceil((rl.resetAt - Date.now()) / 1000));
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfter),
          "X-RateLimit-Remaining": "0",
        },
      },
    );
  }

  // 2. Parse + validate
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
      { error: "Please provide a valid http(s) video URL." },
      { status: 400 },
    );
  }

  // 3. Reject profile URLs early (0 credits spent)
  if (isProfileUrl(url)) {
    return NextResponse.json(
      {
        error:
          "That looks like a profile, not a post. Paste the link to a specific video or carousel.",
      },
      { status: 400 },
    );
  }

  // 4. Cache
  const cacheKey = `fetch:${url}`;
  const cached = cacheGet<VideoResult>(cacheKey);
  if (cached) {
    return NextResponse.json(cached, {
      status: 200,
      headers: { "X-Cache": "HIT" },
    });
  }

  // 5. Upstream
  try {
    const result = await fetchVideoInfo(url);
    cacheSet(cacheKey, result, DEFAULT_TTL_MS);
    return NextResponse.json(result, {
      status: 200,
      headers: { "X-Cache": "MISS" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";

    if (/429|rate.?limit/i.test(message)) {
      return NextResponse.json(
        { error: "Too many requests right now. Try again in a minute." },
        { status: 429 },
      );
    }
    if (/APIFY_API_TOKEN|TTAPI_SUNO_KEY|401|403|unauthor/i.test(message)) {
      return NextResponse.json(
        { error: "Service is not configured correctly. Check API key." },
        { status: 500 },
      );
    }
    if (/private|deleted|unavailable|not available|region/i.test(message)) {
      return NextResponse.json(
        { error: "That video is private, deleted, or region-locked." },
        { status: 422 },
      );
    }

    console.error("[/api/fetch] FastSaver error:", message);
    return NextResponse.json(
      { error: "Could not fetch video. Please check the link and try again." },
      { status: 502 },
    );
  }
}