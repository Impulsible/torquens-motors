import React, { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { ShieldCheck, Check, Sparkles, Award } from "lucide-react";
import { Badge, type BadgeVariant, type BadgeSize } from "@/components/ui/Badge";
import { cn } from "@/utils/cn";

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                   */
/* -------------------------------------------------------------------------- */

export type VerificationTier = "standard" | "heritage" | "master" | "cpo";

export interface VerifiedBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tier?: VerificationTier;
  size?: BadgeSize;
  showLabel?: boolean;
  /** Custom label override (e.g. "150-Point Certified" or "Provenance Verified") */
  label?: string;
  /** Inspection score or point count (e.g. 175) */
  inspectionPoints?: number;
  /** Show animated live radar pulse dot */
  pulse?: boolean;
  className?: string;
}

/* -------------------------------------------------------------------------- */
/*                            VERIFIED BADGE ROOT                             */
/* -------------------------------------------------------------------------- */

export const VerifiedBadge = forwardRef<HTMLSpanElement, VerifiedBadgeProps>(
  (
    {
      tier = "standard",
      size = "md",
      showLabel = true,
      label,
      inspectionPoints,
      pulse = false,
      className,
      ...props
    },
    ref,
  ) => {
    // 🎨 Tiers configured for luxury automotive provenance
    const tierConfig: Record<
      VerificationTier,
      {
        variant: BadgeVariant;
        defaultLabel: string;
        icon: ReactNode;
      }
    > = {
      // Standard TORQUENS Verification
      standard: {
        variant: "verified",
        defaultLabel: inspectionPoints
          ? `${inspectionPoints}-Point Verified`
          : "TORQUENS Verified",
        icon: <ShieldCheck className="shrink-0" />,
      },
      // Classic Heritage / Provenance Authenticated
      heritage: {
        variant: "gold",
        defaultLabel: "Provenance Certified",
        icon: <Sparkles className="shrink-0" />,
      },
      // Master Concierge Inspection
      master: {
        variant: "gold",
        defaultLabel: "Master Certified",
        icon: <Award className="shrink-0" />,
      },
      // Certified Pre-Owned
      cpo: {
        variant: "cpo",
        defaultLabel: "Official CPO",
        icon: <Check className="shrink-0" />,
      },
    };

    const current = tierConfig[tier];
    const displayLabel = label || current.defaultLabel;

    return (
      <Badge
        ref={ref}
        variant={current.variant}
        size={size}
        dot={pulse}
        leftIcon={current.icon}
        className={cn(
          "tracking-wider font-semibold select-none shadow-sm",
          tier === "heritage" || tier === "master"
            ? "shadow-[0_0_12px_-3px_rgba(197,160,89,0.25)]"
            : "shadow-[0_0_12px_-3px_rgba(16,185,129,0.2)]",
          className,
        )}
        {...props}
      >
        {showLabel && displayLabel}
      </Badge>
    );
  },
);

VerifiedBadge.displayName = "VerifiedBadge";

export default VerifiedBadge;