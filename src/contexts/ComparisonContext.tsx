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
import { useSession } from 'next-auth/react';
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
    images: Array.isArray(vehicle.images) ? vehicle.images : [],
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
  userId: propUserId,
  initialVehicles = [],
}: ComparisonProviderProps) {
  const { data: session } = useSession();
  const userId = propUserId || (session?.user as { id?: string })?.id;

  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [comparisonId, setComparisonId] = useState<string | null>(null);

  // 1. Synchronize from DB for authenticated clients
  useEffect(() => {
    if (!userId) return;

    let isMounted = true;

    const loadUserComparison = async () => {
      try {
        setIsLoading(true);
        const res = await getUserComparisonAction(userId);
        if (isMounted && res?.success && res?.data) {
          const rawVehicles = Array.isArray(res.data.vehicles) ? res.data.vehicles : [];
          setVehicles(rawVehicles.map((v: RawVehicleDoc) => mapToVehicle(v)));
          setComparisonId(res.data.id || res.data._id || null);
        }
      } catch (error) {
        console.warn('[ComparisonContext] Failed to load user comparison:', error);
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
          const valid = parsed.filter((item) => item && (item.id || item._id));
          setVehicles(valid.slice(0, MAX_VEHICLES).map((v) => mapToVehicle(v)));
        }
      }
    } catch (error) {
      console.warn('[ComparisonContext] LocalStorage read failed:', error);
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
      console.warn('[ComparisonContext] LocalStorage save failed:', error);
    }
  }, [vehicles, userId]);

  /* ── Add Vehicle ──────────────────────────────────────────────────────── */
  const addVehicle = useCallback(
    async (vehicleOrId: string | Vehicle) => {
      const isVehicleObj = typeof vehicleOrId !== 'string';
      const vehicleId = isVehicleObj ? vehicleOrId.id : vehicleOrId;

      if (!vehicleId) return;

      if (vehicles.some((v) => v.id === vehicleId || (v.slug && v.slug === vehicleId))) {
        return; // Already present in comparison
      }

      if (vehicles.length >= MAX_VEHICLES) {
        console.warn(`Comparison matrix is limited to ${MAX_VEHICLES} vehicles.`);
        return;
      }

      setIsLoading(true);
      try {
        let vehicleData: Vehicle | null = isVehicleObj ? vehicleOrId : null;

        // Fetch specification from backend if not provided as an object
        if (!vehicleData) {
          const res = await getVehicleByIdAction(vehicleId);
          if (res?.success && res?.data) {
            vehicleData = mapToVehicle(res.data);
          } else {
            console.warn(`[ComparisonContext] Vehicle spec unavailable: ${vehicleId}`);
            setIsLoading(false);
            return;
          }
        }

        if (userId) {
          if (!comparisonId) {
            const res = await createComparisonAction(userId, [vehicleId]);
            if (res?.success && res?.data) {
              setComparisonId(res.data.id || res.data._id || null);
              const rawVehicles = Array.isArray(res.data.vehicles) ? res.data.vehicles : [];
              setVehicles(rawVehicles.map((v: RawVehicleDoc) => mapToVehicle(v)));
            }
          } else {
            const res = await addVehicleToComparisonAction(comparisonId, vehicleId);
            if (res?.success && res?.data) {
              const rawVehicles = Array.isArray(res.data.vehicles) ? res.data.vehicles : [];
              setVehicles(rawVehicles.map((v: RawVehicleDoc) => mapToVehicle(v)));
            }
          }
        } else if (vehicleData) {
          setVehicles((prev) => {
            if (prev.some((v) => v.id === vehicleData!.id)) return prev;
            return [...prev, vehicleData!];
          });
        }
      } catch (error) {
        console.error('[ComparisonContext] Add vehicle error:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [vehicles, userId, comparisonId]
  );

  /* ── Remove Vehicle ───────────────────────────────────────────────────── */
  const removeVehicle = useCallback(
    async (vehicleId: string) => {
      if (!vehicleId) return;

      setIsLoading(true);
      try {
        if (userId && comparisonId) {
          const res = await removeVehicleFromComparisonAction(comparisonId, vehicleId);
          if (res?.success && res?.data) {
            const rawVehicles = Array.isArray(res.data.vehicles) ? res.data.vehicles : [];
            const mapped = rawVehicles.map((v: RawVehicleDoc) => mapToVehicle(v));
            setVehicles(mapped);
            if (mapped.length === 0) {
              setComparisonId(null);
              await deleteComparisonAction(comparisonId);
            }
          }
        } else {
          setVehicles((prev) => prev.filter((v) => v.id !== vehicleId && v.slug !== vehicleId));
        }
      } catch (error) {
        console.error('[ComparisonContext] Remove vehicle failed:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [userId, comparisonId]
  );

  /* ── Toggle Vehicle ────────────────────────────────────────────────────── */
  const toggleVehicle = useCallback(
    async (vehicle: Vehicle) => {
      if (!vehicle?.id) return;

      const exists = vehicles.some(
        (v) => v.id === vehicle.id || (vehicle.slug && v.slug === vehicle.slug)
      );

      if (exists) {
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

  /* ── Check Status ─────────────────────────────────────────────────────── */
  const isInComparison = useCallback(
    (vehicleId: string) => {
      if (!vehicleId) return false;
      return vehicles.some((v) => v.id === vehicleId || v.slug === vehicleId);
    },
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