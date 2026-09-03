'use client';
/* eslint-disable react-hooks/incompatible-library */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  Save,
  Trash2,
  Car,
  Gauge,
  Zap,
  Layers,
  ExternalLink,
  CheckCircle2,
  Plus,
  AlertTriangle,
  X,
} from 'lucide-react';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { VehicleImageManager } from '@/components/vehicle/VehicleImageManager';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/utils/cn';
import { updateVehicleData, deleteVehiclePermanent } from '@/actions/vehicles';

// ─────────────────────────────────────────────────────────────
// VALIDATION SCHEMA
// ─────────────────────────────────────────────────────────────
const editVehicleSchema = z.object({
  make: z.string().min(2, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z
    .number()
    .int('Year must be a whole number')
    .min(1900, 'Year must be 1900 or later')
    .max(new Date().getFullYear() + 2, 'Year cannot be more than 2 years in the future'),
  price: z.number().positive('Price must be greater than 0'),
  currency: z.string().default('NGN'),
  mileage: z.number().min(0, 'Mileage cannot be negative'),
  vin: z.string().optional(),
  bodyType: z.string().min(1, 'Body type required'),
  fuelType: z.string().min(1, 'Fuel type required'),
  transmission: z.string().min(1, 'Transmission type required'),
  drivetrain: z.string().min(1, 'Drivetrain required'),
  engine: z.string().min(1, 'Engine displacement required'),
  horsepower: z.number().positive('Must be positive').optional(),
  location: z.string().min(2, 'Asset location required'),
  description: z.string().min(20, 'Please provide at least 20 characters'),
  status: z
    .enum(['DRAFT', 'PENDING_REVIEW', 'APPROVED', 'PUBLISHED', 'SOLD', 'ARCHIVED'])
    .default('PUBLISHED'),
});

type VehicleFormData = z.infer<typeof editVehicleSchema>;

// ─────────────────────────────────────────────────────────────
// SELECT OPTIONS
// ─────────────────────────────────────────────────────────────
const BODY_TYPES = [
  'Coupe', 'Sedan', 'SUV', 'Convertible',
  'Hypercar / Targa', 'Shooting Brake', 'Speedster',
];
const FUEL_TYPES = ['Petrol', 'Electric', 'Hybrid', 'Plug-in Hybrid', 'Diesel'];
const TRANSMISSIONS = [
  'Automatic Dual-Clutch (PDK/DCT)', 'Manual',
  'Sequential Race Gearbox', 'Automatic',
];
const DRIVETRAINS = [
  'AWD (All-Wheel Drive)', 'RWD (Rear-Wheel Drive)', '4WD', 'FWD',
];
const CURRENCIES = [
  { value: 'NGN', label: '₦ NGN (Nigerian Naira)' },
  { value: 'USD', label: '$ USD (US Dollar)' },
  { value: 'EUR', label: '€ EUR (Euro)' },
  { value: 'GBP', label: '£ GBP (British Pound)' },
  { value: 'CHF', label: 'CHF (Swiss Franc)' },
];
const CURATED_EQUIPMENT_TAGS = [
  'Carbon Ceramic Brakes', 'Front Axle Lift System', 'Titanium Sports Exhaust',
  'Full Carbon Fiber Aero Package', 'Bespoke Paint-to-Sample (PTS)',
  'ClubSport Package', 'Alcantara Interior Package',
  'Burmester High-End Surround Sound', 'Magnesium Lightweight Wheels',
  'Head-Up Display', 'Full PPF Paint Protection', 'Single Owner Provenance',
];

// ─────────────────────────────────────────────────────────────
// CLIENT COMPONENT
// ─────────────────────────────────────────────────────────────
export default function EditVehicleForm({
  vehicle,
  vehicleId,
}: {
  vehicle: any;
  vehicleId: string;
}) {
  const router = useRouter();
  const { showToast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [images, setImages] = useState<string[]>(vehicle.images || []);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(
    Array.isArray(vehicle.features)
      ? vehicle.features
      : typeof vehicle.features === 'string'
        ? (() => { try { return JSON.parse(vehicle.features); } catch { return []; } })()
        : []
  );
  const [customFeatureInput, setCustomFeatureInput] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
  } = useForm<VehicleFormData>({
    resolver: zodResolver(editVehicleSchema) as any,
    defaultValues: {
      make: vehicle.make || '',
      model: vehicle.model || '',
      year: vehicle.year || new Date().getFullYear(),
      price: vehicle.price || 0,
      currency: vehicle.currency || 'NGN',
      mileage: vehicle.mileage || 0,
      vin: vehicle.vin || '',
      transmission: vehicle.transmission || '',
      fuelType: vehicle.fuelType || '',
      engine: vehicle.engine || '',
      horsepower: vehicle.horsepower || undefined,
      drivetrain: vehicle.drivetrain || '',
      bodyType: vehicle.bodyType || '',
      location: vehicle.location || '',
      description: vehicle.description || '',
      status: vehicle.status || 'PUBLISHED',
    },
  });

  const watchMake = watch('make');
  const watchModel = watch('model');
  const watchYear = watch('year');

  // ── Feature toggling ──────────────────────────────────────
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

  // ── Form submission → Server Action ───────────────────────
  const onSubmit = async (data: VehicleFormData) => {
    if (images.length === 0) {
      showToast({
        type: 'warning',
        title: 'Image Required',
        message: 'Vehicle must have at least one image.',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await updateVehicleData(vehicleId, {
        ...data,
        images,
        features: selectedFeatures,
      });

      if (result.success) {
        showToast({
          type: 'success',
          title: 'Dossier Synchronized',
          message: `${data.year} ${data.make} ${data.model} has been updated.`,
        });
        router.push('/dealer/inventory');
        router.refresh();
      } else {
        showToast({
          type: 'error',
          title: 'Update Failed',
          message: result.message || 'Failed to update vehicle record.',
        });
      }
    } catch (error) {
      console.error('[EditVehicleForm] Update error:', error);
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update vehicle record.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Delete → Server Action ────────────────────────────────
  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const result = await deleteVehiclePermanent(vehicleId);

      if (result.success) {
        showToast({
          type: 'success',
          title: 'Allocation Archived',
          message: 'Vehicle has been removed from inventory.',
        });
        router.push('/dealer/inventory');
        router.refresh();
      } else {
        showToast({
          type: 'error',
          title: 'Action Failed',
          message: result.message || 'Could not archive vehicle.',
        });
        setShowDeleteModal(false);
      }
    } catch (error) {
      console.error('[EditVehicleForm] Delete error:', error);
      showToast({
        type: 'error',
        title: 'Action Failed',
        message: 'Could not archive vehicle.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const assetHeading =
    watchMake && watchModel
      ? `${watchYear || ''} ${watchMake} ${watchModel}`
      : 'Vehicle';

  // ─────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/40">
        <div className="flex items-center gap-4">
          <Link
            href="/dealer/inventory"
            className="flex items-center justify-center h-10 w-10 rounded-lg bg-graphite/60 border border-border/80 text-secondary hover:text-gold hover:border-gold/40 transition-all"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-widest uppercase text-gold">
                Allocation Dossier
              </span>
              <span className="text-muted text-xs">•</span>
              <span className="text-xs font-mono text-muted uppercase">
                ID: #{vehicleId.slice(0, 8)}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-light text-primary tracking-tight mt-0.5">
              Edit {assetHeading}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Link href={`/vehicles/${vehicleId}`} target="_blank">
            <Button
              variant="secondary"
              size="sm"
              className="text-xs uppercase tracking-wider font-mono border-border hover:border-gold/30"
            >
              <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
              <span>Preview</span>
            </Button>
          </Link>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setShowDeleteModal(true)}
            className="text-xs uppercase tracking-wider font-mono text-red-400 hover:text-red-300 hover:border-red-500/30"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            <span>Unlist</span>
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* MAIN COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. Identity & Pricing */}
            <Card className="p-6 bg-graphite/95 border-border/80">
              <h2 className="text-xs font-mono font-semibold uppercase tracking-widest text-gold flex items-center gap-2 border-b border-border/40 pb-4 mb-5">
                <Car className="h-4 w-4" />
                <span>1. Asset Identity & Valuation</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Make" placeholder="e.g. Porsche" {...register('make')} error={errors.make?.message} disabled={isSubmitting} />
                <Input label="Model" placeholder="e.g. 911 GT3 RS" {...register('model')} error={errors.model?.message} disabled={isSubmitting} />
                <Input label="Year" type="number" placeholder="2024" {...register('year', { valueAsNumber: true })} error={errors.year?.message} disabled={isSubmitting} />
                <Input label="VIN (Optional)" placeholder="e.g. WP0AF2A99NS298112" {...register('vin')} error={errors.vin?.message} disabled={isSubmitting} />

                <div className="space-y-1.5">
                  <label className="block text-xs font-sans text-secondary">
                    Price <span className="text-gold">*</span>
                  </label>
                  <div className="flex gap-2">
                    <div className="w-28 shrink-0">
                      <select {...register('currency')} disabled={isSubmitting} className="w-full h-10 px-3 rounded-md bg-inset border border-border text-xs font-mono uppercase tracking-wider text-primary focus:outline-none focus:border-gold">
                        {CURRENCIES.map((curr) => (
                          <option key={curr.value} value={curr.value}>{curr.value}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <input type="number" step="any" placeholder="185000000" {...register('price', { valueAsNumber: true })} disabled={isSubmitting} className="w-full h-10 px-3 rounded-md bg-inset border border-border text-sm font-sans text-primary placeholder-muted focus:outline-none focus:border-gold" />
                    </div>
                  </div>
                  {errors.price && <p className="text-xs text-red-400">{errors.price.message}</p>}
                </div>

                <Input label="Mileage (km)" type="number" placeholder="1500" {...register('mileage', { valueAsNumber: true })} error={errors.mileage?.message} disabled={isSubmitting} />
              </div>
            </Card>

            {/* 2. Technical Specs */}
            <Card className="p-6 bg-graphite/95 border-border/80">
              <h2 className="text-xs font-mono font-semibold uppercase tracking-widest text-gold flex items-center gap-2 border-b border-border/40 pb-4 mb-5">
                <Gauge className="h-4 w-4" />
                <span>2. Technical Specifications</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-sans text-secondary">Body Type</label>
                  <select {...register('bodyType')} disabled={isSubmitting} className="w-full h-10 px-3 rounded-md bg-inset border border-border text-xs font-sans text-primary focus:outline-none focus:border-gold">
                    {BODY_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                  </select>
                  {errors.bodyType && <p className="text-xs text-red-400">{errors.bodyType.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-sans text-secondary">Fuel Type</label>
                  <select {...register('fuelType')} disabled={isSubmitting} className="w-full h-10 px-3 rounded-md bg-inset border border-border text-xs font-sans text-primary focus:outline-none focus:border-gold">
                    {FUEL_TYPES.map((fuel) => <option key={fuel} value={fuel}>{fuel}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-sans text-secondary">Transmission</label>
                  <select {...register('transmission')} disabled={isSubmitting} className="w-full h-10 px-3 rounded-md bg-inset border border-border text-xs font-sans text-primary focus:outline-none focus:border-gold">
                    {TRANSMISSIONS.map((tx) => <option key={tx} value={tx}>{tx}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-sans text-secondary">Drivetrain</label>
                  <select {...register('drivetrain')} disabled={isSubmitting} className="w-full h-10 px-3 rounded-md bg-inset border border-border text-xs font-sans text-primary focus:outline-none focus:border-gold">
                    {DRIVETRAINS.map((drive) => <option key={drive} value={drive}>{drive}</option>)}
                  </select>
                </div>
                <Input label="Engine" placeholder="e.g. 4.0L Naturally Aspirated Flat-6" {...register('engine')} error={errors.engine?.message} disabled={isSubmitting} />
                <Input label="Horsepower (BHP)" type="number" placeholder="e.g. 518" {...register('horsepower', { valueAsNumber: true })} error={errors.horsepower?.message} disabled={isSubmitting} />
              </div>
              <div className="mt-4">
                <Input label="Location" placeholder="e.g. Mayfair, London" {...register('location')} error={errors.location?.message} disabled={isSubmitting} />
              </div>
            </Card>

            {/* 3. Features */}
            <Card className="p-6 bg-graphite/95 border-border/80">
              <h2 className="text-xs font-mono font-semibold uppercase tracking-widest text-gold flex items-center gap-2 border-b border-border/40 pb-4 mb-4">
                <Zap className="h-4 w-4" />
                <span>3. Features & Equipment</span>
              </h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {CURATED_EQUIPMENT_TAGS.map((tag) => {
                  const isSelected = selectedFeatures.includes(tag);
                  return (
                    <button key={tag} type="button" onClick={() => toggleFeature(tag)} disabled={isSubmitting}
                      className={cn(
                        'px-3 py-1.5 rounded-full text-xs font-sans transition-all duration-200 border flex items-center gap-1.5',
                        isSelected
                          ? 'bg-gold/15 border-gold text-gold font-medium'
                          : 'bg-obsidian/60 border-border/70 text-secondary hover:border-gold/30 hover:text-primary'
                      )}
                    >
                      {isSelected && <CheckCircle2 size={12} className="text-gold" />}
                      <span>{tag}</span>
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add custom feature..."
                  value={customFeatureInput}
                  onChange={(e) => setCustomFeatureInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomFeature(); } }}
                  disabled={isSubmitting}
                  className="flex-1"
                />
                <Button type="button" variant="secondary" size="md" onClick={addCustomFeature} disabled={!customFeatureInput.trim() || isSubmitting} className="shrink-0 text-xs uppercase tracking-wider">
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add
                </Button>
              </div>
            </Card>

            {/* 4. Description */}
            <Card className="p-6 bg-graphite/95 border-border/80">
              <h2 className="text-xs font-mono font-semibold uppercase tracking-widest text-gold flex items-center gap-2 border-b border-border/40 pb-4 mb-4">
                <Layers className="h-4 w-4" />
                <span>4. Description</span>
              </h2>
              <Textarea label="Description" placeholder="Describe the vehicle in detail..." rows={6} {...register('description')} error={errors.description?.message} disabled={isSubmitting} />
            </Card>
          </div>

          {/* SIDEBAR */}
          <div className="space-y-6">
            <VehicleImageManager vehicleId={vehicleId} images={images} onUpdate={setImages} />

            <Card className="p-6 bg-graphite/95 border-border/80 space-y-4">
              <h2 className="text-xs font-mono font-semibold uppercase tracking-widest text-gold border-b border-border/40 pb-3">
                Publication Status
              </h2>
              <div className="space-y-2">
                <label className="block text-xs font-sans text-secondary">Status</label>
                <select {...register('status')} disabled={isSubmitting} className="w-full h-10 px-3 rounded-md bg-inset border border-border text-xs font-mono uppercase tracking-wider text-primary focus:outline-none focus:border-gold">
                  <option value="PUBLISHED">Published</option>
                  <option value="PENDING_REVIEW">Pending Review</option>
                  <option value="APPROVED">Approved</option>
                  <option value="DRAFT">Draft</option>
                  <option value="SOLD">Sold</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
              <Button type="submit" variant="gold" size="lg" fullWidth isLoading={isSubmitting} loadingText="Saving..." className="mt-2 text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 h-12">
                <Save className="h-4 w-4" /> Save Changes
              </Button>
              {isDirty && (
                <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono text-yellow-400 text-center">
                  <span className="h-1.5 w-1.5 rounded-full bg-yellow-400 animate-pulse" />
                  <span>You have unsaved changes</span>
                </div>
              )}
            </Card>
          </div>
        </div>
      </form>

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-obsidian/85 backdrop-blur-md transition-opacity" onClick={() => setShowDeleteModal(false)} />
          <Card className="relative z-10 w-full max-w-md p-6 sm:p-8 bg-graphite border-red-500/30 shadow-2xl space-y-6">
            <div className="flex items-start justify-between">
              <div className="h-12 w-12 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <button type="button" onClick={() => setShowDeleteModal(false)} className="text-muted hover:text-primary transition-colors p-1 rounded">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-serif font-light text-primary">Delete {assetHeading}?</h3>
              <p className="text-xs text-secondary font-sans leading-relaxed">
                This action will permanently remove this vehicle from your inventory. This cannot be undone.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Button type="button" variant="secondary" size="md" onClick={() => setShowDeleteModal(false)} disabled={isDeleting} className="flex-1 text-xs uppercase font-mono tracking-wider">
                Cancel
              </Button>
              <Button type="button" variant="danger" size="md" onClick={handleDelete} isLoading={isDeleting} className="flex-1 text-xs uppercase font-mono tracking-wider">
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}