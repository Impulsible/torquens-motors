'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Car,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  BadgeCheck,
  Clock,
  Users,
  CircleDollarSign,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';

const processSteps = [
  {
    step: '01',
    title: 'Value',
    description: 'Instant market estimate',
    icon: CircleDollarSign,
  },
  {
    step: '02',
    title: 'Verify',
    description: 'Docs & inspection path',
    icon: BadgeCheck,
  },
  {
    step: '03',
    title: 'Connect',
    description: 'Matched verified buyers',
    icon: Users,
  },
];

const trustStats = [
  { icon: Clock, label: 'Avg. valuation', value: '< 2 hrs' },
  { icon: Users, label: 'Active buyers', value: '4,800+' },
  { icon: ShieldCheck, label: 'Verified dealers', value: '180+' },
];

export function SellTradeCTA() {
  return (
    <section className="relative py-16 md:py-24 bg-obsidian overflow-hidden">
      <div className="pointer-events-none absolute inset-0 checkerboard-bg opacity-[0.03]" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/5 blur-[130px]"
        style={{ width: 800, height: 400 }}
      />

      <div className="container-torquens relative z-10">
        <Card
          className={cn(
            'relative overflow-hidden border-gold/20 bg-graphite shadow-card',
            'p-6 sm:p-8 md:p-10 lg:p-12'
          )}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -right-24 rounded-full bg-gold/10 blur-3xl"
            style={{ width: 288, height: 288 }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-28 -left-20 rounded-full bg-gold/5 blur-3xl"
            style={{ width: 256, height: 256 }}
          />
          <div className="pointer-events-none absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-gold to-transparent" />
          <div className="pointer-events-none absolute inset-0 checkerboard-bg opacity-[0.04]" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* LEFT — Copy, steps, stats */}
            <div className="lg:col-span-7 space-y-8">
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold text-[11px] font-sans font-semibold uppercase tracking-widest">
                  <Sparkles size={12} />
                  Sell / Trade
                </div>
                <Badge variant="verified" size="sm">
                  <span className="inline-flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" />
                    Verified Buyer Network
                  </span>
                </Badge>
              </div>

              <div className="space-y-3">
                <h2 className="text-3xl sm:text-4xl md:text-[2.75rem] font-serif font-light text-primary tracking-tight leading-[1.15]">
                  Ready to Sell or Trade <span className="text-gold">Your Vehicle?</span>
                </h2>
                <p className="text-secondary text-sm md:text-base font-sans leading-relaxed max-w-xl">
                  Receive a competitive market valuation and connect with verified collectors, dealers, and private buyers through the TORQUENS marketplace — privately, securely, and on your terms.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {processSteps.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.step}
                      className={cn(
                        'relative p-4 rounded-xl bg-inset border border-border',
                        'hover:border-gold/30 transition-colors duration-300 group/step'
                      )}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-mono font-semibold tracking-widest text-muted">
                          {item.step}
                        </span>
                        <Icon
                          size={16}
                          className="text-gold/70 group-hover/step:text-gold transition-colors"
                        />
                      </div>
                      <h3 className="text-sm font-serif font-light text-primary">{item.title}</h3>
                      <p className="text-[11px] font-sans text-secondary mt-0.5">
                        {item.description}
                      </p>

                      {index < processSteps.length - 1 && (
                        <div className="hidden sm:block absolute top-1/2 -right-1.5 w-3 h-px bg-border" />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-1 border-t border-border/60">
                {trustStats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="flex items-center gap-2.5 py-3">
                      <div className="w-8 h-8 rounded-md bg-gold/10 border border-gold/20 flex items-center justify-center text-gold shrink-0">
                        <Icon size={14} />
                      </div>
                      <div>
                        <div className="text-sm font-sans font-semibold text-primary leading-none">
                          {stat.value}
                        </div>
                        <div className="text-[10px] font-sans uppercase tracking-wider text-muted mt-1">
                          {stat.label}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT — CTA Panel */}
            <div className="lg:col-span-5">
              <div className="relative p-6 sm:p-7 rounded-2xl bg-obsidian border border-active-border overflow-hidden">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-16 -right-16 rounded-full bg-gold/10 blur-3xl"
                  style={{ width: 160, height: 160 }}
                />

                <div className="relative z-10 space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold">
                      <Car size={22} />
                    </div>
                    <div>
                      <h3 className="text-base font-serif font-light text-primary">
                        Start Your Listing
                      </h3>
                      <p className="text-[11px] font-sans text-secondary">
                        Private sellers & dealers welcome
                      </p>
                    </div>
                  </div>

                  <ul className="space-y-2.5">
                    {[
                      'Complimentary market valuation',
                      'Optional concierge inspection',
                      'Matched to verified buyers only',
                      'Full control over price & visibility',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-xs font-sans text-secondary">
                        <ShieldCheck size={14} className="text-gold shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex flex-col gap-2.5 pt-1">
                    <Link href="/sell-trade" className="w-full cursor-pointer">
                      <button
                        type="button"
                        className="btn-primary w-full text-xs uppercase tracking-widest font-semibold py-3.5 px-5 flex items-center justify-center gap-2 group cursor-pointer"
                      >
                        <span>List Your Vehicle</span>
                        <ArrowRight
                          size={15}
                          className="group-hover:translate-x-1 transition-transform"
                        />
                      </button>
                    </Link>

                    <Link href="/sell-trade" className="w-full cursor-pointer">
                      <button
                        type="button"
                        className="btn-secondary w-full text-xs uppercase tracking-widest font-medium py-3.5 px-5 flex items-center justify-center gap-2 group cursor-pointer"
                      >
                        <TrendingUp size={15} className="text-gold" />
                        <span>Get Instant Valuation</span>
                      </button>
                    </Link>
                  </div>

                  <p className="text-[11px] font-sans text-muted text-center leading-relaxed">
                    No listing fees to start. Dealer partners can also apply for{' '}
                    <Link
                      href="/dealer/register"
                      className="text-gold hover:text-gold-hover gold-underline cursor-pointer"
                    >
                      verified dealer access
                    </Link>
                    .
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}

export default SellTradeCTA;