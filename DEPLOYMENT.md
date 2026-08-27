# Deployment (shared server)

Public exposure lives **outside this repo** — Traefik dynamic config and the
firewall are on the host, not in git. If either gets wiped, recreate them
from this file.

## Port map

| Service             | Local port | Public URL                                            |
|----------------------|-----------:|---------------------------------------------------------|
| fresh-route (Expo)   | 8081       | `https://fresh-route.92-4-217-42.sslip.io`               |
| marseille-app        | 5176       | `https://marseille-app.92-4-217-42.sslip.io`              |
| marseille-dashboard  | 5175       | `https://marseille-dashboard.92-4-217-42.sslip.io`         |
| marseille-engine     | 8003       | `https://marseille-engine.92-4-217-42.sslip.io`            |

Ports 8000/8001/8010/5174 are taken by unrelated services on this shared
box — don't reuse them (see `marseille-engine/Makefile.local`, gitignored,
which pins `PORT := 8003`; marseille-dashboard's own `dev` script and
`vite.config.ts` are pinned to 5175 for the same reason). 5173 also isn't
free — an unrelated ad-hoc `portfolio/site` dev server was squatting it, so
marseille-app was moved to 5176 (`marseille-app/vite.config.ts`).

## Traefik

Traefik runs as the `traefik` Docker container, config via
`--providers.file.directory=/etc/traefik/dynamic`, bind-mounted from
`/home/ubuntu/portfolio/deploy-platform/traefik/dynamic` (read-only) on the
host. One file per service, all following this shape:

```yaml
http:
  routers:
    <name>:
      rule: Host(`<name>.92-4-217-42.sslip.io`)
      entryPoints:
      - websecure
      service: <name>
      tls:
        certResolver: le
  services:
    <name>:
      loadBalancer:
        servers:
        - url: http://host.docker.internal:<local-port>
```

Files currently in place: `fresh-route.yml` (8081), `marseille-app.yml`
(5176), `marseille-dashboard.yml` (5175), `marseille-engine.yml` (8003).
Traefik watches the directory (`--providers.file.watch=true`), so dropping
in a new/edited file is picked up without a restart.

## Firewall (UFW)

Each dev port needs an explicit `ufw allow` — default policy is DROP, and
Docker's `host.docker.internal` traffic still has to clear the host
firewall to reach a plain `npm run dev` / `uvicorn` process:

```bash
sudo ufw allow 8081/tcp comment 'fresh-route dev'
sudo ufw allow 5176/tcp comment 'marseille-app dev'
sudo ufw allow 5175/tcp comment 'marseille-dashboard dev'
sudo ufw allow 8003/tcp comment 'marseille-engine dev'
```

Stale rules still open, harmless but fine to remove since nothing serves
there anymore: `5174/tcp` (the dashboard's old, now-conflicting port) and
`5173/tcp` (marseille-app's old port, freed because an unrelated
`portfolio/site` dev server was squatting it) — `sudo ufw delete allow
5174/tcp` / `sudo ufw delete allow 5173/tcp`.

## Vite dev servers specifically

Vite's `server` block needs `host: true` (bind `0.0.0.0`, not just
`localhost`) and `allowedHosts: ["<name>.92-4-217-42.sslip.io"]`, or
requests routed in through Traefik get refused. See `marseille-app/vite.config.ts`
and `marseille-dashboard/vite.config.ts`.

## Browser-side gotcha

Don't call `localhost:<port>` from client-side `fetch()` on a page served
from a public origin — Chrome's Private Network Access blocks
public-origin → loopback requests outright, and it wouldn't reach anything
useful on a visitor's own machine anyway. Always call the service's own
public `*.92-4-217-42.sslip.io` URL instead (see `fresh-route/src/api/engine.ts`).
