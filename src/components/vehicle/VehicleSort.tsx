'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ChevronDown,
  ArrowUpDown,
  Check,
  Clock,
  CircleDollarSign,
  Calendar,
  Gauge,
  Flame,
  Heart,
} from 'lucide-react';
import { cn } from '@/utils/cn';

export interface SortOption {
  label: string;
  value: string;
  field: string;
  order: 'asc' | 'desc';
  icon?: React.ReactNode;
}

export const SORT_OPTIONS: SortOption[] = [
  {
    label: 'Newest Arrivals',
    value: 'newest',
    field: 'createdAt',
    order: 'desc',
    icon: <Clock size={14} />,
  },
  {
    label: 'Price: High to Low',
    value: 'price-desc',
    field: 'price',
    order: 'desc',
    icon: <CircleDollarSign size={14} />,
  },
  {
    label: 'Price: Low to High',
    value: 'price-asc',
    field: 'price',
    order: 'asc',
    icon: <CircleDollarSign size={14} />,
  },
  {
    label: 'Model Year: Recent First',
    value: 'year-desc',
    field: 'year',
    order: 'desc',
    icon: <Calendar size={14} />,
  },
  {
    label: 'Mileage: Lowest First',
    value: 'mileage-asc',
    field: 'mileage',
    order: 'asc',
    icon: <Gauge size={14} />,
  },
  {
    label: 'Most Viewed',
    value: 'views',
    field: 'views',
    order: 'desc',
    icon: <Flame size={14} />,
  },
  {
    label: 'Collector Favorites',
    value: 'savedCount',
    field: 'savedCount',
    order: 'desc',
    icon: <Heart size={14} />,
  },
];

interface VehicleSortProps {
  className?: string;
  /** Optional callback fired when sort parameter changes */
  onSortChange?: (value: string) => void;
}

export function VehicleSort({ className, onSortChange }: VehicleSortProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentSortValue = searchParams.get('sort') || 'newest';

  // Find active option object
  const activeOption =
    SORT_OPTIONS.find((opt) => opt.value === currentSortValue) ||
    SORT_OPTIONS[0];

  const handleSelectOption = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('sort', value);
      // Reset pagination to page 1 when sort criteria changes
      params.set('page', '1');

      router.push(`/vehicles?${params.toString()}`);
      onSortChange?.(value);
      setIsOpen(false);
    },
    [router, searchParams, onSortChange]
  );

  // Close dropdown on Outside Click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className={cn('relative inline-block text-left', className)} ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Sort vehicles list"
        className={cn(
          'flex items-center gap-2 px-3.5 py-2 rounded-lg border text-xs font-sans font-medium transition-all duration-200 select-none',
          'bg-graphite hover:bg-charcoal border-border hover:border-gold/40 text-primary',
          isOpen && 'border-gold shadow-goldGlowSm bg-charcoal'
        )}
      >
        <ArrowUpDown size={14} className="text-gold shrink-0" />
        
        <span className="hidden sm:inline text-secondary uppercase tracking-widest text-[10px] font-semibold">
          Sort:
        </span>

        <span className="truncate max-w-35 sm:max-w-45 font-medium text-primary">
          {activeOption.label}
        </span>

        <ChevronDown
          size={14}
          className={cn(
            'text-muted transition-transform duration-200 shrink-0 ml-1',
            isOpen && 'rotate-180 text-gold'
          )}
        />
      </button>

      {/* Floating Glassmorphic Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute right-0 mt-2 w-56 sm:w-64 rounded-xl bg-graphite/95 border border-active-border shadow-dropdown z-40 p-1.5 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-150"
        >
          <div className="px-3 py-1.5 mb-1 border-b border-border/60 flex items-center justify-between text-[10px] uppercase font-sans tracking-widest text-muted">
            <span>Sort Registry By</span>
            <span className="text-gold font-mono">{SORT_OPTIONS.length} modes</span>
          </div>

          <div className="space-y-0.5">
            {SORT_OPTIONS.map((option) => {
              const isSelected = option.value === activeOption.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelectOption(option.value)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-sans transition-all duration-150 group text-left',
                    isSelected
                      ? 'bg-gold/15 text-gold font-semibold border border-gold/30'
                      : 'text-secondary hover:text-primary hover:bg-charcoal border border-transparent'
                  )}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span
                      className={cn(
                        'shrink-0 transition-colors',
                        isSelected ? 'text-gold' : 'text-muted group-hover:text-gold'
                      )}
                    >
                      {option.icon}
                    </span>
                    <span className="truncate">{option.label}</span>
                  </div>

                  {isSelected && (
                    <Check size={14} className="text-gold shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default VehicleSort;