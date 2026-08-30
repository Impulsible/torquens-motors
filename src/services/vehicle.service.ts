/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { FilterQuery, PipelineStage } from 'mongoose';
import { Vehicle, IVehicleDocument } from '@/models/Vehicle';
import {
  paginate,
  findOne,
  findById,
  findMany,
  aggregate,
  update,
  count,
  type PaginationOptions,
  type PaginatedResult,
} from './database';
import type { IVehicle } from '@/types';

// -----------------------------------------------------------------------------
// TYPES & FILTER INTERFACES
// -----------------------------------------------------------------------------

export interface VehicleFilters {
  make?: string;
  model?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  minMileage?: number;
  maxMileage?: number;
  bodyType?: string;
  fuelType?: string;
  transmission?: string;
  drivetrain?: string;
  location?: string;
  verified?: boolean;
  featured?: boolean;
  category?: string;
  condition?: 'NEW' | 'USED' | 'CPO' | string;
  sellerType?: 'DEALER' | 'PRIVATE' | string;
  status?: 'PUBLISHED' | 'SOLD' | 'RESERVED' | 'PENDING_REVIEW' | string;
  search?: string;
}

export interface VehicleSortOptions {
  field: 'price' | 'year' | 'mileage' | 'createdAt' | 'views' | 'savedCount';
  order: 'asc' | 'desc';
}

export interface VehicleMarketStats {
  total: number;
  verified: number;
  sold: number;
  averagePrice: number;
  priceRange: { min: number; max: number };
  yearRange: { min: number; max: number };
}

export interface SearchSuggestion {
  type: 'make' | 'model' | 'vehicle' | 'collection';
  label: string;
  value: string;
  image?: string;
  count?: number;
}

// Projection for Dealer population
const DEALER_SAFE_PROJECTION =
  'name companyName logo verified rating location phone email memberSince';

// Helper to sanitize regex inputs
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Type for query filter
type VehicleQuery = FilterQuery<IVehicleDocument>;

// -----------------------------------------------------------------------------
// VEHICLE SERVICE FUNCTIONS
// -----------------------------------------------------------------------------

/**
 * Retrieves paginated vehicles based on complex filter parameters.
 */
export async function getVehicles(
  filters: VehicleFilters = {},
  pagination: PaginationOptions = { page: 1, limit: 12 },
  sort: VehicleSortOptions = { field: 'createdAt', order: 'desc' }
): Promise<PaginatedResult<IVehicle>> {
  const query: VehicleQuery = {};

  // Default to published vehicles
  query.status = filters.status || 'PUBLISHED';

  // 1. Text Search & Safe Regex Filters
  if (filters.make) {
    query.make = { $regex: escapeRegex(filters.make), $options: 'i' };
  }

  if (filters.model) {
    query.model = { $regex: escapeRegex(filters.model), $options: 'i' };
  }

  if (filters.location) {
    query.location = { $regex: escapeRegex(filters.location), $options: 'i' };
  }

  // 2. Numeric Range Queries
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    query.price = {};
    if (filters.minPrice !== undefined) query.price.$gte = filters.minPrice;
    if (filters.maxPrice !== undefined) query.price.$lte = filters.maxPrice;
  }

  if (filters.minYear !== undefined || filters.maxYear !== undefined) {
    query.year = {};
    if (filters.minYear !== undefined) query.year.$gte = filters.minYear;
    if (filters.maxYear !== undefined) query.year.$lte = filters.maxYear;
  }

  if (filters.minMileage !== undefined || filters.maxMileage !== undefined) {
    query.mileage = {};
    if (filters.minMileage !== undefined) query.mileage.$gte = filters.minMileage;
    if (filters.maxMileage !== undefined) query.mileage.$lte = filters.maxMileage;
  }

  // 3. Exact Category Matches
  if (filters.bodyType) query.bodyType = filters.bodyType;
  if (filters.fuelType) query.fuelType = filters.fuelType;
  if (filters.transmission) query.transmission = filters.transmission;
  if (filters.drivetrain) query.drivetrain = filters.drivetrain;
  if (filters.category) query.category = filters.category;
  if (filters.condition) query.condition = filters.condition;
  if (filters.sellerType) query.sellerType = filters.sellerType;
  if (filters.featured !== undefined) query.featured = filters.featured;

  // 4. Verification Status
  if (filters.verified !== undefined) {
    query.verified = filters.verified ? 'VERIFIED' : { $ne: 'VERIFIED' };
  }

  // 5. Full-Text Search
  if (filters.search && filters.search.trim() !== '') {
    const sanitizedSearch = escapeRegex(filters.search.trim());
    query.$or = [
      { make: { $regex: sanitizedSearch, $options: 'i' } },
      { model: { $regex: sanitizedSearch, $options: 'i' } },
      { description: { $regex: sanitizedSearch, $options: 'i' } },
    ];
  }

  // 6. Build Sorting
  const sortDirection: 1 | -1 = sort.order === 'asc' ? 1 : -1;
  const sortObject: Record<string, 1 | -1> = {
    [sort.field]: sortDirection,
  };

  if (sort.field !== 'createdAt') {
    sortObject.createdAt = -1;
  }

  const options: PaginationOptions = {
    ...pagination,
    sort: sortObject,
    lean: true,
  };

  return paginate<IVehicle>(Vehicle as any, query, options);
}

