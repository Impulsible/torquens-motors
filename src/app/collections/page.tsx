import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Sparkles,
  Car,
  Compass,
  Grid,
} from 'lucide-react';

import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CollectionService, type ICollectionData } from '@/services/collection.service';
import { cn } from '@/utils/cn';

export const metadata: Metadata = {
  title: 'Curated Collections & Lineages | TORQUENS MOTORS',
  description:
    'Explore handpicked collections of world-class automotive assets, competition chassis, and bespoke hypercar allocations.',
  openGraph: {
    title: 'Curated Collections | TORQUENS Private Registry',
    description:
      'Immerse in curated automotive series—from homologation specials to grand touring icons.',
    type: 'website',
  },
};

export interface CollectionData {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  bannerImage?: string | null;
  vehicleCount?: number;
  featured?: boolean;
  published?: boolean;
  createdAt?: string | Date;
}

function mapCollection(c: ICollectionData): CollectionData {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description ?? null,
    image: c.image || c.bannerImage || null,
    bannerImage: c.bannerImage || c.image || null,
    vehicleCount: c.vehicleCount ?? c.vehicles?.length ?? 0,
    featured: c.featured ?? false,
    published: c.active !== false,
    createdAt: c.createdAt,
  };
}

async function getCollections(): Promise<CollectionData[]> {
  try {
    // Prefer paginated published/active collections
    const result = await CollectionService.getCollections(1, 50);

    if (result?.data && Array.isArray(result.data)) {
      return result.data.map(mapCollection);
    }

    // Fallback to full list
    const all = await CollectionService.getAllCollections();
    return (all || []).map(mapCollection);
  } catch (error) {
    console.error('[CollectionsPage] Failed to fetch collections:', error);
    try {
      const fallbacks = CollectionService.getAllFallbackCollections();
      return fallbacks.map(mapCollection);
    } catch {
      return [];
    }
  }
}

export default async function CollectionsPage() {
  const collections = await getCollections();

  const featuredCollections = collections.filter((c) => c.featured);
  const regularCollections = collections.filter((c) => !c.featured);
  const totalVehiclesCount = collections.reduce((acc, c) => acc + (c.vehicleCount || 0), 0);

  return (
    <main className="min-h-screen bg-obsidian text-primary selection:bg-gold/20 selection:text-gold pt-16 sm:pt-20 pb-20 overflow-hidden">
      <section className="relative py-8 md:py-12 border-b border-border/40 overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-160 h-80 bg-gold/5 blur-[140px] rounded-full"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 checkerboard-bg opacity-[0.02]"
        />

        <Container className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="max-w-3xl space-y-4">
              <Badge variant="gold" size="sm">
                <span className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest">
                  <Sparkles className="h-3 w-3" />
                  Showroom Registry · Curated Series
                </span>
              </Badge>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-light tracking-tight text-primary leading-[1.08]">
                Exceptional Lineages,{' '}
                <span className="italic font-normal text-gold block sm:inline">
                  Curated with Provenance.
                </span>
              </h1>

              <p className="text-secondary font-sans text-sm sm:text-base leading-relaxed max-w-2xl pt-1">
                Explore handpicked thematic portfolios of world-class automotive assets. Each series
                reflects a dedicated chapter in motorsport heritage, grand touring excellence, and bespoke engineering.
              </p>
            </div>

            <div className="flex items-center gap-6 pt-4 lg:pt-0 border-t lg:border-t-0 border-border/40 shrink-0">
              <div>
                <span className="block font-serif text-3xl sm:text-4xl font-light text-primary tabular-nums">
                  {collections.length}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted mt-1 block">
                  Curated Series
                </span>
              </div>

              <div className="h-10 w-px bg-border/60" aria-hidden="true" />

              <div>
                <span className="block font-serif text-3xl sm:text-4xl font-light text-gold tabular-nums">
                  {totalVehiclesCount}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted mt-1 block">
                  Allocated Assets
                </span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <Container className="py-12 sm:py-16 space-y-16">
        {collections.length === 0 ? (
          <div className="rounded-2xl border border-border/60 bg-graphite/40 backdrop-blur-md p-12 sm:p-20 text-center max-w-xl mx-auto space-y-6">
            <div className="w-16 h-16 rounded-full border border-gold/30 bg-gold/5 flex items-center justify-center mx-auto shadow-glow">
              <Grid className="h-7 w-7 text-gold stroke-[1.5]" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-serif font-light text-primary">
                Collections Under Curatorial Review
              </h2>
              <p className="text-sm font-sans text-secondary leading-relaxed">
                Our specialists are currently staging new thematic portfolios. Explore our full live inventory in the main showroom.
              </p>
            </div>

            <div className="pt-2">
              <Link href="/vehicles">
                <Button variant="primary" size="md" rightIcon={<Compass className="h-4 w-4" />}>
                  Explore Full Showroom
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {featuredCollections.length > 0 && (
              <section className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-border/40">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-gold animate-pulse" />
                    <h2 className="text-xl sm:text-2xl font-serif font-light text-primary tracking-tight">
                      Featured Curations
                    </h2>
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-muted">
                    Headline Portfolios
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredCollections.map((collection, idx) => (
                    <CollectionCard
                      key={collection.id}
                      collection={collection}
                      featured
                      priorityImage={idx === 0}
                    />
                  ))}
                </div>
              </section>
            )}

            {regularCollections.length > 0 && (
              <section className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-border/40">
                  <h2 className="text-xl sm:text-2xl font-serif font-light text-primary tracking-tight">
                    Showroom Series Index
                  </h2>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-muted">
                    {regularCollections.length} Series Available
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regularCollections.map((collection) => (
                    <CollectionCard key={collection.id} collection={collection} />
                  ))}
                </div>
              </section>
            )}

            {/* If everything is featured, still show them once */}
            {featuredCollections.length > 0 && regularCollections.length === 0 && (
              <></>
            )}
          </>
        )}

        <div className="relative rounded-2xl border border-gold/30 bg-graphite/90 p-8 sm:p-12 overflow-hidden shadow-dropdown backdrop-blur-md">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-gold to-transparent" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
            <div className="space-y-2 max-w-2xl">
              <Badge variant="gold" size="sm">
                Private Commission
              </Badge>
              <h3 className="text-2xl sm:text-3xl font-serif font-light text-primary tracking-tight">
                Seeking an Unlisted or Off-Market Allocation?
              </h3>
              <p className="text-sm font-sans text-secondary leading-relaxed">
                Our concierge desk facilitates discreet off-market acquisitions, collection liquidations,
                and bespoke global sourcing for tier-one private clients.
              </p>
            </div>

            <Link href="/contact" className="shrink-0">
              <Button
                variant="primary"
                size="lg"
                rightIcon={<ArrowRight className="h-4 w-4" />}
                className="w-full sm:w-auto text-xs uppercase tracking-widest font-semibold"
              >
                Inquire with Concierge
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </main>
  );
}

