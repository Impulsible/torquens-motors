/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Gauge,
  MapPin,
  ShieldCheck,
  MessageSquare,
  ChevronRight,
  CheckCircle2,
  Zap,
  GitCompare,
} from 'lucide-react';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { VehicleGallery } from '@/components/vehicle/VehicleGallery';
import { VehicleDealerInfo } from '@/components/vehicle/VehicleDealerInfo';
import { VehicleEnquiryForm } from '@/components/vehicle/VehicleEnquiryForm';
import { SpecificationList, type VehicleSpecification } from '@/components/shared/SpecificationList';
import { RelatedVehicles } from '@/components/vehicle/RelatedVehicles';
import * as VehicleService from '@/services/vehicle.service';
import { formatCurrency } from '@/utils/helpers';

// Note: The comparison context is client-side only, so we can't use it in a Server Component.
// The compare button with full functionality will be handled in a client wrapper.
// For now, we render the button as a server component with basic props.

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

// -----------------------------------------------------------------------------
// DYNAMIC SEO METADATA & OPEN GRAPH
// -----------------------------------------------------------------------------
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const vehicle = await VehicleService.getVehicleBySlug(slug);

  if (!vehicle) {
    return {
      title: 'Vehicle Not Found — TORQUENS MOTORS',
      description: 'The requested luxury listing is no longer available in our registry.',
    };
  }

  const formattedPrice = formatCurrency
    ? formatCurrency(vehicle.price, vehicle.currency || 'NGN')
    : `${vehicle.currency === 'USD' ? '$' : '₦'}${vehicle.price.toLocaleString()}`;

  const pageTitle = `${vehicle.year} ${vehicle.make} ${vehicle.model} — ${formattedPrice} | TORQUENS MOTORS`;
  const description = `Acquire this verified ${vehicle.year} ${vehicle.make} ${vehicle.model} in ${vehicle.location}. ${vehicle.mileage.toLocaleString()} km, ${vehicle.transmission} gearbox, ${vehicle.fuelType}. Verified luxury marketplace dossier.`;

  return {
    title: pageTitle,
    description,
    keywords: [
      vehicle.make,
      vehicle.model,
      `${vehicle.year} ${vehicle.make}`,
      'Luxury Vehicle Nigeria',
      'Exotic Cars Lagos',
      'TORQUENS MOTORS',
    ],
    openGraph: {
      title: pageTitle,
      description,
      url: `https://torquensmotors.com/vehicles/${vehicle.slug}`,
      siteName: 'TORQUENS MOTORS',
      images: vehicle.images.length > 0 ? [{ url: vehicle.images[0] }] : [],
    },
  };
}

// -----------------------------------------------------------------------------
// COMPARE BUTTON CLIENT WRAPPER
// -----------------------------------------------------------------------------
function CompareButtonClient({ vehicleId }: { vehicleId: string }) {
  'use client';
  
  const { useComparison } = require('@/contexts/ComparisonContext');
  const { addVehicle, removeVehicle, isInComparison, count, maxVehicles } = useComparison();
  const isInCompare = isInComparison(vehicleId);
  const canAddToCompare = count < maxVehicles;

  const handleCompare = () => {
    if (isInCompare) {
      removeVehicle(vehicleId);
    } else {
      addVehicle(vehicleId).catch((error: any) => {
        console.error(error);
      });
    }
  };

  return (
    <Button
      variant="secondary"
      size="sm"
      fullWidth
      onClick={handleCompare}
      disabled={!isInCompare && !canAddToCompare}
      leftIcon={<GitCompare size={18} />}
      className="text-xs py-2.5"
    >
      {isInCompare ? 'Remove from Compare' : 'Add to Compare'}
    </Button>
  );
}

