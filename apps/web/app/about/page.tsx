export default function AboutPage() {
  return (
    <main style={{ display: 'grid', gap: 16 }}>
      <h1 style={{ margin: 0, fontSize: 28 }}>About PasteRelay</h1>
      <p style={{ opacity: 0.85 }}>
        PasteRelay is a minimal 1:1 online clipboard. It creates a temporary tunnel between two devices using a short PIN.
        This text-only MVP uses WebRTC DataChannels for peer-to-peer transport and a lightweight WebSocket server for signaling.
      </p>

      <section style={{ display: 'grid', gap: 8 }}>
        <h3 style={{ margin: '12px 0 0 0' }}>What you can do</h3>
        <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.6 }}>
          <li>Create a session to get a PIN and wait for a peer.</li>
          <li>Join an existing session by PIN; invalid PINs show clear errors.</li>
          <li>Use the shared clipboard view to send and receive text in real time.</li>
          <li>Peer-to-peer by default with STUN; TURN is optional via environment variables.</li>
          <li>No server-side storage of clipboard contents; only signaling metadata is kept temporarily.</li>
        </ul>
      </section>

      <section style={{ display: 'grid', gap: 8 }}>
        <h3 style={{ margin: '12px 0 0 0' }}>Notes</h3>
        <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.6 }}>
          <li>Browsers require user action for clipboard writes; use the Copy buttons if needed.</li>
          <li>For tough networks behind NATs, configure TURN in the server env.</li>
        </ul>
      </section>

      <div>
        <a href="/" style={{ color: '#a9b4d0' }}>Back to Home</a>
      </div>
    </main>
  );
}
