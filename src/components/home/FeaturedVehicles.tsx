'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

import { VehicleCard, type Vehicle } from '@/components/vehicle/VehicleCard';
import { VehicleCardSkeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';

/* -------------------------------------------------------------------------- */
/*                              MOCK INVENTORY DATA                           */
/* -------------------------------------------------------------------------- */

const MOCK_FEATURED_VEHICLES: Vehicle[] = [
  {
    id: '1',
    slug: 'porsche-911-gt3-rs-2024',
    make: 'Porsche',
    model: '911 GT3 RS (992)',
    year: 2024,
    price: 315000,
    currency: 'USD',
    mileage: 1200,
    images: [
      'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=1200&auto=format&fit=crop',
    ],
    transmission: 'Dual-Clutch (PDK)',
    fuelType: 'Petrol',
    verified: 'VERIFIED',
    status: 'AVAILABLE',
    location: 'Mayfair, London',
  },
  {
    id: '2',
    slug: 'ferrari-812-gts-2023',
    make: 'Ferrari',
    model: '812 GTS V12',
    year: 2023,
    price: 440000,
    currency: 'USD',
    mileage: 3400,
    images: [
      'https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=1200&auto=format&fit=crop',
    ],
    transmission: '7-Speed F1 DCT',
    fuelType: 'Petrol',
    verified: 'VERIFIED',
    status: 'AVAILABLE',
    location: 'Zurich, Switzerland',
  },
  {
    id: '3',
    slug: 'aston-martin-dbs-superleggera',
    make: 'Aston Martin',
    model: 'DBS Superleggera Volante',
    year: 2023,
    price: 320000,
    currency: 'USD',
    mileage: 4800,
    images: [
      'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=1200&auto=format&fit=crop',
    ],
    transmission: '8-Speed Automatic',
    fuelType: 'Petrol',
    verified: 'VERIFIED',
    status: 'ALLOCATION',
    location: 'Monaco',
  },
  {
    id: '4',
    slug: 'lamborghini-revuelto-2024',
    make: 'Lamborghini',
    model: 'Revuelto',
    year: 2024,
    price: 608000,
    currency: 'USD',
    mileage: 450,
    images: [
      'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?q=80&w=1200&auto=format&fit=crop',
    ],
    transmission: '8-Speed Dual-Clutch',
    fuelType: 'Hybrid',
    verified: 'VERIFIED',
    status: 'AVAILABLE',
    location: 'Dubai, UAE',
  },
  {
    id: '5',
    slug: 'rolls-royce-spectre-2024',
    make: 'Rolls-Royce',
    model: 'Spectre',
    year: 2024,
    price: 420000,
    currency: 'USD',
    mileage: 800,
    images: [
      'https://images.unsplash.com/photo-1631295868223-63265b40d9e4?q=80&w=1200&auto=format&fit=crop',
    ],
    transmission: 'Single-Speed Fixed',
    fuelType: 'Electric',
    verified: 'VERIFIED',
    status: 'RESERVED',
    location: 'Mayfair, London',
  },
  {
    id: '6',
    slug: 'mclaren-765lt-spider',
    make: 'McLaren',
    model: '765LT Spider',
    year: 2023,
    price: 385000,
    currency: 'USD',
    mileage: 2100,
    images: [
      'https://images.unsplash.com/photo-1621135802920-133df287f89c?q=80&w=1200&auto=format&fit=crop',
    ],
    transmission: '7-Speed SSG',
    fuelType: 'Petrol',
    verified: 'VERIFIED',
    status: 'AVAILABLE',
    location: 'Milan, Italy',
  },
];

/* -------------------------------------------------------------------------- */
/*                          FEATURED VEHICLES ROOT                            */
/* -------------------------------------------------------------------------- */

export function FeaturedVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeDot, setActiveDot] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Simulate API Fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      setVehicles(MOCK_FEATURED_VEHICLES);
      setLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Track scroll position for nav buttons & progress dots
  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 8);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 8);

    // Calculate active progress dot
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll > 0) {
      const progress = scrollLeft / maxScroll;
      const totalDots = Math.max(1, vehicles.length - 2);
      setActiveDot(Math.round(progress * (totalDots - 1)));
    }
  }, [vehicles.length]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    el.addEventListener('scroll', updateScrollState, { passive: true });
    updateScrollState();

    // Recalculate on resize
    window.addEventListener('resize', updateScrollState);
    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [updateScrollState, loading]);

  // Smooth scroll by one card width
  const scrollBy = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;

    const cardWidth = el.querySelector('[data-vehicle-card]')?.clientWidth || 360;
    const gap = 24;
    const offset = direction === 'left' ? -(cardWidth + gap) : cardWidth + gap;

    el.scrollBy({ left: offset, behavior: 'smooth' });
  };

  const totalDots = Math.max(1, vehicles.length - 2);

  return (
    <section className="relative py-16 md:py-24 bg-graphite overflow-hidden">
      {/* Ambient Background Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 right-0 w-150 h-100 bg-gold/5 blur-[120px] rounded-full"
      />

      <div className="container-torquens relative z-10">
        {/* ───────────────────────────────────────────────────────────── */}
        {/* HEADER: Title + Navigation Controls                           */}
        {/* ───────────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <Badge
                variant="gold"
                size="sm"
                leftIcon={<Sparkles className="h-3 w-3" />}
              >
                Curated Allocations
              </Badge>
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-muted font-mono uppercase tracking-wider">
                <ShieldCheck className="h-3 w-3 text-emerald" />
                {loading ? '—' : vehicles.length} Verified Units
              </span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-primary leading-tight">
              Exceptional Vehicles
            </h2>
            <p className="text-secondary text-sm md:text-base font-sans max-w-lg leading-relaxed">
              Hand-selected from our global inventory. Every chassis verified for provenance, condition, and authenticity.
            </p>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Progress Dots */}
            {!loading && vehicles.length > 3 && (
              <div className="hidden sm:flex items-center gap-1.5 mr-2">
                {Array.from({ length: totalDots }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Go to slide group ${i + 1}`}
                    onClick={() => {
                      const el = scrollRef.current;
                      if (!el) return;
                      const maxScroll = el.scrollWidth - el.clientWidth;
                      const target = totalDots > 1 ? (i / (totalDots - 1)) * maxScroll : 0;
                      el.scrollTo({ left: target, behavior: 'smooth' });
                    }}
                    className={cn(
                      'h-1.5 rounded-full transition-all duration-300',
                      activeDot === i
                        ? 'w-6 bg-gold'
                        : 'w-1.5 bg-border hover:bg-secondary'
                    )}
                  />
                ))}
              </div>
            )}

            {/* Prev / Next Buttons */}
            <button
              type="button"
              onClick={() => scrollBy('left')}
              disabled={!canScrollLeft || loading}
              aria-label="Previous vehicles"
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-md border transition-all duration-300',
                canScrollLeft && !loading
                  ? 'border-border text-secondary hover:border-gold hover:text-gold hover:bg-gold/5 hover:shadow-goldGlowSm'
                  : 'border-border/50 text-muted/40 cursor-not-allowed'
              )}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={() => scrollBy('right')}
              disabled={!canScrollRight || loading}
              aria-label="Next vehicles"
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-md border transition-all duration-300',
                canScrollRight && !loading
                  ? 'border-border text-secondary hover:border-gold hover:text-gold hover:bg-gold/5 hover:shadow-goldGlowSm'
                  : 'border-border/50 text-muted/40 cursor-not-allowed'
              )}
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            {/* View All CTA */}
            <Link href="/vehicles" className="hidden sm:block ml-1">
              <Button
                variant="outline"
                size="sm"
                rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
              >
                View All
              </Button>
            </Link>
          </div>
        </div>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* HORIZONTAL SCROLL CAROUSEL                                    */}
        {/* ───────────────────────────────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <VehicleCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="relative">
            {/* Fade Edges */}
            <div
              aria-hidden="true"
              className={cn(
                'pointer-events-none absolute left-0 top-0 bottom-4 w-8 bg-linear-to-r from-graphite to-transparent z-10 transition-opacity duration-300',
                canScrollLeft ? 'opacity-100' : 'opacity-0'
              )}
            />
            <div
              aria-hidden="true"
              className={cn(
                'pointer-events-none absolute right-0 top-0 bottom-4 w-8 bg-linear-to-l from-graphite to-transparent z-10 transition-opacity duration-300',
                canScrollRight ? 'opacity-100' : 'opacity-0'
              )}
            />

            {/* Scroll Track */}
            <div
              ref={scrollRef}
              className="flex gap-6 overflow-x-auto scroll-smooth pb-4 snap-x snap-mandatory no-scrollbar"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {vehicles.map((vehicle, index) => (
                <div
                  key={vehicle.id}
                  data-vehicle-card
                  className="min-w-75 w-[calc(100%-1.5rem)] sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] snap-start shrink-0"
                >
                  <VehicleCard
                    vehicle={vehicle}
                    featured
                    priority={index < 3}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mobile View All */}
        <div className="mt-8 flex justify-center sm:hidden">
          <Link href="/vehicles">
            <Button
              variant="outline"
              size="md"
              fullWidth
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Explore Full Inventory
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}