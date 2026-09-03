/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { getServerSession } from 'next-auth';
import { authConfig } from '@/auth/config';
import { revalidatePath } from 'next/cache';
// ✅ Change: Use server-only wrapper
import { findMany, findById, update, create } from '@/lib/database.server';
import type { IVehicle } from '@/types';

import * as VehicleService from '@/services/vehicle.service';
import ShowroomService from '@/services/showroom.service';

export interface ActionResponse<T = undefined> {
  success: boolean;
  message: string;
  data?: T;
}

export async function getDealerVehicles(): Promise<ActionResponse<IVehicle[]>> {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id || (session.user as any).role !== 'DEALER') {
    return { success: false, message: 'Unauthorized', data: [] };
  }

  try {
    const { Vehicle } = await import('@/models/Vehicle');
    const vehicles = await findMany<IVehicle>(
      Vehicle as any,
      { dealer: session.user.id },
      {},
      {
        lean: true,
        sort: { createdAt: -1 },
      }
    );
    return {
      success: true,
      message: 'Dealer vehicles fetched successfully.',
      data: JSON.parse(JSON.stringify(vehicles)),
    };
  } catch (error) {
    console.error('Error fetching dealer vehicles:', error);
    return { success: false, message: 'Failed to fetch vehicles', data: [] };
  }
}

export async function archiveVehicle(vehicleId: string, dealerId: string): Promise<unknown> {
  const { Vehicle } = await import('@/models/Vehicle');

  const vehicle = await findById<IVehicle>(Vehicle as any, vehicleId, {}, { lean: true });
  if (!vehicle || String(vehicle.dealer) !== dealerId) {
    throw new Error('Unauthorized');
  }

  return update(Vehicle as any, { _id: vehicleId }, { status: 'ARCHIVED' });
}

export async function updateVehicleStatus(vehicleId: string, status: string): Promise<unknown> {
  const { Vehicle } = await import('@/models/Vehicle');
  return update(Vehicle as any, { _id: vehicleId }, { status });
}

export async function deleteVehicle(vehicleId: string): Promise<ActionResponse> {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id || (session.user as any).role !== 'DEALER') {
    return { success: false, message: 'Unauthorized' };
  }

  try {
    await archiveVehicle(vehicleId, session.user.id);
    revalidatePath('/dealer/inventory');
    revalidatePath('/vehicles');
    return { success: true, message: 'Vehicle archived successfully' };
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    return { success: false, message: 'Failed to archive vehicle' };
  }
}

export async function getDealerVehicleById(vehicleId: string): Promise<ActionResponse<unknown | null>> {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return { success: false, message: 'Unauthorized', data: null };
  }

  try {
    const vehicle = await VehicleService.getVehicleById(vehicleId);
    return {
      success: true,
      message: 'Vehicle fetched.',
      data: vehicle ? JSON.parse(JSON.stringify(vehicle)) : null,
    };
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    return { success: false, message: 'Failed to fetch vehicle', data: null };
  }
}

export async function createVehicle(formData: FormData): Promise<ActionResponse<unknown>> {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id || (session.user as any).role !== 'DEALER') {
    return { success: false, message: 'Unauthorized' };
  }

  try {
    const { Vehicle } = await import('@/models/Vehicle');

    const data = {
      make: formData.get('make') as string,
      model: formData.get('model') as string,
      year: parseInt(formData.get('year') as string, 10),
      price: parseFloat(formData.get('price') as string),
      currency: (formData.get('currency') as string) || 'NGN',
      mileage: parseInt(formData.get('mileage') as string, 10) || 0,
      transmission: formData.get('transmission') as string,
      fuelType: formData.get('fuelType') as string,
      location: formData.get('location') as string,
      bodyType: formData.get('bodyType') as string,
      description: formData.get('description') as string,
      images: JSON.parse((formData.get('images') as string) || '[]'),
      dealer: session.user.id,
      status: 'DRAFT',
      slug: `${(formData.get('make') as string).toLowerCase()}-${(formData.get('model') as string).toLowerCase()}-${Date.now()}`,
    };

    const vehicle = await create(Vehicle as any, data);
    revalidatePath('/dealer/inventory');
    revalidatePath('/vehicles');
    return {
      success: true,
      message: 'Vehicle created successfully',
      data: JSON.parse(JSON.stringify(vehicle)),
    };
  } catch (error) {
    console.error('Error creating vehicle:', error);
    return { success: false, message: 'Failed to create vehicle' };
  }
}

