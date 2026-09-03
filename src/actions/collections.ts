/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { getServerSession } from 'next-auth';
import { authConfig } from '@/auth/config';
import {
  CollectionService,
  type CreateCollectionData,
} from '@/services/collection.service';
import { revalidatePath } from 'next/cache';

export interface ActionResponse<T = undefined> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: unknown;
}

function isAdmin(session: any): boolean {
  const role = String(session?.user?.role || '').toUpperCase();
  return role === 'ADMIN';
}

export async function getCollections(
  page: number = 1,
  limit: number = 12
): Promise<ActionResponse<unknown[]>> {
  try {
    const result = await CollectionService.getCollections(page, limit);
    return {
      success: true,
      message: 'Collections successfully retrieved.',
      data: JSON.parse(JSON.stringify(result.data)),
      pagination: result.pagination,
    };
  } catch (error) {
    console.error('[CollectionsAction] getCollections error:', error);
    return { success: false, message: 'Failed to fetch collections.', data: [], pagination: null };
  }
}

export async function getFeaturedCollections(
  limit: number = 6
): Promise<ActionResponse<unknown[]>> {
  try {
    const collections = await CollectionService.getFeaturedCollections(limit);
    return {
      success: true,
      message: 'Featured collections loaded.',
      data: JSON.parse(JSON.stringify(collections)),
    };
  } catch (error) {
    console.error('[CollectionsAction] getFeaturedCollections error:', error);
    return { success: false, message: 'Failed to fetch featured collections.', data: [] };
  }
}

export async function getCollectionBySlug(
  slug: string
): Promise<ActionResponse<unknown | null>> {
  try {
    const collection = await CollectionService.getCollectionBySlug(slug);
    if (!collection) {
      return { success: false, message: 'Collection portfolio not found.', data: null };
    }
    return {
      success: true,
      message: 'Collection retrieved successfully.',
      data: JSON.parse(JSON.stringify(collection)),
    };
  } catch (error) {
    console.error('[CollectionsAction] getCollectionBySlug error:', error);
    return { success: false, message: 'Failed to retrieve collection.', data: null };
  }
}

export async function getCollectionById(
  id: string
): Promise<ActionResponse<unknown | null>> {
  try {
    const collection = await CollectionService.getCollectionById(id);
    if (!collection) {
      return { success: false, message: 'Collection portfolio not found.', data: null };
    }
    return {
      success: true,
      message: 'Collection retrieved successfully.',
      data: JSON.parse(JSON.stringify(collection)),
    };
  } catch (error) {
    console.error('[CollectionsAction] getCollectionById error:', error);
    return { success: false, message: 'Failed to retrieve collection.', data: null };
  }
}

export async function createCollection(
  data: CreateCollectionData
): Promise<ActionResponse<unknown>> {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user || !isAdmin(session)) {
      return { success: false, message: 'Unauthorized permission level.' };
    }

    const collection = await CollectionService.createCollection(
      data,
      (session.user as any).id
    );
    revalidatePath('/admin/content');
    revalidatePath('/collections');
    return {
      success: true,
      message: 'Collection successfully registered.',
      data: JSON.parse(JSON.stringify(collection)),
    };
  } catch (error) {
    console.error('[CollectionsAction] createCollection error:', error);
    return { success: false, message: 'Failed to create collection.' };
  }
}

export async function updateCollection(
  collectionId: string,
  data: Partial<CreateCollectionData>
): Promise<ActionResponse<unknown>> {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user || !isAdmin(session)) {
      return { success: false, message: 'Unauthorized permission level.' };
    }

    const collection = await CollectionService.updateCollection(collectionId, data);
    if (!collection) {
      return { success: false, message: 'Collection not found.' };
    }

    revalidatePath('/admin/content');
    revalidatePath('/collections');
    if (collection.slug) revalidatePath(`/collections/${collection.slug}`);

    return {
      success: true,
      message: 'Collection details updated successfully.',
      data: JSON.parse(JSON.stringify(collection)),
    };
  } catch (error) {
    console.error('[CollectionsAction] updateCollection error:', error);
    return { success: false, message: 'Failed to update collection.' };
  }
}

export async function deleteCollection(collectionId: string): Promise<ActionResponse> {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user || !isAdmin(session)) {
      return { success: false, message: 'Unauthorized permission level.' };
    }

    const result = await CollectionService.deleteCollection(collectionId);
    if (!result) {
      return { success: false, message: 'Collection portfolio not found.' };
    }

    revalidatePath('/admin/content');
    revalidatePath('/collections');
    return { success: true, message: 'Collection portfolio permanently archived.' };
  } catch (error) {
    console.error('[CollectionsAction] deleteCollection error:', error);
    return { success: false, message: 'Failed to archive collection.' };
  }
}

