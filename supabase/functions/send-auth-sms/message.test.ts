import { assertEquals } from "jsr:@std/assert";
import { buildOtpMessage, isValidOtp } from "./message.ts";

Deno.test("isValidOtp accepts a 6-digit code", () => {
  assertEquals(isValidOtp("561166"), true);
});

Deno.test("isValidOtp rejects wrong length", () => {
  assertEquals(isValidOtp("12345"), false);
  assertEquals(isValidOtp("1234567"), false);
});

Deno.test("isValidOtp rejects non-numeric and non-string input", () => {
  assertEquals(isValidOtp("12345a"), false);
  assertEquals(isValidOtp(undefined), false);
  assertEquals(isValidOtp(561166), false);
});

Deno.test("buildOtpMessage produces the exact expected copy", () => {
  assertEquals(
    buildOtpMessage("561166"),
    "Your SportFo verification code is: 561166",
  );
});
