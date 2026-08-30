'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, Compass, Flame, Shield } from 'lucide-react';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';

export interface Collection {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  image: string;
  vehicleCount: number;
  href: string;
  featured?: boolean;
  badge?: string;
  icon?: React.ReactNode;
}

const MOCK_COLLECTIONS: Collection[] = [
  {
    id: 'performance-icons',
    name: 'Performance Icons',
    subtitle: 'Track-Focused & V12 Heritage',
    description:
      'The pinnacle of motorsport engineering where naturally aspirated power meets carbon precision.',
    image:
      'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=1600&auto=format&fit=crop',
    vehicleCount: 14,
    href: '/collections/performance',
    featured: true,
    badge: 'Featured Vault',
    icon: <Flame className="h-3 w-3" />,
  },
  {
    id: 'luxury-suv',
    name: 'Luxury & Off-Road All-Terrain',
    subtitle: 'Refined Capability',
    description:
      'Commanding presence, air suspension comfort, and bespoke interior finishes.',
    image:
      'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?q=80&w=1200&auto=format&fit=crop',
    vehicleCount: 9,
    href: '/collections/luxury-suv',
    featured: false,
    badge: 'High Demand',
    icon: <Shield className="h-3 w-3" />,
  },
  {
    id: 'electric-hypercars',
    name: 'Electric & Hybrid Revolution',
    subtitle: 'Instant Torque & Silent Power',
    description:
      'Discover the next era of hypercars with cutting-edge battery technology.',
    image:
      'https://images.unsplash.com/photo-1631295868223-63265b40d9e4?q=80&w=1200&auto=format&fit=crop',
    vehicleCount: 7,
    href: '/collections/electric',
    featured: false,
    badge: 'Next Gen',
    icon: <Sparkles className="h-3 w-3" />,
  },
];

interface FeaturedCollectionsProps {
  collections?: Collection[];
}

export function FeaturedCollections({ collections: collectionsProp }: FeaturedCollectionsProps) {
  const collections = collectionsProp && collectionsProp.length > 0 ? collectionsProp : MOCK_COLLECTIONS;

  return (
    <section className="relative py-16 md:py-24 bg-obsidian overflow-hidden border-t border-border/40">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-1/3 rounded-full bg-gold/5 blur-[130px]"
        style={{ width: 600, height: 350 }}
      />

      <div className="container-torquens relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="gold" size="sm" leftIcon={<Compass className="h-3 w-3" />}>
                Curated Series
              </Badge>
              <span className="text-xs text-muted font-mono uppercase tracking-wider hidden sm:inline-block">
                • {collections.length} Primary Vault Categories
              </span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-primary leading-tight">
              Handpicked Collections
            </h2>
            <p className="text-secondary text-sm md:text-base font-sans max-w-lg leading-relaxed">
              Explore specialized groupings engineered around specific marques, performance tiers, and powertrain philosophies.
            </p>
          </div>

          <Link href="/collections" className="shrink-0 cursor-pointer">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
              Explore All Collections
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {collections.map((collection) => {
            const isFeatured = collection.featured;

            return (
              <Link
                key={collection.id}
                href={collection.href}
                className={cn(
                  'group relative block cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 rounded-xl overflow-hidden',
                  isFeatured ? 'lg:col-span-7' : 'lg:col-span-5'
                )}
              >
                <Card
                  variant="glass"
                  specular
                  className={cn(
                    'h-full min-h-95 sm:min-h-110 flex flex-col justify-end p-0 overflow-hidden',
                    'border border-border/80 group-hover:border-gold/50 transition-all duration-500 shadow-card'
                  )}
                >
                  <div className="absolute inset-0 z-0 bg-charcoal overflow-hidden">
                    <Image
                      src={collection.image}
                      alt={collection.name}
                      fill
                      sizes={
                        isFeatured
                          ? '(max-width: 1024px) 100vw, 60vw'
                          : '(max-width: 1024px) 100vw, 40vw'
                      }
                      className="object-cover object-center brightness-75 contrast-105 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-obsidian via-obsidian/60 to-black/30 opacity-90 transition-opacity duration-300 group-hover:opacity-80" />
                  </div>

                  <div className="relative z-10 p-6 sm:p-8 flex flex-col justify-end h-full">
                    <div className="mb-auto flex items-center justify-between gap-2 z-10">
                      <Badge
                        variant={isFeatured ? 'gold' : 'glass'}
                        size="sm"
                        leftIcon={collection.icon}
                      >
                        {collection.badge || 'Curated'}
                      </Badge>

                      <Badge variant="glass" size="sm" className="font-mono">
                        {collection.vehicleCount} Units
                      </Badge>
                    </div>

                    <div className="space-y-2 mt-12">
                      <span className="text-[11px] uppercase tracking-widest font-semibold text-gold font-sans block">
                        {collection.subtitle}
                      </span>

                      <h3
                        className={cn(
                          'font-serif font-normal text-primary tracking-tight transition-colors group-hover:text-gold',
                          isFeatured ? 'text-2xl sm:text-3xl lg:text-4xl' : 'text-2xl sm:text-3xl'
                        )}
                      >
                        {collection.name}
                      </h3>

                      <p className="text-xs sm:text-sm text-secondary/90 font-sans leading-relaxed line-clamp-2 max-w-xl">
                        {collection.description}
                      </p>

                      <div className="pt-3 flex items-center justify-between border-t border-white/10">
                        <span className="text-xs font-mono text-muted uppercase tracking-wider">
                          Dossier Series #{collection.id.slice(0, 4)}
                        </span>

                        <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gold group-hover:text-gold-hover transition-colors font-sans">
                          <span>View Series</span>
                          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FeaturedCollections;