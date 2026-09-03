import type { Metadata } from 'next';
import { Cormorant_Garamond, Plus_Jakarta_Sans } from 'next/font/google';
import { Layout } from '../components/layout/Layout';
import { ComparisonProvider } from '@/contexts/ComparisonContext';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { ToastProvider } from '@/hooks/useToast';
import { SkipLink } from '@/components/ui/SkipLink';
import './globals.css';

// -----------------------------------------------------------------------------
// FONT CONFIGURATION (Optimized for performance & CLS prevention)
// -----------------------------------------------------------------------------
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-serif',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

// -----------------------------------------------------------------------------
// PRODUCTION METADATA & SEO (OpenGraph, Twitter Cards, Canonical URLs)
// -----------------------------------------------------------------------------
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://torquensmotors.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'TORQUENS MOTORS — Engineered to Move.',
    template: '%s | TORQUENS MOTORS',
  },
  description:
    'The premier digital marketplace for luxury, exotic, and high-performance vehicles. Discover verified listings, AI-assisted search, and seamless dealer connections.',
  keywords: [
    'Luxury Cars Nigeria',
    'Exotic Vehicles Lagos',
    'Porsche Cayenne Nigeria',
    'Mercedes AMG Abuja',
    'Premium Automotive Marketplace',
    'Buy Luxury Cars Africa',
    'Verified Car Dealers Nigeria',
  ],
  authors: [{ name: 'TORQUENS MOTORS' }],
  creator: 'TORQUENS MOTORS',
  publisher: 'TORQUENS MOTORS',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: SITE_URL,
    title: 'TORQUENS MOTORS — Luxury Automotive Marketplace',
    description:
      'Engineered to Move. Discover, compare, and acquire verified luxury vehicles.',
    siteName: 'TORQUENS MOTORS',
    images: [
      {
        url: '/images/og-torquens.png',
        width: 1200,
        height: 630,
        alt: 'TORQUENS MOTORS Luxury Automotive Marketplace',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TORQUENS MOTORS — Engineered to Move.',
    description:
      'The premier digital marketplace for luxury and high-performance vehicles.',
    images: ['/images/og-torquens.png'],
    creator: '@torquensmotors',
  },
  icons: {
    icon: [
      { url: '/images/favicon.png' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/apple-touch-icon.png' }],
  },
  manifest: '/site.webmanifest',
};

// -----------------------------------------------------------------------------
// ROOT LAYOUT COMPONENT
// -----------------------------------------------------------------------------
interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${jakarta.variable} scroll-smooth dark`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-obsidian text-primary font-sans antialiased selection:bg-gold/20 selection:text-gold flex flex-col justify-between">
        {/* Skip Links for Accessibility */}
        <SkipLink href="#main-content">Skip to main content</SkipLink>
        <SkipLink href="#main-navigation">Skip to navigation</SkipLink>

        {/* ToastProvider must be at the root level to be available everywhere */}
        <ToastProvider>
          {/* AuthProvider for NextAuth useSession() */}
          <AuthProvider>
            {/* ComparisonProvider for comparison context */}
            <ComparisonProvider>
              <Layout>
                {children}
              </Layout>
            </ComparisonProvider>
          </AuthProvider>
        </ToastProvider>

        {/* Floating Global UI Anchors (Notifications, Compare Tray, Modals) */}
        <div id="toast-portal" />
        <div id="modal-portal" />
      </body>
    </html>
  );
}