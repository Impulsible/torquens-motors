'use client';
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  Upload,
  Plus,
  Car,
  ShieldCheck,
  Sparkles,
  Layers,
  CheckCircle2,
  Trash2,
  Star,
  Gauge,
  Zap,
} from 'lucide-react';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/utils/cn';
import { createVehicle } from '@/actions/vehicles';

// ─────────────────────────────────────────────────────────────
// VALIDATION SCHEMA
// ─────────────────────────────────────────────────────────────
const addVehicleSchema = z.object({
  make: z.string().min(2, 'Make is required (e.g. Porsche)'),
  model: z.string().min(1, 'Model is required (e.g. 911 GT3 RS)'),
  year: z
    .number()
    .int('Year must be a whole number')
    .min(1900, 'Year must be 1900 or later')
    .max(new Date().getFullYear() + 2, 'Year cannot be more than 2 years in the future'),
  price: z
    .number()
    .positive('Price must be greater than 0'),
  currency: z.string().default('NGN'),
  mileage: z
    .number()
    .min(0, 'Mileage cannot be negative'),
  vin: z.string().optional(),
  bodyType: z.string().min(1, 'Body type required'),
  fuelType: z.string().min(1, 'Fuel type required'),
  transmission: z.string().min(1, 'Transmission type required'),
  drivetrain: z.string().min(1, 'Drivetrain required'),
  engine: z.string().min(1, 'Engine displacement required (e.g. 4.0L Naturally Aspirated Boxer-6)'),
  horsepower: z
    .number()
    .positive('Must be positive')
    .optional(),
  location: z.string().min(2, 'Asset location required (e.g. Mayfair, London)'),
  description: z.string().min(20, 'Please provide at least 20 characters of provenance narrative'),
  status: z.enum(['DRAFT', 'PENDING_REVIEW', 'PUBLISHED']).default('PUBLISHED'),
});

// Define the form data type
type VehicleFormData = {
  make: string;
  model: string;
  year: number;
  price: number;
  currency: string;
  mileage: number;
  vin?: string;
  bodyType: string;
  fuelType: string;
  transmission: string;
  drivetrain: string;
  engine: string;
  horsepower?: number;
  location: string;
  description: string;
  status: 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED';
};

// ─────────────────────────────────────────────────────────────
// SELECT OPTIONS & BESPOKE FEATURE TAGS
// ─────────────────────────────────────────────────────────────
const BODY_TYPES = ['Coupe', 'Sedan', 'SUV', 'Convertible', 'Hypercar / Targa', 'Shooting Brake', 'Speedster'];
const FUEL_TYPES = ['Petrol', 'Electric', 'Hybrid', 'Plug-in Hybrid', 'Diesel'];
const TRANSMISSIONS = ['Automatic Dual-Clutch (PDK/DCT)', 'Manual', 'Sequential Race Gearbox', 'Automatic'];
const DRIVETRAINS = ['AWD (All-Wheel Drive)', 'RWD (Rear-Wheel Drive)', '4WD', 'FWD'];
const CURRENCIES = [
  { value: 'NGN', label: '₦ NGN (Nigerian Naira)' },
  { value: 'USD', label: '$ USD (US Dollar)' },
  { value: 'EUR', label: '€ EUR (Euro)' },
  { value: 'GBP', label: '£ GBP (British Pound)' },
  { value: 'CHF', label: 'CHF (Swiss Franc)' },
];

const CURATED_EQUIPMENT_TAGS = [
  'Carbon Ceramic Brakes',
  'Front Axle Lift System',
  'Titanium Sports Exhaust',
  'Full Carbon Fiber Aero Package',
  'Bespoke Paint-to-Sample (PTS)',
  'ClubSport Package',
  'Alcantara Interior Package',
  'Burmester High-End Surround Sound',
  'Magnesium Lightweight Wheels',
  'Head-Up Display',
  'Full PPF Paint Protection',
  'Single Owner Provenance',
];

