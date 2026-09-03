'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */


import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useTransition,
  ReactNode,
} from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

// Define types locally to avoid import issues
interface FilterRange {
  min: number;
  max: number;
}

interface FilterState {
  make: string[];
  model: string[];
  bodyType: string[];
  fuelType: string[];
  transmission: string[];
  drivetrain: string[];
  location: string[];
  status: string[];
  priceRange: FilterRange;
  yearRange: FilterRange;
  mileageRange: FilterRange;
  verified: boolean | null;
  search: string;
  sort: string;
}

interface FilterContextType {
  filters: FilterState;
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  setFilters: (newFilters: Partial<FilterState>) => void;
  clearFilters: () => void;
  removeFilter: (key: keyof FilterState, value?: string) => void;
  applyFilters: () => void;
  resetFilters: () => void;
  activeFilterCount: number;
  hasActiveFilters: boolean;
  isPending: boolean;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

interface FilterProviderProps {
  children: ReactNode;
  initialFilters?: Partial<FilterState>;
}

// Default filter state
const getDefaultState = (): FilterState => ({
  make: [],
  model: [],
  bodyType: [],
  fuelType: [],
  transmission: [],
  drivetrain: [],
  location: [],
  status: [],
  priceRange: { min: 0, max: 0 },
  yearRange: { min: 0, max: 0 },
  mileageRange: { min: 0, max: 0 },
  verified: null,
  search: '',
  sort: 'newest',
});

// Parse URL params to filter state
const parseURLParams = (searchParams: URLSearchParams): Partial<FilterState> => {
  const filters: Partial<FilterState> = {};

  const arrayKeys = ['make', 'model', 'bodyType', 'fuelType', 'transmission', 'drivetrain', 'location', 'status'];
  arrayKeys.forEach((key) => {
    const values = searchParams.getAll(key);
    if (values.length > 0) {
      (filters as any)[key] = values;
    }
  });

  const rangeKeys = ['priceRange', 'yearRange', 'mileageRange'];
  rangeKeys.forEach((key) => {
    const min = searchParams.get(`${key}.min`);
    const max = searchParams.get(`${key}.max`);
    if (min || max) {
      (filters as any)[key] = {
        min: min ? Number(min) : 0,
        max: max ? Number(max) : 0,
      };
    }
  });

  const verified = searchParams.get('verified');
  if (verified === 'true') filters.verified = true;
  else if (verified === 'false') filters.verified = false;

  const search = searchParams.get('search');
  if (search) filters.search = search;

  const sort = searchParams.get('sort');
  if (sort) filters.sort = sort;

  return filters;
};

// Convert filters to URL params
const toURLParams = (filters: FilterState): URLSearchParams => {
  const params = new URLSearchParams();

  const arrayKeys = ['make', 'model', 'bodyType', 'fuelType', 'transmission', 'drivetrain', 'location', 'status'];
  arrayKeys.forEach((key) => {
    const values = filters[key as keyof FilterState] as string[];
    if (Array.isArray(values) && values.length > 0) {
      values.forEach((v) => params.append(key, v));
    }
  });

  const rangeKeys = ['priceRange', 'yearRange', 'mileageRange'];
  rangeKeys.forEach((key) => {
    const range = filters[key as keyof FilterState] as FilterRange;
    if (range && (range.min > 0 || range.max > 0)) {
      params.set(`${key}.min`, String(range.min));
      params.set(`${key}.max`, String(range.max));
    }
  });

  if (filters.verified !== null) {
    params.set('verified', String(filters.verified));
  }

  if (filters.search) {
    params.set('search', filters.search);
  }

  if (filters.sort && filters.sort !== 'newest') {
    params.set('sort', filters.sort);
  }

  return params;
};

// Count active filters
const getActiveFilterCount = (filters: FilterState): number => {
  let count = 0;

  const arrayKeys = ['make', 'model', 'bodyType', 'fuelType', 'transmission', 'drivetrain', 'location', 'status'];
  arrayKeys.forEach((key) => {
    const values = filters[key as keyof FilterState] as string[];
    if (Array.isArray(values) && values.length > 0) {
      count += values.length;
    }
  });

  const rangeKeys = ['priceRange', 'yearRange', 'mileageRange'];
  rangeKeys.forEach((key) => {
    const range = filters[key as keyof FilterState] as FilterRange;
    if (range && (range.min > 0 || range.max > 0)) {
      count += 1;
    }
  });

  if (filters.verified !== null) count += 1;
  if (filters.search) count += 1;
  if (filters.sort && filters.sort !== 'newest') count += 1;

  return count;
};

export function FilterProvider({ children, initialFilters }: FilterProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [filters, setFiltersState] = useState<FilterState>(() => {
    const urlFilters = parseURLParams(searchParams);
    return {
      ...getDefaultState(),
      ...urlFilters,
      ...initialFilters,
    };
  });

  // Keep state synchronized if URL parameters change externally
  useEffect(() => {
    const urlFilters = parseURLParams(searchParams);
    setFiltersState((prev) => ({
      ...getDefaultState(),
      ...prev,
      ...urlFilters,
    }));
  }, [searchParams]);

  const setFilter = useCallback(<K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFiltersState((prev) => ({ ...prev, [key]: value }));
  }, []);

  const setFilters = useCallback((newFilters: Partial<FilterState>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const applyFilters = useCallback(() => {
    const params = toURLParams(filters);
    const targetUrl = `${pathname}?${params.toString()}`;

    startTransition(() => {
      router.push(targetUrl, { scroll: false });
    });
  }, [filters, pathname, router]);

  const clearFilters = useCallback(() => {
    const reset = getDefaultState();
    setFiltersState(reset);
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  }, [pathname, router]);

  const removeFilter = useCallback(
    (key: keyof FilterState, valueToRemove?: string) => {
      setFiltersState((prev) => {
        const nextState = { ...prev };
        const currentValue = nextState[key];

        // Array filter removal
        if (Array.isArray(currentValue) && valueToRemove) {
          (nextState[key] as string[]) = currentValue.filter((v) => v !== valueToRemove);
        }
        // Range reset
        else if (key === 'priceRange' || key === 'yearRange' || key === 'mileageRange') {
          nextState[key] = { min: 0, max: 0 } as FilterState[typeof key];
        }
        // Boolean or String reset
        else if (key === 'verified') {
          nextState[key] = null;
        } else if (key === 'search') {
          nextState.search = '';
        } else if (key === 'sort') {
          nextState.sort = 'newest';
        }

        return nextState;
      });
    },
    []
  );

  const resetFilters = clearFilters;

  const activeFilterCount = getActiveFilterCount(filters);
  const hasActiveFilters = activeFilterCount > 0;

  return (
    <FilterContext.Provider
      value={{
        filters,
        setFilter,
        setFilters,
        clearFilters,
        removeFilter,
        applyFilters,
        resetFilters,
        activeFilterCount,
        hasActiveFilters,
        isPending,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
}