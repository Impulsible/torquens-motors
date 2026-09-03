'use client';

import React, { useEffect, useRef, type ReactNode, type HTMLAttributes } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                   */
/* -------------------------------------------------------------------------- */

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  description?: string;
  size?: ModalSize;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  className?: string;
}

/* -------------------------------------------------------------------------- */
/*                                 MODAL ROOT                                 */
/* -------------------------------------------------------------------------- */

export function Modal({
  isOpen,
  onClose,
  children,
  title,
  description,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  className,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle escape key and body scroll lock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeStyles: Record<ModalSize, string> = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-6xl',
    full: 'max-w-[95vw] sm:max-w-[90vw]',
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-describedby={description ? 'modal-description' : undefined}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-obsidian/85 backdrop-blur-md animate-fade-in"
    >
      {/* Chassis */}
      <div
        ref={modalRef}
        className={cn(
          'relative w-full rounded-lg bg-graphite border border-border/80 shadow-card text-primary overflow-hidden',
          'animate-slide-up duration-300 ease-luxury',
          sizeStyles[size],
          className
        )}
      >
        {/* Specular Top Hairline Reflection */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/15 to-transparent z-20"
        />

        {/* Header (Rendered automatically if title or close button present) */}
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between p-6 border-b border-border/60">
            <div className="space-y-1">
              {title && (
                <h2 id="modal-title" className="font-serif text-2xl font-normal text-primary tracking-tight">
                  {title}
                </h2>
              )}
              {description && (
                <p id="modal-description" className="font-sans text-xs text-secondary leading-relaxed">
                  {description}
                </p>
              )}
            </div>

            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className="rounded-md p-1.5 text-muted hover:text-primary hover:bg-charcoal transition-colors focus-visible:ring-2 focus-visible:ring-gold/60"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}

        {/* Content Body with Custom Scrollbar */}
        <div className="p-6 max-h-[calc(85vh-8rem)] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                SUBCOMPONENTS                               */
/* -------------------------------------------------------------------------- */

export function ModalFooter({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex items-center justify-end gap-3 p-6 pt-4 border-t border-border/60 bg-graphite/50',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}