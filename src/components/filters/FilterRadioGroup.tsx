'use client';

import React from 'react';
import { cn } from '@/utils/cn';

export interface RadioOption {
  id: string;
  label: string;
  count?: number;
}

interface FilterRadioGroupProps {
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function FilterRadioGroup({
  options,
  value,
  onChange,
  className,
}: FilterRadioGroupProps) {
  return (
    <div className={cn('space-y-1', className)}>
      {options.map((option) => {
        const isSelected = value === option.id;

        return (
          <label
            key={option.id}
            className={cn(
              'flex items-center justify-between py-1.5 px-2 rounded-lg cursor-pointer group transition-all duration-150 select-none',
              isSelected ? 'bg-gold/10 border border-gold/30' : 'hover:bg-charcoal/50 border border-transparent'
            )}
          >
            <div className="flex items-center gap-2.5">
              <div
                onClick={() => onChange(option.id)}
                className={cn(
                  'w-4 h-4 rounded-full border flex items-center justify-center transition-all duration-200',
                  isSelected
                    ? 'border-gold bg-gold/20'
                    : 'border-border bg-inset group-hover:border-active-border'
                )}
              >
                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-gold" />}
              </div>

              <span
                className={cn(
                  'text-xs font-sans transition-colors',
                  isSelected ? 'text-gold font-semibold' : 'text-secondary group-hover:text-primary'
                )}
              >
                {option.label}
              </span>
            </div>

            {option.count !== undefined && (
              <span className="text-[10px] font-mono text-muted">
                {option.count.toLocaleString()}
              </span>
            )}
          </label>
        );
      })}
    </div>
  );
}