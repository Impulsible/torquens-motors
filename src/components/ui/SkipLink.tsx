'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/utils/cn';

// ─────────────────────────────────────────────────────────────
// PROPS INTERFACE
// ─────────────────────────────────────────────────────────────

export interface SkipLinkProps
  extends React.ComponentPropsWithoutRef<'a'> {
  /**
   * Anchor target ID selector (with leading hash).
   * @default '#main-content'
   */
  href?: string;
  /**
   * Accessible text or elements rendered within the skip link.
   * @default 'Skip to main content'
   */
  children?: React.ReactNode;
  /**
   * Explicit target element ID (without '#') to programmatically focus upon activation.
   * If omitted, derived automatically from `href`.
   */
  targetId?: string;
}

// ─────────────────────────────────────────────────────────────
// PRODUCTION SKIP LINK COMPONENT
// ─────────────────────────────────────────────────────────────

export const SkipLink = forwardRef<HTMLAnchorElement, SkipLinkProps>(
  function SkipLink(
    {
      href = '#main-content',
      children = 'Skip to main content',
      targetId,
      className,
      onClick,
      ...restProps
    },
    ref
  ) {
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (onClick) {
        onClick(e);
      }

      // Guarantee keyboard focus shifts to the target landmark (WCAG 2.4.1)
      if (!e.defaultPrevented && typeof document !== 'undefined') {
        const id = targetId || href.replace(/^#/, '');
        if (id) {
          const targetEl = document.getElementById(id);
          if (targetEl) {
            // Ensure element can receive focus programmatically
            if (!targetEl.hasAttribute('tabindex')) {
              targetEl.setAttribute('tabindex', '-1');
            }
            targetEl.focus({ preventScroll: false });
          }
        }
      }
    };

    return (
      <a
        ref={ref}
        href={href}
        onClick={handleClick}
        data-skip-link
        className={cn(
          // Visually hidden by default (WCAG sr-only)
          'sr-only',
          // Reveal upon keyboard TAB focus
          'focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100',
          // Luxury Layout & Typography
          'focus:inline-flex focus:items-center focus:justify-center',
          'focus:px-5 focus:py-3 focus:rounded-lg',
          'focus:bg-obsidian focus:text-gold focus:border focus:border-gold/60',
          'focus:font-mono focus:text-xs focus:font-semibold focus:uppercase focus:tracking-widest',
          // Glow & Focus Rings
          'focus:shadow-[0_0_25px_-5px_rgba(197,160,89,0.35)]',
          'focus:outline-hidden focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-obsidian',
          'transition-all duration-200 ease-out',
          className
        )}
        {...restProps}
      >
        {children}
      </a>
    );
  }
);

SkipLink.displayName = 'SkipLink';