'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Sparkles,
  Gauge,
  Zap,
  Crown,
  Mountain,
  Briefcase,
  Flag,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';

interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  count: number;
  href: string;
  featured?: boolean;
  icon?: React.ReactNode;
  badge?: string;
}

const categories: Category[] = [
  {
    id: 'performance',
    name: 'Performance',
    description: 'Engineered for speed, precision, and pure adrenaline.',
    image: '/category-performance.jpg',
    count: 45,
    href: '/vehicles?category=performance',
    featured: true,
    icon: <Gauge className="h-4 w-4" />,
    badge: 'Most Viewed',
  },
  {
    id: 'luxury-suv',
    name: 'Luxury SUVs',
    description: 'Commanding presence with unparalleled comfort.',
    image: '/category-suv.jpg',
    count: 38,
    href: '/vehicles?category=suv',
    icon: <Mountain className="h-4 w-4" />,
  },
  {
    id: 'executive',
    name: 'Executive',
    description: 'Refined elegance for the discerning professional.',
    image: '/category-executive.jpg',
    count: 52,
    href: '/vehicles?category=executive',
    icon: <Briefcase className="h-4 w-4" />,
  },
  {
    id: 'electric',
    name: 'Electric & Hybrid',
    description: 'Silent power. Zero compromise luxury.',
    image: '/category-electric.jpg',
    count: 18,
    href: '/vehicles?category=electric',
    icon: <Zap className="h-4 w-4" />,
    badge: 'EV Future',
  },
  {
    id: 'german-engineering',
    name: 'German Engineering',
    description: 'Precision craftsmanship at its absolute finest.',
    image: '/category-german.jpg',
    count: 67,
    href: '/vehicles?category=german',
    icon: <Crown className="h-4 w-4" />,
  },
  {
    id: 'weekend-icons',
    name: 'Weekend Icons',
    description: 'For the moments that matter most.',
    image: '/category-weekend.jpg',
    count: 23,
    href: '/vehicles?category=weekend',
    icon: <Flag className="h-4 w-4" />,
  },
];

export function CategoryGrid() {
  return (
    <section className="relative py-16 md:py-24 bg-obsidian overflow-hidden">
      {/* Ambient Background Glow */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-225 h-100 bg-gold/5 blur-[140px] rounded-full" />
      <div className="pointer-events-none absolute inset-0 checkerboard-bg opacity-[0.03]" />

      <div className="container-torquens relative z-10">
        {/* ----------------------------------------------------------------- */}
        {/* SECTION HEADER                                                    */}
        {/* ----------------------------------------------------------------- */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12 md:mb-14">
          <div className="max-w-xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold text-[11px] font-sans font-semibold uppercase tracking-widest">
              <Sparkles size={12} />
              Curated Collections
            </div>
            <h2 className="section-title">
              Find Your Perfect Drive
            </h2>
            <p className="text-secondary text-sm md:text-base font-sans leading-relaxed">
              Explore TORQUENS lifestyle categories — from high-performance icons
              to executive luxury and next-generation electric vehicles.
            </p>
          </div>

          <Link
            href="/vehicles"
            className="group inline-flex items-center gap-2 text-xs font-sans font-semibold uppercase tracking-widest text-gold hover:text-gold-hover transition-colors"
          >
            <span>View Full Inventory</span>
            <ArrowRight
              size={14}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* BENTO CATEGORY GRID                                               */}
        {/* ----------------------------------------------------------------- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={category.href}
              className={cn(
                'group block focus-visible:outline-none',
                category.featured && 'sm:col-span-2 lg:col-span-2'
              )}
            >
              <Card
                className={cn(
                  'relative h-full overflow-hidden bg-graphite border-border transition-all duration-500',
                  'hover:border-gold/40 hover:shadow-card hover:-translate-y-1',
                  category.featured && 'border-gold/20 shadow-goldGlowSm'
                )}
              >
                {/* Image Stage */}
                <div
                  className={cn(
                    'relative overflow-hidden bg-charcoal',
                    category.featured ? 'aspect-21/9 sm:aspect-[2.2/1]' : 'aspect-4/3'
                  )}
                >
                  {/* Gradient Vignette */}
                  <div className="absolute inset-0 bg-linear-to-t from-obsidian via-obsidian/50 to-transparent z-10" />
                  <div className="absolute inset-0 bg-linear-to-r from-obsidian/40 via-transparent to-transparent z-10" />

                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    sizes={
                      category.featured
                        ? '(max-width: 768px) 100vw, 66vw'
                        : '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                    }
                  />

                  {/* Top Badges */}
                  <div className="absolute top-4 left-4 right-4 z-20 flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {category.icon && (
                        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-obsidian/70 border border-border backdrop-blur-md text-gold">
                          {category.icon}
                        </span>
                      )}
                      {category.badge && (
                        <Badge variant="gold" size="sm">
                          {category.badge}
                        </Badge>
                      )}
                    </div>

                    {/* Inventory Counter Pill */}
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-obsidian/80 border border-border backdrop-blur-md text-[10px] font-sans font-semibold uppercase tracking-wider text-secondary">
                      {category.count} vehicles
                    </span>
                  </div>

                  {/* Content Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 z-20">
                    <div className="flex items-end justify-between gap-4">
                      <div className="space-y-1.5 min-w-0">
                        <h3
                          className={cn(
                            'font-serif font-light text-primary tracking-tight transition-colors group-hover:text-gold',
                            category.featured
                              ? 'text-2xl sm:text-3xl md:text-4xl'
                              : 'text-xl sm:text-2xl'
                          )}
                        >
                          {category.name}
                        </h3>
                        <p
                          className={cn(
                            'text-secondary font-sans leading-relaxed',
                            category.featured
                              ? 'text-sm sm:text-base max-w-md'
                              : 'text-xs sm:text-sm line-clamp-2'
                          )}
                        >
                          {category.description}
                        </p>
                      </div>

                      {/* Hover CTA Arrow */}
                      <div
                        className={cn(
                          'shrink-0 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-obsidian/60 backdrop-blur-md text-gold',
                          'opacity-0 translate-x-2 transition-all duration-300',
                          'group-hover:opacity-100 group-hover:translate-x-0 group-hover:border-gold/40 group-hover:shadow-goldGlowSm'
                        )}
                      >
                        <ArrowRight size={16} />
                      </div>
                    </div>

                    {/* Bottom Gold Progress Line on Hover */}
                    <div className="mt-4 h-0.5 w-full bg-border/60 overflow-hidden rounded-full">
                      <div className="h-full w-0 bg-gold transition-all duration-500 ease-out group-hover:w-full" />
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CategoryGrid;