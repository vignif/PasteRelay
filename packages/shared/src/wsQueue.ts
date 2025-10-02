export type Sender = { readyState: number; send: (data: string) => void };

export class WsQueue {
  private q: any[] = [];
  constructor(private wsRef: () => Sender | null) {}

  enqueue(obj: any) {
    const ws = this.wsRef();
    if (ws && ws.readyState === 1) {
      ws.send(JSON.stringify(obj));
    } else {
      this.q.push(obj);
    }
  }

  flush() {
    const ws = this.wsRef();
    if (!ws || ws.readyState !== 1) return;
    const items = this.q;
    this.q = [];
    for (const item of items) ws.send(JSON.stringify(item));
  }
}
