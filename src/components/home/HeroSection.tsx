'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Play,
  ShieldCheck,
  Sparkles,
  Award,
  Globe2,
  KeyRound,
  X as CloseIcon,
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const [isPlayingReel, setIsPlayingReel] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) return;

    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current || !imageRef.current) return;

      const rect = heroRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      animationFrameId = requestAnimationFrame(() => {
        if (imageRef.current) {
          imageRef.current.style.transform = `translate3d(${x * 24}px, ${y * 24}px, 0) scale(1.06)`;
        }
      });
    };

    const hero = heroRef.current;
    hero?.addEventListener('mousemove', handleMouseMove);

    return () => {
      hero?.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  useEffect(() => {
    if (isPlayingReel) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isPlayingReel]);

  return (
    <section
      ref={heroRef}
      className="relative min-h-[92vh] lg:min-h-screen flex items-center overflow-hidden bg-obsidian pt-20 pb-12 select-none"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-checkerboard opacity-20 pointer-events-none" />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 bg-radial-hero opacity-80 blur-3xl"
        style={{ width: 700, height: 500 }}
      />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          ref={imageRef}
          className="absolute inset-0 transition-transform duration-500 ease-out will-change-transform"
        >
          <Image
            src="https://images.unsplash.com/photo-1747007703930-e8a1fba55bd2?q=80&w=2560&auto=format&fit=crop"
            alt="TORQUENS Luxury Automotive Showcase"
            fill
            priority
            quality={90}
            sizes="100vw"
            className="object-cover object-center brightness-110 contrast-110"
          />
        </div>
      </div>

      <div className="absolute inset-0 bg-linear-to-r from-obsidian via-obsidian/85 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-0 bg-linear-to-t from-obsidian via-obsidian/30 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-0 bg-linear-to-b from-obsidian/80 via-transparent to-obsidian z-10 pointer-events-none" />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/15 to-transparent z-20"
      />

      <div className="container-torquens relative z-20 my-auto">
        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2">
            <Badge
              variant="gold"
              size="md"
              dot
              leftIcon={<ShieldCheck className="h-3.5 w-3.5" />}
              className="shadow-[0_0_15px_rgba(197,160,89,0.3)]"
            >
              Verified Provenance Protocol
            </Badge>

            <span className="hidden sm:inline-block text-xs text-secondary font-mono tracking-wider uppercase">
              • Global Allocations Active
            </span>
          </div>

          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-normal leading-[0.98] tracking-tight text-primary">
            ENGINEERED <br />
            <span className="text-gold-gradient font-serif">TO MOVE.</span>
          </h1>

          <p className="font-sans text-secondary text-sm sm:text-base md:text-lg leading-relaxed max-w-xl font-normal">
            An elite digital showroom for rare allocations, iconic marques, and verified motorcars. Selected for those who measure value in acceleration and heritage.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <Link href="/vehicles" className="cursor-pointer">
              <Button
                variant="primary"
                size="lg"
                rightIcon={<ArrowRight className="h-4 w-4" />}
                className="shadow-goldGlow"
              >
                Explore Showroom
              </Button>
            </Link>

            <Link href="/dashboard/enquiries" className="cursor-pointer">
              <Button
                variant="glass"
                size="lg"
                leftIcon={<KeyRound className="h-4 w-4 text-gold" />}
              >
                Bespoke Sourcing
              </Button>
            </Link>

            <button
              type="button"
              onClick={() => setIsPlayingReel(true)}
              aria-label="Play brand showcase film"
              className="group flex items-center gap-3 px-3 py-2 rounded-full bg-charcoal/40 backdrop-blur-md border border-white/10 hover:border-gold/40 transition-all duration-300 ml-0 sm:ml-2 cursor-pointer"
            >
              <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gold text-obsidian shadow-goldGlowSm transition-transform group-hover:scale-110">
                <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
              </span>
              <span className="text-xs font-sans font-semibold tracking-wider text-secondary uppercase group-hover:text-primary transition-colors pr-2">
                2026 Reel
              </span>
            </button>
          </div>

          {/* Metrics */}
          <div className="pt-8 sm:pt-12 grid grid-cols-3 gap-4 border-t border-border/60 max-w-xl">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-primary">
                <Sparkles className="h-4 w-4 text-gold shrink-0" />
                <span className="font-serif text-2xl sm:text-3xl font-normal tracking-tight">
                  $1.2B+
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-secondary font-sans uppercase tracking-wider">
                Verified Value
              </p>
            </div>

            <div className="space-y-1 border-x border-border/60 px-3 sm:px-4">
              <div className="flex items-center gap-1.5 text-primary">
                <Award className="h-4 w-4 text-gold shrink-0" />
                <span className="font-serif text-2xl sm:text-3xl font-normal tracking-tight">
                  100%
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-secondary font-sans uppercase tracking-wider">
                Provenance Rate
              </p>
            </div>

            <div className="space-y-1 pl-2">
              <div className="flex items-center gap-1.5 text-primary">
                <Globe2 className="h-4 w-4 text-emerald shrink-0" />
                <span className="font-serif text-2xl sm:text-3xl font-normal tracking-tight">
                  24/7
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-secondary font-sans uppercase tracking-wider">
                VIP Desk Active
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 text-muted pointer-events-none select-none">
        <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-secondary/80">
          Scroll
        </span>
        <div className="flex h-8 w-5 justify-center rounded-full border border-border bg-charcoal/40 p-1">
          <div className="h-2 w-1 rounded-full bg-gold animate-bounce" />
        </div>
      </div>

      {/* Reel modal */}
      {isPlayingReel && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian/90 backdrop-blur-2xl animate-fade-in cursor-pointer"
          onClick={() => setIsPlayingReel(false)}
        >
          <div
            className="relative aspect-video w-full max-w-4xl rounded-xl bg-graphite border border-border shadow-dropdown overflow-hidden cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsPlayingReel(false)}
              aria-label="Close video"
              className="absolute top-4 right-4 z-10 rounded-full bg-obsidian/80 p-2 text-white hover:text-gold transition-colors cursor-pointer"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
            <iframe
              className="h-full w-full"
              src="https://www.youtube-nocookie.com/embed/_ELWvr7fgUQ?autoplay=1"
              title="TORQUENS Motors Brand Showcase"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </section>
  );
}

export default HeroSection;