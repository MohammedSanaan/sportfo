export interface GatewayConfig {
  port: number;
  smsGatewaySharedSecret: string;
  msg91AuthKey: string;
  msg91TemplateId: string;
  msg91SenderId: string;
}

// Fails fast at startup on missing configuration rather than surfacing an
// opaque failure on the first real request.
export function loadConfig(env: NodeJS.ProcessEnv = process.env): GatewayConfig {
  function required(name: string): string {
    const value = env[name];
    if (!value) {
      throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
  }

  const port = env.PORT ? Number(env.PORT) : 8080;
  if (!Number.isInteger(port) || port <= 0) {
    throw new Error(`Invalid PORT: ${env.PORT}`);
  }

  return {
    port,
    smsGatewaySharedSecret: required("SMS_GATEWAY_SHARED_SECRET"),
    msg91AuthKey: required("MSG91_AUTH_KEY"),
    msg91TemplateId: required("MSG91_TEMPLATE_ID"),
    msg91SenderId: required("MSG91_SENDER_ID"),
  };
}
