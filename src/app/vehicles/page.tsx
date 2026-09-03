import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { Badge } from '@/components/ui/Badge';
import { VehicleFilters } from '@/components/vehicle/VehicleFilters';
import { VehicleGrid } from '@/components/vehicle/VehicleGrid';
import { VehicleSort } from '@/components/vehicle/VehicleSort';
import * as VehicleService from '@/services/vehicle.service';
import { CatalogueSearch } from '@/components/vehicle/CatalogueSearch';
import { Sparkles, ShieldCheck, Car, Layers } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Curated Vehicle Catalogue | TORQUENS MOTORS',
  description:
    'Explore our sovereign private registry of verified hypercars, historical competition chassis, and coachbuilt grand tourers.',
  keywords: 'luxury cars, hypercars, competition chassis, vehicle catalogue, verified provenance, TORQUENS',
};

async function getFilterOptions() {
  try {
    const [makes, stats] = await Promise.all([
      VehicleService.getVehicleMakes(),
      VehicleService.getVehicleStats(),
    ]);

    const makeOptions = makes.map((make: string) => ({
      label: make,
      value: make,
    }));

    const bodyTypes = [
      { label: 'Coupe', value: 'Coupe' },
      { label: 'Sedan', value: 'Sedan' },
      { label: 'SUV', value: 'SUV' },
      { label: 'Convertible', value: 'Convertible' },
      { label: 'Hypercar', value: 'Hypercar' },
      { label: 'Wagon', value: 'Wagon' },
    ];

    const fuelTypes = [
      { label: 'Petrol', value: 'Petrol' },
      { label: 'Hybrid', value: 'Hybrid' },
      { label: 'Electric', value: 'Electric' },
    ];

    const transmissions = [
      { label: 'Manual', value: 'Manual' },
      { label: 'Automatic', value: 'Automatic' },
      { label: 'Dual-Clutch', value: 'Dual-Clutch' },
      { label: 'Semi-Automatic', value: 'Semi-Automatic' },
    ];

    const drivetrains = [
      { label: 'RWD', value: 'RWD' },
      { label: 'AWD', value: 'AWD' },
      { label: '4WD', value: '4WD' },
      { label: 'FWD', value: 'FWD' },
    ];

    const locations = [
      { label: 'Lagos, Nigeria', value: 'Lagos' },
      { label: 'Abuja, Nigeria', value: 'Abuja' },
      { label: 'Geneva Freeport', value: 'Geneva' },
      { label: 'London, UK', value: 'London' },
    ];

    return {
      makes: makeOptions,
      models: [],
      bodyTypes,
      fuelTypes,
      transmissions,
      drivetrains,
      locations,
      stats,
    };
  } catch (error) {
    console.error('Error fetching catalogue filter options:', error);
    return {
      makes: [],
      models: [],
      bodyTypes: [],
      fuelTypes: [],
      transmissions: [],
      drivetrains: [],
      locations: [],
      stats: null,
    };
  }
}

