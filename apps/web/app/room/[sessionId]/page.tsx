'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Ack, ClipboardPush, IceCandidate, SdpAnswer, SdpOffer, makeId, now, WsQueue } from '@pasterelay/shared';
import { useRouter, useSearchParams } from 'next/navigation';

export default function RoomPage({ params }: { params: { sessionId: string } }) {
  const search = useSearchParams();
  const role = search.get('role') || 'owner';
  const ownerPeerId = search.get('owner') || '';
  const me = search.get('me') || (search.get('peer') || '');
  const sessionId = params.sessionId;

  const [status, setStatus] = useState('Connecting…');
  const [error, setError] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [text, setText] = useState('');
  const router = useRouter();

  const wsRef = useRef<WebSocket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const queueRef = useRef<WsQueue | null>(null);
  function sendSignal(obj: any) { queueRef.current?.enqueue(obj); }

  const myPeerId = useMemo(() => (role === 'owner' ? ownerPeerId : me), [role, ownerPeerId, me]);
  const otherPeerId = useMemo(() => (role === 'owner' ? me : ownerPeerId), [role, ownerPeerId, me]);

  useEffect(() => {
  const ws = new WebSocket(process.env.NEXT_PUBLIC_SIGNALING_URL || 'ws://localhost:8080');
  wsRef.current = ws;
  queueRef.current = new WsQueue(() => wsRef.current as any);

    const pc = new RTCPeerConnection({
      iceServers: (() => {
        try {
          return JSON.parse(process.env.NEXT_PUBLIC_ICE_SERVERS || '[{"urls":["stun:stun.l.google.com:19302"]}]');
        } catch {
          return [{ urls: 'stun:stun.l.google.com:19302' }];
        }
      })(),
    });
    pcRef.current = pc;

    let dc: RTCDataChannel;
    if (role === 'owner') {
      dc = pc.createDataChannel('clipboard');
      setupDataChannel(dc);
      pc.createOffer().then(async (offer) => {
        await pc.setLocalDescription(offer);
        const offerMsg: SdpOffer = { type: 'sdp_offer', sessionId, fromPeerId: myPeerId!, toPeerId: otherPeerId!, sdp: JSON.stringify(offer) };
        sendSignal(offerMsg);
      });
    } else {
      pc.ondatachannel = (ev) => {
        setupDataChannel(ev.channel);
      };
    }

    pc.onicecandidate = (ev) => {
      if (ev.candidate) {
        const cand: IceCandidate = { type: 'ice_candidate', sessionId, fromPeerId: myPeerId!, toPeerId: otherPeerId!, candidate: ev.candidate };
        sendSignal(cand);
      }
    };

    ws.onmessage = async (ev) => {
      const data = JSON.parse(ev.data);
      if (data.type === 'sdp_offer' && role === 'guest') {
        const offer = JSON.parse(data.sdp);
        await pc.setRemoteDescription(offer);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        const msg: SdpAnswer = { type: 'sdp_answer', sessionId, fromPeerId: myPeerId!, toPeerId: otherPeerId!, sdp: JSON.stringify(answer) };
        sendSignal(msg);
      } else if (data.type === 'sdp_answer' && role === 'owner') {
        const answer = JSON.parse(data.sdp);
        await pc.setRemoteDescription(answer);
      } else if (data.type === 'ice_candidate') {
        try {
          await pc.addIceCandidate(data.candidate);
        } catch (e) {
          console.warn('Failed to add ICE', e);
        }
      }
    };

    ws.onerror = () => setError('Signaling connection error');
    // Attach this socket to current session/peer; flush any queued messages
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'attach', sessionId, peerId: myPeerId }));
      queueRef.current?.flush();
    };

    return () => {
      ws.close();
      pc.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, sessionId, myPeerId, otherPeerId]);

  function setupDataChannel(dc: RTCDataChannel) {
    dcRef.current = dc;
    dc.onopen = () => setStatus('Connected');
    dc.onclose = () => setStatus('Disconnected');
    dc.onmessage = (ev) => {
      const data = JSON.parse(ev.data) as ClipboardPush | Ack;
      if (data.type === 'clipboard_push') {
        setHistory((h) => [data.payload.text, ...h].slice(0, 10));
        const ack: Ack = { type: 'ack', id: data.id };
        dc.send(JSON.stringify(ack));
      }
    };
  }

  const push = () => {
    const dc = dcRef.current;
    if (!dc || dc.readyState !== 'open') return;
    const msg: ClipboardPush = { type: 'clipboard_push', id: makeId(), ts: now(), from: myPeerId!, payload: { text } };
    dc.send(JSON.stringify(msg));
    setHistory((h: string[]) => [text, ...h].slice(0, 10));
    setText('');
  };

  const copy = async (t: string) => {
    try { await navigator.clipboard.writeText(t); } catch { /* ignore */ }
  };

  const leave = () => {
    try {
      // Owner ends the session for both
      if (role === 'owner') {
        wsRef.current?.send(JSON.stringify({ type: 'end_session', sessionId, peerId: myPeerId }));
      }
    } finally {
      try { dcRef.current?.close(); } catch {}
      try { pcRef.current?.close(); } catch {}
      try { wsRef.current?.close(); } catch {}
      router.push('/');
    }
  };

  return (
    <main style={{ display: 'grid', gap: 16 }}>
      <h2>Shared clipboard</h2>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <span style={{ fontSize: 12, opacity: 0.8 }}>Status: {status}</span>
      </div>
      {error && <p style={{ color: '#ffb3b3' }}>{error}</p>}

      <div style={{ display: 'flex', gap: 8 }}>
        <input
          placeholder="Type text to share"
          value={text}
          onChange={(e) => setText((e.target as HTMLInputElement).value)}
          style={{ padding: 10, borderRadius: 8, border: '1px solid #39435f', background: 'transparent', color: 'white', flex: 1 }}
        />
        <button onClick={push} style={{ background: '#4c7cf3', color: 'white', padding: '10px 14px', borderRadius: 8, border: 'none' }}>Share</button>
        <button onClick={leave} style={{ background: 'transparent', color: 'white', padding: '10px 14px', borderRadius: 8, border: '1px solid #39435f' }}>Leave</button>
      </div>

      <div style={{ display: 'grid', gap: 8 }}>
        {history.map((h, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #2a3147', padding: 10, borderRadius: 8 }}>
            <div style={{ whiteSpace: 'pre-wrap' }}>{h}</div>
            <button onClick={() => copy(h)} style={{ background: 'transparent', border: '1px solid #39435f', color: 'white', padding: '6px 10px', borderRadius: 6 }}>Copy</button>
          </div>
        ))}
      </div>
    </main>
  );
}
