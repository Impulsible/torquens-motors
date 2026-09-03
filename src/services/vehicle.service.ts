/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { FilterQuery, PipelineStage } from 'mongoose';
import { Vehicle, IVehicleDocument } from '@/models/Vehicle';
import {
  findOne,
  findById,
  findMany,
  aggregate,
  update,
  type PaginationOptions,
  type PaginatedResult,
} from './database';
import type { IVehicle } from '@/types';
import ShowroomService from './showroom.service';

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
  useExternalAPI?: boolean;
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

const DEALER_SAFE_PROJECTION =
  'name companyName logo verified rating location phone email memberSince';

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

type VehicleQuery = FilterQuery<IVehicleDocument>;

export async function getDBVehiclesOnly(filters: VehicleFilters = {}): Promise<IVehicle[]> {
  try {
    const query: VehicleQuery = { status: { $ne: 'DELETED' } };

    if (filters.status) query.status = filters.status;
    if (filters.make) query.make = { $regex: escapeRegex(filters.make), $options: 'i' };
    if (filters.model) query.model = { $regex: escapeRegex(filters.model), $options: 'i' };
    if (filters.location) query.location = { $regex: escapeRegex(filters.location), $options: 'i' };

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

    if (filters.bodyType) query.bodyType = { $regex: escapeRegex(filters.bodyType), $options: 'i' };
    if (filters.fuelType) query.fuelType = filters.fuelType;
    if (filters.transmission) query.transmission = filters.transmission;
    if (filters.drivetrain) query.drivetrain = filters.drivetrain;

    if (filters.search && filters.search.trim() !== '') {
      const sanitizedSearch = escapeRegex(filters.search.trim());
      query.$or = [
        { make: { $regex: sanitizedSearch, $options: 'i' } },
        { model: { $regex: sanitizedSearch, $options: 'i' } },
        { description: { $regex: sanitizedSearch, $options: 'i' } },
      ];
    }

    const docs = await findMany<IVehicle>(Vehicle as any, query, {}, { lean: true, sort: { createdAt: -1 } });
    return docs || [];
  } catch (error) {
    console.error('Error querying DB vehicles:', error);
    return [];
  }
}

export async function getVehicles(
  filters: VehicleFilters = {},
  pagination: PaginationOptions = { page: 1, limit: 12 },
  sort: VehicleSortOptions = { field: 'createdAt', order: 'desc' }
): Promise<PaginatedResult<IVehicle>> {
  const dbVehicles = await getDBVehiclesOnly(filters);
  const fallbacks = ShowroomService.getAllFallbackVehicles();
  const matchingFallbacks = ShowroomService.filterReferenceVehicles(fallbacks, filters as any);
  const mergedVehicles = ShowroomService.mergeVehicles(dbVehicles, matchingFallbacks);

  if (sort && sort.field) {
    mergedVehicles.sort((a: any, b: any) => {
      const valA = a[sort.field] ?? 0;
      const valB = b[sort.field] ?? 0;
      if (sort.order === 'asc') {
        return valA > valB ? 1 : valA < valB ? -1 : 0;
      } else {
        return valA < valB ? 1 : valA > valB ? -1 : 0;
      }
    });
  }

  const page = pagination.page || 1;
  const limit = pagination.limit || 12;
  const start = (page - 1) * limit;
  const paginatedVehicles = mergedVehicles.slice(start, start + limit);

  return {
    data: paginatedVehicles,
    pagination: {
      total: mergedVehicles.length,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(mergedVehicles.length / limit)),
      hasNextPage: start + limit < mergedVehicles.length,
      hasPrevPage: page > 1,
    },
  };
}

export async function getVehiclesWithFallback(
  filters: VehicleFilters = {},
  pagination: PaginationOptions = { page: 1, limit: 12 },
  sort: VehicleSortOptions = { field: 'createdAt', order: 'desc' }
): Promise<PaginatedResult<IVehicle>> {
  return getVehicles(filters, pagination, sort);
}

export async function getVehiclesFromCarQuery(
  filters: VehicleFilters = {},
  pagination: PaginationOptions = { page: 1, limit: 12 }
): Promise<PaginatedResult<IVehicle>> {
  return getVehicles(filters, pagination);
}

