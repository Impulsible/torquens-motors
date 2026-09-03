'use client';
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Package,
  PlusCircle,
  Search,
  Eye,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpDown,
  Car,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  MessageSquare,
  Copy,
  TrendingUp,
  Loader2,
  LucideIcon,
  Filter,
  Download,
  Upload,
  MoreVertical,
  AlertCircle,
  Check,
  X,
} from 'lucide-react';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, BadgeProps } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/hooks/useToast';
import { formatCurrency } from '@/utils/helpers';
import { cn } from '@/utils/cn';
import { getDealerVehicles, deleteVehicle, updateVehicleStatus } from '@/actions/vehicles';

// ─────────────────────────────────────────────────────────────
// TYPES & INTERFACES
// ─────────────────────────────────────────────────────────────
export type VehicleStatus = 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'SOLD' | 'ARCHIVED';
export type VerificationStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
export type SortOption = 'NEWEST' | 'PRICE_DESC' | 'PRICE_ASC' | 'VIEWS' | 'ENQUIRIES';

export interface VehicleInventoryItem {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  currency: string;
  mileage: number;
  vin?: string;
  images: string[];
  status: VehicleStatus;
  verified?: VerificationStatus;
  views?: number;
  enquiriesCount?: number;
  createdAt: string;
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
}

// ─────────────────────────────────────────────────────────────
// STATUS METADATA CONFIG
// ─────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<VehicleStatus, StatusMeta> = {
  DRAFT: { label: 'Draft', variant: 'default', icon: Clock },
  PENDING_REVIEW: { label: 'Pending Review', variant: 'warning', icon: Clock },
  APPROVED: { label: 'Approved', variant: 'info', icon: CheckCircle2 },
  PUBLISHED: { label: 'Live Showroom', variant: 'success', icon: CheckCircle2 },
  SOLD: { label: 'Sold / Allocated', variant: 'danger', icon: XCircle },
  ARCHIVED: { label: 'Archived', variant: 'default', icon: XCircle },
};

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PENDING_REVIEW', label: 'Pending Review' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'SOLD', label: 'Sold' },
  { value: 'ARCHIVED', label: 'Archived' },
];

const SORT_OPTIONS = [
  { value: 'NEWEST', label: 'Newest Listed' },
  { value: 'PRICE_DESC', label: 'Price: High to Low' },
  { value: 'PRICE_ASC', label: 'Price: Low to High' },
  { value: 'VIEWS', label: 'Most Impressions' },
  { value: 'ENQUIRIES', label: 'Most Inquiries' },
];

