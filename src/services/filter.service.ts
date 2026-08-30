import type { FilterState, SortOption } from '@/types/filters';

export const sortOptions: SortOption[] = [
  { id: 'newest', label: 'Newest First', field: 'createdAt', order: 'desc' },
  { id: 'price-asc', label: 'Price: Low to High', field: 'price', order: 'asc' },
  { id: 'price-desc', label: 'Price: High to Low', field: 'price', order: 'desc' },
  { id: 'year-desc', label: 'Year: Newest', field: 'year', order: 'desc' },
  { id: 'year-asc', label: 'Year: Oldest', field: 'year', order: 'asc' },
  { id: 'mileage-asc', label: 'Mileage: Low to High', field: 'mileage', order: 'asc' },
  { id: 'mileage-desc', label: 'Mileage: High to Low', field: 'mileage', order: 'desc' },
  { id: 'popular', label: 'Most Popular', field: 'views', order: 'desc' },
  { id: 'saved', label: 'Most Saved', field: 'savedCount', order: 'desc' },
];

const MULTI_SELECT_KEYS: (keyof FilterState)[] = [
  'make',
  'model',
  'bodyType',
  'fuelType',
  'transmission',
  'drivetrain',
  'location',
  'status',
];

export class FilterService {
  /**
   * Default empty filter state foundation
   */
  static getDefaultState(): FilterState {
    return {
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
    };
  }

  /**
   * Safely parses Next.js URLSearchParams into a strongly-typed FilterState
   */
  static parseURLParams(params: URLSearchParams): Partial<FilterState> {
    const state: Partial<FilterState> = {};

    // Multi-select array filters
    for (const key of MULTI_SELECT_KEYS) {
      const value = params.get(key);
      if (value) {
        (state as Record<string, unknown>)[key] = value.split(',').map((v) => v.trim()).filter(Boolean);
      }
    }

    // Price Range
    const priceMin = params.get('minPrice');
    const priceMax = params.get('maxPrice');
    if (priceMin || priceMax) {
      state.priceRange = {
        min: priceMin ? parseInt(priceMin, 10) : 0,
        max: priceMax ? parseInt(priceMax, 10) : 0,
      };
    }

    // Year Range
    const yearMin = params.get('minYear');
    const yearMax = params.get('maxYear');
    if (yearMin || yearMax) {
      state.yearRange = {
        min: yearMin ? parseInt(yearMin, 10) : 0,
        max: yearMax ? parseInt(yearMax, 10) : 0,
      };
    }

    // Mileage Range
    const mileageMin = params.get('minMileage');
    const mileageMax = params.get('maxMileage');
    if (mileageMin || mileageMax) {
      state.mileageRange = {
        min: mileageMin ? parseInt(mileageMin, 10) : 0,
        max: mileageMax ? parseInt(mileageMax, 10) : 0,
      };
    }

    // Boolean Toggles
    const verified = params.get('verified');
    if (verified !== null) {
      state.verified = verified === 'true';
    }

    // Search string & Sort mode
    const search = params.get('search');
    if (search) state.search = search;

    const sort = params.get('sort');
    if (sort) state.sort = sort;

    return state;
  }