export default function AddVehiclePage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  // ✅ Replace the old images state with string[] for ImageUpload
  const [images, setImages] = useState<string[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    'Carbon Ceramic Brakes',
    'Single Owner Provenance',
  ]);
  const [customFeatureInput, setCustomFeatureInput] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VehicleFormData>({
    resolver: zodResolver(addVehicleSchema) as unknown as any,
    defaultValues: {
      year: new Date().getFullYear(),
      currency: 'NGN',
      bodyType: 'Coupe',
      fuelType: 'Petrol',
      transmission: 'Automatic Dual-Clutch (PDK/DCT)',
      drivetrain: 'RWD (Rear-Wheel Drive)',
      status: 'PUBLISHED',
    },
  });

  // ─────────────────────────────────────────────────────────────
  // FEATURE PILL TOGGLING
  // ─────────────────────────────────────────────────────────────
  const toggleFeature = (feature: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(feature) ? prev.filter((f) => f !== feature) : [...prev, feature]
    );
  };

  const addCustomFeature = () => {
    const trimmed = customFeatureInput.trim();
    if (!trimmed) return;
    if (!selectedFeatures.includes(trimmed)) {
      setSelectedFeatures((prev) => [...prev, trimmed]);
    }
    setCustomFeatureInput('');
  };

  // ─────────────────────────────────────────────────────────────
  // FORM SUBMISSION TO DATABASE
  // ─────────────────────────────────────────────────────────────
  const onSubmit = async (data: VehicleFormData) => {
    // ✅ Check if images are uploaded
    if (images.length === 0) {
      showToast({
        type: 'warning',
        title: 'Images Required',
        message: 'Please upload at least one high-resolution photograph for the showroom registry.',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();

      // Append standard text/number data
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      // ✅ Append images as JSON string
      formData.append('images', JSON.stringify(images));

      // Append selected equipment options
      formData.append('features', JSON.stringify(selectedFeatures));

      const response = await createVehicle(formData);

      if (response && response.success) {
        showToast({
          type: 'success',
          title: 'Allocation Registered',
          message: `${data.year} ${data.make} ${data.model} has been saved to the registry ledger.`,
        });
        router.push('/dealer/inventory');
        router.refresh();
      } else {
        showToast({
          type: 'error',
          title: 'Registration Incomplete',
          message: response?.message || 'Could not write allocation to database ledger.',
        });
      }
    } catch (error) {
      console.error('[AddVehicle] Submission exception:', error);
      showToast({
        type: 'error',
        title: 'Execution Failed',
        message: 'An unexpected connection error occurred during ledger write.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-20">
      {/* ───────────────────────────────────────────────────────── */}
      {/* HEADER                                                    */}
      {/* ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/40">
        <div className="flex items-center gap-4">
          <Link
            href="/dealer/inventory"
            className="flex items-center justify-center h-10 w-10 rounded-lg bg-graphite/60 border border-border/80 text-secondary hover:text-gold hover:border-gold/40 transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/60"
            aria-label="Back to inventory fleet"
          >
            <ArrowLeft size={18} />
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-widest uppercase text-gold">
                Allocation Registry
              </span>
              <span className="text-muted text-xs">•</span>
              <span className="text-xs font-sans text-muted">New Vehicle Dossier</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-light text-primary tracking-tight mt-0.5">
              Register Vehicle Allocation
            </h1>
          </div>
        </div>

        <Badge variant="gold" size="md" className="self-start sm:self-auto py-1 px-3">
          <Sparkles className="h-3 w-3 mr-1.5" />
          <span>Tier-1 Provenance Standard</span>
        </Badge>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ─────────────────────────────────────────────────────── */}
          {/* MAIN COLUMN (SPECIFICATIONS & DOSSIER DETAILS)          */}
          {/* ─────────────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. Identity & Pricing */}
            <Card className="p-6 bg-graphite/95 border-border/80 relative overflow-hidden backdrop-blur-md">
              <h2 className="text-xs font-mono font-semibold uppercase tracking-widest text-gold flex items-center gap-2 border-b border-border/40 pb-4 mb-5">
                <Car className="h-4 w-4" />
                <span>1. Asset Identity & Market Valuation</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Vehicle Marque (Make)"
                  placeholder="e.g. Porsche"
                  {...register('make')}
                  error={errors.make?.message}
                  disabled={isSubmitting}
                  required
                />

                <Input
                  label="Model & Specific Variant"
                  placeholder="e.g. 911 GT3 RS (992)"
                  {...register('model')}
                  error={errors.model?.message}
                  disabled={isSubmitting}
                  required
                />

                <Input
                  label="Production Year"
                  type="number"
                  placeholder="2024"
                  {...register('year', { valueAsNumber: true })}
                  error={errors.year?.message}
                  disabled={isSubmitting}
                  required
                />

                <Input
                  label="Chassis VIN / Serial (Optional)"
                  placeholder="e.g. WP0AF2A99NS298112"
                  {...register('vin')}
                  error={errors.vin?.message}
                  disabled={isSubmitting}
                />

                <div className="space-y-1.5">
                  <label className="block text-xs font-sans text-secondary">
                    Pricing Valuation <span className="text-gold">*</span>
                  </label>
                  <div className="flex gap-2">
                    <div className="w-32 shrink-0">
                      <select
                        {...register('currency')}
                        disabled={isSubmitting}
                        className="w-full h-10 px-3 rounded-md bg-inset border border-border text-xs font-mono uppercase tracking-wider text-primary focus:outline-none focus:border-gold"
                      >
                        {CURRENCIES.map((curr) => (
                          <option key={curr.value} value={curr.value}>
                            {curr.value}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <input
                        type="number"
                        step="any"
                        placeholder="185000000"
                        {...register('price', { valueAsNumber: true })}
                        disabled={isSubmitting}
                        className="w-full h-10 px-3 rounded-md bg-inset border border-border text-sm font-sans text-primary placeholder-muted focus:outline-none focus:border-gold"
                      />
                    </div>
                  </div>
                  {errors.price && <p className="text-xs text-red-400">{errors.price.message}</p>}
                </div>

                <Input
                  label="Odometer Mileage (km)"
                  type="number"
                  placeholder="1500"
                  {...register('mileage', { valueAsNumber: true })}
                  error={errors.mileage?.message}
                  disabled={isSubmitting}
                  required
                />
              </div>
            </Card>

            {/* 2. Technical Specs & Powertrain */}
            <Card className="p-6 bg-graphite/95 border-border/80 relative overflow-hidden backdrop-blur-md">
              <h2 className="text-xs font-mono font-semibold uppercase tracking-widest text-gold flex items-center gap-2 border-b border-border/40 pb-4 mb-5">
                <Gauge className="h-4 w-4" />
                <span>2. Powertrain & Engineering Specifications</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-sans text-secondary">Body Architecture</label>
                  <select
                    {...register('bodyType')}
                    disabled={isSubmitting}
                    className="w-full h-10 px-3 rounded-md bg-inset border border-border text-xs font-sans text-primary focus:outline-none focus:border-gold"
                  >
                    {BODY_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  {errors.bodyType && <p className="text-xs text-red-400">{errors.bodyType.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-sans text-secondary">Fuel / Propulsion</label>
                  <select
                    {...register('fuelType')}
                    disabled={isSubmitting}
                    className="w-full h-10 px-3 rounded-md bg-inset border border-border text-xs font-sans text-primary focus:outline-none focus:border-gold"
                  >
                    {FUEL_TYPES.map((fuel) => (
                      <option key={fuel} value={fuel}>
                        {fuel}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-sans text-secondary">Transmission Architecture</label>
                  <select
                    {...register('transmission')}
                    disabled={isSubmitting}
                    className="w-full h-10 px-3 rounded-md bg-inset border border-border text-xs font-sans text-primary focus:outline-none focus:border-gold"
                  >
                    {TRANSMISSIONS.map((tx) => (
                      <option key={tx} value={tx}>
                        {tx}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-sans text-secondary">Drivetrain</label>
                  <select
                    {...register('drivetrain')}
                    disabled={isSubmitting}
                    className="w-full h-10 px-3 rounded-md bg-inset border border-border text-xs font-sans text-primary focus:outline-none focus:border-gold"
                  >
                    {DRIVETRAINS.map((drive) => (
                      <option key={drive} value={drive}>
                        {drive}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Engine Displacement / Configuration"
                  placeholder="e.g. 4.0L Naturally Aspirated Flat-6"
                  {...register('engine')}
                  error={errors.engine?.message}
                  disabled={isSubmitting}
                  required
                />

                <Input
                  label="Horsepower (BHP / PS)"
                  type="number"
                  placeholder="e.g. 518"
                  {...register('horsepower', { valueAsNumber: true })}
                  error={errors.horsepower?.message}
                  disabled={isSubmitting}
                />
              </div>

              <div className="mt-4">
                <Input
                  label="Custody / Physical Asset Location"
                  placeholder="e.g. Mayfair Showroom, London (or Victoria Island, Lagos)"
                  {...register('location')}
                  error={errors.location?.message}
                  disabled={isSubmitting}
                  required
                />
              </div>
            </Card>

            {/* 3. Bespoke Features & Package Upgrades */}
            <Card className="p-6 bg-graphite/95 border-border/80 relative overflow-hidden backdrop-blur-md">
              <h2 className="text-xs font-mono font-semibold uppercase tracking-widest text-gold flex items-center gap-2 border-b border-border/40 pb-4 mb-4">
                <Zap className="h-4 w-4" />
                <span>3. Bespoke Options & Equipment Specification</span>
              </h2>

              {/* Tag Picker */}
              <div className="flex flex-wrap gap-2 mb-4">
                {CURATED_EQUIPMENT_TAGS.map((tag) => {
                  const isSelected = selectedFeatures.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleFeature(tag)}
                      disabled={isSubmitting}
                      className={cn(
                        'px-3 py-1.5 rounded-full text-xs font-sans transition-all duration-200 border flex items-center gap-1.5',
                        isSelected
                          ? 'bg-gold/15 border-gold text-gold font-medium shadow-[0_0_12px_rgba(212,175,55,0.15)]'
                          : 'bg-obsidian/60 border-border/70 text-secondary hover:border-gold/30 hover:text-primary'
                      )}
                    >
                      {isSelected && <CheckCircle2 size={12} className="text-gold" />}
                      <span>{tag}</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Tag Input */}
              <div className="flex gap-2">
                <Input
                  placeholder="Add custom factory option / package (e.g. Weissach Package)..."
                  value={customFeatureInput}
                  onChange={(e) => setCustomFeatureInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomFeature();
                    }
                  }}
                  disabled={isSubmitting}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={addCustomFeature}
                  disabled={!customFeatureInput.trim() || isSubmitting}
                  className="shrink-0 text-xs uppercase tracking-wider"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add
                </Button>
              </div>
            </Card>

            {/* 4. Editorial Narrative & Provenance Description */}
            <Card className="p-6 bg-graphite/95 border-border/80 relative overflow-hidden backdrop-blur-md">
              <h2 className="text-xs font-mono font-semibold uppercase tracking-widest text-gold flex items-center gap-2 border-b border-border/40 pb-4 mb-4">
                <Layers className="h-4 w-4" />
                <span>4. Historical Narrative & Provenance Summary</span>
              </h2>

              <Textarea
                label="Detailed Description & Service Records"
                placeholder="Highlight vehicle condition, original factory options, maintenance stamps, single-owner history, or concours participation..."
                rows={6}
                {...register('description')}
                error={errors.description?.message}
                disabled={isSubmitting}
                required
              />
            </Card>
          </div>

          {/* ─────────────────────────────────────────────────────── */}
          {/* SIDEBAR COLUMN (VISUAL GALLERY & SUBMISSION DECK)       */}
          {/* ─────────────────────────────────────────────────────── */}
          <div className="space-y-6">
            {/* ✅ Visual Assets & Gallery - Using ImageUpload */}
            <Card className="p-6 bg-graphite/95 border-border/80 backdrop-blur-md relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-4">
                <h2 className="text-xs font-mono font-semibold uppercase tracking-widest text-gold flex items-center gap-1.5">
                  <Upload className="h-3.5 w-3.5" />
                  <span>Visual Showcase</span>
                </h2>
                <span className="text-[10px] font-mono text-muted tabular-nums">
                  {images.length} asset{images.length === 1 ? '' : 's'} uploaded
                </span>
              </div>

              {/* ✅ Replace custom image upload with ImageUpload component */}
              <ImageUpload
                value={images}
                onChange={setImages}
                maxFiles={20}
                folder="torquens/vehicles/new"
                disabled={isSubmitting}
              />

              <p className="text-[10px] text-muted font-mono mt-3 text-center">
                PNG, JPG, WEBP · Up to 20MB per asset
              </p>
            </Card>

            {/* Publication Protocol Controls */}
            <Card className="p-6 bg-graphite/95 border-border/80 backdrop-blur-md space-y-4">
              <h2 className="text-xs font-mono font-semibold uppercase tracking-widest text-gold border-b border-border/40 pb-3">
                Publication Protocol
              </h2>

              <div className="space-y-2">
                <label className="block text-xs font-sans text-secondary">Registry Visibility State</label>
                <select
                  {...register('status')}
                  disabled={isSubmitting}
                  className="w-full h-10 px-3 rounded-md bg-inset border border-border text-xs font-mono uppercase tracking-wider text-primary focus:outline-none focus:border-gold"
                >
                  <option value="PUBLISHED">Live Public Showroom</option>
                  <option value="PENDING_REVIEW">Pending Compliance Review</option>
                  <option value="DRAFT">Internal Custodian Draft</option>
                </select>
              </div>

              {/* Submit CTA */}
              <Button
                type="submit"
                variant="gold"
                size="lg"
                fullWidth
                isLoading={isSubmitting}
                loadingText="Writing to Vault..."
                className="mt-2 text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.25)] h-12"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Publish Allocation</span>
              </Button>

              <div className="pt-2 text-[10px] text-muted font-sans leading-relaxed border-t border-border/40 text-center">
                By publishing this asset, you confirm provenance authenticity and authority to broker the listed chassis.
              </div>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}