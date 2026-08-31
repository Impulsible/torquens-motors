/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Collection } from '@/models/Collection';
import { Vehicle } from '@/models/Vehicle';
import { 
  findOne,
  findById,
  findMany,
  paginate,
  create,
  update,
  deleteOne,
  aggregate,
} from './database';
import type { ICollectionDocument } from '@/models/Collection';
import type { IVehicle } from '@/types';

export interface CreateCollectionData {
  name: string;
  description: string;
  image?: string;
  bannerImage?: string;
  vehicles?: string[];
  featured?: boolean;
  published?: boolean;
  order?: number;
  metadata?: {
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string[];
    backgroundColor?: string;
  };
}

export class CollectionService {
  static getPublishedCollections() {
    throw new Error('Method not implemented.');
  }
  /**
   * Get all published collections
   */
  static async getCollections(page: number = 1, limit: number = 12) {
    // ✅ Use type assertion for Collection model
    const result = await paginate<any>(
      Collection as any,
      { published: true },
      { page, limit, sort: { order: 1, createdAt: -1 } }
    );

    // Populate vehicles
    const populated = await Promise.all(
      result.data.map(async (collection: any) => {
        return await findById<any>(Collection as any, collection._id);
      })
    );

    return {
      data: populated,
      pagination: result.pagination,
    };
  }

  /**
   * Get featured collections
   */
  static async getFeaturedCollections(limit: number = 6) {
    // ✅ Fix: Use undefined instead of null for projection
    const collections = await findMany<any>(
      Collection as any,
      { featured: true, published: true },
      undefined,
      { lean: true, sort: { order: 1 }, limit }
    );

    // Populate vehicles
    const populated = await Promise.all(
      collections.map(async (collection: any) => {
        return await findById<any>(Collection as any, collection._id);
      })
    );

    return populated;
  }

  /**
   * Get collection by slug
   */
  static async getCollectionBySlug(slug: string): Promise<ICollectionDocument | null> {
    const collection = await findOne<any>(Collection as any, { slug, published: true });
    if (!collection) return null;

    return await findById<any>(Collection as any, collection._id);
  }

  /**
   * Get collection by ID
   */
  static async getCollectionById(id: string): Promise<ICollectionDocument | null> {
    const collection = await findById<any>(Collection as any, id);
    if (!collection) return null;

    return await findById<any>(Collection as any, collection._id);
  }

  /**
   * Create a new collection
   */
  static async createCollection(data: CreateCollectionData, userId: string): Promise<ICollectionDocument> {
    // Generate slug
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Check for duplicate slug
    const existing = await findOne<any>(Collection as any, { slug });
    let finalSlug = slug;
    if (existing) {
      const random = Math.random().toString(36).substring(2, 6);
      finalSlug = `${slug}-${random}`;
    }

    const collection = await create<any>(Collection as any, {
      ...data,
      slug: finalSlug,
      createdBy: userId,
      order: data.order || 0,
    });

    return await findById<any>(Collection as any, collection._id);
  }

  /**
   * Update a collection
   */
  static async updateCollection(
    collectionId: string,
    data: Partial<CreateCollectionData>
  ): Promise<ICollectionDocument | null> {
    // If name changed, update slug
    if (data.name) {
      const slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      // Check for duplicate slug
      const duplicate = await findOne<any>(Collection as any, {
        slug,
        _id: { $ne: collectionId },
      });
      if (!duplicate) {
        data.metadata = {
          ...(data.metadata || {}),
        };
      }
    }

    const collection = await update<any>(
      Collection as any,
      { _id: collectionId },
      data,
      { new: true, lean: true }
    );

    if (collection) {
      return await findById<any>(Collection as any, collection._id);
    }

    return null;
  }

  /**
   * Delete a collection
   */
  static async deleteCollection(collectionId: string): Promise<boolean> {
    const result = await deleteOne(Collection as any, { _id: collectionId });
    return !!result;
  }

