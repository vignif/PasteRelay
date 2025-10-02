import { describe, it, expect } from 'vitest';
import { PendingRelay } from '../src/pendingRelay';

describe('PendingRelay', () => {
  it('enqueues per peer and drains once', () => {
    const pr = new PendingRelay<string>();
    pr.enqueue('peerA', 'one');
    pr.enqueue('peerA', 'two');
    pr.enqueue('peerB', 'x');
    expect(pr.drain('peerA')).toEqual(['one', 'two']);
    expect(pr.drain('peerA')).toEqual([]);
    expect(pr.drain('peerB')).toEqual(['x']);
  });
});