  /**
   * Converts FilterState into clean URLSearchParams
   */
  static toURLParams(state: Partial<FilterState>): URLSearchParams {
    const params = new URLSearchParams();

    // Multi-select array fields
    for (const key of MULTI_SELECT_KEYS) {
      const val = state[key];
      if (Array.isArray(val) && val.length > 0) {
        params.set(key, val.join(','));
      }
    }

    // Ranges - with proper number handling
    if (state.priceRange) {
      if (state.priceRange.min && state.priceRange.min > 0) {
        params.set('minPrice', state.priceRange.min.toString());
      }
      if (state.priceRange.max && state.priceRange.max > 0) {
        params.set('maxPrice', state.priceRange.max.toString());
      }
    }

    if (state.yearRange) {
      if (state.yearRange.min && state.yearRange.min > 1900) {
        params.set('minYear', state.yearRange.min.toString());
      }
      if (state.yearRange.max && state.yearRange.max > 1900) {
        params.set('maxYear', state.yearRange.max.toString());
      }
    }

    if (state.mileageRange) {
      if (state.mileageRange.min && state.mileageRange.min > 0) {
        params.set('minMileage', state.mileageRange.min.toString());
      }
      if (state.mileageRange.max && state.mileageRange.max > 0) {
        params.set('maxMileage', state.mileageRange.max.toString());
      }
    }

    // Booleans
    if (state.verified === true) params.set('verified', 'true');

    // Search & Sort
    if (state.search && state.search.trim() !== '') params.set('search', state.search.trim());
    if (state.sort && state.sort !== 'newest') params.set('sort', state.sort);

    return params;
  }

  /**
   * Builds type-safe Mongoose/MongoDB Query Object
   */
  static buildQuery(state: Partial<FilterState>): Record<string, unknown> {
    const query: Record<string, unknown> = { status: 'PUBLISHED' };

    // Multi-select array fields ($in condition)
    for (const key of ['make', 'model', 'bodyType', 'fuelType', 'transmission', 'drivetrain', 'location'] as const) {
      const val = state[key];
      if (Array.isArray(val) && val.length > 0) {
        query[key] = { $in: val };
      }
    }

    // Custom Status Override
    if (state.status && state.status.length > 0) {
      query.status = { $in: state.status };
    }

    // Price Range
    if (state.priceRange && (state.priceRange.min > 0 || state.priceRange.max > 0)) {
      const priceQuery: Record<string, number> = {};
      if (state.priceRange.min > 0) priceQuery.$gte = state.priceRange.min;
      if (state.priceRange.max > 0) priceQuery.$lte = state.priceRange.max;
      if (Object.keys(priceQuery).length > 0) query.price = priceQuery;
    }

    // Year Range
    if (state.yearRange && (state.yearRange.min > 0 || state.yearRange.max > 0)) {
      const yearQuery: Record<string, number> = {};
      if (state.yearRange.min > 1900) yearQuery.$gte = state.yearRange.min;
      if (state.yearRange.max > 0) yearQuery.$lte = state.yearRange.max;
      if (Object.keys(yearQuery).length > 0) query.year = yearQuery;
    }

    // Mileage Range
    if (state.mileageRange && (state.mileageRange.min > 0 || state.mileageRange.max > 0)) {
      const mileageQuery: Record<string, number> = {};
      if (state.mileageRange.min > 0) mileageQuery.$gte = state.mileageRange.min;
      if (state.mileageRange.max > 0) mileageQuery.$lte = state.mileageRange.max;
      if (Object.keys(mileageQuery).length > 0) query.mileage = mileageQuery;
    }

    // Verification Toggle
    if (state.verified === true) query.verified = 'VERIFIED';

    // Full-Text Search
    if (state.search && state.search.trim() !== '') {
      query.$text = { $search: state.search.trim() };
    }

    return query;
  }

  static getSortConfig(sortId: string): SortOption {
    return sortOptions.find((s) => s.id === sortId) || sortOptions[0];
  }

  static getActiveFilterCount(state: Partial<FilterState>): number {
    let count = 0;

    for (const key of MULTI_SELECT_KEYS) {
      const val = state[key];
      if (Array.isArray(val)) count += val.length;
    }

    if (state.priceRange && (state.priceRange.min > 0 || state.priceRange.max > 0)) count++;
    if (state.yearRange && (state.yearRange.min > 0 || state.yearRange.max > 0)) count++;
    if (state.mileageRange && (state.mileageRange.min > 0 || state.mileageRange.max > 0)) count++;
    if (state.verified === true) count++;
    if (state.search && state.search.trim() !== '') count++;

    return count;
  }
}