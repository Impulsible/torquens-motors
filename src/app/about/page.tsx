/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShieldCheck,
  Sparkles,
  Compass,
  ArrowRight,
  Globe2,
  Lock,
  Layers,
  Award,
  CheckCircle2,
  FileCheck2,
  Building2,
  Scale,
  Landmark,
  Quote,
} from 'lucide-react';

import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export const metadata: Metadata = {
  title: 'Provenance & Philosophy | TORQUENS MOTORS',
  description:
    'TORQUENS Motors is a sovereign registry and custodial escrow platform for the world’s most significant automotive assets — historic competition chassis, coachbuilt grand tourers, and bespoke hypercars.',
  keywords: [
    'private car brokerage',
    'concours provenance',
    'hypercar escrow',
    'Geneva Freeport storage',
    'historic race car registry',
    'family office automotive advisory',
  ],
  openGraph: {
    title: 'Provenance & Philosophy | TORQUENS MOTORS',
    description:
      'Where velocity meets provenance. Swiss escrow custody, forensic inspection protocol, and discreet global sourcing for institutional collectors.',
    type: 'website',
  },
};

const HERITAGE_METRICS = [
  { value: '$1.4B+', label: 'Asset Volume Cleared', detail: 'Across sovereign private client vaults' },
  { value: '100%', label: 'Provenance Verified', detail: 'Chassis, titles & matching numbers' },
  { value: '19', label: 'Global Jurisdictions', detail: 'Geneva · Mayfair · Zurich · Dubai · Lagos' },
  { value: '38', label: 'Concours Titlists', detail: 'Pebble Beach & Villa d’Este alumni' },
];

const PILLARS_OF_GOVERNANCE = [
  {
    icon: ShieldCheck,
    title: 'Forensic Provenance Audit',
    description:
      'Every allocation undergoes factory archive verification, chassis stamping analysis, service ledger authentication, and uncompromised title search before publication.',
  },
  {
    icon: Lock,
    title: 'Sovereign Escrow Protocol',
    description:
      'Transactions execute through bonded Swiss and UK legal escrow custody, mitigating currency risk and protecting counterparty capital until physical inspection sign-off.',
  },
  {
    icon: Compass,
    title: 'Discreet Off-Market Sourcing',
    description:
      'Over 60% of our transactions occur outside public channels. We connect serious collectors with unlisted hypercars and competition homologation specials under strict NDA.',
  },
  {
    icon: Globe2,
    title: 'Climate-Insured Logistics',
    description:
      'White-glove cross-border air freight, diplomatic customs clearance, ATA Carnet management, and insured bonded facility storage in Geneva Freeport, London, and Dubai.',
  },
];

const VERIFICATION_STAGES = [
  {
    step: '01',
    title: 'Historical & Title Screening',
    description:
      'Detailed ownership ledger investigation, cross-referencing factory build sheets, original delivery certificates, and international lien registry databases.',
  },
  {
    step: '02',
    title: 'Forensic Mechanical Inspection',
    description:
      'On-site laser chassis alignment audit, paint-depth resonance spectroscopy, original component serial matching, and dynamic dynamometer road-testing.',
  },
  {
    step: '03',
    title: 'Cryptographic Provenance Stamping',
    description:
      'The vehicle is registered in the TORQUENS Vault with permanent digital ledger metadata, high-resolution condition scans, and verified documentation dossiers.',
  },
  {
    step: '04',
    title: 'Escrow Settlement & Handover',
    description:
      'Funds release only upon buyer physical inspection sign-off, accompanied by sealed documentation boxes and insured door-to-door delivery.',
  },
];

const GLOBAL_OFFICES = [
  {
    city: 'Geneva',
    country: 'Switzerland',
    role: 'Global Headquarters & Freeport Custody',
    address: 'Quai du Mont-Blanc 19, 1201 Genève',
    hours: 'Mon–Fri · 09:00–18:00 CET',
  },
  {
    city: 'London',
    country: 'United Kingdom',
    role: 'Private Client Advisory · Mayfair Desk',
    address: '22 Grosvenor Street, Mayfair, W1K 6LF',
    hours: 'Mon–Fri · 09:00–18:00 GMT',
  },
  {
    city: 'Dubai',
    country: 'United Arab Emirates',
    role: 'Middle East & Asia Custody Bureau',
    address: 'DIFC Gate Village 04, Level 7',
    hours: 'Sun–Thu · 09:00–18:00 GST',
  },
];

