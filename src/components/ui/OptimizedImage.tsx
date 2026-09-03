'use client';
/* eslint-disable @typescript-eslint/no-unused-vars */

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/utils/cn';
import { getOptimizedImageUrl, getResponsiveSrcSet, getSizesAttribute } from '@/lib/image-optimization';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  loading?: 'lazy' | 'eager';
  quality?: number;
  sizes?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  loading = 'lazy',
  quality = 80,
  sizes,
  objectFit = 'cover',
  blurDataURL,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Get optimized URL
  const optimizedSrc = getOptimizedImageUrl(src, {
    width,
    height,
    quality,
    loading,
  });

  // Get responsive srcset
  const srcSet = getResponsiveSrcSet(src);

  // Get sizes attribute
  const sizesAttr = sizes || getSizesAttribute();

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setError(true);
    onError?.();
  };

  if (error) {
    return (
      <div
        className={cn(
          'bg-charcoal flex items-center justify-center text-muted',
          className
        )}
        style={{ width, height }}
      >
        <span className="text-sm font-sans">Image unavailable</span>
      </div>
    );
  }

  // ✅ Fix: Use next/image with proper props
  // srcSet is not a valid prop for next/image, it's handled automatically
  return (
    <div className={cn('relative overflow-hidden', className)} style={{ width, height }}>
      <Image
        src={optimizedSrc}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        loading={loading}
        quality={quality}
        sizes={sizesAttr}
        className={cn(
          'transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0',
          objectFit === 'cover' && 'object-cover',
          objectFit === 'contain' && 'object-contain',
          objectFit === 'fill' && 'object-fill',
          objectFit === 'none' && 'object-none',
          objectFit === 'scale-down' && 'object-scale-down'
        )}
        onLoad={handleLoad}
        onError={handleError}
        placeholder={blurDataURL ? 'blur' : 'empty'}
        blurDataURL={blurDataURL}
      />
      {!isLoaded && !priority && (
        <div className="absolute inset-0 animate-pulse bg-charcoal" />
      )}
    </div>
  );
}