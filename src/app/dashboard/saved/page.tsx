/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  BookmarkCheck, 
  ArrowLeft, 
  Heart, 
  Loader2,
  Car
} from 'lucide-react';
import { VehicleCard } from '@/components/vehicle/VehicleCard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { getSavedVehicles } from '@/actions/saved-vehicles';
import { useProfile } from '@/contexts/ProfileContext';
import { useToast } from '@/hooks/useToast';

interface SavedVehicleWithDetails {
  id: string;
  vehicle: {
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
    power: number;
  };
  savedAt: Date;
}

export default function SavedVehiclesPage() {
  const { profile, isLoading: profileLoading } = useProfile();
  const { showToast } = useToast();
  const [savedVehicles, setSavedVehicles] = useState<SavedVehicleWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSavedVehicles = useCallback(async () => {
    if (!profile) return;

    try {
      setLoading(true);
      setError(null);
      
      const result = await getSavedVehicles();
      
      if (result.success && Array.isArray(result.data)) {
        const mappedData = result.data
          .filter((item: any) => item && item.vehicle)
          .map((item: any) => ({
            id: item.id || item._id?.toString(),
            savedAt: item.savedAt || item.createdAt || new Date(),
            vehicle: {
              id: item.vehicle.id || item.vehicle._id?.toString() || '',
              slug: item.vehicle.slug || item.vehicle.id || `${item.vehicle.make}-${item.vehicle.model}-${item.vehicle.year}`,
              make: item.vehicle.make || 'Unknown Make',
              model: item.vehicle.model || 'Model',
              year: item.vehicle.year || new Date().getFullYear(),
              price: item.vehicle.price || 0,
              currency: item.vehicle.currency || 'NGN',
              mileage: item.vehicle.mileage || 0,
              images: item.vehicle.images || [],
              transmission: item.vehicle.transmission || 'Automatic',
              fuelType: item.vehicle.fuelType || 'Petrol',
              verified: item.vehicle.verified === 'VERIFIED' || item.vehicle.verified === true,
              status: item.vehicle.status || 'AVAILABLE',
              location: item.vehicle.location || 'Lagos, Nigeria',
              power: typeof item.vehicle.power === 'number' 
                ? item.vehicle.power 
                : typeof item.vehicle.horsepower === 'number'
                ? item.vehicle.horsepower
                : parseInt(item.vehicle.power || item.vehicle.horsepower, 10) || 300,
            }
          }));
        
        setSavedVehicles(mappedData);
      } else {
        const errorMessage = 'message' in result ? result.message : 'Failed to load saved vehicles';
        setError(errorMessage || 'Failed to load saved vehicles');
      }
    } catch (err) {
      console.error('Error loading saved vehicles:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    if (!profileLoading) {
      loadSavedVehicles();
    }
  }, [profileLoading, loadSavedVehicles]);

  const handleFavoriteToggle = async (vehicleId: string) => {
    try {
      // Optimistically remove from list
      setSavedVehicles((prev) => prev.filter((item) => item.vehicle.id !== vehicleId));
      
      showToast({
        type: 'info',
        title: 'Vault Updated',
        message: 'Vehicle removed from Vault',
      });
    } catch (err) {
      console.error('Failed to toggle save:', err);
      // Re-fetch on error
      loadSavedVehicles();
    }
  };

  if (profileLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="h-10 w-10 text-gold animate-spin" />
        <p className="text-xs text-muted font-mono uppercase tracking-widest">
          Loading Your Vault Collection...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 max-w-md text-center">
          <p className="text-sm font-medium">Failed to load saved vehicles</p>
          <p className="text-xs text-muted mt-1">{error}</p>
        </div>
        <Button variant="secondary" onClick={() => loadSavedVehicles()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <BookmarkCheck className="h-6 w-6 text-gold" />
            <h1 className="text-2xl sm:text-3xl font-serif font-light text-primary">
              Saved Vehicles
            </h1>
          </div>
          <p className="text-sm text-secondary font-sans">
            {savedVehicles.length === 0 
              ? 'Your saved collection is empty. Start exploring vehicles to build your private vault.' 
              : `You have ${savedVehicles.length} vehicle${savedVehicles.length > 1 ? 's' : ''} saved in your vault collection.`
            }
          </p>
        </div>

        <Link href="/vehicles">
          <Button variant="secondary" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Explore Showroom
          </Button>
        </Link>
      </div>

      {/* Saved Vehicles Grid */}
      {savedVehicles.length === 0 ? (
        <Card className="p-12 bg-graphite/50 border-dashed border-border flex flex-col items-center justify-center text-center min-h-62.5">
          <div className="w-20 h-20 rounded-full bg-charcoal flex items-center justify-center mb-4 border border-border/60">
            <Heart className="h-8 w-8 text-muted" />
          </div>
          <h3 className="text-xl font-serif text-primary mb-2">No Saved Vehicles</h3>
          <p className="text-sm text-secondary font-sans max-w-sm mb-6 leading-relaxed">
            You haven&apos;t saved any vehicles yet. Explore our curated selection of exceptional 
            vehicles and start building your collection.
          </p>
          <Link href="/vehicles">
            <Button variant="gold" leftIcon={<Car className="h-4 w-4" />}>
              Browse Vehicles
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedVehicles.map((item) => (
            <div key={item.id} className="animate-in fade-in slide-in-from-bottom-3 duration-300">
              <VehicleCard
                vehicle={item.vehicle}
                featured={false}
                showCompare={true}
                showSave={true}
                isFavorited={true}
                onFavoriteToggle={() => handleFavoriteToggle(item.vehicle.id)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}