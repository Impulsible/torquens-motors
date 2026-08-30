'use client';

import React, { useState, Suspense, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Gauge,
  Award,
  Globe2,
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

const HERITAGE_STATS = [
  { icon: Gauge, label: 'Curated Inventory', value: '247', suffix: 'Vehicles' },
  { icon: Award, label: 'Concours Winners', value: '38', suffix: 'Titles' },
  { icon: Globe2, label: 'Global Clientele', value: '19', suffix: 'Countries' },
];

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeStat, setActiveStat] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStat((prev) => (prev + 1) % HERITAGE_STATS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setServerError(null);
    setSuccessMessage(null);

    try {
      const result = await signIn('credentials', {
        email: data.email.toLowerCase().trim(),
        password: data.password.trim(),
        redirect: false,
        callbackUrl,
      });

      if (!result) {
        setServerError('An unexpected authentication error occurred.');
        setIsLoading(false);
        return;
      }

      if (result.error) {
        setServerError(
          result.error === 'CredentialsSignin' || result.error.includes('Invalid')
            ? 'Invalid email address or security key.'
            : result.error
        );
        setIsLoading(false);
        return;
      }

      setSuccessMessage('Authentication verified. Directing to your private vault...');
      router.refresh();
      setTimeout(() => router.push(result.url || callbackUrl), 600);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed.';
      setServerError(errorMessage);
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = (provider: 'google' | 'github') => {
    signIn(provider, { callbackUrl });
  };

  return (
    <div className="relative min-h-screen bg-obsidian text-primary overflow-hidden">
      {/* ═══════════════════════════════════════════════════════════ */}
      {/*  SPLIT LAYOUT WITH INTEGRATED BOTTOM DOCK                   */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div className="grid lg:grid-cols-2 min-h-screen">
        
        {/* ─────────────────────────────────────────────────────── */}
        {/*  LEFT — Cinematic Editorial Panel                       */}
        {/* ─────────────────────────────────────────────────────── */}
        <div className="relative hidden lg:flex flex-col justify-between p-12 xl:p-16 pb-28 xl:pb-28 overflow-hidden border-r border-border/40">
          {/* Background image with gradient overlay */}
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=2070&auto=format&fit=crop"
              alt="Luxury vehicle in ambient showroom lighting"
              fill
              priority
              className="object-cover object-center scale-105 animate-slow-zoom"
            />
            <div className="absolute inset-0 bg-linear-to-br from-obsidian via-obsidian/70 to-obsidian/40" />
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
                  Est. Private Register
                </span>
              </div>
            </Link>
          </div>

          {/* Middle: Editorial headline */}
          <div className="relative z-10 max-w-lg">
            <div className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/20">
              <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
              <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-gold">
                Private Access
              </span>
            </div>

            <h2 className="font-serif text-4xl xl:text-5xl font-light leading-[1.1] tracking-tight text-primary mb-6">
              Where velocity meets{' '}
              <span className="italic text-gold">provenance.</span>
            </h2>

            <p className="text-sm xl:text-base text-secondary font-sans leading-relaxed max-w-md">
              Enter the vault of the world&apos;s most discerning automotive collectors. 
              Your private allocations, concierge inquiries, and reserved commissions await.
            </p>
          </div>

          {/* Bottom: Rotating heritage stats */}
          <div className="relative z-10">
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-white/10">
              {HERITAGE_STATS.map((stat, idx) => {
                const Icon = stat.icon;
                const isActive = idx === activeStat;
                return (
                  <div
                    key={stat.label}
                    className={`transition-all duration-700 ease-out ${
                      isActive ? 'opacity-100' : 'opacity-40'
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 mb-3 transition-colors duration-700 ${
                        isActive ? 'text-gold' : 'text-muted'
                      }`}
                    />
                    <div className="font-serif text-2xl xl:text-3xl font-light text-primary tabular-nums">
                      {stat.value}
                    </div>
                    <div className="text-[10px] font-mono tracking-[0.15em] uppercase text-muted mt-1">
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────── */}
        {/*  RIGHT — Refined Authentication Panel                   */}
        {/* ─────────────────────────────────────────────────────── */}
        <div className="relative flex items-center justify-center px-6 py-16 pb-28 sm:px-12 lg:px-16 xl:px-24">
          {/* Subtle ambient glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-1/3 right-0 w-96 h-96 bg-gold/3 blur-[120px] rounded-full"
          />

          <div className="relative w-full max-w-sm animate-fade-in">
            {/* Section label */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-px w-8 bg-gold" />
                <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-gold">
                  Sign In
                </span>
              </div>

              <h1 className="font-serif text-4xl xl:text-5xl font-light tracking-tight text-primary mb-3">
                Welcome back.
              </h1>
              <p className="text-sm text-secondary font-sans leading-relaxed">
                Continue to your private client dashboard.
              </p>
            </div>

            {/* Alert banners */}
            {serverError && (
              <div
                role="alert"
                className="mb-6 flex items-start gap-3 p-3.5 rounded-md bg-red-500/8 border-l-2 border-red-500/60 text-red-400 text-xs leading-relaxed animate-fade-in"
              >
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span>{serverError}</span>
              </div>
            )}

            {successMessage && (
              <div
                role="status"
                className="mb-6 flex items-start gap-3 p-3.5 rounded-md bg-emerald-500/8 border-l-2 border-emerald-500/60 text-emerald-400 text-xs leading-relaxed animate-fade-in"
              >
                <CheckCircle2 size={15} className="shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
              <Input
                label="Email Address"
                type="email"
                autoComplete="email"
                placeholder="client@torquens.com"
                leftIcon={<Mail className="h-4 w-4 text-muted" />}
                {...register('email')}
                error={errors.email?.message}
                disabled={isLoading}
                required
              />

              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••••••"
                leftIcon={<Lock className="h-4 w-4 text-muted" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                    className="text-muted hover:text-gold transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-gold/40 p-0.5 rounded"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
                {...register('password')}
                error={errors.password?.message}
                disabled={isLoading}
                required
              />

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none group">
                  <input
                    type="checkbox"
                    {...register('rememberMe')}
                    disabled={isLoading}
                    className="h-3.5 w-3.5 rounded-sm bg-inset border-border text-gold focus:ring-1 focus:ring-gold/40 focus:ring-offset-obsidian cursor-pointer accent-gold"
                  />
                  <span className="font-sans text-secondary group-hover:text-primary transition-colors">
                    Keep me signed in
                  </span>
                </label>

                <Link
                  href="/auth/forgot-password"
                  className="font-sans text-gold hover:text-gold-hover transition-colors font-medium focus-visible:outline-none focus-visible:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                variant="gold"
                size="lg"
                fullWidth
                isLoading={isLoading}
                className="mt-4 text-xs uppercase tracking-[0.2em] font-semibold flex items-center justify-center gap-2 group h-12"
              >
                <span>Enter Private Vault</span>
                {!isLoading && (
                  <ArrowRight
                    size={15}
                    className="group-hover:translate-x-1 transition-transform duration-300"
                  />
                )}
              </Button>
            </form>

            {/* OAuth Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-obsidian px-4 text-[10px] font-mono uppercase tracking-[0.25em] text-muted">
                  Or continue with
                </span>
              </div>
            </div>

            {/* OAuth Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleOAuthSignIn('google')}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 h-11 rounded-md border border-border/70 bg-graphite/30 hover:bg-graphite/60 hover:border-gold/30 transition-all duration-300 text-xs font-medium text-secondary hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/40"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={() => handleOAuthSignIn('github')}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 h-11 rounded-md border border-border/70 bg-graphite/30 hover:bg-graphite/60 hover:border-gold/30 transition-all duration-300 text-xs font-medium text-secondary hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/40"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                <span>GitHub</span>
              </button>
            </div>

            {/* Register CTA */}
            <div className="mt-10 pt-6 border-t border-border/40">
              <p className="text-xs font-sans text-secondary text-center">
                Not yet a private client?{' '}
                <Link
                  href="/auth/register"
                  className="font-semibold text-gold hover:text-gold-hover transition-colors focus-visible:outline-none focus-visible:underline"
                >
                  Request an invitation →
                </Link>
              </p>
            </div>

            {/* Security footer */}
            <div className="mt-8 flex items-center justify-center gap-1.5 text-[10px] font-mono tracking-wider text-muted select-none">
              <ShieldCheck className="h-3 w-3 text-emerald-400/70" />
              <span>256-BIT ENCRYPTED · SOC 2 COMPLIANT</span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/*  BOTTOM CONSOLE DOCK — The Ergonomic "Showroom" Pill        */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-70 sm:max-w-sm px-4">
        <div 
          className="flex items-center justify-between gap-4 px-4 py-2.5 rounded-full 
                     bg-obsidian/65 backdrop-blur-xl border border-white/10 
                     shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all duration-500 hover:border-gold/30 group/dock"
        >
          {/* Back to Showroom Trigger */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase text-secondary hover:text-gold transition-colors duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/50 rounded-full py-0.5"
          >
            <ArrowLeft className="h-3.5 w-3.5 group-hover/dock:-translate-x-1 transition-transform duration-300" />
            <span>Showroom</span>
          </Link>

          {/* Luxury context divider */}
          <span className="h-3 w-px bg-white/10" aria-hidden="true" />

          {/* Curated Status Flag */}
          <span className="text-[9px] font-mono tracking-wider text-muted select-none uppercase">
            Geneva Registry
          </span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-obsidian">
          <Loader2 className="h-8 w-8 text-gold animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}