interface CollectionCardProps {
  collection: CollectionData;
  featured?: boolean;
  priorityImage?: boolean;
}

function CollectionCard({ collection, featured = false, priorityImage = false }: CollectionCardProps) {
  const fallbackImage =
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2070&auto=format&fit=crop';

  return (
    <Link
      href={`/collections/${collection.slug}`}
      className="group block h-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/60 rounded-xl"
    >
      <Card
        className={cn(
          'relative overflow-hidden bg-graphite/90 border-border/80 transition-all duration-500 ease-out h-full flex flex-col justify-end',
          featured
            ? 'border-gold/30 hover:border-gold/70 shadow-[0_4px_24px_rgba(0,0,0,0.6)]'
            : 'hover:border-gold/40'
        )}
      >
        {featured && (
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-gold to-transparent z-30 opacity-75" />
        )}

        <div className="relative aspect-16/11 sm:aspect-16/10 w-full overflow-hidden bg-obsidian">
          <div className="absolute inset-0 bg-linear-to-t from-obsidian via-obsidian/60 to-transparent z-10 transition-opacity duration-500 group-hover:opacity-90" />
          <div className="absolute inset-0 bg-linear-to-b from-obsidian/40 via-transparent to-transparent z-10" />

          <Image
            src={collection.image || fallbackImage}
            alt={collection.name}
            fill
            priority={priorityImage}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          />

          {featured && (
            <div className="absolute top-4 left-4 z-20">
              <Badge variant="gold" size="sm" className="shadow-lg backdrop-blur-md bg-obsidian/80">
                <Sparkles className="h-3 w-3 mr-1" />
                Featured Series
              </Badge>
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-6 z-20 flex flex-col justify-end space-y-2">
            <h3 className="text-xl sm:text-2xl font-serif font-light text-white tracking-tight group-hover:text-gold transition-colors duration-300">
              {collection.name}
            </h3>

            {collection.description && (
              <p className="text-xs sm:text-sm text-white/70 font-sans line-clamp-2 leading-relaxed">
                {collection.description}
              </p>
            )}

            <div className="pt-2 flex items-center justify-between border-t border-white/10 text-xs font-sans text-white/60">
              <span className="flex items-center gap-1.5 font-mono text-[11px] text-white/80">
                <Car className="h-3.5 w-3.5 text-gold/80" />
                <span>
                  {collection.vehicleCount || 0} vehicle
                  {collection.vehicleCount === 1 ? '' : 's'}
                </span>
              </span>

              <span className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-widest text-gold opacity-80 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
                <span>Explore Series</span>
                <ArrowRight size={13} />
              </span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}