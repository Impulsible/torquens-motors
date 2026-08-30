/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { VehicleCard } from '@/components/vehicle/VehicleCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { IVehicle } from '@/types';

const FEATURED_VEHICLES: IVehicle[] = [
  {
    id: '1',
    slug: 'porsche-cayenne-turbo-gt-2024',
    make: 'Porsche',
    model: 'Cayenne Turbo GT',
    year: 2024,
    price: 285000000,
    currency: 'NGN',
    mileage: 1200,
    images: [
      'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=1200&auto=format&fit=crop',
    ],
    transmission: 'Automatic',
    fuelType: 'Petrol',
    power: '650 HP',
    horsepower: 650,
    verified: 'VERIFIED',
    status: 'AVAILABLE',
    location: 'Lagos, Nigeria',
  },
  {
    id: '2',
    slug: 'mercedes-amg-g63-2023',
    make: 'Mercedes-Benz',
    model: 'AMG G 63',
    year: 2023,
    price: 340000000,
    currency: 'NGN',
    mileage: 4500,
    images: [
      'https://images.unsplash.com/photo-1520031441872-265e4ff70366?q=80&w=1200&auto=format&fit=crop',
    ],
    transmission: 'Automatic',
    fuelType: 'Petrol',
    power: '585 HP',
    horsepower: 585,
    verified: 'VERIFIED',
    status: 'AVAILABLE',
    location: 'Abuja, Nigeria',
  },
  {
    id: '3',
    slug: 'range-rover-autobiography-2024',
    make: 'Land Rover',
    model: 'Range Rover Autobiography',
    year: 2024,
    price: 310000000,
    currency: 'NGN',
    mileage: 800,
    images: [
      'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?q=80&w=1200&auto=format&fit=crop',
    ],
    transmission: 'Automatic',
    fuelType: 'Hybrid',
    power: '530 HP',
    horsepower: 530,
    verified: 'VERIFIED',
    status: 'AVAILABLE',
    location: 'Lagos, Nigeria',
  },
  {
    id: '4',
    slug: 'ferrari-f8-tributo-2022',
    make: 'Ferrari',
    model: 'F8 Tributo',
    year: 2022,
    price: 450000000,
    currency: 'NGN',
    mileage: 2100,
    images: [
      'https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=1200&auto=format&fit=crop',
    ],
    transmission: 'Automatic',
    fuelType: 'Petrol',
    power: '710 HP',
    horsepower: 710,
    verified: 'VERIFIED',
    status: 'AVAILABLE',
    location: 'Lagos, Nigeria',
  },
  {
    id: '5',
    slug: 'lamborghini-urus-performante-2023',
    make: 'Lamborghini',
    model: 'Urus Performante',
    year: 2023,
    price: 420000000,
    currency: 'NGN',
    mileage: 3200,
    images: [
      'https://images.unsplash.com/photo-1621135802920-133df287f89c?q=80&w=1200&auto=format&fit=crop',
    ],
    transmission: 'Automatic',
    fuelType: 'Petrol',
    power: '666 HP',
    horsepower: 666,
    verified: 'VERIFIED',
    status: 'AVAILABLE',
    location: 'Abuja, Nigeria',
  },
  {
    id: '6',
    slug: 'rolls-royce-cullinan-2023',
    make: 'Rolls-Royce',
    model: 'Cullinan',
    year: 2023,
    price: 580000000,
    currency: 'NGN',
    mileage: 1500,
    images: [
      'https://images.unsplash.com/photo-1631295868223-63265b40d9e4?q=80&w=1200&auto=format&fit=crop',
    ],
    transmission: 'Automatic',
    fuelType: 'Petrol',
    power: '563 HP',
    horsepower: 563,
    verified: 'VERIFIED',
    status: 'AVAILABLE',
    location: 'Lagos, Nigeria',
  },
];

export function FeaturedVehicles() {
  return (
    <section className="py-20 bg-obsidian border-b border-border/40 relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-100 bg-gold/5 blur-[160px] rounded-full"
      />

      <div className="container-torquens px-4 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-3">
            <Badge variant="gold" size="sm">
              <span className="inline-flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" />
                Curated Collection
              </span>
            </Badge>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-primary">
              Featured Allocations
            </h2>
            <p className="text-sm text-secondary font-sans max-w-xl leading-relaxed">
              Explore verified luxury assets available for immediate acquisition across Nigeria.
            </p>
          </div>

          <Link href="/vehicles">
            <Button
              variant="outline"
              size="md"
              rightIcon={<ArrowRight className="h-4 w-4" />}
              className="w-fit"
            >
              View Full Inventory
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {FEATURED_VEHICLES.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle as any} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturedVehicles;