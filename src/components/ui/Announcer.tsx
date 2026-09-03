/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  ReactNode,
} from 'react';
import { VisuallyHidden } from './VisuallyHidden';

// ─────────────────────────────────────────────────────────────
// TYPE DEFINITIONS
// ─────────────────────────────────────────────────────────────

export type AnnouncePoliteness = 'polite' | 'assertive';

export interface AnnounceOptions {
  /**
   * Politeness priority level.
   * - `polite`: Announces when the user finishes current task (filters, toasts).
   * - `assertive`: Interrupts immediately (critical errors, timeouts).
   * @default 'polite'
   */
  politeness?: AnnouncePoliteness;
  /**
   * Milliseconds before clearing the DOM text to prevent stale accessibility tree entries.
   * @default 7000
   */
  clearAfterMs?: number;
}

export interface AnnouncerContextValue {
  /**
   * Imperatively broadcast a message to assistive technologies.
   */
  announce: (message: string, options?: AnnounceOptions | AnnouncePoliteness) => void;
  /**
   * Clear all active announcements immediately.
   */
  clearAnnouncements: () => void;
}

// ─────────────────────────────────────────────────────────────
// CONTEXT
// ─────────────────────────────────────────────────────────────

const AnnouncerContext = createContext<AnnouncerContextValue | null>(null);

// ─────────────────────────────────────────────────────────────
// PROVIDER & LIVE REGION MOUNT
// ─────────────────────────────────────────────────────────────

export interface AnnouncerProviderProps {
  children: ReactNode;
}

export function AnnouncerProvider({ children }: AnnouncerProviderProps) {
  const [politeMessage, setPoliteMessage] = useState<string>('');
  const [assertiveMessage, setAssertiveMessage] = useState<string>('');

  const politeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const assertiveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const announce = useCallback(
    (message: string, options?: AnnounceOptions | AnnouncePoliteness) => {
      if (!message.trim()) return;

      const politeness: AnnouncePoliteness =
        typeof options === 'string'
          ? options
          : options?.politeness || 'polite';

      const clearAfterMs =
        typeof options === 'object' && options?.clearAfterMs !== undefined
          ? options.clearAfterMs
          : 7000;

      if (politeness === 'assertive') {
        if (assertiveTimerRef.current) clearTimeout(assertiveTimerRef.current);

        // Micro-flush allows identical consecutive messages to be re-announced
        setAssertiveMessage('');
        requestAnimationFrame(() => {
          setAssertiveMessage(message);
        });

        if (clearAfterMs > 0) {
          assertiveTimerRef.current = setTimeout(() => {
            setAssertiveMessage('');
          }, clearAfterMs);
        }
      } else {
        if (politeTimerRef.current) clearTimeout(politeTimerRef.current);

        setPoliteMessage('');
        requestAnimationFrame(() => {
          setPoliteMessage(message);
        });

        if (clearAfterMs > 0) {
          politeTimerRef.current = setTimeout(() => {
            setPoliteMessage('');
          }, clearAfterMs);
        }
      }
    },
    []
  );

  const clearAnnouncements = useCallback(() => {
    if (politeTimerRef.current) clearTimeout(politeTimerRef.current);
    if (assertiveTimerRef.current) clearTimeout(assertiveTimerRef.current);
    setPoliteMessage('');
    setAssertiveMessage('');
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (politeTimerRef.current) clearTimeout(politeTimerRef.current);
      if (assertiveTimerRef.current) clearTimeout(assertiveTimerRef.current);
    };
  }, []);

  return (
    <AnnouncerContext.Provider value={{ announce, clearAnnouncements }}>
      {children}

      {/* Persistent, dedicated accessibility live regions */}
      <VisuallyHidden>
        {/* Polite Live Region (Status Updates) */}
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          id="torquens-a11y-polite"
        >
          {politeMessage}
        </div>

        {/* Assertive Live Region (Alerts & Critical Interrupts) */}
        <div
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          id="torquens-a11y-assertive"
        >
          {assertiveMessage}
        </div>
      </VisuallyHidden>
    </AnnouncerContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────
// HOOK: useAnnounce()
// ─────────────────────────────────────────────────────────────

/**
 * Access the global live region announcer to broadcast updates to screen readers.
 *
 * @example
 * const { announce } = useAnnounce();
 * announce('Filters applied. 12 matching chassis found.', 'polite');
 */
export function useAnnounce(): AnnouncerContextValue {
  const context = useContext(AnnouncerContext);
  if (!context) {
    // Graceful fallback if called outside provider (prevents app crashes)
    return {
      announce: (_msg: string) => {
        if (process.env.NODE_ENV === 'development') {
          console.warn(
            '[TORQUENS a11y] `announce()` was called outside an <AnnouncerProvider />. Wrap your application in <AnnouncerProvider> to broadcast accessibility events.'
          );
        }
      },
      clearAnnouncements: () => {},
    };
  }
  return context;
}

// ─────────────────────────────────────────────────────────────
// DECLARATIVE COMPONENT: <Announcer />
// ─────────────────────────────────────────────────────────────

export interface AnnouncerProps {
  /**
   * The message string to announce upon mounting or updating.
   */
  message?: string;
  /**
   * If true, uses 'polite' live region. If false, uses 'assertive'.
   * @default true
   */
  polite?: boolean;
  /**
   * Milliseconds before clearing message.
   * @default 7000
   */
  clearAfterMs?: number;
}

export function Announcer({
  message,
  polite = true,
  clearAfterMs = 7000,
}: AnnouncerProps) {
  const { announce } = useAnnounce();
  const previousMessageRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (message && message !== previousMessageRef.current) {
      previousMessageRef.current = message;
      announce(message, {
        politeness: polite ? 'polite' : 'assertive',
        clearAfterMs,
      });
    }
  }, [message, polite, clearAfterMs, announce]);

  return null;
}

Announcer.displayName = 'Announcer';