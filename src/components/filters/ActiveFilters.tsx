'use client';

import React from 'react';
import { X, RotateCcw } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useFilters } from '@/contexts/FilterContext';
import { formatCurrency } from '@/utils/helpers';
import type { FilterState } from '@/types/filters';

export function ActiveFilters() {
  const { filters, removeFilter, clearFilters, hasActiveFilters } = useFilters();

  if (!hasActiveFilters) return null;

  const renderChips = () => {
    const chips: React.ReactNode[] = [];

    // Array Multi-Select Chips
    const arrayKeys: (keyof FilterState)[] = [
      'make',
      'model',
      'bodyType',
      'fuelType',
      'transmission',
      'drivetrain',
      'location',
    ];

    for (const key of arrayKeys) {
      const list = filters[key];
      if (Array.isArray(list) && list.length > 0) {
        list.forEach((val) => {
          chips.push(
            <Badge
              key={`${key}-${val}`}
              variant="gold"
              size="sm"
              className="inline-flex items-center gap-1 py-1 px-2.5"
            >
              <span className="capitalize">{key}:</span>
              <strong className="text-primary font-semibold">{val}</strong>
              <button
                type="button"
                onClick={() => removeFilter(key, val)}
                className="ml-1 hover:text-red-400 transition-colors"
                aria-label={`Remove ${key} filter`}
              >
                <X size={12} />
              </button>
            </Badge>
          );
        });
      }
    }

    // Price Range Chip
    if (filters.priceRange.min || filters.priceRange.max) {
      const minText = filters.priceRange.min
        ? formatCurrency
          ? formatCurrency(filters.priceRange.min)
          : `₦${filters.priceRange.min.toLocaleString()}`
        : '₦0';
      const maxText = filters.priceRange.max
        ? formatCurrency
          ? formatCurrency(filters.priceRange.max)
          : `₦${filters.priceRange.max.toLocaleString()}`
        : 'Max';

      chips.push(
        <Badge
          key="priceRange"
          variant="gold"
          size="sm"
          className="inline-flex items-center gap-1 py-1 px-2.5"
        >
          <span>Budget:</span>
          <strong className="text-primary font-mono">{minText} - {maxText}</strong>
          <button
            type="button"
            onClick={() => removeFilter('priceRange')}
            className="ml-1 hover:text-red-400 transition-colors"
          >
            <X size={12} />
          </button>
        </Badge>
      );
    }

    // Year Range Chip
    if (filters.yearRange.min || filters.yearRange.max) {
      chips.push(
        <Badge
          key="yearRange"
          variant="gold"
          size="sm"
          className="inline-flex items-center gap-1 py-1 px-2.5"
        >
          <span>Year:</span>
          <strong className="text-primary font-mono">
            {filters.yearRange.min || 1990} - {filters.yearRange.max || new Date().getFullYear()}
          </strong>
          <button
            type="button"
            onClick={() => removeFilter('yearRange')}
            className="ml-1 hover:text-red-400 transition-colors"
          >
            <X size={12} />
          </button>
        </Badge>
      );
    }

    // Verified Toggle Chip
    if (filters.verified === true) {
      chips.push(
        <Badge
          key="verified"
          variant="verified"
          size="sm"
          className="inline-flex items-center gap-1 py-1 px-2.5"
        >
          <span>TORQUENS Verified Only</span>
          <button
            type="button"
            onClick={() => removeFilter('verified')}
            className="ml-1 hover:text-red-400 transition-colors"
          >
            <X size={12} />
          </button>
        </Badge>
      );
    }

    // Search String Chip
    if (filters.search) {
      chips.push(
        <Badge
          key="search"
          variant="default"
          size="sm"
          className="inline-flex items-center gap-1 py-1 px-2.5"
        >
          <span>Prompt:</span>
          <strong className="text-primary italic">&quot;{filters.search}&quot;</strong>
          <button
            type="button"
            onClick={() => removeFilter('search')}
            className="ml-1 hover:text-red-400 transition-colors"
          >
            <X size={12} />
          </button>
        </Badge>
      );
    }

    return chips;
  };

  return (
    <div className="flex flex-wrap items-center gap-2 p-3 bg-graphite rounded-xl border border-border shadow-sm">
      <span className="text-xs font-sans text-muted uppercase tracking-wider font-semibold mr-1">
        Active Parameters:
      </span>

      {renderChips()}

      <Button
        variant="ghost"
        size="sm"
        onClick={clearFilters}
        className="ml-auto text-xs py-1 px-2 text-muted hover:text-gold flex items-center gap-1"
      >
        <RotateCcw size={12} />
        <span>Reset All</span>
      </Button>
    </div>
  );
}