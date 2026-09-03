/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'server-only';

import { Vehicle, type IVehicleDocument } from '@/models/Vehicle';
import { 
  findOne,
  findById,
  paginate,
  create,
  update,
  deleteOne,
  deleteMany,
  aggregate,
} from './database';
import type { IVehicle, VehicleStatus } from '@/types';

export interface InventoryFilters {
  status?: VehicleStatus | 'ALL';
  verified?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  dealerId?: string;
}

export interface InventoryStats {
  total: number;
  published: number;
  pendingReview: number;
  draft: number;
  sold: number;
  archived: number;
  verified: number;
  unverified: number;
  totalViews: number;
  totalEnquiries: number;
  averagePrice: number;
}

function toIVehicle(doc: any): IVehicle | null {
  if (!doc) return null;
  
  const dealer = doc.dealer ? 
    (typeof doc.dealer === 'object' && doc.dealer._id) ? 
      doc.dealer._id.toString() : 
      doc.dealer.toString() : 
    '';

  return {
    id: doc._id?.toString() || doc.id || '',
    make: doc.make || '',
    model: doc.model || '',
    year: doc.year || 0,
    price: doc.price || 0,
    currency: doc.currency || 'NGN',
    mileage: doc.mileage || 0,
    transmission: doc.transmission || '',
    fuelType: doc.fuelType || '',
    engine: doc.engine || '',
    horsepower: doc.horsepower || 0,
    drivetrain: doc.drivetrain || '',
    bodyType: doc.bodyType || '',
    location: doc.location || '',
    images: doc.images || [],
    features: doc.features || [],
    description: doc.description || '',
    dealer: dealer,
    verified: doc.verified || 'UNVERIFIED',
    status: doc.status || 'DRAFT',
    slug: doc.slug || '',
    views: doc.views || 0,
    savedCount: doc.savedCount || 0,
    enquiryCount: doc.enquiryCount || 0,
    createdAt: doc.createdAt || new Date(),
    updatedAt: doc.updatedAt || new Date(),
  };
}

function toIVehicleArray(docs: any[]): IVehicle[] {
  return docs.map(doc => toIVehicle(doc)).filter((v): v is IVehicle => v !== null);
}

export class InventoryService {
  static async getInventory(
    dealerId: string,
    filters: InventoryFilters = {},
    page: number = 1,
    limit: number = 12
  ) {
    const query: any = { dealer: dealerId };

    if (filters.status && filters.status !== 'ALL') {
      query.status = filters.status;
    }

    if (filters.verified) {
      query.verified = filters.verified;
    }

    if (filters.minPrice || filters.maxPrice) {
      query.price = {};
      if (filters.minPrice) query.price.$gte = filters.minPrice;
      if (filters.maxPrice) query.price.$lte = filters.maxPrice;
    }

    if (filters.minYear || filters.maxYear) {
      query.year = {};
      if (filters.minYear) query.year.$gte = filters.minYear;
      if (filters.maxYear) query.year.$lte = filters.maxYear;
    }

    if (filters.search) {
      query.$or = [
        { make: { $regex: filters.search, $options: 'i' } },
        { model: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
      ];
    }

    const result = await paginate<any>(
      Vehicle as any,
      query,
      { page, limit, sort: { createdAt: -1 } }
    );

    return {
      data: toIVehicleArray(result.data),
      pagination: result.pagination,
    };
  }

  static async getInventoryStats(dealerId: string): Promise<InventoryStats> {
    const stats = await aggregate<any>(
      Vehicle as any,
      [
        { $match: { dealer: dealerId } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            published: { $sum: { $cond: [{ $eq: ['$status', 'PUBLISHED'] }, 1, 0] } },
            pendingReview: { $sum: { $cond: [{ $eq: ['$status', 'PENDING_REVIEW'] }, 1, 0] } },
            draft: { $sum: { $cond: [{ $eq: ['$status', 'DRAFT'] }, 1, 0] } },
            sold: { $sum: { $cond: [{ $eq: ['$status', 'SOLD'] }, 1, 0] } },
            archived: { $sum: { $cond: [{ $eq: ['$status', 'ARCHIVED'] }, 1, 0] } },
            verified: { $sum: { $cond: [{ $eq: ['$verified', 'VERIFIED'] }, 1, 0] } },
            unverified: { $sum: { $cond: [{ $ne: ['$verified', 'VERIFIED'] }, 1, 0] } },
            totalViews: { $sum: '$views' },
            totalEnquiries: { $sum: '$enquiryCount' },
            averagePrice: { $avg: '$price' },
          },
        },
      ]
    );

    const result = stats[0] as any;
    
    if (result) {
      return {
        total: result.total || 0,
        published: result.published || 0,
        pendingReview: result.pendingReview || 0,
        draft: result.draft || 0,
        sold: result.sold || 0,
        archived: result.archived || 0,
        verified: result.verified || 0,
        unverified: result.unverified || 0,
        totalViews: result.totalViews || 0,
        totalEnquiries: result.totalEnquiries || 0,
        averagePrice: result.averagePrice || 0,
      };
    }

    return {
      total: 0,
      published: 0,
      pendingReview: 0,
      draft: 0,
      sold: 0,
      archived: 0,
      verified: 0,
      unverified: 0,
      totalViews: 0,
      totalEnquiries: 0,
      averagePrice: 0,
    };
  }