export default function DealerInventoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  // State
  const [vehicles, setVehicles] = useState<VehicleInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  // Filters & Sorting
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('status') || 'ALL');
  const [sortBy, setSortBy] = useState<SortOption>('NEWEST');

  // Bulk selection
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([]);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkAction, setBulkAction] = useState<'status' | 'delete'>('status');
  const [bulkStatus, setBulkStatus] = useState<VehicleStatus>('PUBLISHED');

  // ─────────────────────────────────────────────────────────────
  // SECURE DATA FETCH
  // ─────────────────────────────────────────────────────────────
  const loadInventory = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getDealerVehicles() as ActionResponse<VehicleInventoryItem[]>;

      if (response?.success && Array.isArray(response.data)) {
        setVehicles(response.data);
      } else {
        setVehicles([]);
        showToast({
          type: 'error',
          title: 'Inventory Sync Failed',
          message: response?.message || 'Unable to retrieve dealership vehicle listings.',
        });
      }
    } catch (error) {
      console.error('[DealerInventory] Failed to fetch inventory:', error);
      setVehicles([]);
      showToast({
        type: 'error',
        title: 'Connection Error',
        message: 'Could not load vehicle records from the secure registry.',
      });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  // ─────────────────────────────────────────────────────────────
  // PORTFOLIO KPI METRICS
  // ─────────────────────────────────────────────────────────────
  const metrics = useMemo(() => {
    const safeVehicles = Array.isArray(vehicles) ? vehicles : [];
    const totalUnits = safeVehicles.length;
    const publishedCount = safeVehicles.filter((v) => v.status === 'PUBLISHED').length;
    const pendingCount = safeVehicles.filter((v) => v.status === 'PENDING_REVIEW' || v.status === 'DRAFT').length;
    const soldCount = safeVehicles.filter((v) => v.status === 'SOLD').length;
    const grossValuation = safeVehicles.reduce((sum, v) => sum + (v.price || 0), 0);

    return { totalUnits, publishedCount, pendingCount, soldCount, grossValuation };
  }, [vehicles]);

  // ─────────────────────────────────────────────────────────────
  // FILTERING & SORTING ENGINE
  // ─────────────────────────────────────────────────────────────
  const filteredVehicles = useMemo(() => {
    const safeVehicles = Array.isArray(vehicles) ? vehicles : [];
    
    return safeVehicles
      .filter((v) => {
        const query = search.toLowerCase();
        const matchesSearch =
          `${v.make} ${v.model} ${v.year}`.toLowerCase().includes(query) ||
          (v.vin && v.vin.toLowerCase().includes(query));

        const matchesStatus = statusFilter === 'ALL' || v.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'PRICE_DESC':
            return b.price - a.price;
          case 'PRICE_ASC':
            return a.price - b.price;
          case 'VIEWS':
            return (b.views || 0) - (a.views || 0);
          case 'ENQUIRIES':
            return (b.enquiriesCount || 0) - (a.enquiriesCount || 0);
          case 'NEWEST':
          default:
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
      });
  }, [vehicles, search, statusFilter, sortBy]);

  // ─────────────────────────────────────────────────────────────
  // VEHICLE ACTIONS
  // ─────────────────────────────────────────────────────────────
  const handleStatusChange = async (vehicleId: string, newStatus: VehicleStatus) => {
    setUpdatingStatus(vehicleId);
    const previous = [...vehicles];

    // Optimistic update
    setVehicles(prev =>
      prev.map(v => v.id === vehicleId ? { ...v, status: newStatus } : v)
    );

    try {
      const response = await updateVehicleStatus(vehicleId, newStatus) as unknown as ActionResponse<unknown>;

      if (!response?.success) {
        setVehicles(previous);
        showToast({
          type: 'error',
          title: 'Update Failed',
          message: response?.message || 'Could not update vehicle status.',
        });
      } else {
        showToast({
          type: 'success',
          title: 'Status Updated',
          message: `Vehicle status updated to ${newStatus}.`,
        });
      }
    } catch (error) {
      setVehicles(previous);
      console.error('[DealerInventory] Status update error:', error);
      showToast({
        type: 'error',
        title: 'Server Error',
        message: 'An unexpected error occurred.',
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleDelete = async (vehicleId: string, vehicleTitle: string) => {
    const confirmed = window.confirm(
      `Are you sure you wish to unlist and archive ${vehicleTitle}? This action removes it from public showroom allocations.`
    );
    if (!confirmed) return;

    setDeletingId(vehicleId);
    const previousVehicles = [...vehicles];

    // Optimistic local state removal
    setVehicles((prev) => prev.filter((v) => v.id !== vehicleId));
    setSelectedVehicles((prev) => prev.filter(id => id !== vehicleId));

    try {
      const response = await deleteVehicle(vehicleId) as ActionResponse<unknown>;

      if (response?.success) {
        showToast({
          type: 'success',
          title: 'Allocation Archived',
          message: `${vehicleTitle} has been removed from active inventory.`,
        });
      } else {
        setVehicles(previousVehicles);
        showToast({
          type: 'error',
          title: 'Unlist Failed',
          message: response?.message || 'Could not archive vehicle listing.',
        });
      }
    } catch (error) {
      setVehicles(previousVehicles);
      console.error('[DealerInventory] Delete error:', error);
      showToast({
        type: 'error',
        title: 'Server Error',
        message: 'An unexpected error occurred while updating the inventory ledger.',
      });
    } finally {
      setDeletingId(null);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // BULK ACTIONS
  // ─────────────────────────────────────────────────────────────
  const handleBulkAction = async () => {
    try {
      if (bulkAction === 'delete') {
        // Delete each vehicle
        for (const id of selectedVehicles) {
          await deleteVehicle(id);
        }
        showToast({
          type: 'success',
          title: 'Vehicles Deleted',
          message: `${selectedVehicles.length} vehicles deleted successfully.`,
        });
      } else {
        // Update status for each vehicle
        for (const id of selectedVehicles) {
          await updateVehicleStatus(id, bulkStatus);
        }
        showToast({
          type: 'success',
          title: 'Status Updated',
          message: `${selectedVehicles.length} vehicles updated to ${bulkStatus}.`,
        });
      }
      
      setSelectedVehicles([]);
      setShowBulkModal(false);
      await loadInventory();
    } catch (error) {
      console.error('[DealerInventory] Bulk action error:', error);
      showToast({
        type: 'error',
        title: 'Bulk Action Failed',
        message: 'An error occurred while performing the bulk action.',
      });
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

  const toggleSelectAll = () => {
    if (selectedVehicles.length === filteredVehicles.length) {
      setSelectedVehicles([]);
    } else {
      setSelectedVehicles(filteredVehicles.map(v => v.id));
    }
  };

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-16">
      {/* ───────────────────────────────────────────────────────── */}
      {/* SECTION HEADER                                            */}
      {/* ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="gold" size="sm">
              <span className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest">
                <Sparkles className="h-3 w-3" />
                Managed Allocations
              </span>
            </Badge>
            <span className="text-muted text-xs">•</span>
            <span className="text-xs font-mono text-muted uppercase">Inventory Terminal</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-serif font-light text-primary tracking-tight">
            Dealership Fleet & Inventory
          </h1>
          <p className="text-xs sm:text-sm text-secondary font-sans mt-1">
            Curate, edit, and track allocations available in public showrooms and private client vaults.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedVehicles.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setBulkAction('status');
                setShowBulkModal(true);
              }}
              className="text-xs uppercase tracking-wider"
            >
              Bulk Action ({selectedVehicles.length})
            </Button>
          )}
          <Link href="/dealer/vehicles/new">
            <Button variant="gold" size="md" className="text-xs uppercase tracking-widest font-semibold flex items-center gap-2 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
              <PlusCircle className="h-4 w-4 stroke-[2.5]" />
              <span>List New Allocation</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────── */}
      {/* INVENTORY KPI DECK                                        */}
      {/* ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 bg-graphite/80 border-border/80 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted">Total Fleet Units</span>
            <p className="text-3xl font-serif font-light text-primary tabular-nums">{metrics.totalUnits}</p>
          </div>
          <Car className="h-5 w-5 text-blue-400/80" />
        </Card>

        <Card className="p-5 bg-graphite/80 border-border/80 flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 h-1 w-20 bg-emerald-500/40" />
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted">Live Showroom</span>
            <p className="text-3xl font-serif font-light text-emerald-400 tabular-nums">{metrics.publishedCount}</p>
          </div>
          <CheckCircle2 className="h-5 w-5 text-emerald-500/40" />
        </Card>

        <Card className="p-5 bg-graphite/80 border-border/80 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted">Pending / Drafts</span>
            <p className="text-3xl font-serif font-light text-yellow-400 tabular-nums">{metrics.pendingCount}</p>
          </div>
          <Clock className="h-5 w-5 text-yellow-500/40" />
        </Card>

        <Card className="p-5 bg-graphite/80 border-border/80 flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 h-1 w-20 bg-gold/40" />
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted">Gross Fleet Value</span>
            <p className="text-2xl font-serif font-light text-gold tabular-nums truncate max-w-45">
              {formatCurrency(metrics.grossValuation, 'NGN')}
            </p>
          </div>
          <TrendingUp className="h-5 w-5 text-gold/60" />
        </Card>
      </div>

      {/* ───────────────────────────────────────────────────────── */}
      {/* FILTER & SEARCH BAR                                       */}
      {/* ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <input
            type="text"
            placeholder="Search by Make, Model, Year, or Chassis VIN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-graphite/60 border border-border/80 text-sm font-sans text-primary placeholder-muted focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-3">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3.5 rounded-lg bg-graphite/60 border border-border/80 text-xs font-mono uppercase tracking-wider text-primary focus:outline-none focus:border-gold transition-all"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Sort By */}
          <div className="flex items-center gap-1.5 h-10 px-3 rounded-lg bg-graphite/60 border border-border/80">
            <ArrowUpDown className="h-3.5 w-3.5 text-muted shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-transparent text-xs font-mono uppercase tracking-wider text-primary focus:outline-none cursor-pointer"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────── */}
      {/* INVENTORY LIST RENDER                                     */}
      {/* ───────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl bg-graphite/50 border border-border/40" />
          ))}
        </div>
      ) : filteredVehicles.length === 0 ? (
        <Card className="py-16 px-6 text-center bg-graphite/40 border-border/60">
          <div className="w-16 h-16 rounded-full border border-gold/30 bg-gold/5 flex items-center justify-center mx-auto mb-4">
            <Package className="h-7 w-7 text-gold stroke-[1.5]" />
          </div>
          <h3 className="text-xl font-serif font-light text-primary">No Matching Allocations Located</h3>
          <p className="text-xs text-secondary font-sans max-w-sm mx-auto mt-1 mb-6">
            Adjust your search terms or filters to locate specific inventory assets, or register a new vehicle allocation.
          </p>
          <Link href="/dealer/vehicles/new">
            <Button variant="gold" size="sm" className="text-xs uppercase tracking-widest font-semibold">
              <PlusCircle className="h-4 w-4 mr-1.5" />
              List First Vehicle
            </Button>
          </Link>
        </Card>
      ) : (
        <>
          {/* Select All */}
          <div className="flex items-center gap-2 px-1">
            <input
              type="checkbox"
              checked={selectedVehicles.length === filteredVehicles.length && filteredVehicles.length > 0}
              onChange={toggleSelectAll}
              className="w-4 h-4 rounded bg-obsidian border-border text-gold focus:ring-gold focus:ring-offset-obsidian"
            />
            <span className="text-xs text-muted font-sans">
              Select All ({filteredVehicles.length})
            </span>
            {selectedVehicles.length > 0 && (
              <span className="text-xs text-gold font-mono">
                {selectedVehicles.length} selected
              </span>
            )}
          </div>

          <div className="space-y-4">
            {filteredVehicles.map((vehicle) => {
              const statusStyle = STATUS_CONFIG[vehicle.status] || STATUS_CONFIG.DRAFT;
              const StatusIcon = statusStyle.icon;
              const isDeleting = deletingId === vehicle.id;
              const isUpdating = updatingStatus === vehicle.id;
              const isSelected = selectedVehicles.includes(vehicle.id);
              const vehicleTitle = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;

              return (
                <Card
                  key={vehicle.id}
                  className={cn(
                    "p-5 bg-graphite/90 border-border/80 hover:border-gold/30 transition-all duration-300 relative overflow-hidden backdrop-blur-md",
                    isSelected && "border-gold/50 ring-1 ring-gold/30"
                  )}
                >
                  {/* Selection Checkbox */}
                  <div className="absolute top-3 left-3 z-10">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {
                        setSelectedVehicles(prev =>
                          prev.includes(vehicle.id)
                            ? prev.filter(id => id !== vehicle.id)
                            : [...prev, vehicle.id]
                        );
                      }}
                      className="w-4 h-4 rounded bg-obsidian border-border text-gold focus:ring-gold focus:ring-offset-obsidian"
                    />
                  </div>

                  <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 pl-8">
                    {/* Left: Thumbnail & Core Details */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 min-w-0">
                      {/* Image Box */}
                      <div className="relative w-full sm:w-44 h-28 rounded-lg overflow-hidden bg-obsidian border border-border/80 shrink-0 group">
                        {vehicle.images?.[0] ? (
                          <Image
                            src={vehicle.images[0]}
                            alt={vehicleTitle}
                            fill
                            sizes="(max-width: 640px) 100vw, 176px"
                            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted">
                            <Car className="h-8 w-8" />
                          </div>
                        )}

                        {/* Status Tag Overlay for mobile/quick scan */}
                        <div className="absolute top-2 left-2 sm:hidden">
                          <Badge variant={statusStyle.variant} size="sm">
                            {statusStyle.label}
                          </Badge>
                        </div>
                      </div>

                      {/* Metadata & Spec Chips */}
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/vehicles/${vehicle.id}`}
                            className="font-serif text-lg text-primary hover:text-gold transition-colors tracking-wide truncate"
                          >
                            {vehicleTitle}
                          </Link>
                          {vehicle.verified === 'VERIFIED' && (
                            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                          )}
                        </div>

                        {/* Specs Row */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted font-sans">
                          <span className="text-gold font-semibold text-sm">
                            {formatCurrency(vehicle.price, vehicle.currency || 'NGN')}
                          </span>
                          <span>•</span>
                          <span>{vehicle.mileage ? `${vehicle.mileage.toLocaleString()} km` : 'Delivery Mileage'}</span>
                          {vehicle.vin && (
                            <>
                              <span>•</span>
                              <span className="inline-flex items-center gap-1 font-mono text-[11px]">
                                VIN: {vehicle.vin.slice(0, 10)}...
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(vehicle.vin!, 'VIN')}
                                  className="text-muted hover:text-gold p-0.5"
                                  title="Copy Full VIN"
                                >
                                  <Copy size={11} />
                                </button>
                              </span>
                            </>
                          )}
                        </div>

                        {/* Engagement Counters */}
                        <div className="flex items-center gap-4 text-[11px] font-mono text-muted pt-1">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            <span>{vehicle.views || 0} impressions</span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-secondary">
                            <MessageSquare className="h-3 w-3 text-gold" />
                            <span>{vehicle.enquiriesCount || 0} active dossiers</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Status Pill & Terminal Action Controls */}
                    <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-3 pt-4 lg:pt-0 border-t lg:border-t-0 border-border/40 shrink-0">
                      <div className="hidden sm:block">
                        <Badge variant={statusStyle.variant} size="md">
                          <StatusIcon className="h-3.5 w-3.5 mr-1.5" />
                          <span>{statusStyle.label}</span>
                        </Badge>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Link href={`/vehicles/${vehicle.id}`} className="flex-1 sm:flex-initial">
                          <Button
                            variant="secondary"
                            size="sm"
                            className="w-full text-xs font-mono uppercase tracking-wider border-border hover:border-gold/30"
                            title="View public showroom presentation"
                          >
                            <ExternalLink className="h-3.5 w-3.5 mr-1" />
                            <span>Preview</span>
                          </Button>
                        </Link>

                        <select
                          value={vehicle.status}
                          onChange={(e) => handleStatusChange(vehicle.id, e.target.value as VehicleStatus)}
                          disabled={isUpdating}
                          className="h-8 px-2 rounded-md bg-charcoal border border-border/60 text-[10px] font-mono uppercase tracking-wider text-primary focus:outline-none focus:border-gold"
                        >
                          {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                            <option key={key} value={key}>
                              {config.label}
                            </option>
                          ))}
                        </select>

                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          disabled={isDeleting}
                          onClick={() => handleDelete(vehicle.id, vehicleTitle)}
                          className="text-muted hover:text-red-400 hover:border-red-500/30 p-2 shrink-0"
                          title="Archive and unlist allocation"
                        >
                          {isDeleting ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-red-400" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {/* ───────────────────────────────────────────────────────── */}
      {/* BULK ACTION MODAL                                         */}
      {/* ───────────────────────────────────────────────────────── */}
      <Modal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        title="Bulk Action"
      >
        <div className="space-y-4">
          <p className="text-sm text-secondary font-sans">
            You are about to perform an action on <strong className="text-primary">{selectedVehicles.length}</strong> vehicles.
          </p>
          
          <div className="space-y-3">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setBulkAction('status')}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-mono uppercase tracking-wider border transition-all",
                  bulkAction === 'status'
                    ? "bg-gold/20 border-gold text-gold"
                    : "bg-charcoal border-border/60 text-secondary hover:border-gold/40"
                )}
              >
                Update Status
              </button>
              <button
                type="button"
                onClick={() => setBulkAction('delete')}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-mono uppercase tracking-wider border transition-all",
                  bulkAction === 'delete'
                    ? "bg-red-500/20 border-red-500/50 text-red-400"
                    : "bg-charcoal border-border/60 text-secondary hover:border-red-500/40"
                )}
              >
                Delete
              </button>
            </div>

            {bulkAction === 'status' && (
              <select
                value={bulkStatus}
                onChange={(e) => setBulkStatus(e.target.value as VehicleStatus)}
                className="w-full h-10 px-3 rounded-md bg-inset border border-border text-xs font-mono uppercase tracking-wider text-primary focus:outline-none focus:border-gold"
              >
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              variant="secondary"
              onClick={() => setShowBulkModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant={bulkAction === 'delete' ? 'danger' : 'gold'}
              onClick={handleBulkAction}
            >
              {bulkAction === 'delete' ? 'Delete Vehicles' : 'Update Status'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}