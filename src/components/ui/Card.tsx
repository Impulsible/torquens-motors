'use client';

import React, { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/utils/cn';

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                   */
/* -------------------------------------------------------------------------- */

export type CardVariant =
  | 'default'
  | 'dark'
  | 'gold'
  | 'elevated'
  | 'glass'
  | 'inset'
  | 'charcoal';

export type CardPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  variant?: CardVariant;
  padding?: CardPadding;
  /** Enables elevation hover physics and gold perimeter glow */
  hover?: boolean;
  interactive?: boolean;
  /** Adds a 1px specular light refraction line across the top edge */
  specular?: boolean;
  /** Adds an ambient radial gold back-glow */
  ambientGlow?: boolean;
}

/* -------------------------------------------------------------------------- */
/*                                  CARD ROOT                                 */
/* -------------------------------------------------------------------------- */

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      variant = 'default',
      padding = 'none',
      hover = false,
      interactive = false,
      specular = true,
      ambientGlow = false,
      className,
      ...props
    },
    ref
  ) => {
    // 🎨 Variant Designs tailored to the Dark Luxury Palette
    const variantStyles: Record<CardVariant, string> = {
      // Solid graphite chassis with precision borders
      default: 'bg-graphite border-border text-primary',

      // Obsidian deep black chassis
      dark: 'bg-obsidian border-border text-primary',

      // Radiant Gold Chassis with Ambient Glow
      gold: 'bg-graphite border-gold/40 text-primary shadow-goldGlowSm',

      // High-Elevation Graphite with Drop Shadow
      elevated: 'bg-graphite border-border/80 text-primary shadow-card',

      // Frosted Obsidian Glassmorphic Panel
      glass: 'bg-graphite/50 backdrop-blur-xl border-white/[0.08] text-primary',

      // Recessed Inset Panel (for technical specs and telemetry)
      inset: 'bg-inset border-border/60 text-primary shadow-inner',

      // Secondary Content Charcoal Panel
      charcoal: 'bg-charcoal border-border text-primary',
    };

    // 📐 Padding Presets
    const paddingStyles: Record<CardPadding, string> = {
      none: 'p-0',
      sm: 'p-3.5 sm:p-4',
      md: 'p-5 sm:p-6',
      lg: 'p-6 sm:p-8',
      xl: 'p-8 sm:p-10',
    };

    const isInteractive = hover || interactive;

    return (
      <div
        ref={ref}
        className={cn(
          // Base Geometry & Framing
          'relative rounded-lg border overflow-hidden transition-all',
          'duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
          variantStyles[variant],
          paddingStyles[padding],

          // 🏎️ Precision Interactive Hover Dynamics
          isInteractive && [
            'cursor-pointer select-none',
            'hover:-translate-y-1 hover:border-gold/50 hover:shadow-card',
            'active:translate-y-0 active:duration-150',
          ],

          className
        )}
        {...props}
      >
        {/* Specular Top Edge Light Refraction Line */}
        {specular && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/12 to-transparent z-10"
          />
        )}

        {/* Ambient Gold Radial Glow Effect */}
        {ambientGlow && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-48 bg-gold/10 blur-3xl rounded-full"
          />
        )}

        {/* Content Wrapper */}
        <div className="relative z-10 flex flex-col h-full">{children}</div>
      </div>
    );
  }
);

Card.displayName = 'Card';

/* -------------------------------------------------------------------------- */
/*                                CARD HEADER                                 */
/* -------------------------------------------------------------------------- */

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  bordered?: boolean;
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, bordered = false, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex flex-col space-y-1.5 p-6',
        bordered && 'border-b border-border/60 pb-5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
CardHeader.displayName = 'CardHeader';

/* -------------------------------------------------------------------------- */
/*                                 CARD TITLE                                 */
/* -------------------------------------------------------------------------- */

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, as: Component = 'h3', children, ...props }, ref) => (
    <Component
      ref={ref}
      className={cn(
        'font-serif text-xl font-normal text-primary tracking-tight leading-snug',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
);
CardTitle.displayName = 'CardTitle';

/* -------------------------------------------------------------------------- */
/*                             CARD DESCRIPTION                               */
/* -------------------------------------------------------------------------- */

export const CardDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('font-sans text-xs sm:text-sm text-secondary leading-relaxed', className)}
    {...props}
  >
    {children}
  </p>
));
CardDescription.displayName = 'CardDescription';

/* -------------------------------------------------------------------------- */
/*                                CARD CONTENT                                */
/* -------------------------------------------------------------------------- */

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0 flex-1', className)} {...props}>
      {children}
    </div>
  )
);
CardContent.displayName = 'CardContent';

/* -------------------------------------------------------------------------- */
/*                                CARD FOOTER                                 */
/* -------------------------------------------------------------------------- */

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  bordered?: boolean;
}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, bordered = false, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex items-center p-6 pt-0 mt-auto',
        bordered && 'border-t border-border/60 pt-4 mt-4',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
CardFooter.displayName = 'CardFooter';