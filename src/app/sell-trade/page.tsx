/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Lock,
  Gauge,
  FileCheck2,
  Banknote,
  Handshake,
  Camera,
  ClipboardCheck,
  Globe2,
  Scale,
  CheckCircle2,
  TrendingUp,
  Clock,
  Award,
  Repeat,
  Wallet,
  Building2,
  Mail,
  Phone,
  Info,
  Upload,
  X,
  Loader2,
  Check,
} from 'lucide-react';

import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/utils/cn';

const DISPOSITION_PATHWAYS = [
  {
    id: 'consignment',
    icon: Handshake,
    tag: 'Pathway 01',
    title: 'Private Treaty Consignment',
    subtitle: 'Discreet placement with vetted collectors',
    description:
      'Your vehicle is presented confidentially to our verified private client registry. No public listing, no dealer forecourt exposure — only qualified counterparties under NDA.',
    features: [
      'Zero public exposure',
      'Curated buyer shortlist',
      'Typical timeline: 30–90 days',
      'Commission-based structure',
    ],
    accent: 'gold',
  },
  {
    id: 'outright',
    icon: Banknote,
    tag: 'Pathway 02',
    title: 'Outright Acquisition',
    subtitle: 'Immediate settlement, full liquidity',
    description:
      'TORQUENS purchases the vehicle directly into our custody inventory. Funds cleared through Swiss escrow within seven business days of physical inspection sign-off.',
    features: [
      'Cash settlement in 7 days',
      'No commission deducted',
      'Full transfer of title & risk',
      'Ideal for estate liquidation',
    ],
    accent: 'default',
  },
  {
    id: 'trade',
    icon: Repeat,
    tag: 'Pathway 03',
    title: 'Trade Against Acquisition',
    subtitle: 'Portfolio rotation with preferred terms',
    description:
      'Apply the appraised value of your current asset toward an allocation from our registry — including unlisted homologation specials and factory-restricted deliveries.',
    features: [
      'Preferential allocation access',
      'Tax-efficient in select jurisdictions',
      'Blended escrow settlement',
      'Available for VIP registered clients',
    ],
    accent: 'default',
  },
];

const PROCESS_STAGES = [
  {
    step: '01',
    icon: Mail,
    title: 'Confidential Submission',
    duration: '24 hours',
    description:
      'Submit chassis details, documentation summary, and current custody location through our encrypted client portal or via a senior director.',
  },
  {
    step: '02',
    icon: Gauge,
    title: 'Desk Valuation & Market Read',
    duration: '3–5 days',
    description:
      'Our curatorial desk cross-references recent transaction ledgers, marque registry data, and current private demand to issue a written valuation band.',
  },
  {
    step: '03',
    icon: Camera,
    title: 'Physical Inspection & Photography',
    duration: '1–2 days on-site',
    description:
      'A TORQUENS-appointed inspector attends your custody location for forensic mechanical audit, high-resolution photography, and documentation verification.',
  },
  {
    step: '04',
    icon: ClipboardCheck,
    title: 'Mandate Agreement',
    duration: '1 day',
    description:
      'You receive a formal mandate letter outlining chosen pathway, commission structure (if applicable), reserve floor, and estimated settlement timeline.',
  },
  {
    step: '05',
    icon: Globe2,
    title: 'Buyer Introduction or Direct Purchase',
    duration: 'Variable',
    description:
      'For consignment: qualified counterparties are introduced under NDA. For outright acquisition: escrow instructions issue immediately post-mandate.',
  },
  {
    step: '06',
    icon: Lock,
    title: 'Escrow Settlement & Handover',
    duration: '5–10 days',
    description:
      'Funds released through bonded Swiss legal escrow upon buyer inspection sign-off. Insured logistics coordinate the door-to-door transfer.',
  },
];

const COMMERCIAL_TERMS = [
  {
    label: 'Consignment Commission',
    value: '4–8%',
    footnote: 'Sliding scale by asset value; capped for eight-figure transactions',
  },
  {
    label: 'Escrow & Legal Fee',
    value: 'From 0.4%',
    footnote: 'Bonded Swiss escrow, transparent flat schedule',
  },
  {
    label: 'Inspection & Photography',
    value: 'Complimentary',
    footnote: 'On mandated consignments within EU, UK, UAE & West Africa',
  },
  {
    label: 'Settlement Currency',
    value: 'USD · EUR · GBP · CHF',
    footnote: 'Multi-currency escrow; FX hedging available',
  },
];