// -----------------------------------------------------------------------------
// MAIN SERVER PAGE COMPONENT
// -----------------------------------------------------------------------------
export default async function VehicleDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const vehicle = await VehicleService.getVehicleBySlug(slug);

  if (!vehicle) {
    notFound();
  }

  // Asynchronously increment view telemetry
  await VehicleService.incrementViews(vehicle.id).catch(() => {});

  // Fetch similar vehicles for bottom carousel/grid - limited to 4 for RelatedVehicles
  const relatedVehicles = await VehicleService.getRelatedVehicles(
    vehicle.id,
    vehicle.make,
    vehicle.bodyType,
    4
  ).catch(() => []);

  const isVerified = vehicle.verified === 'VERIFIED';
  const isSold = vehicle.status?.toUpperCase() === 'SOLD';
  const isReserved = vehicle.status?.toUpperCase() === 'RESERVED';

  // Normalize dealer data
  const rawDealer = vehicle.dealer as Record<string, any> | undefined;
  const dealer = {
    id: rawDealer?.id || rawDealer?._id?.toString() || 'dealer-1',
    name: rawDealer?.name || 'Verified Partner Dealer',
    companyName: rawDealer?.companyName || rawDealer?.name || 'TORQUENS Concierge Registry',
    logo: rawDealer?.logo || null,
    location: rawDealer?.location || vehicle.location || 'Lagos, Nigeria',
    phone: rawDealer?.phone || '+234 800 TORQUENS',
    email: rawDealer?.email || 'concierge@torquens.com',
    verified: rawDealer?.verified ?? true,
    rating: rawDealer?.rating || 4.9,
    totalReviews: rawDealer?.totalReviews || 34,
    description:
      rawDealer?.description ||
      'Authorized partner dealer specialising in exotic, executive, and high-performance vehicles.',
    activeListings: rawDealer?.activeListings || 18,
    responseTime: '< 2 hrs',
    memberSince: rawDealer?.memberSince || 2021,
    slug: rawDealer?.slug || 'torquens-concierge',
  };

  const formattedPrice = formatCurrency
    ? formatCurrency(vehicle.price, vehicle.currency || 'NGN')
    : `${vehicle.currency === 'USD' ? '$' : '₦'}${vehicle.price.toLocaleString()}`;

  // Use correct property names from IVehicle
  const engineDisplay = vehicle.engine || `${vehicle.horsepower || 375}hp Engine`;
  const horsepowerDisplay = vehicle.horsepower || 375;

  const specGroups = [
    {
      title: 'Performance & Powertrain',
      specs: [
        { label: 'Engine / Motor', value: engineDisplay, highlight: true },
        { label: 'Power Output', value: horsepowerDisplay, unit: 'hp', highlight: true },
        { label: 'Fuel Type', value: vehicle.fuelType },
        { label: 'Transmission', value: vehicle.transmission },
        { label: 'Drivetrain', value: vehicle.drivetrain || 'All-Wheel Drive (AWD)' },
        { label: 'Condition', value: 'Certified CPO' },
      ] as VehicleSpecification[],
    },
    {
      title: 'Vehicle Identity & History',
      specs: [
        { label: 'Model Year', value: vehicle.year },
        { label: 'Odometer', value: vehicle.mileage.toLocaleString(), unit: 'km' },
        { label: 'Body Style', value: vehicle.bodyType || 'SUV' },
        { label: 'Exterior Colour', value: 'Obsidian Metallic' },
        { label: 'Interior Trim', value: 'Nappa Leather' },
        { label: 'Location', value: vehicle.location },
      ] as VehicleSpecification[],
    },
  ];

  const telemetrySpecs: VehicleSpecification[] = [
    {
      label: 'Model Year',
      value: vehicle.year,
      icon: <Calendar />,
    },
    {
      label: 'Odometer',
      value: vehicle.mileage.toLocaleString(),
      unit: 'KM',
      icon: <Gauge />,
    },
    {
      label: 'Power',
      value: horsepowerDisplay,
      unit: 'HP',
      icon: <Zap />,
      highlight: true,
    },
    {
      label: 'Location',
      value: vehicle.location,
      icon: <MapPin />,
    },
  ];

  // Schema.org JSON-LD Structured Data
  const jsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'Car',
    name: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
    image: vehicle.images,
    description: vehicle.description,
    brand: {
      '@type': 'Brand',
      name: vehicle.make,
    },
    model: vehicle.model,
    vehicleModelDate: vehicle.year.toString(),
    mileageFromOdometer: {
      '@type': 'QuantitativeValue',
      value: vehicle.mileage,
      unitCode: 'KMT',
    },
    fuelType: vehicle.fuelType,
    vehicleTransmission: vehicle.transmission,
    offers: {
      '@type': 'Offer',
      priceCurrency: vehicle.currency || 'NGN',
      price: vehicle.price,
      itemCondition: 'https://schema.org/UsedCondition',
      availability: isSold
        ? 'https://schema.org/SoldOut'
        : 'https://schema.org/InStock',
    },
  };

  return (
    <>
      {/* Google SEO JSON-LD Rich Result */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="min-h-screen pt-20 pb-20 bg-obsidian selection:bg-gold selection:text-obsidian">
        {/* Ambient Top Glow */}
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-250 h-100 bg-gold/5 blur-[140px] rounded-full" />

        <div className="container-torquens relative z-10">
          {/* --------------------------------------------------------------- */}
          {/* BREADCRUMB & BACK ACTION                                        */}
          {/* --------------------------------------------------------------- */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pt-4">
            <div className="flex items-center gap-2 text-xs font-sans text-muted overflow-x-auto no-scrollbar py-1">
              <Link href="/" className="hover:text-gold transition-colors shrink-0">
                Registry
              </Link>
              <ChevronRight size={12} className="shrink-0 text-border" />
              <Link href="/vehicles" className="hover:text-gold transition-colors shrink-0">
                Inventory
              </Link>
              <ChevronRight size={12} className="shrink-0 text-border" />
              <Link
                href={`/vehicles?make=${encodeURIComponent(vehicle.make)}`}
                className="hover:text-gold transition-colors shrink-0"
              >
                {vehicle.make}
              </Link>
              <ChevronRight size={12} className="shrink-0 text-border" />
              <span className="text-secondary truncate">
                {vehicle.model}
              </span>
            </div>

            <Link
              href="/vehicles"
              className="inline-flex items-center gap-1.5 text-xs font-sans text-secondary hover:text-gold transition-colors self-start sm:self-auto"
            >
              <ArrowLeft size={14} />
              <span>Return to Inventory</span>
            </Link>
          </div>

          {/* --------------------------------------------------------------- */}
          {/* MAIN 12-COLUMN ASYMMETRIC GRID                                  */}
          {/* --------------------------------------------------------------- */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
            {/* ============================================================= */}
            {/* LEFT COLUMN: Media Gallery, Telemetry & Technical Dossier     */}
            {/* ============================================================= */}
            <div className="lg:col-span-8 space-y-8">
              {/* Media Gallery */}
              <VehicleGallery
                title={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                images={
                  vehicle.images.length > 0
                    ? vehicle.images
                    : ['/placeholder-vehicle.jpg']
                }
                badge={
                  <>
                    {isVerified && (
                      <Badge variant="verified" size="sm">
                        <span className="inline-flex items-center gap-1">
                          <ShieldCheck className="h-3 w-3" />
                          Verified Vehicle
                        </span>
                      </Badge>
                    )}
                  </>
                }
              />

              {/* Title & Quick Specifications Banner */}
              <Card className="p-6 sm:p-8 bg-graphite border-border">
                <div className="space-y-4">
                  {/* Make / Model / Badges */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-sans font-extrabold tracking-[0.2em] text-gold uppercase">
                          {vehicle.make}
                        </span>
                        <span className="text-border">•</span>
                        <span className="text-xs font-sans text-secondary">
                          Ref #{vehicle.id.slice(0, 8)}
                        </span>
                      </div>

                      <h1 className="text-3xl sm:text-4xl font-serif font-light text-primary tracking-tight">
                        {vehicle.model}
                      </h1>
                    </div>

                    {/* Status Badges */}
                    <div className="flex items-center gap-2 shrink-0">
                      {isSold ? (
                        <Badge variant="sold" size="lg">
                          Sold Out
                        </Badge>
                      ) : isReserved ? (
                        <Badge variant="reserved" size="lg" dot>
                          Reserved
                        </Badge>
                      ) : (
                        <Badge variant="gold" size="lg" dot>
                          Available for Acquisition
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Telemetry Strip Instrument Panel */}
                  <div className="pt-4 border-t border-border/80">
                    <SpecificationList
                      columns={4}
                      variant="inset"
                      specs={telemetrySpecs}
                    />
                  </div>
                </div>

                {/* Editorial Description */}
                {vehicle.description && (
                  <div className="mt-8 pt-6 border-t border-border/80 space-y-3">
                    <h3 className="text-xs font-sans font-semibold uppercase tracking-[0.2em] text-gold">
                      Curator Notes & Overview
                    </h3>
                    <div className="text-sm text-secondary font-sans leading-relaxed space-y-3 whitespace-pre-wrap">
                      {vehicle.description}
                    </div>
                  </div>
                )}
              </Card>

              {/* Comprehensive Technical Dossier */}
              <Card className="p-6 sm:p-8 bg-graphite border-border">
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-serif font-light text-primary">
                      Technical Specification Dossier
                    </h3>
                    <Badge variant="gold" size="sm">
                      Verified
                    </Badge>
                  </div>

                  {specGroups.map((group, index) => (
                    <div key={index} className="space-y-3">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-secondary font-sans">
                        {group.title}
                      </h4>
                      <SpecificationList
                        columns={2}
                        variant="inset"
                        specs={group.specs}
                      />
                    </div>
                  ))}
                </div>
              </Card>

              {/* TORQUENS Verification Guarantee Shield */}
              {isVerified && (
                <Card className="p-6 bg-graphite border-emerald-border/60 relative overflow-hidden">
                  <div className="pointer-events-none absolute -top-16 -right-16 w-48 h-48 bg-emerald/10 rounded-full blur-3xl" />

                  <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-5">
                    <div className="w-12 h-12 rounded-xl bg-emerald/10 border border-emerald/30 flex items-center justify-center text-emerald shrink-0">
                      <ShieldCheck size={24} />
                    </div>

                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-serif font-light text-primary">
                          TORQUENS Verified Vehicle Guarantee
                        </h3>
                        <Badge variant="verified" size="sm">
                          100% Passed
                        </Badge>
                      </div>
                      <p className="text-xs text-secondary font-sans leading-relaxed">
                        This vehicle has undergone a physical chassis inspection, customs duty validation, and title clearance by our concierge technical team.
                      </p>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-2 text-[11px] font-sans text-secondary">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 size={13} className="text-emerald" />
                          Customs Duty Fully Paid
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle2 size={13} className="text-emerald" />
                          Chassis Number Cleared
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle2 size={13} className="text-emerald" />
                          Title & Registration Verified
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>

            {/* ============================================================= */}
            {/* RIGHT COLUMN: Acquisition Card, Dealer Profile & Enquiry Form */}
            {/* ============================================================= */}
            <div className="lg:col-span-4 space-y-6">
              {/* Sticky Acquisition Pricing Card */}
              <div className="sticky top-24 space-y-6">
                <Card className="p-6 bg-graphite border-gold/30 shadow-goldGlowSm relative overflow-hidden">
                  <div className="pointer-events-none absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-gold to-transparent" />

                  <div className="space-y-5">
                    {/* Price Header */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-sans uppercase tracking-[0.2em] text-muted">
                        Acquisition Price
                      </span>
                      <div className="text-3xl sm:text-4xl font-sans font-extrabold tracking-tight text-gold">
                        {formattedPrice}
                      </div>
                      <p className="text-[11px] font-sans text-muted">
                        Excludes registration & regional transfer fees
                      </p>
                    </div>

                    {/* Primary CTA Buttons */}
                    <div className="space-y-2.5 pt-2 border-t border-border/80">
                      <a href="#enquiry" className="block">
                        <Button
                          variant="primary"
                          size="md"
                          fullWidth
                          className="text-xs uppercase tracking-widest font-semibold py-3.5 flex items-center justify-center gap-2 group"
                        >
                          <MessageSquare size={16} />
                          <span>Request Private Enquiry</span>
                        </Button>
                      </a>

                      <div className="grid grid-cols-2 gap-2">
                        <a href={`tel:${dealer.phone}`} className="block">
                          <Button
                            variant="secondary"
                            size="sm"
                            fullWidth
                            className="text-xs py-2.5"
                          >
                            Call Dealer
                          </Button>
                        </a>
                        {/* Compare Button with client-side functionality */}
                        <CompareButtonClient vehicleId={vehicle.id} />
                      </div>
                    </div>

                    {/* Telemetry Micro Stats */}
                    <div className="p-3 rounded-lg bg-inset border border-border/80 grid grid-cols-3 gap-2 text-center text-xs font-sans">
                      <div>
                        <span className="text-[10px] text-muted uppercase block">
                          Views
                        </span>
                        <span className="font-semibold text-primary font-mono mt-0.5 block">
                          {vehicle.views || 1}
                        </span>
                      </div>
                      <div className="border-x border-border/60">
                        <span className="text-[10px] text-muted uppercase block">
                          Saved
                        </span>
                        <span className="font-semibold text-primary font-mono mt-0.5 block">
                          {vehicle.savedCount || 0}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted uppercase block">
                          Enquiries
                        </span>
                        <span className="font-semibold text-primary font-mono mt-0.5 block">
                          {0}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Verified Dealer Info Card */}
                <VehicleDealerInfo dealer={dealer} />

                {/* Enquiry Form Anchor Target */}
                <div id="enquiry">
                  <VehicleEnquiryForm
                    vehicleId={vehicle.id}
                    vehicleName={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                    dealerName={dealer.companyName}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* --------------------------------------------------------------- */}
          {/* RELATED VEHICLES SECTION                                        */}
          {/* --------------------------------------------------------------- */}
          {relatedVehicles.length > 0 && (
            <RelatedVehicles
              vehicleId={vehicle.id}
              make={vehicle.make}
              bodyType={vehicle.bodyType}
              limit={4}
              title={`More from ${vehicle.make}`}
              className="mt-16"
            />
          )}
        </div>
      </main>
    </>
  );
}