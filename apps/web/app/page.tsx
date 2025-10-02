import Link from 'next/link';

export default function Page() {
  return (
    <main style={{ display: 'grid', gap: 16 }}>
      <h1 style={{ margin: 0, fontSize: 28 }}>A shared clipboard in a PINch</h1>
      <p style={{ opacity: 0.8 }}>Create a session to get a PIN, or join an existing one.</p>
      <div style={{ display: 'flex', gap: 16 }}>
        <Link href="/create" style={btnStyle}>Create session</Link>
        <Link href="/join" style={btnGhostStyle}>Join session</Link>
      </div>
    </main>
  );
}

const btnStyle: React.CSSProperties = {
  background: '#4c7cf3', color: 'white', padding: '10px 14px', borderRadius: 8,
  textDecoration: 'none', fontWeight: 600
};
const btnGhostStyle: React.CSSProperties = {
  background: 'transparent', color: 'white', padding: '10px 14px', borderRadius: 8,
  textDecoration: 'none', fontWeight: 600, border: '1px solid #39435f'
};
