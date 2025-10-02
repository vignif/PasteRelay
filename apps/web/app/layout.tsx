import Link from 'next/link';

export default function RootLayout({ children }: { children: any }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'Inter, system-ui, Arial, sans-serif', background: '#0b1020', color: '#e9ecf1' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px', minHeight: '100vh', display: 'flex', flexDirection: 'column' as const }}>
          <header style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ fontWeight: 800, fontSize: 20 }}><Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>PasteRelay</Link></div>
            <div style={{ opacity: 0.7, fontSize: 13, flex: 1 }}>A temporary tunnel for your clipboard</div>
            <nav style={{ display: 'flex', gap: 12 }}>
              <Link href="/about" style={{ color: '#a9b4d0', textDecoration: 'none' }}>About</Link>
            </nav>
          </header>
          <div style={{ flex: 1 }}>{children}</div>
          <footer style={{ marginTop: 32, paddingTop: 16, borderTop: '1px solid #2a3147', fontSize: 12, opacity: 0.8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <span>MIT © PasteRelay</span>
            <span>Author: Francesco Vigni</span>
          </footer>
        </div>
      </body>
    </html>
  );
}
