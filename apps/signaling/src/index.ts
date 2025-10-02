import { WebSocketServer, WebSocket } from 'ws';
import type { RawData } from 'ws';
import { ulid } from 'ulid';
import {
  CreateSessionRequest,
  CreateSessionResponse,
  JoinByPinRequest,
  JoinByPinResponse,
  ErrorMessage,
  SignalingEnvelope,
  SdpOffer,
  SdpAnswer,
  IceCandidate,
  Presence,
  IceServer,
} from '@pasterelay/shared';
import { PendingRelay } from '@pasterelay/shared';

const PORT = parseInt(process.env.PORT || '8080', 10);
const PIN_LENGTH = parseInt(process.env.PIN_LENGTH || '6', 10);
const SESSION_TTL_SECONDS = parseInt(process.env.SESSION_TTL_SECONDS || '3600', 10);
const ICE_SERVERS: IceServer[] = (() => {
  try {
    return JSON.parse(process.env.ICE_SERVERS || '[{"urls":["stun:stun.l.google.com:19302"]}]');
  } catch {
    return [{ urls: 'stun:stun.l.google.com:19302' }];
  }
})();

type Session = {
  id: string;
  pin: string;
  ownerPeerId: string;
  ownerSocket?: WebSocket;
  guestPeerId?: string;
  guestSocket?: WebSocket;
  expiresAt: number;
  ownerAttached?: boolean;
  guestAttached?: boolean;
};

const sessions = new Map<string, Session>();
const pinToSessionId = new Map<string, string>();
const pending = new PendingRelay<any>();

function genPin(len: number) {
  const digits = '0123456789';
  let s = '';
  for (let i = 0; i < len; i++) s += digits[Math.floor(Math.random() * digits.length)];
  return s;
}

function touchExpiry(sess: Session) {
  sess.expiresAt = Date.now() + SESSION_TTL_SECONDS * 1000;
}

function cleanupExpired() {
  const now = Date.now();
  for (const sess of sessions.values()) {
    if (sess.expiresAt <= now) {
      sessions.delete(sess.id);
      pinToSessionId.delete(sess.pin);
      try { sess.ownerSocket?.close(); } catch {}
      try { sess.guestSocket?.close(); } catch {}
    }
  }
}
setInterval(cleanupExpired, 15_000);

function presence(sess: Session) {
  const peers = [sess.ownerPeerId, sess.guestPeerId].filter(Boolean) as string[];
  const msg: Presence = { type: 'presence', sessionId: sess.id, peers };
  const data = JSON.stringify(msg);
  sess.ownerSocket?.readyState === WebSocket.OPEN && sess.ownerSocket.send(data);
  sess.guestSocket?.readyState === WebSocket.OPEN && sess.guestSocket.send(data);
}

function send(ws: WebSocket, obj: any) {
  if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(obj));
}

const wss = new WebSocketServer({ port: PORT });
console.log(`[signaling] listening on ws://localhost:${PORT}`);

