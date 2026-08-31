/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  Package,
  MessageSquare,
  Eye,
  TrendingUp,
  PlusCircle,
  ArrowRight,
  Car,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Compass,
  RefreshCcw,
  Loader2,
  LucideIcon,
  ChevronRight,
  User,
} from 'lucide-react';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, BadgeProps } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/utils/cn';
import { getDealerEnquiries } from '@/actions/enquiries';

// ─────────────────────────────────────────────────────────────
// TYPES & INTERFACES
// ─────────────────────────────────────────────────────────────
export type EnquiryStatus = 'NEW' | 'CONTACTED' | 'NEGOTIATING' | 'CLOSED' | 'CANCELLED';

export interface DashboardMetrics {
  totalVehicles: number;
  publishedVehicles: number;
  pendingVehicles: number;
  soldVehicles: number;
  totalEnquiries: number;
  newEnquiries: number;
  totalViews: number;
}

export interface RecentEnquiryItem {
  id: string;
  customer: string;
  email?: string;
  vehicle: string;
  status: EnquiryStatus;
  createdAt: string;
}

interface ActionResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

interface RawEnquiryData {
  id: string;
  name?: string;
  email?: string;
  status?: string;
  createdAt?: string;
  vehicle?: {
    make?: string;
    model?: string;
    year?: number;
  };
}

interface StatusMeta {
  label: string;
  variant: NonNullable<BadgeProps['variant']>;
  icon: LucideIcon;
}

// ─────────────────────────────────────────────────────────────
// STATUS METADATA CONFIG
// ─────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<EnquiryStatus, StatusMeta> = {
  NEW: { label: 'New Request', variant: 'warning', icon: Clock },
  CONTACTED: { label: 'Contacted', variant: 'info', icon: MessageSquare },
  NEGOTIATING: { label: 'In Negotiation', variant: 'gold', icon: AlertCircle },
  CLOSED: { label: 'Acquired', variant: 'success', icon: CheckCircle2 },
  CANCELLED: { label: 'Archived', variant: 'danger', icon: XCircle },
};

