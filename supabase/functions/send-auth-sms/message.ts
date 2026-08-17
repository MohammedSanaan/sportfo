const OTP_PATTERN = /^[0-9]{6}$/;

export function isValidOtp(otp: unknown): otp is string {
  return typeof otp === "string" && OTP_PATTERN.test(otp);
}

export function buildOtpMessage(otp: string): string {
  return `Your SportFo verification code is: ${otp}`;
}
