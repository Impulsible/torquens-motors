/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Search,
  X,
  TrendingUp,
  Clock,
  Car,
  Loader2,
  ChevronRight,
  ShieldCheck,
  CornerDownLeft,
} from 'lucide-react';

import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';
import { getPopularSearches, getSearchSuggestions } from '@/actions/vehicles';

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                   */
/* -------------------------------------------------------------------------- */

export interface SearchSuggestion {
  type: string;
  label: string;
  value: string;
  image?: string;
  count?: number;
}

export interface SearchInputProps {
  className?: string;
  placeholder?: string;
  onSearch?: (query: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onSubmit?: (query: string) => void;
  autoFocus?: boolean;
  defaultValue?: string;
  /** Compact mode for header bars */
  compact?: boolean;
}

const RECENT_KEY = 'torquens_recent_searches';
const MAX_RECENT = 6;

/* -------------------------------------------------------------------------- */
/*                             SEARCH INPUT ROOT                              */
/* -------------------------------------------------------------------------- */

export function SearchInput({
  className,
  placeholder = 'Search make, model, VIN, horsepower, or bespoke spec...',
  onSearch,
  onFocus,
  onBlur,
  onSubmit,
  autoFocus = false,
  defaultValue = '',
  compact = false,
}: SearchInputProps) {
  const router = useRouter();

  const [query, setQuery] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [popularSearches, setPopularSearches] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Load popular + recent on mount ──────────────────────────────────── */
  useEffect(() => {
    getPopularSearches()
      .then((results) => {
        if (Array.isArray(results) && results.length > 0) {
          setPopularSearches(results as unknown as string[]);
        } else {
          setPopularSearches(['Porsche 911', 'Ferrari', 'AMG G63', 'Range Rover']);
        }
      })
      .catch(() => setPopularSearches(['Porsche 911', 'Ferrari', 'AMG G63', 'Range Rover']));

    try {
      const saved = localStorage.getItem(RECENT_KEY);
      if (saved) setRecentSearches(JSON.parse(saved).slice(0, MAX_RECENT));
    } catch {
      /* silent */
    }
  }, []);

  /* ── Click outside dismisses dropdown ────────────────────────────────── */
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
        onBlur?.();
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [onBlur]);

