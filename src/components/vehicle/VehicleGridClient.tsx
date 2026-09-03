'use client';
/* eslint-disable @next/next/no-location-assign-relative-destination */
'use client';

import { useState } from 'react';
import { 
  Car, 
  Check 
} from 'lucide-react';
import { VehicleCard } from './VehicleCard';
import type { IVehicle } from '@/types';
import { cn } from '@/utils/cn';
import { EmptyState } from '../ui/EmptyState';

interface VehicleGridClientProps {
  initialVehicles: IVehicle[];
  initialTotal: number;
  className?: string;
}

const parsePowerNumber = (power: unknown): number => {
  if (typeof power === 'number') return power;
  if (typeof power === 'string') return parseInt(power, 10) || 0;
  return 0;
};

export function VehicleGridClient({
  initialVehicles,
  initialTotal,
  className,
}: VehicleGridClientProps) {
  const [vehicles] = useState(initialVehicles);
  const [total] = useState(initialTotal);
  const [favoritedIds, setFavoritedIds] = useState<Set<string>>(new Set());
  const [comparedIds, setComparedIds] = useState<Set<string>>(new Set());

  const handleFavoriteToggle = (id: string) => {
    setFavoritedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCompareToggle = (id: string) => {
    setComparedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (vehicles.length === 0) {
    return (
      <EmptyState
        title="No Vehicles Found"
        description="We couldn't find any vehicles matching your criteria."
        icon={<Car className="h-8 w-8 text-gold/80" />}
        actionLabel="Reset Filters"
        onAction={() => window.location.href = '/vehicles'}
        className="my-4"
      />
    );
  }

  return (
    <div className={cn('space-y-8', className)}>
      <div className="flex items-center justify-between px-1 text-xs font-sans text-muted">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
          <span>
            Showing <strong className="text-primary font-semibold">{vehicles.length}</strong> of{' '}
            <strong className="text-primary font-semibold">{total}</strong> vehicles
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map((vehicle, index) => {
          const isVerified = vehicle.verified === 'VERIFIED' || vehicle.verified === true;
          
          return (
            <div
              key={vehicle.id || vehicle.slug || index}
              className="animate-in fade-in slide-in-from-bottom-3 duration-300"
              style={{ animationDelay: `${(index % 6) * 60}ms` }}
            >
              <VehicleCard
                vehicle={{
                  id: vehicle.id,
                  slug: vehicle.slug || vehicle.id || '',
                  make: vehicle.make,
                  model: vehicle.model,
                  year: vehicle.year,
                  price: vehicle.price,
                  currency: vehicle.currency || 'NGN',
                  mileage: vehicle.mileage,
                  images: vehicle.images || [],
                  transmission: vehicle.transmission,
                  fuelType: vehicle.fuelType,
                  verified: isVerified,
                  status: vehicle.status,
                  location: vehicle.location,
                  power: parsePowerNumber(vehicle.power),
                }}
                featured={false}
                priority={index < 3}
                isFavorited={favoritedIds.has(vehicle.id)}
                isCompared={comparedIds.has(vehicle.id)}
                onFavoriteToggle={handleFavoriteToggle}
                onCompareToggle={handleCompareToggle}
              />
            </div>
          );
        })}
      </div>

      {vehicles.length > 0 && (
        <div className="pt-8 pb-4 text-center border-t border-border/40">
          <p className="text-xs font-sans text-muted flex items-center justify-center gap-1.5">
            <Check size={14} className="text-emerald" />
            <span>You have viewed all <strong>{total}</strong> vehicles in this registry.</span>
          </p>
        </div>
      )}
    </div>
  );
}