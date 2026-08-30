'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import {
  ChevronLeft,
  ChevronRight,
  X,
  Maximize2,
  ImageIcon,
  Grid3X3,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { Badge } from '@/components/ui/Badge';

export interface VehicleGalleryProps {
  images: string[];
  title: string;
  /** Optional badge overlay (e.g. "Verified" / "Featured") */
  badge?: React.ReactNode;
  className?: string;
}

export function VehicleGallery({
  images,
  title,
  badge,
  className,
}: VehicleGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const thumbStripRef = useRef<HTMLDivElement>(null);
  const lightboxThumbRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const hasImages = images && images.length > 0;
  const hasMultiple = hasImages && images.length > 1;
  const currentImage = hasImages ? images[currentIndex] : null;

  // ---------------------------------------------------------------------------
  // NAVIGATION
  // ---------------------------------------------------------------------------
  const goTo = useCallback(
    (index: number) => {
      if (!hasImages || index === currentIndex) return;
      setIsTransitioning(true);
      setImageLoaded(false);
      setCurrentIndex(index);
      // Brief transition window
      window.setTimeout(() => setIsTransitioning(false), 200);
    },
    [hasImages, currentIndex]
  );

  const handlePrev = useCallback(() => {
    if (!hasImages) return;
    goTo(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
  }, [currentIndex, images, hasImages, goTo]);

  const handleNext = useCallback(() => {
    if (!hasImages) return;
    goTo(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
  }, [currentIndex, images, hasImages, goTo]);

  // ---------------------------------------------------------------------------
  // KEYBOARD CONTROLS
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isLightboxOpen) {
        setIsLightboxOpen(false);
        return;
      }
      // Only navigate when gallery is "active" (lightbox open, or always allow arrows)
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'Home' && hasImages) {
        e.preventDefault();
        goTo(0);
      } else if (e.key === 'End' && hasImages) {
        e.preventDefault();
        goTo(images.length - 1);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handlePrev, handleNext, goTo, isLightboxOpen, hasImages, images]);

  // ---------------------------------------------------------------------------
  // BODY SCROLL LOCK (Lightbox)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isLightboxOpen]);

  // ---------------------------------------------------------------------------
  // AUTO-CENTER ACTIVE THUMBNAIL
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const centerThumb = (container: HTMLDivElement | null) => {
      if (!container) return;
      const active = container.querySelector<HTMLElement>(
        `[data-thumb-index="${currentIndex}"]`
      );
      if (!active) return;
      const containerRect = container.getBoundingClientRect();
      const activeRect = active.getBoundingClientRect();
      const offset =
        activeRect.left -
        containerRect.left -
        containerRect.width / 2 +
        activeRect.width / 2;
      container.scrollBy({ left: offset, behavior: 'smooth' });
    };

    centerThumb(thumbStripRef.current);
    if (isLightboxOpen) centerThumb(lightboxThumbRef.current);
  }, [currentIndex, isLightboxOpen]);

  // ---------------------------------------------------------------------------
  // TOUCH SWIPE
  // ---------------------------------------------------------------------------
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].screenX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].screenX;
    if (touchStartX.current === null || touchEndX.current === null) return;
    const delta = touchStartX.current - touchEndX.current;
    const threshold = 50;
    if (delta > threshold) handleNext();
    if (delta < -threshold) handlePrev();
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // ---------------------------------------------------------------------------
  // EMPTY STATE
  // ---------------------------------------------------------------------------
  if (!hasImages) {
    return (
      <div
        className={cn(
          'aspect-16/10 bg-charcoal border border-border rounded-2xl flex flex-col items-center justify-center gap-3',
          className
        )}
      >
        <div className="w-14 h-14 rounded-2xl bg-inset border border-border flex items-center justify-center text-muted">
          <ImageIcon size={28} strokeWidth={1.5} />
        </div>
        <span className="text-xs font-sans uppercase tracking-widest text-muted">
          No imagery available
        </span>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------
  return (
    <>
      <div className={cn('space-y-3', className)}>
        {/* ================================================================ */}
        {/* MAIN STAGE                                                       */}
        {/* ================================================================ */}
        <div
          className="relative aspect-16/10 bg-charcoal rounded-2xl overflow-hidden group border border-border select-none"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {/* Skeleton while loading */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-charcoal animate-pulse z-0" />
          )}

          <Image
            src={currentImage!}
            alt={`${title} — Photo ${currentIndex + 1} of ${images.length}`}
            fill
            priority
            className={cn(
              'object-cover transition-all duration-500',
              imageLoaded && !isTransitioning ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.02]'
            )}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 50vw"
            onLoad={() => setImageLoaded(true)}
            quality={90}
          />

          {/* Ambient vignette for control readability */}
          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-obsidian/50 via-transparent to-obsidian/20 opacity-80" />

          {/* Top-left badge slot */}
          {badge && (
            <div className="absolute top-3 left-3 z-20 flex flex-wrap gap-1.5">
              {badge}
            </div>
          )}

          {/* Top-right: image count + view all */}
          <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
            <Badge
              variant="default"
              size="sm"
              className="bg-obsidian/80 backdrop-blur-md border-border font-mono"
            >
              {currentIndex + 1} / {images.length}
            </Badge>
            {hasMultiple && (
              <button
                type="button"
                onClick={() => setIsLightboxOpen(true)}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-obsidian/80 backdrop-blur-md border border-border text-[10px] font-sans font-semibold uppercase tracking-wider text-secondary hover:text-gold hover:border-gold/40 transition-all"
              >
                <Grid3X3 size={12} />
                View all
              </button>
            )}
          </div>

          {/* Side Navigation Arrows */}
          {hasMultiple && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous image"
                className={cn(
                  'absolute left-3 top-1/2 -translate-y-1/2 z-20',
                  'w-10 h-10 rounded-full flex items-center justify-center',
                  'bg-obsidian/80 backdrop-blur-md border border-border text-primary',
                  'opacity-0 group-hover:opacity-100 focus:opacity-100',
                  'hover:border-gold/50 hover:text-gold hover:shadow-goldGlowSm',
                  'transition-all duration-300'
                )}
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next image"
                className={cn(
                  'absolute right-3 top-1/2 -translate-y-1/2 z-20',
                  'w-10 h-10 rounded-full flex items-center justify-center',
                  'bg-obsidian/80 backdrop-blur-md border border-border text-primary',
                  'opacity-0 group-hover:opacity-100 focus:opacity-100',
                  'hover:border-gold/50 hover:text-gold hover:shadow-goldGlowSm',
                  'transition-all duration-300'
                )}
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}

          {/* Bottom-right: Expand fullscreen */}
          <button
            type="button"
            onClick={() => setIsLightboxOpen(true)}
            aria-label="Open fullscreen gallery"
            className={cn(
              'absolute bottom-3 right-3 z-20',
              'w-10 h-10 rounded-full flex items-center justify-center',
              'bg-obsidian/80 backdrop-blur-md border border-border text-secondary',
              'hover:text-gold hover:border-gold/50 hover:shadow-goldGlowSm',
              'transition-all duration-200'
            )}
          >
            <Maximize2 size={16} />
          </button>

          {/* Progress dots (mobile-friendly, few images) */}
          {hasMultiple && images.length <= 8 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 sm:hidden">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Go to image ${i + 1}`}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-300',
                    i === currentIndex
                      ? 'w-5 bg-gold'
                      : 'w-1.5 bg-white/40 hover:bg-white/70'
                  )}
                />
              ))}
            </div>
          )}
        </div>

        {/* ================================================================ */}
        {/* THUMBNAIL FILMSTRIP                                              */}
        {/* ================================================================ */}
        {hasMultiple && (
          <div
            ref={thumbStripRef}
            className="flex gap-2 overflow-x-auto pb-1 no-scrollbar scroll-smooth"
          >
            {images.map((image, index) => {
              const isActive = index === currentIndex;
              return (
                <button
                  key={index}
                  type="button"
                  data-thumb-index={index}
                  onClick={() => goTo(index)}
                  aria-label={`View image ${index + 1}`}
                  aria-current={isActive ? 'true' : undefined}
                  className={cn(
                    'relative shrink-0 w-18 h-13.5 sm:w-20 sm:h-15 rounded-lg overflow-hidden border-2 transition-all duration-300',
                    isActive
                      ? 'border-gold shadow-goldGlowSm scale-[1.03]'
                      : 'border-transparent opacity-60 hover:opacity-100 hover:border-gold/40'
                  )}
                >
                  <Image
                    src={image}
                    alt={`${title} thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                  {isActive && (
                    <div className="absolute inset-0 ring-1 ring-inset ring-gold/30 pointer-events-none" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ================================================================ */}
      {/* LIGHTBOX / FULLSCREEN                                            */}
      {/* ================================================================ */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-100 bg-obsidian/98 backdrop-blur-xl flex flex-col animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-label={`${title} gallery`}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {/* Lightbox Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border/60 shrink-0">
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-serif font-light text-primary truncate">
                {title}
              </h3>
              <p className="text-[11px] font-sans text-muted mt-0.5">
                {currentIndex + 1} / {images.length}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              aria-label="Close gallery"
              className="w-10 h-10 rounded-full flex items-center justify-center bg-graphite border border-border text-secondary hover:text-primary hover:border-gold/40 transition-all"
            >
              <X size={20} />
            </button>
          </div>

          {/* Lightbox Stage */}
          <div className="relative flex-1 min-h-0 flex items-center justify-center p-4 sm:p-8">
            <div className="relative w-full h-full max-w-6xl mx-auto">
              <Image
                src={currentImage!}
                alt={`${title} — Fullscreen ${currentIndex + 1}`}
                fill
                className="object-contain"
                sizes="100vw"
                quality={100}
                priority
              />
            </div>

            {hasMultiple && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Previous image"
                  className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center bg-graphite/90 border border-border text-primary hover:border-gold hover:text-gold hover:shadow-goldGlowSm transition-all"
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next image"
                  className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center bg-graphite/90 border border-border text-primary hover:border-gold hover:text-gold hover:shadow-goldGlowSm transition-all"
                >
                  <ChevronRight size={22} />
                </button>
              </>
            )}
          </div>

          {/* Lightbox Filmstrip */}
          {hasMultiple && (
            <div className="shrink-0 border-t border-border/60 bg-graphite/50 px-4 py-3">
              <div
                ref={lightboxThumbRef}
                className="flex gap-2 overflow-x-auto no-scrollbar scroll-smooth justify-start sm:justify-center max-w-5xl mx-auto"
              >
                {images.map((image, index) => {
                  const isActive = index === currentIndex;
                  return (
                    <button
                      key={index}
                      type="button"
                      data-thumb-index={index}
                      onClick={() => goTo(index)}
                      className={cn(
                        'relative shrink-0 w-16 h-12 sm:w-20 sm:h-14 rounded-md overflow-hidden border-2 transition-all duration-200',
                        isActive
                          ? 'border-gold shadow-goldGlowSm'
                          : 'border-transparent opacity-50 hover:opacity-100'
                      )}
                    >
                      <Image
                        src={image}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </button>
                  );
                })}
              </div>
              <p className="text-center text-[10px] font-sans text-muted mt-2 hidden sm:block">
                Use arrow keys to navigate · ESC to close
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default VehicleGallery;