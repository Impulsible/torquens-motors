'use client';

import React, { useState, ReactNode } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/utils/cn';

interface FilterSectionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  count?: number;
  onToggle?: (isOpen: boolean) => void;
  className?: string;
}

export function FilterSection({
  title,
  children,
  defaultOpen = true,
  count,
  onToggle,
  className,
}: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const handleToggle = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    onToggle?.(nextState);
  };

  return (
    <div className={cn('border-b border-border/60 py-3 last:border-0', className)}>
      <button
        type="button"
        onClick={handleToggle}
        className="flex items-center justify-between w-full text-left group focus:outline-none"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-sans font-semibold text-primary uppercase tracking-wider group-hover:text-gold transition-colors">
            {title}
          </span>
          {count !== undefined && count > 0 && (
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
          )}
        </div>

        <div className="flex items-center gap-2">
          {count !== undefined && count > 0 && (
            <span className="px-2 py-0.5 bg-gold/10 text-gold text-[10px] font-sans font-bold rounded-full border border-gold/20">
              {count}
            </span>
          )}
          <span className="text-muted group-hover:text-primary transition-colors">
            {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </span>
        </div>
      </button>

      {isOpen && (
        <div className="pt-3 pb-1 animate-in fade-in duration-200">
          {children}
        </div>
      )}
    </div>
  );
}