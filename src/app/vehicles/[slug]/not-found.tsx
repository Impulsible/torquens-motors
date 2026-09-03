'use client';

/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import Link from 'next/link';
import { 
  Car, 
  ArrowLeft, 
  SearchX, 
  KeyRound, 
  Sparkles, 
  Compass, 
  ShieldCheck 
} from 'lucide-react';

import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';

export default function VehicleNotFound() {
  return (
    <main className="relative min-h-[85vh] flex items-center justify-center pt-24 pb-16 bg-obsidian overflow-hidden select-none">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. ATMOSPHERIC BACKGROUND & LIGHTING                          */}
      {/* ───────────────────────────────────────────────────────────── */}
      
      {/* Checkerboard Pattern Grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-checkerboard opacity-20"
      />

      {/* Radial Gold Back-Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-100 bg-radial-hero opacity-70 blur-3xl"
      />

      {/* Top Specular Line Reflection */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/12 to-transparent z-20"
      />

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. MAIN DOSSIER RECOVERY CHASSIS                              */}
      {/* ───────────────────────────────────────────────────────────── */}
      <Container size="sm" className="relative z-10">
        <Card
          variant="glass"
          specular
          ambientGlow
          padding="xl"
          className="text-center shadow-dropdown border-border/80 max-w-xl mx-auto"
        >
          {/* Icon Pedestal with Glow */}
          <div className="relative mb-6 inline-flex items-center justify-center">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-full bg-gold/15 blur-xl"
            />

            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-charcoal/90 border border-border text-gold shadow-inner">
              <SearchX className="h-9 w-9 drop-shadow-[0_0_8px_rgba(197,160,89,0.5)]" />
            </div>
          </div>

          {/* Micro-Telemetry Badge */}
          <div className="flex justify-center mb-3">
            <Badge
              variant="gold"
              size="sm"
              leftIcon={<Sparkles className="h-3 w-3" />}
            >
              ERR_404 • DOSSIER UNREACHABLE
            </Badge>
          </div>

          {/* Heading */}
          <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-primary leading-tight">
            Vehicle Specification Not Found
          </h1>

          {/* Narrative Explanation */}
          <p className="mt-3 font-sans text-xs sm:text-sm text-secondary leading-relaxed max-w-md mx-auto">
            The vehicle dossier you requested may have been acquired by a private client, reserved, or removed from active inventory.
          </p>

          {/* ───────────────────────────────────────────────────────────── */}
          {/* 3. CONCIERGE & NAVIGATION ACTIONS                             */}
          {/* ───────────────────────────────────────────────────────────── */}
          <div className="mt-8 pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/vehicles" className="w-full sm:w-auto">
              <Button
                variant="gold"
                size="md"
                fullWidth
                leftIcon={<Compass className="h-4 w-4" />}
              >
                Browse Showroom
              </Button>
            </Link>

            <Link href="/concierge/sourcing" className="w-full sm:w-auto">
              <Button
                variant="glass"
                size="md"
                fullWidth
                leftIcon={<KeyRound className="h-4 w-4 text-gold" />}
              >
                Request Bespoke Sourcing
              </Button>
            </Link>
          </div>

          {/* Return to Main Home */}
          <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between text-xs font-sans text-muted">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-secondary hover:text-gold gold-underline transition-colors font-medium"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Return to Main Vault</span>
            </Link>

            <div className="flex items-center gap-1 text-[11px] font-mono text-muted/80">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald" />
              <span>TORQUENS Protocol</span>
            </div>
          </div>
        </Card>
      </Container>
    </main>
  );
}