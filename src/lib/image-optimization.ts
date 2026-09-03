import { CloudinaryService } from '@/services/cloudinary.service';

export interface ImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'auto' | 'webp' | 'avif' | 'jpeg' | 'png';
  crop?: 'fill' | 'fit' | 'thumb' | 'scale';
  loading?: 'lazy' | 'eager';
  priority?: boolean;
}

export const defaultImageOptions: ImageOptions = {
  quality: 80,
  format: 'auto',
  crop: 'fill',
  loading: 'lazy',
};

/**
 * Get optimized image URL with transformations
 */
export function getOptimizedImageUrl(
  url: string,
  options: ImageOptions = {}
): string {
  // If it's a Cloudinary URL, use Cloudinary transformations
  if (url.includes('cloudinary.com')) {
    const publicId = extractPublicId(url);
    if (publicId) {
      return CloudinaryService.getOptimizedUrl(publicId, {
        width: options.width || 800,
        height: options.height || 600,
        crop: options.crop || 'fill',
        quality: options.quality ? `${options.quality}` : 'auto:good',
        format: options.format || 'auto',
      });
    }
  }

  // If it's an Unsplash URL, use Unsplash parameters
  if (url.includes('unsplash.com')) {
    const baseUrl = url.split('?')[0];
    const params = new URLSearchParams();
    if (options.width) params.set('w', options.width.toString());
    if (options.height) params.set('h', options.height.toString());
    if (options.quality) params.set('q', options.quality.toString());
    params.set('fit', options.crop || 'crop');
    params.set('auto', 'format');
    return `${baseUrl}?${params.toString()}`;
  }

  // Return original URL for other sources
  return url;
}

/**
 * Extract public ID from Cloudinary URL
 */
function extractPublicId(url: string): string | null {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)\.(jpg|jpeg|png|gif|webp|avif)/);
  return match ? match[1] : null;
}

/**
 * Get responsive image srcset
 */
export function getResponsiveSrcSet(
  url: string,
  sizes: number[] = [300, 600, 900, 1200, 1800]
): string {
  if (url.includes('cloudinary.com')) {
    const publicId = extractPublicId(url);
    if (publicId) {
      return sizes
        .map((size) => {
          // ✅ Fix: Convert quality to string
          const optimized = CloudinaryService.getOptimizedUrl(publicId, {
            width: size,
            quality: '80', // ✅ Changed from 80 to '80'
          });
          return `${optimized} ${size}w`;
        })
        .join(', ');
    }
  }

  if (url.includes('unsplash.com')) {
    const baseUrl = url.split('?')[0];
    return sizes
      .map((size) => {
        return `${baseUrl}?w=${size}&fit=crop&auto=format ${size}w`;
      })
      .join(', ');
  }

  return '';
}

/**
 * Get image dimensions for different breakpoints
 */
export const breakpoints = {
  mobile: 375,
  tablet: 768,
  laptop: 1024,
  desktop: 1440,
  wide: 1920,
};

/**
 * Get sizes attribute for responsive images
 */
export function getSizesAttribute(
  mobileSize: string = '100vw',
  tabletSize: string = '50vw',
  laptopSize: string = '33vw',
  desktopSize: string = '25vw'
): string {
  return `(max-width: 768px) ${mobileSize}, (max-width: 1024px) ${tabletSize}, (max-width: 1440px) ${laptopSize}, ${desktopSize}`;
}