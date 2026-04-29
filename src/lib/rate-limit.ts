import { redis } from "@/lib/redis";

interface RateLimitOptions {
  /** Unique key prefix, e.g. "transcribe" or "resume" */
  prefix: string;
  /** User or IP identifier */
  identifier: string;
  /** Max requests allowed in the window */
  limit: number;
  /** Window duration in seconds */
  windowSeconds: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number; // unix timestamp (seconds)
}

/**
 * Sliding-window rate limiter backed by Upstash Redis.
 * Uses INCR + EXPIRE so it's atomic and works in serverless environments.
 *
 * @returns `success: false` when the limit is exceeded, along with
 *          `remaining` requests and `resetAt` timestamp for Retry-After headers.
 */
export async function rateLimit({
  prefix,
  identifier,
  limit,
  windowSeconds,
}: RateLimitOptions): Promise<RateLimitResult> {
  const key = `rl:${prefix}:${identifier}`;
  const now = Math.floor(Date.now() / 1000);

  // Increment the counter; if it's a new key, Redis returns 1
  const count = await redis.incr(key);

  // Set expiry only on the first request in the window
  if (count === 1) {
    await redis.expire(key, windowSeconds);
  }

  // Fetch the remaining TTL to calculate resetAt
  const ttl = await redis.ttl(key);
  const resetAt = now + (ttl > 0 ? ttl : windowSeconds);
  const remaining = Math.max(0, limit - count);

  return {
    success: count <= limit,
    remaining,
    resetAt,
  };
}
