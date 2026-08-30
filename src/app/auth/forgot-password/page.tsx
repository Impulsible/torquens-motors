'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Mail,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { forgotPassword } from '@/actions/auth';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append('email', data.email);

      const result = await forgotPassword(null, formData);

      if (result?.success) {
        setSubmittedEmail(data.email);
        setSuccess(
          result.message ||
            'A secure password recovery key has been dispatched to your inbox.'
        );
      } else {
        setError(
          result?.message ||
            'Unable to process recovery request. Please verify your email address.'
        );
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      setError('An unexpected security error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetForm = () => {
    setSuccess(null);
    setError(null);
    setSubmittedEmail('');
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 overflow-hidden bg-obsidian selection:bg-gold selection:text-obsidian">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* AMBIENT LIGHTING & BACKGROUND EFFECTS                         */}
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
      {/* MAIN CARD CONTAINER                                           */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-md">
        {/* Header Badge & Title */}
        <div className="flex flex-col items-center text-center mb-8 space-y-2">
          <Badge variant="gold" size="sm" className="mb-1">
            <span className="inline-flex items-center gap-1.5">
              <KeyRound className="h-3 w-3" />
              Account Security Protocol
            </span>
          </Badge>

          <h1 className="font-serif text-3xl sm:text-4xl font-light tracking-tight text-primary">
            Key Recovery
          </h1>
          <p className="text-xs sm:text-sm text-secondary font-sans max-w-xs leading-relaxed">
            Enter your registered client email to receive your password reset authorization.
          </p>
        </div>

        <Card className="p-6 sm:p-8 bg-graphite border-border shadow-card relative overflow-hidden backdrop-blur-md">
          {/* Subtle Top Gold Stroke Highlight */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-gold to-transparent" />

          {/* Feedback Banners */}
          {error && (
            <div
              role="alert"
              className="mb-6 flex items-start gap-3 p-3.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs leading-relaxed animate-in fade-in duration-200"
            >
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form vs Success Dispatch Views */}
          {!success ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Registered Email Address"
                type="email"
                autoComplete="email"
                autoFocus
                placeholder="client@domain.com"
                leftIcon={<Mail className="h-4 w-4 text-muted" />}
                {...register('email')}
                error={errors.email?.message}
                disabled={isLoading}
              />

              <Button
                type="submit"
                variant="gold"
                fullWidth
                isLoading={isLoading}
                className="mt-2 py-3.5 text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 group"
              >
                <span>Dispatch Recovery Link</span>
                {!isLoading && (
                  <ArrowRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                )}
              </Button>
            </form>
          ) : (
            /* Confirmation Dispatch View */
            <div className="py-2 text-center space-y-5 animate-in fade-in duration-300">
              <div className="w-14 h-14 rounded-2xl bg-emerald/10 border border-emerald/30 flex items-center justify-center text-emerald mx-auto">
                <CheckCircle2 size={28} />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xl font-serif font-light text-primary">
                  Authorization Key Dispatched
                </h3>
                <p className="text-xs text-secondary font-sans leading-relaxed max-w-sm mx-auto">
                  We have sent instructions to{' '}
                  <strong className="text-gold font-mono">{submittedEmail}</strong>.
                  Please check your inbox and follow the link to establish your new security key.
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleResetForm}
                  className="text-xs py-2.5 text-muted hover:text-primary flex items-center justify-center gap-1.5"
                >
                  <RotateCcw size={13} />
                  <span>Resend to Different Address</span>
                </Button>
              </div>
            </div>
          )}

          {/* Back to Login Anchor */}
          <div className="mt-8 pt-5 border-t border-border/80 text-center">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-1.5 text-xs font-sans text-secondary hover:text-gold transition-colors font-medium"
            >
              <ArrowLeft size={14} />
              <span>Return to Client Portal</span>
            </Link>
          </div>
        </Card>

        {/* Security & Encryption Micro-Footer */}
        <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-muted font-sans select-none">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald" />
          <span>256-Bit SSL Encrypted Recovery Gateway</span>
        </div>
      </div>
    </div>
  );
}