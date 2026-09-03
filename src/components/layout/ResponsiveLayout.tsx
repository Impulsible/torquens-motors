'use client';

import React, { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { Footer } from './Footer';
import { MobileBottomNav } from '../navigation/MobileBottomNav';
import { cn } from '@/utils/cn';

// ─────────────────────────────────────────────────────────────
// PROPS INTERFACE
// ─────────────────────────────────────────────────────────────

export interface ResponsiveLayoutProps {
  /**
   * Page content
   */
  children: ReactNode;
  /**
   * Custom CSS applied to the outer layout wrapper
   */
  className?: string;
  /**
   * Custom CSS applied specifically to the `<main>` content container
   */
  mainClassName?: string;
  /**
   * Explicitly force hide header across the layout
   * @default false
   */
  hideHeader?: boolean;
  /**
   * Explicitly force hide footer across the layout
   * @default false
   */
  hideFooter?: boolean;
  /**
   * Explicitly force hide mobile bottom navigation bar
   * @default false
   */
  hideBottomNav?: boolean;
  /**
   * Route prefixes where the Header should automatically be hidden
   * @default ['/studio', '/checkout', '/fullscreen']
   */
  suppressHeaderRoutes?: string[];
  /**
   * Route prefixes where the Footer should automatically be hidden
   * @default ['/dashboard', '/auth', '/login', '/register', '/admin', '/studio']
   */
  suppressFooterRoutes?: string[];
  /**
   * Route prefixes where the Mobile Bottom Navigation should automatically be hidden
   * @default ['/auth', '/login', '/register', '/admin', '/studio', '/checkout']
   */
  suppressBottomNavRoutes?: string[];
  /**
   * Pass active authentication state down to mobile navigation
   * @default false
   */
  isAuthenticated?: boolean;
  /**
   * Live count of saved/favorited chassis for mobile navigation badge
   * @default 0
   */
  savedCount?: number;
}

// ─────────────────────────────────────────────────────────────
// DEFAULT ROUTE SUPPRESSION RULES
// ─────────────────────────────────────────────────────────────

const DEFAULT_SUPPRESS_HEADER = ['/studio', '/checkout', '/fullscreen'];
const DEFAULT_SUPPRESS_FOOTER = ['/dashboard', '/auth', '/login', '/register', '/admin', '/studio'];
const DEFAULT_SUPPRESS_BOTTOM_NAV = ['/auth', '/login', '/register', '/admin', '/studio', '/checkout'];

// ─────────────────────────────────────────────────────────────
// PRODUCTION RESPONSIVE LAYOUT
// ─────────────────────────────────────────────────────────────

export function ResponsiveLayout({
  children,
  className,
  mainClassName,
  hideHeader = false,
  hideFooter = false,
  hideBottomNav = false,
  suppressHeaderRoutes = DEFAULT_SUPPRESS_HEADER,
  suppressFooterRoutes = DEFAULT_SUPPRESS_FOOTER,
  suppressBottomNavRoutes = DEFAULT_SUPPRESS_BOTTOM_NAV,
  isAuthenticated = false,
  savedCount = 0,
}: ResponsiveLayoutProps) {
  const pathname = usePathname() || '';

  // Evaluate dynamic route suppression
  const isHeaderSuppressed =
    hideHeader ||
    suppressHeaderRoutes.some((route) => pathname.startsWith(route));

  const isFooterSuppressed =
    hideFooter ||
    suppressFooterRoutes.some((route) => pathname.startsWith(route));

  const isBottomNavSuppressed =
    hideBottomNav ||
    suppressBottomNavRoutes.some((route) => pathname.startsWith(route));

  return (
    <div
      className={cn(
        'relative min-h-screen flex flex-col bg-obsidian text-primary selection:bg-gold selection:text-obsidian isolate',
        className
      )}
    >
      {/* ───────────────────────────────────────────────────────── */}
      {/* ACCESSIBILITY: SKIP TO CONTENT (WCAG 2.1 AA)             */}
      {/* ───────────────────────────────────────────────────────── */}
      <a
        href="#main-content"
        className={cn(
          'sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50',
          'px-4 py-2 rounded-lg bg-gold text-obsidian font-mono text-xs font-semibold uppercase tracking-widest',
          'shadow-glow transition-transform duration-200 outline-hidden focus:ring-2 focus:ring-primary'
        )}
      >
        Skip to main content
      </a>

      {/* ───────────────────────────────────────────────────────── */}
      {/* GLOBAL HEADER                                             */}
      {/* ───────────────────────────────────────────────────────── */}
      {!isHeaderSuppressed && <Header />}

      {/* ───────────────────────────────────────────────────────── */}
      {/* PRIMARY APPLICATION SURFACE                               */}
      {/* ───────────────────────────────────────────────────────── */}
      <main
        id="main-content"
        tabIndex={-1}
        className={cn(
          'flex-1 flex flex-col w-full outline-hidden',
          // Top spacing offset for fixed header
          !isHeaderSuppressed && 'pt-16 md:pt-20',
          // Declarative bottom spacing to ensure content clears mobile bottom bar + iOS safe area
          !isBottomNavSuppressed && 'pb-[calc(4rem+env(safe-area-inset-bottom,0px))] md:pb-0',
          mainClassName
        )}
      >
        {children}
      </main>

      {/* ───────────────────────────────────────────────────────── */}
      {/* GLOBAL FOOTER                                             */}
      {/* ───────────────────────────────────────────────────────── */}
      {!isFooterSuppressed && <Footer />}

      {/* ───────────────────────────────────────────────────────── */}
      {/* MOBILE BOTTOM NAVIGATION DOCK                             */}
      {/* ───────────────────────────────────────────────────────── */}
      {!isBottomNavSuppressed && (
        <MobileBottomNav
          isAuthenticated={isAuthenticated}
          savedCount={savedCount}
        />
      )}
    </div>
  );
}

ResponsiveLayout.displayName = 'ResponsiveLayout';