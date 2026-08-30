/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/incompatible-library */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Send, 
  Phone, 
  Mail, 
  MessageSquare, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Car, 
  User, 
  Calendar 
} from 'lucide-react';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { FormInput } from '@/components/forms/FormInput';
import { FormSelect } from '@/components/forms/FormSelect';
import { FormTextarea } from '@/components/forms/FormTextarea';
import { enquirySchema, type EnquiryInput } from '@/utils/validators';
import { cn } from '@/utils/cn';

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                   */
/* -------------------------------------------------------------------------- */

export interface VehicleEnquiryFormProps {
  vehicleId: string;
  vehicleName: string;
  dealerName: string;
  className?: string;
  onSuccess?: () => void;
}

/* -------------------------------------------------------------------------- */
/*                          VEHICLE ENQUIRY FORM ROOT                         */
/* -------------------------------------------------------------------------- */

export function VehicleEnquiryForm({
  vehicleId,
  vehicleName,
  dealerName,
  className,
  onSuccess,
}: VehicleEnquiryFormProps) {
  const [isSuccess, setIsSuccess] = useState(false);

  // Form setup using shared Zod schema
  const methods = useForm<EnquiryInput>({
    resolver: zodResolver(enquirySchema) as any,
    defaultValues: {
      vehicleId,
      enquiryType: 'GENERAL_INQUIRY',
      name: '',
      email: '',
      phone: '',
      preferredContact: 'EMAIL',
      message: `I would like to inquire about the availability and provenance dossier for the ${vehicleName}.`,
      hasTradeIn: false,
      tradeInDetails: '',
    },
    mode: 'onTouched',
  });

  const { handleSubmit, formState: { isSubmitting }, watch, reset, setValue } = methods;
  const hasTradeIn = watch('hasTradeIn');

  const onSubmit = async (data: EnquiryInput) => {
    try {
      // API call placeholder for backend dispatch
      console.log('[VehicleEnquiryForm] Submitting concierge dossier:', {
        ...data,
        vehicleId,
      });

      // Simulate API response delay
      await new Promise((resolve) => setTimeout(resolve, 1200));

      setIsSuccess(true);
      onSuccess?.();
    } catch (error) {
      console.error('[VehicleEnquiryForm] Submission error:', error);
    }
  };

  const handleResetForm = () => {
    setIsSuccess(false);
    reset();
  };

  return (
    <Card
      variant="glass"
      specular
      ambientGlow
      padding="lg"
      className={cn('shadow-dropdown border-border/80', className)}
    >
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. HEADER (Crest & Representative Dealer Context)             */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="mb-6 space-y-2 border-b border-border/60 pb-5">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="gold" size="sm" leftIcon={<Sparkles className="h-3 w-3" />}>
            Concierge Liaison
          </Badge>
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted">
            Direct Dealer Access
          </span>
        </div>

        <h3 className="font-serif text-2xl font-normal tracking-tight text-primary">
          Inquire About Vehicle
        </h3>

        <p className="text-xs text-secondary font-sans leading-relaxed">
          Direct inquiry to <strong className="text-primary font-medium">{dealerName}</strong> regarding{' '}
          <strong className="text-gold font-medium">{vehicleName}</strong>.
        </p>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. SUCCESS CONFIRMATION STATE                                 */}
      {/* ───────────────────────────────────────────────────────────── */}
      {isSuccess ? (
        <div className="py-8 text-center space-y-4 animate-fade-in">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-emerald-bg border border-emerald-border text-emerald mx-auto shadow-[0_0_25px_-3px_rgba(16,185,129,0.3)]">
            <CheckCircle2 className="h-8 w-8 animate-bounce" />
          </div>

          <div className="space-y-1">
            <h4 className="font-serif text-2xl font-normal text-primary">
              Dossier Transmitted
            </h4>
            <p className="text-xs text-secondary font-sans leading-relaxed max-w-xs mx-auto">
              Your VIP inquiry for <strong className="text-primary">{vehicleName}</strong> has been assigned to a liaison at <strong className="text-primary">{dealerName}</strong>.
            </p>
          </div>

          <div className="pt-4 flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetForm}
              className="mx-auto"
            >
              Submit Additional Inquiry
            </Button>
            <span className="text-[10px] text-muted font-mono uppercase">
              Average response time: &lt; 2 hours
            </span>
          </div>
        </div>
      ) : (
        /* ───────────────────────────────────────────────────────────── */
        /* 3. CORE FORM INPUTS                                          */
        /* ───────────────────────────────────────────────────────────── */
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Inquiry Intent Category */}
            <FormSelect<EnquiryInput>
              name="enquiryType"
              label="Inquiry Intent"
              options={[
                { value: 'GENERAL_INQUIRY', label: 'General Inquiry & Provenance' },
                { value: 'PURCHASE_OFFER', label: 'Submit Purchase Offer' },
                { value: 'PRIVATE_VIEWING', label: 'Schedule Private Viewing' },
                { value: 'BESPOKE_SOURCING', label: 'Bespoke Sourcing Request' },
                { value: 'TRADE_IN_VALUATION', label: 'Trade-in Valuation' },
              ]}
              requiredIndicator
            />

            {/* Client Name */}
            <FormInput<EnquiryInput>
              name="name"
              label="Full Legal Name"
              placeholder="e.g. Harrison Sterling"
              leftIcon={<User className="h-4 w-4" />}
              requiredIndicator
            />

            {/* Email & Phone Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormInput<EnquiryInput>
                name="email"
                type="email"
                label="Email Address"
                placeholder="client@mayfair.com"
                leftIcon={<Mail className="h-4 w-4" />}
                requiredIndicator
              />

              <FormInput<EnquiryInput>
                name="phone"
                type="tel"
                label="Phone Number"
                placeholder="+44 20 7946 0991"
                leftIcon={<Phone className="h-4 w-4" />}
                requiredIndicator
              />
            </div>

            {/* Preferred Contact Method */}
            <FormSelect<EnquiryInput>
              name="preferredContact"
              label="Preferred Contact Channel"
              options={[
                { value: 'EMAIL', label: 'Email Correspondence' },
                { value: 'PHONE', label: 'Direct Phone Call' },
                { value: 'WHATSAPP', label: 'Encrypted WhatsApp' },
              ]}
              requiredIndicator
            />

            {/* Trade-in Checkbox Toggle */}
            <div className="pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none group">
                <input
                  type="checkbox"
                  checked={hasTradeIn}
                  onChange={(e) => setValue('hasTradeIn', e.target.checked)}
                  className="h-4 w-4 rounded bg-inset border-border text-gold focus:ring-1 focus:ring-gold/40 accent-gold cursor-pointer"
                />
                <span className="text-xs font-sans text-secondary group-hover:text-primary transition-colors">
                  I have a trade-in vehicle to offer against this acquisition
                </span>
              </label>
            </div>

            {/* Conditional Trade-In Details Input */}
            {hasTradeIn && (
              <div className="animate-fade-in">
                <FormInput<EnquiryInput>
                  name="tradeInDetails"
                  label="Trade-In Vehicle Specs"
                  placeholder="e.g. 2022 Porsche Taycan Turbo S, 12,000 KM, Guards Red"
                  leftIcon={<Car className="h-4 w-4 text-gold" />}
                />
              </div>
            )}

            {/* Detailed Message */}
            <FormTextarea<EnquiryInput>
              name="message"
              label="Message & Concierge Instructions"
              placeholder="Detail your requirements, timeline, or trade-in inquiries..."
              rows={4}
              maxLength={1500}
              requiredIndicator
            />

            {/* Primary Action Button */}
            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              isLoading={isSubmitting}
              loadingText="Transmitting Dossier..."
              rightIcon={<Send className="h-4 w-4" />}
              className="mt-2"
            >
              Transmit Concierge Inquiry
            </Button>

            {/* Security & SSL Privacy Footer */}
            <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-muted font-sans text-center">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald shrink-0" />
              <span>256-Bit Encrypted Concierge Session • Your privacy is guaranteed.</span>
            </div>
          </form>
        </FormProvider>
      )}
    </Card>
  );
}

export default VehicleEnquiryForm;