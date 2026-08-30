import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { Badge } from '@/components/ui/Badge';
import { VehicleFilters } from '@/components/vehicle/VehicleFilters';
import { VehicleGrid } from '@/components/vehicle/VehicleGrid';
import { VehicleSort } from '@/components/vehicle/VehicleSort';
import * as VehicleService from '@/services/vehicle.service';
import { CatalogueSearch } from '@/components/vehicle/CatalogueSearch';
import { Sparkles, ShieldCheck, Car, Layers } from 'lucide-react';

/* -------------------------------------------------------------------------- */
/*                                  METADATA                                  */
/* -------------------------------------------------------------------------- */

export const metadata: Metadata = {
  title: 'Vehicle Catalogue | TORQUENS MOTORS',
  description:
    'Explore our curated collection of exceptional vehicles. Find luxury cars, SUVs, and performance vehicles from verified dealers.',
  keywords: 'luxury cars, vehicle catalogue, premium vehicles, TORQUENS',
};

/* -------------------------------------------------------------------------- */
/*                           SERVER FILTER HYDRATION                          */
/* -------------------------------------------------------------------------- */

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
      { label: 'Sedan', value: 'Sedan' },
      { label: 'SUV', value: 'SUV' },
      { label: 'Coupe', value: 'Coupe' },
      { label: 'Convertible', value: 'Convertible' },
      { label: 'Wagon', value: 'Wagon' },
      { label: 'Hatchback', value: 'Hatchback' },
    ];

    const fuelTypes = [
      { label: 'Petrol', value: 'Petrol' },
      { label: 'Diesel', value: 'Diesel' },
      { label: 'Electric', value: 'Electric' },
      { label: 'Hybrid', value: 'Hybrid' },
      { label: 'Plug-in Hybrid', value: 'Plug-in Hybrid' },
    ];

    const transmissions = [
      { label: 'Automatic', value: 'Automatic' },
      { label: 'Manual', value: 'Manual' },
      { label: 'Semi-Automatic', value: 'Semi-Automatic' },
    ];

    const drivetrains = [
      { label: 'FWD', value: 'FWD' },
      { label: 'RWD', value: 'RWD' },
      { label: 'AWD', value: 'AWD' },
      { label: '4WD', value: '4WD' },
    ];

    const locations = [
      { label: 'Lagos', value: 'Lagos' },
      { label: 'Abuja', value: 'Abuja' },
      { label: 'Port Harcourt', value: 'Port Harcourt' },
      { label: 'Ibadan', value: 'Ibadan' },
    ];

    const modelOptions: Array<{ label: string; value: string }> = [];

    return {
      makes: makeOptions,
      models: modelOptions,
      bodyTypes,
      fuelTypes,
      transmissions,
      drivetrains,
      locations,
      stats,
    };
  } catch (error) {
    console.error('Error fetching filter options:', error);
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

/* -------------------------------------------------------------------------- */
/*                               PAGE COMPONENT                               */
/* -------------------------------------------------------------------------- */

export default async function VehiclesPage() {
  const filterOptions = await getFilterOptions();
  const totalCount = filterOptions.stats?.total || 0;

  return (
    <main className="min-h-screen bg-obsidian pt-16 sm:pt-20">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. PAGE HEADER (Catalogue Dossier Header)                    */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section className="relative border-b border-border/70 bg-graphite overflow-hidden">
        {/* Ambient Gold Radial Glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 right-1/4 w-125 h-55 bg-gold/5 blur-[100px] rounded-full"
        />

        {/* Specular Chamfer Top Hairline */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/12 to-transparent"
        />

        <Container size="lg" className="py-8 md:py-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            {/* Title & Stats */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant="gold"
                  size="sm"
                  leftIcon={<Sparkles className="h-3 w-3" />}
                >
                  Curated Inventory
                </Badge>
                <Badge
                  variant="success"
                  size="sm"
                  leftIcon={<ShieldCheck className="h-3 w-3" />}
                  dot
                >
                  Verified Provenance
                </Badge>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-primary tracking-tight">
                Vehicle Catalogue
              </h1>

              <p className="text-secondary text-sm md:text-base font-sans leading-relaxed">
                Discover{' '}
                <span className="text-gold font-mono font-semibold tabular-nums">
                  {totalCount.toLocaleString()}
                </span>{' '}
                exceptional vehicles selected for quality, performance, and heritage.
              </p>
            </div>

            {/* Catalogue Search Component (Client Component) */}
            <div className="w-full md:w-80 shrink-0">
              <CatalogueSearch />
            </div>
          </div>

          {/* Quick Instrument Strip */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-border/50">
            <div className="flex items-center gap-3 p-3 rounded-md bg-inset border border-border/60">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-charcoal text-gold border border-border">
                <Car className="h-4 w-4" />
              </div>
              <div>
                <span className="block text-[10px] uppercase tracking-wider text-muted font-sans font-semibold">
                  Total Units
                </span>
                <span className="font-mono text-sm font-semibold text-primary">
                  {totalCount.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-md bg-inset border border-border/60">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-charcoal text-emerald border border-border">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <span className="block text-[10px] uppercase tracking-wider text-muted font-sans font-semibold">
                  Verification Rate
                </span>
                <span className="font-mono text-sm font-semibold text-emerald">
                  100% Guaranteed
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-md bg-inset border border-border/60">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-charcoal text-gold border border-border">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <span className="block text-[10px] uppercase tracking-wider text-muted font-sans font-semibold">
                  Marques Available
                </span>
                <span className="font-mono text-sm font-semibold text-primary">
                  {filterOptions.makes.length || '—'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-md bg-inset border border-border/60">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-charcoal text-secondary border border-border">
                <Layers className="h-4 w-4" />
              </div>
              <div>
                <span className="block text-[10px] uppercase tracking-wider text-muted font-sans font-semibold">
                  Body Styles
                </span>
                <span className="font-mono text-sm font-semibold text-primary">
                  {filterOptions.bodyTypes.length}
                </span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. MAIN CATALOGUE LAYOUT (Sidebar + Grid)                     */}
      {/* ───────────────────────────────────────────────────────────── */}
      <Container size="lg" className="py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Filters Sidebar (Desktop Sticky) */}
          <aside className="hidden lg:block w-72 shrink-0 sticky top-28 space-y-4">
            <VehicleFilters
              makes={filterOptions.makes}
              models={filterOptions.models}
              bodyTypes={filterOptions.bodyTypes}
              fuelTypes={filterOptions.fuelTypes}
              transmissions={filterOptions.transmissions}
              drivetrains={filterOptions.drivetrains}
              locations={filterOptions.locations}
            />
          </aside>

          {/* Vehicle Grid & Sort */}
          <div className="flex-1 min-w-0 w-full space-y-6">
            <div className="flex items-center justify-between p-3.5 rounded-lg bg-graphite border border-border/70">
              <p className="text-xs sm:text-sm text-secondary font-sans">
                Displaying{' '}
                <span className="text-primary font-semibold font-mono">
                  curated inventory
                </span>
              </p>
              <VehicleSort />
            </div>

            <VehicleGrid />
          </div>
        </div>

        {/* Mobile Filters Drawer Container */}
        <div className="lg:hidden mt-8">
          <VehicleFilters
            makes={filterOptions.makes}
            models={filterOptions.models}
            bodyTypes={filterOptions.bodyTypes}
            fuelTypes={filterOptions.fuelTypes}
            transmissions={filterOptions.transmissions}
            drivetrains={filterOptions.drivetrains}
            locations={filterOptions.locations}
          />
        </div>
      </Container>
    </main>
  );
}