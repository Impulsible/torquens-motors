'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Car,
  Store,
  MessageSquare,
  TrendingUp,
  ArrowRight,
  Sparkles,
  RefreshCcw,
  Loader2,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/hooks/useToast';
import { formatCurrency } from '@/utils/helpers';
import { cn } from '@/utils/cn';
// ✅ Fix: Create this file or update import
import { getAdminDashboardStats } from '@/actions/admin';

// ─────────────────────────────────────────────────────────────
// TYPES & INTERFACES
// ─────────────────────────────────────────────────────────────
export interface AdminMetrics {
  totalVehicles: number;
  verifiedVehicles: number;
  pendingVerification: number;
  totalDealers: number;
  verifiedDealers: number;
  totalUsers: number;
  totalEnquiries: number;
  newEnquiries: number;
  grossMarketVolume: number;
}

export interface RecentVehicleAudit {
  id: string;
  make: string;
  model: string;
  year: number;
  status: string;
  verified: 'VERIFIED' | 'PENDING' | 'REJECTED';
  dealer: string;
  createdAt: string;
}

export interface RecentDealerAudit {
  id: string;
  name: string;
  email: string;
  verified: boolean;
  vehiclesCount: number;
  joinedAt: string;
}

interface AdminDashboardPayload {
  stats: AdminMetrics;
  recentVehicles: RecentVehicleAudit[];
  recentDealers: RecentDealerAudit[];
}