export default function DealerDashboard() {
  const { data: session } = useSession();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [recentEnquiries, setRecentEnquiries] = useState<RecentEnquiryItem[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalVehicles: 0,
    publishedVehicles: 0,
    pendingVehicles: 0,
    soldVehicles: 0,
    totalEnquiries: 0,
    newEnquiries: 0,
    totalViews: 0,
  });

  // ─────────────────────────────────────────────────────────────
  // LOAD LIVE DASHBOARD DATA
  // ─────────────────────────────────────────────────────────────
  const loadDashboardData = useCallback(async (isSilent = false) => {
    if (isSilent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      // 1. Fetch real dealer inquiries from database
      const enquiriesRes = (await getDealerEnquiries()) as ActionResponse<RawEnquiryData[]>;

      if (enquiriesRes.success && Array.isArray(enquiriesRes.data)) {
        const rawList = enquiriesRes.data;

        // Parse recent enquiries
        const mappedEnquiries: RecentEnquiryItem[] = rawList.slice(0, 5).map((item) => ({
          id: item.id,
          customer: item.name || 'Confidential Client',
          email: item.email,
          vehicle: item.vehicle ? `${item.vehicle.year || ''} ${item.vehicle.make} ${item.vehicle.model}`.trim() : 'Bespoke Allocation',
          status: (item.status as EnquiryStatus) || 'NEW',
          createdAt: item.createdAt || new Date().toISOString(),
        }));

        setRecentEnquiries(mappedEnquiries);

        // Derive dynamic inquiry counts
        const newCount = rawList.filter((e) => e.status === 'NEW').length;

        setMetrics((prev) => ({
          ...prev,
          totalEnquiries: rawList.length,
          newEnquiries: newCount,
        }));
      }
    } catch (error) {
      console.error('[DealerDashboard] Data sync exception:', error);
      showToast({
        type: 'error',
        title: 'Ledger Sync Interrupted',
        message: 'Unable to refresh live registry metrics from the database.',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleManualSync = async () => {
    await loadDashboardData(true);
    showToast({
      type: 'success',
      title: 'Ledger Synchronized',
      message: 'Terminal indices updated with verified database ledger.',
    });
  };

  // ─────────────────────────────────────────────────────────────
  // METRIC KPI CONFIGURATION
  // ─────────────────────────────────────────────────────────────
  const statCards = useMemo(
    () => [
      {
        label: 'Managed Allocations',
        value: metrics.totalVehicles,
        icon: Car,
        href: '/dealer/inventory',
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/10 border-blue-500/20',
        badge: 'Inventory',
      },
      {
        label: 'Live Showroom Units',
        value: metrics.publishedVehicles,
        icon: CheckCircle2,
        href: '/dealer/inventory?status=PUBLISHED',
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-500/10 border-emerald-500/20',
        badge: 'Active',
      },
      {
        label: 'Appraisal & Review',
        value: metrics.pendingVehicles,
        icon: Clock,
        href: '/dealer/inventory?status=PENDING_REVIEW',
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/10 border-yellow-500/20',
        badge: 'Pending',
      },
      {
        label: 'Client Inquiries',
        value: metrics.newEnquiries,
        icon: MessageSquare,
        href: '/dealer/enquiries?status=NEW',
        color: 'text-gold',
        bgColor: 'bg-gold/10 border-gold/20',
        badge: 'Priority',
      },
    ],
    [metrics]
  );

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-16">
      {/* ───────────────────────────────────────────────────────── */}
      {/* TERMINAL HEADER & BROKER PROFILE BADGE                    */}
      {/* ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="gold" size="sm">
              <span className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest">
                <Sparkles className="h-3 w-3" />
                Custodian Operations Hub
              </span>
            </Badge>
            <span className="text-muted text-xs">•</span>
            <span className="text-xs font-mono text-muted uppercase">Geneva & Mayfair Desk</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-serif font-light text-primary tracking-tight">
            Welcome back, {session?.user?.name || 'Verified Broker'}
          </h1>
          <p className="text-xs sm:text-sm text-secondary font-sans mt-1">
            Here is your live automotive inventory ledger, private allocations, and incoming client inquiries.
          </p>
        </div>

        {/* Global Terminal Controls */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleManualSync}
            disabled={refreshing || loading}
            className="text-xs uppercase tracking-wider border-border hover:border-gold/30"
          >
            {refreshing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
            ) : (
              <RefreshCcw className="h-3.5 w-3.5 mr-2" />
            )}
            <span>{refreshing ? 'Syncing...' : 'Sync Registry'}</span>
          </Button>

          <Link href="/dealer/vehicles/new">
            <Button variant="gold" size="sm" className="text-xs uppercase tracking-wider font-semibold">
              <PlusCircle className="h-3.5 w-3.5 mr-1.5" />
              List Allocation
            </Button>
          </Link>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────── */}
      {/* INSTITUTIONAL KPI DECK                                    */}
      {/* ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? [...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl bg-graphite/60 border border-border/40" />
            ))
          : statCards.map((stat) => (
              <Link key={stat.label} href={stat.href} className="group block focus-visible:outline-none">
                <Card className="p-5 bg-graphite/90 border-border/80 hover:border-gold/40 transition-all duration-300 relative overflow-hidden backdrop-blur-md">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-muted group-hover:text-secondary transition-colors">
                        {stat.label}
                      </span>
                      <p className="text-3xl font-serif font-light text-primary tabular-nums tracking-tight">
                        {stat.value}
                      </p>
                    </div>

                    <div
                      className={cn(
                        'p-2.5 rounded-lg border transition-transform duration-300 group-hover:scale-105',
                        stat.bgColor
                      )}
                    >
                      <stat.icon className={cn('h-5 w-5', stat.color)} />
                    </div>
                  </div>

                  {/* Micro footer status */}
                  <div className="mt-3 pt-3 border-t border-border/30 flex items-center justify-between text-[10px] font-mono text-muted">
                    <span className="uppercase tracking-widest">{stat.badge}</span>
                    <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 group-hover:text-gold transition-all" />
                  </div>
                </Card>
              </Link>
            ))}
      </div>

      {/* ───────────────────────────────────────────────────────── */}
      {/* RAPID EXECUTIVE ACTIONS                                   */}
      {/* ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/dealer/vehicles/new" className="group block">
          <Card className="p-6 bg-graphite/85 border-border/80 hover:border-gold/40 transition-all duration-300 relative overflow-hidden text-left h-full">
            <div className="h-10 w-10 rounded-lg bg-gold/10 border border-gold/30 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <PlusCircle className="h-5 w-5 text-gold" />
            </div>
            <h3 className="text-base font-serif font-light text-primary group-hover:text-gold transition-colors">
              List New Allocation
            </h3>
            <p className="text-xs text-secondary font-sans leading-relaxed mt-1.5">
              Submit a bespoke vehicle specification, pricing structure, and documentation for authentication.
            </p>
          </Card>
        </Link>

        <Link href="/dealer/inventory" className="group block">
          <Card className="p-6 bg-graphite/85 border-border/80 hover:border-gold/40 transition-all duration-300 relative overflow-hidden text-left h-full">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Package className="h-5 w-5 text-blue-400" />
            </div>
            <h3 className="text-base font-serif font-light text-primary group-hover:text-gold transition-colors">
              Managed Inventory
            </h3>
            <p className="text-xs text-secondary font-sans leading-relaxed mt-1.5">
              Audit live portfolio status, revise appraisals, update images, and manage visibility settings.
            </p>
          </Card>
        </Link>

        <Link href="/dealer/enquiries" className="group block">
          <Card className="p-6 bg-graphite/85 border-border/80 hover:border-gold/40 transition-all duration-300 relative overflow-hidden text-left h-full">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <MessageSquare className="h-5 w-5 text-emerald-400" />
            </div>
            <h3 className="text-base font-serif font-light text-primary group-hover:text-gold transition-colors">
              Client Inquiries & Dossiers
            </h3>
            <p className="text-xs text-secondary font-sans leading-relaxed mt-1.5">
              Access incoming acquisition offers, trade-in valuations, and arrange private viewing appointments.
            </p>
          </Card>
        </Link>
      </div>

      {/* ───────────────────────────────────────────────────────── */}
      {/* RECENT CLIENT INQUIRIES STREAM                            */}
      {/* ───────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-serif font-light text-primary">Recent Client Inquiries</h2>
            <p className="text-xs text-muted font-sans mt-0.5">
              Live chronological stream of private client acquisition requests
            </p>
          </div>

          <Link
            href="/dealer/enquiries"
            className="text-xs font-mono uppercase tracking-widest text-gold hover:text-gold-hover transition-colors inline-flex items-center gap-1 group"
          >
            <span>View All Registry Leads</span>
            <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl bg-graphite/50" />
            ))}
          </div>
        ) : recentEnquiries.length > 0 ? (
          <div className="space-y-3">
            {recentEnquiries.map((enquiry) => {
              const statusMeta = STATUS_CONFIG[enquiry.status] || STATUS_CONFIG.NEW;
              const StatusIcon = statusMeta.icon;

              return (
                <Link
                  key={enquiry.id}
                  href={`/dealer/enquiries/${enquiry.id}`}
                  className="group block"
                >
                  <Card className="p-4 bg-graphite/90 border-border/80 hover:border-gold/30 transition-all duration-300 relative overflow-hidden backdrop-blur-md">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="h-10 w-10 rounded-lg bg-obsidian border border-border/80 flex items-center justify-center shrink-0 group-hover:border-gold/30 transition-colors">
                          <User className="h-4.5 w-4.5 text-muted group-hover:text-gold transition-colors" />
                        </div>

                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-serif font-normal text-primary tracking-wide truncate">
                              {enquiry.customer}
                            </p>
                            <span className="text-[10px] font-mono text-muted uppercase">
                              #{enquiry.id.slice(0, 6)}
                            </span>
                          </div>

                          <p className="text-xs text-secondary font-sans flex items-center gap-1.5 truncate">
                            <Car className="h-3 w-3 text-muted shrink-0" />
                            <span className="text-gold font-medium">{enquiry.vehicle}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/30">
                        <span className="text-[10px] font-mono text-muted">
                          {new Date(enquiry.createdAt).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>

                        <Badge variant={statusMeta.variant} size="sm">
                          <StatusIcon className="h-3 w-3 mr-1" />
                          <span>{statusMeta.label}</span>
                        </Badge>

                        <ChevronRight className="h-4 w-4 text-muted group-hover:text-gold group-hover:translate-x-0.5 transition-all hidden sm:block" />
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <Card className="py-12 px-6 text-center bg-graphite/40 border-border/60">
            <div className="w-12 h-12 rounded-full border border-gold/30 bg-gold/5 flex items-center justify-center mx-auto mb-3">
              <MessageSquare className="h-5 w-5 text-gold" />
            </div>
            <h3 className="text-base font-serif font-light text-primary">No Inquiries Lodged</h3>
            <p className="text-xs text-secondary font-sans max-w-sm mx-auto mt-1">
              When prospective clients inquire about your vehicle allocations, their dossiers will appear in real-time here.
            </p>
          </Card>
        )}
      </div>

      {/* ───────────────────────────────────────────────────────── */}
      {/* MARKET INTELLIGENCE & SECURITY FOOTER                     */}
      {/* ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Exposure Counter */}
        <Card className="p-5 bg-graphite/80 border-border/80 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center">
              <Eye className="h-5 w-5 text-gold" />
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-muted">
                Cumulative Asset Impressions
              </p>
              <p className="text-2xl font-serif font-light text-primary mt-0.5 tabular-nums">
                {metrics.totalViews.toLocaleString()}
              </p>
            </div>
          </div>
          <TrendingUp className="h-5 w-5 text-emerald-400" />
        </Card>

        {/* Institutional Verification Status */}
        <Card className="p-5 bg-graphite/80 border-border/80 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-muted">
                Institutional Protocol
              </p>
              <p className="text-sm font-serif font-normal text-primary mt-0.5">
                Custody Status: Active & Compliant
              </p>
            </div>
          </div>
          <Compass className="h-5 w-5 text-gold/40" />
        </Card>
      </div>
    </div>
  );
}