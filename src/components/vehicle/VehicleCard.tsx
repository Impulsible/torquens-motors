'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Heart,
  GitCompare,
  MapPin,
  Gauge,
  Fuel,
  Sparkles,
  ShieldCheck,
  ArrowUpRight,
} from 'lucide-react';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/utils/helpers';
import { cn } from '@/utils/cn';

export interface Vehicle {
  id: string;
  slug: string;
  make: string;
  model: string;
  year: number;
  price: number;
  currency?: string;
  mileage: number;
  images: string[];
  transmission: string;
  fuelType: string;
  verified?: 'VERIFIED' | 'PENDING' | 'UNVERIFIED' | boolean;
  status?: 'AVAILABLE' | 'SOLD' | 'RESERVED' | 'PENDING' | string;
  location: string;
}

export interface VehicleCardProps {
  vehicle: Vehicle;
  featured?: boolean;
  priority?: boolean;
  isFavorited?: boolean;
  isCompared?: boolean;
  onFavoriteToggle?: (id: string) => void;
  onCompareToggle?: (id: string) => void;
  className?: string;
}

export function VehicleCard({
  vehicle,
  featured = false,
  priority = false,
  isFavorited = false,
  isCompared = false,
  onFavoriteToggle,
  onCompareToggle,
  className,
}: VehicleCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [favorite, setFavorite] = useState(isFavorited);
  const [compared, setCompared] = useState(isCompared);

  const isVerified = vehicle.verified === 'VERIFIED' || vehicle.verified === true;
  const isSold = vehicle.status?.toUpperCase() === 'SOLD';
  const isReserved =
    vehicle.status?.toUpperCase() === 'RESERVED' ||
    vehicle.status?.toUpperCase() === 'PENDING';

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorite((prev) => !prev);
    onFavoriteToggle?.(vehicle.id);
  };

  const handleCompareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCompared((prev) => !prev);
    onCompareToggle?.(vehicle.id);
  };

  return (
    <Card
      className={cn(
        'group flex flex-col h-full overflow-hidden bg-graphite border-border hover:border-active-border transition-all duration-500 hover:-translate-y-1 hover:shadow-card',
        featured && 'border-gold/30 shadow-goldGlowSm',
        className
      )}
    >
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. MEDIA STAGE (Image + Floating Badges & Glass Quick Actions)*/}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="relative aspect-16/10 w-full overflow-hidden bg-charcoal select-none">
        {/* Skeleton Pulse Loader */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-charcoal animate-pulse z-0" />
        )}

        {/* Vehicle Photography */}
        {vehicle.images?.[0] ? (
          <Image
            src={vehicle.images[0]}
            alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
            fill
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={cn(
              'object-cover transition-all duration-700 ease-out group-hover:scale-105',
              imageLoaded ? 'opacity-100' : 'opacity-0',
              isSold && 'grayscale-40 brightness-75'
            )}
            onLoad={() => setImageLoaded(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-graphite text-[11px] font-sans uppercase tracking-widest text-muted">
            No Imagery Available
          </div>
        )}

        {/* Ambient Dark Vignette Overlay for Readability */}
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-obsidian via-obsidian/20 to-black/40 opacity-70 transition-opacity duration-300 group-hover:opacity-50" />

        {/* Top Floating Badges (Status & Verification) */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10 pointer-events-none">
          <div className="flex flex-wrap items-center gap-1.5 pointer-events-auto">
            {isVerified && (
              <Badge variant="verified" size="sm">
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  Verified
                </span>
              </Badge>
            )}
            {featured && (
              <Badge variant="featured" size="sm">
                <span className="inline-flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Featured
                </span>
              </Badge>
            )}
          </div>

          <div className="pointer-events-auto">
            {isSold ? (
              <Badge variant="sold" size="sm">
                Sold
              </Badge>
            ) : isReserved ? (
              <Badge variant="reserved" size="sm" dot>
                Reserved
              </Badge>
            ) : (
              <Badge variant="default" size="sm" className="font-mono bg-obsidian/80 backdrop-blur-md">
                {vehicle.year}
              </Badge>
            )}
          </div>
        </div>

        {/* Floating Glassmorphic Quick Action Controls (Reveals on Hover) */}
        <div className="absolute bottom-3 right-3 left-3 flex items-center justify-end gap-2 z-10 opacity-0 translate-y-2 transition-all duration-300 ease-luxury group-hover:opacity-100 group-hover:translate-y-0">
          {/* Compare Toggle */}
          <button
            type="button"
            onClick={handleCompareClick}
            aria-label="Compare vehicle"
            title="Compare Vehicle Specs"
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-md border backdrop-blur-md transition-all duration-200',
              compared
                ? 'bg-gold border-gold text-obsidian shadow-goldGlowSm'
                : 'bg-obsidian/80 border-border text-secondary hover:text-primary hover:border-gold/40'
            )}
          >
            <GitCompare className="h-3.5 w-3.5" />
          </button>

          {/* Favorite Toggle */}
          <button
            type="button"
            onClick={handleFavoriteClick}
            aria-label="Save to garage"
            title="Save to My Garage"
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-md border backdrop-blur-md transition-all duration-200',
              favorite
                ? 'bg-red-500/20 border-red-500/40 text-red-400'
                : 'bg-obsidian/80 border-border text-secondary hover:text-red-400 hover:border-red-500/30'
            )}
          >
            <Heart
              className={cn(
                'h-3.5 w-3.5 transition-transform active:scale-125',
                favorite && 'fill-current text-red-400'
              )}
            />
          </button>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. VEHICLE DOSSIER & PRICING                                  */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 p-5 justify-between">
        <div>
          {/* Make Eyebrow & Location */}
          <div className="flex items-center justify-between text-[11px] font-sans uppercase tracking-widest font-semibold text-secondary mb-1">
            <span className="text-gold">{vehicle.make}</span>
            <div className="flex items-center gap-1 text-muted normal-case">
              <MapPin className="h-3 w-3 text-secondary shrink-0" />
              <span className="truncate max-w-30">{vehicle.location}</span>
            </div>
          </div>

          {/* Vehicle Model Heading */}
          <Link href={`/vehicles/${vehicle.slug}`} className="group/link block">
            <h3 className="font-serif text-xl font-normal text-primary tracking-tight line-clamp-1 transition-colors group-hover/link:text-gold">
              {vehicle.model}
            </h3>
          </Link>

          {/* Price Display */}
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-[10px] uppercase tracking-widest text-muted font-sans font-medium">
              Acquisition Price
            </span>
            <span className="font-sans text-lg font-bold tracking-tight text-primary">
              {formatCurrency
                ? formatCurrency(vehicle.price, vehicle.currency || 'NGN')
                : `${vehicle.currency === 'USD' ? '$' : '₦'}${vehicle.price.toLocaleString()}`}
            </span>
          </div>

          {/* ───────────────────────────────────────────────────────── */}
          {/* 3. TECHNICAL SPECIFICATIONS (Inset Dashboard Panel)      */}
          {/* ───────────────────────────────────────────────────────── */}
          <div className="mt-4 grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-inset border border-border/80 text-xs font-sans">
            {/* Mileage */}
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-muted flex items-center gap-1">
                <Gauge className="h-3 w-3 text-secondary shrink-0" /> ODO
              </span>
              <span className="font-semibold text-primary mt-0.5 truncate font-mono">
                {vehicle.mileage.toLocaleString()}{' '}
                <span className="text-[9px] text-secondary font-sans font-normal">KM</span>
              </span>
            </div>

            {/* Gearbox */}
            <div className="flex flex-col border-x border-border/60 px-2">
              <span className="text-[10px] uppercase tracking-wider text-muted truncate">
                Gearbox
              </span>
              <span className="font-medium text-primary mt-0.5 truncate">
                {vehicle.transmission}
              </span>
            </div>

            {/* Fuel Type */}
            <div className="flex flex-col pl-1">
              <span className="text-[10px] uppercase tracking-wider text-muted flex items-center gap-1">
                <Fuel className="h-3 w-3 text-secondary shrink-0" /> Fuel
              </span>
              <span className="font-medium text-primary mt-0.5 truncate">
                {vehicle.fuelType}
              </span>
            </div>
          </div>
        </div>

        {/* ───────────────────────────────────────────────────────── */}
        {/* 4. CARD FOOTER CALL-TO-ACTION                            */}
        {/* ───────────────────────────────────────────────────────── */}
        <div className="mt-5 pt-3.5 border-t border-border/60 flex items-center justify-between">
          <span className="text-[10px] font-mono text-muted tracking-widest uppercase">
            REF #{vehicle.id.slice(0, 6)}
          </span>

          <Link href={`/vehicles/${vehicle.slug}`}>
            <Button
              variant={featured ? 'primary' : 'secondary'}
              size="sm"
              className="text-xs py-1.5 px-3 flex items-center gap-1"
            >
              <span>View Dossier</span>
              <ArrowUpRight size={14} />
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}

export default VehicleCard;