/**
 * Fetches a single published vehicle by slug.
 */
export async function getVehicleBySlug(slug: string): Promise<IVehicle | null> {
  return findOne<IVehicle>(
    Vehicle as any,
    { slug, status: 'PUBLISHED' },
    {},
    {
      lean: true,
      populate: {
        path: 'dealer',
        select: DEALER_SAFE_PROJECTION,
      },
    }
  );
}

/**
 * Fetches a single vehicle by ID.
 */
export async function getVehicleById(id: string): Promise<IVehicle | null> {
  return findById<IVehicle>(
    Vehicle as any,
    id,
    {},
    {
      lean: true,
      populate: {
        path: 'dealer',
        select: DEALER_SAFE_PROJECTION,
      },
    }
  );
}

/**
 * Featured Vehicles for Homepage.
 */
export async function getFeaturedVehicles(limit: number = 6): Promise<IVehicle[]> {
  return findMany<IVehicle>(
    Vehicle as any,
    { status: 'PUBLISHED', featured: true },
    {},
    {
      lean: true,
      sort: { createdAt: -1 },
      limit,
      populate: {
        path: 'dealer',
        select: 'companyName logo verified',
      },
    }
  );
}

/**
 * Fetches related vehicles.
 */
export async function getRelatedVehicles(
  vehicleId: string,
  make: string,
  bodyType?: string,
  limit: number = 4
): Promise<IVehicle[]> {
  const query: VehicleQuery = {
    _id: { $ne: vehicleId },
    status: 'PUBLISHED',
    $or: [{ make }],
  };

  if (bodyType) {
    query.$or!.push({ bodyType });
  }

  return findMany<IVehicle>(
    Vehicle as any,
    query,
    {},
    {
      lean: true,
      sort: { createdAt: -1 },
      limit,
    }
  );
}

/**
 * Retrieves distinct vehicle makes.
 */
export async function getVehicleMakes(): Promise<string[]> {
  const results = await aggregate<{ _id: string }>(
    Vehicle as any,
    [
      { $match: { status: 'PUBLISHED' } },
      { $group: { _id: '$make' } },
      { $sort: { _id: 1 } },
    ]
  );
  return results.map((r) => r._id).filter(Boolean);
}

/**
 * Retrieves distinct vehicle models for a given make.
 */
export async function getVehicleModels(make: string): Promise<string[]> {
  const results = await aggregate<{ _id: string }>(
    Vehicle as any,
    [
      {
        $match: {
          make: { $regex: `^${escapeRegex(make)}$`, $options: 'i' },
          status: 'PUBLISHED',
        },
      },
      { $group: { _id: '$model' } },
      { $sort: { _id: 1 } },
    ]
  );
  return results.map((r) => r._id).filter(Boolean);
}

/**
 * Natural Language Query Parser.
 * ✅ Fixed: Now async (required for 'use server' files)
 */
