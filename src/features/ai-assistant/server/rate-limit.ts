// A minimal rate-limiting FOUNDATION, not a production distributed
// limiter. Explicitly in-memory and per-server-instance -- on a
// multi-instance/serverless deployment this only bounds requests within
// one warm instance, not globally across the fleet. That's a known,
// documented limitation, not a hidden one: the RateLimiter interface
// below is the seam a real shared store (Redis/Upstash, or a Postgres
// table) can slot into later without any caller (see
// handle-assistant-request.ts) changing at all.
export interface RateLimitResult {
  allowed: boolean;
  retryAfterMs?: number;
}

export interface RateLimiter {
  check(key: string): RateLimitResult;
}

const WINDOW_MS = 60_000;
// Deliberately generous for Phase 1A (no per-user/per-plan tiers exist
// yet) -- the point of this phase is the abstraction, not tuning the
// number. Ready to become per-plan (see task spec: "per-user / per-IP /
// per-plan limits later") once SportFo has plans to differentiate by.
const MAX_REQUESTS_PER_WINDOW = 20;

class InMemorySlidingWindowRateLimiter implements RateLimiter {
  private readonly hitsByKey = new Map<string, number[]>();

  check(key: string): RateLimitResult {
    const now = Date.now();
    const windowStart = now - WINDOW_MS;
    const recentHits = (this.hitsByKey.get(key) ?? []).filter((hitAt) => hitAt > windowStart);

    if (recentHits.length >= MAX_REQUESTS_PER_WINDOW) {
      const retryAfterMs = Math.max(recentHits[0] + WINDOW_MS - now, 0);
      // Don't record this attempt -- it didn't consume a slot.
      this.hitsByKey.set(key, recentHits);
      return { allowed: false, retryAfterMs };
    }

    recentHits.push(now);
    this.hitsByKey.set(key, recentHits);
    return { allowed: true };
  }
}

// Keyed by the caller's own auth.users UUID (see
// security/authorization.ts) -- never by SportFo ID, and never by
// anything client-supplied. One shared instance for the whole server
// process, matching this being a per-instance foundation rather than a
// distributed store.
export const assistantRateLimiter: RateLimiter = new InMemorySlidingWindowRateLimiter();
