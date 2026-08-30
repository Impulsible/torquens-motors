/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
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
  ShieldCheck,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setServerError(null);
    setSuccessMessage(null);

    try {
      // 🔐 NextAuth Client Sign-In (Sets the session cookie)
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
        // Human-readable error matching
        if (result.error === 'CredentialsSignin' || result.error.includes('Invalid')) {
          setServerError('Invalid email address or security key.');
        } else {
          setServerError(result.error);
        }
        setIsLoading(false);
        return;
      }

      // Successful Login
      setSuccessMessage('Authentication verified. Directing to your private vault...');
      
      // Refresh router cache so dashboard server components pick up the new session
      router.refresh();
      
      setTimeout(() => {
        router.push(result.url || callbackUrl);
      }, 600);
    } catch (err: any) {
      console.error('Login exception:', err);
      setServerError(err?.message || 'Failed to authenticate. Please check your network.');
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = (provider: 'google' | 'github') => {
    signIn(provider, { callbackUrl });
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 overflow-hidden bg-obsidian selection:bg-gold selection:text-obsidian">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* BACKGROUND AMBIENCE & METALLIC LIGHTING                      */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-87.5 bg-gold/5 blur-[140px] rounded-full"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 checkerboard-bg opacity-[0.03]"
      />

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MAIN AUTHENTICATION CARD                                      */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-md animate-slide-up">
        {/* Brand Crest Header */}
        <div className="flex flex-col items-center text-center mb-8 space-y-2">
          <Badge variant="gold" size="sm" className="mb-1">
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="h-3 w-3" />
              Private Client Registry
            </span>
          </Badge>

          <h1 className="font-serif text-3xl sm:text-4xl font-light tracking-tight text-primary">
            Welcome Back
          </h1>
          <p className="text-xs sm:text-sm text-secondary font-sans max-w-xs leading-relaxed">
            Sign in to access your portfolio, reserved allocations, and concierge inquiries.
          </p>
        </div>

        <Card className="p-6 sm:p-8 bg-graphite/95 border-border/80 shadow-dropdown relative overflow-hidden backdrop-blur-md">
          {/* Gold Accent Bar */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-gold to-transparent" />

          {/* Feedback Banners */}
          {serverError && (
            <div
              role="alert"
              className="mb-6 flex items-start gap-3 p-3.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs leading-relaxed animate-fade-in"
            >
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          {successMessage && (
            <div
              role="status"
              className="mb-6 flex items-start gap-3 p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs leading-relaxed animate-fade-in"
            >
              <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Core Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              autoComplete="email"
              placeholder="client@torquens.com"
              leftIcon={<Mail className="h-4 w-4" />}
              {...register('email')}
              error={errors.email?.message}
              disabled={isLoading}
              required
            />

            <div className="space-y-1.5">
              <Input
                label="Security Password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••••••"
                leftIcon={<Lock className="h-4 w-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                    className="text-muted hover:text-gold transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
                {...register('password')}
                error={errors.password?.message}
                disabled={isLoading}
                required
              />
            </div>

            {/* Checkbox & Recovery Row */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none group">
                <input
                  type="checkbox"
                  {...register('rememberMe')}
                  disabled={isLoading}
                  className="h-4 w-4 rounded bg-inset border-border text-gold focus:ring-1 focus:ring-gold/40 focus:ring-offset-obsidian cursor-pointer transition-colors accent-gold"
                />
                <span className="font-sans text-secondary group-hover:text-primary transition-colors">
                  Remember session
                </span>
              </label>

              <Link
                href="/auth/forgot-password"
                className="font-sans text-gold hover:text-gold-hover transition-colors font-medium"
              >
                Forgot key?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="gold"
              size="lg"
              fullWidth
              isLoading={isLoading}
              className="mt-2 text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 group"
            >
              <span>Authenticate Access</span>
              {!isLoading && (
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              )}
            </Button>
          </form>

          {/* Social OAuth Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/70" />
            </div>
            <span className="relative bg-graphite px-3 text-[10px] font-mono uppercase tracking-widest text-muted">
              Or authenticate via
            </span>
          </div>

          {/* OAuth Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => handleOAuthSignIn('google')}
              disabled={isLoading}
              className="w-full text-xs font-normal border-border hover:border-gold/40"
              leftIcon={
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              }
            >
              Google
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => handleOAuthSignIn('github')}
              disabled={isLoading}
              className="w-full text-xs font-normal border-border hover:border-gold/40"
              leftIcon={
                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              }
            >
              GitHub
            </Button>
          </div>

          {/* Registration Footer Link */}
          <div className="mt-8 pt-5 border-t border-border/60 text-center space-y-2">
            <p className="text-xs font-sans text-secondary">
              Require vault credentials?{' '}
              <Link
                href="/auth/register"
                className="font-semibold text-gold hover:text-gold-hover transition-colors ml-1"
              >
                Apply for private access
              </Link>
            </p>
          </div>
        </Card>

        {/* Security Badge */}
        <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] font-sans text-muted select-none">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>Encrypted 256-Bit SSL Private Vault Connection</span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-obsidian">
          <Loader2 className="h-8 w-8 text-gold animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}