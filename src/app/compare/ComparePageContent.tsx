'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  X,
  Plus,
  Trash2,
  TrendingUp,
  Zap,
  Gauge,
  Sparkles,
  ArrowUpRight,
  Scale,
} from 'lucide-react';

import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Price } from '@/components/ui/Price';
import { EmptyState } from '@/components/ui/EmptyState';
import { useComparison } from '@/contexts/ComparisonContext';
import { formatCurrency } from '@/utils/helpers';
import { cn } from '@/utils/cn';

interface SpecRowConfig {
  key: string;
  label: string;
  unit?: string;
  type: 'price' | 'number' | 'text' | 'badge';
  bestMode?: 'lowest' | 'highest' | 'newest';
}

const COMPARISON_SPECS: SpecRowConfig[] = [
  { key: 'price', label: 'Acquisition Price', type: 'price', bestMode: 'lowest' },
  { key: 'year', label: 'Model Year', type: 'number', bestMode: 'newest' },
  { key: 'mileage', label: 'Odometer', unit: 'KM', type: 'number', bestMode: 'lowest' },
  { key: 'power', label: 'Power Output', unit: 'BHP', type: 'number', bestMode: 'highest' },
  { key: 'transmission', label: 'Gearbox Spec', type: 'text' },
  { key: 'fuelType', label: 'Powertrain', type: 'text' },
  { key: 'drivetrain', label: 'Drivetrain', type: 'text' },
  { key: 'bodyType', label: 'Body Style', type: 'text' },
  { key: 'location', label: 'Showroom Location', type: 'text' },
  { key: 'verified', label: 'Provenance', type: 'badge' },
];

