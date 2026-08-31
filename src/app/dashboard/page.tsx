'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Car,
  MessageSquareText,
  BookmarkCheck,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Clock,
  Compass,
  Headphones,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useProfile } from '@/contexts/ProfileContext';
import { getSavedVehicles } from '@/actions/saved-vehicles';
import { useToast } from '@/hooks/useToast';

interface DashboardStats {
  savedVehicles: number;
  enquiries: number;
  messages: number;
  viewedVehicles: number;
}

export default function DashboardOverviewPage() {
  const { profile, isLoading: profileLoading } = useProfile();
  const { showToast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    savedVehicles: 0,
    enquiries: 0,
    messages: 0,
    viewedVehicles: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Load dashboard statistics
  useEffect(() => {
    const loadStats = async () => {
      try {
        setStatsLoading(true);
        
        // Fetch saved vehicles count
        const savedResult = await getSavedVehicles();
        
        // TODO: Will be implemented in Phase 19
        // const enquiriesResult = await getEnquiries();
        // const messagesResult = await getMessages();
        // const viewedResult = await getViewedVehicles();
        
        setStats({
          savedVehicles: savedResult.success ? savedResult.data.length : 0,
          enquiries: 0, // Placeholder until Phase 19
          messages: 0, // Placeholder until Phase 19
          viewedVehicles: 0, // Placeholder until Phase 19
        });
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
        showToast({
          type: 'error',
          title: 'Failed to load dashboard data',
          message: 'Please refresh the page to try again.',
        });
      } finally {
        setStatsLoading(false);
      }
    };

    if (!profileLoading && profile) {
      loadStats();
    }
  }, [profile, profileLoading, showToast]);

  // Show loading state
  if (profileLoading || statsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="h-10 w-10 text-gold animate-spin" />
        <p className="text-xs text-muted font-mono uppercase tracking-widest">
          Decrypting Vault Access...
        </p>
      </div>
    );
  }

  const firstName = profile?.name?.split(' ')[0] || 'Client';

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Greeting */}
      <div className="relative rounded-2xl overflow-hidden bg-graphite/95 border border-border/80 shadow-dropdown p-8 sm:p-10">
        <div
          className="absolute top-0 right-0 rounded-full bg-gold/5 blur-[120px] pointer-events-none translate-x-1/3 -translate-y-1/3"
          style={{ width: 500, height: 500 }}
          aria-hidden
        />
        <div className="absolute inset-0 checkerboard-bg opacity-[0.02] pointer-events-none" aria-hidden />

        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Badge variant="gold" size="sm" leftIcon={<ShieldCheck className="h-3 w-3" />}>
                Secure Session Active
              </Badge>
              <span className="text-[10px] font-mono text-muted uppercase tracking-widest hidden sm:inline-block">
                Tier 1 Clearance
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-light text-primary tracking-tight">
              Welcome back, <span className="text-gold font-medium">{firstName}</span>.
            </h1>

            <p className="text-sm text-secondary font-sans max-w-xl leading-relaxed">
              Your private automotive portfolio and acquisition requests are synchronized. Review
              your tracked assets or contact the concierge desk for immediate assistance.
            </p>
          </div>

          <Link href="/vehicles">
            <Button variant="gold" rightIcon={<ArrowRight className="h-4 w-4" />}>
              Explore Showroom
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Saved Vehicles */}
        <Card className="p-6 bg-graphite/60 border-border/60 hover:bg-charcoal/80 transition-colors group">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-lg bg-gold/10 border border-gold/20 text-gold group-hover:scale-110 transition-transform">
              <BookmarkCheck className="h-6 w-6" />
            </div>
            <span className="text-3xl font-serif font-light text-primary">
              {stats.savedVehicles}
            </span>
          </div>
          <div>
            <h3 className="text-sm font-sans font-medium text-primary mb-1">Tracked Assets</h3>
            <p className="text-xs text-muted font-sans mb-4">
              {stats.savedVehicles === 0 
                ? 'No vehicles saved to your private allocation list.' 
                : `${stats.savedVehicles} vehicle${stats.savedVehicles > 1 ? 's' : ''} in your collection.`}
            </p>
            <Link
              href="/dashboard/saved"
              className="text-xs text-gold hover:text-gold-hover flex items-center gap-1 font-medium transition-colors"
            >
              View Collection <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </Card>

        {/* Active Inquiries */}
        <Card className="p-6 bg-graphite/60 border-border/60 hover:bg-charcoal/80 transition-colors group">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
              <Headphones className="h-6 w-6" />
            </div>
            <span className="text-3xl font-serif font-light text-primary">
              {stats.enquiries}
            </span>
          </div>
          <div>
            <h3 className="text-sm font-sans font-medium text-primary mb-1">Active Inquiries</h3>
            <p className="text-xs text-muted font-sans mb-4">
              {stats.enquiries === 0 
                ? 'No ongoing negotiations or sourcing requests.' 
                : `${stats.enquiries} active inquiry${stats.enquiries > 1 ? 's' : ''} in progress.`}
            </p>
            <Link
              href="/dashboard/enquiries"
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium transition-colors"
            >
              Open Desk <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </Card>

        {/* Secure Messages */}
        <Card className="p-6 bg-graphite/60 border-border/60 hover:bg-charcoal/80 transition-colors group sm:col-span-2 lg:col-span-1">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 group-hover:scale-110 transition-transform">
              <MessageSquareText className="h-6 w-6" />
            </div>
            <span className="text-3xl font-serif font-light text-primary">
              {stats.messages}
            </span>
          </div>
          <div>
            <h3 className="text-sm font-sans font-medium text-primary mb-1">Secure Messages</h3>
            <p className="text-xs text-muted font-sans mb-4">
              {stats.messages === 0 
                ? 'No direct communications from verified dealers.' 
                : `${stats.messages} unread message${stats.messages > 1 ? 's' : ''} from dealers.`}
            </p>
            <Link
              href="/dashboard/messages"
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium transition-colors"
            >
              Open Inbox <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </Card>
      </div>

      {/* Activity + Concierge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-serif font-light text-primary flex items-center gap-2">
            <Clock className="h-4 w-4 text-gold" />
            Recent Vault Activity
          </h2>

          <Card className="p-8 bg-graphite/50 border-dashed border-border flex flex-col items-center justify-center text-center min-h-62.5">
            <div className="w-16 h-16 rounded-full bg-charcoal flex items-center justify-center mb-4 border border-border/60">
              <Compass className="h-6 w-6 text-muted" />
            </div>
            <h3 className="text-base font-serif text-primary mb-2">No Recent Acquisitions</h3>
            <p className="text-xs text-muted font-sans max-w-sm mb-6 leading-relaxed">
              Your vault timeline is currently empty. Explore our curated network of high-performance
              and luxury vehicles to begin.
            </p>
            <Link href="/vehicles">
              <Button variant="secondary" size="sm" rightIcon={<Car className="h-4 w-4" />}>
                Discover Vehicles
              </Button>
            </Link>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <h2 className="text-lg font-serif font-light text-primary flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-gold" />
            Private Concierge
          </h2>

          <Card className="p-6 bg-graphite/95 border-border/80 shadow-dropdown relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />

            <h3 className="text-sm font-sans font-semibold text-primary mb-2">Bespoke Sourcing</h3>
            <p className="text-xs text-secondary font-sans mb-5 leading-relaxed">
              Cannot find the exact specification you desire? Allow our private concierge team to
              source it directly from our global network.
            </p>

            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-2 text-xs text-muted font-sans">
                <CheckCircle2 className="h-3.5 w-3.5 text-gold shrink-0" />
                Off-market allocations
              </li>
              <li className="flex items-center gap-2 text-xs text-muted font-sans">
                <CheckCircle2 className="h-3.5 w-3.5 text-gold shrink-0" />
                Confidential negotiations
              </li>
              <li className="flex items-center gap-2 text-xs text-muted font-sans">
                <CheckCircle2 className="h-3.5 w-3.5 text-gold shrink-0" />
                Door-to-door secure logistics
              </li>
            </ul>

            <Link href="/dashboard/enquiries" className="block w-full">
              <Button variant="outline" fullWidth className="text-xs">
                Initiate Sourcing Request
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}