import type { Metadata } from 'next';
import './globals.css';
import AppShell from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'FinanceOS: Modern Full-Stack Finance Tracker',
  description:
    'High-performance personal finance tracking powered by Next.js, PostgreSQL, GSAP, and Anime.js.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased selection:bg-emerald-500/30 selection:text-emerald-200">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
