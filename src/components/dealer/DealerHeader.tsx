'use client';
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Bell,
  PlusCircle,
  Sparkles,
  Compass,
  Command,
  Search,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { DealerSidebar, DealerSidebarUser } from "./DealerSidebar";
import { cn } from "@/utils/cn";

export interface DealerHeaderProps {
  user?: DealerSidebarUser | null;
  className?: string;
}

export function DealerHeader({ user, className }: DealerHeaderProps) {
  const pathname = usePathname();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Auto-close mobile drawer on route change
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [pathname]);

  // Lock background scroll & listen for Escape key when mobile menu is open
  useEffect(() => {
    if (!isMobileSidebarOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileSidebarOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileSidebarOpen]);

  const isAdmin = user?.role === "ADMIN";

  return (
    <>
      <header
        className={cn(
          "sticky top-0 left-0 right-0 z-40 h-16 bg-obsidian/90 backdrop-blur-xl border-b border-border/80 select-none transition-all",
          className,
        )}
      >
        <div className="flex items-center justify-between h-full px-4 sm:px-6 lg:px-8">
          {/* ─────────────────────────────────────────────────────── */}
          {/* LEFT: Mobile Trigger & Portal Branding                  */}
          {/* ─────────────────────────────────────────────────────── */}
          <div className="flex items-center gap-3.5">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              aria-label="Open operational terminal navigation"
              aria-expanded={isMobileSidebarOpen}
              className="md:hidden flex items-center justify-center h-9 w-9 rounded-lg border border-border/80 bg-graphite/60 text-secondary hover:text-primary hover:border-gold/40 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/60"
            >
              <Menu size={18} />
            </button>

            {/* Portal Crest Title */}
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-sm border border-gold/40 flex items-center justify-center bg-obsidian/80 shadow-[0_0_12px_rgba(212,175,55,0.15)]">
                <span className="font-serif text-gold text-xs font-semibold">
                  T
                </span>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-serif text-sm sm:text-base tracking-wide text-primary font-normal">
                    Custodian Terminal
                  </span>
                  <Badge
                    variant={isAdmin ? "gold" : undefined}
                    size="sm"
                    className="hidden sm:inline-flex py-0 px-2 text-[9px] font-mono uppercase tracking-widest"
                  >
                    {isAdmin ? "Master Admin" : "Authorized Broker"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────── */}
          {/* CENTER: Spotlight / Quick Search Trigger (Desktop)      */}
          {/* ─────────────────────────────────────────────────────── */}
          <div className="hidden lg:flex items-center">
            <button
              type="button"
              onClick={() => {
                // Hook to your command palette / search trigger modal
              }}
              className="flex items-center gap-3 px-3.5 py-1.5 rounded-full border border-border/60 bg-graphite/40 hover:bg-graphite/80 hover:border-gold/30 text-muted hover:text-secondary transition-all text-xs font-sans group cursor-pointer"
            >
              <Search className="h-3.5 w-3.5 group-hover:text-gold transition-colors" />
              <span className="text-xs">
                Search Registry Assets, VINs, or Clients...
              </span>
              <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-obsidian border border-border text-[9px] font-mono text-muted tracking-widest">
                <Command className="h-2.5 w-2.5" /> K
              </kbd>
            </button>
          </div>

          {/* ─────────────────────────────────────────────────────── */}
          {/* RIGHT: Live Notices & Action Triggers                   */}
          {/* ─────────────────────────────────────────────────────── */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Showroom View Link */}
            <Link
              href="/"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono uppercase tracking-wider text-muted hover:text-gold hover:bg-graphite/50 transition-colors"
            >
              <Compass className="h-3.5 w-3.5" />
              <span>Showroom</span>
            </Link>

            {/* Notification Bell with Ambient Ping */}
            <div className="relative">
              <button
                type="button"
                aria-label="View terminal notices"
                className="relative flex items-center justify-center h-9 w-9 rounded-lg border border-border/80 bg-graphite/60 text-secondary hover:text-primary hover:border-gold/40 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/60"
              >
                <Bell size={16} />
                {/* Active alert indicator pill */}
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-gold" />
                </span>
              </button>
            </div>

            {/* Primary Action Button */}
            <Link href="/dealer/vehicles/new">
              <Button
                variant="gold"
                size="sm"
                className="text-xs uppercase tracking-widest font-semibold flex items-center gap-1.5 shadow-[0_0_15px_rgba(212,175,55,0.2)]"
              >
                <PlusCircle className="h-3.5 w-3.5 stroke-[2.5]" />
                <span className="hidden sm:inline">List New Allocation</span>
                <span className="sm:hidden">List</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ───────────────────────────────────────────────────────── */}
      {/* MOBILE DRAWER MODAL                                       */}
      {/* ───────────────────────────────────────────────────────── */}
      {isMobileSidebarOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation drawer"
          className="fixed inset-0 z-50 md:hidden animate-fade-in"
        >
          {/* Backdrop Blur Overlay */}
          <div
            className="fixed inset-0 bg-obsidian/85 backdrop-blur-md transition-opacity duration-300"
            onClick={() => setIsMobileSidebarOpen(false)}
            aria-hidden="true"
          />

          {/* Slide-out Sidebar Container */}
          <div className="relative z-10 w-72 max-w-[85vw] h-full bg-graphite border-r border-border shadow-2xl flex flex-col animate-slide-up duration-300">
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 px-5 border-b border-border/80 bg-obsidian/50">
              <div className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-gold" />
                <span className="text-xs font-mono uppercase tracking-widest text-primary font-semibold">
                  Terminal Menu
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(false)}
                aria-label="Close navigation drawer"
                className="flex items-center justify-center h-8 w-8 rounded-md text-muted hover:text-primary hover:bg-charcoal transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/60"
              >
                <X size={18} />
              </button>
            </div>

            {/* Embedded Sidebar Nav Component */}
            <div className="flex-1 overflow-y-auto">
              <DealerSidebar
                user={user}
                className="flex! w-full! min-h-full! static! border-none! bg-transparent!"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
