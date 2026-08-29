import {
  v2 as cloudinary,
  type UploadApiOptions,
  type UploadApiResponse,
  type TransformationOptions,
  type DeleteApiResponse,
} from "cloudinary";

/* -------------------------------------------------------------------------- */
/*                                CONFIGURATION                               */
/* -------------------------------------------------------------------------- */

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/* -------------------------------------------------------------------------- */
/*                              TYPES & PRESETS                               */
/* -------------------------------------------------------------------------- */

export type AutomotiveImagePreset =
  | "hero" // 16:10 Cinema 4K/2K Master
  | "card" // 16:10 Inventory Card Showcase
  | "thumbnail" // 4:3 Spec / Gallery Thumb
  | "avatar" // VIP User Profile Face Crop
  | "raw"; // Unaltered Original

export interface CustomUploadOptions {
  folder?: string;
  tags?: string[];
  public_id?: string;
  preset?: AutomotiveImagePreset;
  transformation?: TransformationOptions | TransformationOptions[];
  generateBlur?: boolean;
}

export interface UploadResult extends UploadApiResponse {
  blurDataURL?: string;
}

/* Presets tailored for luxury vehicle photography */
const PRESET_TRANSFORMATIONS: Record<
  AutomotiveImagePreset,
  TransformationOptions[]
> = {
  hero: [
    { width: 2560, height: 1600, crop: "limit" },
    { quality: "auto:best", fetch_format: "auto" },
    { effect: "sharpen:60" },
  ],
  card: [
    { width: 1200, height: 750, crop: "fill", gravity: "auto" },
    { quality: "auto:good", fetch_format: "auto" },
  ],
  thumbnail: [
    { width: 600, height: 450, crop: "fill", gravity: "center" },
    { quality: "auto:good", fetch_format: "auto" },
  ],
  avatar: [
    { width: 400, height: 400, crop: "thumb", gravity: "face" },
    { quality: "auto:good", fetch_format: "auto" },
  ],
  raw: [{ quality: "auto:good", fetch_format: "auto" }],
};

/* -------------------------------------------------------------------------- */
/*                            CLOUDINARY SERVICE                              */
/* -------------------------------------------------------------------------- */

export class CloudinaryService {
  private static readonly DEFAULT_FOLDER = "torquens/vehicles";