export async function updateVehicle(vehicleId: string, formData: FormData): Promise<ActionResponse<unknown>> {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id || (session.user as any).role !== 'DEALER') {
    return { success: false, message: 'Unauthorized' };
  }

  try {
    const { Vehicle } = await import('@/models/Vehicle');

    const data: Record<string, unknown> = {};
    const fields = [
      'make',
      'model',
      'year',
      'price',
      'currency',
      'mileage',
      'transmission',
      'fuelType',
      'location',
      'bodyType',
      'description',
      'status',
    ];

    for (const field of fields) {
      const value = formData.get(field);
      if (value !== null && value !== '') {
        if (['year', 'price', 'mileage'].includes(field)) {
          data[field] = parseFloat(value as string);
        } else if (field === 'images') {
          try {
            data[field] = JSON.parse(value as string);
          } catch {
            data[field] = [value];
          }
        } else {
          data[field] = value;
        }
      }
    }

    const vehicle = await findById<IVehicle>(Vehicle as any, vehicleId, {}, { lean: true });
    if (!vehicle || String(vehicle.dealer) !== session.user.id) {
      return { success: false, message: 'Unauthorized' };
    }

    const updated = await update(Vehicle as any, { _id: vehicleId }, data);

    revalidatePath('/dealer/inventory');
    revalidatePath(`/vehicles/${vehicleId}`);
    return {
      success: true,
      message: 'Vehicle updated successfully',
      data: JSON.parse(JSON.stringify(updated)),
    };
  } catch (error) {
    console.error('Error updating vehicle:', error);
    return { success: false, message: 'Failed to update vehicle' };
  }
}

// ─────────────────────────────────────────────────────────────
// PUBLIC VEHICLE SERVER ACTIONS
// ─────────────────────────────────────────────────────────────

export async function getVehicles(
  filters?: any,
  pagination?: { page?: number; limit?: number },
  sort?: any
) {
  try {
    const result = await VehicleService.getVehicles(filters || {}, pagination, sort);
    return JSON.parse(JSON.stringify(result));
  } catch (error) {
    console.error('Error in getVehicles action:', error);
    return { data: [], pagination: { total: 0, hasNextPage: false } };
  }
}

export async function getVehicleById(vehicleId: string): Promise<ActionResponse<IVehicle | null>> {
  try {
    const result = await VehicleService.getVehicleById(vehicleId);
    if (!result) {
      return {
        success: false,
        message: 'Vehicle not found in registry',
        data: null,
      };
    }
    return {
      success: true,
      message: 'Vehicle resolved successfully',
      data: JSON.parse(JSON.stringify(result)),
    };
  } catch (error) {
    console.error('Error in getVehicleById action:', error);
    return {
      success: false,
      message: 'Failed to fetch vehicle specification',
      data: null,
    };
  }
}

export async function getVehicleByIdAction(vehicleId: string): Promise<ActionResponse<IVehicle | null>> {
  return getVehicleById(vehicleId);
}

export async function getVehicleBySlug(slug: string) {
  try {
    const result = await VehicleService.getVehicleBySlug(slug);
    return result ? JSON.parse(JSON.stringify(result)) : null;
  } catch (error) {
    console.error('Error in getVehicleBySlug action:', error);
    return null;
  }
}

export async function getFeaturedVehicles(limit?: number) {
  try {
    const result = await VehicleService.getFeaturedVehicles(limit);
    return JSON.parse(JSON.stringify(result));
  } catch (error) {
    console.error('Error in getFeaturedVehicles action:', error);
    return [];
  }
}

export async function getRelatedVehicles(vehicleId: string, ...args: any[]) {
  try {
    const result = await (VehicleService.getRelatedVehicles as any)(vehicleId, ...args);
    return JSON.parse(JSON.stringify(result));
  } catch (error) {
    console.error('Error in getRelatedVehicles action:', error);
    return [];
  }
}

export async function getVehicleMakes() {
  try {
    const result = await VehicleService.getVehicleMakes();
    return JSON.parse(JSON.stringify(result));
  } catch (error) {
    console.error('Error in getVehicleMakes action:', error);
    return [];
  }
}

