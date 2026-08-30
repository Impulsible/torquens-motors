'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  X,
  LogOut,
  Building2,
  ShieldCheck,
  Crown,
  PhoneCall,
  ChevronRight,
  KeyRound,
  ArrowUpRight,
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';
import { mainNavItems, userMenuItems, dealerMenuItems, adminMenuItems } from '@/data/navigation';

export type UserRole = 'CUSTOMER' | 'DEALER' | 'ADMIN' | 'CONCIERGE';

export interface UserProfile {
  name: string;
  email: string;
  role: UserRole | string;
  avatar?: string | null;
  tier?: string;
}

export interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  isAuthenticated?: boolean;
  user?: UserProfile | null;
  onSignOut?: () => void | Promise<void>;
  className?: string;
}

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
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const roleConfig: Record<
    string,
    { label: string; variant: BadgeVariant; icon: React.ReactNode; dashboardHref: string }
  > = {
    ADMIN: {
      label: 'System Admin',
      variant: 'success',
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

  const handleSignOut = async () => {
    onClose();
    if (onSignOut) {
      await onSignOut();
    } else {
      await signOut({ callbackUrl: '/' });
    }
  };

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
      className="fixed inset-0 z-100 flex justify-end bg-obsidian/85 backdrop-blur-xl lg:hidden animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-10 right-0 w-72 h-72 bg-gold/10 blur-[100px] rounded-full"
      />

      <div
        ref={drawerRef}
        className={cn(
          'relative flex flex-col w-full max-w-[320px] sm:max-w-sm h-full bg-graphite border-l border-border/80 shadow-dropdown',
          'animate-in slide-in-from-right duration-300 overflow-hidden',
          className
        )}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-transparent via-white/15 to-transparent z-20"
        />

        <div className="flex items-center justify-between p-5 border-b border-border/60 bg-charcoal/30 shrink-0">
          <Link href="/" onClick={onClose} className="flex items-center gap-1.5 cursor-pointer focus:outline-none group">
            <span className="font-serif text-xl tracking-tight text-primary group-hover:text-gold transition-colors">
              TORQUENS
            </span>
            <span className="font-sans text-[10px] uppercase tracking-widest font-extrabold text-gold mt-0.5">
              MOTORS
            </span>
          </Link>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-border/80 text-muted hover:text-primary hover:border-active-border hover:bg-charcoal transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-5 space-y-6 no-scrollbar">
          {isAuthenticated && user && (
            <div className="p-3.5 rounded-xl bg-inset border border-border/70 shadow-inner">
              <div className="flex items-center gap-3">
                <div className="relative h-11 w-11 rounded-full overflow-hidden border border-gold/40 p-0.5 bg-obsidian shrink-0 flex items-center justify-center">
                  {user.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={user.name}
                      fill
                      sizes="44px"
                      className="object-cover rounded-full"
                    />
                  ) : (
                    <span className="font-serif text-sm text-gold">{initials}</span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="font-serif text-sm font-medium text-primary truncate">
                      {user.name}
                    </h4>
                    <Badge variant={activeRole.variant} size="xs" className="shrink-0 hidden sm:inline-flex">
                      {activeRole.label}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted font-mono truncate mt-0.5">{user.email}</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <span className="block text-[10px] uppercase tracking-widest font-semibold text-muted font-sans mb-2.5 px-2">
              Curated Showroom
            </span>
            <ul className="space-y-1">
              {mainNavItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        'group flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-sans font-medium transition-all duration-200 cursor-pointer',
                        isActive
                          ? 'bg-gold/10 text-gold border-l-2 border-gold font-semibold shadow-sm'
                          : 'text-secondary hover:text-primary hover:bg-charcoal/70 border-l-2 border-transparent'
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
                          isActive ? 'text-gold' : 'text-muted/50 group-hover:text-gold group-hover:translate-x-0.5'
                        )}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {isAuthenticated && (
            <div className="pt-5 border-t border-border/60">
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
                          'group flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-sans font-medium transition-all duration-200 cursor-pointer',
                          isActive
                            ? 'bg-gold/10 text-gold border-l-2 border-gold font-semibold'
                            : 'text-secondary hover:text-primary hover:bg-charcoal/70 border-l-2 border-transparent'
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
                            isActive ? 'text-gold' : 'text-muted/50 group-hover:text-gold group-hover:translate-x-0.5'
                          )}
                        />
                      </Link>
                    </li>
                  );
                })}

                <li className="pt-2">
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex items-center justify-between w-full px-3.5 py-2.5 rounded-lg text-sm font-sans font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer border-l-2 border-transparent"
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

          <div className="p-4 rounded-xl bg-charcoal/40 border border-border/80 flex items-center justify-between hover:border-gold/30 transition-colors">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold/10 border border-gold/20 text-gold shrink-0">
                <PhoneCall className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <span className="block text-xs font-semibold text-primary font-sans">
                  VIP Concierge Liaison
                </span>
                <span className="text-[10px] text-secondary font-sans block mt-0.5">
                  Direct Line: +234 800 TORQUENS
                </span>
              </div>
            </div>
            <a
              href="tel:+234800TORQUENS"
              className="text-gold hover:text-gold-hover p-1.5 cursor-pointer shrink-0"
              aria-label="Call concierge"
            >
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </nav>

        {!isAuthenticated && (
          <div className="p-5 border-t border-border/60 bg-charcoal/30 space-y-3 shrink-0">
            <Link href="/auth/login" onClick={onClose} className="block cursor-pointer">
              <Button variant="secondary" size="md" fullWidth className="text-xs">
                Sign In to Vault
              </Button>
            </Link>
            <Link href="/auth/register" onClick={onClose} className="block cursor-pointer">
              <Button
                variant="gold"
                size="md"
                fullWidth
                className="text-xs uppercase tracking-widest font-semibold"
                rightIcon={<KeyRound className="h-4 w-4" />}
              >
                Request Access
              </Button>
            </Link>
          </div>
        )}

        <div className="p-4 border-t border-border/60 bg-obsidian flex items-center justify-between text-[10px] font-sans text-muted shrink-0">
          <span>TORQUENS © {new Date().getFullYear()}</span>
          <div className="flex items-center gap-1.5 text-secondary">
            <ShieldCheck className="h-3 w-3 text-emerald" />
            <span>Encrypted Session</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MobileMenu;