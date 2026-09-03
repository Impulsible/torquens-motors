/* eslint-disable @typescript-eslint/no-explicit-any */

import { SavedVehicle } from '@/models/SavedVehicle';
import { Vehicle } from '@/models/Vehicle';
import type { IVehicle } from '@/types';
import { connectToDatabase } from '@/lib/mongodb';
import * as VehicleService from '@/services/vehicle.service';

export interface SavedVehicleWithDetails {
  id: string;
  vehicle: IVehicle;
  savedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export async function getSavedVehicles(userId: string): Promise<SavedVehicleWithDetails[]> {
  try {
    await connectToDatabase();
    const cleanUser = String(userId).trim();

    const saved = await SavedVehicle.find({ user: cleanUser })
      .sort({ savedAt: -1 })
      .lean();

    const items = await Promise.all(
      saved.map(async (item: any) => {
        const vehicleId = String(item.vehicle || '').trim();
        const vehicleObj = await VehicleService.getVehicleById(vehicleId);
        if (!vehicleObj) return null;

        return {
          id: item._id?.toString() || item.id,
          vehicle: vehicleObj,
          savedAt: item.savedAt || item.createdAt || new Date(),
          createdAt: item.createdAt || new Date(),
          updatedAt: item.updatedAt || new Date(),
        };
      })
    );

    return items.filter(Boolean) as SavedVehicleWithDetails[];
  } catch (error) {
    console.error('[SavedVehicleService] getSavedVehicles error:', error);
    return [];
  }
}

export async function isSaved(userId: string, vehicleId: string): Promise<boolean> {
  try {
    await connectToDatabase();
    const cleanUser = String(userId).trim();
    const cleanVehicle = String(vehicleId).trim();

    const exists = await SavedVehicle.exists({
      user: cleanUser,
      vehicle: cleanVehicle,
    });
    return !!exists;
  } catch (error) {
    console.error('[SavedVehicleService] isSaved error:', error);
    return false;
  }
}

export async function toggleSave(
  userId: string,
  vehicleId: string
): Promise<{
  saved: boolean;
  action: 'added' | 'removed';
}> {
  try {
    await connectToDatabase();
    const cleanUser = String(userId).trim();
    const cleanVehicle = String(vehicleId).trim();
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(cleanVehicle);

    const existing = await SavedVehicle.findOne({
      user: cleanUser,
      vehicle: cleanVehicle,
    });

    if (existing) {
      await SavedVehicle.deleteOne({ _id: existing._id });
      if (isObjectId) {
        await Vehicle.findByIdAndUpdate(cleanVehicle, {
          $inc: { savedCount: -1 },
        }).catch(() => {});
      } else {
        await Vehicle.updateOne(
          { $or: [{ id: cleanVehicle }, { slug: cleanVehicle }] },
          { $inc: { savedCount: -1 } }
        ).catch(() => {});
      }
      return { saved: false, action: 'removed' };
    } else {
      await SavedVehicle.create({
        user: cleanUser,
        vehicle: cleanVehicle,
        savedAt: new Date(),
      });
      if (isObjectId) {
        await Vehicle.findByIdAndUpdate(cleanVehicle, {
          $inc: { savedCount: 1 },
        }).catch(() => {});
      } else {
        await Vehicle.updateOne(
          { $or: [{ id: cleanVehicle }, { slug: cleanVehicle }] },
          { $inc: { savedCount: 1 } }
        ).catch(() => {});
      }
      return { saved: true, action: 'added' };
    }
  } catch (error) {
    console.error('[SavedVehicleService] toggleSave error:', error);
    throw new Error(
      `Failed to toggle save: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export async function removeSavedVehicle(userId: string, vehicleId: string): Promise<void> {
  try {
    await connectToDatabase();
    const cleanUser = String(userId).trim();
    const cleanVehicle = String(vehicleId).trim();
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(cleanVehicle);

    const saved = await SavedVehicle.findOne({
      user: cleanUser,
      vehicle: cleanVehicle,
    });

    if (saved) {
      await SavedVehicle.deleteOne({ _id: saved._id });
      if (isObjectId) {
        await Vehicle.findByIdAndUpdate(cleanVehicle, {
          $inc: { savedCount: -1 },
        }).catch(() => {});
      } else {
        await Vehicle.updateOne(
          { $or: [{ id: cleanVehicle }, { slug: cleanVehicle }] },
          { $inc: { savedCount: -1 } }
        ).catch(() => {});
      }
    }
  } catch (error) {
    console.error('[SavedVehicleService] removeSavedVehicle error:', error);
    throw new Error(
      `Failed to remove saved vehicle: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export async function getSavedCount(vehicleId: string): Promise<number> {
  try {
    await connectToDatabase();
    const cleanVehicle = String(vehicleId).trim();
    return await SavedVehicle.countDocuments({ vehicle: cleanVehicle });
  } catch (error) {
    console.error('[SavedVehicleService] getSavedCount error:', error);
    return 0;
  }
}

export async function getMostSavedVehicles(limit: number = 10): Promise<IVehicle[]> {
  try {
    await connectToDatabase();

    const results = await SavedVehicle.aggregate([
      {
        $group: {
          _id: '$vehicle',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: limit },
    ]);

    const vehicles = await Promise.all(
      results.map(async (res) => {
        const vId = String(res._id || '').trim();
        return await VehicleService.getVehicleById(vId);
      })
    );

    return vehicles.filter(Boolean) as IVehicle[];
  } catch (error) {
    console.error('[SavedVehicleService] getMostSavedVehicles error:', error);
    return [];
  }
}

export async function getSavedVehiclesPaginated(
  userId: string,
  page: number = 1,
  limit: number = 12
): Promise<{
  data: SavedVehicleWithDetails[];
  vehicles: IVehicle[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}> {
  try {
    const allSaved = await getSavedVehicles(userId);
    const total = allSaved.length;
    const skip = (page - 1) * limit;
    const paginatedData = allSaved.slice(skip, skip + limit);
    const totalPages = Math.max(1, Math.ceil(total / limit));

    return {
      data: paginatedData,
      vehicles: paginatedData.map((d) => d.vehicle),
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  } catch (error) {
    console.error('[SavedVehicleService] getSavedVehiclesPaginated error:', error);
    return {
      data: [],
      vehicles: [],
      pagination: {
        total: 0,
        page,
        limit,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };
  }
}