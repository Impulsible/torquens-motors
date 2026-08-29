/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/incompatible-library */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
  KeyRound,
  ArrowRight,
} from 'lucide-react';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { FormInput } from '@/components/forms/FormInput';
import { registerSchema, type RegisterInput } from '@/utils/validators';

export default function RegisterPage() {
  const router = useRouter();
  
  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // React Hook Form Setup
  const methods = useForm<RegisterInput>({
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

  const { handleSubmit, formState: { isSubmitting }, watch, setValue } = methods;
  
  // Watch terms for custom checkbox styling
  const termsAccepted = watch('termsAccepted');

  // Submit Handler
  const onSubmit = async (_data: RegisterInput) => {
    setAuthError(null);
    try {
      // Simulating API registration delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Example API Call:
      // const res = await fetch('/api/auth/register', { method: 'POST', body: JSON.stringify(data) });
      // if (!res.ok) throw new Error('Email is already registered.');

      // Route to dashboard or verification sent page
      router.push('/dashboard?welcome=true');
    } catch (err: any) {
      setAuthError(err.message || 'Registration failed. Please contact concierge support.');
    }
  };

  const handleOAuthSignIn = (provider: 'google' | 'apple') => {
    console.log(`Initiating ${provider} registration...`);
    // signIn(provider, { callbackUrl: '/dashboard' });
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16 sm:px-6 lg:px-8 overflow-hidden bg-obsidian">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* AMBIENT LIGHTING & ATMOSPHERE                                 */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-200 bg-radial-hero opacity-50 blur-3xl" 
      />
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-250 h-75 bg-gold/5 blur-[120px] rounded-[100%]" 
      />

      {/* ───────────────────────────────────────────────────────────── */}
      {/* REGISTRATION CHASSIS                                          */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-xl animate-slide-up">
        
        {/* Header Crest */}
        <div className="flex flex-col items-center text-center mb-8">
          <Badge variant="gold" size="sm" leftIcon={<KeyRound className="h-3 w-3" />} className="mb-4">
            Private Client Application
          </Badge>
          
          <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-primary">
            Request Vault Access
          </h1>
          <p className="mt-2 text-sm text-secondary font-sans leading-relaxed max-w-md mx-auto">
            Establish your verified provenance profile to track, trade, and source world-class automotive assets.
          </p>
        </div>

        <Card variant="glass" specular ambientGlow padding="xl" className="shadow-dropdown border-border/80">
          
          {/* Global Error Banner */}
          {authError && (
            <div role="alert" className="mb-6 flex items-start gap-3 p-4 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-xs sm:text-sm leading-relaxed animate-fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
              
              {/* 1. Identity Section */}
              <div className="space-y-4">
                <span className="block text-[10px] font-sans font-semibold uppercase tracking-widest text-gold border-b border-border/40 pb-2">
                  Client Identity
                </span>
                
                <div className="grid grid-cols-1 gap-4">
                  <FormInput<RegisterInput>
                    name="name"
                    label="Full Legal Name"
                    placeholder="e.g. Lord Harrison Sterling"
                    autoComplete="name"
                    leftIcon={<User className="h-4 w-4" />}
                    requiredIndicator
                  />
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormInput<RegisterInput>
                      name="email"
                      type="email"
                      label="Email Address"
                      placeholder="client@domain.com"
                      autoComplete="email"
                      leftIcon={<Mail className="h-4 w-4" />}
                      requiredIndicator
                    />
                    
                    <FormInput<RegisterInput>
                      name="phone"
                      type="tel"
                      label="Contact Number"
                      placeholder="+44 20 7946 0991"
                      autoComplete="tel"
                      leftIcon={<Phone className="h-4 w-4" />}
                      helper="Format: +[Country Code] [Number]"
                      optionalIndicator
                    />
                  </div>
                </div>
              </div>

              {/* 2. Security Section */}
              <div className="space-y-4 pt-2">
                <span className="block text-[10px] font-sans font-semibold uppercase tracking-widest text-gold border-b border-border/40 pb-2">
                  Vault Security
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormInput<RegisterInput>
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    label="Security Key"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    leftIcon={<Lock className="h-4 w-4" />}
                    requiredIndicator
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
                  />

                  <FormInput<RegisterInput>
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    label="Confirm Key"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    leftIcon={<ShieldCheck className="h-4 w-4" />}
                    requiredIndicator
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
                  />
                </div>
              </div>

              {/* 3. Terms & Conditions */}
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
                    <div className={`h-4 w-4 rounded border transition-all duration-200 flex items-center justify-center ${
                      termsAccepted 
                        ? 'bg-gold border-gold text-obsidian' 
                        : 'bg-inset border-border group-hover:border-gold/50'
                    }`}>
                      {termsAccepted && <ShieldCheck className="h-3 w-3" />}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-secondary font-sans leading-relaxed group-hover:text-primary transition-colors">
                      I accept the <Link href="/legal/terms" className="text-gold hover:underline">Terms of Protocol</Link> and <Link href="/legal/privacy" className="text-gold hover:underline">Privacy Policy</Link>.
                    </span>
                    {methods.formState.errors.termsAccepted && (
                      <span className="text-xs text-red-400 mt-1 animate-fade-in">
                        {methods.formState.errors.termsAccepted.message}
                      </span>
                    )}
                  </div>
                </label>
              </div>

              {/* Submit Action */}
              <Button
                type="submit"
                variant="gold"
                size="lg"
                fullWidth
                isLoading={isSubmitting}
                loadingText="Securing Vault..."
                rightIcon={<ArrowRight />}
                className="mt-4"
              >
                Establish Private Vault
              </Button>
            </form>
          </FormProvider>

          {/* ───────────────────────────────────────────────────────────── */}
          {/* SSO / OAUTH ALTERNATIVES                                      */}
          {/* ───────────────────────────────────────────────────────────── */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/80" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
              <span className="bg-graphite/90 px-3 text-muted font-mono">
                Or authenticate via
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => handleOAuthSignIn('google')}
              disabled={isSubmitting}
              className="w-full text-xs font-normal"
              leftIcon={
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
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
              disabled={isSubmitting}
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

          {/* Footer Back to Login */}
          <div className="mt-8 pt-5 border-t border-border/60 text-center">
            <p className="text-xs text-secondary font-sans">
              Already possess vault access?{' '}
              <Link
                href="/auth/login"
                className="font-semibold text-gold hover:text-gold-hover gold-underline ml-1"
              >
                Authenticate here
              </Link>
            </p>
          </div>
        </Card>

        {/* Security Meta */}
        <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-muted font-sans select-none pb-12">
          <Sparkles className="h-3.5 w-3.5 text-gold/70" />
          <span>Exclusive Private Client Network</span>
        </div>
      </div>
    </div>
  );
}