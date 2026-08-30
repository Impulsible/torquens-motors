/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  X,
  Filter,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  SlidersHorizontal,
  Car,
  MapPin,
  Calendar,
  Check,
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';

export interface FilterOption {
  label: string;
  value: string;
}

export interface VehicleFiltersProps {
  makes: FilterOption[];
  models: FilterOption[];
  bodyTypes: FilterOption[];
  fuelTypes: FilterOption[];
  transmissions: FilterOption[];
  drivetrains: FilterOption[];
  locations: FilterOption[];
  onFilterChange?: (filters: Record<string, string>) => void;
  className?: string;
}

// Quick Price Presets (Formatted for NGN Luxury Scale)
const PRICE_PRESETS = [
  { label: 'Under ₦50M', min: '', max: '50000000' },
  { label: '₦50M - ₦100M', min: '50000000', max: '100000000' },
  { label: '₦100M - ₦200M', min: '100000000', max: '200000000' },
  { label: '₦200M+', min: '200000000', max: '' },
];

// ---------------------------------------------------------------------------
// FILTER ACCORDION SECTIONS (Moved outside component)
// ---------------------------------------------------------------------------
interface FilterSection {
  id: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
}

// Helper to create filter sections
function createFilterSections(
  filters: Record<string, string>,
  handleFilterChange: (key: string, value: string) => void,
  handlePresetPrice: (min: string, max: string) => void,
  makes: FilterOption[],
  models: FilterOption[],
  bodyTypes: FilterOption[],
  fuelTypes: FilterOption[],
  transmissions: FilterOption[],
  drivetrains: FilterOption[],
  locations: FilterOption[]
): FilterSection[] {
  return [
    {
      id: 'make',
      label: 'Make & Model',
      icon: <Car size={15} className="text-gold" />,
      content: (
        <div className="space-y-3 pt-1">
          <Select
            label="Manufacturer"
            value={filters.make}
            onChange={(e) => handleFilterChange('make', e.target.value)}
            options={[{ value: '', label: 'All Makes' }, ...makes]}
            placeholder="Select Make"
          />
          <Select
            label="Model"
            value={filters.model}
            onChange={(e) => handleFilterChange('model', e.target.value)}
            options={[
              { value: '', label: 'All Models' },
              ...models.filter(
                (m) =>
                  !filters.make ||
                  m.value.toLowerCase().includes(filters.make.toLowerCase()) ||
                  m.label.toLowerCase().includes(filters.make.toLowerCase())
              ),
            ]}
            placeholder={filters.make ? 'Select Model' : 'Select Make First'}
            disabled={!filters.make}
          />
        </div>
      ),
    },
    {
      id: 'price',
      label: 'Acquisition Budget',
      icon: <SlidersHorizontal size={15} className="text-gold" />,
      content: (
        <div className="space-y-3 pt-1">
          <div className="grid grid-cols-2 gap-1.5 mb-3">
            {PRICE_PRESETS.map((preset) => {
              const isSelected =
                filters.minPrice === preset.min &&
                filters.maxPrice === preset.max;
              return (
                <button
                  type="button"
                  key={preset.label}
                  onClick={() => handlePresetPrice(preset.min, preset.max)}
                  className={cn(
                    'py-1.5 px-2 rounded-md text-[10px] font-sans font-semibold transition-all duration-200 border text-center',
                    isSelected
                      ? 'bg-gold/15 text-gold border-gold'
                      : 'bg-inset text-secondary border-border hover:border-active-border hover:text-primary'
                  )}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <Input
              label="Min Price (₦)"
              type="number"
              placeholder="Min"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              min={0}
            />
            <Input
              label="Max Price (₦)"
              type="number"
              placeholder="Max"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              min={0}
            />
          </div>
        </div>
      ),
    },
    {
      id: 'year',
      label: 'Model Year',
      icon: <Calendar size={15} className="text-gold" />,
      content: (
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <Input
            label="From Year"
            type="number"
            placeholder="2015"
            value={filters.minYear}
            onChange={(e) => handleFilterChange('minYear', e.target.value)}
            min={1990}
            max={new Date().getFullYear()}
          />
          <Input
            label="To Year"
            type="number"
            placeholder={new Date().getFullYear().toString()}
            value={filters.maxYear}
            onChange={(e) => handleFilterChange('maxYear', e.target.value)}
            min={1990}
            max={new Date().getFullYear()}
          />
        </div>
      ),
    },
    {
      id: 'specs',
      label: 'Technical Specs',
      content: (
        <div className="space-y-3 pt-1">
          <Select
            label="Body Style"
            value={filters.bodyType}
            onChange={(e) => handleFilterChange('bodyType', e.target.value)}
            options={[{ value: '', label: 'All Body Styles' }, ...bodyTypes]}
            placeholder="Select Body Style"
          />
          <Select
            label="Fuel Type"
            value={filters.fuelType}
            onChange={(e) => handleFilterChange('fuelType', e.target.value)}
            options={[{ value: '', label: 'All Powertrains' }, ...fuelTypes]}
            placeholder="Select Fuel Type"
          />
          <Select
            label="Gearbox"
            value={filters.transmission}
            onChange={(e) => handleFilterChange('transmission', e.target.value)}
            options={[
              { value: '', label: 'All Transmissions' },
              ...transmissions,
            ]}
            placeholder="Select Transmission"
          />
          <Select
            label="Drivetrain"
            value={filters.drivetrain}
            onChange={(e) => handleFilterChange('drivetrain', e.target.value)}
            options={[{ value: '', label: 'All Drivetrains' }, ...drivetrains]}
            placeholder="Select Drivetrain"
          />
        </div>
      ),
    },
    {
      id: 'location',
      label: 'Location',
      icon: <MapPin size={15} className="text-gold" />,
      content: (
        <div className="pt-1">
          <Select
            label="Region / State"
            value={filters.location}
            onChange={(e) => handleFilterChange('location', e.target.value)}
            options={[{ value: '', label: 'All Regions' }, ...locations]}
            placeholder="Select Region"
          />
        </div>
      ),
    },
    {
      id: 'trust',
      label: 'Verification & Status',
      icon: <ShieldCheck size={15} className="text-emerald" />,
      content: (
        <div className="space-y-2.5 pt-1">
          <button
            type="button"
            onClick={() =>
              handleFilterChange(
                'verified',
                filters.verified === 'true' ? '' : 'true'
              )
            }
            className={cn(
              'w-full flex items-center justify-between p-2.5 rounded-lg border text-xs font-sans transition-all duration-200',
              filters.verified === 'true'
                ? 'bg-emerald-bg border-emerald-border text-emerald font-semibold'
                : 'bg-inset border-border text-secondary hover:text-primary'
            )}
          >
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald shrink-0" />
              <span>TORQUENS Verified Only</span>
            </div>
            <div
              className={cn(
                'w-4 h-4 rounded-full border flex items-center justify-center',
                filters.verified === 'true'
                  ? 'border-emerald bg-emerald text-obsidian'
                  : 'border-border'
              )}
            >
              {filters.verified === 'true' && <Check size={10} />}
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              handleFilterChange(
                'featured',
                filters.featured === 'true' ? '' : 'true'
              )
            }
            className={cn(
              'w-full flex items-center justify-between p-2.5 rounded-lg border text-xs font-sans transition-all duration-200',
              filters.featured === 'true'
                ? 'bg-gold/15 border-gold/40 text-gold font-semibold'
                : 'bg-inset border-border text-secondary hover:text-primary'
            )}
          >
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-gold shrink-0" />
              <span>Featured Spotlight Only</span>
            </div>
            <div
              className={cn(
                'w-4 h-4 rounded-full border flex items-center justify-center',
                filters.featured === 'true'
                  ? 'border-gold bg-gold text-obsidian'
                  : 'border-border'
              )}
            >
              {filters.featured === 'true' && <Check size={10} />}
            </div>
          </button>
        </div>
      ),
    },
  ];
}

// ---------------------------------------------------------------------------
// DESKTOP FILTER SIDEBAR (Moved outside component)
// ---------------------------------------------------------------------------
interface DesktopFiltersProps {
  filterSections: FilterSection[];
  expandedSections: Set<string>;
  toggleSection: (id: string) => void;
  applyFilters: () => void;
  clearAllFilters: () => void;
  hasActiveFilters: boolean;
  activeFilterCount: number;
  className?: string;
}

function DesktopFilters({
  filterSections,
  expandedSections,
  toggleSection,
  applyFilters,
  clearAllFilters,
  hasActiveFilters,
  activeFilterCount,
  className,
}: DesktopFiltersProps) {
  const isSectionActive = (sectionId: string): boolean => {
    // This will be determined by the parent component
    return false;
  };

  return (
    <div className={cn('hidden lg:block sticky top-24 z-30', className)}>
      <Card className="bg-graphite border-border shadow-card p-5 overflow-hidden relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={16} className="text-gold" />
            <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-primary">
              Filter Registry
            </h3>
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-[11px] font-sans text-gold hover:text-gold-hover gold-underline flex items-center gap-1 transition-colors"
            >
              <RotateCcw size={12} />
              Reset All
            </button>
          )}
        </div>

        {/* Filter Accordions */}
        <div className="divide-y divide-border/60 max-h-[calc(100vh-220px)] overflow-y-auto no-scrollbar py-2 pr-1">
          {filterSections.map((section) => {
            const isExpanded = expandedSections.has(section.id);

            return (
              <div key={section.id} className="py-3.5 first:pt-2 last:pb-2">
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className="flex items-center justify-between w-full text-left group"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-sans font-semibold text-primary group-hover:text-gold transition-colors">
                      {section.label}
                    </span>
                  </div>
                  <span className="text-muted group-hover:text-primary transition-colors">
                    {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </span>
                </button>

                {isExpanded && (
                  <div className="mt-3 animate-in fade-in duration-200">
                    {section.content}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Sticky Apply Action */}
        <div className="pt-4 mt-2 border-t border-border space-y-2">
          <Button
            variant="primary"
            fullWidth
            onClick={applyFilters}
            className="text-xs uppercase tracking-widest py-3 font-semibold shadow-goldGlowSm"
          >
            Apply Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </Button>

          {hasActiveFilters && (
            <Button
              variant="secondary"
              fullWidth
              onClick={clearAllFilters}
              className="text-xs py-2 text-muted hover:text-primary"
            >
              Clear All Selection
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MOBILE FILTER DRAWER (Moved outside component)
// ---------------------------------------------------------------------------
interface MobileFiltersProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  filterSections: FilterSection[];
  expandedSections: Set<string>;
  toggleSection: (id: string) => void;
  applyFilters: () => void;
  clearAllFilters: () => void;
  hasActiveFilters: boolean;
  activeFilterCount: number;
}

function MobileFilters({
  isMobileOpen,
  setIsMobileOpen,
  filterSections,
  expandedSections,
  toggleSection,
  applyFilters,
  clearAllFilters,
  hasActiveFilters,
  activeFilterCount,
}: MobileFiltersProps) {
  return (
    <>
      {/* Mobile Sticky Bar Trigger */}
      <div className="lg:hidden sticky top-14 z-30 bg-obsidian/95 backdrop-blur-md border-b border-border py-2.5 px-4 mb-4">
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="secondary"
            onClick={() => setIsMobileOpen(true)}
            className="flex-1 text-xs py-2.5 border-gold/30 flex items-center justify-center gap-2"
          >
            <Filter size={15} className="text-gold" />
            <span>Filter Inventory</span>
            {hasActiveFilters && (
              <Badge variant="gold" size="sm">
                {activeFilterCount} Active
              </Badge>
            )}
          </Button>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="p-2.5 rounded-md bg-inset border border-border text-secondary hover:text-primary text-xs font-sans flex items-center gap-1"
            >
              <RotateCcw size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Slide-Over Modal Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 bg-obsidian/95 backdrop-blur-xl flex flex-col justify-between animate-in fade-in duration-200 lg:hidden">
          {/* Drawer Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-graphite">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={18} className="text-gold" />
              <h3 className="text-base font-serif font-light text-primary">
                Filter Inventory
              </h3>
            </div>
            <button
              onClick={() => setIsMobileOpen(false)}
              className="p-1.5 text-secondary hover:text-primary rounded-md border border-border"
              aria-label="Close filters"
            >
              <X size={20} />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {filterSections.map((section) => (
              <div
                key={section.id}
                className="border-b border-border/80 pb-5 last:border-0"
              >
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-sans font-semibold text-primary">
                      {section.label}
                    </span>
                  </div>
                  {expandedSections.has(section.id) ? (
                    <ChevronUp size={16} className="text-muted" />
                  ) : (
                    <ChevronDown size={16} className="text-muted" />
                  )}
                </button>
                {expandedSections.has(section.id) && (
                  <div className="mt-4">{section.content}</div>
                )}
              </div>
            ))}
          </div>

          {/* Drawer Bottom Actions */}
          <div className="p-4 border-t border-border bg-graphite space-y-2">
            <Button
              variant="primary"
              fullWidth
              onClick={applyFilters}
              className="text-xs uppercase tracking-widest py-3.5 font-semibold"
            >
              Apply Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </Button>
            {hasActiveFilters && (
              <Button
                variant="secondary"
                fullWidth
                onClick={clearAllFilters}
                className="text-xs py-2 text-muted"
              >
                Reset All Filters
              </Button>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// MAIN COMPONENT
// ---------------------------------------------------------------------------
export function VehicleFilters({
  makes,
  models,
  bodyTypes,
  fuelTypes,
  transmissions,
  drivetrains,
  locations,
  onFilterChange,
  className,
}: VehicleFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['make', 'price', 'year'])
  );

  // Initialize filters from URL parameters
  const initialFilters: Record<string, string> = {
    make: searchParams.get('make') || '',
    model: searchParams.get('model') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minYear: searchParams.get('minYear') || '',
    maxYear: searchParams.get('maxYear') || '',
    bodyType: searchParams.get('bodyType') || '',
    fuelType: searchParams.get('fuelType') || '',
    transmission: searchParams.get('transmission') || '',
    drivetrain: searchParams.get('drivetrain') || '',
    location: searchParams.get('location') || '',
    verified: searchParams.get('verified') || '',
    featured: searchParams.get('featured') || '',
  };

  const [filters, setFilters] = useState<Record<string, string>>(initialFilters);

  // Keep state in sync if URL searchParams change externally - using useEffect is fine here
  useEffect(() => {
    // This is necessary for external URL changes (e.g., from browser back/forward)
    // We use a ref to avoid the lint warning
    const urlFilters: Record<string, string> = {
      make: searchParams.get('make') || '',
      model: searchParams.get('model') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      minYear: searchParams.get('minYear') || '',
      maxYear: searchParams.get('maxYear') || '',
      bodyType: searchParams.get('bodyType') || '',
      fuelType: searchParams.get('fuelType') || '',
      transmission: searchParams.get('transmission') || '',
      drivetrain: searchParams.get('drivetrain') || '',
      location: searchParams.get('location') || '',
      verified: searchParams.get('verified') || '',
      featured: searchParams.get('featured') || '',
    };
    
    // Only update if different
    const hasChanged = Object.keys(urlFilters).some(
      (key) => urlFilters[key] !== filters[key]
    );
    
    if (hasChanged) {
      setFilters(urlFilters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Lock body scroll when mobile filter drawer is active
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileOpen]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => {
      const updated = { ...prev, [key]: value };
      if (key === 'make' && value !== prev.make) {
        updated.model = '';
      }
      return updated;
    });
  };

  const handlePresetPrice = (min: string, max: string) => {
    setFilters((prev) => ({
      ...prev,
      minPrice: min,
      maxPrice: max,
    }));
  };

  const applyFilters = useCallback(() => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });

    const search = searchParams.get('search');
    if (search) {
      params.set('search', search);
    }

    router.push(`/vehicles?${params.toString()}`);
    onFilterChange?.(filters);
    setIsMobileOpen(false);
  }, [filters, searchParams, router, onFilterChange]);

  const clearAllFilters = () => {
    const cleared: Record<string, string> = {
      make: '',
      model: '',
      minPrice: '',
      maxPrice: '',
      minYear: '',
      maxYear: '',
      bodyType: '',
      fuelType: '',
      transmission: '',
      drivetrain: '',
      location: '',
      verified: '',
      featured: '',
    };
    setFilters(cleared);
    router.push('/vehicles');
    onFilterChange?.({});
    setIsMobileOpen(false);
  };

  const activeFilterCount = useMemo(() => {
    return Object.values(filters).filter((v) => v !== '').length;
  }, [filters]);

  const hasActiveFilters = activeFilterCount > 0;

  // Create filter sections
  const filterSections = createFilterSections(
    filters,
    handleFilterChange,
    handlePresetPrice,
    makes,
    models,
    bodyTypes,
    fuelTypes,
    transmissions,
    drivetrains,
    locations
  );

  return (
    <>
      <DesktopFilters
        filterSections={filterSections}
        expandedSections={expandedSections}
        toggleSection={toggleSection}
        applyFilters={applyFilters}
        clearAllFilters={clearAllFilters}
        hasActiveFilters={hasActiveFilters}
        activeFilterCount={activeFilterCount}
        className={className}
      />
      <MobileFilters
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        filterSections={filterSections}
        expandedSections={expandedSections}
        toggleSection={toggleSection}
        applyFilters={applyFilters}
        clearAllFilters={clearAllFilters}
        hasActiveFilters={hasActiveFilters}
        activeFilterCount={activeFilterCount}
      />
    </>
  );
}

export default VehicleFilters;