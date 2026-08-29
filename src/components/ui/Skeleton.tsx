import React, { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                   */
/* -------------------------------------------------------------------------- */

export type SkeletonVariant =
  | 'text'
  | 'circle'
  | 'rectangular'
  | 'image'
  | 'badge'
  | 'button'
  | 'card';

export type SkeletonAnimation = 'shimmer' | 'pulse' | 'none';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant;
  animation?: SkeletonAnimation;
  width?: string | number;
  height?: string | number;
  /** Number of text lines to generate when variant="text" */
  lines?: number;
  /** Adds a microscopic gold metallic warmth to the shimmer wave */
  goldTint?: boolean;
}

/* -------------------------------------------------------------------------- */
/*                               SKELETON ROOT                                */
/* -------------------------------------------------------------------------- */

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      variant = 'rectangular',
      animation = 'shimmer',
      width,
      height,
      lines = 1,
      goldTint = false,
      className,
      style,
      ...props
    },
    ref
  ) => {
    // 📐 Geometry & Preset Sizing Architecture
    const variantStyles: Record<SkeletonVariant, string> = {
      text: 'h-4 w-full rounded-[4px]',
      circle: 'rounded-full aspect-square',
      rectangular: 'rounded-md',
      image: 'rounded-lg aspect-[16/10] w-full',
      badge: 'h-6 w-20 rounded-full',
      button: 'h-11 w-32 rounded-md',
      card: 'rounded-lg border border-border/40 p-6',
    };

    // 🏎️ Precision Shimmer & Pulse Animation Mechanics
    const animationStyles: Record<SkeletonAnimation, string> = {
      shimmer: cn(
        'relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full',
        'before:animate-[shimmer_2s_infinite_linear]',
        goldTint
          ? 'before:bg-gradient-to-r before:from-transparent before:via-gold/10 before:to-transparent'
          : 'before:bg-gradient-to-r before:from-transparent before:via-white/[0.07] before:to-transparent'
      ),
      pulse: 'animate-pulse duration-1000',
      none: '',
    };

    const normalizeDimension = (val?: string | number) =>
      typeof val === 'number' ? `${val}px` : val;

    const inlineStyles: React.CSSProperties = {
      width: normalizeDimension(width),
      height: normalizeDimension(height),
      ...style,
    };

    // Multi-line text generator
    if (variant === 'text' && lines > 1) {
      return (
        <div
          ref={ref}
          role="status"
          aria-label="Loading..."
          className={cn('flex flex-col space-y-2.5 w-full', className)}
          {...props}
        >
          {Array.from({ length: lines }).map((_, index) => {
            const isLastLine = index === lines - 1;
            return (
              <div
                key={index}
                className={cn(
                  'bg-charcoal/70',
                  variantStyles.text,
                  animationStyles[animation]
                )}
                style={{
                  ...inlineStyles,
                  width: isLastLine && !width ? '65%' : inlineStyles.width,
                }}
              />
            );
          })}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        role="status"
        aria-label="Loading..."
        className={cn(
          'bg-charcoal/70 border border-white/2',
          variantStyles[variant],
          animationStyles[animation],
          className
        )}
        style={inlineStyles}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';


/* -------------------------------------------------------------------------- */
/*                    PRE-COMPOSED SHOWROOM SKELETONS                         */
/* -------------------------------------------------------------------------- */

/**
 * High-Fidelity Skeleton matching the exact layout of VehicleCard.tsx
 */
export function VehicleCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label="Loading vehicle dossier..."
      className={cn(
        'flex flex-col h-full rounded-lg border border-border/70 bg-graphite overflow-hidden shadow-card',
        className
      )}
    >
      {/* Media Aspect Container */}
      <div className="relative aspect-16/10 w-full bg-charcoal">
        <Skeleton variant="rectangular" className="h-full w-full rounded-none" />
        
        {/* Floating Top Badges */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex justify-between z-10">
          <Skeleton variant="badge" className="w-20" />
          <Skeleton variant="badge" className="w-14" />
        </div>
      </div>

      {/* Content Chassis */}
      <div className="flex flex-col flex-1 p-5 justify-between">
        <div className="space-y-3">
          {/* Eyebrow + Location */}
          <div className="flex justify-between items-center">
            <Skeleton width={70} height={12} />
            <Skeleton width={90} height={12} />
          </div>

          {/* Model Title */}
          <Skeleton width="80%" height={22} className="rounded" />

          {/* Acquisition Price */}
          <div className="flex justify-between items-baseline pt-1">
            <Skeleton width={90} height={12} />
            <Skeleton width={110} height={20} />
          </div>

          {/* Inset Technical Specs Grid */}
          <div className="grid grid-cols-3 gap-2 p-2.5 rounded-md bg-inset border border-border/70 mt-3">
            <div className="space-y-1.5">
              <Skeleton width="60%" height={10} />
              <Skeleton width="90%" height={14} />
            </div>
            <div className="space-y-1.5 border-x border-border/60 px-2">
              <Skeleton width="60%" height={10} />
              <Skeleton width="90%" height={14} />
            </div>
            <div className="space-y-1.5 pl-1">
              <Skeleton width="60%" height={10} />
              <Skeleton width="90%" height={14} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3.5 border-t border-border/60 flex items-center justify-between">
          <Skeleton width={80} height={12} />
          <Skeleton variant="button" className="h-7 w-20 rounded-sm" />
        </div>
      </div>
    </div>
  );
}

/**
 * Grid of Vehicle Card Skeletons for inventory loading states
 */
export function VehicleGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid-vehicles">
      {Array.from({ length: count }).map((_, index) => (
        <VehicleCardSkeleton key={index} />
      ))}
    </div>
  );
}