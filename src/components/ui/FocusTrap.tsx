'use client';

import React, {
  ElementType,
  forwardRef,
  useEffect,
  useRef,
  useCallback,
  useImperativeHandle,
} from 'react';
import { cn } from '@/utils/cn';

// ─────────────────────────────────────────────────────────────
// ACCESSIBLE FOCUS SELECTORS
// ─────────────────────────────────────────────────────────────

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'button:not([disabled]):not([aria-hidden="true"])',
  'input:not([disabled]):not([type="hidden"]):not([aria-hidden="true"])',
  'select:not([disabled]):not([aria-hidden="true"])',
  'textarea:not([disabled]):not([aria-hidden="true"])',
  '[tabindex]:not([tabindex="-1"]):not([disabled]):not([aria-hidden="true"])',
  '[contenteditable="true"]:not([aria-hidden="true"])',
].join(', ');

/**
 * Filters out elements that are hidden via CSS or detached from the render tree.
 */
function isElementVisible(element: HTMLElement): boolean {
  return !!(
    element.offsetWidth ||
    element.offsetHeight ||
    element.getClientRects().length
  );
}

// ─────────────────────────────────────────────────────────────
// PROPS & TYPE DEFINITIONS
// ─────────────────────────────────────────────────────────────

export interface FocusTrapBaseProps {
  /**
   * Children enclosed within the focus trap boundary.
   */
  children: React.ReactNode;
  /**
   * Whether the focus trap is actively confining focus.
   * @default true
   */
  active?: boolean;
  /**
   * Explicit element to receive focus when the trap activates.
   * Defaults to the first focusable element inside the container.
   */
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  /**
   * Whether to restore focus to the triggering element when the trap is deactivated.
   * @default true
   */
  returnFocusOnDeactivate?: boolean;
  /**
   * Callback fired when the user presses the 'Escape' key.
   */
  onEscape?: () => void;
  /**
   * If true, allows click events outside the container without forcing focus back.
   * @default false
   */
  allowOutsideClick?: boolean;
}

type PolymorphicProps<C extends ElementType, P = object> = P & {
  as?: C;
  children?: React.ReactNode;
  className?: string;
} & Omit<React.ComponentPropsWithRef<C>, keyof P | 'as' | 'children' | 'className'>;

type FocusTrapComponent = <C extends ElementType = 'div'>(
  props: PolymorphicProps<C, FocusTrapBaseProps>
) => React.ReactNode;

// ─────────────────────────────────────────────────────────────
// PRODUCTION FOCUS TRAP COMPONENT
// ─────────────────────────────────────────────────────────────

const _FocusTrap = forwardRef(function FocusTrap(
  {
    as,
    children,
    className,
    active = true,
    initialFocusRef,
    returnFocusOnDeactivate = true,
    onEscape,
    allowOutsideClick = false,
    ...restProps
  }: FocusTrapBaseProps & {
    as?: ElementType;
    children?: React.ReactNode;
    className?: string;
  },
  forwardedRef: React.ForwardedRef<HTMLElement>
) {
  const Component = as || 'div';
  const containerRef = useRef<HTMLElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Synchronize internal ref with forwardedRef
  useImperativeHandle(forwardedRef, () => containerRef.current as HTMLElement);

  /**
   * Queries all valid, visible, non-disabled focusable elements inside the trap.
   */
  const getFocusableElements = useCallback((): HTMLElement[] => {
    if (!containerRef.current) return [];
    const elements = Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
    );
    return elements.filter(isElementVisible);
  }, []);

  // ───────────────────────────────────────────────────────────
  // INITIAL FOCUS & RETURN FOCUS MANAGEMENT
  // ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!active) return;

    // Store triggering active element for later restoration (WCAG 2.4.3)
    if (typeof document !== 'undefined') {
      previousActiveElement.current = document.activeElement as HTMLElement | null;
    }

    const frameId = requestAnimationFrame(() => {
      if (!containerRef.current) return;

      // 1. Prioritize custom initialFocusRef
      if (initialFocusRef?.current && isElementVisible(initialFocusRef.current)) {
        initialFocusRef.current.focus();
        return;
      }

      // 2. Focus first focusable descendant
      const focusable = getFocusableElements();
      if (focusable.length > 0) {
        focusable[0].focus();
        return;
      }

      // 3. Fallback: Focus container itself
      if (!containerRef.current.hasAttribute('tabindex')) {
        containerRef.current.setAttribute('tabindex', '-1');
      }
      containerRef.current.focus({ preventScroll: true });
    });

    return () => {
      cancelAnimationFrame(frameId);

      // Restore focus to original trigger upon deactivation/unmount
      if (returnFocusOnDeactivate && previousActiveElement.current) {
        if (isElementVisible(previousActiveElement.current)) {
          previousActiveElement.current.focus({ preventScroll: true });
        }
      }
    };
  }, [active, initialFocusRef, returnFocusOnDeactivate, getFocusableElements]);

  // ───────────────────────────────────────────────────────────
  // KEYBOARD TAB LOOP & ESCAPE HANDLER
  // ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!active) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Handle ESC key
      if (event.key === 'Escape') {
        if (onEscape) {
          event.preventDefault();
          event.stopPropagation();
          onEscape();
        }
        return;
      }

      // Only trap Tab key navigation
      if (event.key !== 'Tab') return;

      const focusable = getFocusableElements();
      const container = containerRef.current;
      if (!container) return;

      // If no focusable elements inside, lock focus to container
      if (focusable.length === 0) {
        event.preventDefault();
        container.focus();
        return;
      }

      const firstElement = focusable[0];
      const lastElement = focusable[focusable.length - 1];
      const activeEl = document.activeElement;

      // Backward navigation (Shift + Tab)
      if (event.shiftKey) {
        if (activeEl === firstElement || activeEl === container) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Forward navigation (Tab)
        if (activeEl === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    const handleFocusIn = (event: FocusEvent) => {
      if (allowOutsideClick) return;
      const container = containerRef.current;
      if (!container) return;

      // If focus escapes the trap, pull it back to the first element
      if (!container.contains(event.target as Node)) {
        const focusable = getFocusableElements();
        if (focusable.length > 0) {
          focusable[0].focus();
        } else {
          container.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('focusin', handleFocusIn, true);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('focusin', handleFocusIn, true);
    };
  }, [active, onEscape, allowOutsideClick, getFocusableElements]);

  return (
    <Component
      ref={containerRef}
      className={cn('outline-hidden', className)}
      {...restProps}
    >
      {children}
    </Component>
  );
});

export const FocusTrap = _FocusTrap as FocusTrapComponent & {
  displayName?: string;
};

FocusTrap.displayName = 'FocusTrap';