import React, { useEffect, useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  Sparkles 
} from 'lucide-react';
import { cn } from '@/utils/cn';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'gold';

export interface ToastProps {
  type?: ToastType;
  title: string;
  message?: string;
  onClose: () => void;
  duration?: number;
  showProgress?: boolean;
  className?: string;
}

export function Toast({
  type = 'gold',
  title,
  message,
  onClose,
  duration = 5000,
  showProgress = true,
  className,
}: ToastProps) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!duration || duration === Infinity) return;

    const interval = 20; // 20ms steps
    const step = 100 / (duration / interval);

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return prev - step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [duration, onClose]);

  const typeConfig: Record<
    ToastType,
    { border: string; glow: string; iconColor: string; bar: string; icon: React.ReactNode }
  > = {
    gold: {
      border: 'border-gold/40',
      glow: 'shadow-[0_0_20px_-5px_rgba(197,160,89,0.2)]',
      iconColor: 'text-gold',
      bar: 'bg-gold',
      icon: <Sparkles className="h-5 w-5" />,
    },
    success: {
      border: 'border-emerald-border',
      glow: 'shadow-[0_0_20px_-5px_rgba(16,185,129,0.2)]',
      iconColor: 'text-emerald',
      bar: 'bg-emerald',
      icon: <CheckCircle2 className="h-5 w-5" />,
    },
    error: {
      border: 'border-red-500/30',
      glow: 'shadow-[0_0_20px_-5px_rgba(239,68,68,0.25)]',
      iconColor: 'text-red-400',
      bar: 'bg-red-500',
      icon: <AlertCircle className="h-5 w-5" />,
    },
    warning: {
      border: 'border-amber-500/30',
      glow: 'shadow-[0_0_20px_-5px_rgba(245,158,11,0.2)]',
      iconColor: 'text-amber-400',
      bar: 'bg-amber-400',
      icon: <AlertTriangle className="h-5 w-5" />,
    },
    info: {
      border: 'border-sky-500/30',
      glow: 'shadow-[0_0_20px_-5px_rgba(14,165,233,0.2)]',
      iconColor: 'text-sky-400',
      bar: 'bg-sky-400',
      icon: <Info className="h-5 w-5" />,
    },
  };

  const current = typeConfig[type];

  return (
    <div
      role="alert"
      className={cn(
        'relative overflow-hidden rounded-lg bg-graphite/95 backdrop-blur-xl border p-4 sm:p-5',
        'w-full max-w-sm shadow-dropdown animate-slide-up duration-300',
        current.border,
        current.glow,
        className
      )}
    >
      {/* Specular Edge Highlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/12 to-transparent"
      />

      <div className="flex items-start gap-3.5">
        <div className={cn('shrink-0 mt-0.5', current.iconColor)}>
          {current.icon}
        </div>

        <div className="flex-1 min-w-0 pr-1">
          <h4 className="font-sans font-semibold text-sm text-primary tracking-wide">
            {title}
          </h4>
          {message && (
            <p className="mt-1 text-xs text-secondary leading-relaxed font-sans">
              {message}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss notification"
          className="shrink-0 rounded p-1 text-muted hover:text-primary transition-colors focus-visible:ring-1 focus-visible:ring-gold"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Real-time Countdown Progress Bar */}
      {showProgress && duration !== Infinity && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-charcoal">
          <div
            className={cn('h-full transition-all linear duration-75', current.bar)}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}