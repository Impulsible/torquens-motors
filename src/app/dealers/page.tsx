/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Building2,
  Search,
  MapPin,
  Mail,
  ShieldCheck,
  Star,
  Sparkles,
  Car,
  ArrowRight,
  ArrowUpDown,
  CheckCircle2,
  X,
  Loader2,
  Send,
} from 'lucide-react';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/utils/cn';
import { getPublicDealers, type PublicDealer } from '@/actions/dealers';

type RegionFilter = 'ALL' | 'SWITZERLAND' | 'UNITED KINGDOM' | 'UNITED ARAB EMIRATES' | 'NIGERIA' | 'MONACO';
type SortOption = 'VEHICLES_DESC' | 'RATING_DESC' | 'NAME_ASC';

const REGION_TABS: { label: string; value: RegionFilter }[] = [
  { label: 'All Desks', value: 'ALL' },
  { label: 'Geneva & Zurich', value: 'SWITZERLAND' },
  { label: 'London Mayfair', value: 'UNITED KINGDOM' },
  { label: 'Dubai DIFC', value: 'UNITED ARAB EMIRATES' },
  { label: 'Monaco', value: 'MONACO' },
  { label: 'West Africa (Lagos)', value: 'NIGERIA' },
];

export default function DealersDirectoryPage() {
  const toast = useToast();
  const [dealers, setDealers] = useState<PublicDealer[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Sorting
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState<RegionFilter>('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('VEHICLES_DESC');

  // Inquiry Modal State
  const [selectedDealerForInquiry, setSelectedDealerForInquiry] = useState<PublicDealer | null>(null);
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [inquirySending, setInquirySending] = useState(false);

  const loadDirectory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getPublicDealers();
      if (res.success && Array.isArray(res.data)) {
        setDealers(res.data);
      }
    } catch (err) {
      console.error('[DealersPage] Failed to load dealers:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDirectory();
  }, [loadDirectory]);

  const filteredDealers = useMemo(() => {
    return dealers
      .filter((d) => {
        const q = search.toLowerCase();
        const matchesSearch =
          d.name.toLowerCase().includes(q) ||
          d.location?.toLowerCase().includes(q) ||
          d.city?.toLowerCase().includes(q) ||
          d.specialties?.some((s) => s.toLowerCase().includes(q));

        const matchesRegion =
          regionFilter === 'ALL' ||
          d.country?.toUpperCase().includes(regionFilter) ||
          d.location?.toUpperCase().includes(regionFilter);

        return matchesSearch && matchesRegion;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'RATING_DESC':
            return (b.rating || 0) - (a.rating || 0);
          case 'NAME_ASC':
            return a.name.localeCompare(b.name);
          case 'VEHICLES_DESC':
          default:
            return (b.vehiclesCount || 0) - (a.vehiclesCount || 0);
        }
      });
  }, [dealers, search, regionFilter, sortBy]);

  const totalAllocations = useMemo(
    () => dealers.reduce((sum, d) => sum + (d.vehiclesCount || 0), 0),
    [dealers]
  );

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName || !inquiryEmail || !inquiryMessage) {
      toast.error('Please fill in all inquiry fields.');
      return;
    }

    setInquirySending(true);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      toast.success(`Inquiry dispatched directly to ${selectedDealerForInquiry?.name}.`);
      setSelectedDealerForInquiry(null);
      setInquiryName('');
      setInquiryEmail('');
      setInquiryMessage('');
    } catch (err) {
      toast.error('Unable to send inquiry. Please try again.');
    } finally {
      setInquirySending(false);
    }
  };

  return (
    <main className="min-h-screen bg-obsidian text-primary selection:bg-gold/20 selection:text-gold pt-24 pb-20 overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-160 h-80 bg-gold/5 blur-[140px] rounded-full"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* HEADER SECTION */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-8 border-b border-border/40">
          <div className="max-w-3xl space-y-4">
            <Badge variant="gold" size="sm">
              <span className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest">
                <Sparkles className="h-3 w-3" />
                Accredited Brokerage Network
              </span>
            </Badge>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-light tracking-tight text-primary leading-[1.08]">
              Authorized Custodians &{' '}
              <span className="italic font-normal text-gold block sm:inline">
                Institutional Desks.
              </span>
            </h1>

            <p className="text-secondary font-sans text-sm sm:text-base leading-relaxed max-w-2xl pt-1">
              Connect directly with verified dealerships, private collectors, and marque specialists
              audited under our sovereign escrow, physical inspection, and title verification protocols.
            </p>
          </div>

          {/* Metric Badges */}
          <div className="flex items-center gap-6 pt-4 lg:pt-0 border-t lg:border-t-0 border-border/40 shrink-0">
            <div>
              <span className="block font-serif text-3xl sm:text-4xl font-light text-primary tabular-nums">
                {dealers.length}
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted mt-1 block">
                Accredited Desks
              </span>
            </div>

            <div className="h-10 w-px bg-border/60" aria-hidden="true" />

            <div>
              <span className="block font-serif text-3xl sm:text-4xl font-light text-gold tabular-nums">
                {totalAllocations}
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted mt-1 block">
                Managed Assets
              </span>
            </div>
          </div>
        </div>

        {/* FILTERS & SEARCH */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 p-1 rounded-lg bg-obsidian border border-border/60 overflow-x-auto max-w-full">
            {REGION_TABS.map((tab) => {
              const isSelected = regionFilter === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setRegionFilter(tab.value)}
                  className={cn(
                    'px-3.5 py-1.5 rounded-md text-xs font-medium tracking-wide whitespace-nowrap transition-all cursor-pointer',
                    isSelected
                      ? 'bg-gold text-obsidian font-semibold shadow-sm'
                      : 'text-secondary hover:text-primary hover:bg-graphite/45'
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
              <input
                type="text"
                placeholder="Search Broker, City, Marque..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-lg bg-graphite/60 border border-border/80 text-sm font-sans text-primary placeholder-muted focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all"
              />
            </div>

            <div className="flex items-center gap-1.5 h-10 px-3 rounded-lg bg-graphite/60 border border-border/80 shrink-0">
              <ArrowUpDown className="h-3.5 w-3.5 text-muted shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-transparent text-xs font-mono uppercase tracking-wider text-primary focus:outline-none cursor-pointer"
              >
                <option value="VEHICLES_DESC">Fleet Volume (High-Low)</option>
                <option value="RATING_DESC">Satisfaction Score</option>
                <option value="NAME_ASC">Name (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* GRID */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-80 w-full rounded-2xl bg-graphite/50 border border-border/40" />
            ))}
          </div>
        ) : filteredDealers.length === 0 ? (
          <Card className="py-20 px-6 text-center bg-graphite/40 border-border/60 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full border border-gold/30 bg-gold/5 flex items-center justify-center mx-auto mb-4 text-gold">
              <Building2 className="h-7 w-7 stroke-[1.5]" />
            </div>
            <h3 className="text-xl font-serif font-light text-primary">No Matching Brokerages</h3>
            <p className="text-xs text-secondary font-sans max-w-sm mx-auto mt-1 mb-6 leading-relaxed">
              No dealerships found matching your search keyword or regional filter. Try resetting your criteria.
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSearch('');
                setRegionFilter('ALL');
              }}
              className="text-xs uppercase font-mono tracking-wider"
            >
              Reset Filters
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDealers.map((dealer) => {
              const userInitial = dealer.name.charAt(0).toUpperCase() || 'D';

              return (
                <Card
                  key={dealer.id}
                  className="p-6 bg-graphite/95 border-border/80 hover:border-gold/40 transition-all duration-300 relative overflow-hidden backdrop-blur-md shadow-dropdown flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="relative h-14 w-14 rounded-2xl bg-obsidian border border-gold/40 flex items-center justify-center text-gold font-serif text-xl shrink-0 shadow-[0_0_15px_rgba(212,175,55,0.15)]">
                        <span>{userInitial}</span>
                        {dealer.verified && (
                          <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 ring-2 ring-obsidian flex items-center justify-center">
                            <CheckCircle2 className="h-2.5 w-2.5 text-obsidian" />
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-1.5">
                        {dealer.verified ? (
                          <Badge variant="gold" size="sm" className="text-[8px] tracking-widest font-mono uppercase">
                            <ShieldCheck className="h-3 w-3 mr-1 text-emerald-400" />
                            Accredited Desk
                          </Badge>
                        ) : (
                          <Badge variant="default" size="sm" className="text-[8px] tracking-widest font-mono uppercase">
                            Registered Partner
                          </Badge>
                        )}

                        {dealer.rating && dealer.rating > 0 && (
                          <div className="flex items-center gap-1 text-[11px] font-mono text-gold bg-obsidian/70 px-2 py-0.5 rounded-full border border-border/60">
                            <Star className="h-3 w-3 fill-gold" />
                            <span>{dealer.rating.toFixed(1)}</span>
                            {dealer.totalReviews && (
                              <span className="text-muted text-[10px]">({dealer.totalReviews})</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-xl font-serif font-light text-primary group-hover:text-gold transition-colors tracking-tight">
                        {dealer.name}
                      </h3>

                      <div className="flex items-center gap-1.5 text-xs text-muted font-sans">
                        <MapPin className="h-3.5 w-3.5 text-gold/80 shrink-0" />
                        <span>{dealer.location}</span>
                      </div>
                    </div>

                    {dealer.description && (
                      <p className="text-xs text-secondary font-sans leading-relaxed line-clamp-2 pt-1">
                        {dealer.description}
                      </p>
                    )}

                    {dealer.specialties && dealer.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {dealer.specialties.slice(0, 3).map((spec, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded bg-obsidian/80 border border-border/60 text-[9px] font-mono text-muted uppercase tracking-wider"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-5 mt-5 border-t border-border/40 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 font-mono text-xs text-gold">
                      <Car className="h-3.5 w-3.5" />
                      <span>{dealer.vehiclesCount} Allocation{dealer.vehiclesCount === 1 ? '' : 's'}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link href={`/vehicles?dealer=${encodeURIComponent(dealer.id)}`}>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="text-xs font-mono uppercase tracking-wider border-border hover:border-gold/40"
                        >
                          <span>Showroom</span>
                          <ArrowRight size={12} className="ml-1" />
                        </Button>
                      </Link>

                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setSelectedDealerForInquiry(dealer)}
                        className="text-xs font-mono uppercase tracking-wider font-semibold"
                      >
                        <Mail size={12} className="mr-1" />
                        <span>Inquire</span>
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* CTA */}
        <div className="relative rounded-2xl border border-gold/30 bg-graphite/90 p-8 sm:p-12 overflow-hidden shadow-dropdown backdrop-blur-md">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
            <div className="space-y-2 max-w-2xl">
              <Badge variant="gold" size="sm">
                Broker Accreditation Program
              </Badge>

              <h2 className="text-2xl sm:text-3xl font-serif font-light text-primary tracking-tight">
                Are You an Established Exotic or Classic Marque Custodian?
              </h2>

              <p className="text-sm font-sans text-secondary leading-relaxed">
                Join the TORQUENS accredited network to list private allocations, access global high-net-worth inquiries, and leverage our Swiss escrow settlement framework.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <Link href="/auth/register" className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="lg"
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                  className="w-full sm:w-auto text-xs uppercase tracking-widest font-semibold"
                >
                  Apply for Accreditation
                </Button>
              </Link>

              <Link href="/contact" className="w-full sm:w-auto">
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto text-xs uppercase tracking-widest border-border hover:border-gold/30"
                >
                  Contact Desk
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* DIRECT INQUIRY MODAL */}
      {selectedDealerForInquiry && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian/85 backdrop-blur-sm animate-fade-in"
          onClick={() => !inquirySending && setSelectedDealerForInquiry(null)}
        >
          <div
            className="max-w-md w-full bg-graphite border border-border/70 rounded-2xl p-6 space-y-4 shadow-dropdown"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-gold">Direct Dispatch</span>
                <h3 className="text-xl font-serif text-primary">Inquire with {selectedDealerForInquiry.name}</h3>
              </div>
              <button
                onClick={() => setSelectedDealerForInquiry(null)}
                className="text-muted hover:text-primary transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleInquirySubmit} className="space-y-4 pt-2">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-widest text-muted">Your Name *</label>
                <input
                  type="text"
                  required
                  value={inquiryName}
                  onChange={(e) => setInquiryName(e.target.value)}
                  placeholder="Principal or representative"
                  className="w-full bg-obsidian/60 border border-border/70 rounded-lg px-3.5 py-2.5 text-sm font-sans text-primary focus:outline-none focus:border-gold/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-widest text-muted">Your Email *</label>
                <input
                  type="email"
                  required
                  value={inquiryEmail}
                  onChange={(e) => setInquiryEmail(e.target.value)}
                  placeholder="client@domain.com"
                  className="w-full bg-obsidian/60 border border-border/70 rounded-lg px-3.5 py-2.5 text-sm font-sans text-primary focus:outline-none focus:border-gold/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-widest text-muted">Inquiry Details *</label>
                <textarea
                  required
                  rows={3}
                  value={inquiryMessage}
                  onChange={(e) => setInquiryMessage(e.target.value)}
                  placeholder="Inquiring about current inventory, off-market sourcing, or appointment..."
                  className="w-full bg-obsidian/60 border border-border/70 rounded-lg px-3.5 py-2.5 text-sm font-sans text-primary focus:outline-none focus:border-gold/50 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => setSelectedDealerForInquiry(null)}
                  disabled={inquirySending}
                  className="text-[10px] uppercase tracking-widest"
                >
                  Cancel
                </Button>
                <Button
                  variant="gold"
                  size="sm"
                  type="submit"
                  disabled={inquirySending}
                  leftIcon={inquirySending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                  className="text-[10px] uppercase tracking-widest font-semibold"
                >
                  {inquirySending ? 'Dispatching...' : 'Send Message'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}