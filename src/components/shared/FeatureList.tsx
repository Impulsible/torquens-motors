'use client';

import React, { useState } from 'react';
import { Check, ChevronDown, Sparkles } from 'lucide-react';
import { cn } from '@/utils/cn';

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                   */
/* -------------------------------------------------------------------------- */

export type FeatureVariant = 'minimal' | 'cards' | 'inset' | 'pills';

export interface FeatureItem {
  name: string;
  highlighted?: boolean;
  category?: string;
}

export interface FeatureListProps {
  features: Array<string | FeatureItem>;
  variant?: FeatureVariant;
  columns?: 1 | 2 | 3 | 4;
  maxItems?: number;
  /** Allow client to expand and show all items */
  expandable?: boolean;
  /** Custom checkmark or leading icon */
  icon?: React.ReactNode;
  className?: string;
}

/* -------------------------------------------------------------------------- */
/*                             FEATURE LIST ROOT                              */
/* -------------------------------------------------------------------------- */

export function FeatureList({
  features = [],
  variant = 'minimal',
  columns = 2,
  maxItems,
  expandable = true,
  icon,
  className,
}: FeatureListProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!features || features.length === 0) return null;

  // Normalize feature items
  const normalizedFeatures: FeatureItem[] = features.map((f) =>
    typeof f === 'string' ? { name: f } : f
  );

  const shouldLimit = maxItems && !isExpanded && normalizedFeatures.length > maxItems;
  const visibleFeatures = shouldLimit
    ? normalizedFeatures.slice(0, maxItems)
    : normalizedFeatures;

  const remainingCount = normalizedFeatures.length - (maxItems || 0);

  // 📐 Responsive Column Layouts
  const columnStyles = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  // 🎨 Structural Variants
  const variantItemStyles: Record<FeatureVariant, string> = {
    // Clean editorial list
    minimal: 'flex items-start gap-2.5 text-xs sm:text-sm text-secondary font-sans',

    // Discrete tactile cards with micro borders
    cards: 'flex items-center gap-2.5 p-3 rounded-md bg-graphite border border-border/80 text-xs sm:text-sm text-primary hover:border-gold/30 transition-colors',

    // Deep recessed cockpit items
    inset: 'flex items-center gap-2.5 p-2.5 rounded-md bg-inset border border-border/60 text-xs text-primary shadow-inner',

    // Compact equipment pills
    pills: 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-charcoal/80 border border-border text-xs text-primary font-medium',
  };

  const defaultIcon = (
    <Check className="h-4 w-4 text-gold shrink-0 mt-0.5" />
  );

  return (
    <div className="w-full space-y-3">
      {/* Feature Grid */}
      <div
        className={cn(
          variant === 'pills' ? 'flex flex-wrap gap-2' : 'grid gap-2.5',
          variant !== 'pills' && columnStyles[columns],
          className
        )}
      >
        {visibleFeatures.map((feature, index) => (
          <div
            key={`${feature.name}-${index}`}
            className={cn(
              variantItemStyles[variant],
              feature.highlighted && 'text-gold font-medium'
            )}
          >
            {feature.highlighted ? (
              <Sparkles className="h-4 w-4 text-gold shrink-0 mt-0.5 drop-shadow-[0_0_8px_rgba(197,160,89,0.5)]" />
            ) : (
              icon || defaultIcon
            )}

            <span className="leading-snug">{feature.name}</span>
          </div>
        ))}
      </div>

      {/* Expand / Collapse Control */}
      {expandable && maxItems && normalizedFeatures.length > maxItems && (
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gold hover:text-gold-hover transition-colors font-sans focus:outline-none"
          >
            <span>
              {isExpanded
                ? 'Show Fewer Options'
                : `+ View ${remainingCount} More Specifications & Options`}
            </span>
            <ChevronDown
              className={cn(
                'h-3.5 w-3.5 transition-transform duration-300',
                isExpanded && 'rotate-180'
              )}
            />
          </button>
        </div>
      )}
    </div>
  );
}