interface ActionResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export default function AdminDashboard() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [metrics, setMetrics] = useState<AdminMetrics>({
    totalVehicles: 0,
    verifiedVehicles: 0,
    pendingVerification: 0,
    totalDealers: 0,
    verifiedDealers: 0,
    totalUsers: 0,
    totalEnquiries: 0,
    newEnquiries: 0,
    grossMarketVolume: 0,
  });

  const [recentVehicles, setRecentVehicles] = useState<RecentVehicleAudit[]>([]);
  const [recentDealers, setRecentDealers] = useState<RecentDealerAudit[]>([]);

  // ─────────────────────────────────────────────────────────────
  // SECURE LEDGER DATA FETCH
  // ─────────────────────────────────────────────────────────────
  const loadDashboardData = useCallback(async (isSilent = false) => {
    if (isSilent) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await getAdminDashboardStats() as ActionResponse<AdminDashboardPayload>;

      if (response?.success && response.data) {
        setMetrics(response.data.stats);
        setRecentVehicles(response.data.recentVehicles || []);
        setRecentDealers(response.data.recentDealers || []);
      } else {
        showToast({
          type: 'error',
          title: 'Ledger Access Failed',
          message: response?.message || 'Unable to retrieve administrative indices.',
        });
      }
    } catch (error) {
      console.error('[AdminDashboard] Exception:', error);
      showToast({
        type: 'error',
        title: 'Connection Error',
        message: 'Could not connect to the master governance ledger.',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showToast]);

  // ✅ Fix: Move loadDashboardData call inside useEffect
  useEffect(() => {
    const fetchData = async () => {
      await loadDashboardData();
    };
    fetchData();
  }, [loadDashboardData]);

  const handleManualSync = async () => {
    await loadDashboardData(true);
    showToast({
      type: 'success',
      title: 'Ledger Synchronized',
      message: 'Master database audit verified.',
    });
  };

  const statCards = useMemo(
    () => [
      {
        label: 'Platform Fleet Units',
        value: metrics.totalVehicles,
        icon: Car,
        href: '/admin/vehicles',
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/10 border-blue-500/20',
      },
      {
        label: 'Pending Provenance Queue',
        value: metrics.pendingVerification,
        icon: ShieldAlert,
        href: '/admin/verification',
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/10 border-yellow-500/20',
      },
      {
        label: 'Institutional Brokers',
        value: metrics.totalDealers,
        icon: Store,
        href: '/admin/dealers',
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-500/10 border-emerald-500/20',
      },
      {
        label: 'Live Client Inquiries',
        value: metrics.newEnquiries,
        icon: MessageSquare,
        href: '/admin/enquiries',
        color: 'text-gold',
        bgColor: 'bg-gold/10 border-gold/20',
      },
    ],
    [metrics]
  );

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="gold" size="sm">
              <span className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest">
                <Sparkles className="h-3 w-3" />
                Master Protocol
              </span>
            </Badge>
            <span className="text-muted text-xs">•</span>
            <span className="text-xs font-mono text-muted uppercase">Global Governance Engine</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-serif font-light text-primary tracking-tight">
            Executive Governance Console
          </h1>
          <p className="text-xs sm:text-sm text-secondary font-sans mt-1">
            Real-time compliance monitoring, brokerage verification, and platform transaction audit.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={handleManualSync}
          disabled={refreshing || loading}
          className="self-start sm:self-auto text-xs uppercase tracking-wider border-border hover:border-gold/30"
        >
          {refreshing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
          ) : (
            <RefreshCcw className="h-3.5 w-3.5 mr-2" />
          )}
          <span>{refreshing ? 'Syncing...' : 'Sync Master Ledger'}</span>
        </Button>
      </div>

      {/* KPI Cards */}
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

                    <div className={cn('p-2.5 rounded-lg border transition-transform duration-300 group-hover:scale-105', stat.bgColor)}>
                      <stat.icon className={cn('h-5 w-5', stat.color)} />
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-border/30 flex items-center justify-between text-[10px] font-mono text-muted">
                    <span className="uppercase tracking-widest">Audit Ledger</span>
                    <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 group-hover:text-gold transition-all" />
                  </div>
                </Card>
              </Link>
            ))}
      </div>

      {/* Gross Market Volume Banner */}
      <Card className="p-6 bg-graphite/95 border-gold/30 shadow-dropdown relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-gold to-transparent" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-gold">
              Cumulative Platform Valuation
            </span>
            <p className="text-3xl sm:text-4xl font-serif font-light text-primary tracking-tight tabular-nums">
              {formatCurrency(metrics.grossMarketVolume, 'NGN')}
            </p>
            <p className="text-xs text-muted font-sans">
              Gross asset value of live, pending, and cleared automotive allocations.
            </p>
          </div>

          <div className="h-14 w-14 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center shrink-0 shadow-glow">
            <TrendingUp className="h-7 w-7 text-gold" />
          </div>
        </div>
      </Card>

      {/* Activity Streams Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 1. Recent Listings Audit */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-serif font-light text-primary">Recent Fleet Submissions</h2>
            <Link
              href="/admin/vehicles"
              className="text-xs font-mono uppercase tracking-widest text-gold hover:text-gold-hover transition-colors inline-flex items-center gap-1 group"
            >
              <span>Fleet Registry</span>
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-xl bg-graphite/50" />
              ))}
            </div>
          ) : recentVehicles.length > 0 ? (
            <div className="space-y-3">
              {recentVehicles.map((vehicle) => (
                <Card
                  key={vehicle.id}
                  className="p-4 bg-graphite/90 border-border/80 hover:border-gold/30 transition-all duration-300"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0 space-y-1">
                      <p className="text-sm font-serif text-primary truncate">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </p>
                      <div className="flex items-center gap-2 text-xs font-sans text-muted">
                        <span className="text-secondary">{vehicle.dealer}</span>
                        <span>•</span>
                        <Badge
                          variant={vehicle.status === 'PUBLISHED' ? 'success' : 'warning'}
                          size="sm"
                        >
                          {vehicle.status}
                        </Badge>
                      </div>
                    </div>

                    <Link href={`/admin/vehicles/${vehicle.id}`}>
                      <Button variant="secondary" size="sm" className="text-xs uppercase font-mono tracking-wider">
                        Inspect
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center bg-graphite/40 border-border/60">
              <p className="text-xs text-muted font-sans">No recent fleet submissions recorded.</p>
            </Card>
          )}
        </div>

        {/* 2. Broker Compliance Activity */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-serif font-light text-primary">Brokerage Network</h2>
            <Link
              href="/admin/dealers"
              className="text-xs font-mono uppercase tracking-widest text-gold hover:text-gold-hover transition-colors inline-flex items-center gap-1 group"
            >
              <span>Broker Directory</span>
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-xl bg-graphite/50" />
              ))}
            </div>
          ) : recentDealers.length > 0 ? (
            <div className="space-y-3">
              {recentDealers.map((dealer) => (
                <Card
                  key={dealer.id}
                  className="p-4 bg-graphite/90 border-border/80 hover:border-gold/30 transition-all duration-300"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0 space-y-1">
                      <p className="text-sm font-serif text-primary truncate">{dealer.name}</p>
                      <div className="flex items-center gap-2 text-xs font-sans text-muted">
                        <span className="font-mono text-[11px] text-gold">{dealer.vehiclesCount} units</span>
                        <span>•</span>
                        <Badge variant={dealer.verified ? 'success' : 'warning'} size="sm">
                          {dealer.verified ? 'Verified Broker' : 'Pending Audit'}
                        </Badge>
                      </div>
                    </div>

                    <Link href={`/admin/dealers/${dealer.id}`}>
                      <Button variant="secondary" size="sm" className="text-xs uppercase font-mono tracking-wider">
                        Manage
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center bg-graphite/40 border-border/60">
              <p className="text-xs text-muted font-sans">No brokerage records located.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}