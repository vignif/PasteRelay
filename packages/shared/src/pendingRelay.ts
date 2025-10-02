export class PendingRelay<T = any> {
  private store = new Map<string, T[]>();

  enqueue(toPeerId: string, payload: T) {
    const arr = this.store.get(toPeerId) || [];
    arr.push(payload);
    this.store.set(toPeerId, arr);
  }

  drain(toPeerId: string): T[] {
    const arr = this.store.get(toPeerId) || [];
    this.store.delete(toPeerId);
    return arr;
  }
}
