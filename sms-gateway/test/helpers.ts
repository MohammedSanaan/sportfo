import type { GatewayConfig } from "../src/config.js";

export function testConfig(overrides: Partial<GatewayConfig> = {}): GatewayConfig {
  return {
    port: 0,
    smsGatewaySharedSecret: "test-shared-secret-value-not-real",
    msg91AuthKey: "test-msg91-auth-key",
    msg91TemplateId: "test-template-id",
    msg91SenderId: "SPORTFO",
    ...overrides,
  };
}

export const VALID_PHONE = "+974555123456";
export const VALID_OTP = "561166";
