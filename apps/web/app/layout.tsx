export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'Inter, system-ui, Arial, sans-serif', background: '#0b1020', color: '#e9ecf1' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px' }}>
          <header style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ fontWeight: 800, fontSize: 20 }}>PasteRelay</div>
            <div style={{ opacity: 0.7, fontSize: 13 }}>A temporary tunnel for your clipboard</div>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
