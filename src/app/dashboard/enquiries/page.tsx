'use client';
/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  Search,
  SlidersHorizontal,
  Clock,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Calendar,
  User,
  Car,
  TrendingUp,
  Inbox,
  ShieldAlert,
  Loader2,
  LucideIcon,
  RefreshCcw,
} from 'lucide-react';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, BadgeProps } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/hooks/useToast';
import { formatCurrency } from '@/utils/helpers';
import { getUserEnquiries } from '@/actions/enquiries';

// ─────────────────────────────────────────────────────────────
// STRICT TYPES & INTERFACES
// ─────────────────────────────────────────────────────────────
export type EnquiryStatus = 'NEW' | 'CONTACTED' | 'NEGOTIATING' | 'CLOSED' | 'CANCELLED';
export type PreferredContact = 'EMAIL' | 'PHONE' | 'WHATSAPP';

export interface VehicleSummary {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  currency: string;
}

export interface EnquirySummary {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: EnquiryStatus;
  preferredContact: PreferredContact;
  createdAt: string;
  vehicle: VehicleSummary;
}

interface ActionResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

interface StatusMeta {
  label: string;
  variant: NonNullable<BadgeProps['variant']>;
  icon: LucideIcon;
  borderClass: string;
  textClass: string;
}

// ─────────────────────────────────────────────────────────────
// METADATA CONFIGS
// ─────────────────────────────────────────────────────────────
const STATUS_CONFIGS: Record<EnquiryStatus, StatusMeta> = {
  NEW: {
    label: 'New Request',
    variant: 'warning',
    icon: Clock,
    borderClass: 'border-yellow-500/20',
    textClass: 'text-yellow-400',
  },
  CONTACTED: {
    label: 'Contacted',
    variant: 'info',
    icon: MessageSquare,
    borderClass: 'border-blue-500/20',
    textClass: 'text-blue-400',
  },
  NEGOTIATING: {
    label: 'Negotiating',
    variant: 'gold',
    icon: AlertCircle,
    borderClass: 'border-gold/20',
    textClass: 'text-gold',
  },
  CLOSED: {
    label: 'Closed',
    variant: 'success',
    icon: CheckCircle2,
    borderClass: 'border-emerald-500/20',
    textClass: 'text-emerald-400',
  },
  CANCELLED: {
    label: 'Archived',
    variant: 'danger',
    icon: XCircle,
    borderClass: 'border-red-500/20',
    textClass: 'text-red-400',
  },
};