  /* ── Debounced suggestion fetch ──────────────────────────────────────── */
  const fetchSuggestions = useCallback(async (q: string) => {
    if (!q || q.length < 2) {
      setSuggestions([]);
      return;
    }
    setIsLoading(true);
    try {
      const results = await getSearchSuggestions(q);
      setSuggestions(results as unknown as SearchSuggestion[]);
    } catch {
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.length >= 2) {
      setIsOpen(true);
      debounceRef.current = setTimeout(() => fetchSuggestions(value), 280);
    } else {
      setSuggestions([]);
      setIsOpen(true);
    }
  };

  /* ── Persist recent searches ─────────────────────────────────────────── */
  const saveRecent = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const next = [trimmed, ...prev.filter((s) => s.toLowerCase() !== trimmed.toLowerCase())].slice(
        0,
        MAX_RECENT
      );
      try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      } catch {
        /* silent */
      }
      return next;
    });
  };

  const removeRecent = (e: React.MouseEvent, term: string) => {
    e.stopPropagation();
    setRecentSearches((prev) => {
      const next = prev.filter((s) => s !== term);
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      return next;
    });
  };

  const clearAllRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_KEY);
  };

  /* ── Execute search / navigate ───────────────────────────────────────── */
  const handleSearch = (searchQuery: string) => {
    const q = searchQuery.trim();
    if (!q) return;
    saveRecent(q);
    setIsOpen(false);
    setSelectedIndex(-1);
    onBlur?.();
    
    if (onSearch) {
      onSearch(q);
    } else if (onSubmit) {
      onSubmit(q);
    } else {
      router.push(`/vehicles?search=${encodeURIComponent(q)}`);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'vehicle' && suggestion.value) {
      saveRecent(suggestion.label);
      router.push(`/vehicles/${suggestion.value}`);
    } else if (suggestion.type === 'make') {
      saveRecent(suggestion.label);
      router.push(`/vehicles?make=${encodeURIComponent(suggestion.value)}`);
    } else {
      handleSearch(suggestion.label);
    }
    setIsOpen(false);
    setSelectedIndex(-1);
    onBlur?.();
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setSelectedIndex(-1);
    setIsOpen(true);
    inputRef.current?.focus();
  };

  const handleFocus = () => {
    setIsOpen(true);
    onFocus?.();
  };

  const handleBlur = () => {
    // Delay closing to allow click events on suggestions
    setTimeout(() => {
      if (!containerRef.current?.contains(document.activeElement)) {
        setIsOpen(false);
        setSelectedIndex(-1);
        onBlur?.();
      }
    }, 150);
  };

  /* ── Keyboard navigation ─────────────────────────────────────────────── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!isOpen) return;

      const items =
        suggestions.length > 0
          ? suggestions
          : recentSearches.map((s) => ({ type: 'recent' as const, label: s, value: s }));

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, items.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, -1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedIndex >= 0 && items[selectedIndex]) {
          const item = items[selectedIndex];
          if ('type' in item && (item as SearchSuggestion).type) {
            handleSuggestionClick(item as SearchSuggestion);
          } else {
            handleSearch(item.label);
          }
        } else if (query) {
          handleSearch(query);
        }
      } else if (e.key === 'Escape') {
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        onBlur?.();
      }
    };

    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, suggestions, selectedIndex, query, recentSearches]);

  /* ── Scroll selected item into view ──────────────────────────────────── */
  useEffect(() => {
    if (selectedIndex < 0 || !listRef.current) return;
    const el = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'make':
        return <Car className="h-4 w-4 text-gold" />;
      case 'vehicle':
        return <Car className="h-4 w-4 text-gold" />;
      case 'collection':
        return <TrendingUp className="h-4 w-4 text-gold" />;
      default:
        return <Search className="h-4 w-4 text-muted" />;
    }
  };

  const showEmptyState = isOpen && !isLoading && query.length < 2;
  const showSuggestions = isOpen && suggestions.length > 0;
  const showNoResults = isOpen && !isLoading && query.length >= 2 && suggestions.length === 0;

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      {/* ───────────────────────────────────────────────────────────── */}
      {/* INPUT CHASSIS                                                 */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div
        className={cn(
          'group relative flex items-center w-full rounded-lg overflow-hidden border transition-all duration-300',
          'bg-graphite/95 border-border',
          'hover:border-active-border',
          'focus-within:border-gold/60 focus-within:ring-1 focus-within:ring-gold/30',
          'focus-within:shadow-[0_0_24px_-4px_rgba(197,160,89,0.25)]',
          compact ? 'h-10' : 'h-12 sm:h-14'
        )}
      >
        {/* Specular top hairline */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/10 to-transparent z-10"
        />

        {/* Leading icon */}
        <div
          className={cn(
            'pl-4 pr-2 text-muted transition-colors duration-200 group-focus-within:text-gold shrink-0 pointer-events-none',
            compact && 'pl-3'
          )}
        >
          <Search className={cn(compact ? 'h-4 w-4' : 'h-5 w-5')} />
        </div>

        {/* Core input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          autoFocus={autoFocus}
          autoComplete="off"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls="search-suggestions"
          className={cn(
            'w-full bg-transparent text-primary font-sans placeholder:text-muted/60 focus:outline-none',
            compact ? 'text-sm py-2 pr-10' : 'text-sm sm:text-base py-3 pr-12'
          )}
        />

        {/* Trailing actions */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 z-10">
          {isLoading && (
            <Loader2 className="h-4 w-4 text-gold animate-spin" />
          )}
          {query && !isLoading && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear search"
              className="p-1 rounded text-muted hover:text-primary hover:bg-charcoal transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* DROPDOWN PANEL                                                */}
      {/* ───────────────────────────────────────────────────────────── */}
      {isOpen && (
        <div
          id="search-suggestions"
          role="listbox"
          className={cn(
            'absolute top-full left-0 right-0 mt-2 z-50 overflow-hidden',
            'rounded-xl bg-graphite/95 backdrop-blur-2xl border border-border/80 shadow-dropdown',
            'animate-slide-up duration-200 max-h-[min(70vh,480px)] overflow-y-auto'
          )}
        >
          {/* Specular edge */}
          <div
            aria-hidden="true"
            className="pointer-events-none sticky top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-white/12 to-transparent z-20"
          />

          <div ref={listRef}>
            {/* ── LIVE SUGGESTIONS ─────────────────────────────────────── */}
            {showSuggestions && (
              <div className="py-1.5">
                <div className="flex items-center justify-between px-4 py-2">
                  <span className="text-[10px] uppercase tracking-widest font-semibold text-muted font-sans">
                    Instant Matches
                  </span>
                  <Badge variant="gold" size="sm">
                    {suggestions.length}
                  </Badge>
                </div>

                {suggestions.map((suggestion, index) => (
                  <button
                    key={`${suggestion.type}-${suggestion.value}-${index}`}
                    type="button"
                    data-index={index}
                    role="option"
                    aria-selected={index === selectedIndex}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={cn(
                      'flex items-center gap-3 w-full px-4 py-2.5 text-left transition-colors',
                      index === selectedIndex
                        ? 'bg-gold/10 text-primary'
                        : 'hover:bg-charcoal/80 text-secondary hover:text-primary'
                    )}
                  >
                    {/* Thumbnail / Icon */}
                    <div className="shrink-0">
                      {suggestion.image ? (
                        <div className="relative h-10 w-14 rounded-md overflow-hidden bg-charcoal border border-white/5">
                          <Image
                            src={suggestion.image}
                            alt={suggestion.label}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        </div>
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-charcoal border border-border">
                          {getSuggestionIcon(suggestion.type)}
                        </div>
                      )}
                    </div>

                    {/* Label + meta */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-sans font-medium text-primary truncate">
                        {suggestion.label}
                      </div>
                      <div className="text-[11px] font-sans text-muted capitalize">
                        {suggestion.type}
                        {suggestion.count !== undefined && (
                          <span className="text-secondary"> · {suggestion.count} units</span>
                        )}
                      </div>
                    </div>

                    <ChevronRight
                      className={cn(
                        'h-4 w-4 shrink-0 transition-colors',
                        index === selectedIndex ? 'text-gold' : 'text-muted'
                      )}
                    />
                  </button>
                ))}
              </div>
            )}

            {/* ── EMPTY / DISCOVERY STATE ──────────────────────────────── */}
            {showEmptyState && (
              <>
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div className="py-2 border-b border-border/50">
                    <div className="flex items-center justify-between px-4 py-1.5">
                      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-semibold text-muted font-sans">
                        <Clock className="h-3 w-3" />
                        <span>Recent</span>
                      </div>
                      <button
                        type="button"
                        onClick={clearAllRecent}
                        className="text-[10px] text-muted hover:text-red-400 transition-colors font-sans lowercase first-letter:uppercase"
                      >
                        Clear all
                      </button>
                    </div>

                    {recentSearches.map((search, index) => (
                      <div
                        key={search}
                        data-index={index}
                        role="option"
                        aria-selected={index === selectedIndex}
                        onClick={() => handleSearch(search)}
                        className={cn(
                          'group flex items-center justify-between w-full px-4 py-2 cursor-pointer transition-colors',
                          index === selectedIndex
                            ? 'bg-gold/10'
                            : 'hover:bg-charcoal/80'
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Clock className="h-3.5 w-3.5 text-muted shrink-0" />
                          <span className="text-sm font-sans text-secondary group-hover:text-primary truncate">
                            {search}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => removeRecent(e, search)}
                          aria-label={`Remove ${search}`}
                          className="p-1 text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Popular Searches */}
                {popularSearches.length > 0 && (
                  <div className="py-3 px-4">
                    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-semibold text-muted font-sans mb-2.5">
                      <TrendingUp className="h-3 w-3 text-gold" />
                      <span>Popular Inquiries</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {popularSearches.map((search) => (
                        <button
                          key={search}
                          type="button"
                          onClick={() => handleSearch(search)}
                          className="px-3 py-1.5 rounded-full bg-charcoal/80 border border-border text-xs text-secondary hover:text-primary hover:border-gold/40 hover:bg-graphite transition-all font-sans"
                        >
                          {search}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ── NO RESULTS ───────────────────────────────────────────── */}
            {showNoResults && (
              <div className="py-10 px-6 text-center">
                <div className="relative inline-flex mb-3">
                  <div className="absolute inset-0 rounded-full bg-gold/10 blur-lg" />
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-charcoal border border-border text-muted">
                    <Car className="h-5 w-5" />
                  </div>
                </div>
                <p className="text-sm font-sans text-primary font-medium">
                  No instant match for &ldquo;{query}&rdquo;
                </p>
                <p className="mt-1 text-xs text-muted font-sans">
                  Press Enter to search the full archive or request bespoke sourcing.
                </p>
                <button
                  type="button"
                  onClick={() => handleSearch(query)}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gold hover:text-gold-hover transition-colors font-sans"
                >
                  <Search className="h-3.5 w-3.5" />
                  Search for &ldquo;{query}&rdquo;
                  <CornerDownLeft className="h-3 w-3 ml-0.5" />
                </button>
              </div>
            )}
          </div>

          {/* Footer telemetry */}
          <div className="sticky bottom-0 flex items-center justify-between px-4 py-2 border-t border-border/60 bg-charcoal/40 text-[10px] font-mono text-muted">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="rounded bg-obsidian border border-border px-1 py-0.5 text-secondary">↑↓</kbd>
                navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded bg-obsidian border border-border px-1 py-0.5 text-secondary">↵</kbd>
                select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded bg-obsidian border border-border px-1 py-0.5 text-secondary">esc</kbd>
                close
              </span>
            </div>
            <div className="flex items-center gap-1 text-secondary">
              <ShieldCheck className="h-3 w-3 text-emerald" />
              <span>TORQUENS Intelligence</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchInput;