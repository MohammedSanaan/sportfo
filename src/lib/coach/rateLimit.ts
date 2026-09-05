// Minimal in-memory, per-IP sliding-window limiter for /api/coach.
//
// This is a single-instance best-effort guard, not a distributed one: it
// resets on redeploy and doesn't share state across serverless instances.
// That's an intentional, documented trade-off for an MVP feature -- it
// still stops a single script/browser from hammering a paid Gemini key
// through an unauthenticated public route, which is the actual risk being
// guarded against here. If SportFo scales this up behind multiple
// instances, replace with a shared store (e.g. Redis) instead.
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 12;

const hits = new Map<string, number[]>();

// Bound memory use: forgetting IPs that haven't been seen recently avoids
// an unbounded map under sustained traffic from many distinct clients.
const MAX_TRACKED_IPS = 5000;

export function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;

  const existing = hits.get(ip) ?? [];
  const recent = existing.filter((timestamp) => timestamp > windowStart);

  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    hits.set(ip, recent);
    return true;
  }

  recent.push(now);
  hits.set(ip, recent);

  if (hits.size > MAX_TRACKED_IPS) {
    const oldestKey = hits.keys().next().value;
    if (oldestKey !== undefined) hits.delete(oldestKey);
  }

  return false;
}

export function getClientIp(request: Request): string {
  // Next.js doesn't expose a stable req.ip in the route handler API --
  // read the standard proxy header (set by Vercel/most reverse proxies).
  // Falls back to a shared bucket if absent so local dev never crashes,
  // though that means local dev shares one rate-limit bucket.
  const forwardedFor = request.headers.get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() || "unknown";
}