export async function getVehicleModels(make: string) {
  try {
    const result = await VehicleService.getVehicleModels(make);
    return JSON.parse(JSON.stringify(result));
  } catch (error) {
    console.error('Error in getVehicleModels action:', error);
    return [];
  }
}

export async function getVehicleStats() {
  try {
    const result = await VehicleService.getVehicleStats();
    return JSON.parse(JSON.stringify(result));
  } catch (error) {
    console.error('Error in getVehicleStats action:', error);
    return null;
  }
}

export async function incrementViews(vehicleId: string) {
  try {
    return await VehicleService.incrementViews(vehicleId);
  } catch (error) {
    console.error('Error in incrementViews action:', error);
    return null;
  }
}

export async function searchTORQUENSIntelligence(query: string) {
  try {
    const result = await VehicleService.searchTORQUENSIntelligence(query);
    return JSON.parse(JSON.stringify(result));
  } catch (error) {
    console.error('Error in searchTORQUENSIntelligence action:', error);
    return [];
  }
}

export async function advancedSearch(params: any) {
  try {
    const result = await (VehicleService.advancedSearch as any)(params);
    return JSON.parse(JSON.stringify(result));
  } catch (error) {
    console.error('Error in advancedSearch action:', error);
    return [];
  }
}

export async function getSearchSuggestions(query: string) {
  try {
    const result = await VehicleService.getSearchSuggestions(query);
    return JSON.parse(JSON.stringify(result));
  } catch (error) {
    console.error('Error in getSearchSuggestions action:', error);
    return [];
  }
}

export async function getPopularSearches() {
  try {
    const result = await VehicleService.getPopularSearches();
    return JSON.parse(JSON.stringify(result));
  } catch (error) {
    console.error('Error in getPopularSearches action:', error);
    return [];
  }
}

export async function searchVehicles(query: string) {
  try {
    const result = await VehicleService.searchVehicles(query);
    return JSON.parse(JSON.stringify(result));
  } catch (error) {
    console.error('Error in searchVehicles action:', error);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────
// DEALER EDIT PAGE SERVER ACTIONS (JSON-based, not FormData)
// ─────────────────────────────────────────────────────────────

/**
 * Updates a vehicle using a plain JSON object (for react-hook-form submissions).
 * Called from the EditVehicleForm client component.
 */
export async function updateVehicleData(
  vehicleId: string,
  data: Record<string, unknown>
): Promise<ActionResponse<unknown>> {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id || (session.user as any).role !== 'DEALER') {
    return { success: false, message: 'Unauthorized' };
  }

  try {
    const { Vehicle } = await import('@/models/Vehicle');

    // Verify ownership
    const vehicle = await findById<IVehicle>(Vehicle as any, vehicleId, {}, { lean: true });
    if (!vehicle || String(vehicle.dealer) !== session.user.id) {
      return { success: false, message: 'Unauthorized: vehicle not owned by dealer' };
    }

    const updated = await update(Vehicle as any, { _id: vehicleId }, data, { new: true, lean: true });

    revalidatePath('/dealer/inventory');
    revalidatePath(`/vehicles/${vehicleId}`);
    return {
      success: true,
      message: 'Vehicle updated successfully',
      data: JSON.parse(JSON.stringify(updated)),
    };
  } catch (error) {
    console.error('Error updating vehicle data:', error);
    return { success: false, message: 'Failed to update vehicle' };
  }
}

/**
 * Permanently deletes a vehicle record (hard delete for dealer edit page).
 */
export async function deleteVehiclePermanent(vehicleId: string): Promise<ActionResponse> {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id || (session.user as any).role !== 'DEALER') {
    return { success: false, message: 'Unauthorized' };
  }

  try {
    const { Vehicle } = await import('@/models/Vehicle');

    // Verify ownership
    const vehicle = await findById<IVehicle>(Vehicle as any, vehicleId, {}, { lean: true });
    if (!vehicle || String(vehicle.dealer) !== session.user.id) {
      return { success: false, message: 'Unauthorized: vehicle not owned by dealer' };
    }

    const { deleteOne } = await import('@/lib/database.server');
    await deleteOne(Vehicle as any, { _id: vehicleId });

    revalidatePath('/dealer/inventory');
    revalidatePath('/vehicles');
    return { success: true, message: 'Vehicle permanently deleted' };
  } catch (error) {
    console.error('Error permanently deleting vehicle:', error);
    return { success: false, message: 'Failed to delete vehicle' };
  }
}