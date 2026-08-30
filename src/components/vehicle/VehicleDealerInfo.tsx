'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  MapPin,
  Phone,
  Mail,
  Star,
  Users,
  ShieldCheck,
  ArrowUpRight,
  MessageSquare,
  Clock,
  BadgeCheck,
  Store,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';

export interface VehicleDealerInfoProps {
  dealer: {
    id: string;
    name: string;
    companyName?: string;
    logo?: string | null;
    location: string;
    phone: string;
    email: string;
    verified: boolean | string;
    rating: number;
    totalReviews: number;
    description?: string;
    /** Optional extras for richer dossier */
    memberSince?: string | number;
    responseTime?: string;
    activeListings?: number;
    slug?: string;
  };
  /** Vehicle id for deep-link enquire context */
  vehicleId?: string;
  className?: string;
}

/** Build initials monogram from dealer name */
function getMonogram(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

/** Render 5-star row with partial fill support */
function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  const clamped = Math.max(0, Math.min(5, rating));

  return (
    <div className="flex items-center gap-0.5" aria-label={`${clamped.toFixed(1)} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const fill = Math.min(1, Math.max(0, clamped - i));
        return (
          <span key={i} className="relative inline-flex" style={{ width: size, height: size }}>
            {/* Empty star */}
            <Star
              size={size}
              className="text-border absolute inset-0"
              strokeWidth={1.5}
            />
            {/* Filled portion */}
            {fill > 0 && (
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fill * 100}%` }}
              >
                <Star
                  size={size}
                  className="text-gold fill-gold"
                  strokeWidth={1.5}
                />
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}

