"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { VehicleCard } from "./VehicleCard";
import { getRelatedVehicles } from "@/services/vehicle.service";
import type { IVehicle } from "@/types";
import { cn } from "@/utils/cn";

export interface RelatedVehiclesProps {
  vehicleId: string;
  make: string;
  bodyType?: string;
  limit?: number;
  title?: string;
  className?: string;
}

/**
 * Matching Skeleton Card Loader
 */
function RelatedCardSkeleton() {
  return (
    <div className="bg-graphite border border-border rounded-xl overflow-hidden flex flex-col h-full animate-pulse">
      <div className="aspect-16/10 w-full bg-charcoal relative">
        <div className="absolute top-3 left-3 w-16 h-4 bg-border rounded-full" />
      </div>
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="h-3 w-16 bg-border rounded" />
          <div className="h-5 w-3/4 bg-border rounded" />
          <div className="h-4 w-1/2 bg-border rounded pt-1" />
        </div>
        <div className="h-10 bg-inset border border-border/80 rounded-lg w-full" />
      </div>
    </div>
  );
}

const parsePowerNumber = (power: unknown): number => {
  if (typeof power === "number") return power;
  if (typeof power === "string") return parseInt(power, 10) || 0;
  return 0;
};

export function RelatedVehicles({
  vehicleId,
  make,
  bodyType,
  limit = 4,
  title,
  className,
}: RelatedVehiclesProps) {
  const [vehicles, setVehicles] = useState<IVehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadRelated = async () => {
      try {
        setLoading(true);
        const results = await getRelatedVehicles(
          vehicleId,
          make,
          bodyType,
          limit,
        );

        if (isMounted) {
          setVehicles(results);
        }
      } catch (error) {
        console.error("Failed to load related inventory:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (vehicleId && make) {
      loadRelated();
    }

    return () => {
      isMounted = false;
    };
  }, [vehicleId, make, bodyType, limit]);

  if (!loading && vehicles.length === 0) {
    return null;
  }

  return (
    <section
      className={cn(
        "relative py-12 border-t border-border/60 overflow-hidden",
        className,
      )}
    >
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-75 bg-gold/5 blur-[120px] rounded-full" />

      <div className="relative z-10 space-y-6">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-sans font-semibold uppercase tracking-widest text-gold">
              <Sparkles size={13} />
              Curated Registry Matches
            </div>
            <h3 className="text-2xl sm:text-3xl font-serif font-light text-primary tracking-tight">
              {title || `Similar to this ${make}`}
            </h3>
          </div>

          <Link
            href={`/vehicles?make=${encodeURIComponent(make)}`}
            className="group inline-flex items-center gap-2 text-xs font-sans font-semibold uppercase tracking-widest text-gold hover:text-gold-hover gold-underline self-start sm:self-auto"
          >
            <span>Explore All {make}</span>
            <ArrowRight
              size={14}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>

        {/* Loading State Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: limit }).map((_, i) => (
              <RelatedCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          /* Cards Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {vehicles.map((vehicle, index) => {
              const isVerified = vehicle.verified === "VERIFIED" || vehicle.verified === true;

              return (
                <div
                  key={vehicle.id}
                  className="animate-in fade-in slide-in-from-bottom-3 duration-300"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <VehicleCard
                    vehicle={{
                      id: vehicle.id,
                      slug: vehicle.slug || vehicle.id || "",
                      make: vehicle.make,
                      model: vehicle.model,
                      year: vehicle.year,
                      price: vehicle.price,
                      currency: vehicle.currency || "NGN",
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
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default RelatedVehicles;