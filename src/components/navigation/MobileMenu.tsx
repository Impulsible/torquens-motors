/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  X,
  Car,
  Home,
  Heart,
  User,
  LogOut,
  MessageSquare,
  Package,
  Store,
  ShieldCheck,
  BarChart3,
  Sparkles,
  Crown,
  Building2,
  PhoneCall,
  ChevronRight,
  KeyRound,
  ArrowUpRight,
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';
import { mainNavItems, userMenuItems, dealerMenuItems, adminMenuItems } from '@/data/navigation';

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                   */
/* -------------------------------------------------------------------------- */

export type UserRole = 'CUSTOMER' | 'DEALER' | 'ADMIN' | 'CONCIERGE';

export interface UserProfile {
  name: string;
  email: string;
  role: UserRole | string;
  avatar?: string | null;
  tier?: string; // e.g. "Centurion Member", "Private Client"
}

export interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  isAuthenticated?: boolean;
  user?: UserProfile | null;
  onSignOut?: () => void | Promise<void>;
  className?: string;
}

/* -------------------------------------------------------------------------- */
/*                              MOBILE MENU ROOT                              */
/* -------------------------------------------------------------------------- */

export function MobileMenu({
  isOpen,
  onClose,
  isAuthenticated = false,
  user,
  onSignOut,
  className,
}: MobileMenuProps) {
  const pathname = usePathname();
  const drawerRef = useRef<HTMLDivElement>(null);

  // 1. Lock Body Scroll & Keyboard Escape Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // 2. Role Configuration & Navigation Mapping
  const roleConfig: Record<
    string,
    { label: string; variant: BadgeVariant; icon: React.ReactNode; dashboardHref: string }
  > = {
    ADMIN: {
      label: 'System Admin',
      variant: 'emerald',
      icon: <ShieldCheck className="h-3 w-3" />,
      dashboardHref: '/admin',
    },
    DEALER: {
      label: 'Certified Dealer',
      variant: 'gold',
      icon: <Building2 className="h-3 w-3" />,
      dashboardHref: '/dealer',
    },
    CUSTOMER: {
      label: user?.tier || 'Private Client',
      variant: 'gold',
      icon: <Crown className="h-3 w-3" />,
      dashboardHref: '/dashboard',
    },
  };

  const activeRole = roleConfig[user?.role?.toUpperCase() || 'CUSTOMER'] || roleConfig.CUSTOMER;

  const getAccountMenuItems = () => {
    if (user?.role === 'ADMIN') return adminMenuItems;
    if (user?.role === 'DEALER') return dealerMenuItems;
    return userMenuItems;
  };

  const accountMenuItems = getAccountMenuItems();

  // 3. Monogram Initials Fallback
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'VI';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Mobile Navigation Menu"
      className="fixed inset-0 z-50 flex justify-end bg-obsidian/85 backdrop-blur-xl md:hidden animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Ambient Gold Radial Flare */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-10 right-0 w-72 h-72 bg-gold/10 blur-[100px] rounded-full"
      />

      {/* ───────────────────────────────────────────────────────────── */}
      {/* DRAWER CHASSIS                                                */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div
        ref={drawerRef}
        className={cn(
          'relative flex flex-col w-full max-w-sm h-full bg-graphite border-l border-border/80 shadow-dropdown',
          'animate-slide-up duration-300 overflow-hidden',
          className
        )}
      >
        {/* Specular Top Edge Light Refraction */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/15 to-transparent z-20"
        />

        {/* ───────────────────────────────────────────────────────────── */}
        {/* 1. HEADER (Brand Crest & Dismiss Button)                      */}
        {/* ───────────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between p-5 border-b border-border/60 bg-charcoal/30">
          <Link href="/" onClick={onClose} className="flex items-center gap-1.5">
            <span className="font-serif text-xl tracking-tight text-primary">
              TORQUENS
            </span>
            <span className="font-sans text-xs uppercase tracking-widest font-semibold text-gold">
              MOTORS
            </span>
          </Link>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-border/80 text-muted hover:text-primary hover:border-active-border hover:bg-charcoal transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* 2. SCROLLABLE NAVIGATION BODY                                 */}
        {/* ───────────────────────────────────────────────────────────── */}
        <nav className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* USER PROFILE DOSSIER (If Authenticated) */}
          {isAuthenticated && user && (
            <div className="p-3.5 rounded-lg bg-inset border border-border/70 shadow-inner">
              <div className="flex items-center gap-3">
                {/* Avatar with Metallic Ring */}
                <div className="relative h-10 w-10 rounded-full overflow-hidden border border-gold/40 p-0.5 bg-obsidian shrink-0 flex items-center justify-center">
                  {user.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={user.name}
                      fill
                      className="object-cover rounded-full"
                    />
                  ) : (
                    <span className="font-serif text-sm text-gold">{initials}</span>
                  )}
                </div>

                {/* Name & Email */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="font-serif text-sm font-normal text-primary truncate">
                      {user.name}
                    </h4>
                    <Badge variant={activeRole.variant} size="sm" leftIcon={activeRole.icon}>
                      {activeRole.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted font-mono truncate mt-0.5">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* MAIN SHOWROOM NAVIGATION */}
          <div>
            <span className="block text-[10px] uppercase tracking-widest font-semibold text-muted font-sans mb-2.5 px-2">
              Curated Showroom
            </span>
            <ul className="space-y-1">
              {mainNavItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        'group flex items-center justify-between px-3.5 py-2.5 rounded-md text-sm font-sans font-medium transition-all duration-200',
                        isActive
                          ? 'bg-gold/10 text-gold border-l-2 border-gold font-semibold shadow-sm'
                          : 'text-secondary hover:text-primary hover:bg-charcoal/70'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {item.icon && (
                          <span
                            className={cn(
                              'h-4 w-4 shrink-0 transition-colors',
                              isActive ? 'text-gold' : 'text-muted group-hover:text-gold'
                            )}
                          >
                            {item.icon}
                          </span>
                        )}
                        <span>{item.label}</span>
                      </div>

                      <ChevronRight
                        className={cn(
                          'h-3.5 w-3.5 transition-transform duration-200',
                          isActive ? 'text-gold' : 'text-muted/60 group-hover:text-gold group-hover:translate-x-0.5'
                        )}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* AUTHENTICATED ACCOUNT & PORTAL ACTIONS */}
          {isAuthenticated && (
            <div className="pt-4 border-t border-border/60">
              <span className="block text-[10px] uppercase tracking-widest font-semibold text-muted font-sans mb-2.5 px-2">
                Client Vault & Dossiers
              </span>
              <ul className="space-y-1">
                {accountMenuItems.map((item, index) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={`${item.href}-${index}`}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={cn(
                          'group flex items-center justify-between px-3.5 py-2.5 rounded-md text-sm font-sans font-medium transition-all duration-200',
                          isActive
                            ? 'bg-gold/10 text-gold border-l-2 border-gold font-semibold'
                            : 'text-secondary hover:text-primary hover:bg-charcoal/70'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          {item.icon && (
                            <span
                              className={cn(
                                'h-4 w-4 shrink-0 transition-colors',
                                isActive ? 'text-gold' : 'text-muted group-hover:text-gold'
                              )}
                            >
                              {item.icon}
                            </span>
                          )}
                          <span>{item.label}</span>
                        </div>

                        <ChevronRight
                          className={cn(
                            'h-3.5 w-3.5 transition-transform duration-200',
                            isActive ? 'text-gold' : 'text-muted/60 group-hover:text-gold group-hover:translate-x-0.5'
                          )}
                        />
                      </Link>
                    </li>
                  );
                })}

                {/* Sign Out Button */}
                <li className="pt-2">
                  <button
                    type="button"
                    onClick={async () => {
                      onClose();
                      if (onSignOut) await onSignOut();
                    }}
                    className="flex items-center justify-between w-full px-3.5 py-2.5 rounded-md text-sm font-sans text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out of Session</span>
                    </div>
                  </button>
                </li>
              </ul>
            </div>
          )}

          {/* DIRECT CONCIERGE ACCESS CARD */}
          <div className="p-3.5 rounded-lg bg-charcoal/40 border border-border/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gold/10 border border-gold/20 text-gold">
                <PhoneCall className="h-4 w-4" />
              </div>
              <div>
                <span className="block text-xs font-semibold text-primary font-sans">
                  VIP Concierge Liaison
                </span>
                <span className="text-[11px] text-secondary font-sans">
                  Direct Line: +44 20 7946 0991
                </span>
              </div>
            </div>
            <a
              href="tel:+442079460991"
              className="text-gold hover:text-gold-hover p-1"
              aria-label="Call concierge"
            >
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>

          {/* UNAUTHENTICATED ACTION BUTTONS */}
          {!isAuthenticated && (
            <div className="pt-4 border-t border-border/60 space-y-3">
              <Link href="/auth/login" onClick={onClose} className="block">
                <Button variant="secondary" size="md" fullWidth>
                  Sign In to Vault
                </Button>
              </Link>
              <Link href="/auth/register" onClick={onClose} className="block">
                <Button
                  variant="gold"
                  size="md"
                  fullWidth
                  rightIcon={<KeyRound className="h-4 w-4" />}
                >
                  Request Client Access
                </Button>
              </Link>
            </div>
          )}
        </nav>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* 3. FOOTER (Provenance & SSL Security Tag)                    */}
        {/* ───────────────────────────────────────────────────────────── */}
        <div className="p-4 border-t border-border/60 bg-charcoal/30 flex items-center justify-between text-[11px] font-sans text-muted">
          <span>TORQUENS MOTORS © {new Date().getFullYear()}</span>
          <div className="flex items-center gap-1 text-secondary">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald" />
            <span>Encrypted Session</span>
          </div>
        </div>
      </div>
    </div>
  );
}