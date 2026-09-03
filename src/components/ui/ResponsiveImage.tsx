/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useEffect } from 'react';
import Image, { StaticImageData } from 'next/image';
import { ImageOff } from 'lucide-react';
import { cn } from '@/utils/cn';

// ─────────────────────────────────────────────────────────────
// CONFIGURATION & RECORD MAPS
// ─────────────────────────────────────────────────────────────

const ASPECT_RATIO_MAP = {
  square: 'aspect-square',      // 1:1
  video: 'aspect-video',        // 16:9
  cinema: 'aspect-[21/9]',      // 21:9 Ultra-wide
  classic: 'aspect-[3/2]',      // 3:2 Standard 35mm Photography
  landscape: 'aspect-[4/3]',    // 4:3
  portrait: 'aspect-[3/4]',     // 3:4
  tall: 'aspect-[4/5]',         // 4:5 Social / Editorial Portrait
  auto: 'aspect-auto',
} as const;

const OBJECT_FIT_MAP = {
  cover: 'object-cover',
  contain: 'object-contain',
  fill: 'object-fill',
  none: 'object-none',
  'scale-down': 'object-scale-down',
} as const;

const OBJECT_POSITION_MAP = {
  center: 'object-center',
  top: 'object-top',
  bottom: 'object-bottom',
  left: 'object-left',
  right: 'object-right',
} as const;

export type AspectRatio = keyof typeof ASPECT_RATIO_MAP;
export type ObjectFit = keyof typeof OBJECT_FIT_MAP;
export type ObjectPosition = keyof typeof OBJECT_POSITION_MAP;

export interface StructuredSizes {
  sm?: string;
  md?: string;
  lg?: string;
  xl?: string;
  '2xl'?: string;
  default?: string;
}

export interface ResponsiveImageProps {
  /**
   * Remote image URL, local path, or static Next.js image import.
   */
  src: string | StaticImageData;
  /**
   * Accessible text description of the image.
   */
  alt: string;
  /**
   * Aspect ratio constraint for the wrapper container.
   * @default 'landscape'
   */
  aspectRatio?: AspectRatio;
  /**
   * Responsive viewport slot sizing. Pass a structured object or standard CSS sizes string.
   * @default '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
   */
  sizes?: string | StructuredSizes;
  /**
   * High priority loading (preloads image, disables opacity fade for better LCP metrics).
   * @default false
   */
  priority?: boolean;
  /**
   * Loading strategy.
   * @default priority ? 'eager' : 'lazy'
   */
  loading?: 'lazy' | 'eager';
  /**
   * Quality compression level (1-100).
   * @default 85
   */
  quality?: number;
  /**
   * CSS object-fit behavior for the inner image.
   * @default 'cover'
   */
  objectFit?: ObjectFit;
  /**
   * CSS object-position focal alignment.
   * @default 'center'
   */
  objectPosition?: ObjectPosition;
  /**
   * Fallback image URL rendered if the primary source fails to load.
   */
  fallbackSrc?: string;
  /**
   * Base64 LQIP data string for instant blurred previews.
   */
  blurDataURL?: string;
  /**
   * Placeholder display strategy.
   */
  placeholder?: 'blur' | 'empty';
  /**
   * Class name applied to the outer relative container.
   */
  className?: string;
  /**
   * Class name applied directly to the Next.js `Image` element (useful for transforms/filters).
   */
  imageClassName?: string;
  /**
   * Whether to display an animated dark skeleton placeholder during loading.
   * @default true
   */
  showSkeleton?: boolean;
}

// ─────────────────────────────────────────────────────────────
// SIZES PARSER UTILITY
// ─────────────────────────────────────────────────────────────

function resolveSizesAttribute(sizes?: string | StructuredSizes): string {
  if (!sizes) {
    return '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';
  }

  if (typeof sizes === 'string') {
    return sizes;
  }

  // Build descending media query string to follow standard browser evaluation order
  const queries: string[] = [];
  if (sizes['2xl']) queries.push(`(min-width: 1536px) ${sizes['2xl']}`);
  if (sizes.xl) queries.push(`(min-width: 1280px) ${sizes.xl}`);
  if (sizes.lg) queries.push(`(min-width: 1024px) ${sizes.lg}`);
  if (sizes.md) queries.push(`(min-width: 768px) ${sizes.md}`);
  if (sizes.sm) queries.push(`(min-width: 640px) ${sizes.sm}`);
  queries.push(sizes.default || '100vw');

  return queries.join(', ');
}

// ─────────────────────────────────────────────────────────────
// PRODUCTION RESPONSIVE IMAGE COMPONENT
// ─────────────────────────────────────────────────────────────

export function ResponsiveImage({
  src,
  alt,
  aspectRatio = 'landscape',
  sizes,
  priority = false,
  loading,
  quality = 85,
  objectFit = 'cover',
  objectPosition = 'center',
  fallbackSrc,
  blurDataURL,
  placeholder = blurDataURL ? 'blur' : 'empty',
  className,
  imageClassName,
  showSkeleton = true,
}: ResponsiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  // Synchronize internal source if parent prop changes
  useEffect(() => {
    setCurrentSrc(src);
    setHasError(false);
    setIsLoaded(false);
  }, [src]);

  const resolvedSizes = resolveSizesAttribute(sizes);

  const handleError = () => {
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    } else {
      setHasError(true);
    }
  };

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden bg-zinc-900/60 isolate',
        ASPECT_RATIO_MAP[aspectRatio],
        className
      )}
    >
      {!hasError ? (
        <>
          <Image
            src={currentSrc}
            alt={alt}
            fill
            sizes={resolvedSizes}
            priority={priority}
            loading={loading || (priority ? 'eager' : 'lazy')}
            quality={quality}
            placeholder={placeholder}
            blurDataURL={blurDataURL}
            onLoad={() => setIsLoaded(true)}
            onError={handleError}
            className={cn(
              'duration-700 ease-out',
              OBJECT_FIT_MAP[objectFit],
              OBJECT_POSITION_MAP[objectPosition],
              // If priority, keep at full opacity immediately to preserve LCP metric
              priority
                ? 'opacity-100'
                : isLoaded
                  ? 'opacity-100 transition-opacity'
                  : 'opacity-0',
              imageClassName
            )}
          />

          {/* Luxury ambient loading pulse skeleton */}
          {showSkeleton && !isLoaded && !priority && (
            <div
              aria-hidden="true"
              className="absolute inset-0 z-10 animate-pulse bg-zinc-800/50 backdrop-blur-xs"
            />
          )}
        </>
      ) : (
        /* Graceful error state placeholder */
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 text-zinc-600 gap-2 p-4 text-center select-none">
          <ImageOff className="h-6 w-6 stroke-[1.5] text-zinc-500" />
          <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-500">
            Image Unavailable
          </span>
        </div>
      )}
    </div>
  );
}

ResponsiveImage.displayName = 'ResponsiveImage';