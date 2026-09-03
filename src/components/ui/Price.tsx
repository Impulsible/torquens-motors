'use client';

import React, { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';
import { formatCurrency } from '@/utils/helpers';

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                   */
/* -------------------------------------------------------------------------- */

export type PriceVariant =
  | 'primary'
  | 'gold'
  | 'gold-gradient'
  | 'muted'
  | 'emerald'
  | 'white';

export type PriceSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';

export interface PriceProps extends HTMLAttributes<HTMLSpanElement> {
  amount?: number | null;
  currency?: string;
  variant?: PriceVariant;
  size?: PriceSize;
  /** Strike-through original comparison price (e.g., original MSRP) */
  originalAmount?: number | null;
  /** Price on Application / Inquiry only */
  isPOA?: boolean;
  poaText?: string;
  /** Suffix tag e.g. "/ month", "EST. MSRP", "Excl. VAT" */
  suffix?: string;
  /** Prefix tag e.g. "From", "Guide:" */
  prefix?: string;
  /** Toggle currency symbol/code visibility */
  showCurrency?: boolean;
  /** Currency presentation format */
  currencyDisplay?: 'symbol' | 'code';
  /** Compact format (e.g., $1.2M or $350K) */
  compact?: boolean;
  /** Adds a warm ambient gold drop shadow */
  glow?: boolean;
}

/* -------------------------------------------------------------------------- */
/*                                 PRICE ROOT                                 */
/* -------------------------------------------------------------------------- */

export const Price = forwardRef<HTMLSpanElement, PriceProps>(
  (
    {
      amount,
      currency = 'USD',
      variant = 'gold',
      size = 'md',
      originalAmount,
      isPOA = false,
      poaText = 'Price Upon Request',
      suffix,
      prefix,
      showCurrency = true,
      currencyDisplay = 'symbol',
      compact = false,
      glow = false,
      className,
      ...props
    },
    ref
  ) => {
    // 🎨 Color & Tone Variants tailored to the Dark Luxury Palette
    const variantStyles: Record<PriceVariant, string> = {
      // Bespoke Metallic Gold
      gold: 'text-gold',

      // Radiant Gold Metallic Gradient
      'gold-gradient': 'bg-gradient-to-r from-[#C5A059] via-[#E2B96C] to-[#C5A059] bg-clip-text text-transparent',

      // Crisp Platinum / Titanium White
      primary: 'text-primary',
      white: 'text-white',

      // Certified Savings Emerald
      emerald: 'text-emerald',

      // Understated Muted Grey
      muted: 'text-secondary',
    };

    // 📐 Precision Sizing Hierarchy
    const sizeStyles: Record<
      PriceSize,
      { container: string; main: string; currency: string; meta: string }
    > = {
      xs: {
        container: 'gap-1',
        main: 'text-xs font-medium font-sans',
        currency: 'text-[10px] font-sans',
        meta: 'text-[10px] font-sans',
      },
      sm: {
        container: 'gap-1',
        main: 'text-sm font-semibold font-sans',
        currency: 'text-xs font-sans',
        meta: 'text-[11px] font-sans',
      },
      md: {
        container: 'gap-1.5',
        main: 'text-base sm:text-lg font-semibold font-sans tracking-tight',
        currency: 'text-xs sm:text-sm font-sans',
        meta: 'text-xs font-sans',
      },
      lg: {
        container: 'gap-2',
        main: 'text-xl sm:text-2xl font-serif font-normal tracking-tight',
        currency: 'text-sm font-sans',
        meta: 'text-xs font-sans',
      },
      xl: {
        container: 'gap-2',
        main: 'text-2xl sm:text-3xl font-serif font-normal tracking-tight',
        currency: 'text-base font-sans',
        meta: 'text-xs uppercase tracking-wider font-sans',
      },
      hero: {
        container: 'gap-2.5',
        main: 'text-3xl sm:text-5xl font-serif font-normal tracking-tight',
        currency: 'text-lg sm:text-xl font-sans',
        meta: 'text-xs sm:text-sm uppercase tracking-widest font-sans',
      },
    };

    // 🏷️ Price On Application (POA) Handling
    if (isPOA || amount === null || amount === undefined || isNaN(amount)) {
      return (
        <span
          ref={ref}
          className={cn(
            'inline-flex items-center font-serif tracking-wide select-none',
            size === 'hero' ? 'text-2xl sm:text-3xl' : size === 'xl' ? 'text-xl' : 'text-sm',
            variantStyles[variant],
            glow && 'drop-shadow-[0_0_12px_rgba(197,160,89,0.35)]',
            className
          )}
          {...props}
        >
          {poaText}
        </span>
      );
    }

    // 🏎️ Luxury Number Formatting Logic
    const formatNumberParts = (val: number) => {
      if (compact) {
        return new Intl.NumberFormat('en-US', {
          notation: 'compact',
          compactDisplay: 'short',
          maximumFractionDigits: 1,
        }).format(val);
      }

      // Check if value is a whole number (common in vehicle pricing)
      const hasFractions = val % 1 !== 0;
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: hasFractions ? 2 : 0,
        maximumFractionDigits: 2,
      }).format(val);
    };

    const formattedNumber = formatNumberParts(amount);

    // Resolve Currency Symbol vs Code
    const getCurrencySign = () => {
      if (!showCurrency) return '';
      if (currencyDisplay === 'code') return currency.toUpperCase();

      try {
        const parts = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency,
          currencyDisplay: 'narrowSymbol',
        }).formatToParts(0);
        return parts.find((p) => p.type === 'currency')?.value || currency;
      } catch {
        return currency;
      }
    };

    const currencyLabel = getCurrencySign();
    const isCode = currencyDisplay === 'code';

    // Accessible Screen Reader Text
    const accessibleLabel = `${prefix ? `${prefix} ` : ''}${amount.toLocaleString()} ${currency}${
      suffix ? ` ${suffix}` : ''
    }`;

    return (
      <span
        ref={ref}
        aria-label={accessibleLabel}
        className={cn(
          'inline-flex items-baseline select-none whitespace-nowrap',
          sizeStyles[size].container,
          className
        )}
        {...props}
      >
        {/* Optional Eyebrow / Prefix */}
        {prefix && (
          <span className={cn('text-muted font-normal', sizeStyles[size].meta)}>
            {prefix}
          </span>
        )}

        {/* Currency Symbol/Code (Left) */}
        {showCurrency && currencyLabel && !isCode && (
          <span
            className={cn(
              'opacity-80 font-medium',
              variantStyles[variant],
              sizeStyles[size].currency
            )}
          >
            {currencyLabel}
          </span>
        )}

        {/* Main Numerical Value */}
        <span
          className={cn(
            'tabular-nums font-semibold',
            variantStyles[variant],
            sizeStyles[size].main,
            glow && 'drop-shadow-[0_0_12px_rgba(197,160,89,0.35)]'
          )}
        >
          {formattedNumber}
        </span>

        {/* Currency Code (Right - if currencyDisplay="code") */}
        {showCurrency && isCode && (
          <span
            className={cn(
              'text-muted uppercase font-mono tracking-wider',
              sizeStyles[size].meta
            )}
          >
            {currencyLabel}
          </span>
        )}

        {/* Optional Suffix (e.g., "/ month", "MSRP", "Excl. VAT") */}
        {suffix && (
          <span
            className={cn(
              'text-muted font-normal lowercase first-letter:uppercase',
              sizeStyles[size].meta
            )}
          >
            {suffix}
          </span>
        )}

        {/* Strike-Through Comparison Price */}
        {originalAmount && originalAmount > amount && (
          <del
            aria-hidden="true"
            className="ml-1.5 text-xs text-muted/70 line-through font-sans decoration-muted/50"
          >
            {formatCurrency(originalAmount, currency)}
          </del>
        )}
      </span>
    );
  }
);

Price.displayName = 'Price';