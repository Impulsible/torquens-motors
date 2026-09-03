'use client';

import { useSyncExternalStore, useCallback } from 'react';

// ─────────────────────────────────────────────────────────────
// TAILWIND-ALIGNED MEDIA QUERY TOKENS
// ─────────────────────────────────────────────────────────────

export const MEDIA_QUERIES = {
  // Viewport widths
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
  '2xl': '(min-width: 1536px)',

  // Semantic device ranges
  isMobile: '(max-width: 767px)',
  isTablet: '(min-width: 768px) and (max-width: 1023px)',
  isDesktop: '(min-width: 1024px)',
  isWideDesktop: '(min-width: 1280px)',

  // Hardware & Input capabilities
  touch: '(pointer: coarse)',
  hover: '(hover: hover) and (pointer: fine)',

  // Orientation
  portrait: '(orientation: portrait)',
  landscape: '(orientation: landscape)',

  // User preferences (WCAG & system)
  reducedMotion: '(prefers-reduced-motion: reduce)',
  darkMode: '(prefers-color-scheme: dark)',
} as const;

// ─────────────────────────────────────────────────────────────
// CORE HOOK: useMediaQuery (React 18 useSyncExternalStore)
// ─────────────────────────────────────────────────────────────

/**
 * Subscribes to a CSS media query with zero hydration mismatch and no layout tearing.
 *
 * @param query - Valid CSS media query string (e.g. `(min-width: 1024px)`)
 * @param serverFallback - Initial value during Server-Side Rendering (SSR)
 * @returns boolean indicating whether the query matches
 */
export function useMediaQuery(
  query: string,
  serverFallback = false
): boolean {
  const subscribe = useCallback(
    (callback: () => void) => {
      if (typeof window === 'undefined' || !('matchMedia' in window)) {
        return () => {};
      }

      const mediaQueryList = window.matchMedia(query);

      // Modern browsers
      if ('addEventListener' in mediaQueryList) {
        mediaQueryList.addEventListener('change', callback);
        return () => mediaQueryList.removeEventListener('change', callback);
      }

      // Legacy fallback
      const legacyMql = mediaQueryList as unknown as {
        addListener: (cb: () => void) => void;
        removeListener: (cb: () => void) => void;
      };
      legacyMql.addListener(callback);
      return () => legacyMql.removeListener(callback);
    },
    [query]
  );

  const getSnapshot = useCallback(() => {
    if (typeof window === 'undefined' || !('matchMedia' in window)) {
      return serverFallback;
    }
    return window.matchMedia(query).matches;
  }, [query, serverFallback]);

  const getServerSnapshot = useCallback(() => serverFallback, [serverFallback]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

// ─────────────────────────────────────────────────────────────
// SEMANTIC DEVICE HOOKS
// ─────────────────────────────────────────────────────────────

/**
 * Checks if the current viewport is mobile (< 768px).
 */
export function useIsMobile(serverFallback = false): boolean {
  return useMediaQuery(MEDIA_QUERIES.isMobile, serverFallback);
}

/**
 * Checks if the current viewport is tablet (768px – 1023px).
 */
export function useIsTablet(serverFallback = false): boolean {
  return useMediaQuery(MEDIA_QUERIES.isTablet, serverFallback);
}

/**
 * Checks if the current viewport is desktop (>= 1024px).
 */
export function useIsDesktop(serverFallback = true): boolean {
  return useMediaQuery(MEDIA_QUERIES.isDesktop, serverFallback);
}

/**
 * Checks if the device uses a touch-primary coarse pointer (phones, tablets).
 */
export function useIsTouchDevice(serverFallback = false): boolean {
  return useMediaQuery(MEDIA_QUERIES.touch, serverFallback);
}

/**
 * Checks if the device has a precision pointer and hover capability (mouse/trackpad).
 */
export function useCanHover(serverFallback = true): boolean {
  return useMediaQuery(MEDIA_QUERIES.hover, serverFallback);
}

/**
 * Returns current screen orientation using hardware media query ('portrait' | 'landscape').
 */
export function useOrientation(
  serverFallback: 'portrait' | 'landscape' = 'portrait'
): 'portrait' | 'landscape' {
  const isPortrait = useMediaQuery(
    MEDIA_QUERIES.portrait,
    serverFallback === 'portrait'
  );
  return isPortrait ? 'portrait' : 'landscape';
}

/**
 * WCAG Compliance: Checks if the user has requested reduced motion in their OS settings.
 */
export function usePrefersReducedMotion(serverFallback = false): boolean {
  return useMediaQuery(MEDIA_QUERIES.reducedMotion, serverFallback);
}

/**
 * Checks if the OS or browser is in dark mode.
 */
export function usePrefersDarkMode(serverFallback = true): boolean {
  return useMediaQuery(MEDIA_QUERIES.darkMode, serverFallback);
}

// ─────────────────────────────────────────────────────────────
// RESPONSIVE VALUE HOOK (OVERLOADED)
// ─────────────────────────────────────────────────────────────

export interface ResponsiveValues<T> {
  base: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  '2xl'?: T;
}

/**
 * Hook to select values dynamically based on responsive breakpoints.
 *
 * @example
 * // Object map style:
 * const columns = useResponsiveValue({ base: 1, md: 2, lg: 4 });
 *
 * // Positional legacy style:
 * const bannerHeight = useResponsiveValue(200, 350, 500);
 */
export function useResponsiveValue<T>(values: ResponsiveValues<T>): T;
export function useResponsiveValue<T>(mobile: T, tablet: T, desktop: T): T;
export function useResponsiveValue<T>(
  arg1: ResponsiveValues<T> | T,
  arg2?: T,
  arg3?: T
): T {
  const isSm = useMediaQuery(MEDIA_QUERIES.sm, false);
  const isMd = useMediaQuery(MEDIA_QUERIES.md, false);
  const isLg = useMediaQuery(MEDIA_QUERIES.lg, true);
  const isXl = useMediaQuery(MEDIA_QUERIES.xl, true);
  const is2Xl = useMediaQuery(MEDIA_QUERIES['2xl'], true);

  // Handle Object Notation: { base: 1, md: 2, lg: 4 }
  if (typeof arg1 === 'object' && arg1 !== null && 'base' in arg1) {
    const config = arg1 as ResponsiveValues<T>;
    if (is2Xl && config['2xl'] !== undefined) return config['2xl'];
    if (isXl && config.xl !== undefined) return config.xl;
    if (isLg && config.lg !== undefined) return config.lg;
    if (isMd && config.md !== undefined) return config.md;
    if (isSm && config.sm !== undefined) return config.sm;
    return config.base;
  }

  // Handle Positional Notation: (mobile, tablet, desktop)
  const mobile = arg1 as T;
  const tablet = arg2 !== undefined ? arg2 : mobile;
  const desktop = arg3 !== undefined ? arg3 : tablet;

  if (isLg) return desktop;
  if (isMd) return tablet;
  return mobile;
}