// src/lib/rateLimit.ts
// Fixed-window per-IP rate limiter.
//
// ⚠️ Same caveat as cache.ts — per-process. Good for local + single-instance
// deploys. On serverless, upgrade to Upstash Redis ratelimit (@upstash/ratelimit).

import type { NextRequest } from "next/server";

type Window = { count: number; resetAt: number };

const buckets = new Map<string, Window>();
const MAX_KEYS = 2_000;

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  resetAt: number;
};

/**
 * @param req     The incoming Next request
 * @param limit   Max requests per window (default 10)
 * @param windowMs Window duration in ms (default 60s)
 */
export function rateLimit(
  req: NextRequest,
  limit = 10,
  windowMs = 60_000,
): RateLimitResult {
  const ip = getClientIp(req);
  const now = Date.now();
  const bucket = buckets.get(ip);

  if (!bucket || bucket.resetAt < now) {
    if (buckets.size >= MAX_KEYS) {
      const firstKey = buckets.keys().next().value;
      if (firstKey !== undefined) buckets.delete(firstKey);
    }
    buckets.set(ip, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  bucket.count += 1;
  const remaining = Math.max(0, limit - bucket.count);
  return { ok: bucket.count <= limit, remaining, resetAt: bucket.resetAt };
}

function getClientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  // Local dev fallback — all local requests share one bucket.
  return "local";
}