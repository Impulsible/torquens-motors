/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

export interface CatalogueSearchProps {
  className?: string;
  placeholder?: string;
}

export function CatalogueSearch({
  className,
  placeholder = 'Search make, model, VIN, or specification...',
}: CatalogueSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSearch = searchParams.get('search') || '';
  const [query, setQuery] = useState(currentSearch);

  // Sync internal state when URL searchParams update externally
  useEffect(() => {
    setQuery(currentSearch);
  }, [currentSearch]);

  const executeSearch = (searchTerm: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const trimmed = searchTerm.trim();

    if (trimmed) {
      params.set('search', trimmed);
    } else {
      params.delete('search');
    }

    // Reset pagination to page 1 on new search
    params.delete('page');

    startTransition(() => {
      router.push(`/vehicles?${params.toString()}`);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query);
  };

  const handleClear = () => {
    setQuery('');
    executeSearch('');
  };

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className={cn('relative w-full group', className)}
    >
      {/* Search Input Chassis with Ambient Gold Focus Ring */}
      <div
        className={cn(
          'relative flex items-center w-full rounded-md overflow-hidden font-sans border transition-all duration-300',
          'bg-charcoal/80 backdrop-blur-md border-border/80',
          'hover:border-active-border',
          'group-focus-within:border-gold/60 group-focus-within:ring-1 group-focus-within:ring-gold/30',
          'group-focus-within:shadow-[0_0_20px_-3px_rgba(197,160,89,0.2)]'
        )}
      >
        {/* Leading Search Icon */}
        <div className="pl-3.5 pr-2 text-muted transition-colors duration-200 group-focus-within:text-gold shrink-0 pointer-events-none">
          <Search className="h-4 w-4" />
        </div>

        {/* Core Search Field */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'w-full h-11 bg-transparent text-primary text-sm font-sans',
            'placeholder:text-muted/60 focus:outline-none',
            query ? 'pr-24' : 'pr-20'
          )}
        />

        {/* Action Toolbar (Clear Button + Submit CTA) */}
        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 z-10">
          {query && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear search query"
              className="p-1 rounded text-muted hover:text-primary hover:bg-graphite transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-gold"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}

          <Button
            type="submit"
            size="sm"
            variant="primary"
            isLoading={isPending}
            className="h-8 px-3 text-[10px] font-semibold uppercase tracking-wider shadow-sm shrink-0"
          >
            <span>Search</span>
          </Button>
        </div>
      </div>
    </form>
  );
}

export default CatalogueSearch;