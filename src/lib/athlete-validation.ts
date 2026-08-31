// Client-side validation rules for the athlete registration form.
// Kept as plain react-hook-form-compatible rule objects rather than a schema
// library to stay within the project's minimal-dependency approach.

export function requiredTextRule(fieldLabel: string) {
  return {
    required: `${fieldLabel} is required.`,
    validate: (value: string) =>
      value.trim().length > 0 || `${fieldLabel} is required.`,
  };
}

// Trims before testing the format -- the persisted value is already
// trimmed (see emptyToNull in registration-payload.ts), so leading/
// trailing whitespace must not fail validation here only to be accepted on
// save; that mismatch would be a confusing, purely cosmetic rejection.
export const emailRule = {
  required: "Email address is required.",
  validate: (value: string) => {
    const trimmed = value.trim();
    if (trimmed.length === 0) return "Email address is required.";
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) || "Enter a valid email address.";
  },
};

// Accepts optional leading "+", digits, spaces, hyphens and parentheses, and
// requires a digit count that covers international mobile numbers (e.g.
// +974 XXXX XXXX, +91 XXXXX XXXXX) without pinning to one country's format.
export const mobileNumberRule = {
  required: "Mobile number is required.",
  validate: (value: string) => {
    if (!/^[+()\-\s\d]+$/.test(value)) {
      return "Enter a valid mobile number.";
    }
    const digitCount = value.replace(/\D/g, "").length;
    return (
      (digitCount >= 7 && digitCount <= 15) ||
      "Enter a valid mobile number."
    );
  },
};

export const dateOfBirthRule = {
  required: "Date of birth is required.",
  validate: (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "Enter a valid date of birth.";
    }
    return date.getTime() <= Date.now() || "Date of birth cannot be in the future.";
  },
};

export const today = () => new Date().toISOString().slice(0, 10);
