/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { getServerSession } from 'next-auth';
import { authConfig } from '@/auth/config';
import { ComparisonService } from '@/services/comparison.service';
import { InventoryService } from '@/services/inventory.service';

export interface ActionResponse<T = undefined> {
  success: boolean;
  message?: string;
  data?: T;
}

export async function getUserComparisonAction(userId: string): Promise<ActionResponse<any>> {
  try {
    const comparison = await ComparisonService.getComparisonByUser(userId);
    return {
      success: true,
      data: comparison ? JSON.parse(JSON.stringify(comparison)) : null,
    };
  } catch (error) {
    console.error('[ComparisonAction] getUserComparisonAction error:', error);
    return { success: false, message: 'Failed to load user comparison.' };
  }
}

export async function createComparisonAction(
  userId: string,
  vehicleIds: string[]
): Promise<ActionResponse<any>> {
  try {
    const created = await ComparisonService.createComparison({ userId }, vehicleIds);
    return {
      success: true,
      data: JSON.parse(JSON.stringify(created)),
    };
  } catch (error) {
    console.error('[ComparisonAction] createComparisonAction error:', error);
    return { success: false, message: 'Failed to create comparison.' };
  }
}

export async function addVehicleToComparisonAction(
  comparisonId: string,
  vehicleId: string
): Promise<ActionResponse<any>> {
  try {
    const updated = await ComparisonService.addVehicleToComparison(comparisonId, vehicleId);
    return {
      success: true,
      data: JSON.parse(JSON.stringify(updated)),
    };
  } catch (error) {
    console.error('[ComparisonAction] addVehicleToComparisonAction error:', error);
    return { success: false, message: 'Failed to add vehicle to comparison.' };
  }
}

export async function removeVehicleFromComparisonAction(
  comparisonId: string,
  vehicleId: string
): Promise<ActionResponse<any>> {
  try {
    const updated = await ComparisonService.removeVehicleFromComparison(comparisonId, vehicleId);
    return {
      success: true,
      data: JSON.parse(JSON.stringify(updated)),
    };
  } catch (error) {
    console.error('[ComparisonAction] removeVehicleFromComparisonAction error:', error);
    return { success: false, message: 'Failed to remove vehicle from comparison.' };
  }
}

export async function deleteComparisonAction(comparisonId: string): Promise<ActionResponse> {
  try {
    await ComparisonService.deleteComparison(comparisonId);
    return { success: true, message: 'Comparison removed.' };
  } catch (error) {
    console.error('[ComparisonAction] deleteComparisonAction error:', error);
    return { success: false, message: 'Failed to delete comparison.' };
  }
}

export async function getVehicleByIdAction(vehicleId: string): Promise<ActionResponse<any>> {
  try {
    const vehicle = await InventoryService.getVehicleById(vehicleId);
    return {
      success: true,
      data: vehicle ? JSON.parse(JSON.stringify(vehicle)) : null,
    };
  } catch (error) {
    console.error('[ComparisonAction] getVehicleByIdAction error:', error);
    return { success: false, message: 'Failed to fetch vehicle.' };
  }
}