export async function getVehicleBySlug(slug: string): Promise<IVehicle | null> {
  if (!slug) return null;

  try {
    const dbVehicle = await findOne<IVehicle>(
      Vehicle as any,
      { slug, status: { $ne: 'DELETED' } },
      {},
      {
        lean: true,
        populate: {
          path: 'dealer',
          select: DEALER_SAFE_PROJECTION,
        },
      }
    );

    if (dbVehicle) return dbVehicle;
  } catch (error) {
    console.error('Error in getVehicleBySlug:', error);
  }

  const fallbacks = ShowroomService.getAllFallbackVehicles();
  const cleanSlug = String(slug).toLowerCase().trim();
  return fallbacks.find(v => String(v.slug).toLowerCase() === cleanSlug || String(v.id).toLowerCase() === cleanSlug) || fallbacks[0] || null;
}

export async function getVehicleById(id: string): Promise<IVehicle | null> {
  if (!id) return null;

  try {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    if (isObjectId) {
      const dbVehicle = await findById<IVehicle>(
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
      if (dbVehicle) return dbVehicle;
    } else {
      const dbVehicle = await findOne<IVehicle>(
        Vehicle as any,
        { $or: [{ id }, { slug: id }] },
        {},
        {
          lean: true,
          populate: {
            path: 'dealer',
            select: DEALER_SAFE_PROJECTION,
          },
        }
      );
      if (dbVehicle) return dbVehicle;
    }
  } catch (error) {
    console.error('Error in getVehicleById DB lookup:', error);
  }

  const fallbacks = ShowroomService.getAllFallbackVehicles();
  const cleanId = String(id).toLowerCase().trim();

  const foundFallback = fallbacks.find(
    (v) =>
      String(v.id).toLowerCase() === cleanId ||
      String(v.slug).toLowerCase() === cleanId ||
      cleanId.includes(String(v.id).toLowerCase()) ||
      String(v.id).toLowerCase().includes(cleanId)
  );

  if (foundFallback) return foundFallback;

  return fallbacks[0] || null;
}

export async function getFeaturedVehicles(limit: number = 6): Promise<IVehicle[]> {
  try {
    const dbVehicles = await findMany<IVehicle>(
      Vehicle as any,
      { status: { $ne: 'DELETED' } },
      {},
      {
        lean: true,
        sort: { views: -1 },
        limit,
        populate: {
          path: 'dealer',
          select: 'companyName logo verified',
        },
      }
    );
    
    const fallbacks = ShowroomService.getAllFallbackVehicles();
    const merged = ShowroomService.mergeVehicles(dbVehicles || [], fallbacks);
    return merged.slice(0, limit);
  } catch (error) {
    console.error('Database featured vehicles error:', error);
    return ShowroomService.getAllFallbackVehicles().slice(0, limit);
  }
}

export async function getRelatedVehicles(
  vehicleId: string,
  make: string,
  bodyType?: string,
  limit: number = 4
): Promise<IVehicle[]> {
  try {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(vehicleId);
    
    const query: any = {
      status: { $ne: 'DELETED' },
      $or: [{ make: { $regex: escapeRegex(make), $options: 'i' } }],
    };

    if (isObjectId) {
      query._id = { $ne: vehicleId };
    } else {
      query.slug = { $ne: vehicleId };
      query.id = { $ne: vehicleId };
    }

    if (bodyType) {
      query.$or.push({ bodyType: { $regex: escapeRegex(bodyType), $options: 'i' } });
    }

    const dbRelated = await findMany<IVehicle>(
      Vehicle as any,
      query,
      {},
      {
        lean: true,
        sort: { createdAt: -1 },
        limit,
      }
    );

    const fallbacks = ShowroomService.getAllFallbackVehicles();
    const cleanId = String(vehicleId).toLowerCase();
    const matchedFallbacks = fallbacks.filter(
      v => String(v.id).toLowerCase() !== cleanId && 
           String(v.slug).toLowerCase() !== cleanId && 
           (v.make.toLowerCase() === make.toLowerCase() || (bodyType && v.bodyType?.toLowerCase() === bodyType.toLowerCase()))
    );

    const merged = ShowroomService.mergeVehicles(dbRelated || [], matchedFallbacks);
    return merged.slice(0, limit);
  } catch (error) {
    console.error('Related vehicles query error:', error);
    const fallbacks = ShowroomService.getAllFallbackVehicles();
    const cleanId = String(vehicleId).toLowerCase();
    return fallbacks
      .filter(v => String(v.id).toLowerCase() !== cleanId && 
                   String(v.slug).toLowerCase() !== cleanId && 
                   (v.make.toLowerCase() === make.toLowerCase() || (bodyType && v.bodyType?.toLowerCase() === bodyType.toLowerCase())))
      .slice(0, limit);
  }
}

export async function getVehicleMakes(): Promise<string[]> {
  try {
    const results = await aggregate<{ _id: string }>(
      Vehicle as any,
      [
        { $match: { status: { $ne: 'DELETED' } } },
        { $group: { _id: '$make' } },
        { $sort: { _id: 1 } },
      ]
    );
    const dbMakes = results.map((r) => r._id).filter(Boolean);
    const fallbackMakes = ShowroomService.getAllFallbackVehicles().map(v => v.make);
    return Array.from(new Set([...dbMakes, ...fallbackMakes])).sort();
  } catch (error) {
    console.error('Error fetching vehicle makes:', error);
    const fallbackMakes = ShowroomService.getAllFallbackVehicles().map(v => v.make);
    return Array.from(new Set(fallbackMakes)).sort();
  }
}

export async function getVehicleModels(make: string): Promise<string[]> {
  try {
    const results = await aggregate<{ _id: string }>(
      Vehicle as any,
      [
        {
          $match: {
            make: { $regex: `^${escapeRegex(make)}$`, $options: 'i' },
            status: { $ne: 'DELETED' },
          },
        },
        { $group: { _id: '$model' } },
        { $sort: { _id: 1 } },
      ]
    );
    const dbModels = results.map((r) => r._id).filter(Boolean);
    
    const fallbackModels = ShowroomService.getAllFallbackVehicles()
      .filter(v => v.make.toLowerCase() === make.toLowerCase())
      .map(v => v.model);

    return Array.from(new Set([...dbModels, ...fallbackModels])).sort();
  } catch (error) {
    console.error(`Error fetching models for ${make}:`, error);
    const fallbackModels = ShowroomService.getAllFallbackVehicles()
      .filter(v => v.make.toLowerCase() === make.toLowerCase())
      .map(v => v.model);
    return Array.from(new Set(fallbackModels)).sort();
  }
}

export async function getVehicleStats(): Promise<VehicleMarketStats> {
  const allVehicles = await getDBVehiclesOnly({});
  const fallbacks = ShowroomService.getAllFallbackVehicles();
  const merged = ShowroomService.mergeVehicles(allVehicles, fallbacks);

  let minPrice = Infinity;
  let maxPrice = 0;
  let minYear = Infinity;
  let maxYear = 0;
  let totalPrice = 0;

  merged.forEach(v => {
    if (v.price) {
      minPrice = Math.min(minPrice, v.price);
      maxPrice = Math.max(maxPrice, v.price);
      totalPrice += v.price;
    }
    if (v.year) {
      minYear = Math.min(minYear, v.year);
      maxYear = Math.max(maxYear, v.year);
    }
  });

  return {
    total: merged.length,
    verified: merged.length,
    sold: 0,
    averagePrice: Math.round(totalPrice / (merged.length || 1)),
    priceRange: { min: minPrice === Infinity ? 58000000 : minPrice, max: maxPrice || 1650000000 },
    yearRange: { min: minYear === Infinity ? 2015 : minYear, max: maxYear || new Date().getFullYear() },
  };
}

export async function incrementViews(vehicleId: string): Promise<void> {
  try {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(vehicleId);
    const filter = isObjectId ? { _id: vehicleId } : { $or: [{ id: vehicleId }, { slug: vehicleId }] };
    await update(
      Vehicle as any,
      filter,
      { $inc: { views: 1 } }
    );
  } catch {
    // Non-critical
  }
}

export async function parseNaturalLanguageQuery(prompt: string): Promise<VehicleFilters> {
  const query = prompt.toLowerCase();
  const filters: VehicleFilters = {};

  const knownMakes = [
    'porsche', 'ferrari', 'lamborghini', 'rolls-royce', 'bentley',
    'mercedes-benz', 'mercedes', 'maybach', 'bmw', 'audi', 'mclaren',
    'aston martin', 'bugatti', 'range rover', 'land rover', 'lexus'
  ];
  
  for (const make of knownMakes) {
    if (query.includes(make)) {
      if (make === 'mercedes' || make === 'maybach') filters.make = 'Mercedes-Benz';
      else filters.make = make;
      break;
    }
  }

  if (query.includes('suv')) filters.bodyType = 'SUV';
  else if (query.includes('sedan') || query.includes('executive')) filters.bodyType = 'Sedan';
  else if (query.includes('coupe') || query.includes('sports')) filters.bodyType = 'Coupe';
  else if (query.includes('convertible') || query.includes('spider')) filters.bodyType = 'Convertible';

  if (query.includes('lagos')) filters.location = 'Lagos';
  else if (query.includes('abuja')) filters.location = 'Abuja';

  const millionMatch = query.match(/(?:under|below|max)\s*(?:₦|\$)?\s*(\d+)\s*(?:m|million)/i);
  if (millionMatch) {
    filters.maxPrice = parseInt(millionMatch[1], 10) * 1_000_000;
  }

  return filters;
}

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

export async function advancedSearch(
  query: string,
  pagination: PaginationOptions = { page: 1, limit: 12 }
): Promise<PaginatedResult<IVehicle>> {
  const parsedQuery = await parseNaturalLanguageQuery(query);
  
  const filters: VehicleFilters = {
    search: query,
  };

  if (parsedQuery.make) filters.make = parsedQuery.make;
  if (parsedQuery.model) filters.model = parsedQuery.model;
  if (parsedQuery.bodyType) filters.bodyType = parsedQuery.bodyType;
  if (parsedQuery.minPrice) filters.minPrice = parsedQuery.minPrice;
  if (parsedQuery.maxPrice) filters.maxPrice = parsedQuery.maxPrice;

  return getVehicles(filters, pagination, { field: 'createdAt', order: 'desc' });
}

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

export async function getSearchSuggestions(query: string): Promise<SearchSuggestion[]> {
  if (!query || query.length < 2) {
    return [];
  }

  const suggestions: SearchSuggestion[] = [];
  const searchLower = query.toLowerCase();

  const makes = await getVehicleMakes();
  const matchingMakes = makes
    .filter(make => make.toLowerCase().includes(searchLower))
    .slice(0, 3);

  for (const make of matchingMakes) {
    suggestions.push({
      type: 'make',
      label: make,
      value: make,
      count: 4,
    });
  }

  if (query.length > 1) {
    const fallbacks = ShowroomService.getAllFallbackVehicles();
    const matchingVehicles = fallbacks.filter(
      v => v.make.toLowerCase().includes(searchLower) || v.model.toLowerCase().includes(searchLower)
    ).slice(0, 5);

    for (const vehicle of matchingVehicles) {
      suggestions.push({
        type: 'vehicle',
        label: `${vehicle.make} ${vehicle.model} ${vehicle.year}`,
        value: vehicle.slug || vehicle.id || '',
        image: vehicle.images?.[0],
      });
    }
  }

  return suggestions.slice(0, 8);
}

export async function getPopularSearches(): Promise<string[]> {
  return [
    'Porsche 911 GT3 RS',
    'Mercedes-Maybach S680',
    'Ferrari SF90',
    'Lamborghini Revuelto',
    'Rolls-Royce Cullinan',
    'Bentley Continental GT',
    'Range Rover SV',
    'McLaren 750S',
  ];
}

export async function searchVehicles(
  query: string,
  pagination: PaginationOptions = { page: 1, limit: 12 }
): Promise<PaginatedResult<IVehicle>> {
  if (!query || query.length < 2) {
    return getVehicles({}, pagination);
  }

  const parsed = await parseNaturalLanguageQuery(query);
  if (parsed.make || parsed.bodyType || parsed.minPrice || parsed.maxPrice) {
    return advancedSearch(query, pagination);
  }

  return getVehicles({ search: query }, pagination);
}