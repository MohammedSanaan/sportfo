import type { FastifyReply, FastifyRequest } from "fastify";
import { secretsMatch } from "../lib/timing-safe-equal.js";
import type { SendSmsErrorResponse } from "../types.js";

const unauthorized: SendSmsErrorResponse = { success: false, code: "UNAUTHORIZED" };

// Not a Fastify plugin/decorator -- just a preHandler factory applied only
// to the /send-sms route, since /health must stay reachable without auth.
export function requireSharedSecret(expectedSecret: string) {
  return async function authPreHandler(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    const header = request.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      reply.code(401).send(unauthorized);
      return;
    }

    const provided = header.slice("Bearer ".length).trim();
    if (provided.length === 0 || !secretsMatch(provided, expectedSecret)) {
      reply.code(401).send(unauthorized);
      return;
    }
  };
}
