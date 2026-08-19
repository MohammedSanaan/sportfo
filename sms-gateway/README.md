# SportFo SMS Gateway

A minimal, stateless Fastify service that delivers the OTP SMS Supabase
Auth already generated, via MSG91. It holds the MSG91 AuthKey and runs
from a fixed IP that MSG91 whitelists -- Supabase Edge Functions don't
have a stable outbound IP, which is why this exists as a separate service.

```
SportFo Web -> Supabase Auth -> Send SMS Hook -> send-auth-sms (Edge Fn)
            -> THIS SERVICE -> MSG91 -> athlete's phone
```

It does not generate, verify, or store OTPs -- that stays entirely with
Supabase Auth. It exposes exactly two endpoints: `GET /health` (no auth)
and `POST /send-sms` (requires the shared secret), and nothing else calls
MSG91 in this project.

## VM Requirements

- A Linux VM with Docker installed.
- A **reserved/static public IP** -- this is the IP you whitelist in MSG91.
  Do not use a dynamic IP or your laptop's IP; if the VM is re-provisioned
  without a reserved IP, the whitelist breaks silently.
- Inbound firewall: allow only **443** (HTTPS, via the reverse proxy below)
  from the internet, and whatever port your reverse proxy needs from
  itself to the container (typically localhost-only, not exposed). Do not
  expose container port 8080 directly to the internet.
- Outbound firewall: allow HTTPS (443) to `api.msg91.com`.

## HTTPS

This service itself only speaks plain HTTP. Put a reverse proxy (Caddy,
nginx, or your cloud provider's load balancer) in front of it to terminate
TLS, since the Supabase Edge Function will call it as
`https://<host>/send-sms`. Caddy is the least config for a single-service
VM (automatic Let's Encrypt certs):

```
# /etc/caddy/Caddyfile
sms-gateway.your-domain.com {
    reverse_proxy localhost:8080
}
```

Point the Edge Function's `SMS_GATEWAY_URL` secret at
`https://sms-gateway.your-domain.com/send-sms` (the reverse proxy's public
hostname), not at the container's bare IP/port.

## Build

```bash
docker build -t sportfo-sms-gateway:latest .
```

## Run

```bash
docker run -d \
  --name sms-gateway \
  --restart unless-stopped \
  -p 127.0.0.1:8080:8080 \
  -e PORT=8080 \
  -e SMS_GATEWAY_SHARED_SECRET="<same value set on the Edge Function>" \
  -e MSG91_AUTH_KEY="<from MSG91 dashboard>" \
  -e MSG91_TEMPLATE_ID="<MSG91's Template ID for SportFo_Login_OTP>" \
  -e MSG91_SENDER_ID="SPORTFO" \
  sportfo-sms-gateway:latest
```

Notes:

- `-p 127.0.0.1:8080:8080` binds the container port to localhost only --
  the reverse proxy reaches it over loopback; port 8080 is never directly
  reachable from the internet. Do not publish it as `-p 8080:8080`.
- `--restart unless-stopped` brings the container back after a VM reboot
  or crash without manual intervention, but won't fight you if you
  deliberately stop it.
- Real secret values only ever go into the running container's
  environment (or a `.env` file readable only by the deploying user) --
  never into a committed file, shell history, or a Docker image layer.

## Health Check

```bash
curl https://sms-gateway.your-domain.com/health
# {"status":"ok"}
```

The image also has a Docker-native `HEALTHCHECK` (`/health`, no
dependencies needed to run it), so `docker ps` shows `healthy` /
`unhealthy` directly, and orchestrators that respect `HEALTHCHECK` (e.g.
`docker run --restart` combined with a supervisor, or Compose/Swarm/K8s if
this ever moves there) can act on it automatically.

## MSG91 IP Whitelist

In the MSG91 dashboard, under the AuthKey's IP whitelist settings, add the
VM's static public IP (not the reverse proxy's domain -- MSG91 whitelists
by source IP of the outbound request it receives, which is this VM).

## Environment Variables

Names only -- see `.env.example`:

- `PORT`
- `SMS_GATEWAY_SHARED_SECRET`
- `MSG91_AUTH_KEY`
- `MSG91_TEMPLATE_ID`
- `MSG91_SENDER_ID`

## Verifying After Deploy

1. `curl https://<host>/health` -> `{"status":"ok"}`.
2. `curl -X POST https://<host>/send-sms` with no `Authorization` header
   -> `401 {"success":false,"code":"UNAUTHORIZED"}` (confirms the shared
   secret is actually enforced, not bypassed by the reverse proxy).
3. Set `SMS_GATEWAY_URL=https://<host>/send-sms` as an Edge Function
   secret on the `sportfo-dev` Supabase project (alongside
   `SMS_GATEWAY_SHARED_SECRET`, matching the value set on this VM), then
   run the real `/auth` OTP flow end-to-end and confirm an SMS arrives.