export async function addVehiclesToCollection(
  collectionId: string,
  vehicleIds: string[]
): Promise<ActionResponse<unknown>> {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user || !isAdmin(session)) {
      return { success: false, message: 'Unauthorized permission level.' };
    }

    const collection = await CollectionService.addVehiclesToCollection(
      collectionId,
      vehicleIds
    );
    if (!collection) {
      return { success: false, message: 'Collection portfolio not found.' };
    }

    revalidatePath('/admin/content');
    if (collection.slug) revalidatePath(`/collections/${collection.slug}`);

    return {
      success: true,
      message: 'Vehicles successfully added to collection.',
      data: JSON.parse(JSON.stringify(collection)),
    };
  } catch (error) {
    console.error('[CollectionsAction] addVehiclesToCollection error:', error);
    return { success: false, message: 'Failed to update collection fleet.' };
  }
}

export async function removeVehiclesFromCollection(
  collectionId: string,
  vehicleIds: string[]
): Promise<ActionResponse<unknown>> {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user || !isAdmin(session)) {
      return { success: false, message: 'Unauthorized permission level.' };
    }

    const collection = await CollectionService.removeVehiclesFromCollection(
      collectionId,
      vehicleIds
    );
    if (!collection) {
      return { success: false, message: 'Collection portfolio not found.' };
    }

    revalidatePath('/admin/content');
    if (collection.slug) revalidatePath(`/collections/${collection.slug}`);

    return {
      success: true,
      message: 'Vehicles successfully removed from collection.',
      data: JSON.parse(JSON.stringify(collection)),
    };
  } catch (error) {
    console.error('[CollectionsAction] removeVehiclesFromCollection error:', error);
    return { success: false, message: 'Failed to update collection fleet.' };
  }
}

export async function getCollectionStats(): Promise<ActionResponse<unknown>> {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user || !isAdmin(session)) {
      return { success: false, message: 'Unauthorized permission level.', data: null };
    }

    const stats = await CollectionService.getCollectionStats();
    return {
      success: true,
      message: 'Statistics loaded.',
      data: JSON.parse(JSON.stringify(stats)),
    };
  } catch (error) {
    console.error('[CollectionsAction] getCollectionStats error:', error);
    return { success: false, message: 'Failed to fetch collection stats.', data: null };
  }
}

export async function getCollectionVehicles(
  collectionId: string
): Promise<ActionResponse<unknown[]>> {
  try {
    const vehicles = await CollectionService.getCollectionVehicles(collectionId);
    return {
      success: true,
      message: 'Collection vehicles retrieved.',
      data: JSON.parse(JSON.stringify(vehicles)),
    };
  } catch (error) {
    console.error('[CollectionsAction] getCollectionVehicles error:', error);
    return { success: false, message: 'Failed to fetch collection vehicles.', data: [] };
  }
}

export async function toggleCollectionFeatured(
  collectionId: string
): Promise<ActionResponse<unknown>> {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user || !isAdmin(session)) {
      return { success: false, message: 'Unauthorized permission level.' };
    }

    const collection = await CollectionService.toggleFeatured(collectionId);
    if (!collection) {
      return { success: false, message: 'Collection not found.' };
    }

    revalidatePath('/admin/content');
    revalidatePath('/collections');
    if (collection.slug) revalidatePath(`/collections/${collection.slug}`);

    return {
      success: true,
      message: 'Featured status toggled.',
      data: JSON.parse(JSON.stringify(collection)),
    };
  } catch (error) {
    console.error('[CollectionsAction] toggleCollectionFeatured error:', error);
    return { success: false, message: 'Failed to update collection status.' };
  }
}

export async function reorderCollections(
  collectionIds: string[]
): Promise<ActionResponse> {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user || !isAdmin(session)) {
      return { success: false, message: 'Unauthorized permission level.' };
    }

    await CollectionService.reorderCollections(collectionIds);
    revalidatePath('/admin/content');
    revalidatePath('/collections');
    return { success: true, message: 'Collections reordered successfully.' };
  } catch (error) {
    console.error('[CollectionsAction] reorderCollections error:', error);
    return { success: false, message: 'Failed to reorder collections.' };
  }
}

export async function getCollectionsByCreator(
  userId: string
): Promise<ActionResponse<unknown[]>> {
  try {
    const collections = await CollectionService.getCollectionsByCreator(userId);
    return {
      success: true,
      message: 'Collections loaded.',
      data: JSON.parse(JSON.stringify(collections)),
    };
  } catch (error) {
    console.error('[CollectionsAction] getCollectionsByCreator error:', error);
    return { success: false, message: 'Failed to fetch collections.', data: [] };
  }
}