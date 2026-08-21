import type { FastifyInstance } from "fastify";
import type { GatewayConfig } from "../config.js";
import { requireSharedSecret } from "../plugins/auth.js";
import { isValidE164Phone, isValidOtp } from "../lib/phone.js";
import { sendViaMsg91 } from "../providers/msg91.js";
import type { SendSmsErrorResponse, SendSmsResponse } from "../types.js";

interface SendSmsBody {
  to?: unknown;
  otp?: unknown;
}

export interface SendSmsRouteOptions {
  config: GatewayConfig;
  // Injectable so tests can stub the MSG91 call instead of hitting the
  // real network -- defaults to the real provider in production.
  sendSms?: typeof sendViaMsg91;
}

export async function registerSendSmsRoute(
  app: FastifyInstance,
  options: SendSmsRouteOptions,
): Promise<void> {
  const send = options.sendSms ?? sendViaMsg91;

  app.post<{ Body: SendSmsBody }>(
    "/send-sms",
    { preHandler: requireSharedSecret(options.config.smsGatewaySharedSecret) },
    async (request, reply) => {
      const { to, otp } = request.body ?? {};

      if (!isValidE164Phone(to) || !isValidOtp(otp)) {
        const body: SendSmsErrorResponse = { success: false, code: "INVALID_REQUEST" };
        reply.code(400).send(body);
        return;
      }

      const startedAt = Date.now();
      const outcome = await send(options.config, { to, otp });
      const elapsedMs = Date.now() - startedAt;

      // Deliberately never logs `to`/`otp`/the raw MSG91 response body --
      // only the categorized outcome, timing, and (on failure) the safe
      // diagnostic fields sendViaMsg91 already sanitized: MSG91's HTTP
      // status, its response `type` (a fixed "success"/"error" value, not
      // user data), and whether a request id was present -- never the
      // request id's actual value.
      request.log.info({
        msg91Outcome: outcome.ok ? "success" : outcome.category,
        elapsedMs,
        ...(outcome.ok
          ? {}
          : {
              msg91HttpStatus: outcome.msg91HttpStatus,
              msg91ResponseType: outcome.msg91ResponseType,
              hasRequestId: outcome.hasRequestId,
            }),
      });

      if (outcome.ok) {
        const body: SendSmsResponse = { success: true };
        reply.code(200).send(body);
        return;
      }

      if (outcome.category === "provider_timeout") {
        const body: SendSmsErrorResponse = { success: false, code: "SMS_PROVIDER_TIMEOUT" };
        reply.code(504).send(body);
        return;
      }

      const body: SendSmsErrorResponse = { success: false, code: "SMS_PROVIDER_ERROR" };
      reply.code(502).send(body);
    },
  );
}
