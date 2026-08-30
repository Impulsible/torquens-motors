'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  Quote,
  ShieldCheck,
  Sparkles,
  Clock,
  Award,
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export function EditorialSection() {
  return (
    <section className="relative py-16 md:py-24 lg:py-32 bg-obsidian overflow-hidden border-t border-border/40">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 rounded-full bg-gold/5 blur-[140px]"
        style={{ width: 500, height: 500 }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-1/4 rounded-full bg-gold/5 blur-[100px]"
        style={{ width: 400, height: 300 }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-checkerboard opacity-[0.015]"
      />

      <div className="container-torquens relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Media stage */}
          <div className="lg:col-span-6 order-2 lg:order-1 relative group">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-6 -left-6 w-28 h-28 border border-gold/20 rounded-full transition-transform duration-700 group-hover:scale-110"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-4 -right-4 w-20 h-20 border border-gold/15 rounded-full transition-transform duration-700 group-hover:scale-110"
            />

            <div className="relative aspect-4/3 sm:aspect-16/10 overflow-hidden rounded-xl border border-border/80 shadow-card bg-charcoal">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/15 to-transparent z-20"
              />

              <Image
                src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1600&auto=format&fit=crop"
                alt="The Art of Automotive Excellence — TORQUENS Editorial"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center brightness-90 contrast-105 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-linear-to-t from-obsidian/70 via-transparent to-black/20 pointer-events-none" />

              <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-auto sm:max-w-xs">
                <div className="rounded-lg bg-graphite/80 backdrop-blur-xl border border-white/10 p-4 shadow-dropdown">
                  <Quote className="h-4 w-4 text-gold mb-2 opacity-70" />
                  <p className="font-serif text-sm text-primary leading-snug italic">
                    &ldquo;Exceptional vehicles are expressions of engineering artistry.&rdquo;
                  </p>
                  <span className="mt-2 block text-[10px] uppercase tracking-widest text-muted font-sans font-semibold">
                    — TORQUENS Editorial
                  </span>
                </div>
              </div>
            </div>

            <div className="hidden sm:flex absolute -bottom-5 -right-4 lg:-right-8 z-20 items-center gap-3 rounded-lg bg-graphite/95 backdrop-blur-xl border border-border/80 px-4 py-3 shadow-card">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gold/10 border border-gold/20 text-gold">
                <Award className="h-4 w-4" />
              </div>
              <div>
                <span className="block text-xs font-semibold text-primary font-sans">
                  180-Point Inspection
                </span>
                <span className="text-[10px] text-muted font-mono uppercase tracking-wider">
                  Every Chassis Verified
                </span>
              </div>
            </div>
          </div>

          {/* Editorial narrative */}
          <div className="lg:col-span-6 order-1 lg:order-2 space-y-6">
            <div className="flex items-center gap-2.5">
              <Badge variant="gold" size="sm" leftIcon={<BookOpen className="h-3 w-3" />}>
                Editorial
              </Badge>
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-muted font-mono uppercase tracking-wider">
                <Clock className="h-3 w-3" />
                8 Min Read
              </span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-primary leading-[1.1]">
              The Art of <span className="text-gold-gradient">Automotive Excellence</span>
            </h2>

            <div className="space-y-4 text-secondary font-sans text-sm sm:text-base leading-relaxed max-w-xl">
              <p>
                At TORQUENS, we believe that exceptional vehicles are more than just transportation—they are expressions of engineering artistry, design mastery, and the relentless pursuit of perfection.
              </p>
              <p>
                Our editorial desk explores the stories behind the cars that define automotive culture, from heritage icons and factory race cars to the latest innovations reshaping the future of mobility.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 max-w-md pt-1">
              <div className="flex items-center gap-2.5 p-3 rounded-md bg-charcoal/50 border border-border/60">
                <ShieldCheck className="h-4 w-4 text-emerald shrink-0" />
                <div>
                  <span className="block text-xs font-semibold text-primary font-sans">
                    Verified Provenance
                  </span>
                  <span className="text-[10px] text-muted font-sans">
                    Full chassis history
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-md bg-charcoal/50 border border-border/60">
                <Sparkles className="h-4 w-4 text-gold shrink-0" />
                <div>
                  <span className="block text-xs font-semibold text-primary font-sans">
                    Bespoke Narratives
                  </span>
                  <span className="text-[10px] text-muted font-sans">
                    Owner & marque stories
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link href="/editorial" className="cursor-pointer">
                <Button variant="gold" size="md" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Read Our Stories
                </Button>
              </Link>
              <Link href="/about" className="cursor-pointer">
                <Button variant="secondary" size="md">
                  About TORQUENS
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default EditorialSection;