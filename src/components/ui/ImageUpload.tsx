'use client';
/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import {
  Upload,
  Star,
  Trash2,
  Loader2,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/utils/cn';
import { useToast } from '@/hooks/useToast';

// ─────────────────────────────────────────────────────────────
// TYPES & INTERFACES
// ─────────────────────────────────────────────────────────────
export interface UploadedFileRecord {
  public_id?: string;
  secure_url: string;
  url?: string;
  format?: string;
  width?: number;
  height?: number;
  bytes?: number;
  [key: string]: unknown;
}

interface UploadApiResponse {
  success?: boolean;
  count?: number;
  files?: UploadedFileRecord[];
  error?: string;
}

export interface ImageUploadProps {
  value?: string[];
  onChange?: (urls: string[]) => void;
  onUpload?: (files: UploadedFileRecord[]) => void;
  maxFiles?: number;
  maxSize?: number; // in bytes (default: 10MB)
  folder?: string;
  className?: string;
  disabled?: boolean;
  existingImages?: string[];
  onRemoveExisting?: (index: number) => void;
}

export function ImageUpload({
  value = [],
  onChange,
  onUpload,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB
  folder = 'torquens/vehicles',
  className,
  disabled = false,
  existingImages = [],
  onRemoveExisting,
}: ImageUploadProps) {
  const { showToast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [stagedBlobs, setStagedBlobs] = useState<string[]>([]);

  // Sync external value changes into local image array
  useEffect(() => {
    const combined = Array.from(new Set([...existingImages, ...value]));
    setImages(combined);
  }, [value, existingImages]);

  // Cleanup staged object URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      stagedBlobs.forEach((blobUrl) => {
        if (blobUrl.startsWith('blob:')) {
          URL.revokeObjectURL(blobUrl);
        }
      });
    };
  }, [stagedBlobs]);

  // ─────────────────────────────────────────────────────────────
  // DROP & UPLOAD HANDLER
  // ─────────────────────────────────────────────────────────────
  const onDrop = useCallback(
    async (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      // 1. Handle rejections
      if (fileRejections.length > 0) {
        const firstError = fileRejections[0].errors[0];
        showToast({
          type: 'error',
          title: 'File Rejected',
          message: firstError?.message || 'Selected file exceeds the 10MB limit or format restrictions.',
        });
        return;
      }

      if (images.length + acceptedFiles.length > maxFiles) {
        showToast({
          type: 'warning',
          title: 'Allocation Capacity Reached',
          message: `A maximum of ${maxFiles} high-resolution photographs are permitted per vehicle dossier.`,
        });
        return;
      }

      // 2. Validate files with client-side MIME check
      const invalidFiles: File[] = [];
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

      acceptedFiles.forEach((file) => {
        if (!allowedMimeTypes.includes(file.type)) {
          invalidFiles.push(file);
        }
      });

      if (invalidFiles.length > 0) {
        showToast({
          type: 'error',
          title: 'Invalid Format',
          message: `${invalidFiles.length} file(s) are corrupted or unsupported. Please use PNG, JPEG, WEBP, or AVIF.`,
        });
        return;
      }

      // 3. Staging Local Object URLs for instant preview
      const newBlobUrls = acceptedFiles.map((f) => URL.createObjectURL(f));
      setStagedBlobs((prev) => [...prev, ...newBlobUrls]);

      // Optimistic preview display
      const previewList = [...images, ...newBlobUrls];
      setImages(previewList);

      // 4. Dispatch Multi-part Upload
      setUploading(true);
      try {
        const formData = new FormData();
        acceptedFiles.forEach((file) => {
          formData.append('files', file);
        });
        formData.append('folder', folder);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const result: UploadApiResponse = await response.json();

        if (!response.ok || !result.files) {
          throw new Error(result.error || 'Server rejected image upload payload.');
        }

        // Extract secure CDN URLs
        const uploadedUrls = result.files.map((fileRecord) => fileRecord.secure_url);

        // Replace staged blob URLs with permanent HTTPS CDN URLs
        const finalUrlList = [
          ...images.filter((url) => !url.startsWith('blob:')),
          ...uploadedUrls,
        ];

        setImages(finalUrlList);
        onChange?.(finalUrlList);
        onUpload?.(result.files);

        // Cleanup blobs from memory
        newBlobUrls.forEach((blobUrl) => URL.revokeObjectURL(blobUrl));
        setStagedBlobs((prev) => prev.filter((b) => !newBlobUrls.includes(b)));

        showToast({
          type: 'success',
          title: 'Assets Uploaded',
          message: `${result.count || uploadedUrls.length} high-resolution photograph(s) added to the vault.`,
        });
      } catch (error: unknown) {
        console.error('[ImageUpload] Error:', error);
        const errMsg = error instanceof Error ? error.message : 'Failed to complete image asset upload.';

        // Revert staged preview on failure
        const rolledBack = images.filter((url) => !newBlobUrls.includes(url));
        setImages(rolledBack);
        newBlobUrls.forEach((blobUrl) => URL.revokeObjectURL(blobUrl));

        showToast({
          type: 'error',
          title: 'Upload Failed',
          message: errMsg,
        });
      } finally {
        setUploading(false);
      }
    },
    [images, maxFiles, folder, onChange, onUpload, showToast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'image/avif': ['.avif'],
    },
    maxSize,
    maxFiles: maxFiles - images.length,
    disabled: disabled || uploading || images.length >= maxFiles,
  });

  // ─────────────────────────────────────────────────────────────
  // REORDER & HERO COVER SELECTION
  // ─────────────────────────────────────────────────────────────
  const setAsCover = (index: number) => {
    if (index === 0 || index >= images.length) return;

    const targetUrl = images[index];
    const reordered = [targetUrl, ...images.filter((_, i) => i !== index)];

    setImages(reordered);
    onChange?.(reordered);

    showToast({
      type: 'info',
      title: 'Hero Cover Assigned',
      message: 'This photograph will appear as the primary showroom banner.',
    });
  };

  // ─────────────────────────────────────────────────────────────
  // REMOVE IMAGE
  // ─────────────────────────────────────────────────────────────
  const removeImage = (index: number) => {
    // If it's an existing image from initial props with separate handler
    if (index < existingImages.length && onRemoveExisting) {
      onRemoveExisting(index);
      return;
    }

    const removedUrl = images[index];
    if (removedUrl && removedUrl.startsWith('blob:')) {
      URL.revokeObjectURL(removedUrl);
    }

    const updated = images.filter((_, i) => i !== index);
    setImages(updated);
    onChange?.(updated);
  };

  const remainingSlots = Math.max(0, maxFiles - images.length);

  return (
    <div className={cn('space-y-4', className)}>
      {/* ───────────────────────────────────────────────────────── */}
      {/* DRAG AND DROP ZONE                                        */}
      {/* ───────────────────────────────────────────────────────── */}
      {remainingSlots > 0 && !disabled && (
        <div
          {...getRootProps()}
          className={cn(
            'relative overflow-hidden border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 select-none group',
            isDragActive
              ? 'border-gold bg-gold/5 shadow-[0_0_30px_rgba(212,175,55,0.15)] scale-[1.01]'
              : 'border-border/80 hover:border-gold/40 bg-obsidian/40 hover:bg-obsidian/70',
            uploading && 'pointer-events-none opacity-60'
          )}
        >
          <input {...getInputProps()} />

          {/* Ambient Lighting on Drag Over */}
          <div
            aria-hidden="true"
            className={cn(
              'pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-gold/10 blur-3xl rounded-full transition-opacity duration-300',
              isDragActive ? 'opacity-100' : 'opacity-0'
            )}
          />

          {uploading ? (
            <div className="flex flex-col items-center gap-3 relative z-10 py-2">
              <Loader2 className="h-8 w-8 text-gold animate-spin" />
              <div className="space-y-1">
                <p className="text-xs font-mono uppercase tracking-widest text-primary font-semibold">
                  Securely Uploading Asset(s)...
                </p>
                <p className="text-[11px] text-secondary font-sans">
                  Optimizing resolution and encrypting metadata
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2.5 relative z-10">
              <div className="h-12 w-12 rounded-xl bg-graphite/80 border border-border/80 flex items-center justify-center group-hover:border-gold/40 transition-colors shadow-sm">
                <Upload className="h-5 w-5 text-gold/80 group-hover:scale-110 transition-transform duration-300" />
              </div>

              <div className="space-y-1">
                <p className="text-xs sm:text-sm font-serif font-light text-primary tracking-wide">
                  {isDragActive
                    ? 'Release to stage high-resolution assets'
                    : 'Drag & drop photography, or click to browse'}
                </p>
                <p className="text-[10px] text-muted font-mono uppercase tracking-wider">
                  JPEG, PNG, WEBP, AVIF · Up to 10MB per image
                </p>
              </div>

              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-graphite/60 border border-border/60 text-[10px] font-mono text-secondary mt-1">
                <Sparkles className="h-3 w-3 text-gold/80" />
                <span>{remainingSlots} allocation slot{remainingSlots === 1 ? '' : 's'} available</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────── */}
      {/* STAGED IMAGE MATRIX                                       */}
      {/* ───────────────────────────────────────────────────────── */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 pt-1">
          {images.map((url, index) => {
            const isHeroCover = index === 0;
            const isStagedBlob = url.startsWith('blob:');

            return (
              <div
                key={`${url}-${index}`}
                className={cn(
                  'group relative aspect-4/3 rounded-lg overflow-hidden bg-obsidian border transition-all duration-300 shadow-sm',
                  isHeroCover
                    ? 'border-gold ring-1 ring-gold shadow-[0_0_15px_rgba(212,175,55,0.2)]'
                    : 'border-border/80 hover:border-gold/40'
                )}
              >
                <Image
                  src={url}
                  alt={`Vehicle showcase asset ${index + 1}`}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                  className={cn(
                    'object-cover transition-transform duration-700 ease-out group-hover:scale-105',
                    isStagedBlob && 'opacity-80'
                  )}
                />

                {/* Upload In-Progress Glass Overlay */}
                {isStagedBlob && (
                  <div className="absolute inset-0 bg-obsidian/60 backdrop-blur-xs flex items-center justify-center">
                    <Loader2 className="h-5 w-5 text-gold animate-spin" />
                  </div>
                )}

                {/* Hero / Cover Badge */}
                {isHeroCover ? (
                  <div className="absolute top-2 left-2 z-10 flex items-center gap-1 px-1.5 py-0.5 rounded bg-gold text-obsidian text-[8px] font-mono font-bold tracking-widest uppercase shadow">
                    <Star className="h-2.5 w-2.5 fill-obsidian" />
                    <span>Hero Cover</span>
                  </div>
                ) : (
                  <div className="absolute top-2 left-2 z-10 px-1.5 py-0.5 rounded bg-obsidian/75 backdrop-blur-md border border-white/10 text-[9px] font-mono text-muted">
                    #{index + 1}
                  </div>
                )}

                {/* Interactive Action Controls */}
                {!disabled && (
                  <div className="absolute inset-0 bg-obsidian/80 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2 p-2">
                    {/* Make Cover Button */}
                    {!isHeroCover && !isStagedBlob && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAsCover(index);
                        }}
                        className="flex items-center justify-center h-8 w-8 rounded-full bg-graphite/90 text-secondary hover:text-gold hover:bg-obsidian border border-border/80 hover:border-gold/40 transition-all"
                        title="Set as Hero Cover Image"
                        aria-label="Set as primary hero cover"
                      >
                        <Star size={13} />
                      </button>
                    )}

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(index);
                      }}
                      className="flex items-center justify-center h-8 w-8 rounded-full bg-graphite/90 text-secondary hover:text-red-400 hover:bg-obsidian border border-border/80 hover:border-red-500/40 transition-all"
                      title="Remove photograph"
                      aria-label="Remove image from gallery"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Capacity Limit Notification */}
      {images.length >= maxFiles && (
        <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono text-muted pt-1">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          <span>Maximum visual allocation capacity achieved ({maxFiles}/{maxFiles} images)</span>
        </div>
      )}
    </div>
  );
}