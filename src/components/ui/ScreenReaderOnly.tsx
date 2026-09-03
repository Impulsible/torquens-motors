import React, { ElementType, forwardRef } from 'react';
import { cn } from '@/utils/cn';

// ─────────────────────────────────────────────────────────────
// PROPS & TYPE DEFINITIONS
// ─────────────────────────────────────────────────────────────

export interface ScreenReaderOnlyBaseProps {
  /**
   * If true, element remains visually hidden by default but transitions into
   * a visible, fully accessible element when keyboard-focused (e.g. skip-to-content links).
   * @default false
   */
  focusable?: boolean;
}

type PolymorphicProps<C extends ElementType, P = object> = P & {
  as?: C;
  children?: React.ReactNode;
  className?: string;
} & Omit<React.ComponentPropsWithRef<C>, keyof P | 'as' | 'children' | 'className'>;

type ScreenReaderOnlyComponent = <C extends ElementType = 'span'>(
  props: PolymorphicProps<C, ScreenReaderOnlyBaseProps>
) => React.ReactNode;

// ─────────────────────────────────────────────────────────────
// COMPONENT IMPLEMENTATION
// ─────────────────────────────────────────────────────────────

const _ScreenReaderOnly = forwardRef(function ScreenReaderOnly(
  {
    as,
    children,
    className,
    focusable = false,
    ...restProps
  }: ScreenReaderOnlyBaseProps & {
    as?: ElementType;
    children?: React.ReactNode;
    className?: string;
  },
  ref: React.ForwardedRef<HTMLElement>
) {
  const Component = as || 'span';

  return (
    <Component
      ref={ref}
      className={cn(
        // Base WCAG-compliant screen reader hiding
        'sr-only',
        // Optional keyboard focus restore (for skip links or accessible focus traps)
        focusable &&
          'focus:not-sr-only focus:fixed focus:z-50 focus:w-auto focus:h-auto focus:overflow-visible focus:p-4 focus:bg-obsidian focus:text-gold focus:border focus:border-gold/40 focus:rounded-lg focus:shadow-goldGlow focus:outline-hidden',
        className
      )}
      {...restProps}
    >
      {children}
    </Component>
  );
});

export const ScreenReaderOnly = _ScreenReaderOnly as ScreenReaderOnlyComponent & {
  displayName?: string;
};

ScreenReaderOnly.displayName = 'ScreenReaderOnly';

/**
 * Standard industry alias (Radix / Chakra / Tailwind UI convention)
 */
export const VisuallyHidden = ScreenReaderOnly;