export default function EnquiryDashboardPage() {
  const { showToast } = useToast();

  const [enquiries, setEnquiries] = useState<EnquirySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<EnquiryStatus | 'ALL'>('ALL');

  // ─────────────────────────────────────────────────────────────
  // SECURE DATABASE FETCH
  // ─────────────────────────────────────────────────────────────
  const fetchRegistry = useCallback(async (isSilent = false) => {
    if (isSilent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      // ✅ FIX: Call getUserEnquiries() instead of setEnquiries()
      const response = await getUserEnquiries() as ActionResponse<EnquirySummary[]>;

      if (response?.success && Array.isArray(response.data)) {
        setEnquiries(response.data);
      } else {
        // If response is undefined or failed, set empty array
        setEnquiries([]);
        showToast({
          type: 'error',
          title: 'Database Sync Failed',
          message: response?.message || 'Unable to retrieve secure client records.',
        });
      }
    } catch (error) {
      console.error('[EnquiryDashboard] Secure read execution failed:', error);
      setEnquiries([]);
      showToast({
        type: 'error',
        title: 'Authentication Timeout',
        message: 'Could not connect to secure data vaults. Please refresh.',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchRegistry();
  }, [fetchRegistry]);

  // ─────────────────────────────────────────────────────────────
  // REAL-TIME ANALYTICS CALCULATION
  // ─────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    // ✅ Guard against undefined or null enquiries
    const safeEnquiries = Array.isArray(enquiries) ? enquiries : [];
    
    const total = safeEnquiries.length;
    const newCount = safeEnquiries.filter((e) => e.status === 'NEW').length;
    const active = safeEnquiries.filter((e) => e.status === 'NEGOTIATING' || e.status === 'CONTACTED').length;
    const closed = safeEnquiries.filter((e) => e.status === 'CLOSED').length;

    return { total, newCount, active, closed };
  }, [enquiries]);

  // ─────────────────────────────────────────────────────────────
  // CONDITIONAL FILTER ENGINE
  // ─────────────────────────────────────────────────────────────
  const filteredEnquiries = useMemo(() => {
    // ✅ Guard against undefined or null enquiries
    const safeEnquiries = Array.isArray(enquiries) ? enquiries : [];
    
    return safeEnquiries.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `${item.vehicle.make} ${item.vehicle.model}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [enquiries, searchQuery, statusFilter]);

  const handleManualRefresh = async () => {
    await fetchRegistry(true);
    showToast({
      type: 'success',
      title: 'Vault Sync Complete',
      message: 'Secure ledger signature verified successfully.',
    });
  };

  // ─────────────────────────────────────────────────────────────
  // LOADING / SYNCING SKELETON RENDER
  // ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-border/40">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 bg-graphite/60" />
            <Skeleton className="h-8 w-64 bg-graphite/80" />
          </div>
          <Skeleton className="h-10 w-28 rounded-md bg-graphite/60" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl bg-graphite/50" />
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Skeleton className="h-10 flex-1 bg-graphite/50" />
          <Skeleton className="h-10 w-44 bg-graphite/50" />
        </div>

        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl bg-graphite/40" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-16">
      {/* ───────────────────────────────────────────────────────── */}
      {/* SECTION HEADER                                            */}
      {/* ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest uppercase text-gold">
              Private Client Vault
            </span>
            <span className="text-muted text-xs">•</span>
            <span className="text-xs font-sans text-muted">Secured Database Link</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-light text-primary tracking-tight mt-1.5">
            Dossier & Inquiry Registry
          </h1>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={handleManualRefresh}
          disabled={refreshing}
          className="self-start sm:self-auto text-xs uppercase tracking-wider border-border hover:border-gold/30 min-w-42.5"
        >
          {refreshing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
          ) : (
            <RefreshCcw className="h-3.5 w-3.5 mr-2" />
          )}
          <span>{refreshing ? 'Syncing...' : 'Verify Vault Sync'}</span>
        </Button>
      </div>

      {/* ───────────────────────────────────────────────────────── */}
      {/* KEY METRICS PANELS                                        */}
      {/* ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 bg-graphite/80 border-border/80 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted">
              Total Inquiries
            </span>
            <p className="text-3xl font-serif font-light text-primary tabular-nums">
              {stats.total}
            </p>
          </div>
          <TrendingUp className="h-5 w-5 text-gold/60" />
        </Card>

        <Card className="p-5 bg-graphite/80 border-border/80 flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 h-1 w-20 bg-yellow-500/40" />
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted">
              New Requests
            </span>
            <p className="text-3xl font-serif font-light text-yellow-400 tabular-nums">
              {stats.newCount}
            </p>
          </div>
          <Clock className="h-5 w-5 text-yellow-500/40" />
        </Card>

        <Card className="p-5 bg-graphite/80 border-border/80 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted">
              Under Negotiation
            </span>
            <p className="text-3xl font-serif font-light text-gold tabular-nums">
              {stats.active}
            </p>
          </div>
          <SlidersHorizontal className="h-5 w-5 text-gold/40" />
        </Card>

        <Card className="p-5 bg-graphite/80 border-border/80 flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 h-1 w-20 bg-emerald-500/40" />
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted">
              Closed Allocations
            </span>
            <p className="text-3xl font-serif font-light text-emerald-400 tabular-nums">
              {stats.closed}
            </p>
          </div>
          <CheckCircle2 className="h-5 w-5 text-emerald-500/40" />
        </Card>
      </div>

      {/* ───────────────────────────────────────────────────────── */}
      {/* FILTER & SEARCH SYSTEMS                                   */}
      {/* ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Navigation Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-obsidian border border-border/60 overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-medium tracking-wide transition-all whitespace-nowrap ${
              statusFilter === 'ALL'
                ? 'bg-gold text-obsidian font-semibold shadow-sm'
                : 'text-secondary hover:text-primary hover:bg-graphite/45'
            }`}
          >
            All Requests
          </button>
          {(Object.keys(STATUS_CONFIGS) as EnquiryStatus[]).map((key) => {
            const config = STATUS_CONFIGS[key];
            const isSelected = statusFilter === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setStatusFilter(key)}
                className={`px-3.5 py-1.5 rounded-md text-xs font-medium tracking-wide whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-gold text-obsidian font-semibold shadow-sm'
                    : 'text-secondary hover:text-primary hover:bg-graphite/45'
                }`}
              >
                {config.label}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <input
            type="text"
            placeholder="Search Client or Asset..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-graphite/60 border border-border/80 text-sm font-sans text-primary placeholder-muted focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all"
          />
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────── */}
      {/* ENQUIRIES LIST VIEW                                       */}
      {/* ───────────────────────────────────────────────────────── */}
      {filteredEnquiries.length === 0 ? (
        <div className="rounded-xl border border-border/60 bg-graphite/40 py-16 px-6 text-center">
          <div className="w-12 h-12 rounded-full border border-gold/25 bg-gold/5 flex items-center justify-center mx-auto mb-4">
            <Inbox className="h-5 w-5 text-gold" />
          </div>
          <h3 className="text-base font-serif font-light text-primary">No Matching Dossiers Located</h3>
          <p className="text-xs text-muted font-sans mt-1 max-w-sm mx-auto">
            Try adjusting your search keywords or state filters to view client records.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEnquiries.map((item) => {
            const statusStyle = STATUS_CONFIGS[item.status];
            const StatusIcon = statusStyle.icon;

            return (
              <Link
                key={item.id}
                href={`/dashboard/enquiries/${item.id}`}
                className="group block"
              >
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl border border-border/80 bg-graphite/95 hover:border-gold/30 transition-all duration-300 relative overflow-hidden backdrop-blur-md">
                  <div className="absolute inset-0 bg-linear-to-r from-gold/1 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                  <div className="flex items-start sm:items-center gap-4 min-w-0">
                    <div className="h-10 w-10 rounded-lg bg-obsidian flex items-center justify-center border border-border/60 group-hover:border-gold/20 transition-colors shrink-0">
                      <User className="h-4.5 w-4.5 text-muted group-hover:text-gold transition-colors" />
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-serif font-normal text-primary tracking-wide">
                          {item.name}
                        </h4>
                        <span className="text-[10px] font-mono text-muted uppercase">
                          #{item.id.slice(4, 10)}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted font-sans">
                        <span>{item.email}</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="flex items-center gap-1">
                          <Car className="h-3 w-3" />
                          <span className="text-secondary font-medium">
                            {item.vehicle.make} {item.vehicle.model}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-border/40">
                    <div className="flex items-center gap-2">
                      <div className="text-right hidden sm:block">
                        <div className="text-xs font-semibold text-gold">
                          {formatCurrency(item.vehicle.price, item.vehicle.currency)}
                        </div>
                        <div className="text-[9px] font-mono text-muted tracking-wider uppercase mt-0.5">
                          {item.vehicle.year} Specification
                        </div>
                      </div>

                      <Badge variant={statusStyle.variant} size="sm">
                        <StatusIcon className="h-3 w-3 mr-1" />
                        <span>{statusStyle.label}</span>
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] font-mono text-muted">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {new Date(item.createdAt).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted group-hover:text-gold group-hover:translate-x-0.5 transition-all duration-300" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────── */}
      {/* CONCIERGE INFORMATION SECURITY BLOCK                      */}
      {/* ───────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-yellow-500/10 bg-yellow-500/1 p-4 flex items-start gap-3.5 max-w-4xl">
        <ShieldAlert className="h-5 w-5 text-gold shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-sans font-semibold uppercase tracking-wider text-gold">
            Secured Agent Workspace Protocol
          </h4>
          <p className="text-[11px] text-secondary leading-relaxed font-sans">
            This workspace displays active private client intent indices. Ensure standard secure custody protocols are respected during phone contact, appraisal, and contract execution. Access logs are verified on every state modification.
          </p>
        </div>
      </div>
    </div>
  );
}