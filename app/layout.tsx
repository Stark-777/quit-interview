import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'Quit Interview',
  description: 'Anonymous verified quit reviews to improve workplaces.'
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <main className="site-shell">
          <header className="site-header reveal">
            <Link href="/" className="brand-mark">
              Quit Interview
            </Link>
            <nav className="site-nav">
              <Link href="/">Browse</Link>
              <Link href="/submit">Submit Review</Link>
              <Link href="/moderation">Moderation</Link>
            </nav>
          </header>
          {children}
        </main>
      </body>
    </html>
  );
}
