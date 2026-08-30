/* eslint-disable react-hooks/incompatible-library */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, Suspense, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Compass,
  FileCheck2,
  LockKeyhole,
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { register as registerAction } from '@/actions/auth';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name cannot exceed 50 characters'),
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().optional(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Please confirm your password'),
    termsAccepted: z.boolean().refine((val) => val === true, {
      message: 'You must accept the Terms of Protocol and Privacy Policy',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegistrationResponse {
  success: boolean;
  message?: string;
  email?: string;
  data?: unknown;
}

// Curated membership pillars for client registry
const REGISTRY_PRIVILEGES = [
  {
    icon: Compass,
    title: 'Off-Market Sourcing',
    desc: 'Direct allocation access to unlisted hypercars and historic competition chassis.',
  },
  {
    icon: FileCheck2,
    title: 'Verified Provenance',
    desc: 'Digital cryptographic authentication of ownership history and service records.',
  },
  {
    icon: LockKeyhole,
    title: 'Private Escrow Protocol',
    desc: 'Confidential multi-currency transaction execution with sovereign vault custody.',
  },
];

function RegisterContent() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ message: string; email?: string } | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [activePrivilege, setActivePrivilege] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActivePrivilege((prev) => (prev + 1) % REGISTRY_PRIVILEGES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      termsAccepted: false,
    },
    mode: 'onTouched',
  });

  const termsAccepted = watch('termsAccepted');

  const onSubmit = async (data: RegisterFormData) => {
    setAuthError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      if (data.phone) formData.append('phone', data.phone);
      formData.append('password', data.password);
      formData.append('confirmPassword', data.confirmPassword);

      const result = (await registerAction(null, formData)) as RegistrationResponse | undefined;

      if (result?.success) {
        setSuccess({
          message: result.message || 'Vault credentials registered successfully. Please verify your email.',
          email: result.email || data.email,
        });

        if (result.data && typeof result.data === 'object' && 'token' in result.data) {
          const typedData = result.data as { token?: string };
          if (typedData.token) {
            setToken(typedData.token);
          }
        }
      } else {
        setAuthError(result?.message || 'Registration failed. Please review your credentials.');
      }
    } catch (err: unknown) {
      console.error('Registration exception:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'An unexpected error occurred. Please contact support.';
      setAuthError(errorMessage);
    }
  };

  const handleOAuthSignIn = (provider: 'google' | 'apple') => {
    router.push(`/api/auth/signin/${provider}`);
  };

  const handleVerifyClick = async () => {
    if (!token) return;
    try {
      const response = await fetch(`/api/auth/verify?token=${token}`);
      const data = (await response.json()) as { success?: boolean; message?: string };
      alert(data.message || 'Verification attempted');
      if (data.success) {
        router.push('/auth/login');
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Unknown dynamic verification error';
      alert('Error: ' + errMsg);
    }
  };

  /* ───────────────────────────────────────────────────────────── */
  /* SUCCESS VIEW                                                  */
  /* ───────────────────────────────────────────────────────────── */
  if (success) {
    return (
      <div className="relative min-h-screen flex items-center justify-center px-4 py-16 pb-28 sm:px-6 lg:px-8 overflow-hidden bg-obsidian text-primary">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-160 h-160 bg-gold/5 blur-[140px] rounded-full"
        />

        <div className="relative z-10 w-full max-w-md animate-slide-up">
          <div className="p-8 sm:p-10 rounded-2xl bg-graphite/95 border border-border/80 text-center shadow-dropdown backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-gold to-transparent" />

            <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto mb-6 shadow-glow">
              <CheckCircle2 className="h-8 w-8 text-gold" />
            </div>

            <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/20">
              <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-gold">
                Application Approved
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif font-light text-primary mb-3">
              Vault Access Initialized
            </h1>

            <p className="text-secondary font-sans text-sm mb-6 leading-relaxed">
              {success.message}
            </p>

            {success.email && (
              <div className="text-xs text-muted font-mono bg-charcoal/80 border border-border/60 p-3.5 rounded-md mb-6 break-all">
                Verification link dispatched to: <br />
                <span className="text-gold font-semibold mt-1 inline-block">{success.email}</span>
              </div>
            )}

            {process.env.NODE_ENV === 'development' && token && (
              <div className="mb-6 p-4 bg-charcoal/80 border border-gold/30 rounded-md">
                <p className="text-xs text-muted mb-2">🔗 Development: Click to verify</p>
                <button
                  type="button"
                  onClick={handleVerifyClick}
                  className="text-gold text-xs hover:underline w-full text-center"
                >
                  Click here to verify your email (Development Only)
                </button>
                <p className="text-[10px] text-muted mt-1 break-all">Token: {token}</p>
              </div>
            )}

            <Link href="/auth/login" className="block w-full">
              <Button variant="gold" size="lg" fullWidth rightIcon={<ArrowRight className="h-4 w-4" />}>
                Proceed to Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Console Dock */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-70 sm:max-w-sm px-4">
          <div className="flex items-center justify-between gap-4 px-4 py-2.5 rounded-full bg-obsidian/65 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all duration-500 hover:border-gold/30 group/dock">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase text-secondary hover:text-gold transition-colors duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/50 rounded-full py-0.5"
            >
              <ArrowLeft className="h-3.5 w-3.5 group-hover/dock:-translate-x-1 transition-transform duration-300" />
              <span>Showroom</span>
            </Link>
            <span className="h-3 w-px bg-white/10" aria-hidden="true" />
            <span className="text-[9px] font-mono tracking-wider text-muted select-none uppercase">
              Geneva Registry
            </span>
          </div>
        </div>
      </div>
    );
  }

  /* ───────────────────────────────────────────────────────────── */
  /* MAIN SPLIT-SCREEN VIEW                                        */
  /* ───────────────────────────────────────────────────────────── */
  return (
    <div className="relative min-h-screen bg-obsidian text-primary overflow-hidden">
      <div className="grid lg:grid-cols-2 min-h-screen">
        
        {/* ─────────────────────────────────────────────────────── */}
        {/*  LEFT — Cinematic Provenance Panel                      */}
        {/* ─────────────────────────────────────────────────────── */}
        <div className="relative hidden lg:flex flex-col justify-between p-12 xl:p-16 pb-28 xl:pb-28 overflow-hidden border-r border-border/40">
          {/* Background image of bespoke automotive craftsmanship */}
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=2070&auto=format&fit=crop"
              alt="Bespoke hypercar interior craftsmanship"
              fill
              priority
              className="object-cover object-center scale-105 animate-slow-zoom"
            />
            <div className="absolute inset-0 bg-linear-to-br from-obsidian via-obsidian/75 to-obsidian/45" />
            <div className="absolute inset-0 bg-linear-to-t from-obsidian via-transparent to-transparent" />
            <div className="absolute inset-0 bg-linear-to-r from-transparent to-obsidian/60" />
          </div>

          {/* Gold vertical accent bar */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-32 w-px bg-linear-to-b from-transparent via-gold to-transparent" />

          {/* Top: Brand mark */}
          <div className="relative z-10">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="h-10 w-10 rounded-sm border border-gold/40 flex items-center justify-center bg-obsidian/60 backdrop-blur-sm group-hover:border-gold transition-colors duration-500">
                <span className="font-serif text-gold text-lg">T</span>
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-serif text-xl tracking-wider text-primary">TORQUENS</span>
                <span className="text-[9px] font-mono tracking-[0.3em] text-muted uppercase mt-1">
                  Private Client Registry
                </span>
              </div>
            </Link>
          </div>

          {/* Middle: Editorial Header */}
          <div className="relative z-10 max-w-lg">
            <div className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/20">
              <Sparkles className="h-3 w-3 text-gold" />
              <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-gold">
                Membership Application
              </span>
            </div>

            <h2 className="font-serif text-4xl xl:text-5xl font-light leading-[1.1] tracking-tight text-primary mb-6">
              Privilege granted by <span className="italic text-gold">provenance.</span>
            </h2>

            <p className="text-sm xl:text-base text-secondary font-sans leading-relaxed max-w-md">
              Torquens operates as an exclusive sanctuary for tier-one automotive acquisition, confidential brokerage, and historical verification.
            </p>
          </div>

          {/* Bottom: Dynamic Registry Privileges Showcase */}
          <div className="relative z-10">
            <div className="space-y-3 pt-6 border-t border-white/10">
              <div className="text-[10px] font-mono tracking-[0.25em] uppercase text-gold/80 mb-3">
                Registry Benefits
              </div>
              <div className="grid grid-cols-3 gap-3">
                {REGISTRY_PRIVILEGES.map((item, idx) => {
                  const Icon = item.icon;
                  const isActive = idx === activePrivilege;
                  return (
                    <div
                      key={item.title}
                      className={`p-3.5 rounded-lg border transition-all duration-700 ${
                        isActive
                          ? 'bg-graphite/80 border-gold/40 shadow-sm'
                          : 'bg-obsidian/40 border-white/5 opacity-60'
                      }`}
                    >
                      <Icon className={`h-4 w-4 mb-2 ${isActive ? 'text-gold' : 'text-muted'}`} />
                      <div className="text-xs font-serif text-primary mb-1">{item.title}</div>
                      <div className="text-[10px] text-muted leading-snug line-clamp-2">{item.desc}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────── */}
        {/*  RIGHT — Registration Form Panel                        */}
        {/* ─────────────────────────────────────────────────────── */}
        <div className="relative flex items-center justify-center px-6 py-16 pb-28 sm:px-12 lg:px-16 xl:px-20 overflow-y-auto">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-1/3 right-0 w-96 h-96 bg-gold/3 blur-[120px] rounded-full"
          />

          <div className="relative w-full max-w-md animate-fade-in my-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px w-8 bg-gold" />
                <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-gold">
                  Registry Access
                </span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl font-light tracking-tight text-primary mb-2">
                Request Private Vault
              </h1>
              <p className="text-xs sm:text-sm text-secondary font-sans leading-relaxed">
                Establish your client credentials to access reserved vehicles and private auctions.
              </p>
            </div>

            {/* Error Banner */}
            {authError && (
              <div
                role="alert"
                className="mb-6 flex items-start gap-3 p-3.5 rounded-md bg-red-500/8 border-l-2 border-red-500/60 text-red-400 text-xs leading-relaxed animate-fade-in"
              >
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
              <Input
                label="Full Legal Name"
                placeholder="e.g. Harrison Sterling"
                autoComplete="name"
                leftIcon={<User className="h-4 w-4 text-muted" />}
                {...register('name')}
                error={errors.name?.message}
                disabled={isSubmitting}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="client@torquens.com"
                  autoComplete="email"
                  leftIcon={<Mail className="h-4 w-4 text-muted" />}
                  {...register('email')}
                  error={errors.email?.message}
                  disabled={isSubmitting}
                  required
                />

                <Input
                  label="Phone (Optional)"
                  type="tel"
                  placeholder="+44 20 7946 0991"
                  autoComplete="tel"
                  leftIcon={<Phone className="h-4 w-4 text-muted" />}
                  {...register('phone')}
                  error={errors.phone?.message}
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Security Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  leftIcon={<Lock className="h-4 w-4 text-muted" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                      className="text-muted hover:text-gold transition-colors focus:outline-none p-0.5 rounded"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }
                  {...register('password')}
                  error={errors.password?.message}
                  disabled={isSubmitting}
                  required
                />

                <Input
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  leftIcon={<ShieldCheck className="h-4 w-4 text-muted" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      tabIndex={-1}
                      className="text-muted hover:text-gold transition-colors focus:outline-none p-0.5 rounded"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }
                  {...register('confirmPassword')}
                  error={errors.confirmPassword?.message}
                  disabled={isSubmitting}
                  required
                />
              </div>

              {/* Terms Checkbox */}
              <div className="pt-2">
                <label className="group flex items-start gap-3 cursor-pointer select-none">
                  <div className="relative flex items-center justify-center mt-0.5">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={termsAccepted}
                      onChange={(e) => setValue('termsAccepted', e.target.checked, { shouldValidate: true })}
                      disabled={isSubmitting}
                    />
                    <div
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === ' ' || e.key === 'Enter') {
                          e.preventDefault();
                          setValue('termsAccepted', !termsAccepted, { shouldValidate: true });
                        }
                      }}
                      role="checkbox"
                      aria-checked={termsAccepted}
                      className={`h-4 w-4 rounded border transition-all duration-200 flex items-center justify-center outline-none focus-visible:ring-1 focus-visible:ring-gold/60 ${
                        termsAccepted
                          ? 'bg-gold border-gold text-obsidian'
                          : 'bg-charcoal border-border group-hover:border-gold/50'
                      }`}
                    >
                      {termsAccepted && <ShieldCheck className="h-3 w-3 stroke-3" />}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-secondary font-sans leading-relaxed group-hover:text-primary transition-colors">
                      I accept the{' '}
                      <Link href="/terms" className="text-gold hover:text-gold-hover transition-colors">
                        Terms of Protocol
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" className="text-gold hover:text-gold-hover transition-colors">
                        Privacy Policy
                      </Link>
                      .
                    </span>
                    {errors.termsAccepted && (
                      <span className="text-xs text-red-400 mt-1 animate-fade-in">
                        {errors.termsAccepted.message}
                      </span>
                    )}
                  </div>
                </label>
              </div>

              <Button
                type="submit"
                variant="gold"
                size="lg"
                fullWidth
                isLoading={isSubmitting}
                className="mt-4 text-xs uppercase tracking-[0.2em] font-semibold flex items-center justify-center gap-2 group h-12"
              >
                <span>Establish Private Vault</span>
                {!isSubmitting && (
                  <ArrowRight
                    size={15}
                    className="group-hover:translate-x-1 transition-transform duration-300"
                  />
                )}
              </Button>
            </form>

            {/* OAuth Options */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-obsidian px-4 text-[10px] font-mono uppercase tracking-[0.25em] text-muted">
                  Or authenticate with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleOAuthSignIn('google')}
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 h-10 rounded-md border border-border/70 bg-graphite/30 hover:bg-graphite/60 hover:border-gold/30 transition-all duration-300 text-xs font-medium text-secondary hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/40"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={() => handleOAuthSignIn('apple')}
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 h-10 rounded-md border border-border/70 bg-graphite/30 hover:bg-graphite/60 hover:border-gold/30 transition-all duration-300 text-xs font-medium text-secondary hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/40"
              >
                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.92-2.85-.9.04-2.02.6-2.66 1.35-.57.66-.99 1.74-.86 2.76 1.01.08 2-.51 2.6-.96z" />
                </svg>
                <span>Apple ID</span>
              </button>
            </div>

            {/* Existing Account Footer */}
            <div className="mt-8 pt-5 border-t border-border/40 text-center">
              <p className="text-xs text-secondary font-sans">
                Already possess vault access?{' '}
                <Link
                  href="/auth/login"
                  className="font-semibold text-gold hover:text-gold-hover transition-colors ml-1 focus-visible:outline-none focus-visible:underline"
                >
                  Authenticate here →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/*  BOTTOM CONSOLE DOCK — The Ergonomic "Showroom" Pill        */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-70 sm:max-w-sm px-4">
        <div className="flex items-center justify-between gap-4 px-4 py-2.5 rounded-full bg-obsidian/65 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all duration-500 hover:border-gold/30 group/dock">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase text-secondary hover:text-gold transition-colors duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/50 rounded-full py-0.5"
          >
            <ArrowLeft className="h-3.5 w-3.5 group-hover/dock:-translate-x-1 transition-transform duration-300" />
            <span>Showroom</span>
          </Link>

          <span className="h-3 w-px bg-white/10" aria-hidden="true" />

          <span className="text-[9px] font-mono tracking-wider text-muted select-none uppercase">
            Geneva Registry
          </span>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-obsidian">
          <Loader2 className="h-8 w-8 text-gold animate-spin" />
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}