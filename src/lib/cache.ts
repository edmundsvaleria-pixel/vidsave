// src/lib/cache.ts
// In-memory TTL cache.
//
// ⚠️ IMPORTANT: This works per-process. On a single Node server (local dev, VPS,
// long-running container) it's perfect. On serverless (Vercel, Netlify Functions)
// each invocation may spawn a new instance and the cache is cold.
// For a distributed cache, swap this for Upstash Redis later — same interface.

type Entry<T> = { value: T; expiresAt: number };

const store = new Map<string, Entry<unknown>>();

/** Hard cap so a hostile actor can't fill memory with junk keys. */
const MAX_ENTRIES = 500;

export function cacheGet<T>(key: string): T | null {
  const hit = store.get(key);
  if (!hit) return null;
  if (hit.expiresAt < Date.now()) {
    store.delete(key);
    return null;
  }
  return hit.value as T;
}

export function cacheSet<T>(key: string, value: T, ttlMs: number): void {
  if (store.size >= MAX_ENTRIES) {
    // Evict the oldest entry (Map preserves insertion order).
    const firstKey = store.keys().next().value;
    if (firstKey !== undefined) store.delete(firstKey);
  }
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}

/** Default TTL used by API routes — 10 minutes. */
export const DEFAULT_TTL_MS = 10 * 60 * 1000;