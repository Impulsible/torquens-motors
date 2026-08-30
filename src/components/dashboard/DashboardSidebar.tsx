/* eslint-disable @next/next/no-location-assign-relative-destination */
/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  BookmarkCheck,
  Headphones,
  MessageSquareText,
  UserCheck,
  ShieldAlert,
  LogOut,
  Sparkles,
  ExternalLink,
  Loader2,
} from 'lucide-react';

import { cn } from '@/utils/cn';
import { useProfile } from '@/contexts/ProfileContext';

interface DashboardSidebarProps {
  isMobile?: boolean;
  onClose?: () => void;
}

const navigationSections = [
  {
    title: 'Asset Allocation',
    items: [
      { label: 'Vault Overview', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Saved Vehicles', href: '/dashboard/saved', icon: BookmarkCheck, badge: '4' },
      { label: 'Direct Inquiries', href: '/dashboard/enquiries', icon: Headphones },
    ],
  },
  {
    title: 'Communications',
    items: [
      { label: 'Concierge Messages', href: '/dashboard/messages', icon: MessageSquareText },
    ],
  },
  {
    title: 'Vault Security',
    items: [
      { label: 'Client Dossier', href: '/dashboard/profile', icon: UserCheck },
      { label: 'Security & Protocol', href: '/dashboard/settings', icon: ShieldAlert },
    ],
  },
];

export function DashboardSidebar({ isMobile = false, onClose }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { profile } = useProfile();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // ---------------------------------------------------------------------------
  // RELIABLE CLIENT-SIDE SIGN OUT
  // ---------------------------------------------------------------------------
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      if (onClose) onClose();
      // Destroys NextAuth session cookie and redirects cleanly
      await signOut({ callbackUrl: '/auth/login' });
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/auth/login';
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <aside
      className={cn(
        'flex flex-col justify-between bg-graphite border-r border-border/80 select-none',
        isMobile
          ? 'w-full h-full p-4'
          : 'hidden md:flex w-64 lg:w-72 min-h-[calc(100vh-4rem)] sticky top-16 shrink-0 p-5'
      )}
    >
      <div className="space-y-6">
        {/* Client Identity Summary */}
        <div className="p-3.5 rounded-xl bg-charcoal/60 border border-border/70 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center text-gold font-serif font-medium text-sm shrink-0 overflow-hidden">
            {profile?.avatar ? (
              <img
                src={profile.avatar}
                alt={profile?.name || 'Client'}
                className="w-full h-full object-cover"
              />
            ) : (
              profile?.name?.[0]?.toUpperCase() || 'C'
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-sans font-medium text-primary truncate">
              {profile?.name || 'Verified Client'}
            </p>
            <p className="text-[11px] text-muted font-mono truncate">
              {profile?.email || ''}
            </p>
          </div>
        </div>

        {/* Sidebar Navigation Links */}
        <nav className="space-y-5">
          {navigationSections.map((section) => (
            <div key={section.title} className="space-y-1.5">
              <span className="block px-3 text-[10px] font-mono font-semibold uppercase tracking-widest text-muted">
                {section.title}
              </span>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        'group relative flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-sans transition-all duration-200 cursor-pointer',
                        isActive
                          ? 'bg-gold/10 text-gold font-semibold border border-gold/20 shadow-glow-sm'
                          : 'text-secondary hover:text-primary hover:bg-charcoal/80 border border-transparent'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={cn(
                            'h-4 w-4 transition-colors',
                            isActive ? 'text-gold' : 'text-muted group-hover:text-gold'
                          )}
                        />
                        <span>{item.label}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={cn(
                            'text-[10px] font-mono px-1.5 py-0.5 rounded',
                            isActive
                              ? 'bg-gold text-obsidian font-semibold'
                              : 'bg-charcoal text-muted border border-border/80'
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Footer Links & Sign Out Button */}
      <div className="pt-5 mt-6 border-t border-border/60 space-y-2">
        <Link
          href="/vehicles"
          onClick={onClose}
          className="flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-sans text-muted hover:text-gold hover:bg-charcoal/50 transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-gold/80" />
            Live Showroom
          </span>
          <ExternalLink className="h-3 w-3" />
        </Link>

        {/* Reliable Sign Out Trigger */}
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={cn(
            'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-sans transition-all duration-200 cursor-pointer',
            'text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          {isLoggingOut ? (
            <Loader2 className="h-4 w-4 animate-spin text-red-400 shrink-0" />
          ) : (
            <LogOut className="h-4 w-4 shrink-0" />
          )}
          <span>{isLoggingOut ? 'Terminating Session...' : 'Exit Vault Session'}</span>
        </button>
      </div>
    </aside>
  );
}

export default DashboardSidebar;