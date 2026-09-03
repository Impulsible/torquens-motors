'use client';

import React, { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                   */
/* -------------------------------------------------------------------------- */

export type ButtonVariant =
  | 'primary'
  | 'gold'
  | 'secondary'
  | 'outline'
  | 'glass'
  | 'ghost'
  | 'success'
  | 'danger';

export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

/* -------------------------------------------------------------------------- */
/*                               BUTTON ROOT                                  */
/* -------------------------------------------------------------------------- */

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      isLoading = false,
      loadingText,
      leftIcon,
      rightIcon,
      className,
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    // 🎨 Bespoke Variant Aesthetics tailored to the Dark Luxury Palette
    const variantStyles: Record<ButtonVariant, string> = {
      // High-Contrast Platinum / Titanium Solid
      primary: cn(
        'bg-primary text-obsidian font-semibold',
        'border border-white/20 shadow-md',
        'hover:bg-white hover:shadow-[0_0_25px_-5px_rgba(248,249,250,0.35)]',
        'active:brightness-95'
      ),

      // Radiant Gold Metallic Gradient & Ambient Glow
      gold: cn(
        'relative bg-gradient-to-r from-[#C5A059] via-[#E2B96C] to-[#C5A059] bg-[length:200%_auto]',
        'text-obsidian font-semibold',
        'border border-gold/40 shadow-sm',
        'hover:bg-[position:right_center] hover:shadow-goldGlow hover:border-gold-hover',
        'active:brightness-95'
      ),

      // Graphite Chassis with Precision Metallic Chamfer
      secondary: cn(
        'bg-charcoal text-primary font-medium',
        'border border-border/80 shadow-card',
        'hover:bg-graphite hover:border-gold/50 hover:text-gold hover:shadow-goldGlowSm',
        'active:bg-inset'
      ),

      // Crisp Gold Wireframe Frame
      outline: cn(
        'bg-transparent text-gold font-medium',
        'border border-gold/60',
        'hover:bg-gold/10 hover:border-gold hover:shadow-goldGlowSm hover:text-gold-hover',
        'active:bg-gold/20'
      ),

      // Frosted Glassmorphic Panel
      glass: cn(
        'bg-charcoal/40 backdrop-blur-md text-primary font-medium',
        'border border-white/[0.08]',
        'hover:bg-charcoal/70 hover:border-gold/30 hover:text-gold',
        'active:bg-charcoal/90'
      ),

      // Understated Minimalist Luxury
      ghost: cn(
        'bg-transparent text-secondary font-medium',
        'hover:text-primary hover:bg-charcoal/60',
        'active:bg-charcoal'
      ),

      // Certified / Verified Emerald
      success: cn(
        'bg-emerald text-obsidian font-semibold',
        'border border-emerald/40',
        'hover:bg-emerald/90 hover:shadow-[0_0_25px_-5px_rgba(16,185,129,0.4)]',
        'active:brightness-95'
      ),

      // Translucent Ruby Crimson
      danger: cn(
        'bg-red-500/10 text-red-400 font-medium',
        'border border-red-500/30',
        'hover:bg-red-600 hover:text-white hover:border-red-600 hover:shadow-[0_0_25px_-5px_rgba(220,38,38,0.4)]',
        'active:bg-red-700'
      ),
    };

    // 📐 Precision Sizing & Automotive Ergonomics
    const sizeStyles: Record<ButtonSize, string> = {
      sm: 'h-9 px-3.5 text-xs tracking-wider uppercase font-semibold gap-1.5 rounded-[5px]',
      md: 'h-11 px-5 text-sm tracking-wide gap-2.5 rounded-md font-medium',
      lg: 'h-13 px-7 text-base tracking-wide gap-3 rounded-md font-medium',
      xl: 'h-14 px-9 text-lg tracking-wide gap-3.5 rounded-lg font-medium',
    };

    const iconSizes: Record<ButtonSize, string> = {
      sm: 'h-3.5 w-3.5',
      md: 'h-4 w-4',
      lg: 'h-5 w-5',
      xl: 'h-5.5 w-5.5',
    };

    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={isLoading}
        className={cn(
          // Layout & Ergonomics
          'group relative inline-flex items-center justify-center select-none font-sans whitespace-nowrap',
          // Hand cursor when active, Not-Allowed cursor when disabled
          'cursor-pointer disabled:cursor-not-allowed',
          // Luxury Spring Physics & Transitions
          'transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
          'active:scale-[0.985] active:duration-100',
          // Accessible Focus Rings
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-obsidian',
          // Disabled Visual Style
          'disabled:opacity-40 disabled:grayscale-30',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {/* Specular Light Sheen Highlight for Gold & Primary variants */}
        {(variant === 'gold' || variant === 'primary') && !isDisabled && (
          <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
            <span className="absolute -left-full top-0 h-full w-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-all duration-1000 group-hover:left-full" />
          </span>
        )}

        {/* Loading Spinner & Status Handling */}
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <Loader2 className={cn('animate-spin text-current shrink-0', iconSizes[size])} />
            <span>{loadingText || children || 'Loading...'}</span>
          </div>
        ) : (
          <>
            {leftIcon && (
              <span
                className={cn(
                  'inline-flex shrink-0 transition-transform duration-300 group-hover:-translate-x-0.5',
                  iconSizes[size]
                )}
              >
                {leftIcon}
              </span>
            )}

            <span className="truncate">{children}</span>

            {rightIcon && (
              <span
                className={cn(
                  'inline-flex shrink-0 transition-transform duration-300 group-hover:translate-x-0.5',
                  iconSizes[size]
                )}
              >
                {rightIcon}
              </span>
            )}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';