  static async getVehicleById(vehicleId: string): Promise<IVehicle | null> {
    const vehicle = await findById<any>(Vehicle as any, vehicleId);
    return toIVehicle(vehicle);
  }

  static async createVehicle(data: Partial<IVehicle>): Promise<IVehicle> {
    const slug = `${data.make}-${data.model}-${data.year}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const existing = await findOne<any>(Vehicle as any, { slug });
    let finalSlug = slug;
    if (existing) {
      const random = Math.random().toString(36).substring(2, 6);
      finalSlug = `${slug}-${random}`;
    }

    const vehicle = await create<any>(Vehicle as any, {
      ...data,
      slug: finalSlug,
      views: 0,
      savedCount: 0,
      enquiryCount: 0,
      status: data.status || 'DRAFT',
      verified: data.verified || 'UNVERIFIED',
    });

    return toIVehicle(vehicle)!;
  }

  static async updateVehicle(
    vehicleId: string,
    data: Partial<IVehicle>
  ): Promise<IVehicle | null> {
    if (data.make || data.model || data.year) {
      const existing = await findById<any>(Vehicle as any, vehicleId);
      if (existing) {
        const make = data.make || existing.make;
        const model = data.model || existing.model;
        const year = data.year || existing.year;
        const slug = `${make}-${model}-${year}`
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');

        const duplicate = await findOne<any>(Vehicle as any, {
          slug,
          _id: { $ne: vehicleId },
        });
        if (!duplicate) {
          data.slug = slug;
        }
      }
    }

    const vehicle = await update<any>(
      Vehicle as any,
      { _id: vehicleId },
      data,
      { new: true, lean: true }
    );

    return toIVehicle(vehicle);
  }

  static async deleteVehicle(vehicleId: string): Promise<boolean> {
    const result = await deleteOne<any>(Vehicle as any, { _id: vehicleId });
    return !!result;
  }

  static async bulkUpdateStatus(
    vehicleIds: string[],
    status: VehicleStatus
  ): Promise<number> {
    const result = await update<any>(
      Vehicle as any,
      { _id: { $in: vehicleIds } },
      { status },
      { multi: true }
    );
    return result ? vehicleIds.length : 0;
  }

  static async bulkDelete(vehicleIds: string[]): Promise<number> {
    const result = await deleteMany(Vehicle as any, {
      _id: { $in: vehicleIds },
    });
    return result.deletedCount || 0;
  }

  static async getVehicleAnalytics(vehicleId: string): Promise<{
    views: number;
    enquiries: number;
    saves: number;
    conversionRate: number;
  }> {
    const vehicle = await findById<any>(Vehicle as any, vehicleId);
    if (!vehicle) {
      return { views: 0, enquiries: 0, saves: 0, conversionRate: 0 };
    }

    const views = vehicle.views || 0;
    const enquiries = vehicle.enquiryCount || 0;
    const saves = vehicle.savedCount || 0;
    const conversionRate = views > 0 ? (enquiries / views) * 100 : 0;

    return {
      views,
      enquiries,
      saves,
      conversionRate: Math.round(conversionRate * 100) / 100,
    };
  }

  static async getInventoryValue(dealerId: string): Promise<{
    totalValue: number;
    averageValue: number;
    highestValue: number;
    lowestValue: number;
  }> {
    const result = await aggregate<any>(
      Vehicle as any,
      [
        { $match: { dealer: dealerId, status: 'PUBLISHED' } },
        {
          $group: {
            _id: null,
            totalValue: { $sum: '$price' },
            averageValue: { $avg: '$price' },
            highestValue: { $max: '$price' },
            lowestValue: { $min: '$price' },
          },
        },
      ]
    );

    const stats = result[0] as any;
    
    if (stats) {
      return {
        totalValue: stats.totalValue || 0,
        averageValue: stats.averageValue || 0,
        highestValue: stats.highestValue || 0,
        lowestValue: stats.lowestValue || 0,
      };
    }

    return { totalValue: 0, averageValue: 0, highestValue: 0, lowestValue: 0 };
  }

  static async getMakeDistribution(dealerId: string): Promise<
    Array<{ make: string; count: number }>
  > {
    const result = await aggregate<any>(
      Vehicle as any,
      [
        { $match: { dealer: dealerId } },
        { $group: { _id: '$make', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]
    );

    return result.map((item: any) => ({
      make: item._id || 'Unknown',
      count: item.count || 0,
    }));
  }

  static async getStatusDistribution(dealerId: string): Promise<
    Array<{ status: string; count: number }>
  > {
    const result = await aggregate<any>(
      Vehicle as any,
      [
        { $match: { dealer: dealerId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]
    );

    return result.map((item: any) => ({
      status: item._id || 'UNKNOWN',
      count: item.count || 0,
    }));
  }
}

export default InventoryService;