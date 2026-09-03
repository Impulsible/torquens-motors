/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, {
  ReactNode,
  useEffect,
  useState,
  useRef,
  useId,
} from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/utils/cn';

// ─────────────────────────────────────────────────────────────
// TYPE DEFINITIONS
// ─────────────────────────────────────────────────────────────

export type AriaLivePoliteness = 'polite' | 'assertive' | 'off';
export type AriaLiveRole = 'status' | 'alert' | 'log' | 'timer' | undefined;

export interface AriaLiveProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Content to broadcast to screen readers.
   */
  children?: ReactNode;
  /**
   * Politeness level for assistive technologies.
   * - `polite`: Speaks after current voice task completes (ideal for filters, counts, badges).
   * - `assertive`: Interrupts immediately (ideal for timeouts, critical escrow alerts).
   * - `off`: Temporarily silences announcements.
   * @default 'polite'
   */
  polite?: boolean;
  /**
   * Explicit politeness string. Takes precedence over `polite` boolean.
   */
  politeness?: AriaLivePoliteness;
  /**
   * ARIA role. Defaults to `status` for polite, `alert` for assertive.
   */
  role?: AriaLiveRole;
  /**
   * Whether screen readers should present the entire region or only changed parts.
   * @default true
   */
  atomic?: boolean;
  /**
   * What changes are considered relevant for screen readers.
   * @default 'additions text'
   */
  relevant?: 'additions' | 'removals' | 'text' | 'all' | 'additions text';
  /**
   * Set to true when content is actively loading/updating to pause announcements.
   * @default false
   */
  busy?: boolean;
  /**
   * Auto-clears the message from the accessibility tree after the specified milliseconds.
   * Set to `0` or `null` to retain message indefinitely.
   * @default 7000
   */
  clearAfterMs?: number | null;
  /**
   * Whether to render into `document.body` via a portal to bypass parent layout constraints.
   * @default true
   */
  portal?: boolean;
}

// ─────────────────────────────────────────────────────────────
// PRODUCTION ARIA-LIVE COMPONENT
// ─────────────────────────────────────────────────────────────

export function AriaLive({
  children,
  polite = true,
  politeness,
  role,
  atomic = true,
  relevant = 'additions text',
  busy = false,
  clearAfterMs = 7000,
  portal = true,
  className,
  id,
  ...restProps
}: AriaLiveProps) {
  const generatedId = useId();
  const [mounted, setMounted] = useState(false);
  const [announcement, setAnnouncement] = useState<ReactNode>('');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Determine effective politeness level
  const resolvedPoliteness: AriaLivePoliteness =
    politeness || (polite ? 'polite' : 'assertive');

  // Determine semantic ARIA role
  const resolvedRole: AriaLiveRole =
    role || (resolvedPoliteness === 'assertive' ? 'alert' : 'status');

  // Client-side hydration mount check
  useEffect(() => {
    setMounted(true);
  }, []);

  // ───────────────────────────────────────────────────────────
  // MUTATION CYCLER (ALLOWS REPEATS & SCREEN READER DETECTION)
  // ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mounted || children === undefined || children === null || children === '') {
      return;
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Micro-flush ensures assistive tech registers consecutive identical strings
    setAnnouncement('');
    const frameId = requestAnimationFrame(() => {
      setAnnouncement(children);
    });

    // Auto-clear message after delay to keep the a11y tree clean
    if (clearAfterMs && clearAfterMs > 0) {
      timerRef.current = setTimeout(() => {
        setAnnouncement('');
      }, clearAfterMs);
    }

    return () => {
      cancelAnimationFrame(frameId);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [children, clearAfterMs, mounted]);

  if (!mounted) return null;

  const content = (
    <div
      id={id || `torquens-a11y-live-${generatedId}`}
      role={resolvedRole}
      aria-live={resolvedPoliteness}
      aria-atomic={atomic}
      aria-relevant={relevant}
      aria-busy={busy}
      className={cn(
        // Standard WCAG screen-reader concealment
        'sr-only',
        className
      )}
      {...restProps}
    >
      {announcement}
    </div>
  );

  if (portal && typeof document !== 'undefined') {
    return createPortal(content, document.body);
  }

  return content;
}

AriaLive.displayName = 'AriaLive';