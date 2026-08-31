// src/services/cloudinary.server.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { v2 as cloudinary } from 'cloudinary';

// Only run this on the server
if (typeof window === 'undefined') {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  created_at: string;
}

export interface CloudinaryDeleteResult {
  result: 'ok' | 'not found';
}

/**
 * Upload a single image to Cloudinary (Server only)
 */
export async function uploadImage(
  file: File | string | Buffer,
  options: {
    folder?: string;
    public_id?: string;
    tags?: string[];
    transformation?: any;
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
  } = {}
): Promise<CloudinaryUploadResult> {
  // Ensure this only runs on the server
  if (typeof window !== 'undefined') {
    throw new Error('uploadImage can only be called on the server');
  }

  try {
    let uploadSource: any = file;

    // If file is a File object, convert to buffer
    if (file instanceof File) {
      const bytes = await file.arrayBuffer();
      uploadSource = Buffer.from(bytes);
    }

    const result = await cloudinary.uploader.upload(uploadSource, {
      folder: options.folder || 'torquens/vehicles',
      public_id: options.public_id,
      tags: options.tags || ['vehicle'],
      transformation: options.transformation || [
        {
          width: options.width || 1200,
          height: options.height || 800,
          crop: options.crop || 'fill',
          quality: options.quality || 'auto:good',
          fetch_format: 'auto',
        },
      ],
    });

    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
      created_at: result.created_at,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error(
      `Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Upload multiple images to Cloudinary (Server only)
 */
export async function uploadMultipleImages(
  files: File[],
  options: {
    folder?: string;
    tags?: string[];
    width?: number;
    height?: number;
  } = {}
): Promise<CloudinaryUploadResult[]> {
  if (typeof window !== 'undefined') {
    throw new Error('uploadMultipleImages can only be called on the server');
  }

  const uploadPromises = files.map((file) => uploadImage(file, options));
  return Promise.all(uploadPromises);
}

/**
 * Delete an image from Cloudinary (Server only)
 */
export async function deleteImage(publicId: string): Promise<CloudinaryDeleteResult> {
  if (typeof window !== 'undefined') {
    throw new Error('deleteImage can only be called on the server');
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return { result: result.result as 'ok' | 'not found' };
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error(
      `Failed to delete image: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Delete multiple images from Cloudinary (Server only)
 */
export async function deleteMultipleImages(publicIds: string[]): Promise<CloudinaryDeleteResult[]> {
  if (typeof window !== 'undefined') {
    throw new Error('deleteMultipleImages can only be called on the server');
  }

  const deletePromises = publicIds.map((id) => deleteImage(id));
  return Promise.all(deletePromises);
}