/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Send,
  Check,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Bell,
  Tag,
  Lock,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

const benefits = [
  {
    icon: Bell,
    label: 'Off-Market Alerts',
  },
  {
    icon: Tag,
    label: 'Private Price Drops',
  },
  {
    icon: Lock,
    label: 'Exclusive Allocations',
  },
];

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      // Simulate API call — replace with real endpoint later
      await new Promise((resolve) => setTimeout(resolve, 1400));
      setSubmitted(true);
      setEmail('');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setError(null);
  };

  return (
    <section className="relative py-16 md:py-24 bg-graphite overflow-hidden">
      {/* Top & Bottom Checkerboard Rails */}
      <div className="absolute top-0 left-0 right-0 h-10 overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 checkerboard-bg opacity-15" />
        <div className="absolute inset-0 bg-linear-to-b from-graphite via-transparent to-graphite" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-10 overflow-hidden border-t border-border/40">
        <div className="absolute inset-0 checkerboard-bg opacity-15" />
        <div className="absolute inset-0 bg-linear-to-t from-graphite via-transparent to-graphite" />
      </div>

      {/* Ambient Glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-175 h-100 bg-gold/5 blur-[120px] rounded-full" />

      <div className="container-torquens relative z-10">
        <div className="max-w-3xl mx-auto">
          {/* ----------------------------------------------------------------- */}
          {/* HEADER                                                            */}
          {/* ----------------------------------------------------------------- */}
          <div className="text-center space-y-3 mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold text-[11px] font-sans font-semibold uppercase tracking-widest">
              <Sparkles size={12} />
              Private Concierge Registry
            </div>

            <h2 className="section-title">
              Receive Off-Market Allocations
            </h2>

            <p className="text-secondary text-sm md:text-base font-sans leading-relaxed max-w-xl mx-auto">
              Join collectors and verified buyers who receive private notifications
              for unlisted inventory, rare drops, and exclusive price adjustments.
            </p>
          </div>

          {/* ----------------------------------------------------------------- */}
          {/* BENEFIT CHIPS                                                     */}
          {/* ----------------------------------------------------------------- */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mb-8">
            {benefits.map((item) => {
              const Icon = item.icon;
              return (
                <span
                  key={item.label}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-obsidian/60 border border-border text-[11px] font-sans font-medium text-secondary"
                >
                  <Icon size={12} className="text-gold" />
                  {item.label}
                </span>
              );
            })}
          </div>

          {/* ----------------------------------------------------------------- */}
          {/* FORM / SUCCESS PANEL                                              */}
          {/* ----------------------------------------------------------------- */}
          <div className="relative p-6 sm:p-8 rounded-2xl bg-obsidian border border-active-border shadow-card overflow-hidden">
            {/* Top gold stroke */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-gold to-transparent" />
            <div className="pointer-events-none absolute -top-24 -right-24 w-56 h-56 bg-gold/5 rounded-full blur-3xl" />

            {!submitted ? (
              <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Email Input */}
                  <div className="relative flex-1">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError(null);
                      }}
                      placeholder="Enter your private email address..."
                      required
                      disabled={loading}
                      autoComplete="email"
                      aria-label="Email address"
                      aria-invalid={!!error}
                      className={cn(
                        'w-full bg-inset text-primary text-sm px-4 py-3.5 rounded-lg border font-sans',
                        'placeholder:text-muted transition-colors duration-200',
                        'focus:outline-none focus:border-gold',
                        'disabled:opacity-60 disabled:cursor-not-allowed',
                        error ? 'border-red-500/50' : 'border-border'
                      )}
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading || !email}
                    className={cn(
                      'btn-primary text-xs uppercase tracking-widest font-semibold',
                      'py-3.5 px-6 shrink-0 flex items-center justify-center gap-2',
                      'disabled:opacity-50 disabled:pointer-events-none'
                    )}
                  >
                    {loading ? (
                      <>
                        <Loader2 size={15} className="animate-spin text-obsidian" />
                        <span>Enrolling...</span>
                      </>
                    ) : (
                      <>
                        <span>Request Access</span>
                        <Send size={14} />
                      </>
                    )}
                  </button>
                </div>

                {/* Inline Error */}
                {error && (
                  <p className="text-xs font-sans text-red-400 text-left sm:text-center">
                    {error}
                  </p>
                )}

                {/* Trust Microcopy */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1">
                  <p className="text-[11px] text-muted font-sans">
                    Join 2,000+ collectors. No spam — unsubscribe anytime.
                  </p>
                  <p className="text-[11px] text-muted font-sans inline-flex items-center gap-1">
                    <Lock size={11} className="text-gold" />
                    Encrypted & private
                  </p>
                </div>
              </form>
            ) : (
              /* Success State */
              <div className="relative z-10 text-center py-4 space-y-4 animate-in fade-in duration-300">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald/10 border border-emerald/30 flex items-center justify-center text-emerald">
                  <CheckCircle2 size={28} />
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-xl font-serif font-light text-primary">
                    You&apos;re on the Private Registry
                  </h3>
                  <p className="text-sm text-secondary font-sans max-w-md mx-auto leading-relaxed">
                    Watch your inbox for off-market allocations, rare drops, and
                    member-only price alerts.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <Link
                    href="/vehicles"
                    className="btn-primary text-xs uppercase tracking-widest font-semibold py-3 px-5 flex items-center gap-2 group"
                  >
                    <span>Browse Inventory</span>
                    <ArrowRight
                      size={14}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </Link>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="btn-secondary text-xs uppercase tracking-widest font-medium py-3 px-5"
                  >
                    Add Another Email
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ----------------------------------------------------------------- */}
          {/* SECONDARY CONCIERGE LINK                                          */}
          {/* ----------------------------------------------------------------- */}
          <p className="text-center text-xs text-muted font-sans mt-6">
            Prefer a human specialist?{' '}
            <Link
              href="/contact"
              className="text-gold hover:text-gold-hover gold-underline font-medium"
            >
              Speak with TORQUENS Concierge
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

export default NewsletterSection;