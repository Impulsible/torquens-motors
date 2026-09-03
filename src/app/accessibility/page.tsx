/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ShieldCheck,
  Sparkles,
  Keyboard,
  Eye,
  Volume2,
  CheckCircle2,
  MousePointerClick,
  Layers,
  Scale,
  Clock,
  Mail,
  Phone,
  FileCheck2,
  Compass,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Digital Accessibility Statement | TORQUENS MOTORS',
  description:
    'Our institutional commitment to universal accessibility, WCAG 2.1 Level AA conformance, and sovereign digital inclusivity across the TORQUENS private client registry.',
  keywords: [
    'TORQUENS accessibility statement',
    'WCAG 2.1 AA compliance',
    'screen reader support',
    'keyboard accessible automotive registry',
    'digital inclusion governance',
  ],
  openGraph: {
    title: 'Accessibility Statement & Standards | TORQUENS MOTORS',
    description:
      'Universal access to sovereign automotive provenance. Discover our technical accessibility architecture, compatibility standards, and formal accommodation desk.',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

// ─────────────────────────────────────────────────────────────
// DATA CONFIGURATION
// ─────────────────────────────────────────────────────────────

const TECHNICAL_PILLARS = [
  {
    icon: Keyboard,
    title: 'Keyboard Operability & Focus Geometry',
    badge: 'WCAG 2.1.1 & 2.4.7',
    description:
      'Every interactive workflow—from showroom filtration to sovereign escrow dispatch—is fully traversable via standard keyboard navigation.',
    features: [
      'Visible, high-contrast gold focus rings (2px outline offset)',
      'Dedicated skip-to-content landmark bypass mechanisms',
      'Cyclic modal focus traps with automatic trigger focus restoration',
      'Native Escape key dismissal on all drawers and dialog surfaces',
    ],
  },
  {
    icon: Eye,
    title: 'Perceptual & Contrast Architecture',
    badge: 'WCAG 1.4.3 & 1.4.11',
    description:
      'Engineered with strict mathematical contrast thresholds across our dark Obsidian and Graphite aesthetic system.',
    features: [
      'Minimum 4.5:1 contrast ratio on all primary and secondary body copy',
      'Minimum 3.0:1 contrast ratio on graphical elements and active borders',
      'Fluid typography responsive up to 200% zoom without horizontal clipping',
      'Zero color-dependent data states; symbols and text accompany all indicators',
    ],
  },
  {
    icon: Volume2,
    title: 'Screen Reader & Semantic Telemetry',
    badge: 'WCAG 1.3.1 & 4.1.2',
    description:
      'Structured using clean HTML5 landmarks, WAI-ARIA 1.2 specifications, and dual-channel persistent live regions.',
    features: [
      'Dedicated ARIA live regions for filter counts, search results, and alerts',
      'Visually hidden descriptive context for icon buttons and tabular data',
      'Accurate aria-expanded, aria-controls, and aria-current states',
      'Detailed alternative text (alt tags) for historical and mechanical imagery',
    ],
  },
  {
    icon: MousePointerClick,
    title: 'Touch Precision & Motor Accessibility',
    badge: 'WCAG 2.5.5 & 2.2.2',
    description:
      'Designed to accommodate diverse physical input modalities, motor control variances, and vestibule comfort.',
    features: [
      'Minimum interactive touch target bounds of 44 × 44 CSS pixels',
      'Full compliance with prefers-reduced-motion system directives',
      'Elastic rubber-banding touch swipe physics on mobile drawer surfaces',
      'Form input zoom prevention on iOS viewports (fixed 16px font minimum)',
    ],
  },
];

const COMPATIBILITY_MATRIX = [
  {
    category: 'Desktop Environments',
    combinations: [
      { tool: 'VoiceOver', browser: 'Safari 17+ (macOS Sonoma / Sequoia)' },
      { tool: 'NVDA (2023+)', browser: 'Google Chrome / Mozilla Firefox (Windows 11)' },
      { tool: 'JAWS (2023+)', browser: 'Microsoft Edge / Google Chrome (Windows 11)' },
    ],
  },
  {
    category: 'Mobile & Tablet Platforms',
    combinations: [
      { tool: 'VoiceOver', browser: 'Mobile Safari (iOS / iPadOS 17+)' },
      { tool: 'TalkBack', browser: 'Google Chrome (Android 13+)' },
      { tool: 'Switch Access', browser: 'iOS & Android Native Assistive Touch' },
    ],
  },
];

const FORMAL_STANDARDS = [
  { standard: 'WCAG 2.1 / 2.2', level: 'Level AA Conformance', status: 'Conformant' },
  { standard: 'European Accessibility Act (EAA)', level: 'EN 301 549 Harmonised', status: 'Aligned' },
  { standard: 'Swiss Federal Act (BehiG)', level: 'Article 8 Digital Equality', status: 'Compliant' },
  { standard: 'US Section 508 & ADA Title III', level: 'Electronic Information Standards', status: 'Aligned' },
];

export default function AccessibilityPage() {
  return (
    <main
      id="main-content"
      className="min-h-screen bg-obsidian text-primary selection:bg-gold selection:text-obsidian pt-24 pb-20 overflow-hidden"
    >
      {/* ───────────────────────────────────────────────────────── */}
      {/* HERO SECTION                                              */}
      {/* ───────────────────────────────────────────────────────── */}
      <section className="relative py-16 md:py-24 border-b border-border/40 overflow-hidden">
        {/* Ambient Glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-160 h-96 bg-gold/5 blur-[140px] rounded-full"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 checkerboard-bg opacity-[0.02]"
        />

        <Container className="relative z-10">
          <div className="max-w-3xl space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="gold" size="sm">
                <span className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest">
                  <ShieldCheck className="h-3 w-3" />
                  Institutional Governance
                </span>
              </Badge>
              <span className="text-xs font-mono uppercase tracking-widest text-muted">
                Updated: Q1 2025
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-light tracking-tight text-primary leading-[1.1]">
              Accessibility Statement &{' '}
              <span className="italic font-normal text-gold block sm:inline">
                Universal Standards.
              </span>
            </h1>

            <p className="text-secondary font-sans text-base sm:text-lg leading-relaxed pt-2">
              TORQUENS MOTORS is dedicated to providing an uncompromised, dignified digital experience
              for every private client, curator, and collector. We hold digital accessibility to the same
              rigorous institutional standards as our physical vehicle forensics and sovereign escrow frameworks.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-[11px] font-mono uppercase tracking-widest text-muted">
              <span className="inline-flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Target: WCAG 2.1 Level AA
              </span>
              <span className="hidden sm:inline text-border">·</span>
              <span className="inline-flex items-center gap-1.5">
                <Scale className="h-3.5 w-3.5 text-gold/70" />
                EN 301 549 & BehiG Aligned
              </span>
            </div>
          </div>
        </Container>
      </section>

      {/* ───────────────────────────────────────────────────────── */}
      {/* FORMAL CONFORMANCE SUMMARY HUD                            */}
      {/* ───────────────────────────────────────────────────────── */}
      <section className="py-12 border-b border-border/40 bg-graphite/40 backdrop-blur-md">
        <Container>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FORMAL_STANDARDS.map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl bg-graphite/80 border border-border/70 space-y-1.5 backdrop-blur-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-gold">
                    {item.status}
                  </span>
                  <FileCheck2 className="h-4 w-4 text-gold/60" />
                </div>
                <h3 className="text-base font-serif text-primary tracking-tight">
                  {item.standard}
                </h3>
                <p className="text-xs text-muted font-sans">
                  {item.level}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ───────────────────────────────────────────────────────── */}
      {/* FOUR TECHNICAL PILLARS OF DIGITAL INCLUSION               */}
      {/* ───────────────────────────────────────────────────────── */}
      <section className="py-20 border-b border-border/40">
        <Container>
          <div className="max-w-2xl mb-12 space-y-2">
            <Badge variant="gold" size="sm">
              Technical Implementation
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-serif font-light text-primary tracking-tight">
              Architectural Accessibility Provisions
            </h2>
            <p className="text-xs sm:text-sm text-secondary font-sans leading-relaxed">
              How our engineers and curatorial archivists maintain barrier-free digital access.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {TECHNICAL_PILLARS.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <Card
                  key={idx}
                  className="p-8 bg-graphite/90 border-border/80 hover:border-gold/30 transition-all duration-300 relative overflow-hidden backdrop-blur-md shadow-dropdown flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="h-11 w-11 rounded-xl bg-obsidian border border-gold/30 flex items-center justify-center text-gold shadow-sm">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-muted px-2.5 py-1 rounded-full bg-charcoal border border-border/60">
                        {pillar.badge}
                      </span>
                    </div>

                    <h3 className="text-xl font-serif font-light text-primary tracking-tight">
                      {pillar.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-secondary font-sans leading-relaxed">
                      {pillar.description}
                    </p>

                    <div className="pt-2">
                      <ul className="space-y-2 text-xs text-muted font-sans border-t border-border/30 pt-4">
                        {pillar.features.map((feat, fIdx) => (
                          <li key={fIdx} className="flex items-start gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-gold/70 mt-1.5 shrink-0" />
                            <span className="text-secondary">{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </Container>
      </section>

      {/* ───────────────────────────────────────────────────────── */}
      {/* COMPATIBILITY & TESTING MATRIX                            */}
      {/* ───────────────────────────────────────────────────────── */}
      <section className="py-20 border-b border-border/40 bg-graphite/30 backdrop-blur-sm">
        <Container>
          <div className="max-w-2xl mb-12 space-y-2">
            <span className="text-[10px] font-mono tracking-widest uppercase text-gold block">
              Validation Matrix
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-light text-primary tracking-tight">
              Tested Assistive Environments
            </h2>
            <p className="text-xs sm:text-sm text-secondary font-sans leading-relaxed">
              Our continuous integration pipelines execute automated Axe Core telemetry alongside manual screen reader audits.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {COMPATIBILITY_MATRIX.map((matrix, idx) => (
              <Card
                key={idx}
                className="p-6 bg-graphite/80 border-border/80 space-y-4"
              >
                <h3 className="font-serif text-lg font-light text-primary tracking-tight border-b border-border/40 pb-3">
                  {matrix.category}
                </h3>

                <div className="space-y-3">
                  {matrix.combinations.map((comb, cIdx) => (
                    <div
                      key={cIdx}
                      className="p-3 rounded-lg bg-charcoal/60 border border-border/60 flex items-center justify-between gap-4"
                    >
                      <div className="space-y-0.5">
                        <div className="text-xs font-mono font-medium text-gold uppercase tracking-wider">
                          {comb.tool}
                        </div>
                        <div className="text-xs text-secondary font-sans">
                          {comb.browser}
                        </div>
                      </div>
                      <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)] shrink-0" />
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* ───────────────────────────────────────────────────────── */}
      {/* FORMAL FEEDBACK & ACCOMMODATION PROTOCOL                  */}
      {/* ───────────────────────────────────────────────────────── */}
      <section className="py-20">
        <Container>
          <div className="relative rounded-2xl border border-gold/30 bg-graphite/90 p-8 sm:p-12 overflow-hidden shadow-dropdown backdrop-blur-md max-w-4xl mx-auto space-y-8">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-gold to-transparent" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-border/40">
              <div className="space-y-2">
                <Badge variant="gold" size="sm">
                  Accessibility Desk
                </Badge>
                <h2 className="text-2xl sm:text-3xl font-serif font-light text-primary tracking-tight">
                  Feedback, Accommodations & Alternative Formats
                </h2>
                <p className="text-xs sm:text-sm text-secondary font-sans max-w-xl leading-relaxed">
                  Should you encounter any barrier, require vehicle provenance dossiers in alternative formats
                  (high-contrast PDF, large print, tactile transcription), or require assisted navigation, our team is at your disposal.
                </p>
              </div>

              <div className="shrink-0 p-4 rounded-xl bg-obsidian border border-border text-center sm:text-right space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted block">
                  Response SLA
                </span>
                <span className="text-sm font-mono text-gold font-medium flex items-center justify-center sm:justify-end gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  &lt; 48 Business Hours
                </span>
              </div>
            </div>

            {/* Direct Contact Channels */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <a
                href="mailto:accessibility@torquens.ch"
                className="group p-5 rounded-xl bg-charcoal border border-border hover:border-gold/40 transition-all duration-200 flex items-start gap-4"
              >
                <div className="h-10 w-10 rounded-lg bg-obsidian border border-border group-hover:border-gold/40 flex items-center justify-center text-gold shrink-0 transition-colors">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-muted">
                    Formal Inquiry Desk
                  </span>
                  <p className="text-xs sm:text-sm font-mono text-primary group-hover:text-gold transition-colors">
                    accessibility@torquens.ch
                  </p>
                  <p className="text-[11px] text-secondary font-sans">
                    Monitored by our Technical Directorate
                  </p>
                </div>
              </a>

              <a
                href="tel:+41225180122"
                className="group p-5 rounded-xl bg-charcoal border border-border hover:border-gold/40 transition-all duration-200 flex items-start gap-4"
              >
                <div className="h-10 w-10 rounded-lg bg-obsidian border border-border group-hover:border-gold/40 flex items-center justify-center text-gold shrink-0 transition-colors">
                  <Phone className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-muted">
                    Geneva Private Desk
                  </span>
                  <p className="text-xs sm:text-sm font-mono text-primary group-hover:text-gold transition-colors">
                    +41 22 518 01 22
                  </p>
                  <p className="text-[11px] text-secondary font-sans">
                    Dedicated telephonic assistance
                  </p>
                </div>
              </a>
            </div>

            {/* Formal Escalation Footnote */}
            <div className="pt-4 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted font-sans">
              <span>
                Assessment Method: Automated Axe Core 4.8 & Manual NVDA / VoiceOver Audits
              </span>
              <Link
                href="/contact"
                className="text-gold hover:text-gold-hover inline-flex items-center gap-1 font-mono uppercase tracking-wider text-[11px]"
              >
                <span>Contact Senior Directorate</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}