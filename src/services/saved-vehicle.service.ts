/* eslint-disable @typescript-eslint/no-explicit-any */

import { SavedVehicle } from '@/models/SavedVehicle';
import { Vehicle } from '@/models/Vehicle';
import type { IVehicle } from '@/types';
import {
  findMany,
  findOne,
  create,
  update,
  deleteOne,
  exists,
  count,
  aggregate,
} from './database';

export interface SavedVehicleWithDetails {
  id: string;
  vehicle: IVehicle;
  savedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Helper function to convert Mongoose document to IVehicle
 */
function toIVehicle(doc: any): IVehicle {
  return {
    id: doc._id?.toString() || doc.id || '',
    slug: doc.slug || '',
    make: doc.make || '',
    model: doc.model || '',
    year: doc.year || 0,
    price: doc.price || 0,
    currency: doc.currency || 'NGN',
    mileage: doc.mileage || 0,
    images: doc.images || [],
    transmission: doc.transmission || 'Automatic',
    fuelType: doc.fuelType || 'Petrol',
    verified: doc.verified === 'VERIFIED' || doc.verified === true,
    status: doc.status || 'AVAILABLE',
    location: doc.location || 'Lagos',
    power: typeof doc.power === 'number' ? doc.power : parseInt(doc.power) || 0,
    savedCount: doc.savedCount || 0,
    createdAt: doc.createdAt || new Date(),
    updatedAt: doc.updatedAt || new Date(),
  };
}

export class SavedVehicleService {
  /**
   * Get all saved vehicles for a user
   */
  static async getSavedVehicles(userId: string): Promise<SavedVehicleWithDetails[]> {
    const saved = await findMany<any>(
      SavedVehicle as any,
      { user: userId },
      undefined,
      { lean: true }
    );

    // Populate vehicle data manually
    const populated = await Promise.all(
      saved.map(async (item: any) => {
        const vehicleDoc = await findOne<any>(
          Vehicle as any,
          { _id: item.vehicle },
          undefined,
          { lean: true }
        );
        
        const vehicle = vehicleDoc ? toIVehicle(vehicleDoc) : null as any;

        return {
          id: item._id?.toString() || item.id,
          vehicle,
          savedAt: item.savedAt || item.createdAt,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        };
      })
    );

    return populated;
  }

  /**
   * Check if a vehicle is saved by a user
   */
  static async isSaved(userId: string, vehicleId: string): Promise<boolean> {
    return exists(SavedVehicle as any, {
      user: userId,
      vehicle: vehicleId,
    });
  }

  /**
   * Toggle save status for a vehicle
   */
  static async toggleSave(userId: string, vehicleId: string): Promise<{
    saved: boolean;
    action: 'added' | 'removed';
  }> {
    const existing = await findOne<any>(
      SavedVehicle as any,
      {
        user: userId,
        vehicle: vehicleId,
      }
    );

    if (existing && existing._id) {
      // Remove from saved
      await deleteOne(SavedVehicle as any, { _id: existing._id });
      
      // Decrement saved count on vehicle
      await update(
        Vehicle as any,
        { _id: vehicleId },
        { $inc: { savedCount: -1 } }
      );

      return { saved: false, action: 'removed' };
    } else {
      // Add to saved
      await create(SavedVehicle as any, {
        user: userId,
        vehicle: vehicleId,
        savedAt: new Date(),
      });

      // Increment saved count on vehicle
      await update(
        Vehicle as any,
        { _id: vehicleId },
        { $inc: { savedCount: 1 } }
      );

      return { saved: true, action: 'added' };
    }
  }

  /**
   * Remove a vehicle from saved
   */
  static async removeSavedVehicle(userId: string, vehicleId: string): Promise<void> {
    const saved = await findOne<any>(
      SavedVehicle as any,
      {
        user: userId,
        vehicle: vehicleId,
      }
    );

    if (saved && saved._id) {
      await deleteOne(SavedVehicle as any, { _id: saved._id });
      
      // Decrement saved count on vehicle
      await update(
        Vehicle as any,
        { _id: vehicleId },
        { $inc: { savedCount: -1 } }
      );
    }
  }

  /**
   * Get saved count for a vehicle
   */
  static async getSavedCount(vehicleId: string): Promise<number> {
    return count(SavedVehicle as any, { vehicle: vehicleId });
  }

  /**
   * Get most saved vehicles
   */
  static async getMostSavedVehicles(limit: number = 10): Promise<IVehicle[]> {
    const results = await aggregate<any>(
      SavedVehicle as any,
      [
        {
          $group: {
            _id: '$vehicle',
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: limit },
        {
          $lookup: {
            from: 'vehicles',
            localField: '_id',
            foreignField: '_id',
            as: 'vehicle',
          },
        },
        { $unwind: '$vehicle' },
        {
          $replaceRoot: {
            newRoot: '$vehicle',
          },
        },
      ]
    );

    // Convert results to IVehicle array using the helper
    return (results as any[]).map((doc: any) => toIVehicle(doc));
  }

  /**
   * Get saved vehicles with pagination
   */
  static async getSavedVehiclesPaginated(
    userId: string,
    page: number = 1,
    limit: number = 12
  ): Promise<{
    data: SavedVehicleWithDetails[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  }> {
    const skip = (page - 1) * limit;

    const [saved, total] = await Promise.all([
      findMany<any>(
        SavedVehicle as any,
        { user: userId },
        undefined,
        {
          lean: true,
          skip,
          limit,
          sort: { savedAt: -1 },
        }
      ),
      count(SavedVehicle as any, { user: userId }),
    ]);

    // Populate vehicle data for each saved item
    const data = await Promise.all(
      saved.map(async (item: any) => {
        const vehicleDoc = await findOne<any>(
          Vehicle as any,
          { _id: item.vehicle },
          undefined,
          { lean: true }
        );
        
        const vehicle = vehicleDoc ? toIVehicle(vehicleDoc) : null as any;

        return {
          id: item._id?.toString() || item.id,
          vehicle,
          savedAt: item.savedAt || item.createdAt,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        };
      })
    );

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }
}

// Export default for convenience
export default SavedVehicleService;