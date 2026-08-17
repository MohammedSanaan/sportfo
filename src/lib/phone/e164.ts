// E.164 formatting/validation for the phone OTP flow.
//
// Deliberately does not validate per-country number lengths (that table is
// exactly the kind of fragile homemade logic that goes stale and breaks
// legitimate numbers). Instead this checks the general E.164 shape --
// leading "+", 8-15 total digits -- and leaves final validation to Supabase
// Auth itself, which is the actual source of truth once the request is
// sent.

export function toE164(dialCode: string, localNumber: string): string {
  const digits = localNumber.replace(/\D/g, "");
  return `${dialCode}${digits}`;
}

const E164_PATTERN = /^\+[1-9]\d{7,14}$/;

export function isValidE164(value: string): boolean {
  return E164_PATTERN.test(value);
}

// Masks all but the last two digits of the national number so the OTP
// screen can confirm where the code was sent without displaying the full
// mobile number, e.g. "+974 •••••40".
export function maskPhoneNumber(dialCode: string, localNumber: string): string {
  const digits = localNumber.replace(/\D/g, "");
  const visible = digits.slice(-2);
  const hidden = "•".repeat(Math.max(digits.length - 2, 0));
  return `${dialCode} ${hidden}${visible}`;
}
