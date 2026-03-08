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
        <main>
          <header style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
              <h1>Quit Interview</h1>
              <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <Link href="/">Browse</Link>
                <Link href="/submit">Submit Review</Link>
                <Link href="/moderation">Moderation</Link>
              </nav>
            </div>
            <p className="meta">US-first, verified-anonymous quit interviews with moderated publication.</p>
          </header>
          {children}
        </main>
      </body>
    </html>
  );
}
