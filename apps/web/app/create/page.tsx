'use client';
import { useEffect, useRef, useState } from 'react';
import { CreateSessionRequest, CreateSessionResponse } from '@pasterelay/shared';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CreatePage() {
  const [pin, setPin] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');
  const [ownerPeerId, setOwnerPeerId] = useState<string>('');
  const [error, setError] = useState<string>('');
  const sessionRef = useRef<string>('');
  const ownerRef = useRef<string>('');
  const router = useRouter();

  useEffect(() => {
    const ws = new WebSocket(process.env.NEXT_PUBLIC_SIGNALING_URL || 'ws://localhost:8080');
    ws.onopen = () => {
      const req: CreateSessionRequest = { type: 'create_session' };
      ws.send(JSON.stringify(req));
    };
    ws.onmessage = (ev) => {
      const data = JSON.parse(ev.data);
      if (data.type === 'create_session_ok') {
        const msg = data as CreateSessionResponse;
        setPin(msg.pin);
        setSessionId(msg.sessionId);
        setOwnerPeerId(msg.ownerPeerId);
        sessionRef.current = msg.sessionId;
        ownerRef.current = msg.ownerPeerId;
      }
      if (data.type === 'presence') {
        // If a second peer appears, navigate to room
        if (data.peers && data.peers.length >= 2) {
          const guest = (data.peers as string[]).find((p: string) => p !== ownerRef.current);
          if (guest) router.push(`/room/${sessionRef.current}?role=owner&owner=${ownerRef.current}&peer=${guest}`);
        }
      }
      if (data.type === 'error') {
        setError(data.message || 'Unknown error');
      }
    };
    ws.onerror = () => setError('Failed to connect to signaling server');
    return () => ws.close();
  }, [router]);

  return (
    <main style={{ display: 'grid', gap: 16 }}>
      <h2>Create session</h2>
      <p>Share this PIN with the other device to join:</p>
  <div data-testid="pin" style={{ fontSize: 40, letterSpacing: 4, fontWeight: 800 }}>{pin || '••••••'}</div>
  <p style={{ opacity: 0.8 }}>Waiting for someone to join… Share the PIN and keep this page open.</p>
      {error && <p style={{ color: '#ffb3b3' }}>{error}</p>}
      <Link href="/" style={{ color: '#a9b4d0' }}>Back</Link>
    </main>
  );
}
