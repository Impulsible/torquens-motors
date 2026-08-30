/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  User as UserIcon,
  Mail,
  Phone,
  Camera,
  Save,
  ShieldCheck,
  Sparkles,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Clock,
  Globe2,
  Loader2,
} from 'lucide-react';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(60),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(6, 'Please provide a valid contact number').optional().or(z.literal('')),
  location: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States
  const [profileData, setProfileData] = useState<any>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      location: '',
    },
  });

  // 1. Fetch Real-time Profile Data
  const fetchProfileData = async () => {
    try {
      setIsFetching(true);
      const res = await fetch('/api/user/profile');
      const json = await res.json();
      
      if (res.ok && json.success) {
        setProfileData(json.data);
        reset({
          name: json.data.name,
          email: json.data.email,
          phone: json.data.phone || '',
          location: json.data.location || '',
        });
      } else {
        setError(json.message || 'Failed to retrieve profile data.');
      }
    } catch {
      setError('A network exception occurred while fetching your profile.');
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [reset]);

  // 2. Form Submit Handler
  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    setSuccess(null);
    setError(null);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to update client profile records.');
      }

      // Synchronize with NextAuth Session Storage
      await updateSession({
        ...session,
        user: {
          ...session?.user,
          name: data.name,
        },
      });

      setSuccess('Client dossier updated and re-verified.');
      setProfileData((prev: any) => ({ ...prev, ...result.data }));
      reset(data); // reset form dirty state with new data
    } catch (err: any) {
      setError(err?.message || 'An error occurred during synchronization.');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Avatar Upload Handler
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side payload size validation (Max 4MB)
    if (file.size > 4 * 1024 * 1024) {
      setError('File size exceeds the 4MB limit.');
      return;
    }

    setIsUploading(true);
    setSuccess(null);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/user/profile/avatar', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to complete image upload.');
      }

      // Update Local State UI
      setProfileData((prev: any) => ({ ...prev, avatar: data.url }));

      // Sync Avatar URL with NextAuth Session
      await updateSession({
        ...session,
        user: {
          ...session?.user,
          image: data.url,
        },
      });

      setSuccess('Avatar credentials updated successfully.');
    } catch (err: any) {
      setError(err?.message || 'Failed to upload profile photo.');
    } finally {
      setIsUploading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="h-10 w-10 text-gold animate-spin" />
        <p className="text-xs text-muted font-mono uppercase tracking-widest">
          Loading Client Dossier...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <Badge variant="gold" size="sm" className="mb-2">
            Verified Client Dossier
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-serif font-light text-primary tracking-tight">
            Account Credentials
          </h1>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-muted bg-charcoal/60 px-3.5 py-1.5 rounded-full border border-border/80 w-fit">
          <Clock className="h-3.5 w-3.5 text-gold" />
          <span>Last Security Audit: Today</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Client Dossier Badge & Credentials (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6 bg-graphite/95 border-border/80 shadow-dropdown text-center relative overflow-hidden">
            {/* Ambient Background Accent */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-gold/5 rounded-full blur-2xl pointer-events-none" />

            <div className="relative inline-block mx-auto mb-4">
              <div className="w-24 h-24 rounded-full bg-gold/15 border-2 border-gold/40 flex items-center justify-center overflow-hidden shadow-glow">
                {profileData?.avatar ? (
                  <img
                    src={profileData.avatar}
                    alt={profileData?.name || 'Client Avatar'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-serif text-gold">
                    {profileData?.name?.[0]?.toUpperCase() || 'C'}
                  </span>
                )}

                {/* Overlaid upload loader spinner */}
                {isUploading && (
                  <div className="absolute inset-0 bg-obsidian/75 flex items-center justify-center backdrop-blur-xs">
                    <Loader2 className="h-6 w-6 text-gold animate-spin" />
                  </div>
                )}
              </div>

              {/* Hidden File Input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                className="hidden"
                disabled={isUploading}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                aria-label="Upload new dossier portrait"
                className="absolute bottom-0 right-0 p-2 rounded-full bg-gold text-obsidian hover:bg-gold-hover transition-transform hover:scale-105 shadow-md disabled:opacity-50"
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>

            <h2 className="text-lg font-serif text-primary">
              {profileData?.name || 'Private Client'}
            </h2>
            <p className="text-xs text-muted font-mono mt-1">{profileData?.email}</p>

            <div className="flex items-center justify-center gap-2 mt-4">
              <Badge variant="gold" size="sm" leftIcon={<ShieldCheck className="h-3.5 w-3.5" />}>
                {profileData?.role === 'CUSTOMER' ? 'Tier 1 Verified' : profileData?.role}
              </Badge>
            </div>

            {/* Dossier Meta Stats */}
            <div className="mt-6 pt-6 border-t border-border/60 grid grid-cols-2 gap-3 text-left">
              <div className="p-3 bg-charcoal/50 rounded border border-border/40">
                <span className="block text-[10px] font-mono text-muted uppercase">Allocations</span>
                <span className="text-sm font-serif text-primary">3 Active</span>
              </div>
              <div className="p-3 bg-charcoal/50 rounded border border-border/40">
                <span className="block text-[10px] font-mono text-muted uppercase">Member Since</span>
                <span className="text-sm font-serif text-primary">2023</span>
              </div>
            </div>
          </Card>

          {/* Quick Concierge Support Card */}
          <Card className="p-5 bg-charcoal/40 border-border/60">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-gold shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-medium text-primary">Dedicated Account Liaison</p>
                <p className="text-muted mt-1 leading-relaxed">
                  For allocation amendments, custom vehicle sourcing, or discrete acquisitions, contact your private representative.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Editable Profile & Protocol Settings (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="p-6 sm:p-8 bg-graphite/95 border-border/80 shadow-dropdown">
            <h2 className="text-lg font-serif font-light text-primary mb-2">
              Personal Information
            </h2>
            <p className="text-xs text-secondary mb-6 font-sans">
              Ensure contact information matches your registered legal documentation for escrow agreements.
            </p>

            {success && (
              <div className="mb-6 flex items-start gap-2.5 p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-md text-xs font-sans animate-fade-in">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            {error && (
              <div className="mb-6 flex items-start gap-2.5 p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-md text-xs font-sans animate-fade-in">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input
                label="Full Legal Name"
                placeholder="Lord Harrison Sterling"
                leftIcon={<UserIcon className="h-4 w-4" />}
                {...register('name')}
                error={errors.name?.message}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Registered Email (Immutable)"
                  type="email"
                  placeholder="client@torquens.com"
                  leftIcon={<Mail className="h-4 w-4" />}
                  {...register('email')}
                  disabled
                  helper="Contact concierge to adjust primary email"
                />

                <Input
                  label="Primary Phone"
                  type="tel"
                  placeholder="+44 20 7946 0991"
                  leftIcon={<Phone className="h-4 w-4" />}
                  {...register('phone')}
                  error={errors.phone?.message}
                />
              </div>

              <Input
                label="Jurisdiction / Primary Residence"
                placeholder="Mayfair, London, United Kingdom"
                leftIcon={<Globe2 className="h-4 w-4" />}
                {...register('location')}
                error={errors.location?.message}
              />

              <div className="pt-2 flex items-center justify-end">
                <Button
                  type="submit"
                  variant="gold"
                  isLoading={isLoading}
                  disabled={!isDirty || isLoading}
                  leftIcon={<Save className="h-4 w-4" />}
                >
                  Save Dossier
                </Button>
              </div>
            </form>
          </Card>

          {/* Security & Authentication Protocol Box */}
          <Card className="p-6 sm:p-8 bg-graphite/95 border-border/80 shadow-dropdown">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/60">
              <div>
                <h3 className="text-base font-serif text-primary">Vault Security Key</h3>
                <p className="text-xs text-muted mt-1 font-sans">
                  Manage the cryptographic key used to authenticate into your private vault.
                </p>
              </div>
              <Link href="/auth/change-password">
                <Button variant="secondary" size="sm" leftIcon={<KeyRound className="h-3.5 w-3.5" />}>
                  Change Key
                </Button>
              </Link>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-serif text-primary">Two-Factor Authentication (2FA)</h3>
                <p className="text-xs text-muted mt-1 font-sans">
                  Hardware token or authenticator verification on each acquisition request.
                </p>
              </div>
              <Badge variant="success" size="sm">
                Enforced (Active)
              </Badge>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}