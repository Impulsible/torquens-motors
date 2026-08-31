'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  MessageSquare,
  BarChart3,
  Store,
  Settings,
  LogOut,
  Users,
  ShieldCheck,
  Compass,
  Sparkles,
  Loader2,
  LucideIcon,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { logout } from '@/actions/auth';

// ─────────────────────────────────────────────────────────────
// TYPES & INTERFACES
// ─────────────────────────────────────────────────────────────
export interface DealerSidebarUser {
  name?: string | null;
  email?: string | null;
  role?: string | null;
  avatar?: string | null;
}

export interface DealerSidebarProps {
  user?: DealerSidebarUser | null;
  className?: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

interface NavGroup {
  groupLabel: string;
  items: NavItem[];
}

// ─────────────────────────────────────────────────────────────
// NAVIGATION STRUCTURE
// ─────────────────────────────────────────────────────────────
const OPERATIONAL_GROUPS: NavGroup[] = [
  {
    groupLabel: 'Core Operations',
    items: [
      {
        label: 'Dashboard Overview',
        href: '/dealer',
        icon: LayoutDashboard,
      },
      {
        label: 'Managed Inventory',
        href: '/dealer/inventory',
        icon: Package,
      },
      {
        label: 'List New Allocation',
        href: '/dealer/vehicles/new',
        icon: PlusCircle,
      },
    ],
  },
  {
    groupLabel: 'Client Relations',
    items: [
      {
        label: 'Inquiries & Dossiers',
        href: '/dealer/enquiries',
        icon: MessageSquare,
      },
      {
        label: 'Market Intelligence',
        href: '/dealer/analytics',
        icon: BarChart3,
      },
    ],
  },
  {
    groupLabel: 'Terminal Config',
    items: [
      {
        label: 'Broker Profile',
        href: '/dealer/profile',
        icon: Store,
      },
      {
        label: 'Security & Protocol',
        href: '/dealer/settings',
        icon: Settings,
      },
    ],
  },
];

const ADMIN_GROUP: NavGroup = {
  groupLabel: 'Master Protocol',
  items: [
    {
      label: 'Client Registry',
      href: '/admin/users',
      icon: Users,
    },
    {
      label: 'Asset Verification',
      href: '/admin/verification',
      icon: ShieldCheck,
    },
  ],
};

export function DealerSidebar({ user, className }: DealerSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isAdmin = user?.role === 'ADMIN';

  // Assemble visible navigation groups based on authorization level
  const navigationGroups = isAdmin
    ? [...OPERATIONAL_GROUPS, ADMIN_GROUP]
    : OPERATIONAL_GROUPS;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.push('/auth/login');
      router.refresh();
    } catch (error) {
      console.error('[DealerSidebar] Logout failed:', error);
      setIsLoggingOut(false);
    }
  };

  // Helper to check route hierarchy matches
  const isRouteActive = (href: string) => {
    if (href === '/dealer') {
      return pathname === '/dealer';
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const userInitial = user?.name?.charAt(0).toUpperCase() || 'B';

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col w-64 lg:w-72 min-h-[calc(100vh-4rem)] bg-graphite/95 border-r border-border/80 shrink-0 sticky top-16 z-30 select-none backdrop-blur-xl',
        className
      )}
    >
      {/* ───────────────────────────────────────────────────────── */}
      {/* CUSTODIAN PROFILE CARD                                    */}
      {/* ───────────────────────────────────────────────────────── */}
      <div className="p-5 pb-4 border-b border-border/60">
        <div className="flex items-center gap-3.5 p-3 rounded-xl bg-obsidian/70 border border-border/70 relative overflow-hidden">
          {/* Subtle gold corner highlight */}
          <div className="absolute top-0 right-0 w-12 h-12 bg-gold/5 blur-xl pointer-events-none" />

          {/* User Initial Crest */}
          <div className="relative h-10 w-10 rounded-lg bg-obsidian border border-gold/40 flex items-center justify-center text-gold font-serif text-base shrink-0 shadow-[0_0_15px_rgba(212,175,55,0.15)]">
            <span>{userInitial}</span>
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-obsidian" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-serif font-normal text-primary truncate">
                {user?.name || 'Verified Broker'}
              </p>
              {isAdmin && <Sparkles className="h-3 w-3 text-gold shrink-0" />}
            </div>

            <p className="text-[10px] text-muted font-mono truncate max-w-35 mt-0.5">
              {user?.email || 'broker@torquens.com'}
            </p>

            <div className="mt-1.5 flex items-center gap-1.5">
              <span
                className={cn(
                  'px-1.5 py-0.5 rounded text-[8px] font-mono tracking-widest uppercase font-semibold border',
                  isAdmin
                    ? 'bg-gold/15 text-gold border-gold/30'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                )}
              >
                {isAdmin ? 'Master Admin' : 'Custodian'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────── */}
      {/* NAVIGATION TREE                                           */}
      {/* ───────────────────────────────────────────────────────── */}
      <div className="flex-1 px-4 py-4 space-y-6 overflow-y-auto custom-scrollbar">
        {navigationGroups.map((group) => (
          <div key={group.groupLabel} className="space-y-1.5">
            <div className="px-3 text-[9px] font-mono tracking-[0.25em] uppercase text-gold/70 select-none">
              {group.groupLabel}
            </div>

            <nav className="space-y-0.5">
              {group.items.map((item) => {
                const active = isRouteActive(item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'group relative flex items-center justify-between px-3 py-2 rounded-lg text-xs font-sans transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/50',
                      active
                        ? 'bg-gold/10 text-primary font-medium border border-gold/30 shadow-[inset_0_1px_0_0_rgba(212,175,55,0.2)]'
                        : 'text-secondary hover:text-primary hover:bg-white/3 border border-transparent'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={cn(
                          'h-4 w-4 transition-colors duration-200 shrink-0',
                          active
                            ? 'text-gold'
                            : 'text-muted group-hover:text-gold/80'
                        )}
                      />
                      <span className="tracking-wide">{item.label}</span>
                    </div>

                    {/* Active Accent Pill */}
                    {active && (
                      <span className="h-1.5 w-1.5 rounded-full bg-gold shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* ───────────────────────────────────────────────────────── */}
      {/* TERMINAL FOOTER ACTIONS                                   */}
      {/* ───────────────────────────────────────────────────────── */}
      <div className="p-4 border-t border-border/60 bg-obsidian/40 space-y-2">
        {/* Quick Exit to Public Showroom */}
        <Link
          href="/"
          className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono uppercase tracking-wider text-muted hover:text-gold hover:bg-graphite/60 transition-all border border-transparent hover:border-gold/20"
        >
          <div className="flex items-center gap-2.5">
            <Compass className="h-3.5 w-3.5 text-muted group-hover:text-gold" />
            <span>Public Showroom</span>
          </div>
          <span className="text-[9px] text-muted tracking-tighter">↗</span>
        </Link>

        {/* Terminate Session Button */}
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-sans text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 w-full border border-transparent hover:border-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500/40"
        >
          {isLoggingOut ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-red-400" />
          ) : (
            <LogOut className="h-3.5 w-3.5" />
          )}
          <span>{isLoggingOut ? 'Terminating...' : 'Terminate Session'}</span>
        </button>
      </div>
    </aside>
  );
}