  /**
   * Add vehicles to collection
   */
  static async addVehiclesToCollection(
    collectionId: string,
    vehicleIds: string[]
  ): Promise<ICollectionDocument | null> {
    const collection = await findById<any>(Collection as any, collectionId);
    if (!collection) return null;

    const existingVehicles = collection.vehicles.map((id: any) => id.toString());
    const newVehicles = vehicleIds.filter(id => !existingVehicles.includes(id));

    const updated = await update<any>(
      Collection as any,
      { _id: collectionId },
      { $push: { vehicles: { $each: newVehicles } } },
      { new: true, lean: true }
    );

    if (updated) {
      return await findById<any>(Collection as any, updated._id);
    }

    return null;
  }

  /**
   * Remove vehicles from collection
   */
  static async removeVehiclesFromCollection(
    collectionId: string,
    vehicleIds: string[]
  ): Promise<ICollectionDocument | null> {
    const updated = await update<any>(
      Collection as any,
      { _id: collectionId },
      { $pull: { vehicles: { $in: vehicleIds } } },
      { new: true, lean: true }
    );

    if (updated) {
      return await findById<any>(Collection as any, updated._id);
    }

    return null;
  }

  /**
   * Get collection statistics
   */
  static async getCollectionStats(): Promise<{
    total: number;
    published: number;
    featured: number;
  }> {
    const [total, published, featured] = await Promise.all([
      (Collection as any).countDocuments(),
      (Collection as any).countDocuments({ published: true }),
      (Collection as any).countDocuments({ featured: true }),
    ]);

    return { total, published, featured };
  }

  /**
   * Get vehicles for a collection
   */
  static async getCollectionVehicles(collectionId: string): Promise<IVehicle[]> {
    const collection = await findById<any>(Collection as any, collectionId);
    if (!collection) return [];

    // ✅ Fix: Use undefined instead of null for projection
    const vehicles = await findMany<any>(
      Vehicle as any,
      { _id: { $in: collection.vehicles }, status: 'PUBLISHED' },
      undefined,
      { lean: true }
    );

    return vehicles as unknown as IVehicle[];
  }

  /**
   * Get collection by slug with full vehicle data
   */
  static async getCollectionBySlugWithVehicles(slug: string): Promise<any> {
    const collection = await findOne<any>(Collection as any, { slug, published: true });
    if (!collection) return null;

    // Get all vehicles in the collection
    const vehicles = await findMany<any>(
      Vehicle as any,
      { _id: { $in: collection.vehicles }, status: 'PUBLISHED' },
      undefined,
      { lean: true }
    );

    return {
      ...collection,
      vehicles,
    };
  }

  /**
   * Toggle collection featured status
   */
  static async toggleFeatured(collectionId: string): Promise<ICollectionDocument | null> {
    const collection = await findById<any>(Collection as any, collectionId);
    if (!collection) return null;

    const updated = await update<any>(
      Collection as any,
      { _id: collectionId },
      { featured: !collection.featured },
      { new: true, lean: true }
    );

    return updated;
  }

  /**
   * Toggle collection published status
   */
  static async togglePublished(collectionId: string): Promise<ICollectionDocument | null> {
    const collection = await findById<any>(Collection as any, collectionId);
    if (!collection) return null;

    const updated = await update<any>(
      Collection as any,
      { _id: collectionId },
      { published: !collection.published },
      { new: true, lean: true }
    );

    return updated;
  }

  /**
   * Reorder collections
   */
  static async reorderCollections(collectionIds: string[]): Promise<void> {
    for (let i = 0; i < collectionIds.length; i++) {
      await update<any>(
        Collection as any,
        { _id: collectionIds[i] },
        { order: i + 1 }
      );
    }
  }

  /**
   * Get collection count for a user
   */
  static async getUserCollectionCount(userId: string): Promise<number> {
    return (Collection as any).countDocuments({ createdBy: userId });
  }

  /**
   * Get collections by creator
   */
  static async getCollectionsByCreator(userId: string): Promise<ICollectionDocument[]> {
    const collections = await findMany<any>(
      Collection as any,
      { createdBy: userId },
      undefined,
      { lean: true, sort: { createdAt: -1 } }
    );
    return collections;
  }
}

export default CollectionService;