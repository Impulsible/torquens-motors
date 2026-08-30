'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
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

const CATEGORIES: Category[] = [
  {
    id: 'performance',
    name: 'Performance',
    description: 'Engineered for speed, precision, and pure adrenaline.',
    image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=1600&auto=format&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?q=80&w=1200&auto=format&fit=crop',
    count: 38,
    href: '/vehicles?category=suv',
    icon: <Mountain className="h-4 w-4" />,
  },
  {
    id: 'executive',
    name: 'Executive',
    description: 'Refined elegance for the discerning professional.',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=1200&auto=format&fit=crop',
    count: 52,
    href: '/vehicles?category=executive',
    icon: <Briefcase className="h-4 w-4" />,
  },
  {
    id: 'electric',
    name: 'Electric & Hybrid',
    description: 'Silent power. Zero compromise luxury.',
    image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=1200&auto=format&fit=crop',
    count: 18,
    href: '/vehicles?category=electric',
    icon: <Zap className="h-4 w-4" />,
    badge: 'EV Future',
  },
  {
    id: 'german-engineering',
    name: 'German Engineering',
    description: 'Precision craftsmanship at its absolute finest.',
    image: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=1200&auto=format&fit=crop',
    count: 67,
    href: '/vehicles?category=german',
    icon: <Crown className="h-4 w-4" />,
  },
  {
    id: 'weekend-icons',
    name: 'Weekend Icons',
    description: 'For the moments that matter most.',
    image: 'https://images.unsplash.com/photo-1621135802920-133df287f89c?q=80&w=1200&auto=format&fit=crop',
    count: 23,
    href: '/vehicles?category=weekend',
    icon: <Flag className="h-4 w-4" />,
  },
];

export function CategoryGrid() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const updateActiveIndex = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>('[data-category-card]');
    const cardWidth = card?.offsetWidth ?? 300;
    const gap = 16;
    const index = Math.round(el.scrollLeft / (cardWidth + gap));
    setActiveIndex(Math.min(Math.max(index, 0), CATEGORIES.length - 1));
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    updateActiveIndex();
    el.addEventListener('scroll', updateActiveIndex, { passive: true });
    return () => el.removeEventListener('scroll', updateActiveIndex);
  }, [updateActiveIndex]);

  return (
    <section className="relative py-16 md:py-24 bg-obsidian overflow-hidden">
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 rounded-full bg-gold/5 blur-[140px]"
        style={{ width: 900, height: 400 }}
      />
      <div className="pointer-events-none absolute inset-0 checkerboard-bg opacity-[0.03]" />

      <div className="container-torquens relative z-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10 md:mb-14 px-4 md:px-0">
          <div className="max-w-xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold text-[11px] font-sans font-semibold uppercase tracking-widest">
              <Sparkles size={12} />
              Curated Collections
            </div>
            <h2 className="section-title">Find Your Perfect Drive</h2>
            <p className="text-secondary text-sm md:text-base font-sans leading-relaxed">
              Explore TORQUENS lifestyle categories — from high-performance icons to executive luxury and next-generation electric vehicles.
            </p>
          </div>

          <Link
            href="/vehicles"
            className="group inline-flex items-center gap-2 text-xs font-sans font-semibold uppercase tracking-widest text-gold hover:text-gold-hover transition-colors cursor-pointer"
          >
            <span>View Full Inventory</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Hybrid layout: mobile snap rail → desktop bento */}
        <div
          ref={scrollerRef}
          className={cn(
            // Mobile
            'flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 px-4',
            '[-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden',
            // Desktop
            'md:grid md:grid-cols-2 lg:grid-cols-3 md:overflow-visible md:pb-0 md:gap-6 md:px-0'
          )}
        >
          {CATEGORIES.map((category) => (
            <Link
              key={category.id}
              href={category.href}
              data-category-card
              className={cn(
                'group block cursor-pointer focus-visible:outline-none',
                'shrink-0 snap-start w-[min(85vw,320px)]',
                'md:w-full md:shrink',
                category.featured && 'md:col-span-2 lg:col-span-2'
              )}
            >
              <Card
                className={cn(
                  'relative h-full overflow-hidden bg-graphite border-border transition-all duration-500',
                  'hover:border-gold/40 hover:shadow-card md:hover:-translate-y-1',
                  category.featured && 'md:border-gold/20 md:shadow-goldGlowSm'
                )}
              >
                <div
                  className={cn(
                    'relative overflow-hidden bg-charcoal',
                    category.featured
                      ? 'aspect-4/3 md:aspect-21/9 lg:aspect-[2.2/1]'
                      : 'aspect-4/3'
                  )}
                >
                  <div className="absolute inset-0 bg-linear-to-t from-obsidian via-obsidian/50 to-transparent z-10" />
                  <div className="absolute inset-0 bg-linear-to-r from-obsidian/40 via-transparent to-transparent z-10" />

                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    sizes={
                      category.featured
                        ? '(max-width: 768px) 85vw, 66vw'
                        : '(max-width: 768px) 85vw, (max-width: 1200px) 50vw, 33vw'
                    }
                  />

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

                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-obsidian/80 border border-border backdrop-blur-md text-[10px] font-sans font-semibold uppercase tracking-wider text-secondary">
                      {category.count} vehicles
                    </span>
                  </div>

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

                      <div
                        className={cn(
                          'shrink-0 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-obsidian/60 backdrop-blur-md text-gold cursor-pointer',
                          'opacity-100 md:opacity-0 md:translate-x-2 transition-all duration-300',
                          'md:group-hover:opacity-100 md:group-hover:translate-x-0 group-hover:border-gold/40 group-hover:shadow-goldGlowSm'
                        )}
                      >
                        <ArrowRight size={16} />
                      </div>
                    </div>

                    <div className="mt-4 h-0.5 w-full bg-border/60 overflow-hidden rounded-full">
                      <div className="h-full w-0 bg-gold transition-all duration-500 ease-out group-hover:w-full" />
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Mobile progress dots */}
        <div className="md:hidden mt-5 flex items-center justify-center gap-1.5">
          {CATEGORIES.map((c, i) => (
            <span
              key={c.id}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                i === activeIndex ? 'w-6 bg-gold' : 'w-1.5 bg-border'
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default CategoryGrid;