wss.on('connection', (ws: WebSocket) => {
  let peerId = ulid();
  let sessionId: string | undefined;

  ws.on('message', (buf: RawData) => {
    let msg: unknown;
    try {
      msg = JSON.parse(String(buf));
    } catch {
      send(ws, { type: 'error', code: 'bad_json', message: 'Invalid JSON' } satisfies ErrorMessage);
      return;
    }

    const parsed = SignalingEnvelope.safeParse(msg);
    if (!parsed.success) {
      send(ws, { type: 'error', code: 'bad_schema', message: parsed.error.message } satisfies ErrorMessage);
      return;
    }

    const m = parsed.data as any;

  if (CreateSessionRequest.safeParse(m).success) {
      // Create session
      let pin: string;
      do { pin = genPin(PIN_LENGTH); } while (pinToSessionId.has(pin));
      const id = ulid();
      const sess: Session = { id, pin, ownerPeerId: peerId, ownerSocket: ws, expiresAt: 0 };
      touchExpiry(sess);
      sessions.set(id, sess);
      pinToSessionId.set(pin, id);
      sessionId = id;
      const resp: CreateSessionResponse = { type: 'create_session_ok', sessionId: id, pin, iceServers: ICE_SERVERS, ownerPeerId: peerId };
      send(ws, resp);
      presence(sess);
      return;
    }

  if (JoinByPinRequest.safeParse(m).success) {
      const { pin } = m as JoinByPinRequest;
      const sid = pinToSessionId.get(pin);
      if (!sid) {
        send(ws, { type: 'error', code: 'invalid_pin', message: 'That PIN is not valid or expired' } satisfies ErrorMessage);
        return;
      }
      const sess = sessions.get(sid);
      if (!sess) {
        send(ws, { type: 'error', code: 'invalid_session', message: 'Session not found' } satisfies ErrorMessage);
        pinToSessionId.delete(pin);
        return;
      }
      if (sess.guestPeerId) {
        send(ws, { type: 'error', code: 'room_full', message: 'This session already has a guest' } satisfies ErrorMessage);
        return;
      }
      sess.guestPeerId = peerId;
      sess.guestSocket = ws;
      touchExpiry(sess);
      sessionId = sess.id;
      const resp: JoinByPinResponse = { type: 'join_by_pin_ok', sessionId: sess.id, ownerPeerId: sess.ownerPeerId, iceServers: ICE_SERVERS, yourPeerId: peerId };
      send(ws, resp);
      presence(sess);
      return;
    }

    // Attach: bind a new socket to known session/peer after navigation
    if ((m as any).type === 'attach') {
      const { sessionId: sid, peerId: pid } = m as { sessionId: string; peerId: string };
      const sess = sessions.get(sid);
      if (!sess) {
        send(ws, { type: 'error', code: 'invalid_session', message: 'Session not found' });
        return;
      }
      sessionId = sid;
      if (pid === sess.ownerPeerId) {
        sess.ownerSocket = ws;
        sess.ownerAttached = true;
      } else if (pid === sess.guestPeerId) {
        sess.guestSocket = ws;
        sess.guestAttached = true;
      }
      touchExpiry(sess);
      presence(sess);
      // deliver any pending offers/answers/candidates for this peer
      for (const m of pending.drain(pid)) {
        try { send(ws, m); } catch {}
      }
      return;
    }

    // End session: owner can invalidate the room
    if ((m as any).type === 'end_session') {
      const { sessionId: sid, peerId: pid } = m as { sessionId: string; peerId: string };
      const sess = sessions.get(sid);
      if (!sess) return;
      // Either owner or guest can end the session
      if (pid !== sess.ownerPeerId && pid !== sess.guestPeerId) {
        send(ws, { type: 'error', code: 'forbidden', message: 'Peer not in this session' });
        return;
      }
      sessions.delete(sid);
      pinToSessionId.delete(sess.pin);
      try { sess.ownerSocket?.close(); } catch {}
      try { sess.guestSocket?.close(); } catch {}
      return;
    }

    // Relay SDP / ICE between owner and guest
    if (SdpOffer.safeParse(m).success || SdpAnswer.safeParse(m).success || IceCandidate.safeParse(m).success) {
      const sid = (m as any).sessionId as string;
      const sess = sessions.get(sid);
      if (!sess) return;
      touchExpiry(sess);
      const toPeerId = (m as any).toPeerId as string;
      const to = toPeerId === sess.ownerPeerId ? sess.ownerSocket : sess.guestSocket;
      if (to && to.readyState === WebSocket.OPEN) {
        to.send(JSON.stringify(m));
      } else {
        // recipient not attached yet; queue for later
        pending.enqueue(toPeerId, m);
      }
      return;
    }
  });

  ws.on('close', () => {
    if (!sessionId) return;
    const sess = sessions.get(sessionId);
    if (!sess) return;
    // Only auto-end if the closing socket was an attached peer (in-room)
    const isOwner = ws === sess.ownerSocket;
    const isGuest = ws === sess.guestSocket;
    const ownerAttached = !!sess.ownerAttached && isOwner;
    const guestAttached = !!sess.guestAttached && isGuest;
    if (ownerAttached || guestAttached) {
      sessions.delete(sess.id);
      pinToSessionId.delete(sess.pin);
      const other = isOwner ? sess.guestSocket : sess.ownerSocket;
      try { other?.close(); } catch {}
      return;
    }
    // Otherwise just clear the socket and keep session (e.g., navigation from create → room)
    if (isOwner) sess.ownerSocket = undefined;
    if (isGuest) sess.guestSocket = undefined;
    presence(sess);
  });
});
