'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Compass,
  Heart,
  User,
  ShieldCheck,
  Building2,
  LucideIcon,
} from 'lucide-react';
import { cn } from '@/utils/cn';

// ─────────────────────────────────────────────────────────────
// TYPE DEFINITIONS
// ─────────────────────────────────────────────────────────────

export interface BottomNavItem {
  /**
   * Accessible display label
   */
  label: string;
  /**
   * Primary destination path
   */
  href: string;
  /**
   * Lucide or custom SVG icon component
   */
  icon: LucideIcon;
  /**
   * If true, only matches the exact path. Defaults to true for root '/'
   */
  exact?: boolean;
  /**
   * Requires authenticated user session
   */
  requiresAuth?: boolean;
  /**
   * Fallback destination for unauthenticated visitors
   * @default '/login?redirect={href}'
   */
  unauthHref?: string;
  /**
   * Live badge counter (e.g. saved cars count, unread alerts)
   */
  badgeCount?: number;
}

export interface MobileBottomNavProps {
  /**
   * Optional custom navigation item manifest
   */
  items?: BottomNavItem[];
  /**
   * Authentication state passed from AuthContext / Session
   * @default false
   */
  isAuthenticated?: boolean;
  /**
   * Optional count of shortlisted / favorited chassis
   */
  savedCount?: number;
  /**
   * Pathnames where the bottom nav should automatically hide (e.g. 360 viewer, checkout)
   */
  hiddenRoutes?: string[];
  /**
   * Custom CSS wrapper classes
   */
  className?: string;
}

// ─────────────────────────────────────────────────────────────
// DEFAULT CONFIGURATION
// ─────────────────────────────────────────────────────────────

const DEFAULT_NAV_ITEMS: BottomNavItem[] = [
  {
    label: 'Showroom',
    href: '/vehicles',
    icon: Compass,
    exact: false,
  },
  {
    label: 'Escrow',
    href: '/escrow',
    icon: ShieldCheck,
    exact: false,
  },
  {
    label: 'Vaulted',
    href: '/dashboard/saved',
    icon: Heart,
    requiresAuth: true,
    exact: false,
  },
  {
    label: 'Offices',
    href: '/about',
    icon: Building2,
    exact: true,
  },
  {
    label: 'Client Desk',
    href: '/dashboard',
    icon: User,
    requiresAuth: true,
    exact: false,
  },
];

// ─────────────────────────────────────────────────────────────
// ROUTE ACTIVE MATCHER HELPER
// ─────────────────────────────────────────────────────────────

function isRouteActive(currentPath: string, targetHref: string, exact = false): boolean {
  if (exact || targetHref === '/') {
    return currentPath === targetHref;
  }
  return currentPath === targetHref || currentPath.startsWith(`${targetHref}/`);
}

// ─────────────────────────────────────────────────────────────
// PRODUCTION MOBILE BOTTOM NAVIGATION
// ─────────────────────────────────────────────────────────────

export function MobileBottomNav({
  items = DEFAULT_NAV_ITEMS,
  isAuthenticated = false,
  savedCount = 0,
  hiddenRoutes = ['/auth', '/login', '/register', '/admin'],
  className,
}: MobileBottomNavProps) {
  const pathname = usePathname();

  // Hide nav bar if on excluded route prefixes
  const shouldHide = hiddenRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (shouldHide) return null;

  return (
    <nav
      role="navigation"
      aria-label="Mobile Navigation"
      className={cn(
        // Layout & Positioning
        'fixed bottom-0 inset-x-0 z-40 md:hidden',
        // Luxury Frosted Backdrop
        'bg-zinc-950/90 backdrop-blur-xl border-t border-white/8',
        // iOS Home Indicator Safe Area Padding
        'pb-[env(safe-area-inset-bottom,0px)]',
        // Elevate with soft top shadow
        'shadow-[0_-8px_24px_rgba(0,0,0,0.4)]',
        className
      )}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {items.map((item) => {
          const isActive = isRouteActive(pathname, item.href, item.exact);
          const Icon = item.icon;

          // Determine destination based on authentication status
          const destination =
            item.requiresAuth && !isAuthenticated
              ? item.unauthHref || `/login?redirect=${encodeURIComponent(item.href)}`
              : item.href;

          // Compute dynamic badge counter
          const count =
            item.href.includes('saved') && savedCount > 0
              ? savedCount
              : item.badgeCount;

          return (
            <Link
              key={item.href}
              href={destination}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'group relative flex flex-col items-center justify-center flex-1 h-full min-w-0 px-1',
                'transition-transform duration-150 active:scale-95',
                'focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-amber-400/50'
              )}
            >
              {/* Active Ambient Glow Pip */}
              {isActive && (
                <span
                  aria-hidden="true"
                  className="absolute top-1 w-6 h-0.5 rounded-full bg-linear-to-r from-amber-400/80 to-amber-200 shadow-[0_0_8px_rgba(251,191,36,0.6)] animate-in fade-in zoom-in-50 duration-300"
                />
              )}

              {/* Icon Container with Badge */}
              <div className="relative flex items-center justify-center">
                <Icon
                  aria-hidden="true"
                  className={cn(
                    'h-5 w-5 transition-all duration-300',
                    isActive
                      ? 'text-amber-400 scale-110 drop-shadow-[0_0_6px_rgba(251,191,36,0.3)]'
                      : 'text-zinc-400 group-hover:text-zinc-200'
                  )}
                />

                {/* Counter Badge */}
                {count !== undefined && count > 0 && (
                  <span
                    aria-label={`${count} items`}
                    className="absolute -top-1.5 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-400 px-1 text-[9px] font-mono font-bold leading-none text-zinc-950 shadow-xs"
                  >
                    {count > 99 ? '99+' : count}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={cn(
                  'text-[10px] font-mono tracking-wider uppercase mt-1 truncate max-w-full transition-colors duration-200',
                  isActive
                    ? 'text-amber-300 font-medium'
                    : 'text-zinc-400 group-hover:text-zinc-200'
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

MobileBottomNav.displayName = 'MobileBottomNav';