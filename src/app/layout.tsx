import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { SessionProvider } from '@/components/session-provider';
import { CustomCursor } from '@/components/custom-cursor';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const metadata: Metadata = {
  title: 'Comparative Methods Live Lab',
  description: 'Interactive classroom activity',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased bg-slate-950`}>
        <CustomCursor />
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
