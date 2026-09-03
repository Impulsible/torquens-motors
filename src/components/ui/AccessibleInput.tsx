'use client';

import React, {
  forwardRef,
  useId,
  InputHTMLAttributes,
  ReactNode,
} from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/utils/cn';
import { VisuallyHidden } from './VisuallyHidden';

// ─────────────────────────────────────────────────────────────
// PROPS INTERFACE
// ─────────────────────────────────────────────────────────────

export interface AccessibleInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /**
   * Accessible text or element label for the input.
   */
  label: ReactNode;
  /**
   * If true, the label is visually hidden but read by screen readers.
   * @default false
   */
  hideLabel?: boolean;
  /**
   * Error message displayed below the input. Triggers `aria-invalid`.
   */
  error?: string;
  /**
   * Explanatory helper text displayed below the input.
   */
  helper?: string;
  /**
   * Visual and accessible required marker.
   * @default false
   */
  required?: boolean;
  /**
   * Visual size scale of the input surface.
   * @default 'md'
   */
  inputSize?: 'sm' | 'md' | 'lg';
  /**
   * Optional icon rendered at the start of the input.
   */
  leftIcon?: ReactNode;
  /**
   * Optional icon rendered at the end of the input.
   */
  rightIcon?: ReactNode;
  /**
   * Fixed text prefix (e.g. "CHF", "https://", "VIN:").
   */
  prefixText?: string;
  /**
   * Fixed text suffix (e.g. "KM", "EUR").
   */
  suffixText?: string;
  /**
   * Custom CSS classes applied to the outer wrapper container.
   */
  containerClassName?: string;
  /**
   * Custom CSS classes applied directly to the `<input>` element.
   */
  inputClassName?: string;
  /**
   * Custom CSS classes applied to the `<label>` element.
   */
  labelClassName?: string;
}

// ─────────────────────────────────────────────────────────────
// SIZE MAPS
// ─────────────────────────────────────────────────────────────

const SIZE_STYLES = {
  sm: 'h-9 px-3 text-xs sm:text-xs',
  md: 'h-11 px-3.5 text-base sm:text-sm',
  lg: 'h-13 px-4 text-base sm:text-base',
} as const;

// ─────────────────────────────────────────────────────────────
// PRODUCTION ACCESSIBLE INPUT COMPONENT
// ─────────────────────────────────────────────────────────────

export const AccessibleInput = forwardRef<HTMLInputElement, AccessibleInputProps>(
  function AccessibleInput(
    {
      label,
      hideLabel = false,
      error,
      helper,
      required = false,
      inputSize = 'md',
      leftIcon,
      rightIcon,
      prefixText,
      suffixText,
      id,
      className,
      containerClassName,
      inputClassName,
      labelClassName,
      disabled,
      'aria-describedby': customAriaDescribedBy,
      ...props
    },
    ref
  ) {
    // Generate stable SSR-safe unique IDs
    const generatedId = useId();
    const inputId = id || `torquens-input-${generatedId}`;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    // Construct compound aria-describedby
    const describedByList = [
      customAriaDescribedBy,
      error ? errorId : null,
      helper ? helperId : null,
    ]
      .filter(Boolean)
      .join(' ');

    const hasLeftAdornment = Boolean(leftIcon || prefixText);
    const hasRightAdornment = Boolean(rightIcon || suffixText || error);

    return (
      <div className={cn('w-full space-y-1.5 isolate', containerClassName)}>
        {/* Label Architecture */}
        {hideLabel ? (
          <VisuallyHidden as="label" htmlFor={inputId}>
            {label} {required && '(required)'}
          </VisuallyHidden>
        ) : (
          <label
            htmlFor={inputId}
            className={cn(
              'block text-xs font-mono font-medium uppercase tracking-wider text-secondary select-none',
              disabled && 'opacity-50 cursor-not-allowed',
              labelClassName
            )}
          >
            {label}
            {required && (
              <span
                aria-hidden="true"
                className="ml-1 text-amber-400 font-sans"
              >
                *
              </span>
            )}
            {required && <VisuallyHidden>(required)</VisuallyHidden>}
          </label>
        )}

        {/* Input Interactive Surface Box */}
        <div className="relative flex items-center">
          {/* Left Adornment / Icon */}
          {hasLeftAdornment && (
            <div className="pointer-events-none absolute left-3.5 flex items-center gap-1.5 text-muted select-none z-10">
              {leftIcon && <span className="h-4 w-4 shrink-0 text-secondary">{leftIcon}</span>}
              {prefixText && (
                <span className="font-mono text-xs uppercase tracking-wider text-muted/80">
                  {prefixText}
                </span>
              )}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            required={required}
            aria-required={required}
            aria-invalid={Boolean(error)}
            aria-describedby={describedByList || undefined}
            aria-errormessage={error ? errorId : undefined}
            className={cn(
              // Layout & Reset
              'w-full bg-zinc-900/90 text-primary rounded-lg border font-sans',
              'transition-all duration-200 outline-hidden',
              // Sizing & Adornment Padding Offsets
              SIZE_STYLES[inputSize],
              hasLeftAdornment && (prefixText ? 'pl-16' : 'pl-10'),
              hasRightAdornment && 'pr-10',
              // Typography & Placeholder
              'placeholder:text-zinc-500 placeholder:font-normal',
              // Standard vs Error Borders
              error
                ? 'border-red-500/80 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 text-red-200'
                : 'border-white/10 focus:border-amber-400/80 focus:ring-2 focus:ring-amber-400/20 hover:border-white/20',
              // Disabled state
              'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-white/10',
              inputClassName,
              className
            )}
            {...props}
          />

          {/* Right Adornment / Icons / Error Alert */}
          {hasRightAdornment && (
            <div className="pointer-events-none absolute right-3 flex items-center gap-1.5 text-muted select-none">
              {suffixText && (
                <span className="font-mono text-xs uppercase tracking-wider text-muted/80">
                  {suffixText}
                </span>
              )}
              {error && !rightIcon ? (
                <AlertCircle className="h-4 w-4 text-red-400" aria-hidden="true" />
              ) : (
                rightIcon && <span className="h-4 w-4 text-secondary">{rightIcon}</span>
              )}
            </div>
          )}
        </div>

        {/* Dynamic Live Error Message */}
        {error && (
          <p
            id={errorId}
            role="alert"
            aria-live="polite"
            className="flex items-center gap-1.5 text-xs text-red-400 font-sans pt-0.5 animate-in fade-in duration-200"
          >
            <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </p>
        )}

        {/* Contextual Helper Message */}
        {helper && !error && (
          <p
            id={helperId}
            className="text-xs text-zinc-400 font-sans leading-relaxed pt-0.5"
          >
            {helper}
          </p>
        )}
      </div>
    );
  }
);

AccessibleInput.displayName = 'AccessibleInput';