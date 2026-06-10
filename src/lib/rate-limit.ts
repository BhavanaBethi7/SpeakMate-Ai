/**
 * Simple in-memory rate limiter.
 * Limits each userId to `maxRequests` per `windowMs`.
 * For production, swap with an Upstash Redis rate limiter.
 */

const store = new Map<string, { count: number; resetAt: number }>();

type RateLimitResult = { allowed: boolean; retryAfterSeconds: number };

export function rateLimit(
  key: string,
  maxRequests = 5,
  windowMs = 60_000,
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (entry.count >= maxRequests) {
    const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  entry.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}
