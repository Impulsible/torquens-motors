/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { ComparisonService } from '@/services/comparison.service';
import type { Vehicle } from '@/components/vehicle/VehicleCard';

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                   */
/* -------------------------------------------------------------------------- */

export interface ComparisonContextType {
  vehicles: Vehicle[];
  isLoading: boolean;
  addVehicle: (vehicleOrId: string | Vehicle) => Promise<void>;
  removeVehicle: (vehicleId: string) => Promise<void>;
  toggleVehicle: (vehicle: Vehicle) => Promise<void>;
  clearComparison: () => Promise<void>;
  isInComparison: (vehicleId: string) => boolean;
  count: number;
  maxVehicles: number;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

export interface ComparisonProviderProps {
  children: ReactNode;
  userId?: string;
  initialVehicles?: Vehicle[];
}

const MAX_VEHICLES = 4;
const STORAGE_KEY = 'torquens_comparison_vehicles';

// Helper to map IVehicle to Vehicle (ensures power property exists)
function mapToVehicle(vehicle: any): Vehicle {
  return {
    id: vehicle.id,
    slug: vehicle.slug,
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year,
    price: vehicle.price,
    currency: vehicle.currency || 'NGN',
    mileage: vehicle.mileage,
    images: vehicle.images || [],
    transmission: vehicle.transmission,
    fuelType: vehicle.fuelType,
    verified: vehicle.verified || 'UNVERIFIED',
    status: vehicle.status || 'AVAILABLE',
    location: vehicle.location,
    // Add power field (fallback to horsepower or engine)
    power: vehicle.power || vehicle.horsepower || 0,
  };
}

/* -------------------------------------------------------------------------- */
/*                            COMPARISON PROVIDER                             */
/* -------------------------------------------------------------------------- */

export function ComparisonProvider({
  children,
  userId,
  initialVehicles = [],
}: ComparisonProviderProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [comparisonId, setComparisonId] = useState<string | null>(null);

  // 1. Synchronize from DB for logged-in users
  useEffect(() => {
    if (!userId) return;

    const loadUserComparison = async () => {
      try {
        setIsLoading(true);
        const comparison = await ComparisonService.getComparisonByUser(userId);
        if (comparison) {
          // ✅ Map IVehicle[] to Vehicle[]
          const mappedVehicles = comparison.vehicles.map(mapToVehicle);
          setVehicles(mappedVehicles);
          setComparisonId(comparison.id);
        }
      } catch (error) {
        console.error('[ComparisonContext] DB load failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserComparison();
  }, [userId]);

  // 2. Synchronize from localStorage for guest users
  useEffect(() => {
    if (userId) return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setVehicles(parsed);
        }
      }
    } catch (error) {
      console.error('[ComparisonContext] localStorage load failed:', error);
    }
  }, [userId]);

  // 3. Persist guest changes to localStorage
  useEffect(() => {
    if (userId) return;

    try {
      if (vehicles.length === 0) {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(vehicles));
      }
    } catch (error) {
      console.error('[ComparisonContext] localStorage save failed:', error);
    }
  }, [vehicles, userId]);

  /* ── Add Vehicle ──────────────────────────────────────────────────────── */
  const addVehicle = useCallback(
    async (vehicleOrId: string | Vehicle) => {
      const vehicleId = typeof vehicleOrId === 'string' ? vehicleOrId : vehicleOrId.id;

      if (vehicles.some((v) => v.id === vehicleId)) {
        return; // Already present
      }

      if (vehicles.length >= MAX_VEHICLES) {
        throw new Error(`Comparison matrix is limited to ${MAX_VEHICLES} vehicles.`);
      }

      setIsLoading(true);
      try {
        if (userId) {
          // Logged-in DB flow
          const id = comparisonId;
          if (!id) {
            // ✅ Fix: Pass owner object, not string
            const created = await ComparisonService.createComparison(
              { userId },
              [vehicleId]
            );
            setComparisonId(created.id);
            // ✅ Map IVehicle[] to Vehicle[]
            const mappedVehicles = created.vehicles.map(mapToVehicle);
            setVehicles(mappedVehicles);
          } else {
            const updated = await ComparisonService.addVehicleToComparison(id, vehicleId);
            // ✅ Map IVehicle[] to Vehicle[]
            const mappedVehicles = updated.vehicles.map(mapToVehicle);
            setVehicles(mappedVehicles);
          }
        } else {
          // Guest flow
          if (typeof vehicleOrId !== 'string') {
            setVehicles((prev) => [...prev, vehicleOrId]);
          } else {
            const response = await fetch(`/api/vehicles/${vehicleId}`);
            if (!response.ok) throw new Error('Failed to resolve vehicle specification');
            const fetched = await response.json();
            // ✅ Map to Vehicle type
            setVehicles((prev) => [...prev, mapToVehicle(fetched)]);
          }
        }
      } catch (error) {
        console.error('[ComparisonContext] Add vehicle failed:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [vehicles, userId, comparisonId]
  );

  /* ── Remove Vehicle ───────────────────────────────────────────────────── */
  const removeVehicle = useCallback(
    async (vehicleId: string) => {
      setIsLoading(true);
      try {
        if (userId && comparisonId) {
          const updated = await ComparisonService.removeVehicleFromComparison(
            comparisonId,
            vehicleId
          );
          // ✅ Map IVehicle[] to Vehicle[]
          const mappedVehicles = updated.vehicles.map(mapToVehicle);
          setVehicles(mappedVehicles);
          if (updated.vehicles.length === 0) {
            setComparisonId(null);
            await ComparisonService.deleteComparison(comparisonId);
          }
        } else {
          setVehicles((prev) => prev.filter((v) => v.id !== vehicleId));
        }
      } catch (error) {
        console.error('[ComparisonContext] Remove vehicle failed:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [userId, comparisonId]
  );

  /* ── Toggle Vehicle ────────────────────────────────────────────────────── */
  const toggleVehicle = useCallback(
    async (vehicle: Vehicle) => {
      if (vehicles.some((v) => v.id === vehicle.id)) {
        await removeVehicle(vehicle.id);
      } else {
        await addVehicle(vehicle);
      }
    },
    [vehicles, addVehicle, removeVehicle]
  );

  /* ── Clear All ────────────────────────────────────────────────────────── */
  const clearComparison = useCallback(async () => {
    setIsLoading(true);
    try {
      if (userId && comparisonId) {
        await ComparisonService.deleteComparison(comparisonId);
        setComparisonId(null);
      }
      setVehicles([]);
      if (!userId) {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.error('[ComparisonContext] Clear failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, comparisonId]);

  /* ── Check if in comparison ───────────────────────────────────────────── */
  const isInComparison = useCallback(
    (vehicleId: string) => vehicles.some((v) => v.id === vehicleId),
    [vehicles]
  );

  const value: ComparisonContextType = {
    vehicles,
    isLoading,
    addVehicle,
    removeVehicle,
    toggleVehicle,
    clearComparison,
    isInComparison,
    count: vehicles.length,
    maxVehicles: MAX_VEHICLES,
  };

  return (
    <ComparisonContext.Provider value={value}>
      {children}
    </ComparisonContext.Provider>
  );
}

export function useComparison() {
  const context = useContext(ComparisonContext);
  if (context === undefined) {
    throw new Error('useComparison must be used within a <ComparisonProvider />');
  }
  return context;
}