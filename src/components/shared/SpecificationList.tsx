import React, { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/utils/cn';

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                   */
/* -------------------------------------------------------------------------- */

export interface VehicleSpecification {
  label: string;
  value: string | number | ReactNode;
  /** Unit tag e.g. "BHP", "Nm", "KM", "s", "MPH" */
  unit?: string;
  icon?: ReactNode;
  /** Highlights key metric in radiant metallic gold */
  highlight?: boolean;
  /** Explanatory subtext */
  subtext?: string;
}

export type SpecificationVariant = 'inset' | 'cards' | 'minimal' | 'bordered';

export interface SpecificationListProps extends HTMLAttributes<HTMLDivElement> {
  specs: VehicleSpecification[];
  columns?: 1 | 2 | 3 | 4;
  variant?: SpecificationVariant;
  className?: string;
}

/* -------------------------------------------------------------------------- */
/*                          SPECIFICATION LIST ROOT                           */
/* -------------------------------------------------------------------------- */

export const SpecificationList = forwardRef<HTMLDivElement, SpecificationListProps>(
  (
    {
      specs,
      columns = 2,
      variant = 'inset',
      className,
      ...props
    },
    ref
  ) => {
    if (!specs || specs.length === 0) return null;

    // 📐 Precision Column Layouts
    const columnStyles = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 sm:grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
    };

    // 🎨 Architectural Chassis Variants
    const containerVariants: Record<SpecificationVariant, string> = {
      // Recessed Cockpit Instrument Cluster
      inset: 'p-1.5 rounded-lg bg-inset border border-border/70 shadow-inner',
      // High-End Tactile Spec Cards Grid
      cards: 'bg-transparent border-none p-0',
      // Clean Hairline Chamfered Table
      bordered: 'rounded-lg border border-border bg-graphite overflow-hidden',
      // Minimal Borderless Dossier
      minimal: 'bg-transparent border-none p-0',
    };

    // Cell Styling
    const cellVariants: Record<SpecificationVariant, string> = {
      inset: 'p-3 rounded-md bg-graphite/40 border border-white/[0.03] hover:border-gold/20 transition-colors',
      cards: 'p-4 rounded-lg bg-graphite border border-border hover:border-gold/40 hover:shadow-card transition-all duration-300',
      bordered: 'p-4 border-b border-r border-border/70 last:border-b-0',
      minimal: 'p-3 border-b border-border/40',
    };

    return (
      <div
        ref={ref}
        className={cn('w-full', containerVariants[variant], className)}
        {...props}
      >
        <div
          className={cn(
            'grid',
            variant === 'bordered' ? 'gap-0' : 'gap-2.5',
            columnStyles[columns]
          )}
        >
          {specs.map((spec, index) => (
            <div
              key={`${spec.label}-${index}`}
              className={cn(
                'flex items-center justify-between gap-3 group',
                cellVariants[variant]
              )}
            >
              {/* Left: Icon + Label & Subtext */}
              <div className="flex items-center gap-3 min-w-0">
                {spec.icon && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-charcoal/80 border border-border text-secondary group-hover:text-gold group-hover:border-gold/30 transition-colors">
                    <span className="[&>svg]:h-4 [&>svg]:w-4">{spec.icon}</span>
                  </div>
                )}

                <div className="min-w-0">
                  <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted font-sans truncate">
                    {spec.label}
                  </div>
                  {spec.subtext && (
                    <div className="text-[10px] text-secondary/70 font-sans truncate">
                      {spec.subtext}
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Value + Unit */}
              <div className="text-right shrink-0">
                <span
                  className={cn(
                    'font-mono text-sm sm:text-base font-semibold tracking-tight',
                    spec.highlight ? 'text-gold' : 'text-primary'
                  )}
                >
                  {spec.value}
                </span>

                {spec.unit && (
                  <span className="ml-1 text-[11px] font-sans font-medium uppercase tracking-wider text-secondary">
                    {spec.unit}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
);

SpecificationList.displayName = 'SpecificationList';