export default function ComparePageContent() {
  const { vehicles, removeVehicle, clearComparison, count, maxVehicles } = useComparison();

  const highlights = useMemo(() => {
    if (vehicles.length < 2) return { lowestPriceId: null, highestPowerId: null, lowestMileageId: null };

    let lowestPriceId = vehicles[0].id;
    let highestPowerId = vehicles[0].id;
    let lowestMileageId = vehicles[0].id;

    let minPrice = vehicles[0].price;
    let maxPower = 0;
    let minMileage = vehicles[0].mileage;

    vehicles.forEach((v) => {
      if (v.price < minPrice) {
        minPrice = v.price;
        lowestPriceId = v.id;
      }
      const power = v.power || 0;
      if (power > maxPower) {
        maxPower = power;
        highestPowerId = v.id;
      }
      if (v.mileage < minMileage) {
        minMileage = v.mileage;
        lowestMileageId = v.id;
      }
    });

    return { lowestPriceId, highestPowerId, lowestMileageId };
  }, [vehicles]);

  if (vehicles.length === 0) {
    return (
      <main className="min-h-[85vh] flex items-center justify-center pt-24 pb-16 bg-obsidian">
        <Container size="sm">
          <EmptyState
            variant="glass"
            size="lg"
            eyebrow="COMPARATIVE TELEMETRY"
            title="No Vehicles Selected for Comparison"
            description="Select up to 4 luxury vehicles or allocations from the catalogue to compare side-by-side mechanical specs, power outputs, and valuation."
            icon={<Scale className="h-8 w-8 text-gold" />}
            action={{
              label: 'Browse Vehicle Catalogue',
              href: '/vehicles',
              variant: 'primary',
              icon: <ArrowUpRight className="h-4 w-4" />,
            }}
          />
        </Container>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-20 pb-20 bg-obsidian">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed top-1/4 left-1/2 -translate-x-1/2 w-200 h-125 bg-gold/5 blur-[140px] rounded-full"
      />

      <Container size="2xl" className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pt-4">
          <div className="space-y-2">
            <Link
              href="/vehicles"
              className="inline-flex items-center gap-1.5 text-xs text-secondary hover:text-gold gold-underline transition-colors font-medium"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Return to Catalogue</span>
            </Link>

            <div className="flex items-center gap-2.5">
              <Badge variant="gold" size="sm" leftIcon={<Sparkles className="h-3 w-3" />}>
                Comparative Matrix
              </Badge>
              <span className="text-xs font-mono text-muted uppercase tracking-wider">
                {count} of {maxVehicles} Slots Filled
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-primary tracking-tight">
              Comparative Telemetry
            </h1>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {count < maxVehicles && (
              <Link href="/vehicles">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Plus className="h-3.5 w-3.5" />}
                >
                  Add Vehicle ({maxVehicles - count} open)
                </Button>
              </Link>
            )}

            <Button
              variant="danger"
              size="sm"
              onClick={clearComparison}
              leftIcon={<Trash2 className="h-3.5 w-3.5" />}
            >
              Clear All
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border/80 bg-graphite/50 backdrop-blur-xl shadow-dropdown">
          <div className="min-w-225">
            <div className="grid grid-cols-[200px_repeat(auto-fit,minmax(200px,1fr))] gap-4 p-5 border-b border-border/80 bg-graphite/90 sticky top-16 z-30 backdrop-blur-md">
              <div className="flex flex-col justify-end">
                <span className="text-[10px] font-mono uppercase tracking-widest text-gold font-semibold">
                  Specification Index
                </span>
                <span className="text-xs text-muted font-sans mt-0.5">
                  Side-by-side technical breakdown
                </span>
              </div>

              {vehicles.map((vehicle) => {
                const isVerified = vehicle.verified === 'VERIFIED' || vehicle.verified === true;
                return (
                  <div key={vehicle.id} className="relative group">
                    <Card
                      variant="glass"
                      padding="sm"
                      className="relative overflow-hidden border-border/80 hover:border-gold/40 transition-colors"
                    >
                      <button
                        type="button"
                        onClick={() => removeVehicle(vehicle.id)}
                        aria-label={`Remove ${vehicle.make} ${vehicle.model} from comparison`}
                        className="absolute top-2 right-2 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-obsidian/80 text-muted hover:text-red-400 hover:bg-obsidian border border-border transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>

                      <div className="relative aspect-16/10 rounded-md overflow-hidden bg-charcoal mb-3">
                        {vehicle.images?.[0] ? (
                          <Image
                            src={vehicle.images[0]}
                            alt={`${vehicle.make} ${vehicle.model}`}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="250px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-muted font-mono">
                            No Image
                          </div>
                        )}

                        {isVerified && (
                          <div className="absolute top-2 left-2 z-10">
                            <Badge variant="success" size="sm">✓</Badge>
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-gold font-sans block">
                          {vehicle.make}
                        </span>

                        <h3 className="font-serif text-base font-normal text-primary line-clamp-1">
                          {vehicle.model}
                        </h3>

                        <Price
                          amount={vehicle.price}
                          currency={vehicle.currency || 'USD'}
                          size="sm"
                          variant="primary"
                        />
                      </div>

                      <div className="mt-3 pt-2 border-t border-border/60">
                        <Link href={`/vehicles/${vehicle.slug}`} className="block">
                          <Button
                            variant="ghost"
                            size="sm"
                            fullWidth
                            rightIcon={<ArrowUpRight className="h-3 w-3" />}
                          >
                            Dossier
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  </div>
                );
              })}
            </div>

            <div className="divide-y divide-border/60">
              {COMPARISON_SPECS.map((spec, specIdx) => (
                <div
                  key={spec.key}
                  className={cn(
                    'grid grid-cols-[200px_repeat(auto-fit,minmax(200px,1fr))] gap-4 p-4 items-center transition-colors',
                    specIdx % 2 === 0 ? 'bg-charcoal/30' : 'bg-transparent'
                  )}
                >
                  <div className="text-xs uppercase tracking-wider font-semibold text-secondary font-sans">
                    {spec.label}
                  </div>

                  {vehicles.map((vehicle) => {
                    let rawVal: any;
                    if (spec.key === 'power') {
                      rawVal = vehicle.power || 0;
                    } else if (spec.key === 'verified') {
                      rawVal = vehicle.verified || false;
                    } else {
                      rawVal = (vehicle as any)[spec.key];
                    }
                    
                    let isBest = false;

                    if (spec.bestMode === 'lowest' && spec.key === 'price') {
                      isBest = vehicle.id === highlights.lowestPriceId && vehicles.length > 1;
                    } else if (spec.bestMode === 'highest' && spec.key === 'power') {
                      isBest = vehicle.id === highlights.highestPowerId && vehicles.length > 1;
                    } else if (spec.bestMode === 'lowest' && spec.key === 'mileage') {
                      isBest = vehicle.id === highlights.lowestMileageId && vehicles.length > 1;
                    }

                    return (
                      <div
                        key={`${vehicle.id}-${spec.key}`}
                        className={cn(
                          'flex items-center gap-1.5 text-sm font-sans',
                          isBest ? 'font-semibold text-gold' : 'text-primary'
                        )}
                      >
                        {spec.type === 'price' && (
                          <Price
                            amount={rawVal}
                            currency={vehicle.currency || 'USD'}
                            size="sm"
                            variant={isBest ? 'gold' : 'primary'}
                          />
                        )}

                        {spec.type === 'number' && (
                          <span className="font-mono">
                            {typeof rawVal === 'number' ? rawVal.toLocaleString() : rawVal || '—'}
                            {spec.unit && (
                              <span className="ml-1 text-xs text-secondary font-sans">
                                {spec.unit}
                              </span>
                            )}
                          </span>
                        )}

                        {spec.type === 'text' && <span>{rawVal || '—'}</span>}

                        {spec.type === 'badge' && (
                          <Badge
                            variant={rawVal === 'VERIFIED' || rawVal === true ? 'success' : 'default'}
                            size="sm"
                          >
                            {rawVal === 'VERIFIED' || rawVal === true ? 'Verified' : 'Unverified'}
                          </Badge>
                        )}

                        {isBest && (
                          <Badge
                            variant="gold"
                            size="sm"
                            leftIcon={<Sparkles className="h-2.5 w-2.5" />}
                            className="ml-auto"
                          >
                            Best
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {vehicles.length > 1 && (
          <div className="mt-10">
            <Card variant="glass" specular ambientGlow padding="lg">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-4 w-4 text-gold" />
                <h3 className="font-serif text-xl font-normal text-primary">
                  Comparative Insights
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {highlights.lowestPriceId && (
                  <div className="p-4 rounded-lg bg-inset border border-border/60 flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-gold/10 text-gold border border-gold/20">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="block text-xs uppercase tracking-wider font-semibold text-muted font-sans">
                        Lowest Acquisition Cost
                      </span>
                      <span className="font-serif text-base text-primary font-medium block mt-0.5">
                        {vehicles.find((v) => v.id === highlights.lowestPriceId)?.make}{' '}
                        {vehicles.find((v) => v.id === highlights.lowestPriceId)?.model}
                      </span>
                      <span className="text-xs font-mono text-gold font-semibold">
                        {formatCurrency(
                          vehicles.find((v) => v.id === highlights.lowestPriceId)?.price || 0,
                          'USD'
                        )}
                      </span>
                    </div>
                  </div>
                )}

                {highlights.highestPowerId && (
                  <div className="p-4 rounded-lg bg-inset border border-border/60 flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-gold/10 text-gold border border-gold/20">
                      <Zap className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="block text-xs uppercase tracking-wider font-semibold text-muted font-sans">
                        Peak Power Output
                      </span>
                      <span className="font-serif text-base text-primary font-medium block mt-0.5">
                        {vehicles.find((v) => v.id === highlights.highestPowerId)?.make}{' '}
                        {vehicles.find((v) => v.id === highlights.highestPowerId)?.model}
                      </span>
                      <span className="text-xs font-mono text-gold font-semibold">
                        {vehicles.find((v) => v.id === highlights.highestPowerId)?.power || 0} BHP
                      </span>
                    </div>
                  </div>
                )}

                {highlights.lowestMileageId && (
                  <div className="p-4 rounded-lg bg-inset border border-border/60 flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-emerald-bg text-emerald border border-emerald-border">
                      <Gauge className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="block text-xs uppercase tracking-wider font-semibold text-muted font-sans">
                        Lowest Odometer
                      </span>
                      <span className="font-serif text-base text-primary font-medium block mt-0.5">
                        {vehicles.find((v) => v.id === highlights.lowestMileageId)?.make}{' '}
                        {vehicles.find((v) => v.id === highlights.lowestMileageId)?.model}
                      </span>
                      <span className="text-xs font-mono text-emerald font-semibold">
                        {vehicles.find((v) => v.id === highlights.lowestMileageId)?.mileage.toLocaleString()} KM
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </Container>
    </main>
  );
}