export async function parseNaturalLanguageQuery(prompt: string): Promise<VehicleFilters> {
  const query = prompt.toLowerCase();
  const filters: VehicleFilters = {};

  // Detect Makes
  const knownMakes = [
    'porsche', 'mercedes-benz', 'mercedes', 'bmw', 'audi', 'bentley',
    'rolls-royce', 'ferrari', 'lamborghini', 'range rover', 'land rover',
    'toyota', 'lexus'
  ];
  for (const make of knownMakes) {
    if (query.includes(make)) {
      filters.make = make === 'mercedes' ? 'Mercedes-Benz' : make;
      break;
    }
  }

  // Detect Body Types
  if (query.includes('suv')) filters.bodyType = 'SUV';
  else if (query.includes('sedan') || query.includes('executive')) filters.bodyType = 'Sedan';
  else if (query.includes('coupe') || query.includes('sports')) filters.bodyType = 'Coupe';
  else if (query.includes('convertible')) filters.bodyType = 'Convertible';

  // Detect Locations
  if (query.includes('lagos')) filters.location = 'Lagos';
  else if (query.includes('abuja')) filters.location = 'Abuja';
  else if (query.includes('port harcourt')) filters.location = 'Port Harcourt';

  // Detect Price
  const millionMatch = query.match(/(?:under|below|max)\s*(?:₦|\$)?\s*(\d+)\s*(?:m|million)/i);
  if (millionMatch) {
    filters.maxPrice = parseInt(millionMatch[1], 10) * 1_000_000;
  }

  // Mileage & Condition
  if (query.includes('low mileage') || query.includes('low km')) {
    filters.maxMileage = 30000;
  }
  if (query.includes('brand new') || query.includes('new')) {
    filters.condition = 'NEW';
  } else if (query.includes('verified') || query.includes('cpo')) {
    filters.verified = true;
  }

  return filters;
}

/**
 * TORQUENS Intelligence Natural Language Search.
 */
export async function searchTORQUENSIntelligence(
  prompt: string,
  pagination?: PaginationOptions
): Promise<PaginatedResult<IVehicle>> {
  const filters = await parseNaturalLanguageQuery(prompt);
  if (!filters.make && !filters.bodyType && !filters.location && !filters.maxPrice) {
    filters.search = prompt;
  }
  return getVehicles(filters, pagination);
}

/**
 * Marketplace statistics.
 */
export async function getVehicleStats(): Promise<VehicleMarketStats> {
  const pipeline: PipelineStage[] = [
    { $match: { status: 'PUBLISHED' } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        verified: {
          $sum: { $cond: [{ $eq: ['$verified', 'VERIFIED'] }, 1, 0] },
        },
        sold: {
          $sum: { $cond: [{ $eq: ['$status', 'SOLD'] }, 1, 0] },
        },
        averagePrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
        minYear: { $min: '$year' },
        maxYear: { $max: '$year' },
      },
    },
  ];

  const stats = await aggregate<{
    total: number;
    verified: number;
    sold: number;
    averagePrice: number;
    minPrice: number;
    maxPrice: number;
    minYear: number;
    maxYear: number;
  }>(Vehicle as any, pipeline);

  const result = stats[0] || {
    total: 0,
    verified: 0,
    sold: 0,
    averagePrice: 0,
    minPrice: 0,
    maxPrice: 0,
    minYear: new Date().getFullYear(),
    maxYear: new Date().getFullYear(),
  };

  return {
    total: result.total,
    verified: result.verified,
    sold: result.sold,
    averagePrice: Math.round(result.averagePrice || 0),
    priceRange: { min: result.minPrice || 0, max: result.maxPrice || 0 },
    yearRange: { min: result.minYear || 2015, max: result.maxYear || new Date().getFullYear() },
  };
}

/**
 * Increments vehicle views.
 */
export async function incrementViews(vehicleId: string): Promise<void> {
  await update(
    Vehicle as any,
    { _id: vehicleId },
    { $inc: { views: 1 } }
  );
}

// -----------------------------------------------------------------------------
// ADVANCED SEARCH & SUGGESTIONS
// -----------------------------------------------------------------------------

/**
 * Advanced search with natural language processing
 * Example: "Porsche SUV under ₦150m"
 */
