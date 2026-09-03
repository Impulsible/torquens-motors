'use client';

import React, { ReactNode, HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/utils/cn';
import {
  Check,
  AlertCircle,
  Clock,
  X,
  ShieldCheck,
  Sparkles,
  Zap,
  Lock,
  Award,
} from 'lucide-react';

export type BadgeVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'gold'
  | 'verified'
  | 'sold'
  | 'pending'
  | 'featured'
  | 'cpo'
  | 'electric'
  | 'reserved'
  | 'emerald'
  | 'glass';

export type BadgeSize = 'xs' | 'sm' | 'md' | 'lg';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children?: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  icon?: ReactNode; // Backward compatibility
  /** Displays a pulsating live status indicator dot */
  dot?: boolean;
  /** Adds subtle ambient shadow glow */
  glow?: boolean;
  /** Applies fully rounded pill shape (Default: true) */
  pill?: boolean;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      children,
      variant = 'default',
      size = 'md',
      className,
      leftIcon,
      rightIcon,
      icon,
      dot = false,
      glow = false,
      pill = true,
      ...props
    },
    ref
  ) => {
    // Variant Surface, Border, and Typography Styles
    const variantStyles: Record<BadgeVariant, string> = {
      default:
        'bg-charcoal/80 text-secondary border-border hover:border-active-border',
      success:
        'bg-emerald-bg text-emerald border-emerald-border',
      warning:
        'bg-amber-500/10 text-amber-400 border-amber-500/20',
      danger:
        'bg-red-500/10 text-red-400 border-red-500/20',
      info:
        'bg-blue-500/10 text-blue-400 border-blue-500/20',
      gold:
        'bg-gold/10 text-gold border-gold/30',
      verified:
        'bg-emerald-bg text-emerald border-emerald-border font-semibold',
      sold:
        'bg-red-500/15 text-red-400 border-red-500/30 uppercase tracking-widest',
      pending:
        'bg-amber-500/15 text-amber-400 border-amber-500/30',
      featured:
        'bg-gold text-obsidian border-gold font-bold shadow-goldGlowSm',
      cpo:
        'bg-blue-500/15 text-blue-300 border-blue-500/30 font-semibold',
      electric:
        'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
      reserved:
        'bg-purple-500/10 text-purple-300 border-purple-500/20',
      emerald:
        'bg-emerald-bg text-emerald border-emerald-border',
      glass:
        'bg-charcoal/40 backdrop-blur-md text-primary border-white/[0.08]',
    };

    // Dimensional Scale
    const sizeStyles: Record<BadgeSize, string> = {
      xs: 'px-1.5 py-0.5 text-[9px] gap-1',
      sm: 'px-2 py-0.5 text-[10px] gap-1',
      md: 'px-2.5 py-1 text-xs gap-1.5',
      lg: 'px-3 py-1.5 text-xs sm:text-sm gap-2',
    };

    // Icon Sizing Scale
    const iconSizeMap: Record<BadgeSize, string> = {
      xs: 'w-2.5 h-2.5',
      sm: 'w-3 h-3',
      md: 'w-3.5 h-3.5',
      lg: 'w-4 h-4',
    };

    // Default Auto-Injected Icons
    const defaultIcons: Partial<Record<BadgeVariant, ReactNode>> = {
      verified: <ShieldCheck className={iconSizeMap[size]} />,
      sold: <X className={iconSizeMap[size]} />,
      pending: <Clock className={iconSizeMap[size]} />,
      warning: <AlertCircle className={iconSizeMap[size]} />,
      danger: <X className={iconSizeMap[size]} />,
      featured: <Sparkles className={iconSizeMap[size]} />,
      cpo: <Award className={iconSizeMap[size]} />,
      electric: <Zap className={iconSizeMap[size]} />,
      reserved: <Lock className={iconSizeMap[size]} />,
      success: <Check className={iconSizeMap[size]} />,
    };

    // Use leftIcon, then icon (backward compatibility), then default icon
    const iconToShow = leftIcon || icon || defaultIcons[variant];

    // Ambient Glow Shadow Utility
    const glowStyles = glow
      ? variant === 'featured' || variant === 'gold'
        ? 'shadow-[0_0_12px_rgba(197,160,89,0.3)]'
        : variant === 'verified' || variant === 'success' || variant === 'emerald'
        ? 'shadow-[0_0_12px_rgba(16,185,129,0.25)]'
        : 'shadow-lg'
      : '';

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center border font-sans tracking-wide transition-all duration-200 select-none backdrop-blur-sm',
          pill ? 'rounded-full' : 'rounded-md',
          variantStyles[variant],
          sizeStyles[size],
          glowStyles,
          className
        )}
        {...props}
      >
        {/* Optional Pulsating Live Indicator Dot */}
        {dot && (
          <span className="relative flex h-2 w-2 items-center justify-center">
            <span
              className={cn(
                'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
                variant === 'verified' || variant === 'success' || variant === 'emerald' 
                  ? 'bg-emerald' 
                  : variant === 'gold' || variant === 'featured' 
                  ? 'bg-gold' 
                  : 'bg-current'
              )}
            />
            <span
              className={cn(
                'relative inline-flex rounded-full h-1.5 w-1.5',
                variant === 'verified' || variant === 'success' || variant === 'emerald' 
                  ? 'bg-emerald' 
                  : variant === 'gold' || variant === 'featured' 
                  ? 'bg-gold' 
                  : 'bg-current'
              )}
            />
          </span>
        )}

        {/* Render Icon if present */}
        {iconToShow && (
          <span className="shrink-0 flex items-center">
            {iconToShow}
          </span>
        )}

        {/* Badge Content */}
        {children && (
          <span className="whitespace-nowrap">{children}</span>
        )}

        {/* Right Icon if present */}
        {rightIcon && (
          <span className="shrink-0 flex items-center">
            {rightIcon}
          </span>
        )}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;