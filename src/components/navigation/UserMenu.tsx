'use client';
/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  LogOut,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  Building2,
  Crown,
  KeyRound,
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';
import { userMenuItems, dealerMenuItems, adminMenuItems } from '@/data/navigation';

export type UserRole = 'CUSTOMER' | 'DEALER' | 'ADMIN' | 'CONCIERGE';

export interface UserMenuProps {
  user?: {
    id: string;
    name: string;
    email: string;
    role: 'CUSTOMER' | 'DEALER' | 'ADMIN';
    avatar?: string;
    tier?: string;
  } | null;
  isAuthenticated?: boolean;
  onSignOut?: () => void | Promise<void>;
  className?: string;
}

export function UserMenu({
  user,
  isAuthenticated = false,
  onSignOut,
  className,
}: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // ---------------------------------------------------------------------------
  // BUILT-IN FALLBACK SIGN OUT HANDLER
  // ---------------------------------------------------------------------------
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      if (onSignOut) {
        await onSignOut();
      } else {
        // Default NextAuth Sign Out fallback
        await signOut({ callbackUrl: '/' });
      }
    } catch (err) {
      console.error('Sign out failed:', err);
    } finally {
      setIsLoggingOut(false);
      setIsOpen(false);
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className={cn('hidden sm:flex items-center gap-2 shrink-0', className)}>
        <Link href="/auth/login">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs uppercase tracking-widest font-medium text-secondary hover:text-primary px-2.5"
          >
            Sign In
          </Button>
        </Link>
        <Link href="/auth/register">
          <Button
            variant="gold"
            size="sm"
            className="text-xs uppercase tracking-widest font-semibold whitespace-nowrap"
            rightIcon={<KeyRound className="h-3 w-3" />}
          >
            Client Access
          </Button>
        </Link>
      </div>
    );
  }

  const roleConfig: Record<
    string,
    { label: string; variant: BadgeVariant; icon: React.ReactNode }
  > = {
    ADMIN: {
      label: 'System Admin',
      variant: 'success',
      icon: <ShieldCheck className="h-3 w-3" />,
    },
    DEALER: {
      label: 'Certified Dealer',
      variant: 'gold',
      icon: <Building2 className="h-3 w-3" />,
    },
    CUSTOMER: {
      label: user.tier || 'Private Client',
      variant: 'gold',
      icon: <Crown className="h-3 w-3" />,
    },
    CONCIERGE: {
      label: 'VIP Liaison',
      variant: 'gold',
      icon: <Sparkles className="h-3 w-3" />,
    },
  };

  const currentRole =
    roleConfig[user.role?.toUpperCase()] || roleConfig.CUSTOMER;

  const menuItems =
    user.role?.toUpperCase() === 'ADMIN'
      ? adminMenuItems
      : user.role?.toUpperCase() === 'DEALER'
      ? dealerMenuItems
      : userMenuItems;

  const displayName = user.name?.split(' ')[0] || 'Client';
  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'PH';

  return (
    <div ref={menuRef} className={cn('relative shrink-0', className)}>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="Account menu"
        className={cn(
          'group flex items-center gap-2 max-w-40 lg:max-w-45',
          'pl-1 pr-2 py-1 rounded-full border transition-all duration-200 cursor-pointer',
          isOpen
            ? 'bg-charcoal border-gold/50 shadow-goldGlowSm'
            : 'bg-graphite/80 border-border hover:border-active-border hover:bg-charcoal/60'
        )}
      >
        <div className="relative h-8 w-8 shrink-0 rounded-full overflow-hidden border border-gold/40 bg-obsidian flex items-center justify-center">
          {user.avatar ? (
            <Image
              src={user.avatar}
              alt=""
              fill
              sizes="32px"
              className="object-cover"
            />
          ) : (
            <span className="font-serif text-[11px] text-gold tracking-tight">
              {initials}
            </span>
          )}
        </div>

        <div className="hidden sm:flex flex-col items-start min-w-0 flex-1 text-left leading-none overflow-hidden">
          <span className="text-xs font-semibold text-primary font-sans truncate w-full group-hover:text-gold transition-colors">
            {displayName}
          </span>
          <span className="text-[10px] text-gold font-mono uppercase tracking-wider mt-0.5 truncate w-full">
            {currentRole.label}
          </span>
        </div>

        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 shrink-0 text-muted transition-transform duration-200 group-hover:text-gold',
            isOpen && 'rotate-180 text-gold'
          )}
        />
      </button>

      {isOpen && (
        <div
          role="menu"
          className={cn(
            'absolute right-0 top-full mt-2 z-50',
            'w-[min(18rem,calc(100vw-1.5rem))]',
            'rounded-xl bg-graphite/95 backdrop-blur-xl border border-border/80 shadow-dropdown',
            'animate-in fade-in slide-in-from-top-2 duration-150 overflow-hidden'
          )}
        >
          <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/15 to-transparent pointer-events-none" />

          <div className="p-4 bg-charcoal/40 border-b border-border/60">
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="text-[10px] uppercase tracking-widest font-semibold text-muted font-sans">
                Active Session
              </span>
              <Badge
                variant={currentRole.variant}
                size="sm"
                className="shrink-0"
              >
                <span className="inline-flex items-center gap-1">
                  {currentRole.icon}
                  {currentRole.label}
                </span>
              </Badge>
            </div>

            <h4 className="font-serif text-base text-primary font-normal tracking-tight leading-snug wrap-break-word">
              {user.name}
            </h4>
            <p className="text-xs text-secondary font-mono mt-0.5 truncate">
              {user.email}
            </p>
          </div>

          <div className="py-1.5 px-1.5 max-h-[min(50vh,320px)] overflow-y-auto no-scrollbar">
            {menuItems.map((item, index) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={`${item.href}-${index}`}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  role="menuitem"
                  className={cn(
                    'group flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs font-sans font-medium transition-all duration-150',
                    isActive
                      ? 'bg-gold/10 text-gold font-semibold'
                      : 'text-secondary hover:text-primary hover:bg-charcoal/70'
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {item.icon && (
                      <span
                        className={cn(
                          'h-4 w-4 shrink-0',
                          isActive ? 'text-gold' : 'text-muted group-hover:text-gold'
                        )}
                      >
                        {item.icon}
                      </span>
                    )}
                    <span className="truncate">{item.label}</span>
                  </div>
                  {isActive && (
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold shadow-[0_0_8px_rgba(197,160,89,0.8)]" />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="p-1.5 border-t border-border/60 bg-charcoal/20">
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              role="menuitem"
              className={cn(
                'flex items-center justify-between w-full px-3 py-2 rounded-lg text-xs font-sans font-medium cursor-pointer',
                'text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              <div className="flex items-center gap-2.5">
                <LogOut className="h-4 w-4" />
                <span>
                  {isLoggingOut ? 'Signing out...' : 'Sign Out of Vault'}
                </span>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserMenu;