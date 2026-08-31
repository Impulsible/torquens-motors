// src/services/cloudinary.service.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

// Import client-safe functions
import {
  getOptimizedUrl as clientGetOptimizedUrl,
  getThumbnailUrl as clientGetThumbnailUrl,
  getResponsiveUrls as clientGetResponsiveUrls,
  validateImage as clientValidateImage,
  fileToBase64 as clientFileToBase64,
} from './cloudinary.client';

// Re-export client-safe functions
export {
  clientGetOptimizedUrl as getOptimizedUrl,
  clientGetThumbnailUrl as getThumbnailUrl,
  clientGetResponsiveUrls as getResponsiveUrls,
  clientValidateImage as validateImage,
  clientFileToBase64 as fileToBase64,
};

// Re-export types from server file
export type {
  CloudinaryUploadResult,
  CloudinaryDeleteResult,
} from './cloudinary.server';

// Server-only functions with dynamic import
export async function uploadImage(file: File | string | Buffer, options?: any) {
  const { uploadImage: serverUpload } = await import('./cloudinary.server');
  return serverUpload(file, options);
}

export async function uploadMultipleImages(files: File[], options?: any) {
  const { uploadMultipleImages: serverUploadMultiple } = await import('./cloudinary.server');
  return serverUploadMultiple(files, options);
}

export async function deleteImage(publicId: string) {
  const { deleteImage: serverDelete } = await import('./cloudinary.server');
  return serverDelete(publicId);
}

export async function deleteMultipleImages(publicIds: string[]) {
  const { deleteMultipleImages: serverDeleteMultiple } = await import('./cloudinary.server');
  return serverDeleteMultiple(publicIds);
}

// ✅ Add named export for backward compatibility
export const CloudinaryService = {
  // Client-safe
  getOptimizedUrl: clientGetOptimizedUrl,
  getThumbnailUrl: clientGetThumbnailUrl,
  getResponsiveUrls: clientGetResponsiveUrls,
  validateImage: clientValidateImage,
  fileToBase64: clientFileToBase64,
  // Server-only (async)
  uploadImage,
  uploadMultipleImages,
  deleteImage,
  deleteMultipleImages,
};

// Default export for convenience
export default CloudinaryService;