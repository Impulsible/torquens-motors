'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Calendar,
  Mail,
  Phone,
  MessageSquare,
  CheckCircle2,
  Clock,
  XCircle,
  User,
  Car,
  AlertCircle,
  Copy,
  ExternalLink,
  ShieldCheck,
  Building2,
  Sparkles,
  LucideIcon,
} from 'lucide-react';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, BadgeProps } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/hooks/useToast';
import { formatCurrency } from '@/utils/helpers';

// ─────────────────────────────────────────────────────────────
// DOMAIN TYPINGS
// ─────────────────────────────────────────────────────────────
export type EnquiryStatus = 'NEW' | 'CONTACTED' | 'NEGOTIATING' | 'CLOSED' | 'CANCELLED';
export type PreferredContact = 'EMAIL' | 'PHONE' | 'WHATSAPP';

export interface DealerInfo {
  name: string;
  email: string;
  phone: string;
  location?: string;
}

export interface VehicleSummary {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  currency: string;
  images: string[];
  vin?: string;
  dealer: DealerInfo;
}

export interface EnquiryDetail {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: EnquiryStatus;
  preferredContact: PreferredContact;
  createdAt: string;
  vehicle: VehicleSummary;
}

// ─────────────────────────────────────────────────────────────
// CONFIGURATION & STYLING MAPS
// ─────────────────────────────────────────────────────────────
interface StatusMeta {
  label: string;
  variant: NonNullable<BadgeProps['variant']>;
  icon: LucideIcon;
  description: string;
}

const STATUS_CONFIG: Record<EnquiryStatus, StatusMeta> = {
  NEW: {
    label: 'New Allocation Request',
    variant: 'warning',
    icon: Clock,
    description: 'Initial client inquiry awaiting concierge review.',
  },
  CONTACTED: {
    label: 'Contact Initiated',
    variant: 'info',
    icon: MessageSquare,
    description: 'First touchpoint dispatched via preferred channel.',
  },
  NEGOTIATING: {
    label: 'Active Negotiation',
    variant: 'gold',
    icon: AlertCircle,
    description: 'Terms, logistics, and settlement in progress.',
  },
  CLOSED: {
    label: 'Acquisition Finalized',
    variant: 'success',
    icon: CheckCircle2,
    description: 'Vehicle transaction and delivery protocol executed.',
  },
  CANCELLED: {
    label: 'Request Archived',
    variant: 'danger',
    icon: XCircle,
    description: 'Inquiry withdrawn or allocation unavailable.',
  },
};

const MOCK_ENQUIRY: EnquiryDetail = {
  id: 'enq_98472394a82f',
  name: 'Harrison Sterling',
  email: 'h.sterling@mayfair-holdings.co.uk',
  phone: '+44 20 7946 0991',
  message:
    'Inquiring regarding chassis provenance and European tax status for this 911 Carrera 4S. We require delivery arranged directly to our Geneva facility with customs clearance handling. Please confirm immediate availability.',
  status: 'NEW',
  preferredContact: 'EMAIL',
  createdAt: new Date().toISOString(),
  vehicle: {
    id: 'veh_porsche_911_4s',
    make: 'Porsche',
    model: '911 Carrera 4S',
    year: 2024,
    price: 185000000,
    currency: 'NGN',
    images: ['https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2070&auto=format&fit=crop'],
    vin: 'WP0AB2A99NS249811',
    dealer: {
      name: 'Torquens Mayfair Concierge',
      email: 'concierge@torquens.com',
      phone: '+44 20 7946 0800',
      location: 'London, Mayfair',
    },
  },
};

