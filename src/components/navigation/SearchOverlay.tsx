/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  X,
  Clock,
  TrendingUp,
  ArrowRight,
  CornerDownLeft,
  Sparkles,
  Gauge,
  Zap,
  Car,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Price } from '@/components/ui/Price';
import { cn } from '@/utils/cn';

export interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSearchSubmit?: (query: string) => void;
}

export interface QuickSearchResult {
  id: string;
  slug: string;
  make: string;
  model: string;
  year: number;
  price: number;
  currency: string;
  horsepower: number;
  mileage: number;
  image: string;
  status: 'AVAILABLE' | 'ALLOCATION' | 'RESERVED';
}

const POPULAR_SEARCHES = [
  'Porsche 911 GT3 RS',
  'Ferrari 812 GTS',
  'Mercedes-AMG G63',
  'Aston Martin DBS',
  'Lamborghini Revuelto',
  'Rolls-Royce Spectre',
];

const CURATED_MARQUES = [
  { name: 'Porsche', count: 18 },
  { name: 'Ferrari', count: 12 },
  { name: 'Aston Martin', count: 9 },
  { name: 'McLaren', count: 7 },
  { name: 'Mercedes-AMG', count: 14 },
  { name: 'Lamborghini', count: 8 },
];

const MOCK_INSTANT_MATCHES: QuickSearchResult[] = [
  {
    id: '1',
    slug: 'porsche-911-gt3-rs-2024',
    make: 'Porsche',
    model: '911 GT3 RS (992)',
    year: 2024,
    price: 315000,
    currency: 'USD',
    horsepower: 518,
    mileage: 1200,
    image: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=600&auto=format&fit=crop',
    status: 'ALLOCATION',
  },
  {
    id: '2',
    slug: 'ferrari-812-gts-2023',
    make: 'Ferrari',
    model: '812 GTS V12',
    year: 2023,
    price: 440000,
    currency: 'USD',
    horsepower: 789,
    mileage: 3400,
    image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=600&auto=format&fit=crop',
    status: 'AVAILABLE',
  },
  {
    id: '3',
    slug: 'aston-martin-dbs-superleggera',
    make: 'Aston Martin',
    model: 'DBS Superleggera Volante',
    year: 2023,
    price: 320000,
    currency: 'USD',
    horsepower: 715,
    mileage: 4800,
    image: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=600&auto=format&fit=crop',
    status: 'AVAILABLE',
  },
];

