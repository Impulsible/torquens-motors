'use client';

import React, { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import Link from 'next/link';
import { Compass } from 'lucide-react';
import { Button, type ButtonVariant, type ButtonSize } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                   */
/* -------------------------------------------------------------------------- */

export type EmptyStateVariant = 'default' | 'minimal' | 'glass' | 'dashed';
export type EmptyStateSize = 'sm' | 'md' | 'lg';

export interface EmptyStateAction {
  label: string;
  onClick?: () => void;
  href?: string;
  variant?: ButtonVariant;
  icon?: ReactNode;
}

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  eyebrow?: string;
  icon?: ReactNode;
  variant?: EmptyStateVariant;
  size?: EmptyStateSize;
  /** Primary Action Configuration */
  action?: EmptyStateAction;
  /** Secondary Action (e.g. "Reset Filters" or "Contact Concierge") */
  secondaryAction?: EmptyStateAction;
  /** Backward compatibility props */
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  /** Additional custom elements (e.g., search bars or chip lists) */
  children?: ReactNode;
  /** Adds a 1px specular light refraction line across the top edge */
  specular?: boolean;
  /** Adds an ambient radial gold back-glow behind the icon */
  ambientGlow?: boolean;
}

/* -------------------------------------------------------------------------- */
/*                              EMPTY STATE ROOT                              */
/* -------------------------------------------------------------------------- */

export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      title,
      description,
      eyebrow,
      icon,
      variant = 'default',
      size = 'md',
      action,
      secondaryAction,
      actionLabel,
      onAction,
      actionHref,
      children,
      specular = true,
      ambientGlow = true,
      className,
      ...props
    },
    ref
  ) => {
    // 🎨 Variant Styling tailored to the Dark Luxury Palette
    const variantStyles: Record<EmptyStateVariant, string> = {
      // Solid graphite chassis with precision borders
      default: 'rounded-lg border border-border bg-graphite shadow-card',

      // Frosted obsidian glass with ultra-fine light pass
      glass: 'rounded-lg border border-white/[0.08] bg-graphite/40 backdrop-blur-xl shadow-card',

      // Machined dashed outline for empty garage slots / upload zones
      dashed: 'rounded-lg border border-dashed border-border/90 bg-charcoal/30 hover:border-gold/30 transition-colors',

      // Clean unconstrained presentation (for inline table or dialog states)
      minimal: 'bg-transparent border-none shadow-none',
    };

    // 📐 Sizing & Padding Rhythm
    const sizeStyles: Record<
      EmptyStateSize,
      { container: string; iconBox: string; iconSize: string; title: string; desc: string; buttonSize: ButtonSize }
    > = {
      sm: {
        container: 'p-6 sm:p-8',
        iconBox: 'h-12 w-12',
        iconSize: '[&>svg]:h-5 [&>svg]:w-5',
        title: 'text-lg sm:text-xl',
        desc: 'text-xs max-w-sm',
        buttonSize: 'sm',
      },
      md: {
        container: 'p-8 sm:p-12',
        iconBox: 'h-16 w-16',
        iconSize: '[&>svg]:h-7 [&>svg]:w-7',
        title: 'text-xl sm:text-2xl',
        desc: 'text-xs sm:text-sm max-w-md',
        buttonSize: 'sm',
      },
      lg: {
        container: 'p-10 sm:p-16',
        iconBox: 'h-20 w-20',
        iconSize: '[&>svg]:h-9 [&>svg]:w-9',
        title: 'text-2xl sm:text-3xl',
        desc: 'text-sm sm:text-base max-w-lg',
        buttonSize: 'md',
      },
    };

    // Unify Primary Action
    const primaryAction: EmptyStateAction | undefined =
      action ||
      (actionLabel
        ? {
            label: actionLabel,
            onClick: onAction,
            href: actionHref,
            variant: 'gold',
          }
        : undefined);

    const activeIcon = icon || <Compass className="text-secondary" />;

    // Get button size based on EmptyState size
    const getButtonSize = (): ButtonSize => {
      return sizeStyles[size].buttonSize;
    };

    return (
      <div
        ref={ref}
        className={cn(
          'relative flex flex-col items-center justify-center text-center overflow-hidden',
          variantStyles[variant],
          sizeStyles[size].container,
          className
        )}
        {...props}
      >
        {/* Specular Top Edge Light Refraction (Luxury Panel Chamfer) */}
        {specular && variant !== 'minimal' && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/12 to-transparent z-10"
          />
        )}

        {/* ───────────────────────────────────────────────────────────── */}
        {/* ICON PEDESTAL & AMBIENT GLOW                                  */}
        {/* ───────────────────────────────────────────────────────────── */}
        <div className="relative mb-5 flex items-center justify-center select-none">
          {ambientGlow && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -m-3 rounded-full bg-gold/10 blur-xl"
            />
          )}

          <div
            className={cn(
              'relative flex items-center justify-center rounded-full',
              'bg-charcoal/80 border border-border text-secondary shadow-inner',
              sizeStyles[size].iconBox,
              sizeStyles[size].iconSize
            )}
          >
            {activeIcon}
          </div>
        </div>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* TEXT HIERARCHY & METADATA                                     */}
        {/* ───────────────────────────────────────────────────────────── */}
        {eyebrow && (
          <span className="mb-2 text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-gold font-sans">
            {eyebrow}
          </span>
        )}

        <h3
          className={cn(
            'font-serif font-normal text-primary tracking-tight leading-snug',
            sizeStyles[size].title
          )}
        >
          {title}
        </h3>

        {description && (
          <p
            className={cn(
              'mt-2 font-sans text-secondary leading-relaxed mx-auto',
              sizeStyles[size].desc
            )}
          >
            {description}
          </p>
        )}

        {/* ───────────────────────────────────────────────────────────── */}
        {/* CALLS TO ACTION                                               */}
        {/* ───────────────────────────────────────────────────────────── */}
        {(primaryAction || secondaryAction) && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {/* Primary Action Button */}
            {primaryAction && (
              primaryAction.href ? (
                <Link href={primaryAction.href}>
                  <Button
                    variant={primaryAction.variant || 'gold'}
                    size={getButtonSize()}
                    rightIcon={primaryAction.icon}
                    onClick={primaryAction.onClick}
                  >
                    {primaryAction.label}
                  </Button>
                </Link>
              ) : (
                <Button
                  variant={primaryAction.variant || 'gold'}
                  size={getButtonSize()}
                  rightIcon={primaryAction.icon}
                  onClick={primaryAction.onClick}
                >
                  {primaryAction.label}
                </Button>
              )
            )}

            {/* Secondary Action Button */}
            {secondaryAction && (
              secondaryAction.href ? (
                <Link href={secondaryAction.href}>
                  <Button
                    variant={secondaryAction.variant || 'secondary'}
                    size={getButtonSize()}
                    leftIcon={secondaryAction.icon}
                    onClick={secondaryAction.onClick}
                  >
                    {secondaryAction.label}
                  </Button>
                </Link>
              ) : (
                <Button
                  variant={secondaryAction.variant || 'secondary'}
                  size={getButtonSize()}
                  leftIcon={secondaryAction.icon}
                  onClick={secondaryAction.onClick}
                >
                  {secondaryAction.label}
                </Button>
              )
            )}
          </div>
        )}

        {/* Custom Slot Injection */}
        {children && <div className="mt-6 w-full">{children}</div>}
      </div>
    );
  }
);

EmptyState.displayName = 'EmptyState';