/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/actions/collections.ts
'use server';

import { getServerSession } from 'next-auth';
import { authConfig } from '@/auth/config';
import { redirect } from 'next/navigation';
import { CollectionService, CreateCollectionData } from '@/services/collection.service';
import { revalidatePath } from 'next/cache';

// ─────────────────────────────────────────────────────────────
// GET COLLECTIONS
// ─────────────────────────────────────────────────────────────

/**
 * Get all published collections
 */
export async function getCollections(page: number = 1, limit: number = 12) {
  const session = await getServerSession(authConfig);

  if (!session?.user) {
    return { success: false, message: 'Unauthorized', data: [], pagination: null };
  }

  try {
    const result = await CollectionService.getCollections(page, limit);
    return {
      success: true,
      data: result.data,
      pagination: result.pagination,
    };
  } catch (error) {
    console.error('Error fetching collections:', error);
    return { success: false, message: 'Failed to fetch collections', data: [], pagination: null };
  }
}

/**
 * Get featured collections
 */
export async function getFeaturedCollections(limit: number = 6) {
  try {
    const collections = await CollectionService.getFeaturedCollections(limit);
    return { success: true, data: collections };
  } catch (error) {
    console.error('Error fetching featured collections:', error);
    return { success: false, message: 'Failed to fetch featured collections', data: [] };
  }
}

/**
 * Get collection by slug
 */
export async function getCollectionBySlug(slug: string) {
  try {
    const collection = await CollectionService.getCollectionBySlug(slug);
    if (!collection) {
      return { success: false, message: 'Collection not found', data: null };
    }
    return { success: true, data: collection };
  } catch (error) {
    console.error('Error fetching collection:', error);
    return { success: false, message: 'Failed to fetch collection', data: null };
  }
}

/**
 * Get collection by ID
 */
export async function getCollectionById(id: string) {
  const session = await getServerSession(authConfig);

  if (!session?.user) {
    return { success: false, message: 'Unauthorized', data: null };
  }

  try {
    const collection = await CollectionService.getCollectionById(id);
    if (!collection) {
      return { success: false, message: 'Collection not found', data: null };
    }
    return { success: true, data: collection };
  } catch (error) {
    console.error('Error fetching collection:', error);
    return { success: false, message: 'Failed to fetch collection', data: null };
  }
}

// ─────────────────────────────────────────────────────────────
// CREATE / UPDATE / DELETE
// ─────────────────────────────────────────────────────────────

/**
 * Create a new collection
 */
export async function createCollection(data: CreateCollectionData) {
  const session = await getServerSession(authConfig);

  if (!session?.user || session.user.role !== 'ADMIN') {
    return { success: false, message: 'Unauthorized' };
  }

  try {
    const collection = await CollectionService.createCollection(data, session.user.id!);
    revalidatePath('/admin/content');
    revalidatePath('/collections');
    return { success: true, data: collection, message: 'Collection created successfully' };
  } catch (error) {
    console.error('Error creating collection:', error);
    return { success: false, message: 'Failed to create collection' };
  }
}

/**
 * Update a collection
 */
export async function updateCollection(collectionId: string, data: Partial<CreateCollectionData>) {
  const session = await getServerSession(authConfig);

  if (!session?.user || session.user.role !== 'ADMIN') {
    return { success: false, message: 'Unauthorized' };
  }

  try {
    const collection = await CollectionService.updateCollection(collectionId, data);
    if (!collection) {
      return { success: false, message: 'Collection not found' };
    }
    revalidatePath('/admin/content');
    revalidatePath('/collections');
    revalidatePath(`/collections/${(collection as any).slug}`);
    return { success: true, data: collection, message: 'Collection updated successfully' };
  } catch (error) {
    console.error('Error updating collection:', error);
    return { success: false, message: 'Failed to update collection' };
  }
}

/**
 * Delete a collection
 */
export async function deleteCollection(collectionId: string) {
  const session = await getServerSession(authConfig);

  if (!session?.user || session.user.role !== 'ADMIN') {
    return { success: false, message: 'Unauthorized' };
  }

  try {
    const result = await CollectionService.deleteCollection(collectionId);
    if (!result) {
      return { success: false, message: 'Collection not found' };
    }
    revalidatePath('/admin/content');
    revalidatePath('/collections');
    return { success: true, message: 'Collection deleted successfully' };
  } catch (error) {
    console.error('Error deleting collection:', error);
    return { success: false, message: 'Failed to delete collection' };
  }
}

// ─────────────────────────────────────────────────────────────
// VEHICLE MANAGEMENT
// ─────────────────────────────────────────────────────────────

/**
 * Add vehicles to a collection
 */
export async function addVehiclesToCollection(collectionId: string, vehicleIds: string[]) {
  const session = await getServerSession(authConfig);

  if (!session?.user || session.user.role !== 'ADMIN') {
    return { success: false, message: 'Unauthorized' };
  }

  try {
    const collection = await CollectionService.addVehiclesToCollection(collectionId, vehicleIds);
    if (!collection) {
      return { success: false, message: 'Collection not found' };
    }
    revalidatePath('/admin/content');
    revalidatePath(`/collections/${(collection as any).slug}`);
    return { success: true, data: collection, message: 'Vehicles added to collection' };
  } catch (error) {
    console.error('Error adding vehicles to collection:', error);
    return { success: false, message: 'Failed to add vehicles to collection' };
  }
}

