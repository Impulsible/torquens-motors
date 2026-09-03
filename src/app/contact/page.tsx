/* eslint-disable react-hooks/incompatible-library */
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Sparkles,
  ShieldCheck,
  Send,
  Building2,
  Globe2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Compass,
  Lock,
} from 'lucide-react';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/utils/cn';
import { contactSchema, type ContactFormData } from '@/types/contact';
import { submitContactInquiry } from '@/actions/contact';

// ─────────────────────────────────────────────────────────────
// CONCIERGE GLOBAL HUBS
// ─────────────────────────────────────────────────────────────
const GLOBAL_DESKS = [
  {
    city: 'Geneva',
    country: 'Switzerland',
    region: 'Central European Custody & Escrow',
    address: 'Rue du Rhône 42, 1204 Genève',
    phone: '+41 22 819 9200',
    email: 'geneva@torquens.com',
    hours: '08:30 – 19:00 CET',
    isHQ: true,
  },
  {
    city: 'London',
    country: 'United Kingdom',
    region: 'Mayfair Private Brokerage',
    address: '14 Berkeley Square, London W1J 6BL',
    phone: '+44 20 7946 0800',
    email: 'mayfair@torquens.com',
    hours: '09:00 – 18:30 GMT',
    isHQ: false,
  },
  {
    city: 'Dubai',
    country: 'United Arab Emirates',
    region: 'DIFC Middle East & Asia Desk',
    address: 'Gate Village, Building 03, DIFC, Dubai',
    phone: '+971 4 362 7000',
    email: 'dubai@torquens.com',
    hours: '10:00 – 20:00 GST',
    isHQ: false,
  },
];

const INQUIRY_CLASSIFICATIONS: { value: ContactFormData['inquiryType']; label: string; desc: string }[] = [
  {
    value: 'BESPOKE_SOURCING',
    label: 'Bespoke Sourcing',
    desc: 'Unlisted allocations & historical competition chassis',
  },
  {
    value: 'CONSIGNMENT_APPRAISAL',
    label: 'Asset Consignment',
    desc: 'Discreet vault valuation & private placement',
  },
  {
    value: 'PRIVATE_VIEWING',
    label: 'Private Viewing',
    desc: 'Showroom or secure facility appointments',
  },
  {
    value: 'ESCROW_LOGISTICS',
    label: 'Escrow & Cross-Border Transport',
    desc: 'Air-freight logistics & tax/title compliance',
  },
  {
    value: 'GENERAL_CONCIERGE',
    label: 'General Inquiries',
    desc: 'Platform relations & private registry accounts',
  },
];

