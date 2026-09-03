'use client';
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Grid,
  PlusCircle,
  Edit3,
  Trash2,
  Search,
  Sparkles,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Layers,
  ArrowUpDown,
  Copy,
  Clock,
  Loader2,
  AlertTriangle,
  X,
  RefreshCcw,
  Compass,
} from 'lucide-react';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/utils/cn';
import {
  getCollections,
  toggleCollectionFeatured,
  deleteCollection,
} from '@/actions/collections';

// ─────────────────────────────────────────────────────────────
// TYPES & INTERFACES
// ─────────────────────────────────────────────────────────────
export interface AdminCollectionItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  vehicleCount: number;
  published: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt?: string;
}

interface ActionResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

type CollectionFilter = 'ALL' | 'PUBLISHED' | 'UNPUBLISHED' | 'FEATURED';
type CollectionSort = 'NEWEST' | 'VEHICLES_DESC' | 'NAME_ASC';

export default function AdminContentPage() {
  const { showToast } = useToast();

  const [collections, setCollections] = useState<AdminCollectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Deletion Modal State
  const [collectionToDelete, setCollectionToDelete] = useState<AdminCollectionItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filters & Sorting
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<CollectionFilter>('ALL');
  const [sortBy, setSortBy] = useState<CollectionSort>('NEWEST');

  // ─────────────────────────────────────────────────────────────
  // SECURE DATA FETCH
  // ─────────────────────────────────────────────────────────────
  const loadCollections = useCallback(async (isSilent = false) => {
    if (isSilent) setRefreshing(true);
    else setLoading(true);

    try {
      // ✅ Fix: getCollections expects pagination parameters
      const response = await getCollections(1, 50) as unknown as ActionResponse<AdminCollectionItem[]>;

      if (response?.success && Array.isArray(response.data)) {
        setCollections(response.data);
      } else {
        setCollections([]);
        showToast({
          type: 'error',
          title: 'Collections Sync Failed',
          message: response?.message || 'Unable to retrieve collections from the database.',
        });
      }
    } catch (error) {
      console.error('[AdminContent] Fetch exception:', error);
      setCollections([]);
      showToast({
        type: 'error',
        title: 'Connection Error',
        message: 'Could not connect to the editorial content ledger.',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  // ─────────────────────────────────────────────────────────────
  // TOGGLE PUBLISHED STATUS
  // ─────────────────────────────────────────────────────────────
  const handleTogglePublish = async (id: string, currentPublished: boolean, collectionName: string) => {
    setUpdatingId(id);
    const nextPublished = !currentPublished;
    const previous = [...collections];

    // Optimistic local state update
    setCollections((prev) =>
      prev.map((c) => (c.id === id ? { ...c, published: nextPublished } : c))
    );

    try {
      // ✅ Fix: toggleCollectionPublished only takes the collection ID
      const response = await toggleCollectionPublished(id) as ActionResponse<unknown>;

      if (response?.success) {
        showToast({
          type: nextPublished ? 'success' : 'info',
          title: nextPublished ? 'Collection Published' : 'Collection Drafted',
          message: nextPublished
            ? `"${collectionName}" is now active in the public showroom.`
            : `"${collectionName}" has been set to draft status.`,
        });
      } else {
        setCollections(previous);
        showToast({
          type: 'error',
          title: 'Update Failed',
          message: response?.message || 'Could not update publication status.',
        });
      }
    } catch (error) {
      setCollections(previous);
      console.error('[AdminContent] Toggle publish error:', error);
      showToast({
        type: 'error',
        title: 'Server Error',
        message: 'An unexpected error occurred while modifying the collection.',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // DELETE COLLECTION PROTOCOL
  // ─────────────────────────────────────────────────────────────
  const confirmDelete = async () => {
    if (!collectionToDelete) return;
    setIsDeleting(true);
    const id = collectionToDelete.id;
    const previous = [...collections];

    setCollections((prev) => prev.filter((c) => c.id !== id));

    try {
      const response = await deleteCollection(id) as ActionResponse<unknown>;

      if (response?.success) {
        showToast({
          type: 'success',
          title: 'Collection Removed',
          message: `"${collectionToDelete.name}" has been deleted from the registry.`,
        });
        setCollectionToDelete(null);
      } else {
        setCollections(previous);
        showToast({
          type: 'error',
          title: 'Deletion Failed',
          message: response?.message || 'Could not remove collection from database.',
        });
      }
    } catch (error) {
      setCollections(previous);
      console.error('[AdminContent] Delete error:', error);
      showToast({
        type: 'error',
        title: 'Server Exception',
        message: 'An unexpected error occurred while deleting the collection.',
      });
    } finally {
      setIsDeleting(false);
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
    const safeCollections = Array.isArray(collections) ? collections : [];
    const total = safeCollections.length;
    const publishedCount = safeCollections.filter((c) => c.published).length;
    const featuredCount = safeCollections.filter((c) => c.featured).length;
    const totalVehiclesInCollections = safeCollections.reduce((sum, c) => sum + (c.vehicleCount || 0), 0);

    return { total, publishedCount, featuredCount, totalVehiclesInCollections };
  }, [collections]);

  // ─────────────────────────────────────────────────────────────
  // FILTERING & SORTING ENGINE
  // ─────────────────────────────────────────────────────────────
  const filteredCollections = useMemo(() => {
    const safeCollections = Array.isArray(collections) ? collections : [];
    return safeCollections
      .filter((c) => {
        const query = search.toLowerCase();
        const matchesSearch =
          c.name.toLowerCase().includes(query) ||
          (c.description && c.description.toLowerCase().includes(query)) ||
          c.slug.toLowerCase().includes(query);

        const matchesFilter =
          filter === 'ALL' ||
          (filter === 'PUBLISHED' && c.published) ||
          (filter === 'UNPUBLISHED' && !c.published) ||
          (filter === 'FEATURED' && c.featured);

        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'VEHICLES_DESC':
            return (b.vehicleCount || 0) - (a.vehicleCount || 0);
          case 'NAME_ASC':
            return a.name.localeCompare(b.name);
          case 'NEWEST':
          default:
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
      });
  }, [collections, search, filter, sortBy]);

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
                Showroom Editorial
              </span>
            </Badge>
            <span className="text-muted text-xs">•</span>
            <span className="text-xs font-mono text-muted uppercase">Curated Series</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-serif font-light text-primary tracking-tight">
            Curated Showroom Collections
          </h1>
          <p className="text-xs sm:text-sm text-secondary font-sans mt-1">
            Group, publish, and feature specialized vehicle series (e.g. Track Weapons, Concours Provenance, Hypercar Allocations).
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => loadCollections(true)}
            disabled={refreshing || loading}
            className="text-xs uppercase tracking-wider border-border hover:border-gold/30"
          >
            {refreshing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
            ) : (
              <RefreshCcw className="h-3.5 w-3.5 mr-2" />
            )}
            <span>{refreshing ? 'Syncing...' : 'Refresh'}</span>
          </Button>

          <Link href="/admin/content/collections/new">
            <Button variant="gold" size="sm" className="text-xs uppercase tracking-widest font-semibold flex items-center gap-1.5 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
              <PlusCircle className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>New Collection</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────── */}
      {/* EDITORIAL KPI DECK                                        */}
      {/* ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 bg-graphite/80 border-border/80 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted">Total Curated Series</span>
            <p className="text-3xl font-serif font-light text-primary tabular-nums">{metrics.total}</p>
          </div>
          <Grid className="h-5 w-5 text-blue-400/80" />
        </Card>

        <Card className="p-5 bg-graphite/80 border-border/80 flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 h-1 w-20 bg-emerald-500/40" />
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted">Live Showroom Series</span>
            <p className="text-3xl font-serif font-light text-emerald-400 tabular-nums">{metrics.publishedCount}</p>
          </div>
          <CheckCircle2 className="h-5 w-5 text-emerald-500/40" />
        </Card>

        <Card className="p-5 bg-graphite/80 border-border/80 flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 h-1 w-20 bg-gold/40" />
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted">Featured Highlights</span>
            <p className="text-3xl font-serif font-light text-gold tabular-nums">{metrics.featuredCount}</p>
          </div>
          <Sparkles className="h-5 w-5 text-gold/60" />
        </Card>

        <Card className="p-5 bg-graphite/80 border-border/80 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted">Total Curated Vehicles</span>
            <p className="text-3xl font-serif font-light text-primary tabular-nums">{metrics.totalVehiclesInCollections}</p>
          </div>
          <Layers className="h-5 w-5 text-purple-400/80" />
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
            placeholder="Search collections by title, description, or URL slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-graphite/60 border border-border/80 text-sm font-sans text-primary placeholder-muted focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as CollectionFilter)}
            className="h-10 px-3.5 rounded-lg bg-graphite/60 border border-border/80 text-xs font-mono uppercase tracking-wider text-primary focus:outline-none focus:border-gold transition-all"
          >
            <option value="ALL">All Series</option>
            <option value="PUBLISHED">Published Only</option>
            <option value="UNPUBLISHED">Drafts Only</option>
            <option value="FEATURED">Featured Highlights</option>
          </select>

          <div className="flex items-center gap-1.5 h-10 px-3 rounded-lg bg-graphite/60 border border-border/80">
            <ArrowUpDown className="h-3.5 w-3.5 text-muted shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as CollectionSort)}
              className="bg-transparent text-xs font-mono uppercase tracking-wider text-primary focus:outline-none cursor-pointer"
            >
              <option value="NEWEST">Newest First</option>
              <option value="VEHICLES_DESC">Vehicle Count (High-Low)</option>
              <option value="NAME_ASC">Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────── */}
      {/* COLLECTIONS MATRIX                                        */}
      {/* ───────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-36 w-full rounded-xl bg-graphite/50 border border-border/40" />
          ))}
        </div>
      ) : filteredCollections.length === 0 ? (
        <Card className="py-16 px-6 text-center bg-graphite/40 border-border/60">
          <div className="w-16 h-16 rounded-full border border-gold/30 bg-gold/5 flex items-center justify-center mx-auto mb-4">
            <Grid className="h-7 w-7 text-gold stroke-[1.5]" />
          </div>
          <h3 className="text-xl font-serif font-light text-primary">No Matching Collections Located</h3>
          <p className="text-xs text-secondary font-sans max-w-sm mx-auto mt-1 mb-6">
            Adjust your search terms or filters, or create a bespoke showroom collection.
          </p>
          <Link href="/admin/content/collections/new">
            <Button variant="gold" size="sm" className="text-xs uppercase tracking-widest font-semibold">
              <PlusCircle className="h-3.5 w-3.5 mr-1.5" />
              Create First Collection
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredCollections.map((collection) => {
            const isUpdating = updatingId === collection.id;

            return (
              <Card
                key={collection.id}
                className="p-5 bg-graphite/90 border-border/80 hover:border-gold/30 transition-all duration-300 relative overflow-hidden backdrop-blur-md"
              >
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
                  {/* Left: Thumbnail & Core Metadata */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 min-w-0">
                    {/* Collection Thumbnail Box */}
                    <div className="relative w-full sm:w-44 h-28 rounded-lg overflow-hidden bg-obsidian border border-border/80 shrink-0 group">
                      {collection.image ? (
                        <Image
                          src={collection.image}
                          alt={collection.name}
                          fill
                          sizes="(max-width: 640px) 100vw, 176px"
                          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted">
                          <Grid className="h-8 w-8 text-muted/60" />
                        </div>
                      )}

                      {collection.featured && (
                        <div className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded bg-gold text-obsidian text-[8px] font-mono font-bold tracking-widest uppercase shadow">
                          <Sparkles className="h-2.5 w-2.5 fill-obsidian" />
                          <span>Featured</span>
                        </div>
                      )}
                    </div>

                    {/* Information Strip */}
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/admin/content/collections/${collection.id}/edit`}
                          className="font-serif text-lg text-primary hover:text-gold transition-colors tracking-wide truncate"
                        >
                          {collection.name}
                        </Link>

                        <Badge variant={collection.published ? 'success' : 'warning'} size="sm">
                          {collection.published ? 'Live Showroom' : 'Draft / Internal'}
                        </Badge>
                      </div>

                      {collection.description && (
                        <p className="text-xs text-secondary font-sans line-clamp-2 leading-relaxed max-w-xl">
                          {collection.description}
                        </p>
                      )}

                      {/* Meta Chips */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted font-sans pt-1">
                        <span className="inline-flex items-center gap-1 font-mono text-[11px] text-gold">
                          <Layers className="h-3 w-3" />
                          <span>{collection.vehicleCount} vehicle allocation{collection.vehicleCount === 1 ? '' : 's'}</span>
                        </span>

                        <span>•</span>

                        <span className="inline-flex items-center gap-1 font-mono text-[11px]">
                          <span>/collections/{collection.slug}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(`/collections/${collection.slug}`, 'Collection URL')}
                            className="text-muted hover:text-gold p-0.5"
                            title="Copy Slug Link"
                          >
                            <Copy size={11} />
                          </button>
                        </span>

                        <span>•</span>

                        <span className="text-[11px] font-mono">
                          {new Date(collection.createdAt).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Terminal Controls */}
                  <div className="flex items-center gap-2.5 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-border/40 justify-end">
                    {/* Live Preview Button */}
                    <Link href={`/collections/${collection.slug}`} target="_blank">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="text-xs uppercase font-mono tracking-wider border-border hover:border-gold/30"
                        title="View live showroom series"
                      >
                        <ExternalLink className="h-3.5 w-3.5 mr-1" />
                        <span>Preview</span>
                      </Button>
                    </Link>

                    {/* Edit Button */}
                    <Link href={`/admin/content/collections/${collection.id}/edit`}>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="text-xs uppercase font-mono tracking-wider border-border hover:border-gold/30"
                        title="Edit collection details and vehicle assignments"
                      >
                        <Edit3 className="h-3.5 w-3.5 mr-1" />
                        <span>Edit</span>
                      </Button>
                    </Link>

                    {/* Publish/Draft Toggle */}
                    <Button
                      type="button"
                      variant={collection.published ? 'secondary' : 'gold'}
                      size="sm"
                      disabled={isUpdating}
                      onClick={() => handleTogglePublish(collection.id, collection.published, collection.name)}
                      className={cn(
                        'text-xs uppercase font-mono tracking-wider',
                        collection.published
                          ? 'border-border hover:border-gold/30'
                          : 'font-semibold shadow-[0_0_12px_rgba(212,175,55,0.2)]'
                      )}
                    >
                      {isUpdating ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                      ) : collection.published ? (
                        <XCircle className="h-3.5 w-3.5 mr-1" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                      )}
                      <span>{collection.published ? 'Unpublish' : 'Publish'}</span>
                    </Button>

                    {/* Delete Trigger */}
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setCollectionToDelete(collection)}
                      className="text-muted hover:text-red-400 hover:border-red-500/30 p-2 shrink-0"
                      title="Delete Collection"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────── */}
      {/* SAFE DELETION CONFIRMATION DIALOG                         */}
      {/* ───────────────────────────────────────────────────────── */}
      {collectionToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
        >
          <div
            className="fixed inset-0 bg-obsidian/85 backdrop-blur-md transition-opacity"
            onClick={() => setCollectionToDelete(null)}
          />

          <Card className="relative z-10 w-full max-w-md p-6 sm:p-8 bg-graphite border-red-500/30 shadow-2xl space-y-6">
            <div className="flex items-start justify-between">
              <div className="h-12 w-12 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <button
                type="button"
                onClick={() => setCollectionToDelete(null)}
                className="text-muted hover:text-primary transition-colors p-1 rounded"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-serif font-light text-primary">
                Delete Curated Collection?
              </h3>
              <p className="text-xs text-secondary font-sans leading-relaxed">
                Are you sure you wish to delete <strong>{collectionToDelete.name}</strong>? This action will unpublish the series and dissociate all {collectionToDelete.vehicleCount} vehicle allocations from this collection page.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => setCollectionToDelete(null)}
                disabled={isDeleting}
                className="flex-1 text-xs uppercase font-mono tracking-wider"
              >
                Cancel
              </Button>

              <Button
                type="button"
                variant="danger"
                size="md"
                onClick={confirmDelete}
                isLoading={isDeleting}
                className="flex-1 text-xs uppercase font-mono tracking-wider"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function toggleCollectionPublished(id: string): ActionResponse<unknown> | PromiseLike<ActionResponse<unknown>> {
  throw new Error('Function not implemented.');
}
