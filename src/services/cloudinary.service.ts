/* eslint-disable @typescript-eslint/no-explicit-any */
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

export class CloudinaryService {
  /**
   * Upload a single image to Cloudinary
   */
  static async uploadImage(
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
    try {
      // If file is a string (base64 or URL), use it directly
      let uploadSource: any = file;
      
      // If file is a File object, convert to base64
      if (file instanceof File) {
        uploadSource = await this.fileToBase64(file);
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
          }
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
      throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Upload multiple images to Cloudinary
   */
  static async uploadMultipleImages(
    files: File[],
    options: {
      folder?: string;
      tags?: string[];
      width?: number;
      height?: number;
    } = {}
  ): Promise<CloudinaryUploadResult[]> {
    const uploadPromises = files.map(file => 
      this.uploadImage(file, options)
    );
    
    return Promise.all(uploadPromises);
  }

  /**
   * Delete an image from Cloudinary
   */
  static async deleteImage(publicId: string): Promise<CloudinaryDeleteResult> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return { result: result.result as 'ok' | 'not found' };
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      throw new Error(`Failed to delete image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete multiple images from Cloudinary
   */
  static async deleteMultipleImages(publicIds: string[]): Promise<CloudinaryDeleteResult[]> {
    const deletePromises = publicIds.map(id => this.deleteImage(id));
    return Promise.all(deletePromises);
  }

  /**
   * Get optimized image URL with transformations
   */
  static getOptimizedUrl(
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
    const transformations: any[] = [
      { quality: options.quality || 'auto:good' },
      { fetch_format: options.format || 'auto' },
    ];

    if (options.width || options.height) {
      transformations.push({
        width: options.width || 'auto',
        height: options.height || 'auto',
        crop: options.crop || 'fill',
      });
    }

    if (options.effects) {
      transformations.push(...options.effects);
    }

    return cloudinary.url(publicId, {
      transformation: transformations,
      secure: true,
    });
  }

  /**
   * Get thumbnail URL
   */
  static getThumbnailUrl(publicId: string, size: number = 200): string {
    return this.getOptimizedUrl(publicId, {
      width: size,
      height: size,
      crop: 'thumb',
      quality: 'auto:good',
    });
  }

  /**
   * Get responsive image URLs for different screen sizes
   */
  static getResponsiveUrls(publicId: string): {
    thumbnail: string;
    small: string;
    medium: string;
    large: string;
    original: string;
  } {
    return {
      thumbnail: this.getOptimizedUrl(publicId, { width: 200, height: 200, crop: 'thumb' }),
      small: this.getOptimizedUrl(publicId, { width: 400, height: 300 }),
      medium: this.getOptimizedUrl(publicId, { width: 800, height: 600 }),
      large: this.getOptimizedUrl(publicId, { width: 1200, height: 900 }),
      original: this.getOptimizedUrl(publicId, {}),
    };
  }

  /**
   * Convert File to base64 string
   */
  static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  }

  /**
   * Validate image file
   */
  static validateImage(file: File): { valid: boolean; error?: string } {
    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 10MB' };
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'File type not supported. Please upload JPEG, PNG, WEBP, GIF, or SVG' };
    }

    return { valid: true };
  }
}