'use client';
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Store,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  Mail,
  Phone,
  MapPin,
  Car,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Star,
  Copy,
  ArrowUpDown,
  Building2,
  Loader2,
  ExternalLink,
  ChevronRight,
  RefreshCcw,
} from 'lucide-react';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/utils/cn';
import { getAdminDealers, toggleDealerVerification } from '@/actions/admin';

// ─────────────────────────────────────────────────────────────
// TYPES & INTERFACES
// ─────────────────────────────────────────────────────────────
export interface AdminDealerRecord {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  verified: boolean;
  vehiclesCount: number;
  activeEnquiriesCount?: number;
  rating?: number;
  totalReviews?: number;
  joinedAt: string;
  licenseNumber?: string;
}

interface ActionResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

type DealerStatusFilter = 'ALL' | 'VERIFIED' | 'UNVERIFIED';
type DealerSortOption = 'NEWEST' | 'VEHICLES_DESC' | 'RATING_DESC' | 'NAME_ASC';

export default function AdminDealersPage() {
  const { showToast } = useToast();

  const [dealers, setDealers] = useState<AdminDealerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<DealerStatusFilter>('ALL');
  const [sortBy, setSortBy] = useState<DealerSortOption>('NEWEST');

  // ─────────────────────────────────────────────────────────────
  // SECURE DATA FETCH
  // ─────────────────────────────────────────────────────────────
  const loadDealers = useCallback(async (isSilent = false) => {
    if (isSilent) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await getAdminDealers() as ActionResponse<AdminDealerRecord[]>;

      if (response?.success && Array.isArray(response.data)) {
        setDealers(response.data);
      } else {
        setDealers([]);
        showToast({
          type: 'error',
          title: 'Broker Registry Sync Failed',
          message: response?.message || 'Unable to retrieve dealership records from the database.',
        });
      }
    } catch (error) {
      console.error('[AdminDealers] Fetch exception:', error);
      setDealers([]);
      showToast({
        type: 'error',
        title: 'Connection Error',
        message: 'Could not connect to the brokerage governance registry.',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showToast]);

  // ✅ Fix: Wrap loadDealers call in async function
  useEffect(() => {
    const fetchData = async () => {
      await loadDealers();
    };
    fetchData();
  }, [loadDealers]);

  // ─────────────────────────────────────────────────────────────
  // BROKERAGE ACCREDITATION TOGGLE
  // ─────────────────────────────────────────────────────────────
  const handleVerifyToggle = async (dealerId: string, currentStatus: boolean, dealerName: string) => {
    setUpdatingId(dealerId);
    const nextStatus = !currentStatus;
    const previous = [...dealers];

    // Optimistic local state update
    setDealers((prev) =>
      prev.map((d) => (d.id === dealerId ? { ...d, verified: nextStatus } : d))
    );

    try {
      const response = await toggleDealerVerification(dealerId, nextStatus) as ActionResponse<unknown>;

      if (response?.success) {
        showToast({
          type: nextStatus ? 'success' : 'warning',
          title: nextStatus ? 'Accreditation Approved' : 'Accreditation Revoked',
          message: nextStatus
            ? `${dealerName} is now authorized with verified institutional status.`
            : `Verified badge removed for ${dealerName}.`,
        });
      } else {
        setDealers(previous);
        showToast({
          type: 'error',
          title: 'Update Rejected',
          message: response?.message || 'Unable to write accreditation status to database.',
        });
      }
    } catch (error) {
      setDealers(previous);
      console.error('[AdminDealers] Toggle error:', error);
      showToast({
        type: 'error',
        title: 'Server Exception',
        message: 'An unexpected error occurred while modifying the broker status.',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast({
      type: 'info',
      title: 'Copied to Clipboard',
      message: `${label} copied: ${text}`,
    });
  };

  // ─────────────────────────────────────────────────────────────
  // KPI METRICS CALCULATION
  // ─────────────────────────────────────────────────────────────
  const metrics = useMemo(() => {
    const safeDealers = Array.isArray(dealers) ? dealers : [];
    const total = safeDealers.length;
    const verifiedCount = safeDealers.filter((d) => d.verified).length;
    const pendingCount = safeDealers.filter((d) => !d.verified).length;
    const totalVehiclesManaged = safeDealers.reduce((acc, d) => acc + (d.vehiclesCount || 0), 0);

    return { total, verifiedCount, pendingCount, totalVehiclesManaged };
  }, [dealers]);

  // ─────────────────────────────────────────────────────────────
  // FILTERING & SORTING ENGINE
  // ─────────────────────────────────────────────────────────────
  const filteredDealers = useMemo(() => {
    const safeDealers = Array.isArray(dealers) ? dealers : [];
    return safeDealers
      .filter((d) => {
        const query = search.toLowerCase();
        const matchesSearch =
          d.name.toLowerCase().includes(query) ||
          d.email.toLowerCase().includes(query) ||
          (d.location && d.location.toLowerCase().includes(query)) ||
          (d.licenseNumber && d.licenseNumber.toLowerCase().includes(query));

        const matchesStatus =
          statusFilter === 'ALL' ||
          (statusFilter === 'VERIFIED' && d.verified) ||
          (statusFilter === 'UNVERIFIED' && !d.verified);

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'VEHICLES_DESC':
            return (b.vehiclesCount || 0) - (a.vehiclesCount || 0);
          case 'RATING_DESC':
            return (b.rating || 0) - (a.rating || 0);
          case 'NAME_ASC':
            return a.name.localeCompare(b.name);
          case 'NEWEST':
          default:
            return new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime();
        }
      });
  }, [dealers, search, statusFilter, sortBy]);

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-16">
      {/* ───────────────────────────────────────────────────────── */}
      {/* HEADER                                                    */}
      {/* ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="gold" size="sm">
              <span className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest">
                <Sparkles className="h-3 w-3" />
                Network Custody
              </span>
            </Badge>
            <span className="text-muted text-xs">•</span>
            <span className="text-xs font-mono text-muted uppercase">Brokerage Directory</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-serif font-light text-primary tracking-tight">
            Institutional Brokerages & Dealers
          </h1>
          <p className="text-xs sm:text-sm text-secondary font-sans mt-1">
            Audit dealership credentials, verify operating licenses, and govern partner showroom allocations.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => loadDealers(true)}
          disabled={refreshing || loading}
          className="self-start sm:self-auto text-xs uppercase tracking-wider border-border hover:border-gold/30"
        >
          {refreshing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
          ) : (
            <RefreshCcw className="h-3.5 w-3.5 mr-2" />
          )}
          <span>{refreshing ? 'Syncing...' : 'Refresh Directory'}</span>
        </Button>
      </div>

      {/* ───────────────────────────────────────────────────────── */}
      {/* GOVERNANCE KPI DECK                                       */}
      {/* ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 bg-graphite/80 border-border/80 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted">Total Partner Desks</span>
            <p className="text-3xl font-serif font-light text-primary tabular-nums">{metrics.total}</p>
          </div>
          <Building2 className="h-5 w-5 text-blue-400/80" />
        </Card>

        <Card className="p-5 bg-graphite/80 border-border/80 flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 h-1 w-20 bg-emerald-500/40" />
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted">Accredited / Verified</span>
            <p className="text-3xl font-serif font-light text-emerald-400 tabular-nums">{metrics.verifiedCount}</p>
          </div>
          <ShieldCheck className="h-5 w-5 text-emerald-500/40" />
        </Card>

        <Card className="p-5 bg-graphite/80 border-border/80 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted">Pending Compliance</span>
            <p className="text-3xl font-serif font-light text-yellow-400 tabular-nums">{metrics.pendingCount}</p>
          </div>
          <ShieldAlert className="h-5 w-5 text-yellow-500/40" />
        </Card>

        <Card className="p-5 bg-graphite/80 border-border/80 flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 h-1 w-20 bg-gold/40" />
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted">Managed Fleet Assets</span>
            <p className="text-3xl font-serif font-light text-gold tabular-nums">{metrics.totalVehiclesManaged}</p>
          </div>
          <Car className="h-5 w-5 text-gold/60" />
        </Card>
      </div>

      {/* ───────────────────────────────────────────────────────── */}
      {/* FILTER & SEARCH CONTROLS                                  */}
      {/* ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <input
            type="text"
            placeholder="Search by Dealership Name, Email, Showroom City, or License ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-graphite/60 border border-border/80 text-sm font-sans text-primary placeholder-muted focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as DealerStatusFilter)}
            className="h-10 px-3.5 rounded-lg bg-graphite/60 border border-border/80 text-xs font-mono uppercase tracking-wider text-primary focus:outline-none focus:border-gold transition-all"
          >
            <option value="ALL">All Brokerages</option>
            <option value="VERIFIED">Accredited Only</option>
            <option value="UNVERIFIED">Pending Compliance</option>
          </select>

          <div className="flex items-center gap-1.5 h-10 px-3 rounded-lg bg-graphite/60 border border-border/80">
            <ArrowUpDown className="h-3.5 w-3.5 text-muted shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as DealerSortOption)}
              className="bg-transparent text-xs font-mono uppercase tracking-wider text-primary focus:outline-none cursor-pointer"
            >
              <option value="NEWEST">Newest Enrolled</option>
              <option value="VEHICLES_DESC">Fleet Volume (High-Low)</option>
              <option value="RATING_DESC">Satisfaction Score</option>
              <option value="NAME_ASC">Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────── */}
      {/* DEALERS ROSTER                                            */}
      {/* ───────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-36 w-full rounded-xl bg-graphite/50 border border-border/40" />
          ))}
        </div>
      ) : filteredDealers.length === 0 ? (
        <Card className="py-16 px-6 text-center bg-graphite/40 border-border/60">
          <div className="w-16 h-16 rounded-full border border-gold/30 bg-gold/5 flex items-center justify-center mx-auto mb-4">
            <Store className="h-7 w-7 text-gold stroke-[1.5]" />
          </div>
          <h3 className="text-xl font-serif font-light text-primary">No Matching Dealerships Found</h3>
          <p className="text-xs text-secondary font-sans max-w-sm mx-auto mt-1">
            Adjust your search terms or status filters to locate partner brokerage desks.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredDealers.map((dealer) => {
            const isToggling = updatingId === dealer.id;
            const userInitial = dealer.name.charAt(0).toUpperCase() || 'D';

            return (
              <Card
                key={dealer.id}
                className="p-5 bg-graphite/90 border-border/80 hover:border-gold/30 transition-all duration-300 relative overflow-hidden backdrop-blur-md"
              >
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
                  {/* Left: Avatar & Identity Details */}
                  <div className="flex items-start sm:items-center gap-4 min-w-0">
                    {/* Dealership Crest Avatar */}
                    <div className="relative h-12 w-12 rounded-xl bg-obsidian border border-gold/40 flex items-center justify-center text-gold font-serif text-lg shrink-0 shadow-[0_0_15px_rgba(212,175,55,0.15)]">
                      <span>{userInitial}</span>
                      {dealer.verified && (
                        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-obsidian flex items-center justify-center">
                          <CheckCircle2 className="h-2 w-2 text-obsidian" />
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/admin/dealers/${dealer.id}`}
                          className="font-serif text-lg text-primary hover:text-gold transition-colors tracking-wide truncate"
                        >
                          {dealer.name}
                        </Link>

                        <Badge variant={dealer.verified ? 'success' : 'warning'} size="sm">
                          {dealer.verified ? 'Accredited Partner' : 'Pending Audit'}
                        </Badge>

                        {dealer.rating && dealer.rating > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-obsidian border border-border text-[10px] font-mono text-gold">
                            <Star className="h-2.5 w-2.5 fill-gold" />
                            <span>{dealer.rating.toFixed(1)}</span>
                            {dealer.totalReviews && (
                              <span className="text-muted">({dealer.totalReviews})</span>
                            )}
                          </span>
                        )}
                      </div>

                      {/* Contact & Location Strip */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted font-sans">
                        <span className="flex items-center gap-1.5">
                          <Mail className="h-3 w-3 text-gold/80" />
                          <span className="text-secondary">{dealer.email}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(dealer.email, 'Email')}
                            className="text-muted hover:text-gold p-0.5"
                            title="Copy Email"
                          >
                            <Copy size={11} />
                          </button>
                        </span>

                        {dealer.phone && (
                          <span className="flex items-center gap-1.5">
                            <Phone className="h-3 w-3 text-gold/80" />
                            <span className="text-secondary">{dealer.phone}</span>
                          </span>
                        )}

                        {dealer.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-gold/80" />
                            <span>{dealer.location}</span>
                          </span>
                        )}
                      </div>

                      {/* Enrolled Metadata */}
                      <div className="flex items-center gap-3 text-[11px] font-mono text-muted pt-0.5">
                        <span>
                          Enrolled:{' '}
                          {new Date(dealer.joinedAt).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                        {dealer.licenseNumber && (
                          <>
                            <span>•</span>
                            <span>License: {dealer.licenseNumber}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Fleet Stats & Action Controls */}
                  <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-3 pt-4 lg:pt-0 border-t lg:border-t-0 border-border/40 shrink-0">
                    <div className="text-left lg:text-right">
                      <div className="text-xs font-mono font-semibold text-gold">
                        {dealer.vehiclesCount} Managed Asset{dealer.vehiclesCount === 1 ? '' : 's'}
                      </div>
                      <div className="text-[10px] font-mono text-muted uppercase tracking-wider mt-0.5">
                        Active Inventory Fleet
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Link href={`/admin/dealers/${dealer.id}`}>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="text-xs uppercase font-mono tracking-wider border-border hover:border-gold/30"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          <span>Dossier</span>
                        </Button>
                      </Link>

                      <Button
                        type="button"
                        variant={dealer.verified ? 'secondary' : 'gold'}
                        size="sm"
                        disabled={isToggling}
                        onClick={() => handleVerifyToggle(dealer.id, dealer.verified, dealer.name)}
                        className={cn(
                          'text-xs uppercase font-mono tracking-wider font-semibold',
                          dealer.verified
                            ? 'text-red-400 hover:text-red-300 hover:border-red-500/30'
                            : 'shadow-[0_0_12px_rgba(212,175,55,0.2)]'
                        )}
                      >
                        {isToggling ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                        ) : dealer.verified ? (
                          <XCircle className="h-3.5 w-3.5 mr-1 text-red-400" />
                        ) : (
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                        )}
                        <span>{dealer.verified ? 'Revoke Status' : 'Accredit Partner'}</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}