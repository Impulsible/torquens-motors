/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Menu,
  X,
  Heart,
  ArrowRight,
  Sparkles,
  Layers,
  PhoneCall,
  Bell,
} from "lucide-react";
import { UserMenu } from "../navigation/UserMenu";
import { MobileMenu } from "../navigation/MobileMenu";
import { mainNavItems } from "@/data/navigation";

// Types
interface NavItem {
  label: string;
  href: string;
  badge?: string;
}

interface HeaderProps {
  user?: {
    id: string;
    name: string;
    email: string;
    role: "CUSTOMER" | "DEALER" | "ADMIN";
    tier: string;
    avatar?: string;
  } | null;
  isAuthenticated?: boolean;
  unreadNotifications?: number;
  savedCount?: number;
  compareCount?: number;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Vehicles", href: "/vehicles" },
  { label: "Luxury Tier", href: "/vehicles?category=luxury", badge: "VIP" },
  { label: "Dealers", href: "/dealers" },
  { label: "Sell / Trade", href: "/sell-trade" },
  { label: "About", href: "/about" },
];

const QUICK_SEARCH_TAGS = [
  "Porsche Cayenne",
  "Mercedes-AMG G63",
  "Range Rover Autobiography",
  "Low Mileage SUVs",
  "Electric & Hybrid",
];

