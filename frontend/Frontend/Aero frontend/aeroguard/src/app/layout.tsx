import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AeroGuard — AI-Powered Aircraft Inspection',
  description:
    'Edge AI platform for automated aircraft inspection, defect detection, 3D digital twin visualization, and compliance reporting.',
  keywords: ['aircraft inspection', 'AI', 'MRO', 'defect detection', 'digital twin', 'aviation'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body className="font-display bg-base text-text-primary antialiased">
        {children}
      </body>
    </html>
  );
}