const CERTIFICATIONS = [
  { icon: Scale, label: 'FINMA Registered Escrow Agent' },
  { icon: Landmark, label: 'Geneva Freeport Bonded Custodian' },
  { icon: FileCheck2, label: 'FIVA-Accredited Historic Vehicle Auditor' },
  { icon: ShieldCheck, label: 'Lloyd’s of London Insured Transit' },
];

const MILESTONES = [
  { year: '2011', event: 'TORQUENS founded in Geneva as a private automotive provenance registry.' },
  { year: '2014', event: 'First sovereign escrow transaction cleared — a 1962 competition chassis.' },
  { year: '2017', event: 'Mayfair advisory desk opened; cumulative cleared volume crosses $250M.' },
  { year: '2020', event: 'Cryptographic Provenance Vault launched for permanent chassis ledgering.' },
  { year: '2023', event: 'Dubai DIFC custody bureau established; Middle East royal mandates onboarded.' },
  { year: '2024', event: 'Cumulative cleared transaction asset volume surpasses $1.4 billion USD.' },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-obsidian text-primary selection:bg-gold/20 selection:text-gold pt-16 sm:pt-20 pb-20 overflow-hidden">
      {/* HERO SECTION — Adjusted Padding to Eliminate Header Void */}
      <section className="relative py-8 md:py-12 border-b border-border/40 overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-160 h-96 bg-gold/5 blur-[140px] rounded-full"
        />

        <Container className="relative z-10">
          <div className="max-w-4xl space-y-5">
            <Badge variant="gold" size="sm">
              <span className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest">
                <Sparkles className="h-3 w-3" />
                Institutional Manifest · Est. Geneva 2011
              </span>
            </Badge>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-light tracking-tight text-primary leading-[1.05]">
              Where velocity meets{' '}
              <span className="italic font-normal text-gold block sm:inline">
                uncompromising provenance.
              </span>
            </h1>

            <p className="text-secondary font-sans text-base sm:text-lg lg:text-xl leading-relaxed max-w-3xl pt-1">
              TORQUENS was established to resolve the opacity of high-tier automotive transactions.
              We operate as a private registry, custodial escrow facility, and discreet brokerage for
              the world’s most discerning collectors, family offices, and marque custodians.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link href="/vehicles">
                <Button
                  variant="gold"
                  size="lg"
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                  className="text-xs uppercase tracking-widest font-semibold"
                >
                  Explore Public Showroom
                </Button>
              </Link>

              <Link href="/contact">
                <Button
                  variant="secondary"
                  size="lg"
                  className="text-xs uppercase tracking-widest border-border hover:border-gold/30"
                >
                  Inquire with Concierge
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* METRICS HUD */}
      <section className="py-10 border-b border-border/40 bg-graphite/40 backdrop-blur-md">
        <Container>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {HERITAGE_METRICS.map((metric, idx) => (
              <div key={idx} className="space-y-1">
                <div className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-gold tabular-nums tracking-tight">
                  {metric.value}
                </div>
                <div className="text-xs font-mono uppercase tracking-widest text-primary pt-1">
                  {metric.label}
                </div>
                <div className="text-[11px] font-sans text-muted leading-tight">
                  {metric.detail}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CRAFTSMANSHIP & PHILOSOPHY */}
      <section className="py-16 md:py-20 border-b border-border/40">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="flex items-center gap-2">
                <div className="h-px w-8 bg-gold" />
                <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-gold">
                  Our Philosophy
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-light text-primary tracking-tight leading-tight">
                An antidote to speculation.{' '}
                <span className="italic text-gold">A sanctuary for historical authenticity.</span>
              </h2>

              <div className="space-y-4 text-sm text-secondary font-sans leading-relaxed">
                <p>
                  In an era saturated with hurried auctions and digital hype, the intrinsic value of
                  extraordinary automobiles lies not in superficial market swings, but in undisputed provenance,
                  documented race victories, and factory-correct mechanical preservation.
                </p>
                <p>
                  TORQUENS acts as an institutional filter. We do not aggregate mass inventory.
                  Every chassis that enters our registry is physically verified, mechanically inspected, and cleared
                  through international title registers before a single client is notified.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="p-4 rounded-xl bg-graphite/60 border border-border/70 space-y-1">
                  <span className="font-serif text-lg text-primary">Confidential Sourcing</span>
                  <p className="text-xs text-muted font-sans">Off-market transactions executed under strict NDA.</p>
                </div>

                <div className="p-4 rounded-xl bg-graphite/60 border border-border/70 space-y-1">
                  <span className="font-serif text-lg text-primary">Escrow Settlement</span>
                  <p className="text-xs text-muted font-sans">Insured multi-currency legal escrow custody.</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative aspect-4/3 sm:aspect-16/11 rounded-2xl overflow-hidden border border-border/80 shadow-2xl group">
                <div className="absolute inset-0 bg-linear-to-t from-obsidian via-transparent to-transparent z-10" />
                <Image
                  src="https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=2070&auto=format&fit=crop"
                  alt="Bespoke hypercar cockpit craftsmanship"
                  fill
                  priority
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />

                <div className="absolute bottom-6 left-6 right-6 z-20 p-4 rounded-xl bg-obsidian/85 backdrop-blur-md border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
                      <Layers className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-serif text-primary">Geneva Freeport & Mayfair Vaults</p>
                      <p className="text-[10px] font-mono text-muted uppercase">Insured Bonded Storage Available</p>
                    </div>
                  </div>

                  <Badge variant="gold" size="sm" className="hidden sm:inline-flex">
                    Secured
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 4 PILLARS */}
      <section className="py-16 md:py-20 border-b border-border/40">
        <Container>
          <div className="max-w-2xl mb-12 space-y-2">
            <Badge variant="gold" size="sm">
              Standard of Integrity
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-serif font-light text-primary tracking-tight">
              The Four Pillars of TORQUENS Custody
            </h2>
            <p className="text-xs sm:text-sm text-secondary font-sans leading-relaxed">
              Our operating framework is modeled after sovereign wealth and private art registry standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PILLARS_OF_GOVERNANCE.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <Card
                  key={idx}
                  className="p-8 bg-graphite/90 border-border/80 hover:border-gold/30 transition-all duration-300 relative overflow-hidden backdrop-blur-md shadow-dropdown group flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="h-12 w-12 rounded-xl bg-obsidian border border-gold/30 flex items-center justify-center text-gold shadow-sm group-hover:scale-105 transition-transform duration-300">
                      <Icon className="h-6 w-6" />
                    </div>

                    <h3 className="text-xl font-serif font-light text-primary group-hover:text-gold transition-colors tracking-tight">
                      {pillar.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-secondary font-sans leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-border/30 flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-gold">
                    <span>Protocol Pillar 0{idx + 1}</span>
                  </div>
                </Card>
              );
            })}
          </div>
        </Container>
      </section>

      {/* 4-STAGE VERIFICATION */}
      <section className="py-16 md:py-20 border-b border-border/40 bg-graphite/30 backdrop-blur-sm">
        <Container>
          <div className="max-w-2xl mb-12 space-y-2">
            <span className="text-[10px] font-mono tracking-widest uppercase text-gold block">
              Inspection Ledger
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-light text-primary tracking-tight">
              The Four-Stage Authentication Process
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {VERIFICATION_STAGES.map((stage) => (
              <Card
                key={stage.step}
                className="p-6 bg-graphite/80 border-border/80 relative overflow-hidden backdrop-blur-md flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="font-serif text-3xl font-light text-gold/40">
                    {stage.step}
                  </div>
                  <h3 className="text-base font-serif text-primary tracking-tight">
                    {stage.title}
                  </h3>
                  <p className="text-xs text-secondary font-sans leading-relaxed">
                    {stage.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-border/30 flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
                  <CheckCircle2 size={12} />
                  <span>Mandatory Checkpoint</span>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* TIMELINE */}
      <section className="py-16 md:py-20 border-b border-border/40">
        <Container>
          <div className="max-w-2xl mb-12 space-y-2">
            <Badge variant="gold" size="sm">
              Institutional Heritage
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-serif font-light text-primary tracking-tight">
              A Ledger of Milestones
            </h2>
          </div>

          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-px bg-linear-to-b from-transparent via-border to-transparent"
            />

            <ol className="space-y-8">
              {MILESTONES.map((m, idx) => (
                <li
                  key={m.year}
                  className={`relative flex items-start gap-6 sm:gap-0 ${
                    idx % 2 === 0 ? 'sm:flex-row' : 'sm:flex-row-reverse'
                  }`}
                >
                  <div className="sm:w-1/2 sm:px-8">
                    <div className="p-5 rounded-xl bg-graphite/70 border border-border/70 backdrop-blur-sm hover:border-gold/30 transition-colors">
                      <div className="font-serif text-2xl text-gold tabular-nums">{m.year}</div>
                      <p className="text-xs sm:text-sm text-secondary font-sans leading-relaxed pt-2">
                        {m.event}
                      </p>
                    </div>
                  </div>

                  <div className="absolute left-4 sm:left-1/2 -translate-x-1/2 top-6 h-3 w-3 rounded-full bg-gold ring-4 ring-obsidian" />
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </section>

      {/* REGULATORY STANDING */}
      <section className="py-16 md:py-20 border-b border-border/40 bg-graphite/30 backdrop-blur-sm">
        <Container>
          <div className="max-w-2xl mb-10 space-y-2">
            <span className="text-[10px] font-mono tracking-widest uppercase text-gold block">
              Regulatory Standing
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-light text-primary tracking-tight">
              Accreditations & Custodial Licensing
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CERTIFICATIONS.map((c, idx) => {
              const Icon = c.icon;
              return (
                <div
                  key={idx}
                  className="p-5 rounded-xl bg-graphite/70 border border-border/70 hover:border-gold/30 transition-colors flex flex-col items-start gap-3"
                >
                  <div className="h-10 w-10 rounded-lg bg-obsidian border border-gold/30 flex items-center justify-center text-gold">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs sm:text-[13px] font-serif text-primary leading-snug">
                    {c.label}
                  </span>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* GLOBAL OFFICES */}
      <section className="py-16 md:py-20 border-b border-border/40">
        <Container>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div className="space-y-2">
              <Badge variant="gold" size="sm">
                Global Presence
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-serif font-light text-primary tracking-tight">
                Concierge Desks & Custody Bureaus
              </h2>
            </div>
            <span className="text-xs font-mono uppercase tracking-widest text-muted">
              Geneva · London · Dubai
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {GLOBAL_OFFICES.map((office, idx) => (
              <Card
                key={idx}
                className="p-6 bg-graphite/90 border-border/80 hover:border-gold/30 transition-all duration-300 group flex flex-col justify-between space-y-5"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="h-10 w-10 rounded-lg bg-obsidian border border-gold/30 flex items-center justify-center text-gold group-hover:scale-105 transition-transform">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-muted">
                      Desk 0{idx + 1}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-serif font-light text-primary group-hover:text-gold transition-colors">
                      {office.city}
                    </h3>
                    <div className="text-[11px] font-mono uppercase tracking-widest text-muted pt-1">
                      {office.country}
                    </div>
                  </div>

                  <p className="text-xs font-serif italic text-gold">{office.role}</p>
                </div>

                <div className="pt-4 border-t border-border/40 space-y-1 text-xs text-secondary font-sans">
                  <div>{office.address}</div>
                  <div className="text-[11px] font-mono text-muted">{office.hours}</div>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* FINAL DIALOGUE CTA */}
      <section className="pt-16 md:pt-20">
        <Container>
          <div className="relative rounded-2xl border border-gold/30 bg-graphite/90 p-8 sm:p-14 overflow-hidden shadow-dropdown backdrop-blur-md text-center max-w-4xl mx-auto space-y-6">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-gold to-transparent" />

            <div className="w-16 h-16 rounded-full border border-gold/30 bg-gold/5 flex items-center justify-center mx-auto shadow-glow text-gold">
              <Sparkles className="h-7 w-7 stroke-[1.5]" />
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl sm:text-4xl font-serif font-light text-primary tracking-tight">
                Initiate a Confidential Dialogue
              </h2>
              <p className="text-xs sm:text-sm text-secondary font-sans max-w-xl mx-auto leading-relaxed">
                Whether seeking to acquire an unlisted competition chassis, liquidate a significant private collection,
                or register as an accredited custodian, our senior directorate is at your disposal.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/contact" className="w-full sm:w-auto">
                <Button
                  variant="gold"
                  size="lg"
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                  className="w-full sm:w-auto text-xs uppercase tracking-widest font-semibold"
                >
                  Contact Senior Directorate
                </Button>
              </Link>

              <Link href="/dealers" className="w-full sm:w-auto">
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto text-xs uppercase tracking-widest border-border hover:border-gold/30"
                >
                  Browse Custodian Network
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}