export function SearchOverlay({ isOpen, onClose, onSearchSubmit }: SearchOverlayProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [instantResults, setInstantResults] = useState<QuickSearchResult[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('torquens_recent_searches');
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      } else {
        setRecentSearches(['Porsche GT3 RS', 'V12 Naturally Aspirated', 'Under $300k']);
      }
    } catch {
      // Fallback
    }
  }, []);

  const saveSearchTerm = useCallback((term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;

    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, 6);
      try {
        localStorage.setItem('torquens_recent_searches', JSON.stringify(updated));
      } catch {
        // Silent catch
      }
      return updated;
    });
  }, []);

  const removeRecentSearch = (e: React.MouseEvent, termToRemove: string) => {
    e.stopPropagation();
    setRecentSearches((prev) => {
      const updated = prev.filter((term) => term !== termToRemove);
      localStorage.setItem('torquens_recent_searches', JSON.stringify(updated));
      return updated;
    });
  };

  const clearAllRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem('torquens_recent_searches');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      const timer = setTimeout(() => inputRef.current?.focus(), 80);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'unset';
        clearTimeout(timer);
      };
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setInstantResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const debounceTimer = setTimeout(() => {
      const filtered = MOCK_INSTANT_MATCHES.filter(
        (car) =>
          car.make.toLowerCase().includes(query.toLowerCase()) ||
          car.model.toLowerCase().includes(query.toLowerCase())
      );
      setInstantResults(filtered);
      setIsSearching(false);
    }, 200);

    return () => clearTimeout(debounceTimer);
  }, [query]);

  const executeSearch = (searchTerm: string) => {
    const finalQuery = searchTerm.trim();
    if (!finalQuery) return;

    saveSearchTerm(finalQuery);
    onSearchSubmit?.(finalQuery);
    onClose();
    router.push(`/vehicles?search=${encodeURIComponent(finalQuery)}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Vehicle Search Overlay"
      className="fixed inset-0 z-50 flex flex-col items-center overflow-y-auto bg-obsidian/90 backdrop-blur-2xl animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 bg-gold/10 blur-[130px] rounded-full"
        style={{ width: 800, height: 450 }}
      />

      <div
        ref={containerRef}
        className="relative z-10 w-full max-w-3xl px-4 pt-12 pb-20 sm:pt-20"
      >
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-2">
            <Badge variant="gold" size="sm" leftIcon={<Sparkles className="h-3 w-3" />}>
              Concierge Search
            </Badge>
            <span className="text-xs text-muted font-sans hidden sm:inline">
              Global inventory, allocations & provenance
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close search overlay"
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-mono text-muted hover:text-primary hover:bg-charcoal transition-colors border border-border/60 cursor-pointer"
          >
            <span>ESC</span>
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="relative group" noValidate>
          <div className="relative flex items-center rounded-xl bg-graphite/95 border border-border shadow-card overflow-hidden transition-all duration-300 group-focus-within:border-gold/60 group-focus-within:shadow-[0_0_35px_-5px_rgba(197,160,89,0.25)]">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/15 to-transparent z-10"
            />

            <div className="pl-5 text-muted transition-colors group-focus-within:text-gold">
              <Search className="h-6 w-6" />
            </div>

            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search make, model, VIN, horsepower, or bespoke spec..."
              className="w-full bg-transparent py-4.5 pl-4 pr-24 text-base sm:text-lg font-sans text-primary placeholder:text-muted/60 focus:outline-none"
            />

            <div className="pr-3 flex items-center gap-2">
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    inputRef.current?.focus();
                  }}
                  aria-label="Clear search input"
                  className="rounded p-1 text-muted hover:text-primary hover:bg-charcoal transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              )}

              <Button
                type="submit"
                variant="gold"
                size="sm"
                isLoading={isSearching}
                rightIcon={<CornerDownLeft className="h-3 w-3" />}
                className="hidden sm:inline-flex h-9 text-xs uppercase tracking-wider font-semibold cursor-pointer"
              >
                Search
              </Button>
            </div>
          </div>
        </form>

        <div className="mt-8 space-y-8">
          {query.trim() ? (
            <div className="space-y-4 animate-slide-up">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs uppercase tracking-wider font-semibold text-secondary font-sans">
                  Instant Dossier Matches ({instantResults.length})
                </span>
                <button
                  type="button"
                  onClick={() => executeSearch(query)}
                  className="text-xs text-gold hover:text-gold-hover font-sans flex items-center gap-1 font-medium transition-colors cursor-pointer"
                >
                  <span>Explore all matching listings</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

              {instantResults.length > 0 ? (
                <div className="grid gap-3">
                  {instantResults.map((car) => (
                    <Link
                      key={car.id}
                      href={`/vehicles/${car.slug}`}
                      onClick={onClose}
                      className="group flex items-center justify-between p-3 sm:p-3.5 rounded-lg bg-graphite/60 border border-border hover:border-gold/50 hover:bg-charcoal/70 transition-all duration-300 cursor-pointer"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="relative h-14 w-20 sm:h-16 sm:w-24 rounded-md overflow-hidden bg-charcoal shrink-0 border border-white/5">
                          <Image
                            src={car.image}
                            alt={`${car.make} ${car.model}`}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase font-semibold tracking-wider text-gold font-sans">
                              {car.make}
                            </span>
                            <Badge
                              variant={car.status === 'ALLOCATION' ? 'gold' : 'success'}
                              size="sm"
                            >
                              {car.status}
                            </Badge>
                          </div>

                          <h4 className="font-serif text-base text-primary truncate group-hover:text-gold transition-colors">
                            {car.model}
                          </h4>

                          <div className="flex items-center gap-3 mt-0.5 text-xs text-muted font-sans">
                            <span className="flex items-center gap-1">
                              <Zap className="h-3 w-3 text-secondary" /> {car.horsepower} BHP
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Gauge className="h-3 w-3 text-secondary" /> {car.mileage.toLocaleString()} KM
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 pl-3">
                        <Price amount={car.price} currency={car.currency} size="md" variant="gold" />
                        <div className="h-8 w-8 rounded-full bg-charcoal flex items-center justify-center text-muted group-hover:text-obsidian group-hover:bg-gold transition-all duration-300">
                          <ChevronRight className="h-4 w-4" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center rounded-lg border border-border/70 bg-graphite/40">
                  <Car className="h-8 w-8 mx-auto text-muted mb-2 opacity-50" />
                  <p className="text-sm text-primary font-medium font-sans">
                    No immediate match for &ldquo;{query}&rdquo;
                  </p>
                  <p className="text-xs text-muted font-sans mt-1">
                    Press Enter to query archive records or request bespoke sourcing through our concierge.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <>
              <div>
                <span className="block text-xs uppercase tracking-wider font-semibold text-secondary font-sans mb-3 px-1">
                  Marques & Heritage
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                  {CURATED_MARQUES.map((marque) => (
                    <button
                      key={marque.name}
                      type="button"
                      onClick={() => executeSearch(marque.name)}
                      className="flex flex-col items-center justify-center p-3 rounded-lg bg-graphite/50 border border-border hover:border-gold/40 hover:bg-charcoal transition-all group cursor-pointer"
                    >
                      <span className="text-xs font-semibold text-primary font-sans group-hover:text-gold transition-colors">
                        {marque.name}
                      </span>
                      <span className="text-[10px] text-muted font-mono mt-0.5">
                        {marque.count} units
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-secondary font-sans mb-3 px-1">
                  <TrendingUp className="h-3.5 w-3.5 text-gold" />
                  <span>Popular Inquiries</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_SEARCHES.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => executeSearch(suggestion)}
                      className="px-3.5 py-1.5 rounded-full bg-charcoal/80 border border-border text-xs text-secondary hover:text-primary hover:border-gold/40 hover:bg-graphite transition-all font-sans cursor-pointer"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between text-xs uppercase tracking-wider font-semibold text-secondary font-sans mb-3 px-1">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-muted" />
                      <span>Recent Searches</span>
                    </div>
                    <button
                      type="button"
                      onClick={clearAllRecent}
                      className="text-[11px] font-normal text-muted hover:text-red-400 transition-colors lowercase first-letter:uppercase cursor-pointer"
                    >
                      Clear all
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {recentSearches.map((item) => (
                      <div
                        key={item}
                        onClick={() => executeSearch(item)}
                        className="group flex items-center justify-between p-2.5 rounded-md bg-graphite/30 border border-border/60 hover:border-border hover:bg-charcoal cursor-pointer transition-all"
                      >
                        <div className="flex items-center gap-2.5 text-xs text-secondary group-hover:text-primary font-sans truncate">
                          <Clock className="h-3.5 w-3.5 text-muted shrink-0" />
                          <span className="truncate">{item}</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => removeRecentSearch(e, item)}
                          aria-label={`Remove ${item} from search history`}
                          className="text-muted hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="mt-12 pt-4 border-t border-border/40 flex flex-wrap items-center justify-between text-[11px] font-mono text-muted select-none">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="rounded bg-charcoal px-1.5 py-0.5 border border-border text-secondary">↵</kbd>
              to search
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded bg-charcoal px-1.5 py-0.5 border border-border text-secondary">ESC</kbd>
              to dismiss
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-secondary">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald" />
            <span>TORQUENS Verified Inventory Engine</span>
          </div>
        </div>
      </div>
    </div>
  );
}