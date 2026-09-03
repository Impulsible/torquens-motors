/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Collection } from '@/models/Collection';
import DatabaseService from './database';
import ShowroomService from './showroom.service';
import type { IVehicle } from '@/types';

export interface ICollectionData {
  id: string;
  name: string;
  slug: string;
  description: string;
  image?: string;
  bannerImage?: string;
  vehicleCount: number;
  vehicles: IVehicle[];
  vehicleIds?: string[];
  featured?: boolean;
  active?: boolean;
  order?: number;
  createdBy?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface CreateCollectionData {
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  bannerImage?: string;
  vehicleIds?: string[];
  featured?: boolean;
  active?: boolean;
  order?: number;
}

export interface CollectionPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

function slugify(value: string): string {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export class CollectionService {
  static getPublishedCollections(_arg0: number, arg1: number) {
    throw new Error('Method not implemented.');
  }
  static formatCollection(doc: any): ICollectionData {
    const rawVehicles = doc.vehicles || [];
    const formattedVehicles = Array.isArray(rawVehicles)
      ? rawVehicles.map((v: any) => (v?.toObject ? v.toObject() : v)).filter(Boolean)
      : [];

    const vehicleIds = Array.isArray(doc.vehicleIds)
      ? doc.vehicleIds.map((id: any) => String(id))
      : formattedVehicles.map((v: any) => String(v.id || v._id || v.slug || ''));

    return {
      id: doc._id?.toString?.() || doc.id || doc.slug,
      name: doc.name || 'Curated Collection',
      slug: doc.slug || slugify(doc.name || 'collection'),
      description: doc.description || 'A curated selection of verified luxury vehicles.',
      image: doc.image || doc.bannerImage || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70',
      bannerImage: doc.bannerImage || doc.image || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70',
      vehicleCount: formattedVehicles.length || vehicleIds.length || doc.vehicleCount || 0,
      vehicles: formattedVehicles,
      vehicleIds,
      featured: doc.featured ?? false,
      active: doc.active ?? true,
      order: doc.order ?? 0,
      createdBy: doc.createdBy?.toString?.() || doc.createdBy,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  static getAllFallbackCollections(): ICollectionData[] {
    const allVehicles = ShowroomService.getAllFallbackVehicles();

    const collections: ICollectionData[] = [
      {
        id: 'hypercars',
        name: 'Hypercar Royalty',
        slug: 'hypercars',
        description: 'Pinnacle mechanical engineering, limited production numbers, and extreme track performance.',
        image: 'https://images.unsplash.com/photo-1600706432502-75a0e286b92a',
        bannerImage: 'https://images.unsplash.com/photo-1600706432502-75a0e286b92a',
        featured: true,
        active: true,
        order: 1,
        vehicleCount: 0,
        vehicles: allVehicles.filter((v) =>
          ['Chiron Super Sport 300+', 'SF90 Stradale', 'Revuelto V12 HPEV', 'Jesko Attack', 'Valkyrie Cosworth V12', 'LaFerrari Aperta'].some(
            (m) => v.model.includes(m)
          )
        ),
      },
      {
        id: 'v12-legend',
        name: 'The V12 Atelier',
        slug: 'v12-legend',
        description: 'Naturally aspirated and twin-turbo twelve-cylinder masterpieces representing pure acoustic drama.',
        image: 'https://images.unsplash.com/photo-1631295868223-63265b40d9e4',
        bannerImage: 'https://images.unsplash.com/photo-1631295868223-63265b40d9e4',
        featured: true,
        active: true,
        order: 2,
        vehicleCount: 0,
        vehicles: allVehicles.filter(
          (v) =>
            (v.engine && v.engine.toLowerCase().includes('v12')) ||
            (v.engine && v.engine.toLowerCase().includes('w12'))
        ),
      },
      {
        id: 'executive-suvs',
        name: 'Executive SUV Vault',
        slug: 'executive-suvs',
        description: 'Commanding road presence, twin-turbo V8 torque, and tailored rear-seat lounge luxury.',
        image: 'https://images.unsplash.com/photo-1520031441872-265e4ff70366',
        bannerImage: 'https://images.unsplash.com/photo-1520031441872-265e4ff70366',
        featured: true,
        active: true,
        order: 3,
        vehicleCount: 0,
        vehicles: allVehicles.filter((v) => v.bodyType === 'SUV'),
      },
      {
        id: 'track-spec',
        name: 'Track-Spec Homologation',
        slug: 'track-spec',
        description: 'Motorsport-derived lightweight specials equipped with active carbon aerodynamics.',
        image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70',
        bannerImage: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70',
        featured: true,
        active: true,
        order: 4,
        vehicleCount: 0,
        vehicles: allVehicles.filter((v) =>
          ['911 GT3 RS', 'Huracán STO', 'M4 CSL Lightweight', 'AMG GT Black Series'].some(
            (m) => v.model.includes(m)
          )
        ),
      },
      {
        id: 'grand-tourers',
        name: 'Bespoke Grand Tourers',
        slug: 'grand-tourers',
        description: 'Coachbuilt coupes and convertibles tailored for effortless continent-crossing capability.',
        image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738',
        bannerImage: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738',
        featured: true,
        active: true,
        order: 5,
        vehicleCount: 0,
        vehicles: allVehicles.filter(
          (v) => v.bodyType === 'Coupe' || v.bodyType === 'Convertible'
        ),
      },
    ];

    return collections.map((c) => ({
      ...c,
      vehicleCount: c.vehicles.length,
      vehicleIds: c.vehicles.map((v) => String(v.id || v.slug)),
    }));
  }

  static async getAllCollections(): Promise<ICollectionData[]> {
    let dbCollections: any[] = [];

    try {
      dbCollections = await DatabaseService.findMany(
        Collection as any,
        { active: { $ne: false } },
        {},
        { sort: { order: 1, createdAt: -1 }, populate: 'vehicles' }
      );
    } catch (error) {
      console.error('Error querying DB collections:', error);
    }

    const fallbacks = this.getAllFallbackCollections();

    if (!dbCollections || dbCollections.length === 0) {
      return fallbacks;
    }

    const existingSlugs = new Set(dbCollections.map((c: any) => c.slug));
    const merged = dbCollections.map((c: any) => this.formatCollection(c));

    fallbacks.forEach((fb) => {
      if (!existingSlugs.has(fb.slug)) merged.push(fb);
    });

    return merged.sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  /** Paginated collections (alias used by actions) */
  static async getCollections(
    page: number = 1,
    limit: number = 12
  ): Promise<{ data: ICollectionData[]; pagination: CollectionPagination }> {
    const all = await this.getAllCollections();
    const safePage = Math.max(1, page);
    const safeLimit = Math.max(1, limit);
    const start = (safePage - 1) * safeLimit;
    const data = all.slice(start, start + safeLimit);
    const total = all.length;
    const totalPages = Math.max(1, Math.ceil(total / safeLimit));

    return {
      data,
      pagination: {
        total,
        page: safePage,
        limit: safeLimit,
        totalPages,
        hasNextPage: safePage < totalPages,
        hasPrevPage: safePage > 1,
      },
    };
  }

  static async getFeaturedCollections(limit: number = 6): Promise<ICollectionData[]> {
    const all = await this.getAllCollections();
    return all.filter((c) => c.featured).slice(0, limit);
  }

  static async getCollectionBySlug(slug: string): Promise<ICollectionData | null> {
    if (!slug) return null;
    const cleanSlug = String(slug).toLowerCase().trim();

    try {
      const dbCollection: any = await DatabaseService.findOne(
        Collection as any,
        { slug: cleanSlug, active: { $ne: false } },
        {},
        { populate: 'vehicles' }
      );
      if (dbCollection) return this.formatCollection(dbCollection);
    } catch (error) {
      console.error(`Error querying DB collection [${cleanSlug}]:`, error);
    }

    const fallbacks = this.getAllFallbackCollections();
    return (
      fallbacks.find(
        (c) => c.slug.toLowerCase() === cleanSlug || c.id.toLowerCase() === cleanSlug
      ) || null
    );
  }

  static async getCollectionById(id: string): Promise<ICollectionData | null> {
    if (!id) return null;
    const cleanId = String(id).trim();
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(cleanId);

    try {
      if (isObjectId) {
        const dbCollection: any = await DatabaseService.findById(
          Collection as any,
          cleanId,
          {},
          { populate: 'vehicles' }
        );
        if (dbCollection) return this.formatCollection(dbCollection);
      } else {
        const dbCollection: any = await DatabaseService.findOne(
          Collection as any,
          { $or: [{ id: cleanId }, { slug: cleanId }] },
          {},
          { populate: 'vehicles' }
        );
        if (dbCollection) return this.formatCollection(dbCollection);
      }
    } catch (error) {
      console.error(`Error querying collection by id [${cleanId}]:`, error);
    }

    const fallbacks = this.getAllFallbackCollections();
    return (
      fallbacks.find(
        (c) => c.id === cleanId || c.slug === cleanId
      ) || null
    );
  }

  static async createCollection(
    data: CreateCollectionData,
    createdBy?: string
  ): Promise<ICollectionData> {
    const slug = data.slug ? slugify(data.slug) : slugify(data.name);

    try {
      const created: any = await DatabaseService.create(Collection as any, {
        name: data.name,
        slug,
        description: data.description || '',
        image: data.image || '',
        bannerImage: data.bannerImage || data.image || '',
        vehicles: data.vehicleIds || [],
        vehicleIds: data.vehicleIds || [],
        featured: data.featured ?? false,
        active: data.active ?? true,
        order: data.order ?? 0,
        createdBy,
      });

      return this.formatCollection(created);
    } catch (error) {
      console.error('createCollection error:', error);
      // Soft fallback so admin UI does not hard-crash
      return {
        id: slug,
        name: data.name,
        slug,
        description: data.description || '',
        image: data.image,
        bannerImage: data.bannerImage || data.image,
        vehicleCount: data.vehicleIds?.length || 0,
        vehicles: [],
        vehicleIds: data.vehicleIds || [],
        featured: data.featured ?? false,
        active: data.active ?? true,
        order: data.order ?? 0,
        createdBy,
        createdAt: new Date(),
      };
    }
  }

  static async updateCollection(
    collectionId: string,
    data: Partial<CreateCollectionData>
  ): Promise<ICollectionData | null> {
    const existing = await this.getCollectionById(collectionId);
    if (!existing) return null;

    const isObjectId = /^[0-9a-fA-F]{24}$/.test(collectionId);
    const payload: any = { ...data, updatedAt: new Date() };
    if (data.slug) payload.slug = slugify(data.slug);
    if (data.name && !data.slug) payload.slug = slugify(data.name);
    if (data.vehicleIds) {
      payload.vehicles = data.vehicleIds;
      payload.vehicleIds = data.vehicleIds;
    }

    try {
      if (isObjectId) {
        const updated: any = await DatabaseService.update(
          Collection as any,
          { _id: collectionId },
          payload
        );
        if (updated) return this.formatCollection(updated);
      } else {
        const updated: any = await DatabaseService.update(
          Collection as any,
          { $or: [{ id: collectionId }, { slug: collectionId }] },
          payload
        );
        if (updated) return this.formatCollection(updated);
      }
    } catch (error) {
      console.error('updateCollection error:', error);
    }

    return {
      ...existing,
      ...payload,
      slug: payload.slug || existing.slug,
      vehicleCount: payload.vehicleIds?.length ?? existing.vehicleCount,
    };
  }

  static async deleteCollection(collectionId: string): Promise<boolean> {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(collectionId);

    try {
      if (isObjectId) {
        await DatabaseService.update(
          Collection as any,
          { _id: collectionId },
          { active: false, updatedAt: new Date() }
        );
      } else {
        await DatabaseService.update(
          Collection as any,
          { $or: [{ id: collectionId }, { slug: collectionId }] },
          { active: false, updatedAt: new Date() }
        );
      }
      return true;
    } catch (error) {
      console.error('deleteCollection error:', error);
      return false;
    }
  }

  static async addVehiclesToCollection(
    collectionId: string,
    vehicleIds: string[]
  ): Promise<ICollectionData | null> {
    const collection = await this.getCollectionById(collectionId);
    if (!collection) return null;

    const current = new Set([...(collection.vehicleIds || []), ...vehicleIds.map(String)]);
    return this.updateCollection(collectionId, { vehicleIds: Array.from(current) });
  }

  static async removeVehiclesFromCollection(
    collectionId: string,
    vehicleIds: string[]
  ): Promise<ICollectionData | null> {
    const collection = await this.getCollectionById(collectionId);
    if (!collection) return null;

    const removeSet = new Set(vehicleIds.map(String));
    const next = (collection.vehicleIds || []).filter((id) => !removeSet.has(String(id)));
    return this.updateCollection(collectionId, { vehicleIds: next });
  }

  static async getCollectionVehicles(collectionId: string): Promise<IVehicle[]> {
    const collection = await this.getCollectionById(collectionId);
    if (!collection) return [];
    if (collection.vehicles?.length) return collection.vehicles;

    // Resolve by IDs from showroom inventory when only IDs are stored
    const all = ShowroomService.getAllFallbackVehicles();
    const ids = new Set((collection.vehicleIds || []).map(String));
    return all.filter((v) => ids.has(String(v.id)) || ids.has(String(v.slug)));
  }

  static async getCollectionStats(): Promise<{
    total: number;
    featured: number;
    active: number;
    totalVehicles: number;
  }> {
    const all = await this.getAllCollections();
    return {
      total: all.length,
      featured: all.filter((c) => c.featured).length,
      active: all.filter((c) => c.active !== false).length,
      totalVehicles: all.reduce((sum, c) => sum + (c.vehicleCount || 0), 0),
    };
  }

  static async toggleFeatured(collectionId: string): Promise<ICollectionData | null> {
    const collection = await this.getCollectionById(collectionId);
    if (!collection) return null;
    return this.updateCollection(collectionId, { featured: !collection.featured });
  }

  static async reorderCollections(collectionIds: string[]): Promise<void> {
    await Promise.all(
      collectionIds.map(async (id, index) => {
        try {
          await this.updateCollection(id, { order: index + 1 });
        } catch (error) {
          console.error(`Failed to reorder collection ${id}:`, error);
        }
      })
    );
  }

  static async getCollectionsByCreator(userId: string): Promise<ICollectionData[]> {
    try {
      const docs = await DatabaseService.findMany(
        Collection as any,
        { createdBy: userId, active: { $ne: false } },
        {},
        { sort: { createdAt: -1 }, populate: 'vehicles' }
      );
      return (docs || []).map((d: any) => this.formatCollection(d));
    } catch (error) {
      console.error('getCollectionsByCreator error:', error);
      return [];
    }
  }
}

export default CollectionService;