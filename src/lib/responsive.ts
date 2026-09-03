'use client';

/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useMemo } from "react";

/**
 * Breakpoints matching Tailwind configuration
 */
export const breakpoints = {
  xs: 320,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
  '3xl': 1920,
} as const;

export type Breakpoint = keyof typeof breakpoints;

/**
 * Media query strings for each breakpoint
 */
export const mediaQueries = {
  xs: `(min-width: ${breakpoints.xs}px)`,
  sm: `(min-width: ${breakpoints.sm}px)`,
  md: `(min-width: ${breakpoints.md}px)`,
  lg: `(min-width: ${breakpoints.lg}px)`,
  xl: `(min-width: ${breakpoints.xl}px)`,
  '2xl': `(min-width: ${breakpoints['2xl']}px)`,
  '3xl': `(min-width: ${breakpoints['3xl']}px)`,
  xsMax: `(max-width: ${breakpoints.xs}px)`,
  smMax: `(max-width: ${breakpoints.sm - 1}px)`,
  mdMax: `(max-width: ${breakpoints.md - 1}px)`,
  lgMax: `(max-width: ${breakpoints.lg - 1}px)`,
  xlMax: `(max-width: ${breakpoints.xl - 1}px)`,
  '2xlMax': `(max-width: ${breakpoints['2xl'] - 1}px)`,
};

export type MediaQueryKey = keyof typeof mediaQueries;

/**
 * Responsive hook for client-side breakpoint detection (SSR-safe)
 */
export function useBreakpoint(breakpoint: MediaQueryKey): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const media = window.matchMedia(mediaQueries[breakpoint]);
    setMatches(media.matches);

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [breakpoint]);

  return matches;
}

/**
 * Responsive hook for device detection
 */
export function useDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  const isMobile = useBreakpoint('smMax');
  const isTablet = useBreakpoint('md');
  const isDesktop = useBreakpoint('lg');

  if (isDesktop) return 'desktop';
  if (isTablet) return 'tablet';
  return 'mobile';
}

/**
 * Responsive value hook - Use this when you need reactive values
 */
export function useResponsiveValue<T>(
  mobile: T,
  tablet?: T,
  desktop?: T
): T {
  const device = useDeviceType();
  
  return useMemo(() => {
    if (device === 'desktop' && desktop !== undefined) return desktop;
    if (device === 'tablet' && tablet !== undefined) return tablet;
    return mobile;
  }, [device, mobile, tablet, desktop]);
}