import React, { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/utils/cn';

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                   */
/* -------------------------------------------------------------------------- */

export type InputVariant = 'default' | 'obsidian' | 'inset' | 'glass';
export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helper?: string;
  variant?: InputVariant;
  size?: InputSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  leftAddon?: string | ReactNode;
  rightAddon?: string | ReactNode;
  requiredIndicator?: boolean;
  optionalIndicator?: boolean;
  labelClassName?: string;
  containerClassName?: string;
}

/* -------------------------------------------------------------------------- */
/*                                 INPUT ROOT                                 */
/* -------------------------------------------------------------------------- */

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helper,
      variant = 'obsidian',
      size = 'md',
      leftIcon,
      rightIcon,
      leftAddon,
      rightAddon,
      requiredIndicator = false,
      optionalIndicator = false,
      labelClassName,
      containerClassName,
      id,
      disabled,
      className,
      ...props
    },
    ref
  ) => {
    // Generate accessible fallback IDs
    const generatedId = useId();
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : generatedId);
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    // 🎨 Variant Styling tailored to dark luxury aesthetic
    const variantStyles: Record<InputVariant, string> = {
      // Obsidian deep black chassis
      obsidian: 'bg-obsidian border-border hover:border-active-border text-primary placeholder:text-muted/60',

      // Charcoal elevation with soft definition
      default: 'bg-charcoal/70 border-border hover:border-active-border text-primary placeholder:text-muted/60',

      // Deep recessed inset (ideal for spec sheets, telemetry & numeric inputs)
      inset: 'bg-inset border-border/80 hover:border-border text-primary placeholder:text-muted/60 shadow-inner',

      // Frosted glassmorphism
      glass: 'bg-graphite/40 backdrop-blur-md border-white/[0.08] hover:border-white/[0.16] text-primary placeholder:text-muted/60',
    };

    // 📐 Sizing Architecture
    const sizeStyles: Record<InputSize, { input: string; icon: string; leftPad: string; rightPad: string }> = {
      sm: {
        input: 'h-9 text-xs rounded-[5px]',
        icon: 'h-3.5 w-3.5',
        leftPad: leftIcon || leftAddon ? 'pl-9' : 'px-3',
        rightPad: rightIcon || rightAddon ? 'pr-9' : 'px-3',
      },
      md: {
        input: 'h-11 text-sm rounded-md',
        icon: 'h-4 w-4',
        leftPad: leftIcon || leftAddon ? 'pl-10' : 'px-4',
        rightPad: rightIcon || rightAddon ? 'pr-10' : 'px-4',
      },
      lg: {
        input: 'h-13 text-base rounded-md',
        icon: 'h-5 w-5',
        leftPad: leftIcon || leftAddon ? 'pl-12' : 'px-4.5',
        rightPad: rightIcon || rightAddon ? 'pr-12' : 'px-4.5',
      },
    };

    const hasError = Boolean(error);

    return (
      <div className={cn('w-full flex flex-col space-y-1.5', containerClassName)}>
        {/* Label Header */}
        {label && (
          <div className="flex items-center justify-between">
            <label
              htmlFor={inputId}
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

        {/* Input Interactive Chassis */}
        <div className="relative flex items-center w-full group">
          {/* Left Icon / Addon */}
          {(leftIcon || leftAddon) && (
            <div
              className={cn(
                'absolute left-0 top-0 h-full flex items-center justify-center pointer-events-none text-muted transition-colors duration-200 group-focus-within:text-gold',
                size === 'sm' ? 'w-9' : size === 'lg' ? 'w-12' : 'w-10'
              )}
            >
              {leftIcon ? (
                <span className={cn('flex items-center justify-center shrink-0', sizeStyles[size].icon)}>
                  {leftIcon}
                </span>
              ) : (
                <span className="text-xs font-mono font-medium text-secondary">{leftAddon}</span>
              )}
            </div>
          )}

          {/* Main Input Element */}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={hasError}
            aria-describedby={hasError ? errorId : helper ? helperId : undefined}
            className={cn(
              // Layout & Typography
              'w-full font-sans border transition-all duration-300',
              'focus:outline-none',
              // Ambient Gold Focus Glow
              'focus:border-gold focus:ring-1 focus:ring-gold/30 focus:shadow-[0_0_20px_-3px_rgba(197,160,89,0.2)]',
              // Disabled States
              'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-border',
              // Variant & Size Dynamic Mapping
              variantStyles[variant],
              sizeStyles[size].input,
              sizeStyles[size].leftPad,
              sizeStyles[size].rightPad,
              // Error State Overrides
              hasError && [
                'border-red-500/70 text-primary',
                'focus:border-red-500 focus:ring-red-500/30 focus:shadow-[0_0_20px_-3px_rgba(239,68,68,0.25)]',
              ],
              className
            )}
            {...props}
          />

          {/* Right Icon / Addon */}
          {(rightIcon || rightAddon) && (
            <div
              className={cn(
                'absolute right-0 top-0 h-full flex items-center justify-center text-muted transition-colors duration-200 group-focus-within:text-gold',
                size === 'sm' ? 'w-9' : size === 'lg' ? 'w-12' : 'w-10'
              )}
            >
              {rightIcon ? (
                <span className={cn('flex items-center justify-center shrink-0', sizeStyles[size].icon)}>
                  {rightIcon}
                </span>
              ) : (
                <span className="text-xs font-mono font-medium text-secondary pr-3">{rightAddon}</span>
              )}
            </div>
          )}
        </div>

        {/* Error Validation Message */}
        {hasError && (
          <div id={errorId} className="flex items-center gap-1.5 pt-0.5 text-xs text-red-400 font-sans animate-fade-in">
            <svg
              className="h-3.5 w-3.5 shrink-0 text-red-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Helper Description */}
        {helper && !hasError && (
          <p id={helperId} className="text-xs text-muted font-sans pt-0.5 leading-relaxed">
            {helper}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';