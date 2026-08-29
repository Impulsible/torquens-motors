/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { forwardRef } from "react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/utils/cn";

type BadgeSize = "sm" | "md" | "lg";
type BadgeVariant =
  | "default"
  | "success"
  | "info"
  | "warning"
  | "danger"
  | "pending"
  | "gold"
  | "sold"
  | "verified";

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                   */
/* -------------------------------------------------------------------------- */

export type AutomotiveStatus =
  // Vehicle Inventory & Lifecycle
  | "AVAILABLE"
  | "ALLOCATION"
  | "IN_TRANSIT"
  | "RESERVED"
  | "SOLD"
  | "OFF_MARKET"
  | "DRAFT"
  | "PENDING_REVIEW"
  | "APPROVED"
  | "PUBLISHED"
  | "ARCHIVED"
  | "REJECTED"
  // Verification & Provenance
  | "VERIFIED"
  | "UNVERIFIED"
  // Private Client Inquiries & Escrow Transactions
  | "NEW"
  | "CONTACTED"
  | "NEGOTIATING"
  | "DEPOSIT_PAID"
  | "IN_ESCROW"
  | "CLOSED"
  | "CANCELLED";

export interface StatusConfigItem {
  label: string;
  variant: BadgeVariant;
  dot?: boolean;
  pulse?: boolean;
}

export interface StatusBadgeProps {
  status: AutomotiveStatus | string;
  size?: BadgeSize;
  dot?: boolean;
  pulse?: boolean;
  uppercase?: boolean;
  className?: string;
}

/* -------------------------------------------------------------------------- */
/*                              STATUS CONFIG MAP                             */
/* -------------------------------------------------------------------------- */

const STATUS_CONFIG: Record<AutomotiveStatus, StatusConfigItem> = {
  // 🏎️ Vehicle Showroom & Inventory
  AVAILABLE: { label: "Available", variant: "success", dot: true },
  ALLOCATION: {
    label: "Allocation Secured",
    variant: "gold",
    dot: true,
    pulse: true,
  },
  IN_TRANSIT: { label: "In Transit", variant: "info" },
  RESERVED: { label: "Reserved", variant: "pending", dot: true },
  SOLD: { label: "Sold", variant: "sold" },
  OFF_MARKET: { label: "Off Market", variant: "default" },

  // 📝 Editorial & Listing Workflow
  DRAFT: { label: "Draft", variant: "default" },
  PENDING_REVIEW: {
    label: "Under Review",
    variant: "pending",
    dot: true,
    pulse: true,
  },
  APPROVED: { label: "Approved", variant: "info" },
  PUBLISHED: { label: "Published", variant: "success" },
  ARCHIVED: { label: "Archived", variant: "default" },
  REJECTED: { label: "Rejected", variant: "danger" },

  // 🛡️ Verification & Provenance
  VERIFIED: { label: "Verified", variant: "verified" },
  UNVERIFIED: { label: "Unverified", variant: "default" },

  // 🤝 VIP Client Inquiries & Escrow
  NEW: { label: "New Lead", variant: "info", dot: true, pulse: true },
  CONTACTED: { label: "Contacted", variant: "pending" },
  NEGOTIATING: {
    label: "Negotiating",
    variant: "gold",
    dot: true,
    pulse: true,
  },
  DEPOSIT_PAID: { label: "Deposit Secured", variant: "gold", dot: true },
  IN_ESCROW: { label: "In Escrow", variant: "gold", dot: true },
  CLOSED: { label: "Closed", variant: "default" },
  CANCELLED: { label: "Cancelled", variant: "danger" },
};

/* -------------------------------------------------------------------------- */
/*                               STATUS BADGE ROOT                            */
/* -------------------------------------------------------------------------- */

export const StatusBadge = forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ status, size = "md", dot, pulse, uppercase = true, className }, _ref) => {
    // Lookup normalized uppercase status key
    const normalizedKey = (status?.toUpperCase().replace(/\s+/g, "_") ||
      "") as AutomotiveStatus;
    const config = STATUS_CONFIG[normalizedKey];

    // Format human-readable fallback if unknown status is passed
    const fallbackLabel = status
      ? status
          .replace(/_/g, " ")
          .toLowerCase()
          .replace(/\b\w/g, (c) => c.toUpperCase())
      : "Unknown";

    const label = config?.label || fallbackLabel;
    const variant = config?.variant || "default";
    const showDot = dot !== undefined ? dot : (config?.dot ?? false);
    const showPulse = pulse !== undefined ? pulse : (config?.pulse ?? false);
    const displayLabel = uppercase ? label.toUpperCase() : label;

    return (
      <Badge
        variant={variant}
        size={size}
        dot={showDot}
        className={cn(
          "tracking-wider select-none",
          uppercase && "uppercase",
          showPulse && "animate-pulse",
          className,
        )}
      >
        {displayLabel}
      </Badge>
    );
  },
);

StatusBadge.displayName = "StatusBadge";
