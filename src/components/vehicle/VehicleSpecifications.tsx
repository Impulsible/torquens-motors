'use client';

import React from 'react';
import { 
  Gauge, 
  Calendar, 
  Fuel, 
  Settings, 
  Zap, 
  Car, 
  MapPin, 
  Cog, 
  Truck, 
  Sparkles,
  ShieldCheck,
  Layers
} from 'lucide-react';

import { SpecificationList, type VehicleSpecification } from '@/components/shared/SpecificationList';
import { FeatureList } from '@/components/shared/FeatureList';
import { VerifiedBadge } from '@/components/shared/VerifiedBadge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                   */
/* -------------------------------------------------------------------------- */

export interface VehicleSpecData {
  make: string;
  model: string;
  year: number;
  price: number;
  currency?: string;
  mileage: number;
  transmission: string;
  fuelType: string;
  engine: string;
  horsepower: number;
  drivetrain: string;
  bodyType: string;
  location: string;
  verified?: string | boolean;
  features?: string[];
}

export interface VehicleSpecificationsProps {
  vehicle: VehicleSpecData;
  className?: string;
}

/* -------------------------------------------------------------------------- */
/*                       VEHICLE SPECIFICATIONS ROOT                          */
/* -------------------------------------------------------------------------- */

export function VehicleSpecifications({ vehicle, className }: VehicleSpecificationsProps) {
  const isVerified = vehicle.verified === 'VERIFIED' || vehicle.verified === true;

  // Deconstructed technical specifications for cockpit instrument rendering
  const specs: VehicleSpecification[] = [
    {
      label: 'Model Year',
      value: vehicle.year,
      icon: <Calendar />,
    },
    {
      label: 'Odometer',
      value: vehicle.mileage.toLocaleString(),
      unit: 'KM',
      icon: <Gauge />,
    },
    {
      label: 'Engine Spec',
      value: vehicle.engine,
      highlight: true,
      icon: <Cog />,
    },
    {
      label: 'Horsepower',
      value: vehicle.horsepower,
      unit: 'BHP',
      highlight: true,
      icon: <Zap />,
    },
    {
      label: 'Gearbox',
      value: vehicle.transmission,
      icon: <Settings />,
    },
    {
      label: 'Drivetrain',
      value: vehicle.drivetrain,
      icon: <Truck />,
    },
    {
      label: 'Fuel Type',
      value: vehicle.fuelType,
      icon: <Fuel />,
    },
    {
      label: 'Body Configuration',
      value: vehicle.bodyType,
      icon: <Car />,
    },
    {
      label: 'Showroom Location',
      value: vehicle.location,
      icon: <MapPin />,
    },
    {
      label: 'Provenance',
      value: isVerified ? 'Verified' : 'Unverified',
      icon: <ShieldCheck className={isVerified ? 'text-emerald' : 'text-muted'} />,
    },
  ];

  return (
    <Card variant="default" specular className={cn('space-y-6', className)}>
      <CardHeader className="pb-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="gold" size="sm" leftIcon={<Sparkles className="h-3 w-3" />}>
                Technical Dossier
              </Badge>
              {isVerified && <VerifiedBadge size="sm" pulse />}
            </div>
            <CardTitle className="text-2xl font-serif">Vehicle Specifications</CardTitle>
          </div>

          <span className="text-xs font-mono uppercase tracking-wider text-muted">
            Ref #{vehicle.make.slice(0, 3).toUpperCase()}-{vehicle.year}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Recessed Cockpit Telemetry Grid */}
        <SpecificationList specs={specs} columns={2} variant="inset" />

        {/* Factory Options & Equipment */}
        {vehicle.features && vehicle.features.length > 0 && (
          <div className="pt-4 border-t border-border/60 space-y-3">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-gold" />
              <h4 className="text-xs font-semibold uppercase tracking-wider text-secondary font-sans">
                Factory Options & Equipment ({vehicle.features.length})
              </h4>
            </div>

            <FeatureList
              features={vehicle.features}
              variant="pills"
              maxItems={10}
              expandable
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}