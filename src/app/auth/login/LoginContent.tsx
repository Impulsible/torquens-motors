/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles,
  AlertCircle 
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { loginSchema, type LoginInput } from '@/utils/validators';

export default function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  // Form State
  const [formData, setFormData] = useState<LoginInput>({
    email: '',
    password: '',
    rememberMe: false,
  });

  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Field change handler
  const handleChange = (field: keyof LoginInput, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear field-level error as user types
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (authError) setAuthError(null);
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setErrors({});

    // 1. Client-side Zod validation
    const validation = loginSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    // 2. Authentication Dispatch
    try {
      setIsLoading(true);

      // Simulating API authentication delay / NextAuth signIn
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // Example NextAuth Integration:
      // const res = await signIn('credentials', {
      //   redirect: false,
      //   email: formData.email,
      //   password: formData.password,
      // });
      // if (res?.error) throw new Error('Invalid email or security key');

      router.push(callbackUrl);
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = (provider: 'google' | 'apple') => {
    setIsLoading(true);
    // signIn(provider, { callbackUrl });
    console.log(`Initiating ${provider} authentication...`);
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 overflow-hidden bg-obsidian">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* BACKGROUND AMBIENCE & METALLIC LIGHTING                      */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-radial-hero opacity-60 blur-3xl" 
      />
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute -bottom-32 left-1/2 -translate-x-1/2 w-200 h-87.5 bg-gold/5 blur-[120px] rounded-full" 
      />

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MAIN AUTHENTICATION CHASSIS                                   */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-md animate-slide-up">
        {/* Brand Crest & Portal Badge */}
        <div className="flex flex-col items-center text-center mb-8">
          <Badge variant="gold" size="sm" leftIcon={<Sparkles className="h-3 w-3" />} className="mb-4">
            Private Client Portal
          </Badge>
          
          <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-primary">
            Welcome Back
          </h1>
          <p className="mt-2 text-sm text-secondary font-sans leading-relaxed">
            Access your private garage, active dossiers, and allocations.
          </p>
        </div>

        <Card variant="glass" specular ambientGlow className="p-6 sm:p-8 shadow-card border-border/80">
          {/* Global Error Banner */}
          {authError && (
            <div 
              role="alert" 
              className="mb-6 flex items-start gap-3 p-3.5 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-xs leading-relaxed animate-fade-in"
            >
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          {/* Core Login Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="client@mayfair-motors.com"
              error={errors.email}
              leftIcon={<Mail className="h-4 w-4" />}
              disabled={isLoading}
            />

            <Input
              label="Security Key / Password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              placeholder="••••••••••••"
              error={errors.password}
              leftIcon={<Lock className="h-4 w-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                  className="text-muted hover:text-gold transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              disabled={isLoading}
            />

            {/* Remember Me & Recovery Options */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none group">
                <input
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) => handleChange('rememberMe', e.target.checked)}
                  disabled={isLoading}
                  className="h-4 w-4 rounded bg-inset border-border text-gold focus:ring-1 focus:ring-gold/40 focus:ring-offset-obsidian cursor-pointer transition-colors accent-gold"
                />
                <span className="font-sans text-secondary group-hover:text-primary transition-colors">
                  Remember session
                </span>
              </label>

              <Link
                href="/auth/forgot-password"
                className="font-sans font-medium text-gold hover:text-gold-hover gold-underline transition-colors"
              >
                Forgot key?
              </Link>
            </div>

            {/* Primary Sign In CTA */}
            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              isLoading={isLoading}
              loadingText="Authenticating..."
              rightIcon={<ArrowRight />}
              className="mt-2"
            >
              Sign In to Dossier
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/80" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
              <span className="bg-graphite/90 px-3 text-muted font-mono">
                or authenticate via
              </span>
            </div>
          </div>

          {/* Social / SSO Options */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => handleOAuthSignIn('google')}
              disabled={isLoading}
              className="w-full text-xs font-normal"
              leftIcon={
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="currentColor"
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
              onClick={() => handleOAuthSignIn('apple')}
              disabled={isLoading}
              className="w-full text-xs font-normal"
              leftIcon={
                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.92-2.85-.9.04-2.02.6-2.66 1.35-.57.66-.99 1.74-.86 2.76 1.01.08 2-.51 2.6-.96z" />
                </svg>
              }
            >
              Apple ID
            </Button>
          </div>

          {/* Registration Footer */}
          <div className="mt-8 pt-5 border-t border-border/60 text-center">
            <p className="text-xs text-secondary font-sans">
              Not yet a private client?{' '}
              <Link
                href="/auth/register"
                className="font-semibold text-gold hover:text-gold-hover gold-underline ml-1"
              >
                Request Access
              </Link>
            </p>
          </div>
        </Card>

        {/* Security & Encryption Micro-Footer */}
        <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-muted font-sans select-none">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald" />
          <span>256-Bit SSL Encrypted Concierge Session</span>
        </div>
      </div>
    </div>
  );
}