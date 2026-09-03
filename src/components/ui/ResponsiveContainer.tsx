import React, { ElementType, forwardRef } from 'react';
import { cn } from '@/utils/cn';

// ─────────────────────────────────────────────────────────────
// CONFIGURATION & RECORD MAPS
// ─────────────────────────────────────────────────────────────

const MAX_WIDTH_MAP = {
  sm: 'max-w-screen-sm',     // 640px
  md: 'max-w-screen-md',     // 768px
  lg: 'max-w-screen-lg',     // 1024px
  xl: 'max-w-screen-xl',     // 1280px
  '2xl': 'max-w-screen-2xl', // 1536px
  '7xl': 'max-w-7xl',        // 80rem / 1280px
  prose: 'max-w-prose',      // 65ch (Ideal editorial reading measure)
  full: 'max-w-full',
} as const;

const PADDING_MAP = {
  none: 'px-0',
  sm: 'px-3 sm:px-4',
  md: 'px-4 sm:px-6 lg:px-8',
  lg: 'px-6 sm:px-10 lg:px-12',
  xl: 'px-6 sm:px-12 lg:px-16 xl:px-20',
} as const;

export type ContainerMaxWidth = keyof typeof MAX_WIDTH_MAP;
export type ContainerPadding = keyof typeof PADDING_MAP;

export interface ContainerBaseProps {
  /**
   * Maximum horizontal constraint of the container.
   * @default 'lg'
   */
  maxWidth?: ContainerMaxWidth;
  /**
   * Horizontal gutter padding scale.
   * @default 'md'
   */
  padding?: ContainerPadding;
  /**
   * Whether to center the container with auto horizontal margins (`mx-auto`).
   * @default true
   */
  center?: boolean;
}

type PolymorphicProps<C extends ElementType, P = object> = P & {
  as?: C;
  children?: React.ReactNode;
  className?: string;
} & Omit<React.ComponentPropsWithRef<C>, keyof P | 'as' | 'children' | 'className'>;

type ResponsiveContainerComponent = <C extends ElementType = 'div'>(
  props: PolymorphicProps<C, ContainerBaseProps>
) => React.ReactNode;

// ─────────────────────────────────────────────────────────────
// COMPONENT IMPLEMENTATION
// ─────────────────────────────────────────────────────────────

const _ResponsiveContainer = forwardRef(function ResponsiveContainer(
  {
    as,
    children,
    className,
    maxWidth = 'lg',
    padding = 'md',
    center = true,
    ...restProps
  }: ContainerBaseProps & {
    as?: ElementType;
    children?: React.ReactNode;
    className?: string;
  },
  ref: React.ForwardedRef<HTMLElement>
) {
  const Component = as || 'div';

  return (
    <Component
      ref={ref}
      className={cn(
        'w-full box-border',
        center && 'mx-auto',
        MAX_WIDTH_MAP[maxWidth] || MAX_WIDTH_MAP.lg,
        PADDING_MAP[padding] || PADDING_MAP.md,
        className
      )}
      {...restProps}
    >
      {children}
    </Component>
  );
});

export const ResponsiveContainer = _ResponsiveContainer as ResponsiveContainerComponent & {
  displayName?: string;
};

ResponsiveContainer.displayName = 'ResponsiveContainer';