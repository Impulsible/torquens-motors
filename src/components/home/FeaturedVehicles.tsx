'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { VehicleCard } from '@/components/vehicle/VehicleCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { IVehicle } from '@/types';
import { cn } from '@/utils/cn';

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

function normalizeVehicleForCard(vehicle: IVehicle) {
  const power =
    typeof vehicle.power === 'number'
      ? vehicle.power
      : typeof vehicle.horsepower === 'number'
        ? vehicle.horsepower
        : typeof vehicle.power === 'string'
          ? parseInt(vehicle.power, 10) || 0
          : 0;

  return {
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
    verified: vehicle.verified === 'VERIFIED' || vehicle.verified === true,
    status: vehicle.status,
    location: vehicle.location,
    power,
  };
}

interface FeaturedVehiclesProps {
  /** Optional live inventory from server — falls back to curated defaults */
  vehicles?: IVehicle[];
}

export function FeaturedVehicles({ vehicles: vehiclesProp }: FeaturedVehiclesProps) {
  const vehicles =
    vehiclesProp && vehiclesProp.length > 0 ? vehiclesProp : FEATURED_VEHICLES;

  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  const updateScrollState = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScroll = scrollWidth - clientWidth;

    setCanScrollLeft(scrollLeft > 8);
    setCanScrollRight(scrollLeft < maxScroll - 8);

    const card = el.querySelector<HTMLElement>('[data-featured-card]');
    const cardWidth = card?.offsetWidth ?? 300;
    const gap = 20;
    const index = Math.round(scrollLeft / (cardWidth + gap));
    setActiveIndex(Math.min(Math.max(index, 0), vehicles.length - 1));
  }, [vehicles.length]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    updateScrollState();
    el.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);

    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [updateScrollState]);

  const scrollByCards = (direction: 'left' | 'right') => {
    const el = scrollerRef.current;
    if (!el) return;

    const card = el.querySelector<HTMLElement>('[data-featured-card]');
    const amount = card ? card.offsetWidth + 20 : el.clientWidth * 0.85;

    el.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  const scrollToIndex = (index: number) => {
    const el = scrollerRef.current;
    if (!el) return;

    const card = el.querySelectorAll<HTMLElement>('[data-featured-card]')[index];
    if (!card) return;

    el.scrollTo({
      left: card.offsetLeft - 16,
      behavior: 'smooth',
    });
  };

  return (
    <section className="relative overflow-hidden border-b border-border/40 bg-obsidian py-16 sm:py-20 lg:py-24">
      {/* Showroom ambient light */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/5 blur-[160px]"
        style={{ width: 800, height: 400 }}
      />

      <div className="relative z-10">
        {/* ── Section header ── */}
        <div className="container-torquens mb-8 px-4 sm:mb-10 sm:px-6 lg:mb-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-3">
              <Badge variant="gold" size="sm">
                <span className="inline-flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3" />
                  Curated Collection
                </span>
              </Badge>
              <h2 className="font-serif text-3xl font-light tracking-tight text-primary sm:text-4xl md:text-5xl">
                Featured Allocations
              </h2>
              <p className="max-w-xl font-sans text-sm leading-relaxed text-secondary">
                Explore verified luxury assets available for immediate acquisition across Nigeria.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 self-start lg:self-auto">
              {/* Mobile-only carousel controls (hidden on md+ grid) */}
              <div className="flex items-center gap-2 md:hidden">
                <button
                  type="button"
                  aria-label="Previous featured vehicle"
                  onClick={() => scrollByCards('left')}
                  disabled={!canScrollLeft}
                  className={cn(
                    'flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border transition-all duration-300',
                    canScrollLeft
                      ? 'border-border bg-graphite text-primary hover:border-gold/50 hover:text-gold'
                      : 'cursor-not-allowed border-border/40 bg-charcoal/40 text-muted opacity-40'
                  )}
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Next featured vehicle"
                  onClick={() => scrollByCards('right')}
                  disabled={!canScrollRight}
                  className={cn(
                    'flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border transition-all duration-300',
                    canScrollRight
                      ? 'border-border bg-graphite text-primary hover:border-gold/50 hover:text-gold'
                      : 'cursor-not-allowed border-border/40 bg-charcoal/40 text-muted opacity-40'
                  )}
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
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
          </div>
        </div>

        {/* ── Adaptive vehicle stage ──
            Mobile (< md): horizontal snap rail + peek
            Desktop (md+): comparison grid 2 → 3 columns
        */}
        <div className="relative">
          {/* Mobile edge fades only */}
          <div
            aria-hidden
            className={cn(
              'pointer-events-none absolute inset-y-0 left-0 z-20 w-6 bg-linear-to-r from-obsidian via-obsidian/70 to-transparent transition-opacity duration-300 md:hidden',
              canScrollLeft ? 'opacity-100' : 'opacity-0'
            )}
          />
          <div
            aria-hidden
            className={cn(
              'pointer-events-none absolute inset-y-0 right-0 z-20 w-6 bg-linear-to-l from-obsidian via-obsidian/70 to-transparent transition-opacity duration-300 md:hidden',
              canScrollRight ? 'opacity-100' : 'opacity-0'
            )}
          />

          <div
            ref={scrollerRef}
            role="region"
            aria-label="Featured luxury vehicles"
            tabIndex={0}
            onKeyDown={(e) => {
              // Keyboard only useful in mobile rail mode
              if (typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches) {
                return;
              }
              if (e.key === 'ArrowLeft') {
                e.preventDefault();
                scrollByCards('left');
              }
              if (e.key === 'ArrowRight') {
                e.preventDefault();
                scrollByCards('right');
              }
            }}
            className={cn(
              // ── MOBILE: horizontal snap rail ──
              'flex gap-4 overflow-x-auto overflow-y-hidden pb-3 pt-1',
              'scroll-smooth snap-x snap-mandatory',
              'px-4 sm:gap-5 sm:px-6',
              '[-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40 focus-visible:ring-offset-2 focus-visible:ring-offset-obsidian',

              // ── DESKTOP: structured comparison grid ──
              'md:container-torquens md:grid md:grid-cols-2 md:gap-6 md:overflow-visible md:px-6 md:pb-0 lg:grid-cols-3 lg:gap-8'
            )}
          >
            {vehicles.map((vehicle, index) => (
              <div
                key={vehicle.id}
                data-featured-card
                className={cn(
                  // Mobile card width: ~85% viewport → next card peeks
                  'w-[min(85vw,320px)] shrink-0 snap-start sm:w-[min(72vw,340px)]',
                  // Desktop: fill grid cell
                  'md:w-full md:shrink md:snap-align-none',
                  'animate-in fade-in slide-in-from-bottom-2 duration-500'
                )}
                style={{ animationDelay: `${Math.min(index, 5) * 60}ms` }}
              >
                <VehicleCard
                  vehicle={normalizeVehicleForCard(vehicle) as any}
                  featured={index === 0}
                  priority={index < 3}
                />
              </div>
            ))}
          </div>
        </div>

        {/* ── Mobile progress only (hidden on desktop grid) ── */}
        <div className="container-torquens mt-5 flex items-center justify-between gap-4 px-4 sm:px-6 md:hidden">
          <div className="flex items-center gap-1.5" role="tablist" aria-label="Featured slide">
            {vehicles.map((v, i) => (
              <button
                key={v.id}
                type="button"
                role="tab"
                aria-selected={i === activeIndex}
                aria-label={`Show ${v.make} ${v.model}`}
                onClick={() => scrollToIndex(i)}
                className={cn(
                  'h-1.5 cursor-pointer rounded-full transition-all duration-300',
                  i === activeIndex ? 'w-6 bg-gold' : 'w-1.5 bg-border hover:bg-muted'
                )}
              />
            ))}
          </div>
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted">
            Swipe · {activeIndex + 1}/{vehicles.length}
          </p>
        </div>
      </div>
    </section>
  );
}

export default FeaturedVehicles;