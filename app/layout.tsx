import type { Metadata, Viewport } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/components/sikesling/app-provider';
import { AppShell } from '@/components/sikesling/app-shell';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#059669',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'SIKESLING RSAM — Sistem Informasi Kesehatan Lingkungan',
  description:
    'Sistem Informasi Kesehatan Lingkungan UOBK RSUD Al-Mulk Kota Sukabumi — Smart Environmental Health Monitoring & Management',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SIKESLING',
  },
  icons: {
    icon: '/icon.svg',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'SIKESLING RSAM — Sistem Informasi Kesehatan Lingkungan',
    description:
      'Sistem Informasi Kesehatan Lingkungan UOBK RSUD Al-Mulk Kota Sukabumi — Smart Environmental Health Monitoring & Management',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SIKESLING RSAM — Sistem Informasi Kesehatan Lingkungan',
    description:
      'Sistem Informasi Kesehatan Lingkungan UOBK RSUD Al-Mulk Kota Sukabumi — Smart Environmental Health Monitoring & Management',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="id"
      className={poppins.variable}
      suppressHydrationWarning
    >
      <body className={`${poppins.className} font-sans antialiased`} suppressHydrationWarning>
        <AppProvider>
          <AppShell>{children}</AppShell>
        </AppProvider>
      </body>
    </html>
  );
}
