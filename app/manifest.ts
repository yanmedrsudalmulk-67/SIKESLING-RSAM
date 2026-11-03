import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'SIKRESMI — Sistem Informasi Kesehatan Lingkungan RSUD Al-Mulk Kota Sukabumi',
    short_name: 'SIKRESMI',
    description:
      'Sistem Informasi Kesehatan Lingkungan RSUD Al-Mulk Kota Sukabumi — Smart Environmental Health Monitoring & Management.',
    start_url: '/dashboard',
    scope: '/',
    display: 'standalone',
    background_color: '#F8FAFC',
    theme_color: '#059669',
    icons: [
      {
        src: '/pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/pwa-maskable-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
