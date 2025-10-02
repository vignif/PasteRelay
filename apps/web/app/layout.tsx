import Link from 'next/link';
import './globals.css';

export default function RootLayout({ children }: { children: any }) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          <header className="header">
            <Link href="/" className="brand">PasteRelay</Link>
            <div className="tagline">A temporary tunnel for your clipboard</div>
            <nav className="nav">
              <Link href="/about" className="link-muted">About</Link>
            </nav>
          </header>
          <main>{children}</main>
          <footer className="footer">
            <span>MIT © PasteRelay</span>
            <span>Author: Francesco Vigni</span>
          </footer>
        </div>
      </body>
    </html>
  );
}
