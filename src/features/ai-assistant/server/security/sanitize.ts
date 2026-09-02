// Defense-in-depth for tool results. Every tool in tools/* already hand
// -picks safe fields (an allowlist, not a strip-the-bad-stuff blocklist --
// see each tool's pure `toXResult` mapper), so in normal operation this
// should never actually find anything. It exists as a second, independent
// backstop: server/orchestrator.ts runs every tool result through this
// before it can ever reach the model (and therefore the client) -- so a
// future tool that's added carelessly, or a mapper that's edited to
// accidentally spread a raw DB row, fails loudly instead of silently
// leaking.
export const FORBIDDEN_RESULT_KEYS: ReadonlySet<string> = new Set([
  // Internal database/auth identifiers -- SportFo ID is the only
  // user-facing identifier a tool result may ever contain.
  "id",
  "userId",
  "user_id",
  "authUserId",
  "auth_user_id",
  "ownerId",
  "owner_id",
  "athleteProfileId",
  "athlete_profile_id",
  // Identity documents and private contact details -- never available to
  // the assistant, per task spec.
  "aadhaarOrGovtId",
  "aadhaar_or_govt_id",
  "emergencyContact",
  "emergency_contact",
  "mobileNumber",
  "mobile_number",
  "email",
  // Private storage paths -- certificates/photos are never exposed
  // through AI Phase 1 (no signed URLs either).
  "documentPath",
  "document_path",
  "profilePhotoPath",
  "profile_photo_path",
  // Secrets, should never even be near this layer, but checked anyway.
  "apiKey",
  "api_key",
  "serviceRoleKey",
  "service_role_key",
]);

// Recursively scans a tool result for any of the keys above. Throws
// (rather than silently stripping) so a violation is loud and visible in
// server logs/tests instead of quietly shipping a narrower-than-intended
// result.
export function assertNoForbiddenFields(value: unknown, path = "$"): void {
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertNoForbiddenFields(item, `${path}[${index}]`));
    return;
  }

  if (value && typeof value === "object") {
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      if (FORBIDDEN_RESULT_KEYS.has(key)) {
        throw new Error(`Sensitive field "${key}" must never appear in an assistant tool result (at ${path}.${key}).`);
      }
      assertNoForbiddenFields(nested, `${path}.${key}`);
    }
  }
}
