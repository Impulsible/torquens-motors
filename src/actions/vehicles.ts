/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { getServerSession } from 'next-auth';
import { authConfig } from '@/auth/config';
import { revalidatePath } from 'next/cache';
// ✅ Fix: Import from the correct path
import {
  findMany,
  findById,
  update,
  create,
  type PaginationOptions,
  type PaginatedResult,
} from '@/services/database';
import type { IVehicle } from '@/types';

// Import from vehicle.service
import {
  getVehicles,
  getVehicleById as getVehicleByIdService,
  getVehicleBySlug,
  getFeaturedVehicles,
  getRelatedVehicles,
  getVehicleMakes,
  getVehicleModels,
  getVehicleStats,
  incrementViews,
  searchTORQUENSIntelligence,
  advancedSearch,
  getSearchSuggestions,
  getPopularSearches,
  searchVehicles,
} from '@/services/vehicle.service';

// ─────────────────────────────────────────────────────────────
// DEALER-SPECIFIC FUNCTIONS
// ─────────────────────────────────────────────────────────────

/**
 * Get all vehicles for the current dealer
 */
export async function getDealerVehicles() {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id || session.user.role !== 'DEALER') {
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
    return { success: true, data: vehicles };
  } catch (error) {
    console.error('Error fetching dealer vehicles:', error);
    return { success: false, message: 'Failed to fetch vehicles', data: [] };
  }
}

/**
 * Archive a vehicle (soft delete)
 */
export async function archiveVehicle(vehicleId: string, dealerId: string) {
  const { Vehicle } = await import('@/models/Vehicle');
  
  // Verify dealer owns this vehicle
  const vehicle = await findById(Vehicle as any, vehicleId, {}, { lean: true });
  if (!vehicle || (vehicle as any).dealer !== dealerId) {
    throw new Error('Unauthorized');
  }
  
  return update(
    Vehicle as any,
    { _id: vehicleId },
    { status: 'ARCHIVED' }
  );
}

/**
 * Update vehicle status
 */
export async function updateVehicleStatus(vehicleId: string, status: string) {
  const { Vehicle } = await import('@/models/Vehicle');
  return update(
    Vehicle as any,
    { _id: vehicleId },
    { status }
  );
}

// ─────────────────────────────────────────────────────────────
// ACTION WRAPPERS
// ─────────────────────────────────────────────────────────────

/**
 * Delete a vehicle (soft delete / archive)
 */
export async function deleteVehicle(vehicleId: string) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id || session.user.role !== 'DEALER') {
    return { success: false, message: 'Unauthorized' };
  }

  try {
    await archiveVehicle(vehicleId, session.user.id);
    revalidatePath('/dealer/inventory');
    return { success: true, message: 'Vehicle archived successfully' };
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    return { success: false, message: 'Failed to archive vehicle' };
  }
}

/**
 * Get a single vehicle by ID (with dealer auth check)
 * ✅ Renamed to avoid conflict with re-export
 */
export async function getDealerVehicleById(vehicleId: string) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return { success: false, message: 'Unauthorized', data: null };
  }

  try {
    const vehicle = await getVehicleByIdService(vehicleId);
    return { success: true, data: vehicle };
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    return { success: false, message: 'Failed to fetch vehicle', data: null };
  }
}

/**
 * Create a new vehicle (for dealer use)
 */
export async function createVehicle(formData: FormData) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id || session.user.role !== 'DEALER') {
    return { success: false, message: 'Unauthorized' };
  }

  try {
    const { Vehicle } = await import('@/models/Vehicle');

    // Extract data from FormData
    const data = {
      make: formData.get('make') as string,
      model: formData.get('model') as string,
      year: parseInt(formData.get('year') as string),
      price: parseFloat(formData.get('price') as string),
      currency: (formData.get('currency') as string) || 'NGN',
      mileage: parseInt(formData.get('mileage') as string) || 0,
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
    return { success: true, data: vehicle, message: 'Vehicle created successfully' };
  } catch (error) {
    console.error('Error creating vehicle:', error);
    return { success: false, message: 'Failed to create vehicle' };
  }
}

/**
 * Update an existing vehicle
 */
export async function updateVehicle(vehicleId: string, formData: FormData) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id || session.user.role !== 'DEALER') {
    return { success: false, message: 'Unauthorized' };
  }

  try {
    const { Vehicle } = await import('@/models/Vehicle');

    // Extract data from FormData
    const data: Record<string, any> = {};
    const fields = ['make', 'model', 'year', 'price', 'currency', 'mileage', 'transmission', 'fuelType', 'location', 'bodyType', 'description', 'status'];
    
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

    // Verify dealer owns this vehicle
    const vehicle = await findById(Vehicle as any, vehicleId, {}, { lean: true });
    if (!vehicle || (vehicle as any).dealer !== session.user.id) {
      return { success: false, message: 'Unauthorized' };
    }

    const updated = await update(
      Vehicle as any,
      { _id: vehicleId },
      data
    );
    
    revalidatePath('/dealer/inventory');
    revalidatePath(`/vehicles/${vehicleId}`);
    return { success: true, data: updated, message: 'Vehicle updated successfully' };
  } catch (error) {
    console.error('Error updating vehicle:', error);
    return { success: false, message: 'Failed to update vehicle' };
  }
}

// ─────────────────────────────────────────────────────────────
// RE-EXPORT public functions from vehicle.service
// ─────────────────────────────────────────────────────────────

// Re-export for use in other actions
export {
  getVehicles,
  getVehicleByIdService as getVehicleById,
  getVehicleBySlug,
  getFeaturedVehicles,
  getRelatedVehicles,
  getVehicleMakes,
  getVehicleModels,
  getVehicleStats,
  incrementViews,
  searchTORQUENSIntelligence,
  advancedSearch,
  getSearchSuggestions,
  getPopularSearches,
  searchVehicles,
};