  /**
   * Uploads an image from a file path, Remote URL, Base64 Data URI, or Node Buffer.
   * Handles Stream conversion automatically for Next.js Server Actions / App Router.
   */
  static async uploadImage(
    file: string | Buffer,
    options: CustomUploadOptions = {},
  ): Promise<UploadResult> {
    const {
      folder = this.DEFAULT_FOLDER,
      tags = ["torquens-motors"],
      public_id,
      preset = "card",
      transformation,
      generateBlur = true,
    } = options;

    // Resolve transformations
    const finalTransformation =
      transformation || PRESET_TRANSFORMATIONS[preset];

    const uploadOptions: UploadApiOptions = {
      folder,
      tags,
      public_id,
      overwrite: false,
      resource_type: "image",
      transformation: finalTransformation,
    };

    try {
      let result: UploadApiResponse;

      if (Buffer.isBuffer(file)) {
        result = await this.uploadFromBuffer(file, uploadOptions);
      } else {
        result = await cloudinary.uploader.upload(file, uploadOptions);
      }

      // Generate a tiny low-quality blur string for Next.js <Image placeholder="blur" />
      const blurDataURL = generateBlur
        ? this.getBlurPlaceholderUrl(result.public_id)
        : undefined;

      return {
        ...result,
        blurDataURL,
      };
    } catch (error) {
      console.error("[CloudinaryService] Upload failed:", {
        error,
        public_id,
        folder,
      });
      throw new Error(
        `Failed to upload media asset: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Deletes a single image using its Cloudinary public ID.
   */
  static async deleteImage(publicId: string): Promise<DeleteApiResponse> {
    if (!publicId) {
      return { result: "not found" } as unknown as DeleteApiResponse;
    }

    try {
      return await cloudinary.uploader.destroy(publicId, {
        invalidate: true,
      });
    } catch (error) {
      console.error(
        `[CloudinaryService] Delete failed for ID "${publicId}":`,
        error,
      );
      throw new Error(
        `Failed to delete media asset: ${(error as Error).message}`,
      );
    }
  }

  /**
   * High-Performance Batch Deletion using Cloudinary's Admin Bulk API.
   * Replaces slow sequential deletes with a single network call.
   */
  static async deleteMultipleImages(
    publicIds: string[],
  ): Promise<Record<string, string>> {
    const validIds = publicIds.filter(Boolean);
    if (validIds.length === 0) return {};

    try {
      // Cloudinary allows up to 100 resources per bulk delete call
      const response = await cloudinary.api.delete_resources(validIds, {
        all: false,
        invalidate: true,
      });
      return response.deleted || {};
    } catch (error) {
      console.error("[CloudinaryService] Batch delete failed:", {
        count: validIds.length,
        error,
      });
      throw new Error(
        `Failed to execute batch deletion: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Generates a fully optimized dynamic CDN URL with custom transformations.
   */
  static getOptimizedUrl(
    publicId: string,
    transformations?: TransformationOptions | TransformationOptions[],
  ): string {
    const urlOptions: Record<string, unknown> = {
      secure: true,
      quality: "auto:good",
      fetch_format: "auto",
    };

    if (
      transformations &&
      typeof transformations === "object" &&
      !Array.isArray(transformations)
    ) {
      Object.assign(urlOptions, transformations);
    }

    return cloudinary.url(publicId, urlOptions as TransformationOptions);
  }

  /**
   * Generates an ultra-light (~10px) blurred base URL for instant Next.js placeholder loading.
   */
  static getBlurPlaceholderUrl(publicId: string): string {
    return cloudinary.url(publicId, {
      secure: true,
      width: 16,
      quality: 30,
      effect: "blur:1000",
      fetch_format: "auto",
    });
  }

  /**
   * Utility to extract the Cloudinary public_id from a full URL string.
   * Useful when sanitizing media strings stored in the database.
   */
  static extractPublicId(url: string): string | null {
    if (!url || !url.includes("cloudinary.com")) return null;

    try {
      const parts = url.split(/\/v\d+\//);
      if (parts.length < 2) return null;
      const pathWithExtension = parts[1];
      // Remove file extension (e.g. .jpg, .webp)
      return pathWithExtension.replace(/\.[^/.]+$/, "");
    } catch {
      return null;
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                             INTERNAL HELPERS                               */
  /* -------------------------------------------------------------------------- */

  /**
   * Handles stream-based buffer uploads (Node.js Buffer -> Cloudinary Upload Stream).
   */
  private static uploadFromBuffer(
    buffer: Buffer,
    options: UploadApiOptions,
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        options,
        (error, result) => {
          if (error || !result) {
            return reject(
              error || new Error("Stream upload failed without response"),
            );
          }
          resolve(result);
        },
      );

      stream.end(buffer);
    });
  }
}

// Export individual functions for convenience
export const uploadImage =
  CloudinaryService.uploadImage.bind(CloudinaryService);
export const deleteImage =
  CloudinaryService.deleteImage.bind(CloudinaryService);
export const deleteMultipleImages =
  CloudinaryService.deleteMultipleImages.bind(CloudinaryService);
export const getOptimizedUrl =
  CloudinaryService.getOptimizedUrl.bind(CloudinaryService);
export const getBlurPlaceholderUrl =
  CloudinaryService.getBlurPlaceholderUrl.bind(CloudinaryService);
export const extractPublicId =
  CloudinaryService.extractPublicId.bind(CloudinaryService);

// Default export
export default CloudinaryService;
