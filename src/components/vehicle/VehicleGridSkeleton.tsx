'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/utils/cn';

export interface VehicleGridSkeletonProps {
  count?: number;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function VehicleGridSkeleton({
  count = 6,
  columns = 3,
  className,
}: VehicleGridSkeletonProps) {
  // 📐 Responsive Column Grids matching grid-vehicles utility
  const columnClasses: Record<2 | 3 | 4, string> = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  };

  return (
    <div
      role="status"
      aria-label="Loading vehicles catalogue..."
      className={cn('grid gap-6', columnClasses[columns], className)}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex flex-col h-full rounded-lg border border-border/80 bg-graphite overflow-hidden shadow-card animate-fade-in"
        >
          {/* ───────────────────────────────────────────────────────── */}
          {/* 1. MEDIA STAGE SKELETON (16:10 Aspect Ratio)              */}
          {/* ───────────────────────────────────────────────────────── */}
          <div className="relative aspect-16/10 w-full bg-charcoal">
            <Skeleton variant="rectangular" className="h-full w-full rounded-none" />

            {/* Top Floating Badge Placeholders */}
            <div className="absolute top-3.5 left-3.5 right-3.5 flex justify-between z-10 pointer-events-none">
              <Skeleton variant="badge" className="w-20 h-6" />
              <Skeleton variant="badge" className="w-14 h-6" />
            </div>
          </div>

          {/* ───────────────────────────────────────────────────────── */}
          {/* 2. DOSSIER CONTENT SKELETON                               */}
          {/* ───────────────────────────────────────────────────────── */}
          <div className="flex flex-col flex-1 p-5 justify-between">
            <div className="space-y-3">
              {/* Make Eyebrow + Location */}
              <div className="flex justify-between items-center">
                <Skeleton width={70} height={12} />
                <Skeleton width={90} height={12} />
              </div>

              {/* Model Heading */}
              <Skeleton width="82%" height={22} className="rounded" />

              {/* Price Row */}
              <div className="flex justify-between items-baseline pt-1">
                <Skeleton width={90} height={12} />
                <Skeleton width={115} height={20} />
              </div>

              {/* ───────────────────────────────────────────────────── */}
              {/* 3. INSET COCKPIT INSTRUMENT PANEL (3 Columns)          */}
              {/* ───────────────────────────────────────────────────── */}
              <div className="grid grid-cols-3 gap-2 p-2.5 rounded-md bg-inset border border-border/70 mt-3">
                {/* ODO */}
                <div className="space-y-1.5">
                  <Skeleton width="60%" height={10} />
                  <Skeleton width="85%" height={14} />
                </div>
                {/* Gearbox */}
                <div className="space-y-1.5 border-x border-border/60 px-2">
                  <Skeleton width="60%" height={10} />
                  <Skeleton width="85%" height={14} />
                </div>
                {/* Fuel */}
                <div className="space-y-1.5 pl-1">
                  <Skeleton width="60%" height={10} />
                  <Skeleton width="85%" height={14} />
                </div>
              </div>
            </div>

            {/* ───────────────────────────────────────────────────────── */}
            {/* 4. FOOTER ACTION AREA                                    */}
            {/* ───────────────────────────────────────────────────────── */}
            <div className="mt-5 pt-3.5 border-t border-border/60 flex items-center justify-between">
              <Skeleton width={75} height={12} />
              <Skeleton variant="button" className="h-7 w-20 rounded-sm" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}