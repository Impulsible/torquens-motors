/* eslint-disable react-hooks/incompatible-library */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  RefreshCcw,
} from 'lucide-react';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { resetPassword } from '@/actions/auth';

// ─────────────────────────────────────────────────────────────
// VALIDATION SCHEMA
// ─────────────────────────────────────────────────────────────
const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Security key must be at least 8 characters')
      .regex(/[A-Z]/, 'Must include at least one uppercase character')
      .regex(/[0-9]/, 'Must include at least one number')
      .regex(/[^A-Za-z0-9]/, 'Must include at least one special character'),
    confirmPassword: z.string().min(8, 'Please confirm your security key'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Security keys do not match',
    path: ['confirmPassword'],
  });

type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

// ─────────────────────────────────────────────────────────────
// INNER FORM COMPONENT
// ─────────────────────────────────────────────────────────────
function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  });

  const passwordValue = watch('password', '');

  // Password strength criteria calculation
  const strengthChecks = useMemo(() => {
    return [
      { label: 'Minimum 8 characters', met: passwordValue.length >= 8 },
      { label: 'One uppercase character (A-Z)', met: /[A-Z]/.test(passwordValue) },
      { label: 'One numerical digit (0-9)', met: /[0-9]/.test(passwordValue) },
      { label: 'One special symbol (!@#$%^&*)', met: /[^A-Za-z0-9]/.test(passwordValue) },
    ];
  }, [passwordValue]);

  const strengthScore = strengthChecks.filter((c) => c.met).length;

  const onSubmit = async (data: ResetPasswordInput) => {
    if (!token) {
      setError('Missing authentication token. Please request a new security link.');
      return;
    }

    setError(null);

    try {
      // 1. Try server action
      if (typeof resetPassword === 'function') {
        const formData = new FormData();
        formData.append('token', token);
        formData.append('password', data.password);
        formData.append('confirmPassword', data.confirmPassword);

        const result = await resetPassword(null, formData);

        if (result?.success) {
          setIsSuccess(true);
          return;
        } else {
          throw new Error(result?.message || 'Failed to update security credentials.');
        }
      }

      // 2. Fallback to API route if action is wired as a route handler
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: data.password }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to reset key.');

      setIsSuccess(true);
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred. Your token may have expired.');
    }
  };

  // ─────────────────────────────────────────────────────────────
  // 1. TOKEN MISSING / INVALID STATE
  // ─────────────────────────────────────────────────────────────
  if (!token) {
    return (
      <Card className="p-8 bg-graphite/95 border-red-500/30 text-center shadow-dropdown backdrop-blur-md">
        <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="h-7 w-7 text-red-400" />
        </div>

        <Badge variant="danger" size="sm" className="mb-3">
          Invalid Vault Token
        </Badge>

        <h1 className="text-2xl font-serif font-light text-primary mb-2">
          Token Required
        </h1>

        <p className="text-xs sm:text-sm text-secondary font-sans leading-relaxed mb-6">
          No cryptographic authorization token was found in your session request. Your link may be incomplete or expired.
        </p>

        <div className="space-y-3">
          <Link href="/auth/forgot-password" className="block w-full">
            <Button variant="gold" fullWidth leftIcon={<RefreshCcw className="h-4 w-4" />}>
              Request New Reset Token
            </Button>
          </Link>
          <Link href="/auth/login" className="block w-full">
            <Button variant="ghost" fullWidth className="text-xs text-muted hover:text-primary">
              Return to Vault Sign In
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 2. SUCCESS STATE
  // ─────────────────────────────────────────────────────────────
  if (isSuccess) {
    return (
      <Card className="p-8 bg-graphite/95 border-border/80 text-center shadow-dropdown backdrop-blur-md animate-scale-up">
        <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto mb-5 shadow-glow">
          <CheckCircle2 className="h-8 w-8 text-gold" />
        </div>

        <Badge variant="gold" size="sm" className="mb-3">
          Security Protocol Synchronized
        </Badge>

        <h1 className="text-2xl sm:text-3xl font-serif font-light text-primary mb-2">
          Security Key Updated
        </h1>

        <p className="text-xs sm:text-sm text-secondary font-sans leading-relaxed mb-6">
          Your vault access credentials have been securely updated. You may now authenticate with your new private security key.
        </p>

        <Link href="/auth/login" className="block w-full">
          <Button variant="gold" size="lg" fullWidth rightIcon={<ArrowRight className="h-4 w-4" />}>
            Proceed to Vault Sign In
          </Button>
        </Link>
      </Card>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 3. MAIN RESET KEY FORM
  // ─────────────────────────────────────────────────────────────
  return (
    <Card className="p-6 sm:p-8 bg-graphite/95 border-border/80 shadow-dropdown backdrop-blur-md">
      {/* Active Token Verification Indicator */}
      <div className="mb-6 p-3 rounded-md bg-charcoal/60 border border-border/70 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          <span className="text-[11px] font-mono text-muted uppercase">Authorized Token:</span>
        </div>
        <span className="text-[11px] font-mono text-gold bg-graphite px-2 py-0.5 rounded border border-border/60">
          {token.slice(0, 8)}••••{token.slice(-4)}
        </span>
      </div>

      {/* Global Error Banner */}
      {error && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-2.5 p-3.5 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-xs sm:text-sm leading-relaxed animate-fade-in"
        >
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {/* New Password */}
        <div>
          <Input
            label="New Security Key"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••••••"
            autoComplete="new-password"
            leftIcon={<Lock className="h-4 w-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="text-muted hover:text-gold transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            {...register('password')}
            error={errors.password?.message}
            required
          />

          {/* Dynamic Strength Meter */}
          {passwordValue.length > 0 && (
            <div className="mt-3 space-y-2 animate-fade-in">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-muted">Key Strength:</span>
                <span
                  className={
                    strengthScore === 4
                      ? 'text-emerald-400'
                      : strengthScore >= 2
                      ? 'text-gold'
                      : 'text-red-400'
                  }
                >
                  {strengthScore === 4
                    ? 'Vault-Grade'
                    : strengthScore >= 2
                    ? 'Moderate'
                    : 'Insufficient'}
                </span>
              </div>

              {/* Progress Bars */}
              <div className="grid grid-cols-4 gap-1.5 h-1">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`h-full rounded-full transition-all duration-300 ${
                      step <= strengthScore
                        ? strengthScore === 4
                          ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]'
                          : 'bg-gold shadow-[0_0_6px_rgba(212,175,55,0.5)]'
                        : 'bg-charcoal'
                    }`}
                  />
                ))}
              </div>

              {/* Individual Requirements List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-2">
                {strengthChecks.map((req, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-1.5 text-[10px] font-sans ${
                      req.met ? 'text-emerald-400' : 'text-muted'
                    }`}
                  >
                    <CheckCircle2
                      className={`h-3 w-3 ${req.met ? 'text-emerald-400' : 'text-muted/40'}`}
                    />
                    <span>{req.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <Input
          label="Confirm Security Key"
          type={showConfirmPassword ? 'text' : 'password'}
          placeholder="••••••••••••"
          autoComplete="new-password"
          leftIcon={<ShieldCheck className="h-4 w-4" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              tabIndex={-1}
              className="text-muted hover:text-gold transition-colors focus:outline-none"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
          {...register('confirmPassword')}
          error={errors.confirmPassword?.message}
          required
        />

        {/* Submit Action */}
        <Button
          type="submit"
          variant="gold"
          size="lg"
          fullWidth
          isLoading={isSubmitting}
          disabled={strengthScore < 4 || isSubmitting}
          rightIcon={!isSubmitting && <ArrowRight className="h-4 w-4" />}
          className="mt-2"
        >
          Re-Issue Security Key
        </Button>
      </form>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────
// LOADING SKELETON
// ─────────────────────────────────────────────────────────────
function ResetPasswordSkeleton() {
  return (
    <Card className="p-8 bg-graphite/95 border-border/80 shadow-dropdown text-center animate-pulse">
      <div className="w-12 h-12 rounded-full bg-charcoal mx-auto mb-4" />
      <div className="h-6 w-48 bg-charcoal rounded mx-auto mb-3" />
      <div className="h-4 w-64 bg-charcoal rounded mx-auto mb-6" />
      <div className="space-y-4">
        <div className="h-10 w-full bg-charcoal rounded" />
        <div className="h-10 w-full bg-charcoal rounded" />
        <div className="h-11 w-full bg-charcoal rounded" />
      </div>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN ROOT PAGE (WRAPPED IN SUSPENSE)
// ─────────────────────────────────────────────────────────────
export default function ResetPasswordPage() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16 sm:px-6 lg:px-8 overflow-hidden bg-obsidian">
      {/* Ambient Lighting Accents */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-160 h-160 bg-radial-hero opacity-40 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-200 h-60 bg-gold/5 blur-[120px] rounded-[100%]"
      />

      <div className="relative z-10 w-full max-w-md animate-slide-up">
        {/* Header Crest */}
        <div className="flex flex-col items-center text-center mb-8">
          <Badge variant="gold" size="sm" leftIcon={<KeyRound className="h-3 w-3" />} className="mb-4">
            Cryptographic Vault Protocol
          </Badge>

          <h1 className="font-serif text-3xl font-normal tracking-tight text-primary">
            Re-issue Security Key
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-secondary font-sans leading-relaxed max-w-xs mx-auto">
            Establish a high-grade security key to restore verified access to your automotive vault.
          </p>
        </div>

        {/* Suspense boundary for useSearchParams */}
        <Suspense fallback={<ResetPasswordSkeleton />}>
          <ResetPasswordForm />
        </Suspense>

        {/* Security Meta */}
        <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-muted font-sans select-none">
          <Sparkles className="h-3.5 w-3.5 text-gold/70" />
          <span>TORQUENS 256-Bit Encrypted Protocol</span>
        </div>
      </div>
    </div>
  );
}