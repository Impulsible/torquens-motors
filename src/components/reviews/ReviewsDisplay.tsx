/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Star, ThumbsUp, Flag, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';

interface Review {
  id: string;
  title: string;
  content: string;
  rating: number;
  pros?: string[];
  cons?: string[];
  reviewType: 'PURCHASE' | 'SERVICE' | 'GENERAL';
  experienceDate?: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatar?: string | null;
  };
  helpfulCount: number;
  verified: boolean;
}

interface ReviewsDisplayProps {
  reviews: Review[];
  dealerId?: string;
  className?: string;
}

export function ReviewsDisplay({ reviews, className }: ReviewsDisplayProps) {
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'recent' | 'highest' | 'lowest' | 'helpful'>('recent');
  const [filteredReviews, setFilteredReviews] = useState<Review[]>(reviews);

  // Remove unused state variables

  useEffect(() => {
    const sorted = [...reviews];
    switch (sortBy) {
      case 'recent':
        sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'highest':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case 'lowest':
        sorted.sort((a, b) => a.rating - b.rating);
        break;
      case 'helpful':
        sorted.sort((a, b) => b.helpfulCount - a.helpfulCount);
        break;
    }
    setFilteredReviews(sorted);
  }, [reviews, sortBy]);

  const toggleExpand = (reviewId: string) => {
    setExpandedReviews((prev) => {
      const next = new Set(prev);
      if (next.has(reviewId)) {
        next.delete(reviewId);
      } else {
        next.add(reviewId);
      }
      return next;
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const getTypeBadge = (type: string) => {
    const configs: Record<string, { label: string; variant: 'gold' | 'emerald' | 'default' }> = {
      PURCHASE: { label: 'Purchase', variant: 'gold' },
      SERVICE: { label: 'Service', variant: 'emerald' },
      GENERAL: { label: 'General', variant: 'default' },
    };
    const config = configs[type] || configs.GENERAL;
    return <Badge variant={config.variant} size="sm">{config.label}</Badge>;
  };

  if (!reviews.length) {
    return (
      <div className={cn('text-center py-12', className)}>
        <div className="text-secondary font-sans">No reviews yet</div>
        <p className="text-xs text-muted mt-1">Be the first to share your experience</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Sort Controls */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <span className="text-sm text-secondary font-sans">
          {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
        </span>
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted font-sans">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="bg-charcoal border border-border rounded-md px-3 py-1.5 text-xs text-secondary focus:outline-none focus:border-gold"
          >
            <option value="recent">Most Recent</option>
            <option value="highest">Highest Rated</option>
            <option value="lowest">Lowest Rated</option>
            <option value="helpful">Most Helpful</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      {filteredReviews.map((review) => {
        const isExpanded = expandedReviews.has(review.id);
        const shouldTruncate = review.content.length > 300;

        return (
          <Card key={review.id} variant="default" className="p-5 space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="h-10 w-10 rounded-full bg-charcoal border border-border overflow-hidden flex items-center justify-center shrink-0">
                  {review.user.avatar ? (
                    <Image
                      src={review.user.avatar}
                      alt={review.user.name}
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  ) : (
                    <span className="text-sm font-medium text-secondary">
                      {review.user.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-primary">{review.user.name}</span>
                    {review.verified && (
                      <Badge variant="emerald" size="sm">✓ Verified</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={cn(
                            'h-3.5 w-3.5',
                            star <= review.rating ? 'fill-gold text-gold' : 'text-border'
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted font-sans">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {getTypeBadge(review.reviewType)}
              </div>
            </div>

            {/* Title */}
            <h4 className="font-serif text-base text-primary font-light">
              {review.title}
            </h4>

            {/* Content */}
            <div className="text-sm text-secondary leading-relaxed font-sans">
              {shouldTruncate && !isExpanded ? (
                <>
                  {review.content.slice(0, 300)}
                  <span className="text-muted">...</span>
                  <button
                    onClick={() => toggleExpand(review.id)}
                    className="ml-1 text-gold hover:underline inline-flex items-center gap-0.5"
                  >
                    Read more <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </>
              ) : (
                <>
                  {review.content}
                  {shouldTruncate && (
                    <button
                      onClick={() => toggleExpand(review.id)}
                      className="ml-1 text-gold hover:underline inline-flex items-center gap-0.5"
                    >
                      Show less <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Pros & Cons */}
            {(review.pros && review.pros.length > 0 || review.cons && review.cons.length > 0) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {review.pros && review.pros.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-emerald font-sans">✓ Pros</span>
                    <ul className="space-y-0.5">
                      {review.pros.map((pro, index) => (
                        <li key={index} className="text-sm text-secondary font-sans">
                          • {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {review.cons && review.cons.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-red-400 font-sans">✗ Cons</span>
                    <ul className="space-y-0.5">
                      {review.cons.map((con, index) => (
                        <li key={index} className="text-sm text-secondary font-sans">
                          • {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Footer Actions */}
            <div className="flex items-center gap-4 pt-2 border-t border-border/50">
              <button className="flex items-center gap-1.5 text-xs text-muted hover:text-primary transition-colors group">
                <ThumbsUp className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span>Helpful ({review.helpfulCount})</span>
              </button>
              <button className="flex items-center gap-1.5 text-xs text-muted hover:text-red-400 transition-colors">
                <Flag className="h-4 w-4" />
                <span>Report</span>
              </button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

export default ReviewsDisplay;