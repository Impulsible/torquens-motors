'use server';

// ✅ Import individual functions directly
import { getServerSession } from 'next-auth';
import { authConfig } from '@/auth/config';
import { 
  getSavedVehicles as getSavedVehiclesService,
  toggleSave as toggleSaveService,
  removeSavedVehicle as removeSavedVehicleService,
  isSaved as isSavedService,
} from '@/services/saved-vehicle.service';
import { revalidatePath } from 'next/cache'; // ✅ Import directly at the top

/**
 * Helper to get session
 */
async function getSession() {
  return getServerSession(authConfig);
}

/**
 * Get all saved vehicles for the current user
 */
export async function getSavedVehicles() {
  const session = await getSession();
  
  if (!session?.user?.id) {
    return { success: false, message: 'Unauthorized', data: [] };
  }

  try {
    const vehicles = await getSavedVehiclesService(session.user.id);
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
  const session = await getSession();
  
  if (!session?.user?.id) {
    return { 
      success: false, 
      message: 'You must be logged in to save vehicles' 
    };
  }

  try {
    const result = await toggleSaveService(session.user.id, vehicleId);
    
    // ✅ Revalidate paths directly
    revalidatePath('/dashboard/saved');
    revalidatePath(`/vehicles/${vehicleId}`);
    revalidatePath('/vehicles');
    
    return { 
      success: true, 
      data: result,
      message: result.saved ? 'Vehicle saved successfully' : 'Vehicle removed from saved'
    };
  } catch (error) {
    console.error('Error toggling save:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to toggle save status' 
    };
  }
}

/**
 * Remove a vehicle from saved
 */
export async function removeSavedVehicle(vehicleId: string) {
  const session = await getSession();
  
  if (!session?.user?.id) {
    return { success: false, message: 'Unauthorized' };
  }

  try {
    await removeSavedVehicleService(session.user.id, vehicleId);
    
    // ✅ Revalidate paths directly
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
 * Check if a vehicle is saved by the current user
 */
export async function checkIsSaved(vehicleId: string) {
  const session = await getSession();
  
  if (!session?.user?.id) {
    return { success: false, message: 'Unauthorized', data: false };
  }

  try {
    const isSaved = await isSavedService(session.user.id, vehicleId);
    return { success: true, data: isSaved };
  } catch (error) {
    console.error('Error checking saved status:', error);
    return { success: false, message: 'Failed to check saved status', data: false };
  }
}

/**
 * Alias for checkIsSaved for backward compatibility
 */
export async function isVehicleSaved(vehicleId: string) {
  return checkIsSaved(vehicleId);
}