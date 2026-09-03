'use client';
/* eslint-disable react-hooks/set-state-in-effect */

import React, {
  ReactNode,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useIsMobile } from '@/hooks/useResponsive';

// ─────────────────────────────────────────────────────────────
// PROPS INTERFACE
// ─────────────────────────────────────────────────────────────

export type DrawerPosition = 'bottom' | 'left' | 'right';

export interface SwipeableDrawerProps {
  /**
   * Controlled open state
   */
  isOpen: boolean;
  /**
   * Callback invoked when drawer is dismissed via swipe, backdrop, ESC, or close button
   */
  onClose: () => void;
  /**
   * Content rendered inside the drawer body
   */
  children: ReactNode;
  /**
   * Optional header title
   */
  title?: ReactNode;
  /**
   * Optional subheader description
   */
  description?: ReactNode;
  /**
   * Drawer positioning
   * @default 'bottom'
   */
  position?: DrawerPosition;
  /**
   * Max height constraint for bottom drawers (CSS string or number)
   * @default '85vh'
   */
  height?: string | number;
  /**
   * Width constraint for left/right drawers
   * @default '340px'
   */
  width?: string | number;
  /**
   * Pixel distance threshold to trigger dismissal on touch release
   * @default 80
   */
  dismissThreshold?: number;
  /**
   * Whether to display the visual drag handle pill
   * @default true
   */
  showHandle?: boolean;
  /**
   * Whether to display a header close button
   * @default true
   */
  showCloseButton?: boolean;
  /**
   * Restrict rendering exclusively to mobile screen sizes (< 768px)
   * @default true
   */
  mobileOnly?: boolean;
  /**
   * Additional CSS classes for the drawer surface
   */
  className?: string;
  /**
   * Additional CSS classes for the backdrop overlay
   */
  overlayClassName?: string;
}

// ─────────────────────────────────────────────────────────────
// PRODUCTION SWIPEABLE DRAWER
// ─────────────────────────────────────────────────────────────