export default function ContactPage() {
  const { showToast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      inquiryType: 'BESPOKE_SOURCING',
      preferredChannel: 'EMAIL',
      targetAsset: '',
      message: '',
    },
  });

  const selectedInquiryType = watch('inquiryType');
  const selectedChannel = watch('preferredChannel');

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast({
      type: 'info',
      title: 'Copied to Clipboard',
      message: `${label} copied: ${text}`,
    });
  };

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const response = await submitContactInquiry(data);

      if (response.success) {
        setSubmittedSuccess(true);
        showToast({
          type: 'success',
          title: 'Transmission Received',
          message: 'Your inquiry has been assigned to a senior concierge broker.',
        });
        reset();
      } else {
        setServerError(response.message || 'Unable to dispatch confidential transmission.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setServerError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-obsidian text-primary selection:bg-gold selection:text-obsidian pt-24 pb-20 overflow-hidden">
      {/* Ambient Lighting */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-160 h-96 bg-gold/5 blur-[140px] rounded-full"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 checkerboard-bg opacity-[0.02]"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* HERO SECTION */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-8 border-b border-border/40">
          <div className="max-w-3xl space-y-4">
            <Badge variant="gold" size="sm">
              <span className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest">
                <Sparkles className="h-3 w-3" />
                Private Concierge Desk
              </span>
            </Badge>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-light tracking-tight text-primary leading-[1.08]">
              Direct Dialogue with{' '}
              <span className="italic font-normal text-gold block sm:inline">
                Private Brokerage.
              </span>
            </h1>

            <p className="text-secondary font-sans text-sm sm:text-base leading-relaxed max-w-2xl pt-1">
              Whether arranging an unlisted hypercar acquisition, discreet collection liquidation, 
              or bespoke global transport under sovereign escrow, our senior directors respond with uncompromising discretion.
            </p>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-graphite/80 border border-border/80 text-xs font-mono text-secondary self-start lg:self-auto shrink-0 shadow-sm">
            <Lock className="h-4 w-4 text-gold shrink-0" />
            <span>256-Bit Encrypted Client Ledger</span>
          </div>
        </div>

        {/* WORKSPACE GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: FORM */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="p-6 sm:p-8 bg-graphite/95 border-border/80 relative overflow-hidden backdrop-blur-md shadow-dropdown">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-gold to-transparent" />

              {submittedSuccess ? (
                <div className="py-12 px-4 text-center space-y-6 animate-fade-in">
                  <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto shadow-glow text-gold">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>

                  <div className="space-y-2 max-w-md mx-auto">
                    <h2 className="text-2xl font-serif font-light text-primary">
                      Transmission Confirmed
                    </h2>
                    <p className="text-xs sm:text-sm text-secondary font-sans leading-relaxed">
                      Your confidential instructions have been delivered to our senior desk. A dedicated director will initiate dialogue through your preferred channel within 4 business hours.
                    </p>
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Button
                      variant="gold"
                      size="md"
                      onClick={() => setSubmittedSuccess(false)}
                      className="text-xs uppercase tracking-widest font-semibold"
                    >
                      Submit Another Instruction
                    </Button>

                    <Link href="/vehicles">
                      <Button
                        variant="secondary"
                        size="md"
                        rightIcon={<Compass className="h-4 w-4" />}
                        className="text-xs uppercase tracking-widest"
                      >
                        Return to Showroom
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
                  {serverError && (
                    <div
                      role="alert"
                      className="flex items-start gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs leading-relaxed animate-fade-in"
                    >
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>{serverError}</span>
                    </div>
                  )}

                  {/* 1. Inquiry Intent Selector */}
                  <div className="space-y-2.5">
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-gold">
                      1. Nature of Transmission <span className="text-gold">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {INQUIRY_CLASSIFICATIONS.map((type) => {
                        const isSelected = selectedInquiryType === type.value;
                        return (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => setValue('inquiryType', type.value, { shouldValidate: true })}
                            className={cn(
                              'p-3 rounded-lg border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between',
                              isSelected
                                ? 'bg-gold/10 border-gold shadow-[0_0_12px_rgba(212,175,55,0.15)] text-primary'
                                : 'bg-obsidian/60 border-border/70 text-secondary hover:border-gold/30 hover:text-primary'
                            )}
                          >
                            <span className="text-xs font-serif font-normal text-primary tracking-wide">
                              {type.label}
                            </span>
                            <span className="text-[10px] text-muted font-sans leading-tight mt-1 line-clamp-1">
                              {type.desc}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Client Identity */}
                  <div className="space-y-4 pt-2">
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-gold border-t border-border/40 pt-4">
                      2. Client Credentials
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Full Legal Name"
                        placeholder="e.g. Harrison Sterling"
                        autoComplete="name"
                        {...register('name')}
                        error={errors.name?.message}
                        disabled={isSubmitting}
                        required
                      />

                      <Input
                        label="Confidential Email Address"
                        type="email"
                        placeholder="client@mayfair-holdings.co.uk"
                        autoComplete="email"
                        {...register('email')}
                        error={errors.email?.message}
                        disabled={isSubmitting}
                        required
                      />

                      <Input
                        label="Direct Telephone / Mobile"
                        type="tel"
                        placeholder="+44 20 7946 0991"
                        autoComplete="tel"
                        {...register('phone')}
                        error={errors.phone?.message}
                        disabled={isSubmitting}
                        required
                      />

                      <Input
                        label="Target Marque / Chassis (Optional)"
                        placeholder="e.g. Porsche 911 GT3 RS / Ferrari F40"
                        {...register('targetAsset')}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  {/* 3. Preferred Channel */}
                  <div className="space-y-2">
                    <label className="block text-xs font-sans text-secondary">
                      Preferred Communication Protocol
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['EMAIL', 'PHONE', 'WHATSAPP'] as const).map((channel) => {
                        const isSelected = selectedChannel === channel;
                        return (
                          <button
                            key={channel}
                            type="button"
                            onClick={() => setValue('preferredChannel', channel)}
                            className={cn(
                              'py-2 px-3 rounded-lg border text-xs font-mono uppercase tracking-wider transition-all cursor-pointer text-center',
                              isSelected
                                ? 'bg-gold/15 border-gold text-gold font-semibold shadow-sm'
                                : 'bg-obsidian/50 border-border/70 text-secondary hover:border-gold/30 hover:text-primary'
                            )}
                          >
                            {channel === 'EMAIL' && 'Encrypted Email'}
                            {channel === 'PHONE' && 'Direct Voice'}
                            {channel === 'WHATSAPP' && 'WhatsApp Desk'}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 4. Instructions */}
                  <div className="space-y-2">
                    <Textarea
                      label="Inquiry Specification & Logistics Instructions"
                      placeholder="Detail your acquisition timeline, customs clearance requirements, delivery location, or trade-in portfolio details..."
                      rows={5}
                      {...register('message')}
                      error={errors.message?.message}
                      disabled={isSubmitting}
                      required
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="space-y-3 pt-2">
                    <Button
                      type="submit"
                      variant="gold"
                      size="lg"
                      fullWidth
                      isLoading={isSubmitting}
                      className="mt-2 text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.25)] h-12"
                    >
                      {isSubmitting ? (
                        <span>Establishing Secure Relay...</span>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          <span>Dispatch Confidential Inquiry</span>
                        </>
                      )}
                    </Button>

                    <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-muted select-none">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Non-Disclosure Protocol Enforced · Zero Spam Policy</span>
                    </div>
                  </div>
                </form>
              )}
            </Card>
          </div>

          {/* RIGHT: GLOBAL DESKS */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <Globe2 className="h-4 w-4 text-gold" />
                <h2 className="text-xs font-mono uppercase tracking-widest text-primary font-semibold">
                  Global Physical Desks
                </h2>
              </div>
              <span className="text-[10px] font-mono text-muted uppercase">3 Strategic Hubs</span>
            </div>

            <div className="space-y-3.5">
              {GLOBAL_DESKS.map((hub) => (
                <Card
                  key={hub.city}
                  className="p-5 bg-graphite/90 border-border/80 hover:border-gold/30 transition-all duration-300 relative overflow-hidden backdrop-blur-md"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-serif font-light text-primary">
                            {hub.city}, {hub.country}
                          </h3>
                          {hub.isHQ && (
                            <Badge variant="gold" size="sm" className="text-[8px] py-0 px-1.5 font-mono uppercase">
                              Global HQ
                            </Badge>
                          )}
                        </div>
                        <p className="text-[11px] font-mono text-gold/80 mt-0.5">{hub.region}</p>
                      </div>

                      <div className="h-8 w-8 rounded-lg bg-obsidian border border-border/70 flex items-center justify-center shrink-0">
                        <Building2 className="h-4 w-4 text-muted" />
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-secondary font-sans pt-1 border-t border-border/30">
                      <div className="flex items-center gap-2 text-muted">
                        <MapPin className="h-3 w-3 text-gold/70 shrink-0" />
                        <span>{hub.address}</span>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <a
                          href={`tel:${hub.phone}`}
                          className="flex items-center gap-1.5 text-xs font-mono text-primary hover:text-gold transition-colors"
                        >
                          <Phone className="h-3 w-3 text-gold" />
                          <span>{hub.phone}</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => copyToClipboard(hub.phone, `${hub.city} Desk Direct Line`)}
                          className="text-muted hover:text-gold p-0.5"
                          title="Copy Direct Line"
                        >
                          <Copy size={11} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <a
                          href={`mailto:${hub.email}`}
                          className="flex items-center gap-1.5 text-xs font-sans text-muted hover:text-gold transition-colors"
                        >
                          <Mail className="h-3 w-3 text-gold" />
                          <span>{hub.email}</span>
                        </a>

                        <div className="flex items-center gap-1 text-[10px] font-mono text-muted">
                          <Clock className="h-2.5 w-2.5" />
                          <span>{hub.hours}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Card className="p-6 bg-graphite/95 border-gold/30 shadow-dropdown relative overflow-hidden backdrop-blur-md">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-gold to-transparent" />

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-gold" />
                  <h3 className="text-sm font-serif font-light text-primary">
                    Discreet Escrow Protocol
                  </h3>
                </div>
                <p className="text-xs text-secondary font-sans leading-relaxed">
                  All transactional transfers, chassis title verifications, and cross-border customs clearances are executed through insured Swiss and UK legal escrow frameworks.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}