const FAQ_ITEMS = [
  {
    q: 'Will my vehicle be publicly advertised?',
    a: 'No. All submissions are handled under strict confidentiality. Public listings occur only upon your explicit written instruction — and even then, most consignments are placed privately before any public exposure.',
  },
  {
    q: 'How is the reserve price determined?',
    a: 'Our curatorial desk issues a written valuation band based on recent comparable transactions, marque registry data, and current private demand. You retain full authority over the final reserve floor.',
  },
  {
    q: 'What if my vehicle is stored in a Freeport?',
    a: 'Freeport-stored assets — particularly in Geneva, Luxembourg, and Singapore — receive expedited handling. Inspection and transfer can typically occur without customs clearance until final buyer allocation.',
  },
  {
    q: 'Do you accept partial ownership or fractional consignments?',
    a: 'We do not currently facilitate fractional ownership sales. However, we can advise on structured disposition for vehicles held within family trusts, LLCs, or corporate vehicles.',
  },
  {
    q: 'Is my identity disclosed to prospective buyers?',
    a: 'Never, unless you specifically authorize disclosure. All negotiations are conducted through the TORQUENS desk, and identity reveal occurs only at the closing stage.',
  },
];

export default function SellTradePage() {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [pathway, setPathway] = useState('consignment');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [year, setYear] = useState('');
  const [makeModel, setMakeModel] = useState('');
  const [chassisNumber, setChassisNumber] = useState('');
  const [indicativeValue, setIndicativeValue] = useState('');
  const [notes, setNotes] = useState('');
  const [ndaAccepted, setNdaAccepted] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  const selectPathway = (pId: string) => {
    setPathway(pId);
    const formEl = document.getElementById('submit-form-card');
    if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = 5 - uploadedPhotos.length;
    if (files.length > remainingSlots) {
      toast.error('Maximum 5 photographs permitted per initial dossier.');
      return;
    }

    Array.from(files).forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`File ${file.name} exceeds 5MB limit.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setUploadedPhotos((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const removePhoto = (idx: number) => {
    setUploadedPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName || !email || !phone || !makeModel || !indicativeValue) {
      toast.error('Please complete all required fields.');
      return;
    }

    if (!ndaAccepted) {
      toast.error('Please accept the Client Confidentiality Framework.');
      return;
    }

    setSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 1200));
      const refCode = `TQ-${Math.floor(100000 + Math.random() * 900000)}`;
      setSubmittedRef(refCode);
      toast.success(`Dossier submitted under reference ${refCode}.`);
    } catch (err) {
      toast.error('Submission failed. Please contact the desk directly.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-obsidian text-primary selection:bg-gold/20 selection:text-gold pt-16 sm:pt-20 pb-20 overflow-hidden">
      {/* HERO SECTION — Adjusted Padding to Eliminate Header Void */}
      <section className="relative py-8 md:py-12 border-b border-border/40 overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-160 h-96 bg-gold/5 blur-[140px] rounded-full"
        />

        <Container className="relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            <div className="lg:col-span-7 space-y-5">
              <Badge variant="gold" size="sm">
                <span className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest">
                  <Sparkles className="h-3 w-3" />
                  Private Client Desk · Disposition
                </span>
              </Badge>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-light tracking-tight text-primary leading-[1.05]">
                Sell, trade, or consign —{' '}
                <span className="italic font-normal text-gold block sm:inline">
                  on institutional terms.
                </span>
              </h1>

              <p className="text-secondary font-sans text-base sm:text-lg leading-relaxed max-w-2xl pt-1">
                Whether liquidating a single chassis, rotating an entire portfolio, or trading
                against a new allocation, the TORQUENS Disposition Desk provides three discreet
                pathways — each cleared through bonded Swiss escrow and executed under strict confidentiality.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <a href="#submit">
                  <Button
                    variant="gold"
                    size="lg"
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                    className="text-xs uppercase tracking-widest font-semibold"
                  >
                    Submit Vehicle Dossier
                  </Button>
                </a>

                <a href="#pathways">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="text-xs uppercase tracking-widest border-border hover:border-gold/30"
                  >
                    Review Pathways
                  </Button>
                </a>
              </div>
            </div>

            {/* Snapshot Card */}
            <div className="lg:col-span-5">
              <Card className="p-8 bg-graphite/80 border-border/80 backdrop-blur-md shadow-dropdown space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono tracking-widest uppercase text-gold">
                    Desk Snapshot
                  </span>
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Desk Active
                  </div>
                </div>

                <div className="space-y-4 text-sm font-sans">
                  <div className="flex items-baseline justify-between pb-3 border-b border-border/40">
                    <span className="text-secondary">Cumulative Cleared Volume</span>
                    <span className="font-serif text-xl font-light text-gold">$1.4B+</span>
                  </div>
                  <div className="flex items-baseline justify-between pb-3 border-b border-border/40">
                    <span className="text-secondary">Consignments Placed &lt; 90 Days</span>
                    <span className="font-serif text-xl font-light text-gold">92%</span>
                  </div>
                  <div className="flex items-baseline justify-between pb-3 border-b border-border/40">
                    <span className="text-secondary">Outright Settlement Speed</span>
                    <span className="font-serif text-xl font-light text-gold">7 Days</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-secondary">Global Escrow Jurisdictions</span>
                    <span className="font-serif text-xl font-light text-gold">19</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/40 flex items-start gap-2 text-[11px] text-muted font-sans leading-relaxed">
                  <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 text-gold/70" />
                  <span>Settlements executed through Swiss legal escrow and Lloyd&apos;s insured transit.</span>
                </div>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      {/* THREE PATHWAYS */}
      <section id="pathways" className="py-16 md:py-20 border-b border-border/40">
        <Container>
          <div className="max-w-2xl mb-12 space-y-2">
            <Badge variant="gold" size="sm">
              Three Institutional Pathways
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-serif font-light text-primary tracking-tight">
              Choose your route to liquidity.
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {DISPOSITION_PATHWAYS.map((p) => {
              const Icon = p.icon;
              const isSelected = pathway === p.id;
              return (
                <Card
                  key={p.id}
                  className={cn(
                    'p-8 relative overflow-hidden backdrop-blur-md flex flex-col justify-between transition-all duration-300',
                    isSelected
                      ? 'bg-graphite/95 border-gold/60 shadow-[0_0_25px_rgba(212,175,55,0.15)]'
                      : 'bg-graphite/80 border-border/80 hover:border-gold/30'
                  )}
                >
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <div className="h-12 w-12 rounded-xl bg-obsidian border border-gold/30 flex items-center justify-center text-gold">
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-muted">
                        {p.tag}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl font-serif font-light text-primary tracking-tight">
                        {p.title}
                      </h3>
                      <p className="text-[11px] font-mono uppercase tracking-wider text-gold pt-1.5">
                        {p.subtitle}
                      </p>
                    </div>

                    <p className="text-xs sm:text-sm text-secondary font-sans leading-relaxed">
                      {p.description}
                    </p>

                    <ul className="space-y-2 pt-2">
                      {p.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-secondary">
                          <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 text-gold shrink-0" />
                          <span className="font-sans leading-snug">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-6 mt-6 border-t border-border/30">
                    <button
                      type="button"
                      onClick={() => selectPathway(p.id)}
                      className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-gold hover:gap-2.5 transition-all cursor-pointer"
                    >
                      {isSelected ? '✓ Pathway Selected' : 'Select this pathway →'}
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        </Container>
      </section>

      {/* PROCESS */}
      <section className="py-16 md:py-20 border-b border-border/40 bg-graphite/30 backdrop-blur-sm">
        <Container>
          <div className="max-w-2xl mb-12 space-y-2">
            <span className="text-[10px] font-mono tracking-widest uppercase text-gold block">
              Disposition Ledger
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-light text-primary tracking-tight">
              From submission to settlement — six stages.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PROCESS_STAGES.map((stage) => {
              const Icon = stage.icon;
              return (
                <Card
                  key={stage.step}
                  className="p-6 bg-graphite/80 border-border/80 backdrop-blur-md flex flex-col justify-between space-y-4 hover:border-gold/30 transition-colors"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="font-serif text-3xl font-light text-gold/40 tabular-nums">
                        {stage.step}
                      </div>
                      <div className="h-9 w-9 rounded-lg bg-obsidian border border-gold/30 flex items-center justify-center text-gold">
                        <Icon className="h-4 w-4" />
                      </div>
                    </div>

                    <h3 className="text-base font-serif text-primary tracking-tight">
                      {stage.title}
                    </h3>

                    <p className="text-xs text-secondary font-sans leading-relaxed">
                      {stage.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-border/30 flex items-center justify-between text-[10px] font-mono">
                    <span className="uppercase tracking-widest text-muted">Est. Duration</span>
                    <span className="text-gold">{stage.duration}</span>
                  </div>
                </Card>
              );
            })}
          </div>
        </Container>
      </section>

      {/* COMMERCIAL TERMS */}
      <section className="py-16 md:py-20 border-b border-border/40">
        <Container>
          <div className="max-w-2xl mb-10 space-y-2">
            <span className="text-[10px] font-mono tracking-widest uppercase text-gold block">
              Commercial Framework
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-light text-primary tracking-tight">
              Transparent, published terms.
            </h2>
          </div>

          <div className="rounded-2xl border border-border/70 bg-graphite/70 backdrop-blur-md overflow-hidden divide-y divide-border/40">
            {COMMERCIAL_TERMS.map((t, idx) => (
              <div
                key={idx}
                className="grid grid-cols-12 gap-4 p-5 sm:p-6 items-center hover:bg-obsidian/30 transition-colors"
              >
                <div className="col-span-12 sm:col-span-4">
                  <div className="text-xs sm:text-sm font-serif text-primary">{t.label}</div>
                </div>
                <div className="col-span-12 sm:col-span-3">
                  <div className="font-serif text-xl sm:text-2xl font-light text-gold tabular-nums">
                    {t.value}
                  </div>
                </div>
                <div className="col-span-12 sm:col-span-5">
                  <div className="text-[11px] font-mono text-muted leading-relaxed">
                    {t.footnote}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* SUBMISSION FORM */}
      <section id="submit" className="py-16 md:py-20 border-b border-border/40 bg-graphite/20">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-5 space-y-6">
              <Badge variant="gold" size="sm">
                Confidential Submission
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-serif font-light text-primary tracking-tight">
                Begin with a private line to the desk.
              </h2>
              <p className="text-xs sm:text-sm text-secondary font-sans leading-relaxed">
                Provide the essential particulars below. A senior director will respond within
                one business day with an initial read and next steps. All submissions are
                encrypted at rest and disclosed to no third party.
              </p>

              <div className="pt-4 space-y-4">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-graphite/60 border border-border/70">
                  <div className="h-9 w-9 rounded-lg bg-obsidian border border-gold/30 flex items-center justify-center text-gold shrink-0">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-serif text-primary">Direct Desk Line</div>
                    <div className="text-[11px] font-mono text-muted pt-1">+41 22 000 00 00</div>
                    <div className="text-[10px] font-mono text-muted uppercase tracking-widest pt-0.5">
                      Geneva · 09:00–18:00 CET
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl bg-graphite/60 border border-border/70">
                  <div className="h-9 w-9 rounded-lg bg-obsidian border border-gold/30 flex items-center justify-center text-gold shrink-0">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-serif text-primary">Encrypted Desk Email</div>
                    <div className="text-[11px] font-mono text-muted pt-1">
                      disposition@torquens.motors
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <Card
                id="submit-form-card"
                className="p-6 sm:p-8 bg-graphite/80 border-border/80 backdrop-blur-md shadow-dropdown"
              >
                {submittedRef ? (
                  <div className="py-12 text-center space-y-5">
                    <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/40 flex items-center justify-center text-gold mx-auto">
                      <Check className="h-8 w-8" />
                    </div>
                    <h3 className="text-2xl font-serif text-primary">Dossier Registered</h3>
                    <p className="text-xs font-mono uppercase tracking-widest text-gold">
                      Reference Code: {submittedRef}
                    </p>
                    <p className="text-xs text-secondary max-w-md mx-auto leading-relaxed">
                      Your submission has been securely transmitted to the Senior Directorate in Geneva. An archivist will review the chassis documentation and reach out via encrypted correspondence.
                    </p>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setSubmittedRef(null);
                        setUploadedPhotos([]);
                        setMakeModel('');
                        setChassisNumber('');
                        setIndicativeValue('');
                        setNotes('');
                      }}
                      className="text-xs uppercase tracking-wider font-mono"
                    >
                      Submit Another Allocation
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-muted">
                        Preferred Pathway *
                      </label>
                      <select
                        value={pathway}
                        onChange={(e) => setPathway(e.target.value)}
                        className="w-full bg-obsidian/60 border border-border/70 rounded-lg px-4 py-3 text-sm font-sans text-primary focus:outline-none focus:border-gold/50 transition-colors"
                      >
                        <option value="consignment">Private Treaty Consignment</option>
                        <option value="outright">Outright Acquisition</option>
                        <option value="trade">Trade Against Acquisition</option>
                        <option value="advice">Undecided — request desk advice</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono uppercase tracking-widest text-muted">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Given name & surname"
                          className="w-full bg-obsidian/60 border border-border/70 rounded-lg px-4 py-3 text-sm font-sans text-primary placeholder:text-muted/60 focus:outline-none focus:border-gold/50 transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono uppercase tracking-widest text-muted">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="client@domain.com"
                          className="w-full bg-obsidian/60 border border-border/70 rounded-lg px-4 py-3 text-sm font-sans text-primary placeholder:text-muted/60 focus:outline-none focus:border-gold/50 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono uppercase tracking-widest text-muted">
                          Contact Number *
                        </label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+41 / +44 / +234"
                          className="w-full bg-obsidian/60 border border-border/70 rounded-lg px-4 py-3 text-sm font-sans text-primary placeholder:text-muted/60 focus:outline-none focus:border-gold/50 transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono uppercase tracking-widest text-muted">
                          Current Custody Jurisdiction
                        </label>
                        <input
                          type="text"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="e.g. Geneva Freeport, London, Lagos"
                          className="w-full bg-obsidian/60 border border-border/70 rounded-lg px-4 py-3 text-sm font-sans text-primary placeholder:text-muted/60 focus:outline-none focus:border-gold/50 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-2 sm:col-span-1">
                        <label className="text-[10px] font-mono uppercase tracking-widest text-muted">
                          Year
                        </label>
                        <input
                          type="text"
                          value={year}
                          onChange={(e) => setYear(e.target.value)}
                          placeholder="1965 / 2023"
                          className="w-full bg-obsidian/60 border border-border/70 rounded-lg px-4 py-3 text-sm font-sans text-primary placeholder:text-muted/60 focus:outline-none focus:border-gold/50 transition-colors"
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <label className="text-[10px] font-mono uppercase tracking-widest text-muted">
                          Marque & Model *
                        </label>
                        <input
                          type="text"
                          required
                          value={makeModel}
                          onChange={(e) => setMakeModel(e.target.value)}
                          placeholder="e.g. Ferrari 275 GTB/4, Porsche 918"
                          className="w-full bg-obsidian/60 border border-border/70 rounded-lg px-4 py-3 text-sm font-sans text-primary placeholder:text-muted/60 focus:outline-none focus:border-gold/50 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono uppercase tracking-widest text-muted">
                          Chassis / VIN
                        </label>
                        <input
                          type="text"
                          value={chassisNumber}
                          onChange={(e) => setChassisNumber(e.target.value)}
                          placeholder="Chassis sequence"
                          className="w-full bg-obsidian/60 border border-border/70 rounded-lg px-4 py-3 text-sm font-sans text-primary placeholder:text-muted/60 focus:outline-none focus:border-gold/50 transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono uppercase tracking-widest text-muted">
                          Indicative Value (USD) *
                        </label>
                        <input
                          type="text"
                          required
                          value={indicativeValue}
                          onChange={(e) => setIndicativeValue(e.target.value)}
                          placeholder="$2,500,000"
                          className="w-full bg-obsidian/60 border border-border/70 rounded-lg px-4 py-3 text-sm font-sans text-primary placeholder:text-muted/60 focus:outline-none focus:border-gold/50 transition-colors"
                        />
                      </div>
                    </div>

                    {/* PHOTO UPLOAD */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-muted block">
                        Dossier Photographs (Optional · Max 5)
                      </label>

                      <div className="flex flex-wrap gap-3">
                        {uploadedPhotos.map((photo, i) => (
                          <div
                            key={i}
                            className="relative h-16 w-16 rounded-lg overflow-hidden border border-gold/40 group"
                          >
                            <Image
                              src={photo}
                              alt="Upload preview"
                              fill
                              className="object-cover"
                              unoptimized
                            />
                            <button
                              type="button"
                              onClick={() => removePhoto(i)}
                              className="absolute inset-0 bg-obsidian/80 text-red-400 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}

                        {uploadedPhotos.length < 5 && (
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="h-16 w-16 rounded-lg border border-dashed border-border hover:border-gold/50 flex flex-col items-center justify-center text-muted hover:text-gold transition-colors"
                          >
                            <Upload className="h-4 w-4 mb-1" />
                            <span className="text-[8px] font-mono uppercase">Add</span>
                          </button>
                        )}
                      </div>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileUpload}
                        className="sr-only"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-muted">
                        Provenance & Documentation Notes
                      </label>
                      <textarea
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Ownership history, matching numbers, service records, race pedigree..."
                        className="w-full bg-obsidian/60 border border-border/70 rounded-lg px-4 py-3 text-sm font-sans text-primary placeholder:text-muted/60 focus:outline-none focus:border-gold/50 transition-colors resize-none"
                      />
                    </div>

                    <label className="flex items-start gap-3 pt-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={ndaAccepted}
                        onChange={(e) => setNdaAccepted(e.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-border/70 bg-obsidian text-gold focus:ring-gold/50"
                      />
                      <span className="text-[11px] font-sans text-muted leading-relaxed group-hover:text-secondary transition-colors">
                        I acknowledge this submission is confidential and consent to TORQUENS Motors handling my particulars under its Client Confidentiality Framework.
                      </span>
                    </label>

                    <div className="pt-4 border-t border-border/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="text-[11px] font-mono text-muted uppercase tracking-widest">
                        Desk response &lt; 24h
                      </div>
                      <Button
                        variant="gold"
                        size="lg"
                        disabled={submitting}
                        rightIcon={
                          submitting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <ArrowRight className="h-4 w-4" />
                          )
                        }
                        className="text-xs uppercase tracking-widest font-semibold"
                        type="submit"
                      >
                        {submitting ? 'Transmitting Dossier...' : 'Submit to the Desk'}
                      </Button>
                    </div>
                  </form>
                )}
              </Card>
            </div>
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-20 border-b border-border/40 bg-graphite/30 backdrop-blur-sm">
        <Container>
          <div className="max-w-2xl mb-10 space-y-2">
            <Badge variant="gold" size="sm">
              Frequent Enquiries
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-serif font-light text-primary tracking-tight">
              What clients ask before mandating.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FAQ_ITEMS.map((item, idx) => (
              <details
                key={idx}
                className="group p-5 rounded-xl bg-graphite/70 border border-border/70 hover:border-gold/30 transition-colors open:border-gold/40"
              >
                <summary className="flex items-start justify-between gap-4 cursor-pointer list-none">
                  <span className="text-sm font-serif text-primary leading-snug pr-2">
                    {item.q}
                  </span>
                  <span className="mt-0.5 h-5 w-5 rounded-full border border-gold/40 text-gold flex items-center justify-center text-xs font-mono shrink-0 group-open:rotate-45 transition-transform">
                    +
                  </span>
                </summary>
                <p className="pt-3 mt-3 border-t border-border/40 text-xs text-secondary font-sans leading-relaxed">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </Container>
      </section>
    </main>
  );
}