import React, { ElementType, forwardRef } from 'react';
import { cn } from '@/utils/cn';

// ─────────────────────────────────────────────────────────────
// PROPS & TYPE DEFINITIONS
// ─────────────────────────────────────────────────────────────

export interface VisuallyHiddenBaseProps {
  /**
   * If true, the element becomes visible on screen when focused via keyboard navigation.
   * Useful for hidden interactive elements, form controls, and skip triggers.
   * @default false
   */
  focusable?: boolean;
}

type PolymorphicProps<C extends ElementType, P = object> = P & {
  as?: C;
  children?: React.ReactNode;
  className?: string;
} & Omit<React.ComponentPropsWithRef<C>, keyof P | 'as' | 'children' | 'className'>;

type VisuallyHiddenComponent = <C extends ElementType = 'span'>(
  props: PolymorphicProps<C, VisuallyHiddenBaseProps>
) => React.ReactNode;

// ─────────────────────────────────────────────────────────────
// COMPONENT IMPLEMENTATION
// ─────────────────────────────────────────────────────────────

const _VisuallyHidden = forwardRef(function VisuallyHidden(
  {
    as,
    children,
    className,
    focusable = false,
    ...restProps
  }: VisuallyHiddenBaseProps & {
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
        // WCAG standard screen-reader concealment
        'sr-only',
        // Optional focus restoration
        focusable && 'focus:not-sr-only focus:static focus:w-auto focus:h-auto focus:overflow-visible focus:p-2',
        className
      )}
      {...restProps}
    >
      {children}
    </Component>
  );
});

export const VisuallyHidden = _VisuallyHidden as VisuallyHiddenComponent & {
  displayName?: string;
};

VisuallyHidden.displayName = 'VisuallyHidden';

/**
 * Standard semantic alias
 */
export const ScreenReaderOnly = VisuallyHidden;