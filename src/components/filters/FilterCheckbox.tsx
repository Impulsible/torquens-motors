'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/utils/cn';

interface FilterCheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  count?: number;
  className?: string;
}

export function FilterCheckbox({
  label,
  checked,
  onChange,
  count,
  className,
}: FilterCheckboxProps) {
  return (
    <label
      className={cn(
        'flex items-center justify-between py-1.5 px-2 rounded-lg cursor-pointer group hover:bg-charcoal/50 transition-all duration-150 select-none',
        className
      )}
    >
      <div className="flex items-center gap-2.5">
        <div
          onClick={() => onChange(!checked)}
          className={cn(
            'w-4 h-4 rounded border flex items-center justify-center transition-all duration-200',
            checked
              ? 'bg-gold border-gold text-obsidian shadow-goldGlowSm'
              : 'bg-inset border-border group-hover:border-active-border'
          )}
        >
          {checked && <Check size={11} strokeWidth={3} />}
        </div>

        <span
          className={cn(
            'text-xs font-sans transition-colors',
            checked ? 'text-gold font-semibold' : 'text-secondary group-hover:text-primary'
          )}
        >
          {label}
        </span>
      </div>

      {count !== undefined && (
        <span className="text-[10px] font-mono text-muted group-hover:text-secondary">
          {count.toLocaleString()}
        </span>
      )}
    </label>
  );
}