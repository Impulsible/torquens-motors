// src/services/cloudinary.client.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';

/**
 * Get optimized image URL with transformations (Client-safe)
 */
export function getOptimizedUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
    format?: string;
    effects?: any[];
  } = {}
): string {
  if (!CLOUDINARY_CLOUD_NAME) {
    console.warn('Cloudinary cloud name not configured');
    return publicId;
  }

  const {
    width,
    height,
    crop = 'fill',
    quality = 'auto:good',
    format = 'auto',
    effects = [],
  } = options;

  // Build transformation string
  const transformations: string[] = [];

  // Add effects
  if (effects.length > 0) {
    effects.forEach((effect) => {
      const entries = Object.entries(effect);
      entries.forEach(([key, value]) => {
        transformations.push(`${key}_${value}`);
      });
    });
  }

  // Add dimensions
  if (width || height) {
    const dims = [];
    if (width) dims.push(`w_${width}`);
    if (height) dims.push(`h_${height}`);
    dims.push(`c_${crop}`);
    transformations.push(dims.join(','));
  }

  // Add quality and format
  transformations.push(`q_${quality}`);
  transformations.push(`f_${format}`);

  const transformString = transformations.join(',');

  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transformString}/${publicId}`;
}

/**
 * Get thumbnail URL (Client-safe)
 */
export function getThumbnailUrl(publicId: string, size: number = 200): string {
  return getOptimizedUrl(publicId, {
    width: size,
    height: size,
    crop: 'thumb',
    quality: 'auto:good',
  });
}

/**
 * Get responsive image URLs for different screen sizes (Client-safe)
 */
export function getResponsiveUrls(publicId: string): {
  thumbnail: string;
  small: string;
  medium: string;
  large: string;
  original: string;
} {
  return {
    thumbnail: getThumbnailUrl(publicId, 200),
    small: getOptimizedUrl(publicId, { width: 400, height: 300 }),
    medium: getOptimizedUrl(publicId, { width: 800, height: 600 }),
    large: getOptimizedUrl(publicId, { width: 1200, height: 900 }),
    original: getOptimizedUrl(publicId, {}),
  };
}

/**
 * Validate image file (Client-safe)
 */
export function validateImage(file: File): { valid: boolean; error?: string } {
  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 10MB' };
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'File type not supported. Please upload JPEG, PNG, WEBP, GIF, or SVG',
    };
  }

  return { valid: true };
}

/**
 * Convert File to base64 string (Client-safe)
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}