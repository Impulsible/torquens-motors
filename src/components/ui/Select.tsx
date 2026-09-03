'use client';

import React, { forwardRef, useId, type SelectHTMLAttributes, type ReactNode } from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

export type SelectVariant = 'obsidian' | 'default' | 'inset' | 'glass';
export type SelectSize = 'sm' | 'md' | 'lg';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  helper?: string;
  options: SelectOption[];
  placeholder?: string;
  variant?: SelectVariant;
  size?: SelectSize;
  leftIcon?: ReactNode;
  requiredIndicator?: boolean;
  optionalIndicator?: boolean;
  labelClassName?: string;
  containerClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helper,
      options,
      placeholder,
      variant = 'obsidian',
      size = 'md',
      leftIcon,
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
    const generatedId = useId();
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : generatedId);
    const errorId = `${selectId}-error`;
    const helperId = `${selectId}-helper`;

    const variantStyles: Record<SelectVariant, string> = {
      obsidian: 'bg-obsidian border-border hover:border-active-border text-primary',
      default: 'bg-charcoal/70 border-border hover:border-active-border text-primary',
      inset: 'bg-inset border-border/80 hover:border-border text-primary shadow-inner',
      glass: 'bg-graphite/40 backdrop-blur-md border-white/[0.08] hover:border-white/[0.16] text-primary',
    };

    const sizeStyles: Record<SelectSize, { select: string; icon: string; leftPad: string }> = {
      sm: { select: 'h-9 text-xs rounded-[5px]', icon: 'h-3.5 w-3.5', leftPad: leftIcon ? 'pl-9' : 'pl-3' },
      md: { select: 'h-11 text-sm rounded-md', icon: 'h-4 w-4', leftPad: leftIcon ? 'pl-10' : 'pl-3.5' },
      lg: { select: 'h-13 text-base rounded-md', icon: 'h-5 w-5', leftPad: leftIcon ? 'pl-12' : 'pl-4' },
    };

    const hasError = Boolean(error);

    return (
      <div className={cn('w-full flex flex-col space-y-1.5', containerClassName)}>
        {/* Label Row */}
        {label && (
          <div className="flex items-center justify-between">
            <label
              htmlFor={selectId}
              className={cn(
                'text-xs uppercase tracking-wider font-semibold text-secondary select-none font-sans cursor-pointer',
                disabled && 'cursor-not-allowed opacity-40',
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

        {/* Select Interactive Chassis */}
        <div className="relative flex items-center w-full group">
          {leftIcon && (
            <div
              className={cn(
                'absolute left-0 top-0 h-full flex items-center justify-center pointer-events-none text-muted transition-colors group-focus-within:text-gold',
                size === 'sm' ? 'w-9' : size === 'lg' ? 'w-12' : 'w-10'
              )}
            >
              <span className={cn('flex items-center justify-center shrink-0', sizeStyles[size].icon)}>
                {leftIcon}
              </span>
            </div>
          )}

          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            aria-invalid={hasError}
            aria-describedby={hasError ? errorId : helper ? helperId : undefined}
            className={cn(
              'w-full font-sans border transition-all duration-300 appearance-none pr-10 cursor-pointer',
              'focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 focus:shadow-[0_0_20px_-3px_rgba(197,160,89,0.2)]',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              variantStyles[variant],
              sizeStyles[size].select,
              sizeStyles[size].leftPad,
              hasError && 'border-red-500/70 focus:border-red-500 focus:ring-red-500/30',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled className="bg-graphite text-muted">
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className="bg-graphite text-primary py-1 cursor-pointer"
              >
                {option.label}
              </option>
            ))}
          </select>

          {/* Machined Chevron */}
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted group-focus-within:text-gold transition-transform duration-200 group-focus-within:rotate-180">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>

        {/* Error / Helper */}
        {hasError ? (
          <div id={errorId} className="flex items-center gap-1.5 pt-0.5 text-xs text-red-400 font-sans animate-fade-in">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        ) : helper ? (
          <p id={helperId} className="text-xs text-muted font-sans pt-0.5 leading-relaxed">
            {helper}
          </p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';