export function Header({
  user = null,
  isAuthenticated = false,
  unreadNotifications = 0,
  savedCount = 0,
  compareCount = 0,
}: HeaderProps) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Handle Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setIsSearchOpen((prev) => !prev);
    }
    if (e.key === "Escape") {
      setIsSearchOpen(false);
      setIsMobileMenuOpen(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Lock body scroll
  useEffect(() => {
    if (isSearchOpen || isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSearchOpen, isMobileMenuOpen]);

  return (
    <>
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. TOP UTILITY BAR                                          */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="hidden lg:block bg-inset border-b border-border/40 py-1.5 text-xs text-secondary font-sans">
        <div className="container-torquens flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <span className="flex items-center gap-1.5 text-emerald">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald animate-pulse" />
              TORQUENS Verified Guarantee Active
            </span>
            <span className="text-border">|</span>
            <span className="text-muted">Currency:</span>
            <span className="text-primary font-medium">🇳🇬 NGN</span>
          </div>
          <div className="flex items-center space-x-6">
            <Link
              href="/dealer/register"
              className="hover:text-gold transition-colors"
            >
              Become a Dealer
            </Link>
            <span className="text-border">|</span>
            <a
              href="tel:+234800TORQUENS"
              className="flex items-center gap-1 hover:text-primary transition-colors"
            >
              <PhoneCall size={12} className="text-gold" />
              Concierge: +234 800 TORQUENS
            </a>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. MAIN HEADER                                              */}
      {/* ───────────────────────────────────────────────────────────── */}
      <header
        className={`fixed top-0 lg:top-7 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-obsidian/95 backdrop-blur-md border-b border-border shadow-card py-2"
            : "bg-obsidian/90 border-b border-border/40 py-3 md:py-4"
        }`}
      >
        <div className="container-torquens">
          <div className="flex items-center justify-between gap-4">
            {/* ── Logo ── */}
            <Link
              href="/"
              className="flex items-center gap-3 group shrink-0"
            >
              <div className="flex flex-col leading-none">
                <span className="text-xl md:text-2xl font-serif font-light tracking-[0.15em] text-primary group-hover:text-gold transition-colors">
                  TORQUENS
                </span>
                <span className="text-[8px] font-sans font-bold tracking-[0.3em] text-gold uppercase">
                  MOTORS
                </span>
              </div>
            </Link>

            {/* ── Desktop Navigation ── */}
            <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative text-xs uppercase tracking-wider font-medium transition-colors duration-200 py-1 whitespace-nowrap ${
                      isActive
                        ? "text-gold"
                        : "text-secondary hover:text-primary"
                    }`}
                  >
                    {item.label}
                    {item.badge && (
                      <span className="ml-1.5 px-1.5 py-0.5 text-[8px] font-bold bg-gold/15 text-gold border border-gold/30 rounded">
                        {item.badge}
                      </span>
                    )}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gold rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* ── Right Side Actions ── */}
            <div className="flex items-center gap-1 md:gap-2">
              {/* Search */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="hidden sm:flex items-center gap-2 bg-inset hover:bg-charcoal border border-border hover:border-gold/30 text-secondary hover:text-primary px-3 py-1.5 rounded-md transition-all duration-200 text-xs"
              >
                <Search size={14} className="text-muted" />
                <span className="text-muted">Search...</span>
                <kbd className="hidden xl:inline-flex bg-obsidian border border-border px-1.5 py-0.5 rounded text-[9px] text-muted font-mono">
                  ⌘K
                </kbd>
              </button>

              <button
                onClick={() => setIsSearchOpen(true)}
                className="sm:hidden p-2 text-secondary hover:text-gold transition-colors"
              >
                <Search size={18} />
              </button>

              {/* Notifications */}
              {isAuthenticated && (
                <button className="relative p-2 text-secondary hover:text-primary transition-colors">
                  <Bell size={18} />
                  {unreadNotifications > 0 && (
                    <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-red-500 text-[8px] font-bold flex items-center justify-center">
                      {unreadNotifications}
                    </span>
                  )}
                </button>
              )}

              {/* Compare */}
              <Link
                href="/compare"
                className="relative p-2 text-secondary hover:text-primary transition-colors"
              >
                <Layers size={18} />
                {compareCount > 0 && (
                  <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-gold text-obsidian text-[8px] font-bold flex items-center justify-center">
                    {compareCount}
                  </span>
                )}
              </Link>

              {/* Saved */}
              <Link
                href="/garage"
                className="relative p-2 text-secondary hover:text-primary transition-colors"
              >
                <Heart size={18} />
                {savedCount > 0 && (
                  <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-gold text-obsidian text-[8px] font-bold flex items-center justify-center">
                    {savedCount}
                  </span>
                )}
              </Link>

              <div className="hidden sm:block w-px h-6 bg-border" />

              {/* User Menu */}
              <UserMenu user={user} isAuthenticated={isAuthenticated} />

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-secondary hover:text-primary transition-colors"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. SEARCH OVERLAY                                           */}
      {/* ───────────────────────────────────────────────────────────── */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 md:pt-28 px-4 bg-obsidian/90 backdrop-blur-md">
          <div
            className="absolute inset-0"
            onClick={() => setIsSearchOpen(false)}
          />
          <div className="relative w-full max-w-2xl bg-graphite border border-active-border rounded-xl shadow-dropdown overflow-hidden">
            <div className="flex items-center px-4 py-3 border-b border-border bg-inset">
              <Sparkles size={18} className="text-gold mr-3 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search vehicles, makes, models..."
                className="w-full bg-transparent text-primary text-sm placeholder:text-muted focus:outline-none"
                autoFocus
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                className="text-xs text-muted hover:text-primary px-2 py-1 border border-border rounded"
              >
                ESC
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted font-semibold mb-2">
                  Popular Searches
                </p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_SEARCH_TAGS.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSearchQuery(tag)}
                      className="text-xs bg-charcoal hover:bg-border text-secondary hover:text-gold px-3 py-1.5 rounded-md border border-border transition-all"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-gold/5 border border-gold/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sparkles size={14} className="text-gold" />
                  <div>
                    <p className="text-xs font-semibold text-primary">
                      AI Search
                    </p>
                    <p className="text-[10px] text-secondary">
                      Natural language vehicle search
                    </p>
                  </div>
                </div>
                <Link
                  href={`/vehicles?q=${encodeURIComponent(searchQuery)}`}
                  onClick={() => setIsSearchOpen(false)}
                  className="text-xs bg-gold text-obsidian px-3 py-1.5 rounded flex items-center gap-1 font-medium"
                >
                  Search <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 4. MOBILE MENU                                              */}
      {/* ───────────────────────────────────────────────────────────── */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        isAuthenticated={isAuthenticated}
        user={user}
      />
    </>
  );
}

export default Header;