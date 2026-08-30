'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Button } from './Button';
import { cn } from '@/utils/cn';
import type { UsePaginationReturn } from '@/hooks/usePagination';

export interface PaginationProps {
  pagination: UsePaginationReturn;
  className?: string;
  showItemCount?: boolean;
}

export function Pagination({
  pagination,
  className,
  showItemCount = true,
}: PaginationProps) {
  const {
    page,
    totalPages,
    totalItems,
    fromItem,
    toItem,
    hasNextPage,
    hasPrevPage,
    goToPage,
    nextPage,
    prevPage,
    pageRange,
  } = pagination;

  if (totalPages <= 1) return null;

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border/60',
        className
      )}
    >
      {/* Item Counter Display */}
      {showItemCount && (
        <div className="text-xs font-sans text-muted">
          Showing <strong className="text-primary font-semibold">{fromItem}</strong> –{' '}
          <strong className="text-primary font-semibold">{toItem}</strong> of{' '}
          <strong className="text-primary font-semibold">{totalItems}</strong> vehicles
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex items-center gap-1.5">
        {/* Previous Button */}
        <Button
          variant="secondary"
          size="sm"
          onClick={prevPage}
          disabled={!hasPrevPage}
          className="px-2.5 py-1.5 text-xs border-border hover:border-gold/40"
          aria-label="Previous Page"
        >
          <ChevronLeft size={16} />
          <span className="hidden sm:inline ml-1">Previous</span>
        </Button>

        {/* Numeric Page Buttons */}
        <div className="flex items-center gap-1">
          {pageRange.map((item, index) => {
            if (item === 'ellipsis') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="w-8 h-8 flex items-center justify-center text-muted"
                >
                  <MoreHorizontal size={14} />
                </span>
              );
            }

            const isCurrent = item === page;

            return (
              <button
                key={item}
                onClick={() => goToPage(item)}
                className={cn(
                  'w-8 h-8 rounded-lg text-xs font-sans font-semibold transition-all duration-200 border',
                  isCurrent
                    ? 'bg-gold text-obsidian border-gold shadow-goldGlowSm'
                    : 'bg-inset text-secondary border-border hover:border-active-border hover:text-primary'
                )}
                aria-current={isCurrent ? 'page' : undefined}
              >
                {item}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <Button
          variant="secondary"
          size="sm"
          onClick={nextPage}
          disabled={!hasNextPage}
          className="px-2.5 py-1.5 text-xs border-border hover:border-gold/40"
          aria-label="Next Page"
        >
          <span className="hidden sm:inline mr-1">Next</span>
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
}

export default Pagination;