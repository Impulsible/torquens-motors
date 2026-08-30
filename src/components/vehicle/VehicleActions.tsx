/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Heart,
  GitCompare,
  Share2,
  Check,
  Copy,
  Mail,
  Send,
  Sparkles,
} from 'lucide-react';

import { Button, type ButtonSize } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                   */
/* -------------------------------------------------------------------------- */

export interface VehicleActionsProps {
  vehicleId: string;
  vehicleSlug: string;
  vehicleTitle?: string;
  isSaved?: boolean;
  isCompared?: boolean;
  size?: ButtonSize;
  layout?: 'row' | 'compact' | 'fullWidth';
  className?: string;
  onSave?: (saved: boolean) => void;
  onCompare?: (compared: boolean) => void;
}

/* -------------------------------------------------------------------------- */
/*                            VEHICLE ACTIONS ROOT                            */
/* -------------------------------------------------------------------------- */

export function VehicleActions({
  vehicleId,
  vehicleSlug,
  vehicleTitle = 'Vehicle Listing',
  isSaved = false,
  isCompared = false,
  size = 'md',
  layout = 'row',
  className,
  onSave,
  onCompare,
}: VehicleActionsProps) {
  const [saved, setSaved] = useState(isSaved);
  const [compared, setCompared] = useState(isCompared);
  const [copied, setCopied] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const shareMenuRef = useRef<HTMLDivElement>(null);

  // Sync prop changes
  useEffect(() => {
    setSaved(isSaved);
  }, [isSaved]);

  useEffect(() => {
    setCompared(isCompared);
  }, [isCompared]);

  // Handle click outside to close share dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(e.target as Node)) {
        setIsShareOpen(false);
      }
    };
    if (isShareOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isShareOpen]);

  // 1. Garage Save Toggle
  const handleSave = () => {
    const nextState = !saved;
    setSaved(nextState);
    onSave?.(nextState);
  };

  // 2. Compare Toggle
  const handleCompare = () => {
    const nextState = !compared;
    setCompared(nextState);
    onCompare?.(nextState);
  };

  // 3. Share Execution (Native Web Share -> Glass Fallback)
  const getShareUrl = () => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/vehicles/${vehicleSlug}`;
  };

  const handleShareClick = async () => {
    const url = getShareUrl();
    const shareData = {
      title: `${vehicleTitle} | TORQUENS MOTORS`,
      text: `Review the dossier for ${vehicleTitle} on TORQUENS MOTORS.`,
      url,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled or share failed — open fallback menu
        setIsShareOpen((prev) => !prev);
      }
    } else {
      setIsShareOpen((prev) => !prev);
    }
  };

  // 4. Copy Direct Link
  const handleCopyLink = async () => {
    const url = getShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Failed to copy
    }
  };

  // 5. WhatsApp Share
  const handleWhatsAppShare = () => {
    const url = encodeURIComponent(getShareUrl());
    const text = encodeURIComponent(`Review the dossier for ${vehicleTitle}:`);
    window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
  };

  // 6. Email Share
  const handleEmailShare = () => {
    const url = getShareUrl();
    const subject = encodeURIComponent(`TORQUENS MOTORS Dossier: ${vehicleTitle}`);
    const body = encodeURIComponent(`Check out this verified listing on TORQUENS MOTORS:\n\n${url}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div
      className={cn(
        'relative flex flex-wrap items-center gap-2.5 select-none',
        layout === 'fullWidth' && 'w-full [&>button]:flex-1',
        className
      )}
    >
      {/* ── 1. SAVE TO GARAGE BUTTON ────────────────────────────────────── */}
      <Button
        type="button"
        variant={saved ? 'gold' : 'secondary'}
        size={size}
        onClick={handleSave}
        aria-label={saved ? 'Remove from private garage' : 'Save to private garage'}
        aria-pressed={saved}
        leftIcon={
          <Heart
            className={cn(
              'h-4 w-4 transition-transform duration-300 active:scale-125',
              saved ? 'fill-obsidian text-obsidian' : 'text-muted group-hover:text-red-400'
            )}
          />
        }
        className={cn(
          'transition-all duration-300',
          saved && 'shadow-goldGlowSm'
        )}
      >
        {saved ? 'In Garage' : 'Save'}
      </Button>

      {/* ── 2. COMPARE BUTTON ────────────────────────────────────────────── */}
      <Button
        type="button"
        variant={compared ? 'glass' : 'secondary'}
        size={size}
        onClick={handleCompare}
        aria-label={compared ? 'Remove from comparison tray' : 'Add to comparison tray'}
        aria-pressed={compared}
        leftIcon={
          <GitCompare
            className={cn(
              'h-4 w-4 transition-colors',
              compared ? 'text-gold' : 'text-muted group-hover:text-gold'
            )}
          />
        }
        className={cn(
          compared && 'border-gold/40 text-gold bg-gold/10'
        )}
      >
        {compared ? 'Comparing' : 'Compare'}
      </Button>

      {/* ── 3. SHARE BUTTON & DROPDOWN MENU ─────────────────────────────── */}
      <div ref={shareMenuRef} className="relative">
        <Button
          type="button"
          variant="secondary"
          size={size}
          onClick={handleShareClick}
          aria-label="Share vehicle dossier"
          aria-expanded={isShareOpen}
          leftIcon={<Share2 className="h-4 w-4 text-muted group-hover:text-gold" />}
        >
          Share
        </Button>

        {/* Glassmorphic Fallback Share Dropdown */}
        {isShareOpen && (
          <div
            role="menu"
            className={cn(
              'absolute right-0 mt-2 w-64 rounded-xl bg-graphite/95 backdrop-blur-2xl border border-border/80 p-2 shadow-dropdown',
              'animate-slide-up duration-200 z-50 overflow-hidden'
            )}
          >
            {/* Specular Edge Highlight */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/15 to-transparent z-10"
            />

            <div className="px-3 py-2 border-b border-border/60 mb-1 flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted">
                Share Dossier
              </span>
              <Badge variant="gold" size="sm" leftIcon={<Sparkles className="h-2.5 w-2.5" />}>
                VIP
              </Badge>
            </div>

            {/* Actions */}
            <button
              type="button"
              onClick={handleCopyLink}
              role="menuitem"
              className="flex items-center justify-between w-full px-3 py-2 rounded-md text-xs font-sans text-secondary hover:text-primary hover:bg-charcoal transition-colors"
            >
              <div className="flex items-center gap-2.5">
                {copied ? <Check className="h-4 w-4 text-emerald" /> : <Copy className="h-4 w-4 text-muted" />}
                <span>{copied ? 'Link Copied!' : 'Copy Direct Link'}</span>
              </div>
              <kbd className="text-[9px] font-mono text-muted uppercase">URL</kbd>
            </button>

            <button
              type="button"
              onClick={handleWhatsAppShare}
              role="menuitem"
              className="flex items-center justify-between w-full px-3 py-2 rounded-md text-xs font-sans text-secondary hover:text-primary hover:bg-charcoal transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Send className="h-4 w-4 text-emerald" />
                <span>Encrypted WhatsApp</span>
              </div>
            </button>

            <button
              type="button"
              onClick={handleEmailShare}
              role="menuitem"
              className="flex items-center justify-between w-full px-3 py-2 rounded-md text-xs font-sans text-secondary hover:text-primary hover:bg-charcoal transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-muted" />
                <span>Email Dossier</span>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}