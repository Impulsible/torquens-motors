import React, { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                   */
/* -------------------------------------------------------------------------- */

export type SpinnerVariant = 'gold' | 'primary' | 'white' | 'emerald' | 'muted';
export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface LoadingSpinnerProps extends HTMLAttributes<HTMLDivElement> {
  variant?: SpinnerVariant;
  size?: SpinnerSize;
  /** Optional telemetry or status text beneath the spinner */
  label?: string;
  /** Full-screen centered overlay with obsidian glassmorphic backdrop */
  fullScreen?: boolean;
  /** Adds an ambient radial glow around the spinner */
  glow?: boolean;
}

/* -------------------------------------------------------------------------- */
/*                            LOADING SPINNER ROOT                            */
/* -------------------------------------------------------------------------- */

export const LoadingSpinner = forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  (
    {
      variant = 'gold',
      size = 'md',
      label,
      fullScreen = false,
      glow = true,
      className,
      ...props
    },
    ref
  ) => {
    // 🎨 Color Treatments tailored to the Dark Luxury Palette
    const variantStyles: Record<
      SpinnerVariant,
      { track: string; head: string; glow: string; text: string }
    > = {
      // Radiant Gold Metallic
      gold: {
        track: 'stroke-gold/15',
        head: 'stroke-gold',
        glow: 'drop-shadow-[0_0_12px_rgba(197,160,89,0.35)]',
        text: 'text-gold',
      },
      // Platinum White
      primary: {
        track: 'stroke-white/10',
        head: 'stroke-primary',
        glow: 'drop-shadow-[0_0_12px_rgba(248,249,250,0.25)]',
        text: 'text-primary',
      },
      white: {
        track: 'stroke-white/10',
        head: 'stroke-white',
        glow: 'drop-shadow-[0_0_12px_rgba(255,255,255,0.25)]',
        text: 'text-white',
      },
      // Certified Emerald
      emerald: {
        track: 'stroke-emerald/15',
        head: 'stroke-emerald',
        glow: 'drop-shadow-[0_0_12px_rgba(16,185,129,0.35)]',
        text: 'text-emerald',
      },
      // Understated Charcoal Muted
      muted: {
        track: 'stroke-border',
        head: 'stroke-secondary',
        glow: '',
        text: 'text-secondary',
      },
    };

    // 📐 Sizing Architecture
    const sizeStyles: Record<
      SpinnerSize,
      { spinner: string; strokeWidth: number; labelText: string }
    > = {
      xs: { spinner: 'h-3.5 w-3.5', strokeWidth: 3.5, labelText: 'text-[10px]' },
      sm: { spinner: 'h-5 w-5', strokeWidth: 3, labelText: 'text-xs' },
      md: { spinner: 'h-8 w-8', strokeWidth: 2.5, labelText: 'text-xs' },
      lg: { spinner: 'h-12 w-12', strokeWidth: 2, labelText: 'text-sm' },
      xl: { spinner: 'h-16 w-16', strokeWidth: 1.75, labelText: 'text-base' },
    };

    const currentVariant = variantStyles[variant];
    const currentSize = sizeStyles[size];

    const spinnerContent = (
      <div
        ref={ref}
        role="status"
        aria-live="polite"
        className={cn(
          'inline-flex flex-col items-center justify-center gap-3 select-none',
          className
        )}
        {...props}
      >
        {/* Precision Dual-Ring Automotive Chronograph Spinner */}
        <div className="relative flex items-center justify-center">
          <svg
            className={cn(
              'animate-spin',
              currentSize.spinner,
              glow && currentVariant.glow
            )}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background Track Ring */}
            <circle
              className={currentVariant.track}
              cx="12"
              cy="12"
              r="9.5"
              strokeWidth={currentSize.strokeWidth}
            />

            {/* Rotating Active Sweeper Ring */}
            <path
              className={currentVariant.head}
              d="M12 2.5C17.2467 2.5 21.5 6.75329 21.5 12C21.5 14.6261 20.4344 17.0035 18.7058 18.7249"
              strokeWidth={currentSize.strokeWidth}
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Optional Micro-Telemetry Status Label */}
        {label ? (
          <span
            className={cn(
              'font-sans uppercase tracking-widest font-semibold',
              currentSize.labelText,
              currentVariant.text
            )}
          >
            {label}
          </span>
        ) : (
          <span className="sr-only">Loading...</span>
        )}
      </div>
    );

    // Full-screen private concierge overlay mode
    if (fullScreen) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian/85 backdrop-blur-md animate-fade-in">
          {spinnerContent}
        </div>
      );
    }

    return spinnerContent;
  }
);

LoadingSpinner.displayName = 'LoadingSpinner';