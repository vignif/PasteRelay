import Link from 'next/link';
import './globals.css';

export default function RootLayout({ children }: { children: any }) {
  return (
    <html lang="en">
      <head>
        <title>PasteRelay</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="PasteRelay is a minimal 1:1 online clipboard. It creates a temporary tunnel between two devices using a short PIN." />
      </head>
      <body>
        <div className="container">
          <header className="header">
            <Link href="/" className="brand">PasteRelay</Link>
            <div className="tagline">ctrl-c/ctrl-v remote. private.</div>
            <nav className="nav">
              <Link href="/about" className="link-muted">About</Link>
            </nav>
          </header>
          <main className="content">{children}</main>
          <footer className="footer">
            <span>MIT © PasteRelay</span>
            <span>Author: <a href="https://apps.francescovigni.com">Francesco Vigni</a></span>
          </footer>
        </div>
      </body>
    </html>
  );
}
