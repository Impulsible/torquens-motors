'use client';

import React, { ElementType, forwardRef } from 'react';
import { cn } from '@/utils/cn';

// ─────────────────────────────────────────────────────────────
// TAILWIND STATIC MAPPINGS (PREVENTS JIT PURGING)
// ─────────────────────────────────────────────────────────────

export type GridColSpan = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

const COLS_BASE: Record<GridColSpan, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
  7: 'grid-cols-7',
  8: 'grid-cols-8',
  9: 'grid-cols-9',
  10: 'grid-cols-10',
  11: 'grid-cols-11',
  12: 'grid-cols-12',
};

const COLS_SM: Record<GridColSpan, string> = {
  1: 'sm:grid-cols-1',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-3',
  4: 'sm:grid-cols-4',
  5: 'sm:grid-cols-5',
  6: 'sm:grid-cols-6',
  7: 'sm:grid-cols-7',
  8: 'sm:grid-cols-8',
  9: 'sm:grid-cols-9',
  10: 'sm:grid-cols-10',
  11: 'sm:grid-cols-11',
  12: 'sm:grid-cols-12',
};

const COLS_MD: Record<GridColSpan, string> = {
  1: 'md:grid-cols-1',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
  5: 'md:grid-cols-5',
  6: 'md:grid-cols-6',
  7: 'md:grid-cols-7',
  8: 'md:grid-cols-8',
  9: 'md:grid-cols-9',
  10: 'md:grid-cols-10',
  11: 'md:grid-cols-11',
  12: 'md:grid-cols-12',
};

const COLS_LG: Record<GridColSpan, string> = {
  1: 'lg:grid-cols-1',
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
  5: 'lg:grid-cols-5',
  6: 'lg:grid-cols-6',
  7: 'lg:grid-cols-7',
  8: 'lg:grid-cols-8',
  9: 'lg:grid-cols-9',
  10: 'lg:grid-cols-10',
  11: 'lg:grid-cols-11',
  12: 'lg:grid-cols-12',
};

const COLS_XL: Record<GridColSpan, string> = {
  1: 'xl:grid-cols-1',
  2: 'xl:grid-cols-2',
  3: 'xl:grid-cols-3',
  4: 'xl:grid-cols-4',
  5: 'xl:grid-cols-5',
  6: 'xl:grid-cols-6',
  7: 'xl:grid-cols-7',
  8: 'xl:grid-cols-8',
  9: 'xl:grid-cols-9',
  10: 'xl:grid-cols-10',
  11: 'xl:grid-cols-11',
  12: 'xl:grid-cols-12',
};

const COLS_2XL: Record<GridColSpan, string> = {
  1: '2xl:grid-cols-1',
  2: '2xl:grid-cols-2',
  3: '2xl:grid-cols-3',
  4: '2xl:grid-cols-4',
  5: '2xl:grid-cols-5',
  6: '2xl:grid-cols-6',
  7: '2xl:grid-cols-7',
  8: '2xl:grid-cols-8',
  9: '2xl:grid-cols-9',
  10: '2xl:grid-cols-10',
  11: '2xl:grid-cols-11',
  12: '2xl:grid-cols-12',
};

const GAP_MAP = {
  none: 'gap-0',
  xs: 'gap-2',
  sm: 'gap-3 sm:gap-4',
  md: 'gap-4 sm:gap-6',
  lg: 'gap-6 sm:gap-8 lg:gap-10',
  xl: 'gap-8 sm:gap-12 lg:gap-16',
} as const;

const GAP_X_MAP = {
  none: 'gap-x-0',
  xs: 'gap-x-2',
  sm: 'gap-x-3 sm:gap-x-4',
  md: 'gap-x-4 sm:gap-x-6',
  lg: 'gap-x-6 sm:gap-x-8 lg:gap-x-10',
  xl: 'gap-x-8 sm:gap-x-12 lg:gap-x-16',
} as const;

const GAP_Y_MAP = {
  none: 'gap-y-0',
  xs: 'gap-y-2',
  sm: 'gap-y-3 sm:gap-y-4',
  md: 'gap-y-4 sm:gap-y-6',
  lg: 'gap-y-6 sm:gap-y-8 lg:gap-y-10',
  xl: 'gap-y-8 sm:gap-y-12 lg:gap-y-16',
} as const;

export type GridGap = keyof typeof GAP_MAP;

export interface ResponsiveGridCols {
  base?: GridColSpan;
  xs?: GridColSpan;
  sm?: GridColSpan;
  md?: GridColSpan;
  lg?: GridColSpan;
  xl?: GridColSpan;
  '2xl'?: GridColSpan;
}

export interface GridBaseProps {
  /**
   * Responsive column configuration across breakpoints.
   * @default { base: 1, sm: 2, md: 3, lg: 4 }
   */
  cols?: ResponsiveGridCols;
  /**
   * Unified horizontal and vertical gap scale.
   * @default 'md'
   */
  gap?: GridGap;
  /**
   * Independent horizontal gap override.
   */
  gapX?: GridGap;
  /**
   * Independent vertical gap override.
   */
  gapY?: GridGap;
}

type PolymorphicProps<C extends ElementType, P = object> = P & {
  as?: C;
  children?: React.ReactNode;
  className?: string;
} & Omit<React.ComponentPropsWithRef<C>, keyof P | 'as' | 'children' | 'className'>;

type ResponsiveGridComponent = <C extends ElementType = 'div'>(
  props: PolymorphicProps<C, GridBaseProps>
) => React.ReactNode;

// ─────────────────────────────────────────────────────────────
// COMPONENT IMPLEMENTATION
// ─────────────────────────────────────────────────────────────

const _ResponsiveGrid = forwardRef(function ResponsiveGrid(
  {
    as,
    children,
    className,
    cols = { base: 1, sm: 2, md: 3, lg: 4 },
    gap = 'md',
    gapX,
    gapY,
    ...restProps
  }: GridBaseProps & {
    as?: ElementType;
    children?: React.ReactNode;
    className?: string;
  },
  ref: React.ForwardedRef<HTMLElement>
) {
  const Component = as || 'div';
  const baseCol = cols.base || cols.xs || 1;

  return (
    <Component
      ref={ref}
      className={cn(
        'grid w-full',
        COLS_BASE[baseCol],
        cols.sm && COLS_SM[cols.sm],
        cols.md && COLS_MD[cols.md],
        cols.lg && COLS_LG[cols.lg],
        cols.xl && COLS_XL[cols.xl],
        cols['2xl'] && COLS_2XL[cols['2xl']],
        !gapX && !gapY && GAP_MAP[gap],
        gapX && GAP_X_MAP[gapX],
        gapY && GAP_Y_MAP[gapY],
        className
      )}
      {...restProps}
    >
      {children}
    </Component>
  );
});

export const ResponsiveGrid = _ResponsiveGrid as ResponsiveGridComponent & {
  displayName?: string;
};

ResponsiveGrid.displayName = 'ResponsiveGrid';