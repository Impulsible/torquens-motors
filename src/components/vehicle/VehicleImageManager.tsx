'use client';
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useState, useEffect, useMemo } from 'react';
import {
  ImageIcon,
  Sparkles,
  Save,
  RotateCcw,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/utils/cn';

export interface VehicleImageManagerProps {
  vehicleId: string;
  images: string[];
  onUpdate?: (images: string[]) => void;
  className?: string;
  maxFiles?: number;
}

export function VehicleImageManager({
  vehicleId,
  images = [],
  onUpdate,
  className,
  maxFiles = 20,
}: VehicleImageManagerProps) {
  const { showToast } = useToast();
  const [currentImages, setCurrentImages] = useState<string[]>(images);
  const [isSaving, setIsSaving] = useState(false);

  // Sync state when external props update
  useEffect(() => {
    setCurrentImages(images);
  }, [images]);

  // Track if local state differs from server-persisted baseline
  const hasChanges = useMemo(() => {
    if (currentImages.length !== images.length) return true;
    return JSON.stringify(currentImages) !== JSON.stringify(images);
  }, [currentImages, images]);

  const handleImagesChange = (newImages: string[]) => {
    setCurrentImages(newImages);
  };

  const handleReset = () => {
    setCurrentImages(images);
    showToast({
      type: 'info',
      title: 'Modifications Discarded',
      message: 'Restored gallery to the last saved database state.',
    });
  };

  const handleSave = async () => {
    if (currentImages.length === 0) {
      showToast({
        type: 'warning',
        title: 'Showroom Asset Required',
        message: 'A vehicle allocation must possess at least one primary showcase photograph.',
      });
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/vehicles/${vehicleId}/images`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ images: currentImages }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.message || 'Failed to update vehicle images.');
      }

      onUpdate?.(currentImages);

      showToast({
        type: 'success',
        title: 'Gallery Ledger Updated',
        message: 'Vehicle showcase photography has been synchronized with the live showroom.',
      });
    } catch (error: unknown) {
      console.error('[VehicleImageManager] Save error:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'An unexpected error occurred while saving images.';
      showToast({
        type: 'error',
        title: 'Synchronization Failed',
        message: errorMessage,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card
      className={cn(
        'p-6 sm:p-8 bg-graphite/95 border-border/80 relative overflow-hidden backdrop-blur-md shadow-dropdown',
        className
      )}
    >
      {/* Gold Top Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-gold to-transparent" />

      <div className="space-y-6">
        {/* ───────────────────────────────────────────────────────── */}
        {/* SECTION HEADER & STATUS BADGES                            */}
        {/* ───────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/40">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Badge variant="gold" size="sm">
                <span className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-widest">
                  <Sparkles className="h-3 w-3" />
                  Visual Custody
                </span>
              </Badge>
              <span className="text-muted text-xs">•</span>
              <span className="text-[11px] font-mono text-muted tabular-nums">
                {currentImages.length} / {maxFiles} Staged Assets
              </span>
            </div>

            <h3 className="text-xl font-serif font-light text-primary tracking-tight">
              Vehicle Gallery & Media Showcase
            </h3>
            <p className="text-xs text-secondary font-sans mt-0.5">
              Manage high-resolution photography. The first asset in sequence is designated as the primary hero thumbnail.
            </p>
          </div>

          {/* Unsaved Changes Status Indicator */}
          {hasChanges && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-mono animate-fade-in self-start sm:self-auto">
              <span className="h-1.5 w-1.5 rounded-full bg-yellow-400 animate-pulse" />
              <span>Unsaved Staged Changes</span>
            </div>
          )}
        </div>

        {/* ───────────────────────────────────────────────────────── */}
        {/* IMAGE UPLOAD & GALLERY REORDER MATRIX                     */}
        {/* ───────────────────────────────────────────────────────── */}
        <div className="pt-1">
          <ImageUpload
            value={currentImages}
            onChange={handleImagesChange}
            maxFiles={maxFiles}
            folder={`torquens/vehicles/${vehicleId}`}
            disabled={isSaving}
          />
        </div>

        {/* ───────────────────────────────────────────────────────── */}
        {/* ACTION CONTROLS & SECURITY PROTOCOL                       */}
        {/* ───────────────────────────────────────────────────────── */}
        <div className="pt-4 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[11px] font-mono text-muted select-none">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>High-res CDN optimization & cryptographic ledger hashing</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={handleReset}
              disabled={!hasChanges || isSaving}
              leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
              className="text-xs uppercase tracking-wider border-border hover:border-gold/30 disabled:opacity-40"
            >
              Discard Changes
            </Button>

            <Button
              type="button"
              variant="gold"
              size="md"
              onClick={handleSave}
              isLoading={isSaving}
              disabled={!hasChanges || isSaving}
              leftIcon={!isSaving && <Save className="h-3.5 w-3.5" />}
              className="text-xs uppercase tracking-widest font-semibold min-w-35 shadow-[0_0_15px_rgba(212,175,55,0.2)] disabled:opacity-40"
            >
              {isSaving ? 'Syncing...' : 'Save Gallery'}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}