export default function EnquiryDetailPage() {
  const params = useParams();
  const { showToast } = useToast();

  const [enquiry, setEnquiry] = useState<EnquiryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    // Simulated asynchronous API fetch based on param ID
    const timer = setTimeout(() => {
      setEnquiry(MOCK_ENQUIRY);
      setLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [params.id]);

  const handleStatusUpdate = async (newStatus: EnquiryStatus) => {
    if (!enquiry || enquiry.status === newStatus || updating) return;

    setUpdating(true);
    const prevStatus = enquiry.status;

    // Optimistic UI update
    setEnquiry({ ...enquiry, status: newStatus });

    try {
      // Simulate API latency
      await new Promise((resolve) => setTimeout(resolve, 500));

      showToast({
        type: 'success',
        title: 'Status Updated',
        message: `Inquiry classified as: ${STATUS_CONFIG[newStatus].label}`,
      });
    } catch {
      // Rollback on failure
      setEnquiry({ ...enquiry, status: prevStatus });
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Could not update the inquiry status. Please try again.',
      });
    } finally {
      setUpdating(false);
    }
  };

  const copyToClipboard = useCallback(
    async (text: string, label: string) => {
      try {
        await navigator.clipboard.writeText(text);
        showToast({
          type: 'info',
          title: 'Copied to Clipboard',
          message: `${label} copied: ${text}`,
        });
      } catch {
        showToast({
          type: 'error',
          title: 'Copy Failed',
          message: 'Unable to copy text to your clipboard.',
        });
      }
    },
    [showToast]
  );

  // ─────────────────────────────────────────────────────────────
  // LOADING SKELETON
  // ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-12">
        <div className="flex items-center justify-between pb-6 border-b border-border/40">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-lg bg-graphite/60" />
            <div className="space-y-2">
              <Skeleton className="h-7 w-48 bg-graphite/80" />
              <Skeleton className="h-4 w-32 bg-graphite/40" />
            </div>
          </div>
          <Skeleton className="h-9 w-44 rounded-full bg-graphite/60" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-48 w-full rounded-xl bg-graphite/50" />
            <Skeleton className="h-44 w-full rounded-xl bg-graphite/50" />
            <Skeleton className="h-32 w-full rounded-xl bg-graphite/50" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-80 w-full rounded-xl bg-graphite/50" />
            <Skeleton className="h-44 w-full rounded-xl bg-graphite/50" />
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // NOT FOUND FALLBACK
  // ─────────────────────────────────────────────────────────────
  if (!enquiry) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center mb-6">
          <AlertCircle className="h-8 w-8 text-gold" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-light text-primary tracking-tight">
          Inquiry Record Unavailable
        </h2>
        <p className="text-secondary font-sans text-sm mt-2 max-w-md">
          The requested client inquiry could not be located in the registry vault. It may have been archived or removed.
        </p>
        <Link href="/dashboard/enquiries" className="mt-6">
          <Button variant="gold" size="md" leftIcon={<ArrowLeft size={16} />}>
            Return to Enquiries Registry
          </Button>
        </Link>
      </div>
    );
  }

  const currentStatusMeta = STATUS_CONFIG[enquiry.status] || STATUS_CONFIG.NEW;
  const CurrentStatusIcon = currentStatusMeta.icon;

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-16">
      {/* ───────────────────────────────────────────────────────── */}
      {/* HEADER SECTION                                            */}
      {/* ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/40">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/enquiries"
            className="flex items-center justify-center h-10 w-10 rounded-lg bg-graphite/60 border border-border/80 text-secondary hover:text-gold hover:border-gold/40 transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/60"
            aria-label="Back to inquiries list"
          >
            <ArrowLeft size={18} />
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-widest uppercase text-gold">
                Concierge Dossier
              </span>
              <span className="text-muted text-xs">•</span>
              <span className="text-xs font-mono text-muted uppercase">
                #{enquiry.id.slice(0, 10)}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-light text-primary tracking-tight mt-0.5">
              {enquiry.name}
            </h1>
          </div>
        </div>

        <Badge variant={currentStatusMeta.variant} size="lg" className="self-start sm:self-auto py-1.5 px-3.5">
          <CurrentStatusIcon className="h-3.5 w-3.5 mr-1.5" />
          <span>{currentStatusMeta.label}</span>
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ───────────────────────────────────────────────────────── */}
        {/* LEFT / MAIN COLUMN (Client Dossier & Correspondence)       */}
        {/* ───────────────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Client Identity Card */}
          <Card className="p-6 bg-graphite/95 border-border/80 relative overflow-hidden backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-border/40 pb-4 mb-5">
              <h2 className="text-xs font-mono font-semibold uppercase tracking-widest text-gold flex items-center gap-2">
                <User className="h-3.5 w-3.5" />
                <span>Verified Client Identity</span>
              </h2>
              <Badge variant="gold" size="sm">
                Preferred: {enquiry.preferredContact}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted block">
                  Full Legal Name
                </span>
                <p className="text-base font-serif text-primary font-normal">{enquiry.name}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted block">
                  Email Address
                </span>
                <div className="flex items-center gap-2 group">
                  <a
                    href={`mailto:${enquiry.email}`}
                    className="text-sm font-sans text-gold hover:text-gold-hover hover:underline transition-colors break-all"
                  >
                    {enquiry.email}
                  </a>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(enquiry.email, 'Email')}
                    className="text-muted hover:text-primary transition-colors p-1"
                    aria-label="Copy email"
                  >
                    <Copy size={13} />
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted block">
                  Direct Line
                </span>
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${enquiry.phone}`}
                    className="text-sm font-sans text-secondary hover:text-primary transition-colors"
                  >
                    {enquiry.phone}
                  </a>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(enquiry.phone, 'Phone')}
                    className="text-muted hover:text-primary transition-colors p-1"
                    aria-label="Copy phone number"
                  >
                    <Copy size={13} />
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted block">
                  Submission Timestamp
                </span>
                <div className="flex items-center gap-1.5 text-xs text-secondary font-sans">
                  <Calendar size={13} className="text-muted shrink-0" />
                  <span>
                    {new Date(enquiry.createdAt).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* 2. Client Inquiry Note */}
          <Card className="p-6 bg-graphite/95 border-border/80 relative overflow-hidden backdrop-blur-md">
            <h2 className="text-xs font-mono font-semibold uppercase tracking-widest text-gold flex items-center gap-2 border-b border-border/40 pb-4 mb-4">
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Inquiry Specification & Logistics Note</span>
            </h2>

            <div className="p-5 rounded-lg bg-obsidian/70 border border-border/60">
              <p className="text-sm text-secondary font-sans leading-relaxed whitespace-pre-wrap">
                {enquiry.message}
              </p>
            </div>
          </Card>

          {/* 3. Status Pipeline Switcher */}
          <Card className="p-6 bg-graphite/95 border-border/80 relative overflow-hidden backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-border/40 pb-4 mb-4">
              <div>
                <h2 className="text-xs font-mono font-semibold uppercase tracking-widest text-gold">
                  Registry Status Protocol
                </h2>
                <p className="text-xs text-muted font-sans mt-0.5">
                  Update this allocation request&apos;s lifecycle state
                </p>
              </div>
              <Sparkles className="h-4 w-4 text-gold/60" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {(Object.keys(STATUS_CONFIG) as EnquiryStatus[]).map((statusKey) => {
                const config = STATUS_CONFIG[statusKey];
                const Icon = config.icon;
                const isActive = enquiry.status === statusKey;

                return (
                  <button
                    key={statusKey}
                    type="button"
                    onClick={() => handleStatusUpdate(statusKey)}
                    disabled={updating}
                    className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-all duration-300 ${
                      isActive
                        ? 'bg-gold/10 border-gold shadow-glow text-primary'
                        : 'bg-obsidian/50 border-border/60 text-secondary hover:border-gold/30 hover:text-primary'
                    } disabled:opacity-50`}
                  >
                    <Icon
                      className={`h-4 w-4 shrink-0 mt-0.5 ${
                        isActive ? 'text-gold' : 'text-muted'
                      }`}
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-primary leading-tight">
                        {config.label}
                      </div>
                      <div className="text-[10px] text-muted leading-tight mt-1 truncate">
                        {config.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* ───────────────────────────────────────────────────────── */}
        {/* RIGHT / SIDEBAR COLUMN (Asset Dossier & Direct Actions)   */}
        {/* ───────────────────────────────────────────────────────── */}
        <div className="space-y-6">
          {/* 1. Vehicle Allocation Asset */}
          <Card className="p-6 bg-graphite/95 border-border/80 backdrop-blur-md overflow-hidden">
            <h2 className="text-xs font-mono font-semibold uppercase tracking-widest text-gold flex items-center gap-2 border-b border-border/40 pb-4 mb-4">
              <Car className="h-3.5 w-3.5" />
              <span>Target Allocation</span>
            </h2>

            <Link
              href={`/vehicles/${enquiry.vehicle.id}`}
              className="group block rounded-lg overflow-hidden focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/60"
            >
              <div className="relative aspect-16/10 rounded-lg overflow-hidden bg-obsidian border border-border/60 mb-3">
                {enquiry.vehicle.images[0] ? (
                  <Image
                    src={enquiry.vehicle.images[0]}
                    alt={`${enquiry.vehicle.make} ${enquiry.vehicle.model}`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted">
                    <Car className="h-10 w-10" />
                  </div>
                )}
                <div className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-obsidian/70 backdrop-blur-md text-white/80 group-hover:text-gold transition-colors">
                  <ExternalLink size={12} />
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono text-muted uppercase tracking-wider">
                  {enquiry.vehicle.year} Specification
                </span>
                <h3 className="text-base font-serif font-light text-primary group-hover:text-gold transition-colors">
                  {enquiry.vehicle.make} {enquiry.vehicle.model}
                </h3>
                <div className="text-sm font-sans font-medium text-gold">
                  {formatCurrency(enquiry.vehicle.price, enquiry.vehicle.currency)}
                </div>

                {enquiry.vehicle.vin && (
                  <div className="pt-2 text-[10px] font-mono text-muted border-t border-border/40 mt-2 flex justify-between">
                    <span>VIN</span>
                    <span className="text-secondary">{enquiry.vehicle.vin}</span>
                  </div>
                )}
              </div>
            </Link>
          </Card>

          {/* 2. Custodian / Dealer Assignment */}
          <Card className="p-6 bg-graphite/95 border-border/80 backdrop-blur-md">
            <h2 className="text-xs font-mono font-semibold uppercase tracking-widest text-gold flex items-center gap-2 border-b border-border/40 pb-4 mb-4">
              <Building2 className="h-3.5 w-3.5" />
              <span>Assigned Broker / Dealer</span>
            </h2>

            <div className="space-y-3">
              <div>
                <p className="text-sm font-serif text-primary">{enquiry.vehicle.dealer.name}</p>
                {enquiry.vehicle.dealer.location && (
                  <p className="text-xs text-muted font-sans">{enquiry.vehicle.dealer.location}</p>
                )}
              </div>

              <div className="space-y-2 pt-2 border-t border-border/30">
                <a
                  href={`mailto:${enquiry.vehicle.dealer.email}`}
                  className="flex items-center gap-2 text-xs text-secondary hover:text-gold transition-colors font-sans"
                >
                  <Mail size={13} className="text-gold" />
                  <span>{enquiry.vehicle.dealer.email}</span>
                </a>
                <a
                  href={`tel:${enquiry.vehicle.dealer.phone}`}
                  className="flex items-center gap-2 text-xs text-secondary hover:text-primary transition-colors font-sans"
                >
                  <Phone size={13} className="text-gold" />
                  <span>{enquiry.vehicle.dealer.phone}</span>
                </a>
              </div>
            </div>
          </Card>

          {/* 3. Rapid Concierge Actions */}
          <Card className="p-6 bg-graphite/95 border-border/80 backdrop-blur-md">
            <h2 className="text-xs font-mono font-semibold uppercase tracking-widest text-gold flex items-center gap-2 border-b border-border/40 pb-4 mb-4">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Direct Client Dispatch</span>
            </h2>

            <div className="space-y-2.5">
              <a href={`mailto:${enquiry.email}?subject=Torquens%20Private%20Allocation:%20${encodeURIComponent(enquiry.vehicle.make + ' ' + enquiry.vehicle.model)}`} className="block">
                <Button variant="gold" fullWidth size="md" className="text-xs uppercase tracking-wider font-semibold">
                  <Mail className="h-3.5 w-3.5 mr-2" />
                  Dispatch Email Response
                </Button>
              </a>

              <a href={`tel:${enquiry.phone}`} className="block">
                <Button variant="secondary" fullWidth size="md" className="text-xs uppercase tracking-wider border-border hover:border-gold/40">
                  <Phone className="h-3.5 w-3.5 mr-2" />
                  Establish Voice Link
                </Button>
              </a>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}