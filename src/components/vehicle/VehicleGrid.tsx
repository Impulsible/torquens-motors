'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Car,
  AlertTriangle,
  RotateCcw,
  Loader2,
  ShieldCheck,
  Check,
} from 'lucide-react';

import { VehicleCard } from './VehicleCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { getVehicles } from '@/actions/vehicles';
import type { IVehicle } from '@/types';
import { cn } from '@/utils/cn';

// ─────────────────────────────────────────────────────────────
// CLIENT-SAFE FILTER TYPES (No imports from @/services)
// ─────────────────────────────────────────────────────────────
export interface VehicleFilters {
  make?: string;
  model?: string;
  bodyType?: string;
  fuelType?: string;
  transmission?: string;
  drivetrain?: string;
  location?: string;
  category?: string;
  condition?: string;
  sellerType?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  minMileage?: number;
  maxMileage?: number;
  verified?: boolean;
  [key: string]: unknown;
}

interface VehicleGridProps {
  initialVehicles?: IVehicle[];
  initialTotal?: number;
  className?: string;
}

const VEHICLES_PER_PAGE = 12;

const SORT_MAP: Record<
  string,
  {
    field: 'price' | 'year' | 'mileage' | 'createdAt' | 'views' | 'savedCount';
    order: 'asc' | 'desc';
  }
> = {
  newest: { field: 'createdAt', order: 'desc' },
  'price-asc': { field: 'price', order: 'asc' },
  'price-desc': { field: 'price', order: 'desc' },
  'year-desc': { field: 'year', order: 'desc' },
  'year-asc': { field: 'year', order: 'asc' },
  'mileage-asc': { field: 'mileage', order: 'asc' },
  'mileage-desc': { field: 'mileage', order: 'desc' },
  views: { field: 'views', order: 'desc' },
  savedCount: { field: 'savedCount', order: 'desc' },
};

function VehicleCardSkeleton() {
  return (
    <div className="bg-graphite border border-border rounded-xl overflow-hidden p-0 flex flex-col h-full animate-pulse">
      <div className="aspect-16/10 w-full bg-charcoal relative">
        <div className="absolute top-3 left-3 w-20 h-5 bg-border rounded-full" />
        <div className="absolute top-3 right-3 w-12 h-5 bg-border rounded-full" />
      </div>

      <div className="p-5 flex flex-col justify-between flex-1 space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="h-3 w-20 bg-border rounded" />
            <div className="h-3 w-24 bg-border rounded" />
          </div>
          <div className="h-6 w-3/4 bg-border rounded" />
          <div className="flex justify-between items-center pt-2">
            <div className="h-3 w-16 bg-border rounded" />
            <div className="h-5 w-28 bg-border rounded" />
          </div>
        </div>

        <div className="h-12 bg-inset border border-border/80 rounded-lg w-full" />

        <div className="pt-3 border-t border-border/60 flex justify-between items-center">
          <div className="h-3 w-16 bg-border rounded" />
          <div className="h-8 w-24 bg-border rounded-md" />
        </div>
      </div>
    </div>
  );
}

const parsePowerNumber = (power: unknown): number => {
  if (typeof power === 'number') return power;
  if (typeof power === 'string') return parseInt(power, 10) || 0;
  return 0;
};

