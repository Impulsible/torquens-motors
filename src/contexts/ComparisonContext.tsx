'use client';
/* eslint-disable react-hooks/set-state-in-effect */


import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { Vehicle } from '@/components/vehicle/VehicleCard';
import {
  getUserComparisonAction,
  createComparisonAction,
  addVehicleToComparisonAction,
  removeVehicleFromComparisonAction,
  deleteComparisonAction,
  getVehicleByIdAction,
} from '@/actions/comparison';

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

interface RawVehicleDoc {
  id?: string;
  _id?: string | { toString(): string };
  slug?: string;
  make?: string;
  model?: string;
  year?: number;
  price?: number;
  currency?: string;
  mileage?: number;
  images?: string[];
  transmission?: string;
  fuelType?: string;
  verified?: Vehicle['verified'];
  status?: Vehicle['status'];
  location?: string;
  power?: number;
  horsepower?: number;
  [key: string]: unknown;
}

// Strictly typed mapper from DB document to Vehicle UI interface
function mapToVehicle(vehicle: RawVehicleDoc): Vehicle {
  const resolvedId =
    vehicle.id ||
    (typeof vehicle._id === 'object' ? vehicle._id?.toString() : vehicle._id) ||
    '';

  return {
    id: String(resolvedId),
    slug: vehicle.slug || '',
    make: vehicle.make || '',
    model: vehicle.model || '',
    year: vehicle.year || 0,
    price: vehicle.price || 0,
    currency: vehicle.currency || 'NGN',
    mileage: vehicle.mileage || 0,
    images: vehicle.images || [],
    transmission: vehicle.transmission || '',
    fuelType: vehicle.fuelType || '',
    verified: vehicle.verified || 'UNVERIFIED',
    status: vehicle.status || 'AVAILABLE',
    location: vehicle.location || '',
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

  // 1. Synchronize from DB via Server Actions for authenticated clients
  useEffect(() => {
    if (!userId) return;

    let isMounted = true;

    const loadUserComparison = async () => {
      try {
        setIsLoading(true);
        const res = await getUserComparisonAction(userId);
        if (isMounted && res.success && res.data) {
          const rawVehicles = Array.isArray(res.data.vehicles) ? res.data.vehicles : [];
          const mapped = rawVehicles.map((v: RawVehicleDoc) => mapToVehicle(v));
          setVehicles(mapped);
          setComparisonId(res.data.id || res.data._id || null);
        }
      } catch (error) {
        console.error('[ComparisonContext] Server action load failed:', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadUserComparison();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  // 2. Synchronize from localStorage for guest visitors
  useEffect(() => {
    if (userId) return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setVehicles(parsed.slice(0, MAX_VEHICLES));
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
          if (!comparisonId) {
            const res = await createComparisonAction(userId, [vehicleId]);
            if (res.success && res.data) {
              setComparisonId(res.data.id || res.data._id || null);
              const rawVehicles = Array.isArray(res.data.vehicles) ? res.data.vehicles : [];
              setVehicles(rawVehicles.map((v: RawVehicleDoc) => mapToVehicle(v)));
            }
          } else {
            const res = await addVehicleToComparisonAction(comparisonId, vehicleId);
            if (res.success && res.data) {
              const rawVehicles = Array.isArray(res.data.vehicles) ? res.data.vehicles : [];
              setVehicles(rawVehicles.map((v: RawVehicleDoc) => mapToVehicle(v)));
            }
          }
        } else {
          if (typeof vehicleOrId !== 'string') {
            setVehicles((prev) => [...prev, vehicleOrId]);
          } else {
            const res = await getVehicleByIdAction(vehicleId);
            if (!res.success || !res.data) {
              throw new Error(res.message || 'Failed to resolve vehicle specification');
            }
            setVehicles((prev) => [...prev, mapToVehicle(res.data)]);
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
          const res = await removeVehicleFromComparisonAction(comparisonId, vehicleId);
          if (res.success && res.data) {
            const rawVehicles = Array.isArray(res.data.vehicles) ? res.data.vehicles : [];
            const mapped = rawVehicles.map((v: RawVehicleDoc) => mapToVehicle(v));
            setVehicles(mapped);
            if (mapped.length === 0) {
              setComparisonId(null);
              await deleteComparisonAction(comparisonId);
            }
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
        await deleteComparisonAction(comparisonId);
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