export function SwipeableDrawer({
  isOpen,
  onClose,
  children,
  title,
  description,
  position = 'bottom',
  height = '85vh',
  width = '340px',
  dismissThreshold = 80,
  showHandle = true,
  showCloseButton = true,
  mobileOnly = true,
  className,
  overlayClassName,
}: SwipeableDrawerProps) {
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false);

  // Gesture state refs (avoids unnecessary re-renders during active touchmove)
  const drawerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef<number>(0);
  const currentDragDelta = useRef<number>(0);
  const isDragging = useRef<boolean>(false);

  // Client-side hydration mount check
  useEffect(() => {
    setMounted(true);
  }, []);

  // ───────────────────────────────────────────────────────────
  // ACCESSIBLE BODY SCROLL LOCK & ESCAPE KEY LISTENER
  // ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;

    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // ───────────────────────────────────────────────────────────
  // TOUCH GESTURE ENGINE (60FPS TRANSFORM TRACKING)
  // ───────────────────────────────────────────────────────────

  const setDrawerTransform = useCallback(
    (offsetPx: number, animated = false) => {
      if (!drawerRef.current) return;
      drawerRef.current.style.transition = animated
        ? 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        : 'none';

      switch (position) {
        case 'bottom':
          drawerRef.current.style.transform = `translate3d(0, ${Math.max(
            0,
            offsetPx
          )}px, 0)`;
          break;
        case 'left':
          drawerRef.current.style.transform = `translate3d(${Math.min(
            0,
            offsetPx
          )}px, 0, 0)`;
          break;
        case 'right':
          drawerRef.current.style.transform = `translate3d(${Math.max(
            0,
            offsetPx
          )}px, 0, 0)`;
          break;
      }
    },
    [position]
  );

  const handleTouchStart = (e: React.TouchEvent) => {
    // Prevent dragging if internal content is scrolled down
    if (contentRef.current && contentRef.current.scrollTop > 0) {
      isDragging.current = false;
      return;
    }

    isDragging.current = true;
    const touch = e.touches[0];
    dragStartPos.current = position === 'bottom' ? touch.clientY : touch.clientX;
    currentDragDelta.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;

    const touch = e.touches[0];
    const currentPos = position === 'bottom' ? touch.clientY : touch.clientX;
    let delta = currentPos - dragStartPos.current;

    // Apply rubber-banding resistance if pulling in opposite direction of dismiss
    if (position === 'bottom' && delta < 0) {
      delta = delta * 0.15;
    } else if (position === 'left' && delta > 0) {
      delta = delta * 0.15;
    } else if (position === 'right' && delta < 0) {
      delta = delta * 0.15;
    }

    currentDragDelta.current = delta;
    setDrawerTransform(delta, false);
  };

  const handleTouchEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;

    const delta = currentDragDelta.current;
    let shouldDismiss = false;

    if (position === 'bottom' && delta > dismissThreshold) {
      shouldDismiss = true;
    } else if (position === 'left' && delta < -dismissThreshold) {
      shouldDismiss = true;
    } else if (position === 'right' && delta > dismissThreshold) {
      shouldDismiss = true;
    }

    if (shouldDismiss) {
      onClose();
    } else {
      // Snap back to resting position
      setDrawerTransform(0, true);
    }

    currentDragDelta.current = 0;
  };

  // Reset transforms when opened
  useEffect(() => {
    if (isOpen) {
      setDrawerTransform(0, true);
    }
  }, [isOpen, setDrawerTransform]);

  // Viewport and SSR guards
  if (!mounted || !isOpen) return null;
  if (mobileOnly && !isMobile) return null;

  // ───────────────────────────────────────────────────────────
  // POSITION STYLES
  // ───────────────────────────────────────────────────────────

  const positionStyles = {
    bottom: 'bottom-0 inset-x-0 rounded-t-2xl border-t border-border/80',
    left: 'top-0 left-0 bottom-0 rounded-r-2xl border-r border-border/80',
    right: 'top-0 right-0 bottom-0 rounded-l-2xl border-l border-border/80',
  };

  const animationClass = {
    bottom: 'animate-slide-up',
    left: 'animate-slide-in-left',
    right: 'animate-slide-in-right',
  }[position];

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'drawer-title' : undefined}
      aria-describedby={description ? 'drawer-desc' : undefined}
      className="fixed inset-0 z-50 flex touch-none select-none isolate"
    >
      {/* ───────────────────────────────────────────────────────── */}
      {/* BACKDROP OVERLAY                                          */}
      {/* ───────────────────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={cn(
          'fixed inset-0 bg-obsidian/80 backdrop-blur-md animate-fade-in transition-opacity',
          overlayClassName
        )}
      />

      {/* ───────────────────────────────────────────────────────── */}
      {/* DRAWER SURFACE CONTAINER                                  */}
      {/* ───────────────────────────────────────────────────────── */}
      <div
        ref={drawerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          height: position === 'bottom' ? height : '100%',
          width: position === 'bottom' ? '100%' : width,
          maxHeight: position === 'bottom' ? '92vh' : '100vh',
        }}
        className={cn(
          'fixed z-50 flex flex-col bg-graphite text-primary shadow-dropdown will-change-transform',
          // iOS Safe Area padding support
          'pb-[calc(1rem+env(safe-area-inset-bottom,0px))]',
          positionStyles[position],
          animationClass,
          className
        )}
      >
        {/* Drag Handle Bar */}
        {showHandle && (
          <div className="flex w-full items-center justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing">
            <div
              aria-hidden="true"
              className="h-1.5 w-12 rounded-full bg-border transition-colors hover:bg-gold/40"
            />
          </div>
        )}

        {/* Header Bar (Title, Description & Close Action) */}
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between gap-4 px-6 pt-3 pb-3 border-b border-border/40">
            <div className="space-y-0.5 min-w-0">
              {title && (
                <h2
                  id="drawer-title"
                  className="font-serif text-lg font-light text-primary tracking-tight truncate"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p
                  id="drawer-desc"
                  className="font-sans text-xs text-secondary leading-relaxed line-clamp-1"
                >
                  {description}
                </p>
              )}
            </div>

            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="rounded-full p-1.5 text-secondary hover:text-primary hover:bg-white/5 transition-colors focus-visible:ring-2 focus-visible:ring-gold outline-hidden shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* Scrollable Drawer Body Content */}
        <div
          ref={contentRef}
          className="flex-1 overflow-y-auto px-6 py-4 overscroll-contain select-text"
        >
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}

SwipeableDrawer.displayName = 'SwipeableDrawer';