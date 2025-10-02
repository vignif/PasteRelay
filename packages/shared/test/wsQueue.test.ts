import { describe, it, expect } from 'vitest';
import { WsQueue } from '../src/wsQueue';

describe('WsQueue', () => {
  it('buffers while connecting, flushes on open', () => {
    let sent: string[] = [];
    let ws = { readyState: 0, send: (s: string) => sent.push(s) };
    const q = new WsQueue(() => ws as any);
    q.enqueue({ a: 1 });
    q.enqueue({ b: 2 });
    expect(sent.length).toBe(0);
    // Simulate open
    ws.readyState = 1;
    q.flush();
    expect(sent.map((s) => JSON.parse(s))).toEqual([{ a: 1 }, { b: 2 }]);
    // Subsequent enqueue should send immediately
    q.enqueue({ c: 3 });
    expect(JSON.parse(sent[2])).toEqual({ c: 3 });
  });
});
