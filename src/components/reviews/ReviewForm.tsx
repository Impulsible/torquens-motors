'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Star, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { cn } from '@/utils/cn';

// ✅ Fix: Define schema with proper types - pros and cons are required arrays with defaults
const reviewSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title is too long'),
  content: z.string().min(10, 'Review must be at least 10 characters').max(2000, 'Review is too long'),
  rating: z.number().min(1, 'Please select a rating').max(5),
  pros: z.array(z.string()),
  cons: z.array(z.string()),
  experienceDate: z.string().optional(),
  reviewType: z.enum(['PURCHASE', 'SERVICE', 'GENERAL']),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  dealerId: string;
  vehicleId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

export function ReviewForm({ 
  dealerId, 
  vehicleId, 
  onSuccess, 
  onCancel, 
  className 
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pros, setPros] = useState<string[]>([]);
  const [cons, setCons] = useState<string[]>([]);
  const [proInput, setProInput] = useState('');
  const [conInput, setConInput] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      title: '',
      content: '',
      rating: 0,
      pros: [],
      cons: [],
      reviewType: 'GENERAL',
      experienceDate: '',
    },
  });

  const handleRatingClick = (value: number) => {
    setRating(value);
    setValue('rating', value);
  };

  const addPro = () => {
    if (proInput.trim()) {
      const updatedPros = [...pros, proInput.trim()];
      setPros(updatedPros);
      setValue('pros', updatedPros);
      setProInput('');
    }
  };

  const removePro = (index: number) => {
    const updatedPros = pros.filter((_, i) => i !== index);
    setPros(updatedPros);
    setValue('pros', updatedPros);
  };

  const addCon = () => {
    if (conInput.trim()) {
      const updatedCons = [...cons, conInput.trim()];
      setCons(updatedCons);
      setValue('cons', updatedCons);
      setConInput('');
    }
  };

  const removeCon = (index: number) => {
    const updatedCons = cons.filter((_, i) => i !== index);
    setCons(updatedCons);
    setValue('cons', updatedCons);
  };

  const onSubmit = async (data: ReviewFormData) => {
    setIsSubmitting(true);
    try {
      // TODO: Submit review to API
      console.log('Review submitted:', {
        ...data,
        dealerId,
        vehicleId,
        pros: data.pros || [],
        cons: data.cons || [],
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSuccess?.();
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn('space-y-5', className)}>
      {/* Rating */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-secondary">Rating *</label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => handleRatingClick(value)}
              className="p-1 transition-colors hover:scale-110"
            >
              <Star
                className={cn(
                  'h-8 w-8',
                  value <= rating ? 'fill-gold text-gold' : 'text-border'
                )}
              />
            </button>
          ))}
        </div>
        {errors.rating && (
          <p className="text-xs text-red-400">{errors.rating.message}</p>
        )}
      </div>

      {/* Title */}
      <Input
        label="Review Title"
        placeholder="Summarize your experience..."
        {...register('title')}
        error={errors.title?.message}
      />

      {/* Content */}
      <Textarea
        label="Your Review"
        placeholder="Share your experience in detail..."
        rows={4}
        {...register('content')}
        error={errors.content?.message}
      />

      {/* Pros */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-secondary">What went well?</label>
        <div className="flex gap-2">
          <Input
            placeholder="e.g., Great customer service"
            value={proInput}
            onChange={(e) => setProInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addPro())}
          />
          <Button type="button" variant="secondary" onClick={addPro}>
            Add
          </Button>
        </div>
        {pros.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {pros.map((pro, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-bg border border-emerald-border text-emerald rounded-md text-sm"
              >
                {pro}
                <button
                  type="button"
                  onClick={() => removePro(index)}
                  className="text-emerald hover:text-emerald/70 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Cons */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-secondary">Areas for improvement</label>
        <div className="flex gap-2">
          <Input
            placeholder="e.g., Could improve communication"
            value={conInput}
            onChange={(e) => setConInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCon())}
          />
          <Button type="button" variant="secondary" onClick={addCon}>
            Add
          </Button>
        </div>
        {cons.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {cons.map((con, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded-md text-sm"
              >
                {con}
                <button
                  type="button"
                  onClick={() => removeCon(index)}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Review Type */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-secondary">Review Type</label>
        <select
          className="w-full bg-charcoal border border-border rounded-md px-4 py-2.5 text-primary focus:outline-none focus:border-gold"
          {...register('reviewType')}
        >
          <option value="GENERAL">General</option>
          <option value="PURCHASE">Purchase Experience</option>
          <option value="SERVICE">Service Experience</option>
        </select>
      </div>

      {/* Experience Date */}
      <Input
        label="Date of Experience"
        type="date"
        {...register('experienceDate')}
      />

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" variant="primary" isLoading={isSubmitting}>
          Submit Review
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

export default ReviewForm;