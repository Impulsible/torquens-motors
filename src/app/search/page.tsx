import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import {
  Search,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

import { Container } from '@/components/ui/Container';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { VehicleGrid } from '@/components/vehicle/VehicleGrid';
import { SearchInput } from '@/components/search/SearchInput';
import { searchTORQUENSIntelligence } from '@/services/vehicle.service';

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    page?: string;
  }>;
}

// Popular Search Suggestions for Dead-End Recoveries
const POPULAR_SEARCH_TAGS = [
  'Porsche Cayenne',
  'Mercedes-AMG G63',
  'Executive SUVs',
  'Electric & Hybrid',
  'Low Mileage',
];

// -----------------------------------------------------------------------------
// DYNAMIC SEO METADATA
// -----------------------------------------------------------------------------
export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  const query = q?.trim() || '';

  if (!query) {
    return {
      title: 'Search Luxury Vehicles | TORQUENS MOTORS',
      description:
        'Search our curated registry for luxury cars, exotic models, and verified dealership allocations.',
    };
  }

  return {
    title: `Search Results for "${query}" | TORQUENS MOTORS`,
    description: `Discover verified luxury vehicle listings matching "${query}" on TORQUENS MOTORS.`,
  };
}

// -----------------------------------------------------------------------------
// MAIN SEARCH PAGE COMPONENT
// -----------------------------------------------------------------------------
export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q, page: pageStr } = await searchParams;
  const query = q?.trim() || '';
  const page = parseInt(pageStr || '1', 10);

  // ---------------------------------------------------------------------------
  // 1. EMPTY PROMPT STATE (When user visits /search with no query parameter)
  // ---------------------------------------------------------------------------
  if (!query) {
    return (
      <main className="min-h-screen pt-24 pb-20 bg-obsidian relative overflow-hidden selection:bg-gold selection:text-obsidian">
        {/* Ambient Top Lighting */}
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-200 h-100 bg-gold/5 blur-[140px] rounded-full" />
        <div className="pointer-events-none absolute inset-0 checkerboard-bg opacity-[0.03]" />

        <Container className="relative z-10">
          <div className="max-w-2xl mx-auto py-16 text-center space-y-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-inset border border-border flex items-center justify-center text-gold mx-auto shadow-card relative">
              <Search size={32} />
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-charcoal border border-gold/30 flex items-center justify-center text-gold">
                <Sparkles size={12} />
              </div>
            </div>

            <div className="space-y-2">
              <Badge variant="gold" size="sm">
                TORQUENS Intelligence
              </Badge>
              <h1 className="text-3xl sm:text-4xl font-serif font-light text-primary tracking-tight">
                Search the Registry
              </h1>
              <p className="text-secondary font-sans text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
                Search by brand, specific model, budget range, or enter a natural prompt like
                <em className="text-gold italic font-serif ml-1">
                  &quot;Find me an SUV under ₦100 million in Lagos&quot;
                </em>
              </p>
            </div>

            {/* Natural Input Bar */}
            <div className="pt-2">
              <SearchInput autoFocus />
            </div>

            {/* Popular Search Tags */}
            <div className="pt-6 space-y-3">
              <span className="text-[10px] font-sans uppercase tracking-[0.2em] text-muted font-semibold block">
                Popular Searches
              </span>
              <div className="flex flex-wrap justify-center gap-2">
                {POPULAR_SEARCH_TAGS.map((tag) => (
                  <Link
                    key={tag}
                    href={`/search?q=${encodeURIComponent(tag)}`}
                    className="text-xs font-sans bg-graphite hover:bg-charcoal text-secondary hover:text-gold px-3.5 py-1.5 rounded-full border border-border hover:border-gold/30 transition-all duration-200"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </main>
    );
  }

  // ---------------------------------------------------------------------------
  // 2. EXECUTE QUERY VIA VEHICLE SERVICE (TORQUENS Intelligence Parser)
  // ---------------------------------------------------------------------------
  // ✅ Fix: Use the imported searchTORQUENSIntelligence function directly
  const results = await searchTORQUENSIntelligence(query, {
    page,
    limit: 12,
  }).catch(() => ({
    data: [],
    pagination: {
      total: 0,
      page: 1,
      limit: 12,
      totalPages: 0,
      hasNextPage: false,
      hasPrevPage: false,
    },
  }));

  const totalResults = results.pagination.total;

  return (
    <main className="min-h-screen pt-24 pb-20 bg-obsidian relative overflow-hidden selection:bg-gold selection:text-obsidian">
      {/* Ambient Lighting */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-225 h-75 bg-gold/5 blur-[140px] rounded-full" />

      <Container className="relative z-10">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/vehicles"
            className="inline-flex items-center gap-1.5 text-xs font-sans text-secondary hover:text-gold transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Return to Catalogue</span>
          </Link>
        </div>

        {/* Header & Refine Bar */}
        <div className="mb-8 p-6 sm:p-8 rounded-2xl bg-graphite border border-border shadow-card relative overflow-hidden">
          <div className="pointer-events-none absolute -top-16 -right-16 w-48 h-48 bg-gold/5 rounded-full blur-3xl" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-1.5 max-w-xl">
              <div className="inline-flex items-center gap-2">
                <Badge variant="gold" size="sm">
                  <span className="inline-flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Query Interpreted
                  </span>
                </Badge>
                <span className="text-[11px] font-mono text-muted">
                  {totalResults} {totalResults === 1 ? 'match' : 'matches'} found
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-serif font-light text-primary tracking-tight">
                Results for &quot;<span className="text-gold">{query}</span>&quot;
              </h1>
              <p className="text-xs text-secondary font-sans">
                Refine your prompt or use advanced filters to narrow down specifications.
              </p>
            </div>

            {/* Search Refinement Input */}
            <div className="w-full md:w-96">
              <SearchInput placeholder="Refine search query..." />
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* SEARCH RESULTS MATRIX                                             */}
        {/* ----------------------------------------------------------------- */}
        <Suspense
          fallback={
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-graphite border border-border rounded-xl aspect-16/10 animate-pulse"
                />
              ))}
            </div>
          }
        >
          {totalResults > 0 ? (
            <VehicleGrid
              initialVehicles={results.data}
              initialTotal={totalResults}
            />
          ) : (
            /* Empty Results Recovery Card */
            <div className="my-8">
              <EmptyState
                title="No Registry Vehicles Found"
                description={`We couldn't find any vehicles matching "${query}". Try searching with a broader manufacturer term or explore our full filter engine.`}
                icon={<Search className="h-8 w-8 text-gold/80" />}
                action={{
                  label: 'Browse Full Catalogue',
                  href: '/vehicles',
                }}
                secondaryAction={{
                  label: 'Submit Concierge Request',
                  href: '/contact',
                }}
                variant="default"
                ambientGlow
              />

              {/* Suggestions */}
              <div className="mt-8 p-6 rounded-2xl bg-inset border border-border text-center max-w-xl mx-auto space-y-3">
                <span className="text-xs font-sans font-semibold uppercase tracking-widest text-primary block">
                  Search Recommendations
                </span>
                <div className="flex flex-wrap justify-center gap-2">
                  {POPULAR_SEARCH_TAGS.map((tag) => (
                    <Link
                      key={tag}
                      href={`/search?q=${encodeURIComponent(tag)}`}
                      className="text-xs font-sans bg-graphite hover:bg-charcoal text-secondary hover:text-gold px-3 py-1.5 rounded-lg border border-border transition-colors"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Suspense>
      </Container>
    </main>
  );
}