export function VehicleDealerInfo({
  dealer,
  vehicleId,
  className,
}: VehicleDealerInfoProps) {
  const isVerified =
    dealer.verified === true ||
    dealer.verified === 'VERIFIED' ||
    dealer.verified === 'verified';

  const displayName = dealer.companyName || dealer.name;
  const profileHref = `/dealers/${dealer.slug || dealer.id}`;
  const listingsHref = `${profileHref}/vehicles`;
  const enquireHref = vehicleId
    ? `/vehicles/${vehicleId}?enquire=1#enquiry`
    : `${profileHref}?contact=1`;

  const monogram = getMonogram(displayName);

  return (
    <Card
      className={cn(
        'relative overflow-hidden bg-graphite border-border p-5 sm:p-6',
        'hover:border-active-border transition-all duration-300',
        className
      )}
    >
      {/* Ambient corner glow */}
      <div className="pointer-events-none absolute -top-16 -right-16 w-40 h-40 bg-gold/5 rounded-full blur-3xl" />

      {/* ----------------------------------------------------------------- */}
      {/* HEADER: Logo + Identity                                           */}
      {/* ----------------------------------------------------------------- */}
      <div className="relative z-10 flex items-start gap-4">
        {/* Logo / Monogram Stage */}
        <div className="relative shrink-0">
          <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl overflow-hidden bg-inset border border-border shadow-sm flex items-center justify-center">
            {dealer.logo ? (
              <Image
                src={dealer.logo}
                alt={displayName}
                width={72}
                height={72}
                className="object-cover w-full h-full"
              />
            ) : (
              <span className="font-serif text-xl sm:text-2xl font-light text-gold tracking-wider">
                {monogram || <Store size={24} className="text-muted" />}
              </span>
            )}
          </div>

          {/* Verified corner pip */}
          {isVerified && (
            <div
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-obsidian border border-emerald/40 flex items-center justify-center text-emerald shadow-sm"
              title="TORQUENS Verified Dealer"
            >
              <BadgeCheck size={14} />
            </div>
          )}
        </div>

        {/* Name + Badges + Rating */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-lg font-serif font-light text-primary tracking-tight truncate">
                {displayName}
              </h4>
              {isVerified && (
                <Badge variant="verified" size="sm">
                  <span className="inline-flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" />
                    Verified Dealer
                  </span>
                </Badge>
              )}
            </div>

            {dealer.description && (
              <p className="text-xs text-secondary font-sans leading-relaxed line-clamp-2">
                {dealer.description}
              </p>
            )}
          </div>

          {/* Rating Row */}
          <div className="flex flex-wrap items-center gap-2">
            <StarRating rating={dealer.rating} />
            <span className="text-sm font-sans font-semibold text-primary">
              {dealer.rating.toFixed(1)}
            </span>
            <span className="text-[11px] text-muted font-sans">
              ({dealer.totalReviews.toLocaleString()} review
              {dealer.totalReviews !== 1 ? 's' : ''})
            </span>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* MICRO STATS                                                       */}
      {/* ----------------------------------------------------------------- */}
      {(dealer.activeListings !== undefined ||
        dealer.responseTime ||
        dealer.memberSince) && (
        <div className="relative z-10 mt-5 grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-inset border border-border/80">
          <div className="flex flex-col items-center text-center px-1">
            <span className="text-[10px] uppercase tracking-wider text-muted font-sans">
              Listings
            </span>
            <span className="text-sm font-semibold text-primary font-mono mt-0.5">
              {dealer.activeListings !== undefined
                ? dealer.activeListings
                : '—'}
            </span>
          </div>
          <div className="flex flex-col items-center text-center px-1 border-x border-border/60">
            <span className="text-[10px] uppercase tracking-wider text-muted font-sans flex items-center gap-1 justify-center">
              <Clock size={10} /> Reply
            </span>
            <span className="text-sm font-semibold text-primary mt-0.5 truncate max-w-full">
              {dealer.responseTime || '< 24h'}
            </span>
          </div>
          <div className="flex flex-col items-center text-center px-1">
            <span className="text-[10px] uppercase tracking-wider text-muted font-sans">
              Since
            </span>
            <span className="text-sm font-semibold text-primary font-mono mt-0.5">
              {dealer.memberSince || '—'}
            </span>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* CONTACT DETAILS                                                   */}
      {/* ----------------------------------------------------------------- */}
      <div className="relative z-10 mt-5 space-y-2.5">
        <div className="flex items-start gap-2.5 text-xs font-sans text-secondary">
          <MapPin size={14} className="text-gold shrink-0 mt-0.5" />
          <span className="leading-relaxed">{dealer.location}</span>
        </div>

        <a
          href={`tel:${dealer.phone}`}
          className="flex items-center gap-2.5 text-xs font-sans text-secondary hover:text-gold transition-colors group"
        >
          <Phone size={14} className="text-gold shrink-0" />
          <span className="group-hover:gold-underline">{dealer.phone}</span>
        </a>

        <a
          href={`mailto:${dealer.email}`}
          className="flex items-center gap-2.5 text-xs font-sans text-secondary hover:text-gold transition-colors group"
        >
          <Mail size={14} className="text-gold shrink-0" />
          <span className="truncate group-hover:gold-underline">{dealer.email}</span>
        </a>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* ACTIONS                                                           */}
      {/* ----------------------------------------------------------------- */}
      <div className="relative z-10 mt-5 pt-4 border-t border-border/80 space-y-2.5">
        {/* Primary: Enquire */}
        <Link href={enquireHref} className="block">
          <Button
            variant="primary"
            size="sm"
            fullWidth
            className="text-xs uppercase tracking-widest font-semibold py-3 flex items-center justify-center gap-2 group"
          >
            <MessageSquare size={14} />
            <span>Enquire with Dealer</span>
          </Button>
        </Link>

        {/* Secondary row */}
        <div className="grid grid-cols-2 gap-2.5">
          <Link href={profileHref} className="block">
            <Button
              variant="secondary"
              size="sm"
              fullWidth
              className="text-xs py-2.5 flex items-center justify-center gap-1.5"
            >
              <span>View Profile</span>
              <ArrowUpRight size={13} />
            </Button>
          </Link>
          <Link href={listingsHref} className="block">
            <Button
              variant="secondary"
              size="sm"
              fullWidth
              className="text-xs py-2.5 flex items-center justify-center gap-1.5"
            >
              <Users size={13} className="text-gold" />
              <span>All Listings</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Trust footer line */}
      {isVerified && (
        <p className="relative z-10 mt-4 text-[10px] font-sans text-muted text-center flex items-center justify-center gap-1.5">
          <ShieldCheck size={12} className="text-emerald" />
          Business identity & contact verified by TORQUENS
        </p>
      )}
    </Card>
  );
}

export default VehicleDealerInfo;