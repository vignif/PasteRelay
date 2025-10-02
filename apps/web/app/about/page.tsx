import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="main-grid">
      <h1 className="title-xl">About PasteRelay</h1>
      <p className="text-muted" style={{ opacity: 0.85 }}>
        PasteRelay is a minimal 1:1 online clipboard. It creates a temporary tunnel between two devices using a short PIN.
        This text-only MVP uses WebRTC DataChannels for peer-to-peer transport and a lightweight WebSocket server for signaling.
      </p>

      <section className="section">
        <h3 className="h3">What you can do</h3>
        <ul className="ul">
          <li>Create a session to get a PIN and wait for a peer.</li>
          <li>Join an existing session by PIN; invalid PINs show clear errors.</li>
          <li>Use the shared clipboard view to send and receive text in real time.</li>
          <li>Peer-to-peer by default with STUN; TURN is optional via environment variables.</li>
          <li>No server-side storage of clipboard contents; only signaling metadata is kept temporarily.</li>
        </ul>
      </section>

      <section className="section">
        <h3 className="h3">Notes</h3>
        <ul className="ul">
          <li>Browsers require user action for clipboard writes; use the Copy buttons if needed.</li>
          <li>For tough networks behind NATs, configure TURN in the server env.</li>
        </ul>
      </section>

      <div>
        <Link href="/" className="link-muted">Back to Home</Link>
      </div>
    </div>
  );
}