export async function advancedSearch(
  query: string,
  pagination: PaginationOptions = { page: 1, limit: 12 }
): Promise<PaginatedResult<IVehicle>> {
  const parsedQuery = await parseNaturalLanguageQuery(query);
  
  // Build search filters from parsed query
  const filters: VehicleFilters = {
    search: query,
  };

  if (parsedQuery.make) filters.make = parsedQuery.make;
  if (parsedQuery.model) filters.model = parsedQuery.model;
  if (parsedQuery.bodyType) filters.bodyType = parsedQuery.bodyType;
  if (parsedQuery.minPrice) filters.minPrice = parsedQuery.minPrice;
  if (parsedQuery.maxPrice) filters.maxPrice = parsedQuery.maxPrice;
  if (parsedQuery.minYear) filters.minYear = parsedQuery.minYear;
  if (parsedQuery.maxYear) filters.maxYear = parsedQuery.maxYear;

  return getVehicles(filters, pagination, { field: 'createdAt', order: 'desc' });
}

/**
 * Parse price from string with support for million, thousand suffixes
 * ✅ Fixed: Now async (required for 'use server' files)
 */
export async function parsePrice(value: string): Promise<number> {
  const num = parseFloat(value.replace(/[^0-9.]/g, ''));
  if (value.toLowerCase().includes('m') || value.toLowerCase().includes('million')) {
    return num * 1000000;
  }
  if (value.toLowerCase().includes('k') || value.toLowerCase().includes('thousand')) {
    return num * 1000;
  }
  return num;
}

/**
 * Get search suggestions for autocomplete
 */
export async function getSearchSuggestions(query: string): Promise<SearchSuggestion[]> {
  if (!query || query.length < 2) {
    return [];
  }

  const suggestions: SearchSuggestion[] = [];
  const searchLower = query.toLowerCase();

  // Get matching makes
  const makes = await getVehicleMakes();
  const matchingMakes = makes
    .filter(make => make.toLowerCase().includes(searchLower))
    .slice(0, 3);

  for (const make of matchingMakes) {
    const countResult = await count(Vehicle, { make, status: 'PUBLISHED' });
    suggestions.push({
      type: 'make',
      label: make,
      value: make,
      count: countResult,
    });
  }

  // Get matching vehicles (if query looks like a vehicle name)
  if (query.length > 2) {
    const vehicles = await findMany<IVehicle>(
      Vehicle as any,
      {
        $or: [
          { model: { $regex: escapeRegex(query), $options: 'i' } },
          { make: { $regex: escapeRegex(query), $options: 'i' } },
        ],
        status: 'PUBLISHED',
      },
      {},
      {
        lean: true,
        limit: 5,
        sort: { views: -1 },
      }
    );

    for (const vehicle of vehicles) {
      suggestions.push({
        type: 'vehicle',
        label: `${vehicle.make} ${vehicle.model} ${vehicle.year}`,
        value: vehicle.slug,
        image: vehicle.images?.[0],
      });
    }
  }

  return suggestions.slice(0, 8);
}

/**
 * Get popular searches
 */
export async function getPopularSearches(): Promise<string[]> {
  // In a real app, this would come from analytics
  return [
    'Porsche 911',
    'Mercedes-Benz S-Class',
    'BMW M4',
    'Lamborghini Urus',
    'Range Rover Sport',
    'Electric vehicles',
    'Luxury SUVs',
    '2024 models',
  ];
}

/**
 * Search for vehicles by text query with relevance scoring
 */
export async function searchVehicles(
  query: string,
  pagination: PaginationOptions = { page: 1, limit: 12 }
): Promise<PaginatedResult<IVehicle>> {
  if (!query || query.length < 2) {
    return getVehicles({}, pagination);
  }

  // Try advanced search first
  const parsed = await parseNaturalLanguageQuery(query);
  
  // If we have structured filters, use them
  if (parsed.make || parsed.bodyType || parsed.minPrice || parsed.maxPrice) {
    return advancedSearch(query, pagination);
  }

  // Otherwise use text search
  const searchQuery: any = {
    status: 'PUBLISHED',
    $text: { $search: query },
  };

  const sort: any = {
    score: { $meta: 'textScore' },
    createdAt: -1,
  };

  const options: PaginationOptions = {
    ...pagination,
    sort,
    lean: true,
  };

  return paginate<IVehicle>(Vehicle as any, searchQuery, options);
}