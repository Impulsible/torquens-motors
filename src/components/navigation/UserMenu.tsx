'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
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

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole | string;
  avatar?: string | null;
  tier?: string;
}

export interface UserMenuProps {
  user?: {
    tier: string;
    id: string;
    name: string;
    email: string;
    role: 'CUSTOMER' | 'DEALER' | 'ADMIN';
    avatar?: string;
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

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      if (onSignOut) {
        await onSignOut();
      }
    } finally {
      setIsLoggingOut(false);
      setIsOpen(false);
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className={cn('flex items-center gap-2.5', className)}>
        <Link href="/auth/login" className="cursor-pointer">
          <Button variant="ghost" size="sm" className="text-xs uppercase tracking-wider font-semibold">
            Sign In
          </Button>
        </Link>
        <Link href="/auth/register" className="cursor-pointer">
          <Button
            variant="gold"
            size="sm"
            rightIcon={<KeyRound className="h-3 w-3" />}
            className="text-xs uppercase tracking-wider font-semibold"
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
    ADMIN: { label: 'System Admin', variant: 'success', icon: <ShieldCheck className="h-3 w-3" /> },
    DEALER: { label: 'Certified Dealer', variant: 'gold', icon: <Building2 className="h-3 w-3" /> },
    CUSTOMER: { label: user.tier || 'Private Client', variant: 'gold', icon: <Crown className="h-3 w-3" /> },
    CONCIERGE: { label: 'VIP Liaison', variant: 'gold', icon: <Sparkles className="h-3 w-3" /> },
  };

  const currentRole = roleConfig[user.role?.toUpperCase()] || roleConfig.CUSTOMER;

  const getMenuItems = () => {
    switch (user.role?.toUpperCase()) {
      case 'ADMIN':
        return adminMenuItems;
      case 'DEALER':
        return dealerMenuItems;
      default:
        return userMenuItems;
    }
  };

  const menuItems = getMenuItems();

  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'VI';

  return (
    <div ref={menuRef} className={cn('relative select-none', className)}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="User account and navigation menu"
        className={cn(
          'group flex items-center gap-2.5 p-1 sm:pr-3 rounded-full border transition-all duration-300 cursor-pointer',
          isOpen
            ? 'bg-charcoal border-gold/50 shadow-goldGlowSm'
            : 'bg-graphite/80 border-border hover:border-active-border hover:bg-charcoal/60'
        )}
      >
        <div className="relative h-8 w-8 rounded-full overflow-hidden border border-gold/40 p-0.5 bg-obsidian flex items-center justify-center shrink-0">
          {user.avatar ? (
            <Image
              src={user.avatar}
              alt={user.name}
              fill
              className="object-cover rounded-full"
            />
          ) : (
            <span className="font-serif text-xs text-gold font-normal tracking-tight">
              {initials}
            </span>
          )}
        </div>

        <div className="hidden sm:flex flex-col items-start text-left leading-none">
          <span className="text-xs font-semibold text-primary font-sans truncate max-w-27.5 group-hover:text-gold transition-colors">
            {user.name}
          </span>
          <span className="text-[10px] text-muted font-sans font-medium mt-0.5">
            {currentRole.label}
          </span>
        </div>

        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 text-muted transition-transform duration-300 group-hover:text-gold',
            isOpen && 'rotate-180 text-gold'
          )}
        />
      </button>

      {isOpen && (
        <div
          role="menu"
          className={cn(
            'absolute right-0 mt-3 w-72 rounded-xl bg-graphite/95 backdrop-blur-2xl border border-border/80 shadow-dropdown',
            'animate-slide-up duration-200 z-50 overflow-hidden'
          )}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/15 to-transparent z-10"
          />

          <div className="p-4 bg-charcoal/40 border-b border-border/60">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-semibold tracking-widest text-muted font-sans">
                Active Client Session
              </span>
              <Badge variant={currentRole.variant} size="sm" leftIcon={currentRole.icon}>
                {currentRole.label}
              </Badge>
            </div>

            <h4 className="mt-2.5 font-serif text-base text-primary font-normal tracking-tight truncate">
              {user.name}
            </h4>
            <p className="text-xs text-secondary font-mono truncate mt-0.5">{user.email}</p>
          </div>

          <div className="py-2 px-1.5 space-y-0.5">
            {menuItems.map((item, index) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={`${item.href}-${index}`}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  role="menuitem"
                  className={cn(
                    'group relative flex items-center justify-between px-3 py-2 rounded-md text-xs font-sans font-medium transition-all duration-200 cursor-pointer',
                    isActive
                      ? 'bg-gold/10 text-gold font-semibold'
                      : 'text-secondary hover:text-primary hover:bg-charcoal/70'
                  )}
                >
                  <div className="flex items-center gap-2.5 truncate">
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
                    <span className="truncate">{item.label}</span>
                  </div>

                  {isActive && (
                    <span className="h-1.5 w-1.5 rounded-full bg-gold shadow-[0_0_8px_rgba(197,160,89,0.8)]" />
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
                'group flex items-center justify-between w-full px-3 py-2 rounded-md text-xs font-sans font-medium cursor-pointer',
                'text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              <div className="flex items-center gap-2.5">
                <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                <span>{isLoggingOut ? 'Terminating Session...' : 'Sign Out of Vault'}</span>
              </div>

              <span className="text-[10px] font-mono text-muted/60 uppercase">ESC</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}