function VehicleGridFallback() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="bg-graphite border border-border/70 rounded-xl overflow-hidden animate-pulse">
          <div className="aspect-16/10 w-full bg-obsidian/60" />
          <div className="p-4 space-y-3">
            <div className="h-4 w-24 bg-obsidian/80 rounded" />
            <div className="h-6 w-3/4 bg-obsidian/80 rounded" />
            <div className="h-5 w-1/3 bg-obsidian/80 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function VehiclesPage() {
  const filterOptions = await getFilterOptions();
  const totalCount = filterOptions.stats?.total || 32;

  return (
    <main className="min-h-screen bg-obsidian pt-16 sm:pt-20 text-primary selection:bg-gold/20 selection:text-gold">
      {/* CATALOGUE DOSSIER HEADER */}
      <section className="relative border-b border-border/70 bg-graphite overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 right-1/4 w-125 h-55 bg-gold/5 blur-[100px] rounded-full"
        />

        <Container size="lg" className="py-8 md:py-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="gold" size="sm" leftIcon={<Sparkles className="h-3 w-3" />}>
                  Curated Inventory
                </Badge>
                <Badge variant="success" size="sm" leftIcon={<ShieldCheck className="h-3 w-3" />} dot>
                  Verified Provenance
                </Badge>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-primary tracking-tight">
                Vehicle Catalogue
              </h1>

              <p className="text-secondary text-sm md:text-base font-sans leading-relaxed">
                Discover{' '}
                <span className="text-gold font-mono font-semibold tabular-nums">
                  {totalCount.toLocaleString()}
                </span>{' '}
                exceptional vehicles selected for authenticity, performance, and heritage.
              </p>
            </div>

            <div className="w-full md:w-80 shrink-0">
              <Suspense fallback={<div className="h-11 w-full bg-graphite/60 border border-border/70 rounded-lg animate-pulse" />}>
                <CatalogueSearch />
              </Suspense>
            </div>
          </div>

          {/* Quick HUD Strip */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-border/50">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-obsidian/40 border border-border/60">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-graphite text-gold border border-border">
                <Car className="h-4 w-4" />
              </div>
              <div>
                <span className="block text-[9px] uppercase tracking-wider text-muted font-mono font-semibold">
                  Total Units
                </span>
                <span className="font-mono text-sm font-semibold text-primary">
                  {totalCount.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-obsidian/40 border border-border/60">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-graphite text-emerald-400 border border-border">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <span className="block text-[9px] uppercase tracking-wider text-muted font-mono font-semibold">
                  Verification
                </span>
                <span className="font-mono text-sm font-semibold text-emerald-400">
                  100% Guaranteed
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-obsidian/40 border border-border/60">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-graphite text-gold border border-border">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <span className="block text-[9px] uppercase tracking-wider text-muted font-mono font-semibold">
                  Marques
                </span>
                <span className="font-mono text-sm font-semibold text-primary">
                  {filterOptions.makes.length || 14}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-obsidian/40 border border-border/60">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-graphite text-secondary border border-border">
                <Layers className="h-4 w-4" />
              </div>
              <div>
                <span className="block text-[9px] uppercase tracking-wider text-muted font-mono font-semibold">
                  Styles
                </span>
                <span className="font-mono text-sm font-semibold text-primary">
                  {filterOptions.bodyTypes.length}
                </span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* CATALOGUE LAYOUT */}
      <Container size="lg" className="py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <aside className="hidden lg:block w-72 shrink-0 sticky top-28 space-y-4">
            <Suspense fallback={<div className="h-96 bg-graphite border border-border/70 rounded-xl animate-pulse" />}>
              <VehicleFilters
                makes={filterOptions.makes}
                models={filterOptions.models}
                bodyTypes={filterOptions.bodyTypes}
                fuelTypes={filterOptions.fuelTypes}
                transmissions={filterOptions.transmissions}
                drivetrains={filterOptions.drivetrains}
                locations={filterOptions.locations}
              />
            </Suspense>
          </aside>

          <div className="flex-1 min-w-0 w-full space-y-6">
            <div className="flex items-center justify-between p-3.5 rounded-lg bg-graphite border border-border/70">
              <p className="text-xs sm:text-sm text-secondary font-sans">
                Displaying <span className="text-primary font-semibold font-mono">curated allocations</span>
              </p>
              <Suspense fallback={<div className="h-10 w-32 bg-obsidian/60 border border-border/70 rounded-lg animate-pulse" />}>
                <VehicleSort />
              </Suspense>
            </div>

            <Suspense fallback={<VehicleGridFallback />}>
              <VehicleGrid />
            </Suspense>
          </div>
        </div>

        <div className="lg:hidden mt-8">
          <Suspense fallback={<div className="h-96 bg-graphite border border-border/70 rounded-xl animate-pulse" />}>
            <VehicleFilters
              makes={filterOptions.makes}
              models={filterOptions.models}
              bodyTypes={filterOptions.bodyTypes}
              fuelTypes={filterOptions.fuelTypes}
              transmissions={filterOptions.transmissions}
              drivetrains={filterOptions.drivetrains}
              locations={filterOptions.locations}
            />
          </Suspense>
        </div>
      </Container>
    </main>
  );
}