/**
 * Remove vehicles from a collection
 */
export async function removeVehiclesFromCollection(collectionId: string, vehicleIds: string[]) {
  const session = await getServerSession(authConfig);

  if (!session?.user || session.user.role !== 'ADMIN') {
    return { success: false, message: 'Unauthorized' };
  }

  try {
    const collection = await CollectionService.removeVehiclesFromCollection(collectionId, vehicleIds);
    if (!collection) {
      return { success: false, message: 'Collection not found' };
    }
    revalidatePath('/admin/content');
    revalidatePath(`/collections/${(collection as any).slug}`);
    return { success: true, data: collection, message: 'Vehicles removed from collection' };
  } catch (error) {
    console.error('Error removing vehicles from collection:', error);
    return { success: false, message: 'Failed to remove vehicles from collection' };
  }
}

// ─────────────────────────────────────────────────────────────
// STATISTICS
// ─────────────────────────────────────────────────────────────

/**
 * Get collection statistics
 */
export async function getCollectionStats() {
  const session = await getServerSession(authConfig);

  if (!session?.user || session.user.role !== 'ADMIN') {
    return { success: false, message: 'Unauthorized', data: null };
  }

  try {
    const stats = await CollectionService.getCollectionStats();
    return { success: true, data: stats };
  } catch (error) {
    console.error('Error fetching collection stats:', error);
    return { success: false, message: 'Failed to fetch collection stats', data: null };
  }
}

/**
 * Get vehicles in a collection
 */
export async function getCollectionVehicles(collectionId: string) {
  const session = await getServerSession(authConfig);

  if (!session?.user) {
    return { success: false, message: 'Unauthorized', data: [] };
  }

  try {
    const vehicles = await CollectionService.getCollectionVehicles(collectionId);
    return { success: true, data: vehicles };
  } catch (error) {
    console.error('Error fetching collection vehicles:', error);
    return { success: false, message: 'Failed to fetch collection vehicles', data: [] };
  }
}

/**
 * Toggle collection featured status
 */
export async function toggleCollectionFeatured(collectionId: string) {
  const session = await getServerSession(authConfig);

  if (!session?.user || session.user.role !== 'ADMIN') {
    return { success: false, message: 'Unauthorized' };
  }

  try {
    const collection = await CollectionService.toggleFeatured(collectionId);
    if (!collection) {
      return { success: false, message: 'Collection not found' };
    }
    revalidatePath('/admin/content');
    revalidatePath('/collections');
    revalidatePath(`/collections/${(collection as any).slug}`);
    return { 
      success: true, 
      data: collection, 
      message: `Collection ${(collection as any).featured ? 'featured' : 'unfeatured'}` 
    };
  } catch (error) {
    console.error('Error toggling collection featured:', error);
    return { success: false, message: 'Failed to toggle collection featured' };
  }
}

/**
 * Toggle collection published status
 */
export async function toggleCollectionPublished(collectionId: string) {
  const session = await getServerSession(authConfig);

  if (!session?.user || session.user.role !== 'ADMIN') {
    return { success: false, message: 'Unauthorized' };
  }

  try {
    const collection = await CollectionService.togglePublished(collectionId);
    if (!collection) {
      return { success: false, message: 'Collection not found' };
    }
    revalidatePath('/admin/content');
    revalidatePath('/collections');
    revalidatePath(`/collections/${(collection as any).slug}`);
    return { 
      success: true, 
      data: collection, 
      message: `Collection ${(collection as any).published ? 'published' : 'unpublished'}` 
    };
  } catch (error) {
    console.error('Error toggling collection published:', error);
    return { success: false, message: 'Failed to toggle collection published' };
  }
}

/**
 * Reorder collections
 */
export async function reorderCollections(collectionIds: string[]) {
  const session = await getServerSession(authConfig);

  if (!session?.user || session.user.role !== 'ADMIN') {
    return { success: false, message: 'Unauthorized' };
  }

  try {
    await CollectionService.reorderCollections(collectionIds);
    revalidatePath('/admin/content');
    revalidatePath('/collections');
    return { success: true, message: 'Collections reordered successfully' };
  } catch (error) {
    console.error('Error reordering collections:', error);
    return { success: false, message: 'Failed to reorder collections' };
  }
}

/**
 * Get collections by creator
 */
export async function getCollectionsByCreator(userId: string) {
  const session = await getServerSession(authConfig);

  if (!session?.user) {
    return { success: false, message: 'Unauthorized', data: [] };
  }

  try {
    const collections = await CollectionService.getCollectionsByCreator(userId);
    return { success: true, data: collections };
  } catch (error) {
    console.error('Error fetching collections by creator:', error);
    return { success: false, message: 'Failed to fetch collections', data: [] };
  }
}