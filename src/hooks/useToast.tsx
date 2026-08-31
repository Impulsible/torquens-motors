'use client';

import React, { useState, useCallback, createContext, useContext, ReactNode } from 'react';
import { X, CheckCircle2, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, 'id'>) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // 1. Define hideToast first to prevent reference cyclic issues in showToast
  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // 2. Define showToast with proper deps
  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const duration = toast.duration || 5000;
    const newToast: Toast = { ...toast, id, duration };
    
    setToasts((prev) => [...prev, newToast]);

    // Automatically dismiss the toast after its duration expires
    setTimeout(() => {
      hideToast(id);
    }, duration);
  }, [hideToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, hideToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// ─────────────────────────────────────────────────────────────
// PRO-GRADE TOAST RENDER CONTAINER
// ─────────────────────────────────────────────────────────────
function ToastContainer() {
  const { toasts, hideToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div 
      role="region" 
      aria-live="polite" 
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full px-4 sm:px-0"
    >
      {toasts.map((toast) => {
        // Icon mapper matching our premium concierge scheme
        const Icon = {
          success: CheckCircle2,
          error: AlertCircle,
          warning: AlertTriangle,
          info: Info,
        }[toast.type];

        // Refined champagne/concierge design variant styling
        const variantStyles = {
          success: 'border-emerald-500/20 bg-emerald-500/[0.04] text-emerald-400 shadow-[0_4px_24px_rgba(16,185,129,0.08)]',
          error: 'border-red-500/20 bg-red-500/[0.04] text-red-400 shadow-[0_4px_24px_rgba(239,68,68,0.08)]',
          warning: 'border-gold/20 bg-gold/[0.03] text-gold shadow-[0_4px_24px_rgba(212,175,55,0.08)]',
          info: 'border-blue-500/20 bg-blue-500/[0.04] text-blue-400 shadow-[0_4px_24px_rgba(59,130,246,0.08)]',
        }[toast.type];

        return (
          <div
            key={toast.id}
            className={cn(
              'p-4 rounded-xl border bg-graphite/95 backdrop-blur-md shadow-dropdown flex items-start gap-3.5',
              'transition-all duration-300 ease-out transform animate-slide-up',
              variantStyles
            )}
          >
            <Icon className="h-5 w-5 shrink-0 mt-0.5" />
            
            <div className="flex-1 min-w-0">
              <h4 className="text-xs sm:text-sm font-sans font-semibold tracking-wide text-primary">
                {toast.title}
              </h4>
              {toast.message && (
                <p className="text-xs text-secondary mt-1 leading-relaxed">
                  {toast.message}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => hideToast(toast.id)}
              aria-label="Dismiss message"
              className="shrink-0 text-muted hover:text-primary transition-colors p-0.5 rounded focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/40"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}