/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
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
  const [mounted, setMounted] = useState(false);

  const thumbStripRef = useRef<HTMLDivElement>(null);
  const lightboxThumbRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const hasImages = images && images.length > 0;
  const hasMultiple = hasImages && images.length > 1;
  const currentImage = hasImages ? images[currentIndex] : null;

  // Hydration safety check for SSR/Portals
  useEffect(() => {
    setMounted(true);
  }, []);

  // ---------------------------------------------------------------------------
  // NAVIGATION
  // ---------------------------------------------------------------------------
  const goTo = useCallback(
    (index: number) => {
      if (!hasImages || index === currentIndex) return;
      setIsTransitioning(true);
      setImageLoaded(false);
      setCurrentIndex(index);
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

  const openLightbox = useCallback(() => setIsLightboxOpen(true), []);
  const closeLightbox = useCallback(() => setIsLightboxOpen(false), []);

  // ---------------------------------------------------------------------------
  // KEYBOARD CONTROLS
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!isLightboxOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeLightbox();
        return;
      }
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
  }, [isLightboxOpen, handlePrev, handleNext, goTo, closeLightbox, hasImages, images]);

  // ---------------------------------------------------------------------------
  // BODY SCROLL LOCK + FOCUS CLOSE BUTTON
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = 'hidden';
      const t = window.setTimeout(() => closeBtnRef.current?.focus(), 50);
      return () => {
        window.clearTimeout(t);
        document.body.style.overflow = '';
      };
    }
    document.body.style.overflow = '';
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
              imageLoaded && !isTransitioning
                ? 'opacity-100 scale-100'
                : 'opacity-0 scale-[1.02]'
            )}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 50vw"
            onLoad={() => setImageLoaded(true)}
            quality={90}
          />

          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-obsidian/50 via-transparent to-obsidian/20 opacity-80" />

          {badge && (
            <div className="absolute top-3 left-3 z-20 flex flex-wrap gap-1.5">
              {badge}
            </div>
          )}

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
                onClick={openLightbox}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-obsidian/80 backdrop-blur-md border border-border text-[10px] font-sans font-semibold uppercase tracking-wider text-secondary hover:text-gold hover:border-gold/40 transition-all"
              >
                <Grid3X3 size={12} />
                View all
              </button>
            )}
          </div>

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
                  'opacity-0 group-hover:opacity-100 focus-visible:opacity-100',
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
                  'opacity-0 group-hover:opacity-100 focus-visible:opacity-100',
                  'hover:border-gold/50 hover:text-gold hover:shadow-goldGlowSm',
                  'transition-all duration-300'
                )}
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}

          <button
            type="button"
            onClick={openLightbox}
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
      {/* LIGHTBOX / FULLSCREEN PORTAL — GUARANTEED OVER TOP HEADER        */}
      {/* ================================================================ */}
      {isLightboxOpen && mounted &&
        createPortal(
          <div
            className="fixed inset-0 z-99999 flex flex-col bg-black/95 backdrop-blur-2xl animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
            aria-label={`${title} gallery`}
          >
            {/* ── Header bar ─────────────────────────────────────────────── */}
            <header className="relative z-30 flex items-center justify-between gap-3 px-4 sm:px-8 py-4 shrink-0 bg-linear-to-b from-black via-black/90 to-transparent border-b border-white/10">
              {/* Title + counter */}
              <div className="min-w-0 flex-1 pr-2">
                <h3 className="text-sm sm:text-base font-serif font-light text-white truncate">
                  {title}
                </h3>
                <div className="mt-1 flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-2.5 py-0.5 text-[11px] font-mono tracking-widest text-white/90">
                    {currentIndex + 1}
                    <span className="mx-1 text-white/40">/</span>
                    {images.length}
                  </span>
                  <span className="hidden sm:inline text-[10px] uppercase tracking-[0.18em] text-white/40 font-sans">
                    Fullscreen dossier
                  </span>
                </div>
              </div>

              {/* CLOSE BUTTON — High contrast, top layer */}
              <button
                ref={closeBtnRef}
                type="button"
                onClick={closeLightbox}
                aria-label="Close gallery"
                className={cn(
                  'group shrink-0 inline-flex items-center justify-center gap-2',
                  'h-11 px-4 rounded-full',
                  'bg-gold text-obsidian font-semibold',
                  'border border-gold',
                  'shadow-[0_4px_25px_rgba(212,175,55,0.4)]',
                  'hover:bg-gold-hover hover:scale-105',
                  'active:scale-95',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold',
                  'transition-all duration-200 cursor-pointer'
                )}
              >
                <X
                  size={20}
                  strokeWidth={2.5}
                  className="transition-transform duration-200 group-hover:rotate-90"
                />
                <span className="text-xs font-sans uppercase tracking-[0.16em]">
                  Close
                </span>
                <kbd className="hidden md:inline ml-1 rounded border border-obsidian/30 bg-obsidian/10 px-1.5 py-0.5 text-[10px] font-mono font-bold text-obsidian">
                  Esc
                </kbd>
              </button>
            </header>

            {/* ── Stage ──────────────────────────────────────────────────── */}
            <div
              className="relative flex-1 min-h-0 flex items-center justify-center px-2 sm:px-8 py-4"
              onClick={closeLightbox}
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              {/* Image Container */}
              <div
                className="relative w-full h-full max-w-6xl mx-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <Image
                  src={currentImage!}
                  alt={`${title} — Fullscreen ${currentIndex + 1}`}
                  fill
                  className="object-contain select-none"
                  sizes="100vw"
                  quality={100}
                  priority
                  draggable={false}
                />
              </div>

              {/* Prev / Next controls */}
              {hasMultiple && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrev();
                    }}
                    aria-label="Previous image"
                    className={cn(
                      'absolute left-3 sm:left-8 top-1/2 -translate-y-1/2 z-30',
                      'h-12 w-12 sm:h-14 sm:w-14 rounded-full',
                      'flex items-center justify-center',
                      'bg-black/60 backdrop-blur-md border border-white/20 text-white',
                      'hover:bg-gold hover:text-obsidian hover:border-gold',
                      'active:scale-95',
                      'transition-all duration-200 shadow-2xl cursor-pointer'
                    )}
                  >
                    <ChevronLeft size={28} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNext();
                    }}
                    aria-label="Next image"
                    className={cn(
                      'absolute right-3 sm:right-8 top-1/2 -translate-y-1/2 z-30',
                      'h-12 w-12 sm:h-14 sm:w-14 rounded-full',
                      'flex items-center justify-center',
                      'bg-black/60 backdrop-blur-md border border-white/20 text-white',
                      'hover:bg-gold hover:text-obsidian hover:border-gold',
                      'active:scale-95',
                      'transition-all duration-200 shadow-2xl cursor-pointer'
                    )}
                  >
                    <ChevronRight size={28} />
                  </button>
                </>
              )}
            </div>

            {/* ── Filmstrip footer ───────────────────────────────────────── */}
            {hasMultiple && (
              <footer className="relative z-30 shrink-0 border-t border-white/10 bg-black/90 backdrop-blur-xl px-4 sm:px-8 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                <div
                  ref={lightboxThumbRef}
                  className="flex gap-2 overflow-x-auto no-scrollbar scroll-smooth justify-start sm:justify-center max-w-5xl mx-auto pb-1"
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
                          'relative shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-200 cursor-pointer',
                          'w-20 h-14 sm:w-24 sm:h-16',
                          isActive
                            ? 'border-gold shadow-[0_0_16px_rgba(212,175,55,0.4)] scale-105'
                            : 'border-transparent opacity-40 hover:opacity-100 hover:border-white/30'
                        )}
                      >
                        <Image
                          src={image}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      </button>
                    );
                  })}
                </div>
              </footer>
            )}
          </div>,
          document.body
        )}
    </>
  );
}

export default VehicleGallery;