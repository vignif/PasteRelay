'use client';
import { useEffect, useRef, useState } from 'react';
import { JoinByPinRequest, JoinByPinResponse } from '@pasterelay/shared';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function JoinPage() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    return () => { wsRef.current?.close(); };
  }, []);

  const submit = () => {
    setError('');
  const url = process.env.NEXT_PUBLIC_SIGNALING_URL || process.env.PUBLIC_WS_URL || 'ws://localhost:8004';
  const ws = new WebSocket(url);
    wsRef.current = ws;
    ws.onopen = () => {
      const req: JoinByPinRequest = { type: 'join_by_pin', pin };
      ws.send(JSON.stringify(req));
    };
    ws.onmessage = (ev) => {
      const data = JSON.parse(ev.data);
      if (data.type === 'join_by_pin_ok') {
        const msg = data as JoinByPinResponse;
        router.push(`/room/${msg.sessionId}?role=guest&owner=${msg.ownerPeerId}&me=${msg.yourPeerId}`);
      } else if (data.type === 'error') {
        setError(data.message || 'Invalid PIN');
      }
    };
    ws.onerror = () => setError('Failed to connect to signaling server');
  };

  return (
    <main style={{ display: 'grid', gap: 16 }}>
      <h2>Join session</h2>
      <input
        placeholder="Enter PIN"
        value={pin}
        onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
        style={{ padding: 10, borderRadius: 8, border: '1px solid #39435f', background: 'transparent', color: 'white', width: 200 }}
      />
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={submit} style={btnStyle}>Join</button>
        <Link href="/" style={{ color: '#a9b4d0' }}>Back</Link>
      </div>
      {error && <p style={{ color: '#ffb3b3' }}>{error}</p>}
    </main>
  );
}

const btnStyle: React.CSSProperties = {
  background: '#4c7cf3', color: 'white', padding: '10px 14px', borderRadius: 8,
  textDecoration: 'none', fontWeight: 600, border: 'none'
};
