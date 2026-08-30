/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  Bell,
  Search,
  Headphones,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { useProfile } from '@/contexts/ProfileContext';

export function DashboardHeader() {
  const pathname = usePathname();
  const { profile } = useProfile();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(true);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileOpen]);

  return (
    <>
      <header className="sticky top-0 z-40 w-full h-16 bg-obsidian/90 backdrop-blur-md border-b border-border/80 shadow-subtle">
        <div className="h-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Left: Mobile Trigger & Brand Identity */}
          <div className="flex items-center gap-3 md:gap-4">
            <button
              type="button"
              onClick={() => setIsMobileOpen(true)}
              aria-label="Open Navigation Drawer"
              className="p-2 md:hidden rounded-md text-secondary hover:text-primary hover:bg-graphite border border-border/60 transition-colors focus:outline-none focus:ring-1 focus:ring-gold/50"
            >
              <Menu className="h-5 w-5" />
            </button>

            <Link href="/dashboard" className="flex items-center gap-2 group">
              <span className="font-serif tracking-widest text-lg font-light text-primary group-hover:text-gold transition-colors">
                TORQUENS
              </span>
              <span className="hidden sm:inline-block text-[10px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded bg-gold/10 text-gold border border-gold/20">
                Vault
              </span>
            </Link>
          </div>

          {/* Center: Command Bar */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-6">
            <div className="w-full flex items-center justify-between px-3.5 py-2 rounded-md bg-charcoal/60 hover:bg-charcoal border border-border/70 text-muted hover:text-secondary text-xs font-sans transition-all cursor-pointer group">
              <div className="flex items-center gap-2.5">
                <Search className="h-3.5 w-3.5 text-muted group-hover:text-gold transition-colors" />
                <span>Search collection, VIN, or dossier...</span>
              </div>
              <kbd className="hidden xl:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono bg-graphite border border-border/80 rounded text-muted">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Right: Actions & User Chip */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/dashboard/enquiries" className="hidden sm:inline-flex">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted hover:text-gold border border-transparent hover:border-gold/20"
                leftIcon={<Headphones className="h-3.5 w-3.5 text-gold" />}
              >
                Concierge Desk
              </Button>
            </Link>

            <button
              type="button"
              aria-label="View notifications"
              className="relative p-2 rounded-md text-secondary hover:text-primary hover:bg-graphite border border-border/60 transition-colors"
              onClick={() => setHasNotifications(false)}
            >
              <Bell className="h-4 w-4" />
              {hasNotifications && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-gold ring-2 ring-obsidian animate-pulse" />
              )}
            </button>

            <div className="h-5 w-px bg-border/60 mx-1 hidden sm:block" />

            <Link
              href="/dashboard/profile"
              className="flex items-center gap-2.5 pl-1.5 pr-2.5 py-1 rounded-full bg-graphite hover:bg-charcoal border border-border/80 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center text-gold font-serif text-xs overflow-hidden">
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
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-sans font-medium text-primary leading-tight truncate max-w-25">
                  {profile?.name?.split(' ')[0] || 'Client'}
                </span>
                <span className="text-[10px] text-gold font-mono uppercase tracking-wider leading-none">
                  Tier 1
                </span>
              </div>
            </Link>
          </div>
        </div>
      </header>

      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden animate-fade-in" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-obsidian/85 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 left-0 w-4/5 max-w-xs bg-graphite border-r border-border shadow-2xl flex flex-col z-10 animate-slide-right">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/80">
              <div className="flex items-center gap-2">
                <span className="font-serif tracking-widest text-base font-light text-primary">
                  TORQUENS
                </span>
                <Badge variant="gold" size="sm">Vault</Badge>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileOpen(false)}
                className="p-1.5 rounded-md text-muted hover:text-primary hover:bg-charcoal transition-colors"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <DashboardSidebar isMobile onClose={() => setIsMobileOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}