'use client';

/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */


import React, {
  ReactNode,
  useEffect,
  useState,
  useId,
  useRef,
  RefObject,
} from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { FocusTrap } from './FocusTrap';
import { VisuallyHidden } from './VisuallyHidden';

// ─────────────────────────────────────────────────────────────
// PROPS INTERFACE
// ─────────────────────────────────────────────────────────────

export type DialogSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

export interface AccessibleDialogProps {
  /**
   * Controlled open state.
   */
  isOpen: boolean;
  /**
   * Callback fired when the dialog is dismissed.
   */
  onClose: () => void;
  /**
   * Primary title of the dialog.
   */
  title: ReactNode;
  /**
   * Optional contextual description or subtitle.
   */
  description?: ReactNode;
  /**
   * If true, keeps description accessible to screen readers but hides it visually.
   * @default false
   */
  hideDescription?: boolean;
  /**
   * Dialog body content.
   */
  children: ReactNode;
  /**
   * Optional action button footer slot (e.g. Cancel / Confirm buttons).
   */
  footer?: ReactNode;
  /**
   * WAI-ARIA role. Use `alertdialog` for destructive or irreversible actions.
   * @default 'dialog'
   */
  role?: 'dialog' | 'alertdialog';
  /**
   * Width scale of the dialog surface.
   * @default 'md'
   */
  size?: DialogSize;
  /**
   * Whether clicking the backdrop overlay dismisses the dialog.
   * @default true
   */
  closeOnOutsideClick?: boolean;
  /**
   * Whether pressing the Escape key dismisses the dialog.
   * @default true
   */
  closeOnEsc?: boolean;
  /**
   * Whether to display the top-right close 'X' button.
   * @default true
   */
  showCloseButton?: boolean;
  /**
   * Explicit element to receive focus upon opening.
   */
  initialFocusRef?: RefObject<HTMLElement | null>;
  /**
   * Additional classes for the dialog card surface.
   */
  className?: string;
  /**
   * Additional classes for the scrollable content wrapper.
   */
  contentClassName?: string;
  /**
   * Additional classes for the backdrop overlay.
   */
  overlayClassName?: string;
}

// ─────────────────────────────────────────────────────────────
// SIZE CONFIGURATION
// ─────────────────────────────────────────────────────────────

const SIZE_MAP: Record<DialogSize, string> = {
  xs: 'max-w-sm',
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  '2xl': 'max-w-6xl',
  full: 'max-w-[94vw] h-[90vh]',
};

// ─────────────────────────────────────────────────────────────
// PRODUCTION ACCESSIBLE DIALOG COMPONENT
// ─────────────────────────────────────────────────────────────

export function AccessibleDialog({
  isOpen,
  onClose,
  title,
  description,
  hideDescription = false,
  children,
  footer,
  role = 'dialog',
  size = 'md',
  closeOnOutsideClick = true,
  closeOnEsc = true,
  showCloseButton = true,
  initialFocusRef,
  className,
  contentClassName,
  overlayClassName,
}: AccessibleDialogProps) {
  const [mounted, setMounted] = useState(false);
  const uniqueId = useId();
  const titleId = `dialog-title-${uniqueId}`;
  const descriptionId = `dialog-desc-${uniqueId}`;

  // Hydration safety mount check
  useEffect(() => {
    setMounted(true);
  }, []);

  // ───────────────────────────────────────────────────────────
  // BODY SCROLL LOCK WITH LAYOUT SHIFT COMPENSATION
  // ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    // Calculate vertical scrollbar width to prevent page content jump
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto isolate"
      aria-hidden={!isOpen}
    >
      {/* ─────────────────────────────────────────────────────── */}
      {/* BACKDROP OVERLAY                                        */}
      {/* ─────────────────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        onClick={closeOnOutsideClick ? onClose : undefined}
        className={cn(
          'fixed inset-0 bg-obsidian/85 backdrop-blur-md transition-opacity animate-in fade-in duration-300',
          overlayClassName
        )}
      />

      {/* ─────────────────────────────────────────────────────── */}
      {/* DIALOG SURFACE WITH FOCUS TRAP                          */}
      {/* ─────────────────────────────────────────────────────── */}
      <FocusTrap
        active={isOpen}
        onEscape={closeOnEsc ? onClose : undefined}
        initialFocusRef={initialFocusRef}
        allowOutsideClick={!closeOnOutsideClick}
        className="w-full flex justify-center z-10 my-auto"
      >
        <div
          role={role}
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={description ? descriptionId : undefined}
          className={cn(
            'relative w-full rounded-2xl bg-graphite border border-border/80 text-primary shadow-dropdown',
            'flex flex-col overflow-hidden',
            'animate-in fade-in zoom-in-95 duration-200 ease-out',
            SIZE_MAP[size],
            className
          )}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 border-b border-border/40">
            <div className="space-y-1 min-w-0">
              <h2
                id={titleId}
                className="text-xl sm:text-2xl font-serif font-light text-primary tracking-tight"
              >
                {title}
              </h2>

              {description && !hideDescription && (
                <p
                  id={descriptionId}
                  className="text-xs sm:text-sm font-sans text-secondary leading-relaxed"
                >
                  {description}
                </p>
              )}

              {description && hideDescription && (
                <VisuallyHidden id={descriptionId}>
                  {description}
                </VisuallyHidden>
              )}
            </div>

            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="rounded-full p-2 text-secondary hover:text-primary hover:bg-white/5 transition-colors focus-visible:ring-2 focus-visible:ring-gold outline-hidden shrink-0 -mr-2 -mt-2"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Scrollable Content Body */}
          <div
            className={cn(
              'p-6 overflow-y-auto max-h-[70vh] overscroll-contain text-sm leading-relaxed text-secondary',
              contentClassName
            )}
          >
            {children}
          </div>

          {/* Footer Slot */}
          {footer && (
            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 px-6 py-4 border-t border-border/40 bg-zinc-950/40">
              {footer}
            </div>
          )}
        </div>
      </FocusTrap>
    </div>,
    document.body
  );
}

AccessibleDialog.displayName = 'AccessibleDialog';