'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Header } from './Header';
import { Footer } from './Footer';

interface LayoutProps {
  children: ReactNode;
}

/**
 * Private app shells that own their own chrome (vault header/sidebar).
 * Public marketing Header + Footer must NOT render on these routes.
 */
const APP_SHELL_PREFIXES = [
  '/dashboard',
  '/dealer',
  '/admin',
  '/auth',
];

function isAppShellRoute(pathname: string): boolean {
  return APP_SHELL_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function Layout({ children }: LayoutProps) {
  const pathname = usePathname() || '/';
  const { data: session, status } = useSession();

  const hidePublicChrome = isAppShellRoute(pathname);

  const user =
    status === 'authenticated' && session?.user
      ? {
          id: (session.user as { id?: string }).id || '',
          name: session.user.name || 'Client',
          email: session.user.email || '',
          role: ((session.user as { role?: string }).role as
            | 'CUSTOMER'
            | 'DEALER'
            | 'ADMIN') || 'CUSTOMER',
          tier: 'Tier 1',
          avatar:
            (session.user as { image?: string | null; avatar?: string | null })
              .image ||
            (session.user as { avatar?: string | null }).avatar ||
            undefined,
        }
      : null;

  const isAuthenticated = status === 'authenticated' && !!session?.user;

  // ── Private vault / dealer / admin / auth: no public header or footer ──
  if (hidePublicChrome) {
    return (
      <div className="min-h-screen flex flex-col bg-obsidian">
        <main id="main-content" className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    );
  }

  // ── Public marketing site ──
  return (
    <div className="min-h-screen flex flex-col bg-obsidian">
      <Header user={user} isAuthenticated={isAuthenticated} />
      <main id="main-content" className="grow pt-16 md:pt-20 lg:pt-24">
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default Layout;