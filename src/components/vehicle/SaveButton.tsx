'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Heart, Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { cn } from '@/utils/cn';
// ✅ Use the correct export name
import { toggleSaveVehicle, checkIsSaved } from '@/actions/saved-vehicles';
import { useToast } from '@/hooks/useToast';

export interface SaveButtonProps {
  vehicleId: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  variant?: 'button' | 'icon' | 'glass';
  onSaveChange?: (saved: boolean) => void;
  initialSaved?: boolean;
}

const SIZE_CONFIGS = {
  sm: {
    icon: 'h-3.5 w-3.5',
    button: 'text-xs px-3 py-1.5 gap-1.5',
    iconWrapper: 'h-8 w-8',
  },
  md: {
    icon: 'h-4 w-4',
    button: 'text-xs uppercase tracking-widest px-4 py-2.5 gap-2',
    iconWrapper: 'h-10 w-10',
  },
  lg: {
    icon: 'h-5 w-5',
    button: 'text-sm uppercase tracking-widest px-6 py-3.5 gap-2.5',
    iconWrapper: 'h-12 w-12',
  },
} as const;

export function SaveButton({
  vehicleId,
  className,
  size = 'md',
  showLabel = true,
  variant = 'button',
  onSaveChange,
  initialSaved = false,
}: SaveButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { status } = useSession();
  const { showToast } = useToast();

  const [isSaved, setIsSaved] = useState(initialSaved);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Sync initial bookmark status
  useEffect(() => {
    let isMounted = true;

    const checkSaved = async () => {
      if (status === 'authenticated' && vehicleId) {
        try {
          const result = await checkIsSaved(vehicleId);
          if (isMounted && result.success) {
            setIsSaved(result.data);
          }
        } catch (error) {
          console.error('[SaveButton] Check saved status failed:', error);
        } finally {
          if (isMounted) setIsInitialized(true);
        }
      } else {
        if (isMounted) setIsInitialized(true);
      }
    };

    checkSaved();

    return () => {
      isMounted = false;
    };
  }, [vehicleId, status]);

  const handleToggleSave = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();

      // Guard: Unauthenticated state redirects to login with preserved callbackUrl
      if (status === 'unauthenticated') {
        showToast({
          type: 'warning',
          title: 'Private Vault Access Required',
          message: 'Please authenticate to curate vehicles in your private portfolio.',
        });
        const currentUrl = encodeURIComponent(pathname || '/');
        router.push(`/auth/login?callbackUrl=${currentUrl}`);
        return;
      }

      if (!isInitialized || isLoading) return;

      // 1. Optimistic UI update
      const previousState = isSaved;
      const nextState = !previousState;

      setIsSaved(nextState);
      setIsAnimating(true);
      setIsLoading(true);
      onSaveChange?.(nextState);

      // Trigger pop micro-animation timeout
      setTimeout(() => setIsAnimating(false), 450);

      try {
        const result = await toggleSaveVehicle(vehicleId);

        if (result.success) {
          const newSavedState = result.data?.saved || false;
          setIsSaved(newSavedState);
          onSaveChange?.(newSavedState);
          showToast({
            type: 'success',
            title: newSavedState ? 'Allocation Bookmarked' : 'Allocation Removed',
            message: newSavedState
              ? 'Vehicle successfully registered to your private vault.'
              : 'Vehicle removed from your saved portfolio.',
          });
        } else {
          // Rollback on server rejection
          setIsSaved(previousState);
          onSaveChange?.(previousState);
          showToast({
            type: 'error',
            title: 'Vault Update Failed',
            message: result.message || 'Unable to update your saved portfolio.',
          });
        }
      } catch (error) {
        // Rollback on network/runtime error
        console.error('[SaveButton] Toggle save error:', error);
        setIsSaved(previousState);
        onSaveChange?.(previousState);
        showToast({
          type: 'error',
          title: 'Network Exception',
          message: 'An unexpected connection error occurred. Please try again.',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [status, isInitialized, isLoading, isSaved, onSaveChange, vehicleId, showToast, pathname, router]
  );

  const sizeConfig = SIZE_CONFIGS[size];

  // ─────────────────────────────────────────────────────────────
  // VARIANT: Icon Pill (Ideal for vehicle grid cards)
  // ─────────────────────────────────────────────────────────────
  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={handleToggleSave}
        disabled={!isInitialized}
        aria-pressed={isSaved}
        aria-label={isSaved ? 'Remove vehicle from private vault' : 'Save vehicle to private vault'}
        className={cn(
          'group relative flex items-center justify-center rounded-full border transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/60',
          sizeConfig.iconWrapper,
          isSaved
            ? 'bg-obsidian/90 border-gold/50 text-gold shadow-[0_0_20px_rgba(212,175,55,0.25)]'
            : 'bg-obsidian/60 backdrop-blur-md border-white/10 text-muted hover:border-gold/40 hover:text-primary hover:bg-graphite/80',
          isAnimating && 'scale-110',
          !isInitialized && 'opacity-50 cursor-not-allowed',
          className
        )}
      >
        <Heart
          className={cn(
            sizeConfig.icon,
            'transition-all duration-300 ease-out',
            isSaved ? 'fill-gold text-gold stroke-gold' : 'fill-transparent group-hover:scale-110'
          )}
        />
      </button>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // VARIANT: Glass Floating Pill (Ideal for hero details/overlays)
  // ─────────────────────────────────────────────────────────────
  if (variant === 'glass') {
    return (
      <button
        type="button"
        onClick={handleToggleSave}
        disabled={!isInitialized}
        aria-pressed={isSaved}
        aria-label={isSaved ? 'Remove vehicle from private vault' : 'Save vehicle to private vault'}
        className={cn(
          'group inline-flex items-center justify-center rounded-full border backdrop-blur-xl transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/60 font-mono select-none',
          sizeConfig.button,
          isSaved
            ? 'bg-gold/15 border-gold/40 text-gold shadow-[0_0_25px_rgba(212,175,55,0.2)]'
            : 'bg-obsidian/50 border-white/10 text-secondary hover:text-primary hover:border-gold/30 hover:bg-obsidian/80',
          isAnimating && 'scale-105',
          !isInitialized && 'opacity-50 cursor-not-allowed',
          className
        )}
      >
        {isLoading ? (
          <Loader2 className={cn(sizeConfig.icon, 'animate-spin text-gold')} />
        ) : (
          <Heart
            className={cn(
              sizeConfig.icon,
              'transition-all duration-300 ease-out',
              isSaved ? 'fill-gold text-gold' : 'fill-transparent group-hover:text-gold group-hover:scale-110'
            )}
          />
        )}
        {showLabel && (
          <span className="font-semibold">{isSaved ? 'Bookmarked' : 'Bookmark'}</span>
        )}
      </button>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // VARIANT: Standard Button (Editorial CTA)
  // ─────────────────────────────────────────────────────────────
  return (
    <button
      type="button"
      onClick={handleToggleSave}
      disabled={!isInitialized}
      aria-pressed={isSaved}
      aria-label={isSaved ? 'Remove vehicle from private vault' : 'Save vehicle to private vault'}
      className={cn(
        'group relative inline-flex items-center justify-center rounded-md font-sans font-medium transition-all duration-300 ease-out border focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/60 select-none overflow-hidden',
        sizeConfig.button,
        isSaved
          ? 'bg-gold text-obsidian border-gold hover:bg-gold-hover shadow-[0_0_20px_rgba(212,175,55,0.3)] font-semibold'
          : 'bg-graphite/60 border-border/80 text-secondary hover:text-primary hover:border-gold/40 hover:bg-graphite/90',
        isAnimating && 'scale-[1.02]',
        !isInitialized && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {/* Subtle metallic sheen highlight on saved state */}
      {isSaved && (
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-r from-transparent via-white/25 to-transparent -translate-x-full animate-[shimmer_2.5s_infinite]"
        />
      )}

      {isLoading ? (
        <Loader2 className={cn(sizeConfig.icon, 'animate-spin', isSaved ? 'text-obsidian' : 'text-gold')} />
      ) : (
        <Heart
          className={cn(
            sizeConfig.icon,
            'transition-transform duration-300 ease-out',
            isSaved ? 'fill-obsidian text-obsidian' : 'fill-transparent group-hover:scale-110 text-muted group-hover:text-gold'
          )}
        />
      )}

      {showLabel && (
        <span>
          {isLoading
            ? 'Updating...'
            : isSaved
            ? 'Vault Curated'
            : 'Save to Vault'}
        </span>
      )}
    </button>
  );
}

export default SaveButton;