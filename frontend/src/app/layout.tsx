import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono, Playfair_Display } from 'next/font/google';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

const googleSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-google-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  style: ['italic', 'normal'],
  variable: '--font-mileast', // Keeping this variable name so tailwind config still works
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AeroGuard — AI-Powered Aircraft Inspection',
  description:
    'Edge AI platform for automated aircraft inspection, defect detection, 3D digital twin visualization, and compliance reporting.',
  keywords: ['aircraft inspection', 'AI', 'MRO', 'defect detection', 'digital twin', 'aviation'],
  icons: {
    icon: '/logo.png',
  },
};

import RouteTransitionOverlay from '@/components/layout/RouteTransitionOverlay';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${googleSans.variable} ${jetbrainsMono.variable} ${playfair.variable}`} suppressHydrationWarning>
      <body className="font-display bg-base text-text-primary antialiased">
        <RouteTransitionOverlay />
        {children}
      </body>
    </html>
  );
}
