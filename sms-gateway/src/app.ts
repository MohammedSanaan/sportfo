import Fastify, { type FastifyInstance } from "fastify";
import type { GatewayConfig } from "./config.js";
import { registerHealthRoute } from "./routes/health.js";
import { registerSendSmsRoute, type SendSmsRouteOptions } from "./routes/send-sms.js";
import type { SendSmsErrorResponse } from "./types.js";

export interface BuildAppOptions {
  config: GatewayConfig;
  sendSms?: SendSmsRouteOptions["sendSms"];
  // Test-only hook to capture log output for asserting nothing sensitive is
  // ever written to it. Defaults to Fastify's normal stdout logging.
  loggerStream?: NodeJS.WritableStream;
}

export async function buildApp(options: BuildAppOptions): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      // Belt-and-suspenders alongside "never log these values" in the
      // route handlers themselves: even if something is accidentally
      // attached to a log call under these keys, pino redacts it.
      redact: {
        paths: ["req.headers.authorization", "req.body", "body"],
        censor: "[redacted]",
      },
      stream: options.loggerStream,
    },
    // No route needs more than a tiny JSON body -- caps a would-be abusive
    // payload well before it reaches request handling.
    bodyLimit: 16 * 1024,
  });

  // Normalizes every failure (bad JSON, oversized body, an uncaught route
  // error) to this service's stable {success:false, code} shape instead of
  // Fastify's default {statusCode, error, message} error body.
  app.setErrorHandler((error: Error & { statusCode?: number }, request, reply) => {
    const statusCode = error.statusCode ?? 500;
    request.log.error({ err: error.message, statusCode }, "unhandled request error");

    const body: SendSmsErrorResponse = {
      success: false,
      code: statusCode >= 500 ? "INTERNAL_ERROR" : "INVALID_REQUEST",
    };
    reply.code(statusCode >= 400 && statusCode < 600 ? statusCode : 500).send(body);
  });

  await registerHealthRoute(app);
  await registerSendSmsRoute(app, { config: options.config, sendSms: options.sendSms });

  return app;
}
