'use server';

import { getServerSession } from 'next-auth';
import { authConfig } from '@/auth/config';
import { SavedVehicleService } from '@/services/saved-vehicle.service';
import { revalidatePath } from 'next/cache';

/**
 * Get all saved vehicles for the current user
 */
export async function getSavedVehicles() {
  const session = await getServerSession(authConfig);
  
  if (!session?.user?.id) {
    return { success: false, message: 'Unauthorized', data: [] };
  }

  try {
    const vehicles = await SavedVehicleService.getSavedVehicles(session.user.id);
    return { success: true, data: vehicles };
  } catch (error) {
    console.error('Error fetching saved vehicles:', error);
    return { success: false, message: 'Failed to fetch saved vehicles', data: [] };
  }
}

/**
 * Toggle save status for a vehicle
 */
export async function toggleSaveVehicle(vehicleId: string) {
  const session = await getServerSession(authConfig);
  
  if (!session?.user?.id) {
    return { success: false, message: 'Unauthorized', saved: false };
  }

  try {
    const result = await SavedVehicleService.toggleSave(session.user.id, vehicleId);
    
    // Revalidate relevant paths
    revalidatePath('/dashboard/saved');
    revalidatePath(`/vehicles/${vehicleId}`);
    revalidatePath('/vehicles');
    
    return { success: true, ...result };
  } catch (error) {
    console.error('Error toggling save:', error);
    return { success: false, message: 'Failed to toggle save', saved: false };
  }
}

/**
 * Remove a vehicle from saved
 */
export async function removeSavedVehicle(vehicleId: string) {
  const session = await getServerSession(authConfig);
  
  if (!session?.user?.id) {
    return { success: false, message: 'Unauthorized' };
  }

  try {
    await SavedVehicleService.removeSavedVehicle(session.user.id, vehicleId);
    
    // Revalidate relevant paths
    revalidatePath('/dashboard/saved');
    revalidatePath(`/vehicles/${vehicleId}`);
    revalidatePath('/vehicles');
    
    return { success: true, message: 'Vehicle removed from saved' };
  } catch (error) {
    console.error('Error removing saved vehicle:', error);
    return { success: false, message: 'Failed to remove vehicle' };
  }
}

/**
 * Check if a vehicle is saved
 */
export async function isVehicleSaved(vehicleId: string) {
  const session = await getServerSession(authConfig);
  
  if (!session?.user?.id) {
    return { success: false, saved: false };
  }

  try {
    const saved = await SavedVehicleService.isSaved(session.user.id, vehicleId);
    return { success: true, saved };
  } catch (error) {
    console.error('Error checking saved status:', error);
    return { success: false, saved: false };
  }
}