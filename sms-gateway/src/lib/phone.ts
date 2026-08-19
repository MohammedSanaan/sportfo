// Basic E.164 shape check only -- deliberately not per-country length
// validation (fragile, goes stale). The caller (SportFo's app) already
// normalizes numbers; this is a defensive backstop, not the primary
// validator, so malformed input is rejected rather than silently rewritten.
const E164_PATTERN = /^\+[1-9]\d{7,14}$/;

export function isValidE164Phone(value: unknown): value is string {
  return typeof value === "string" && E164_PATTERN.test(value);
}

const OTP_PATTERN = /^[0-9]{6}$/;

export function isValidOtp(value: unknown): value is string {
  return typeof value === "string" && OTP_PATTERN.test(value);
}

// MSG91's Flow API expects mobile numbers as country code + number with no
// leading "+" (e.g. "919812345678"), unlike the E.164 input this service
// accepts.
export function toMsg91MobileFormat(e164Phone: string): string {
  return e164Phone.slice(1);
}
