'use client';

import React, { forwardRef, useId, useState, type TextareaHTMLAttributes } from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

export type TextareaVariant = 'obsidian' | 'default' | 'inset' | 'glass';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helper?: string;
  variant?: TextareaVariant;
  showCount?: boolean;
  requiredIndicator?: boolean;
  optionalIndicator?: boolean;
  labelClassName?: string;
  containerClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helper,
      variant = 'obsidian',
      showCount = false,
      maxLength,
      requiredIndicator = false,
      optionalIndicator = false,
      labelClassName,
      containerClassName,
      id,
      disabled,
      className,
      rows = 4,
      value,
      defaultValue,
      onChange,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : generatedId);
    const errorId = `${textareaId}-error`;
    const helperId = `${textareaId}-helper`;

    // Track character length for counter if enabled
    const [charCount, setCharCount] = useState<number>(
      () => String(value ?? defaultValue ?? '').length
    );

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length);
      onChange?.(e);
    };

    const variantStyles: Record<TextareaVariant, string> = {
      obsidian: 'bg-obsidian border-border hover:border-active-border text-primary placeholder:text-muted/60',
      default: 'bg-charcoal/70 border-border hover:border-active-border text-primary placeholder:text-muted/60',
      inset: 'bg-inset border-border/80 hover:border-border text-primary placeholder:text-muted/60 shadow-inner',
      glass: 'bg-graphite/40 backdrop-blur-md border-white/[0.08] hover:border-white/[0.16] text-primary placeholder:text-muted/60',
    };

    const hasError = Boolean(error);

    return (
      <div className={cn('w-full flex flex-col space-y-1.5', containerClassName)}>
        {/* Label Row */}
        {label && (
          <div className="flex items-center justify-between">
            <label
              htmlFor={textareaId}
              className={cn(
                'text-xs uppercase tracking-wider font-semibold text-secondary select-none font-sans',
                labelClassName
              )}
            >
              {label}
              {requiredIndicator && <span className="text-gold ml-1">*</span>}
            </label>

            {optionalIndicator && (
              <span className="text-[11px] tracking-wide text-muted font-sans uppercase">
                Optional
              </span>
            )}
          </div>
        )}

        {/* Textarea Chassis */}
        <div className="relative w-full">
          <textarea
            ref={ref}
            id={textareaId}
            rows={rows}
            maxLength={maxLength}
            disabled={disabled}
            value={value}
            defaultValue={defaultValue}
            onChange={handleChange}
            aria-invalid={hasError}
            aria-describedby={hasError ? errorId : helper ? helperId : undefined}
            className={cn(
              'w-full font-sans text-sm sm:text-base border rounded-md p-3.5',
              'transition-all duration-300 resize-y min-h-25',
              'focus:outline-none',
              // Ambient Gold Focus Glow
              'focus:border-gold focus:ring-1 focus:ring-gold/30 focus:shadow-[0_0_20px_-3px_rgba(197,160,89,0.2)]',
              'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-border',
              variantStyles[variant],
              hasError && [
                'border-red-500/70 text-primary',
                'focus:border-red-500 focus:ring-red-500/30 focus:shadow-[0_0_20px_-3px_rgba(239,68,68,0.25)]',
              ],
              className
            )}
            {...props}
          />
        </div>

        {/* Footer: Error/Helper + Character Counter */}
        <div className="flex items-center justify-between gap-2 pt-0.5">
          <div className="flex-1">
            {hasError ? (
              <div id={errorId} className="flex items-center gap-1.5 text-xs text-red-400 font-sans animate-fade-in">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            ) : helper ? (
              <p id={helperId} className="text-xs text-muted font-sans leading-relaxed">
                {helper}
              </p>
            ) : null}
          </div>

          {showCount && (
            <span className="text-[11px] font-mono text-muted select-none shrink-0">
              {charCount}
              {maxLength ? `/${maxLength}` : ''}
            </span>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';