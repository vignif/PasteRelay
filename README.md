# PasteRelay

A minimal 1:1 online clipboard that creates a temporary tunnel between two devices using a PIN. Text-only MVP using WebRTC DataChannels with a lightweight WebSocket signaling server.

Author: Francesco Vigni
License: MIT

## Features (MVP)
- Create a session to get a short PIN and wait for a peer.
- Join a session by PIN; invalid PINs show clear errors.
- Shared clipboard view to send/receive text in real time.
- Peer-to-peer transport (WebRTC DataChannel) with STUN; TURN optional via env.
- No server-side storage of clipboard contents; signaling metadata only.

## Monorepo layout
- apps/
  - web/ — Next.js app (UI, client WebRTC)
  - signaling/ — Node.js WebSocket server (signaling + PIN registry)
- packages/
  - shared/ — TypeScript types and schemas for signaling + payloads

## Requirements
- Node.js 18+
- npm 8+ (workspaces)

## Quick start
1) Install dependencies (root workspaces):

```bash
npm install
```

2) Run dev (web on http://localhost:3000, signaling on ws://localhost:8080):

```bash
npm run dev
```

3) Open two browsers/devices:
- Device A: Create a session, share the PIN.
- Device B: Join with that PIN.
- Both will enter the shared clipboard and can exchange text.

```
## Run with Docker (local)
1) Build images and start:

```bash
docker compose up --build
```

2) Open:
- Web: http://localhost:3000
- Signaling WS: ws://localhost:${SIGNALING_PORT:-8080}

To stop:

```bash
docker compose down
```

## Deploy on a VPS
- Copy this repo (or only `apps/*` and `packages/*`) to your VPS.
- Ensure Docker and docker compose are installed.
- Set your `.env` (consider a public hostname and CORS/reverse proxy if needed).
- Run `docker compose up -d --build`.
- Optionally place Nginx/Caddy in front:
  - Proxy http://localhost:3000 → your domain for the web app.
  - Expose ws://yourdomain:8080 or proxy a path like `/ws` to the signaling container.

### Nginx example

```
server {
  listen 80;
  server_name pasterelay.example.com;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }

  # WebSocket proxy at /ws (update PUBLIC_WS_URL=wss://pasterelay.example.com/ws)
  location /ws {
    proxy_pass http://127.0.0.1:8080;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "Upgrade";
    proxy_set_header Host $host;
  }
}
```

Don’t forget to enable TLS (e.g., with certbot) and set PUBLIC_WS_URL to wss://.

## Environment variables
Create a `.env` file at repo root (used by docker-compose and web):

```
SIGNALING_PORT=8080
PIN_LENGTH=6
SESSION_TTL_SECONDS=3600
ICE_SERVERS=[{"urls":["stun:stun.l.google.com:19302"]}]
PUBLIC_WS_URL=ws://localhost:8080
# TURN (optional)
# TURN_URL=turn:your.turn.server:3478
# TURN_USERNAME=youruser
# TURN_CREDENTIAL=yourpass
```

## Scripts
- npm run dev — runs signaling and web together
- npm run dev:signaling — runs only signaling server
- npm run dev:web — runs only web app

## Notes
- Clipboard writes require user action in browsers; UI exposes explicit Copy buttons.
- NAT traversal: STUN included; for tougher networks configure TURN.

---

MIT License © PasteRelay