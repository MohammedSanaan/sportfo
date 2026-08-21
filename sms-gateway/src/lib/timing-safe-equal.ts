import { createHash, timingSafeEqual } from "node:crypto";

// Hashing both sides to a fixed-length digest before comparing means the
// comparison is constant-time regardless of the *provided* secret's
// length -- crypto.timingSafeEqual throws if its two buffers differ in
// length, which would otherwise leak the expected secret's length (or
// require an early-return length check that itself isn't constant-time).
export function secretsMatch(provided: string, expected: string): boolean {
  const providedHash = createHash("sha256").update(provided, "utf8").digest();
  const expectedHash = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(providedHash, expectedHash);
}