export function VehicleGrid({
  initialVehicles = [],
  initialTotal = 0,
  className,
}: VehicleGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [vehicles, setVehicles] = useState<IVehicle[]>(initialVehicles);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(initialVehicles.length === 0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(initialTotal > initialVehicles.length);
  const [error, setError] = useState<string | null>(null);

  const [favoritedIds, setFavoritedIds] = useState<Set<string>>(new Set());
  const [comparedIds, setComparedIds] = useState<Set<string>>(new Set());

  const isFetchingRef = useRef(false);
  const initialLoadDoneRef = useRef(false);

  const parseFiltersFromParams = useCallback((): VehicleFilters => {
    const filters: VehicleFilters = {};

    const stringKeys = [
      'make',
      'model',
      'bodyType',
      'fuelType',
      'transmission',
      'drivetrain',
      'location',
      'category',
      'condition',
      'sellerType',
      'search',
    ] as const;

    stringKeys.forEach((key) => {
      const val = searchParams.get(key);
      if (val) filters[key] = val;
    });

    const numKeys = [
      'minPrice',
      'maxPrice',
      'minYear',
      'maxYear',
      'minMileage',
      'maxMileage',
    ] as const;

    numKeys.forEach((key) => {
      const val = searchParams.get(key);
      if (val) {
        const num = Number(val);
        if (!isNaN(num)) filters[key] = num;
      }
    });

    if (searchParams.get('verified') === 'true') filters.verified = true;

    return filters;
  }, [searchParams]);

  const loadVehicles = useCallback(
    async (pageNum: number, append: boolean = false) => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;

      try {
        setError(null);
        if (append) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }

        const filters = parseFiltersFromParams();
        const sortParam = searchParams.get('sort') || 'newest';
        const sortOptions = SORT_MAP[sortParam] || SORT_MAP.newest;

        // Calls Server Action (Safe on Client)
        const result = await getVehicles(
          filters,
          { page: pageNum, limit: VEHICLES_PER_PAGE },
          sortOptions
        );

        if (append) {
          setVehicles((prev) => {
            const existingIds = new Set(prev.map((v: IVehicle) => v.id));
            const newItems = (result.data || []).filter(
              (v: IVehicle) => !existingIds.has(v.id)
            );
            return [...prev, ...newItems];
          });
        } else {
          setVehicles(result.data || []);
        }

        setTotal(result.pagination?.total ?? (result.data || []).length);
        setHasMore(Boolean(result.pagination?.hasNextPage));
        setPage(pageNum);
      } catch (err) {
        console.error('Failed to load marketplace vehicles:', err);
        setError('Unable to fetch inventory. Please check your network connection.');
      } finally {
        setLoading(false);
        setLoadingMore(false);
        isFetchingRef.current = false;
      }
    },
    [searchParams, parseFiltersFromParams]
  );

  useEffect(() => {
    if (!initialLoadDoneRef.current && initialVehicles.length > 0) {
      initialLoadDoneRef.current = true;
      return;
    }

    loadVehicles(1, false);
  }, [searchParams, loadVehicles, initialVehicles.length]);

  useEffect(() => {
    if (!initialLoadDoneRef.current && initialVehicles.length > 0) {
      initialLoadDoneRef.current = true;
    }
  }, [initialVehicles]);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading || loadingMore) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            loadVehicles(page + 1, true);
          }
        },
        { rootMargin: '200px' }
      );

      if (node) observerRef.current.observe(node);
    },
    [loading, loadingMore, hasMore, page, loadVehicles]
  );

  const handleFavoriteToggle = (id: string) => {
    setFavoritedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCompareToggle = (id: string) => {
    setComparedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (loading) {
    return (
      <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6', className)}>
        {Array.from({ length: 6 }).map((_, i) => (
          <VehicleCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 sm:p-12 rounded-2xl bg-graphite border border-red-500/30 text-center space-y-4 max-w-lg mx-auto my-8 shadow-card">
        <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto border border-red-500/20">
          <AlertTriangle size={24} />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-serif font-light text-primary">
            Marketplace Connection Error
          </h3>
          <p className="text-xs text-secondary font-sans leading-relaxed">{error}</p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => loadVehicles(1, false)}
          leftIcon={<RotateCcw size={14} />}
          className="text-xs"
        >
          Retry Search
        </Button>
      </div>
    );
  }

  if (vehicles.length === 0) {
    const hasFilters = Array.from(searchParams.keys()).some((k) => k !== 'page');

    return (
      <EmptyState
        title="No Matching Vehicles Found"
        description="We couldn't find any vehicles in our registry matching your specified criteria. Try adjusting your parameters or submit a concierge request."
        icon={<Car className="h-8 w-8 text-gold/80" />}
        action={{
          label: hasFilters ? 'Reset Filter Parameters' : 'Explore All Vehicles',
          onClick: () => router.push('/vehicles'),
        }}
        secondaryAction={{
          label: 'Submit Concierge Request',
          href: '/contact',
        }}
        variant="default"
        ambientGlow
        className="my-4"
      />
    );
  }

  return (
    <div className={cn('space-y-8', className)}>
      <div className="flex items-center justify-between px-1 text-xs font-sans text-muted">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
          <span>
            Showing <strong className="text-primary font-semibold">{vehicles.length}</strong> of{' '}
            <strong className="text-primary font-semibold">{total}</strong> verified vehicles
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-[11px] text-secondary">
          <ShieldCheck size={14} className="text-emerald" />
          <span>Chassis & Paperwork Inspected</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map((vehicle: IVehicle, index: number) => {
          const isVerified = vehicle.verified === 'VERIFIED' || vehicle.verified === true;

          return (
            <div
              key={vehicle.id || vehicle.slug || index}
              className="animate-in fade-in slide-in-from-bottom-3 duration-300"
              style={{ animationDelay: `${(index % 6) * 60}ms` }}
            >
              <VehicleCard
                vehicle={{
                  id: vehicle.id,
                  slug: vehicle.slug || vehicle.id || '',
                  make: vehicle.make,
                  model: vehicle.model,
                  year: vehicle.year,
                  price: vehicle.price,
                  currency: vehicle.currency || 'NGN',
                  mileage: vehicle.mileage,
                  power: parsePowerNumber(vehicle.power),
                  images: vehicle.images || [],
                  transmission: vehicle.transmission,
                  fuelType: vehicle.fuelType,
                  verified: isVerified,
                  status: vehicle.status,
                  location: vehicle.location,
                }}
                featured={false}
                priority={index < 3}
                isFavorited={favoritedIds.has(vehicle.id)}
                isCompared={comparedIds.has(vehicle.id)}
                onFavoriteToggle={handleFavoriteToggle}
                onCompareToggle={handleCompareToggle}
              />
            </div>
          );
        })}
      </div>

      {hasMore && (
        <div ref={sentinelRef} className="pt-8 pb-4 flex flex-col items-center justify-center space-y-3">
          {loadingMore && (
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-graphite border border-border text-xs font-sans text-secondary shadow-sm">
              <Loader2 size={16} className="animate-spin text-gold" />
              <span>Fetching additional registry inventory...</span>
            </div>
          )}
        </div>
      )}

      {!hasMore && vehicles.length > 0 && (
        <div className="pt-8 pb-4 text-center border-t border-border/40">
          <p className="text-xs font-sans text-muted flex items-center justify-center gap-1.5">
            <Check size={14} className="text-emerald" />
            <span>
              You have viewed all <strong>{total}</strong> matched vehicles in this registry.
            </span>
          </p>
        </div>
      )}
    </div>
  );
}

export default VehicleGrid;