'use client';

import Link from 'next/link';
import {
  Shield,
  CheckCircle2,
  Award,
  Clock,
  Users,
  Star,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Lock,
  BadgeCheck,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';

interface TrustPoint {
  icon: React.ComponentType<{ className?: string; size?: number }>;
  title: string;
  description: string;
  accent?: 'gold' | 'emerald';
}

interface TrustStat {
  value: string;
  label: string;
  sublabel?: string;
}

const trustPoints: TrustPoint[] = [
  {
    icon: ShieldCheck,
    title: 'TORQUENS Verified',
    description:
      'Every listing passes chassis, document, and ownership verification before going live.',
    accent: 'emerald',
  },
  {
    icon: CheckCircle2,
    title: '150-Point Inspection',
    description:
      'Independent technical assessments covering mechanical, electrical, and cosmetic integrity.',
    accent: 'gold',
  },
  {
    icon: Award,
    title: 'Curated Inventory',
    description:
      'Only premium, exotic, and executive vehicles that meet our editorial quality threshold.',
    accent: 'gold',
  },
  {
    icon: Clock,
    title: '24-Hour Concierge',
    description:
      'Dedicated response on enquiries, inspections, and viewing requests within one business day.',
    accent: 'gold',
  },
  {
    icon: Users,
    title: 'Verified Dealers Only',
    description:
      'Dealership partners are business-verified, contact-verified, and continuously monitored.',
    accent: 'emerald',
  },
  {
    icon: Star,
    title: 'Collector-First Service',
    description:
      'Private allocations, off-market alerts, and white-glove acquisition support for members.',
    accent: 'gold',
  },
];

const trustStats: TrustStat[] = [
  { value: '1,200+', label: 'Verified Vehicles', sublabel: 'Actively listed' },
  { value: '180+', label: 'Trusted Dealers', sublabel: 'Across Nigeria' },
  { value: '< 24h', label: 'Avg. Response', sublabel: 'Enquiry to reply' },
  { value: '98%', label: 'Satisfaction', sublabel: 'Buyer-reported' },
];

export function TrustSection() {
  return (
    <section className="relative py-16 md:py-24 bg-obsidian overflow-hidden">
      {/* Ambient Atmosphere */}
      <div className="pointer-events-none absolute inset-0 checkerboard-bg opacity-[0.03]" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-225 h-125 bg-gold/5 blur-[140px] rounded-full" />

      <div className="container-torquens relative z-10">
        {/* ----------------------------------------------------------------- */}
        {/* SECTION HEADER                                                    */}
        {/* ----------------------------------------------------------------- */}
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold text-[11px] font-sans font-semibold uppercase tracking-widest">
            <Sparkles size={12} />
            Why TORQUENS
          </div>
          <h2 className="section-title">Engineered to Move You</h2>
          <p className="text-secondary text-sm md:text-base font-sans leading-relaxed">
            We combine automotive excellence with verified trust infrastructure —
            so acquiring a luxury vehicle feels as refined as driving one.
          </p>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* HERO TRUST BANNER                                                 */}
        {/* ----------------------------------------------------------------- */}
        <div className="mb-10 md:mb-14 p-6 sm:p-8 rounded-2xl bg-graphite border border-active-border relative overflow-hidden shadow-card">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-gold/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-8">
            {/* Left: Guarantee Copy */}
            <div className="flex-1 space-y-4">
              <Badge variant="verified" size="md" glow>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  TORQUENS Verified Guarantee
                </span>
              </Badge>

              <h3 className="text-2xl sm:text-3xl font-serif font-light text-primary tracking-tight">
                Trust is not optional — it is engineered.
              </h3>
              <p className="text-secondary text-sm font-sans leading-relaxed max-w-xl">
                Every vehicle on TORQUENS passes document review, seller verification,
                and optional concierge inspection. Buy with confidence, whether you are
                acquiring from Lagos, Abuja, or an international private seller.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <span className="inline-flex items-center gap-1.5 text-xs font-sans text-secondary">
                  <Lock size={13} className="text-gold" />
                  Secured enquiries
                </span>
                <span className="text-border">•</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-sans text-secondary">
                  <BadgeCheck size={13} className="text-emerald" />
                  Chassis verified
                </span>
                <span className="text-border">•</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-sans text-secondary">
                  <CheckCircle2 size={13} className="text-gold" />
                  Duty & papers reviewed
                </span>
              </div>
            </div>

            {/* Right: Live Stats */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:w-95 shrink-0">
              {trustStats.map((stat) => (
                <div
                  key={stat.label}
                  className="p-4 rounded-xl bg-inset border border-border hover:border-active-border transition-colors duration-300"
                >
                  <div className="text-xl sm:text-2xl font-serif font-light text-gold tracking-tight">
                    {stat.value}
                  </div>
                  <div className="text-[11px] font-sans font-semibold uppercase tracking-wider text-primary mt-1">
                    {stat.label}
                  </div>
                  {stat.sublabel && (
                    <div className="text-[10px] font-sans text-muted mt-0.5">
                      {stat.sublabel}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* TRUST POINTS GRID                                                 */}
        {/* ----------------------------------------------------------------- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {trustPoints.map((point, index) => {
            const Icon = point.icon;
            const isEmerald = point.accent === 'emerald';

            return (
              <Card
                key={index}
                className={cn(
                  'group relative p-6 bg-graphite border-border overflow-hidden',
                  'transition-all duration-500 hover:-translate-y-1 hover:shadow-card',
                  isEmerald
                    ? 'hover:border-emerald/40'
                    : 'hover:border-gold/40'
                )}
              >
                {/* Hover ambient glow */}
                <div
                  className={cn(
                    'pointer-events-none absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100',
                    isEmerald ? 'bg-emerald/10' : 'bg-gold/10'
                  )}
                />

                <div className="relative z-10 flex items-start gap-4">
                  {/* Icon Stage */}
                  <div
                    className={cn(
                      'shrink-0 w-12 h-12 rounded-xl border flex items-center justify-center transition-all duration-300',
                      isEmerald
                        ? 'bg-emerald/10 border-emerald/20 text-emerald group-hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                        : 'bg-gold/10 border-gold/20 text-gold group-hover:shadow-goldGlowSm'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* Copy */}
                  <div className="min-w-0 space-y-1.5">
                    <h3 className="text-base font-serif font-light text-primary group-hover:text-gold transition-colors duration-300">
                      {point.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-secondary font-sans leading-relaxed">
                      {point.description}
                    </p>
                  </div>
                </div>

                {/* Bottom accent line on hover */}
                <div
                  className={cn(
                    'absolute bottom-0 left-0 h-0.5 w-0 transition-all duration-500 ease-out group-hover:w-full',
                    isEmerald ? 'bg-emerald/60' : 'bg-gold/60'
                  )}
                />
              </Card>
            );
          })}
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* BOTTOM CONCIERGE CTA STRIP                                        */}
        {/* ----------------------------------------------------------------- */}
        <div className="mt-12 md:mt-16 p-5 sm:p-6 rounded-2xl bg-inset border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center text-gold shrink-0">
              <Shield size={18} />
            </div>
            <div>
              <h4 className="text-sm font-sans font-semibold text-primary">
                Need a private acquisition specialist?
              </h4>
              <p className="text-xs text-secondary font-sans mt-0.5">
                Our concierge team can source off-market inventory and coordinate inspections nationwide.
              </p>
            </div>
          </div>

          <Link
            href="/contact"
            className="btn-primary text-xs uppercase tracking-widest font-semibold py-3 px-5 shrink-0 flex items-center gap-2 group"
          >
            <span>Speak to Concierge</span>
            <ArrowRight
              size={14}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default TrustSection;