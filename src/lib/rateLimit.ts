import { NextRequest, NextResponse } from "next/server";

// Lightweight fixed-window rate limiter.
//
// NOTE: this is an in-memory limiter. It meaningfully raises the bar against
// brute-force and spam from a single client, but on a serverless host (Vercel)
// state isn't shared across instances or guaranteed across cold starts. For
// strict, distributed limiting later, swap the Map for Upstash Redis / Vercel KV
// behind this same interface.

type Entry = { count: number; resetAt: number };

const buckets = new Map<string, Entry>();

function maybeCleanup() {
  // Keep memory bounded; drop expired entries when the map grows.
  if (buckets.size < 5000) return;
  const now = Date.now();
  for (const [key, entry] of buckets) {
    if (entry.resetAt <= now) buckets.delete(key);
  }
}

export type RateLimitResult = { ok: true } | { ok: false; retryAfter: number };

// Allows `limit` requests per `windowMs` for a given key.
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const entry = buckets.get(key);

  if (!entry || entry.resetAt <= now) {
    maybeCleanup();
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }

  if (entry.count >= limit) {
    return { ok: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }

  entry.count += 1;
  return { ok: true };
}

// Best-effort client IP from proxy headers (Vercel sets x-forwarded-for).
export function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

// Standard 429 response for a tripped limit.
export function tooManyRequests(retryAfter: number): NextResponse {
  return NextResponse.json(
    { error: "Too many attempts. Please wait a moment and try again." },
    { status: 429, headers: { "Retry-After": String(retryAfter) } },
  );
}
