import Link from 'next/link';

export default function Page() {
  return (
    <div className="main-grid">
      <h1 className="title-xl">A temporary private tunnel for your clipboard.</h1>
      <p className="text-muted">
        PasteRelay is a minimal 1:1 online clipboard. It creates a temporary tunnel between two devices using a short PIN.
        It\'s like doing ctrl-c/ctrl-v but on the web.
        <br />
        Create a session to get a PIN, or join an existing one.</p>
      <div className="row" style={{ gap: 16 }}>
        <Link href="/create" className="btn">Create session</Link>
        <Link href="/join" className="btn-ghost">Join session</Link>
      </div>
    </div>
  );
}
