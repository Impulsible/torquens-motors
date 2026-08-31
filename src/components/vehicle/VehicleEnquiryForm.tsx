/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/incompatible-library */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send, Phone, Mail, ShieldCheck, CheckCircle2, User, Car } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { enquirySchema } from '@/utils/validators';
import { createEnquiry } from '@/actions/enquiries';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/utils/cn';

// Inferred directly from the Zod validation schema to ensure 100% type compatibility
type EnquiryInput = z.input<typeof enquirySchema>;
type EnquiryOutput = z.infer<typeof enquirySchema>;

interface VehicleEnquiryFormProps {
  vehicleId: string;
  vehicleName: string;
  dealerName: string;
  dealerEmail?: string;
  className?: string;
  onSuccess?: () => void;
}

export function VehicleEnquiryForm({
  vehicleId,
  vehicleName,
  dealerName,
  dealerEmail,
  className,
  onSuccess,
}: VehicleEnquiryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<EnquiryInput, any, EnquiryOutput>({
    resolver: zodResolver(enquirySchema),
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
  });

  const hasTradeIn = Boolean(watch('hasTradeIn'));

  const onSubmit = async (data: EnquiryOutput) => {
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('phone', data.phone);
      formData.append('message', data.message);
      formData.append('vehicleId', vehicleId || data.vehicleId || '');
      formData.append('preferredContact', data.preferredContact || 'EMAIL');
      formData.append('enquiryType', data.enquiryType || 'GENERAL_INQUIRY');
      
      if (data.hasTradeIn && data.tradeInDetails) {
        formData.append('tradeInDetails', data.tradeInDetails);
      }

      const result = await createEnquiry(formData);

      if (result.success) {
        setIsSuccess(true);
        reset();
        onSuccess?.();
        showToast({
          type: 'success',
          title: 'Enquiry Sent!',
          message: `Your enquiry about the ${vehicleName} has been sent to ${dealerName}. They will respond shortly.`,
        });
        
        // Reset success state after 5 seconds
        setTimeout(() => setIsSuccess(false), 5000);
      } else {
        showToast({
          type: 'error',
          title: 'Error',
          message: result.message || 'Failed to send enquiry. Please try again.',
        });
      }
    } catch (error) {
      console.error('Error submitting enquiry:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const enquiryTypeOptions = [
    { value: 'GENERAL_INQUIRY', label: 'General Inquiry & Provenance' },
    { value: 'PURCHASE_OFFER', label: 'Submit Purchase Offer' },
    { value: 'PRIVATE_VIEWING', label: 'Schedule Private Viewing' },
    { value: 'BESPOKE_SOURCING', label: 'Bespoke Sourcing Request' },
    { value: 'TRADE_IN_VALUATION', label: 'Trade-in Valuation' },
  ];

  const contactOptions = [
    { value: 'EMAIL', label: 'Email Correspondence' },
    { value: 'PHONE', label: 'Direct Phone Call' },
    { value: 'WHATSAPP', label: 'Encrypted WhatsApp' },
  ];

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
          <Badge variant="gold" size="sm" leftIcon={<ShieldCheck className="h-3 w-3" />}>
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
              onClick={() => {
                setIsSuccess(false);
                reset();
              }}
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Inquiry Intent Category */}
          <Select
            label="Inquiry Intent"
            options={enquiryTypeOptions}
            {...register('enquiryType')}
            error={errors.enquiryType?.message}
          />

          {/* Client Name */}
          <Input
            label="Full Legal Name"
            placeholder="e.g. Harrison Sterling"
            leftIcon={<User className="h-4 w-4" />}
            {...register('name')}
            error={errors.name?.message}
            required
          />

          {/* Email & Phone Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Email Address"
              type="email"
              placeholder="client@mayfair.com"
              leftIcon={<Mail className="h-4 w-4" />}
              {...register('email')}
              error={errors.email?.message}
              required
            />

            <Input
              label="Phone Number"
              type="tel"
              placeholder="+44 20 7946 0991"
              leftIcon={<Phone className="h-4 w-4" />}
              {...register('phone')}
              error={errors.phone?.message}
              required
            />
          </div>

          {/* Preferred Contact Method */}
          <Select
            label="Preferred Contact Channel"
            options={contactOptions}
            {...register('preferredContact')}
            error={errors.preferredContact?.message}
          />

          {/* Trade-in Checkbox Toggle */}
          <div className="pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none group">
              <input
                type="checkbox"
                checked={hasTradeIn}
                onChange={(e) => setValue('hasTradeIn', e.target.checked, { shouldValidate: true })}
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
              <Input
                label="Trade-In Vehicle Specs"
                placeholder="e.g. 2022 Porsche Taycan Turbo S, 12,000 KM, Guards Red"
                leftIcon={<Car className="h-4 w-4 text-gold" />}
                {...register('tradeInDetails')}
                error={errors.tradeInDetails?.message}
              />
            </div>
          )}

          {/* Detailed Message */}
          <Textarea
            label="Message & Concierge Instructions"
            placeholder="Detail your requirements, timeline, or trade-in inquiries..."
            rows={4}
            {...register('message')}
            error={errors.message?.message}
            required
          />

          {/* Primary Action Button */}
          <Button
            type="submit"
            variant="gold"
            fullWidth
            isLoading={isSubmitting}
            loadingText="Transmitting Dossier..."
            rightIcon={!isSubmitting && <Send size={16} />}
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
      )}
    </Card>
  );
}

export default VehicleEnquiryForm;