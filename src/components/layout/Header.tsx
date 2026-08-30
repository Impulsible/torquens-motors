/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState, useEffect, useCallback, useRef } from 'react';
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
} from 'lucide-react';
import { UserMenu } from '../navigation/UserMenu';
import { MobileMenu } from '../navigation/MobileMenu';
import { SearchInput } from '../search/SearchInput';
import { Button } from '@/components/ui/Button';

interface NavItem {
  label: string;
  href: string;
  badge?: string;
}

interface HeaderUser {
  id: string;
  name: string;
  email: string;
  role: 'CUSTOMER' | 'DEALER' | 'ADMIN';
  tier?: string;
  avatar?: string;
}

interface HeaderProps {
  user?: HeaderUser | null;
  isAuthenticated?: boolean;
  unreadNotifications?: number;
  savedCount?: number;
  compareCount?: number;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Vehicles', href: '/vehicles' },
  { label: 'Luxury Tier', href: '/vehicles?category=luxury', badge: 'VIP' },
  { label: 'Dealers', href: '/dealers' },
  { label: 'Sell / Trade', href: '/sell-trade' },
  { label: 'About', href: '/about' },
];

const QUICK_SEARCH_TAGS = [
  'Porsche Cayenne',
  'Mercedes-AMG G63',
  'Range Rover Autobiography',
  'Low Mileage SUVs',
  'Electric & Hybrid',
];

export function Header({
  user: userProp = null,
  isAuthenticated: isAuthenticatedProp = false,
  unreadNotifications = 0,
  savedCount = 0,
  compareCount = 0,
}: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();

  // Prefer live session over props so SIGN IN never shows while logged in
  const liveUser: HeaderUser | null =
    status === 'authenticated' && session?.user
      ? {
          id: (session.user as { id?: string }).id || userProp?.id || '',
          name: session.user.name || userProp?.name || 'Client',
          email: session.user.email || userProp?.email || '',
          role:
            ((session.user as { role?: string }).role as HeaderUser['role']) ||
            userProp?.role ||
            'CUSTOMER',
          tier: userProp?.tier || 'Tier 1',
          avatar:
            (session.user as { image?: string | null }).image ||
            (session.user as { avatar?: string | null }).avatar ||
            userProp?.avatar ||
            undefined,
        }
      : userProp;

  const isAuthenticated =
    status === 'authenticated' ||
    (status !== 'unauthenticated' && isAuthenticatedProp && !!liveUser);

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
        if (!isSearchOpen) {
          setTimeout(() => {
            const input = document.querySelector(
              '.search-overlay-input'
            ) as HTMLInputElement | null;
            input?.focus();
          }, 100);
        }
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsMobileMenuOpen(false);
      }
    },
    [isSearchOpen]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (isSearchOpen || isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isSearchOpen, isMobileMenuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  const handleSearchSubmit = (query: string) => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsSearchOpen(false);
    }
  };

  const vaultHref =
    liveUser?.role === 'DEALER'
      ? '/dealer'
      : liveUser?.role === 'ADMIN'
        ? '/admin'
        : '/dashboard';

  return (
    <>
      {/* ── Top utility bar ── */}
      <div className="hidden lg:block bg-inset border-b border-border/40 py-1.5 text-xs text-secondary font-sans">
        <div className="container-torquens flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <span className="flex items-center gap-1.5 text-emerald">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald animate-pulse" />
              <span className="hidden sm:inline">
                TORQUENS Verified Guarantee Active
              </span>
              <span className="sm:hidden">✓ Verified</span>
            </span>
            <span className="text-border hidden sm:inline">|</span>
            <span className="text-muted hidden sm:inline">Currency:</span>
            <span className="text-primary font-medium">🇳🇬 NGN</span>
          </div>
          <div className="flex items-center space-x-6">
            {!isAuthenticated && (
              <Link
                href="/dealer/register"
                className="hover:text-gold transition-colors hidden md:inline"
              >
                Become a Dealer
              </Link>
            )}
            {isAuthenticated && (
              <Link
                href={vaultHref}
                className="hover:text-gold transition-colors hidden md:inline font-medium"
              >
                Open Private Vault
              </Link>
            )}
            <a
              href="tel:+234800TORQUENS"
              className="flex items-center gap-1 hover:text-primary transition-colors text-xs"
            >
              <PhoneCall size={12} className="text-gold shrink-0" />
              <span className="hidden sm:inline">
                Concierge: +234 800 TORQUENS
              </span>
              <span className="sm:hidden">Call</span>
            </a>
          </div>
        </div>
      </div>

      {/* ── Main header ── */}
      <header
        className={`fixed top-0 lg:top-7 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-obsidian/95 backdrop-blur-md border-b border-border shadow-card py-1.5 sm:py-2'
            : 'bg-obsidian/90 border-b border-border/40 py-2 sm:py-3 md:py-4'
        }`}
      >
        <div className="container-torquens px-2 sm:px-4">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 sm:gap-3 group shrink-0"
            >
              <div className="flex flex-col leading-none">
                <span className="text-base sm:text-xl md:text-2xl font-serif font-light tracking-widest text-primary group-hover:text-gold transition-colors">
                  TORQUENS
                </span>
                <span className="text-[6px] sm:text-[8px] font-sans font-bold tracking-[0.2em] sm:tracking-[0.3em] text-gold uppercase">
                  MOTORS
                </span>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
              {NAV_ITEMS.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href.includes('?') &&
                    pathname.startsWith(item.href.split('?')[0]));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative text-xs uppercase tracking-wider font-medium transition-colors duration-200 py-1 whitespace-nowrap ${
                      isActive
                        ? 'text-gold'
                        : 'text-secondary hover:text-primary'
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

            {/* Desktop search */}
            <div className="hidden md:flex flex-1 max-w-md transition-all duration-300">
              <SearchInput
                placeholder="Search vehicles, brands..."
                onFocus={() => setIsSearchExpanded(true)}
                onBlur={() => setIsSearchExpanded(false)}
                onSubmit={handleSearchSubmit}
              />
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-0.5 sm:gap-1 md:gap-2">
              {/* Mobile search */}
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="md:hidden flex items-center gap-1 sm:gap-2 bg-inset hover:bg-charcoal border border-border hover:border-gold/30 text-secondary hover:text-primary px-2 sm:px-3 py-1 sm:py-1.5 rounded-md transition-all duration-200 text-xs"
                aria-label="Open search"
              >
                <Search size={14} className="text-muted shrink-0" />
                <span className="hidden sm:inline text-muted">Search...</span>
              </button>

              {/* Authenticated quick actions */}
              {isAuthenticated && (
                <>
                  <button
                    type="button"
                    className="relative p-1.5 sm:p-2 text-secondary hover:text-primary transition-colors"
                    aria-label="Notifications"
                  >
                    <Bell size={18} className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                    {unreadNotifications > 0 && (
                      <span className="absolute top-0 right-0 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-red-500 text-[7px] sm:text-[8px] font-bold flex items-center justify-center text-white">
                        {unreadNotifications > 9 ? '9+' : unreadNotifications}
                      </span>
                    )}
                  </button>

                  <Link
                    href="/compare"
                    className="relative p-1.5 sm:p-2 text-secondary hover:text-primary transition-colors hidden xs:inline-flex"
                    aria-label="Compare"
                  >
                    <Layers size={18} className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                    {compareCount > 0 && (
                      <span className="absolute top-0 right-0 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-gold text-obsidian text-[7px] sm:text-[8px] font-bold flex items-center justify-center">
                        {compareCount > 9 ? '9+' : compareCount}
                      </span>
                    )}
                  </Link>

                  <Link
                    href="/dashboard/saved"
                    className="relative p-1.5 sm:p-2 text-secondary hover:text-primary transition-colors hidden xs:inline-flex"
                    aria-label="Saved vehicles"
                  >
                    <Heart size={18} className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                    {savedCount > 0 && (
                      <span className="absolute top-0 right-0 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-gold text-obsidian text-[7px] sm:text-[8px] font-bold flex items-center justify-center">
                        {savedCount > 9 ? '9+' : savedCount}
                      </span>
                    )}
                  </Link>

                  <div className="hidden sm:block w-px h-6 bg-border mx-0.5" />

                  {/* Open Vault CTA (desktop) */}
                  <Link href={vaultHref} className="hidden md:inline-flex">
                    <Button
                      variant="gold"
                      size="sm"
                      className="text-[10px] uppercase tracking-widest font-semibold px-3"
                    >
                      Open Vault
                    </Button>
                  </Link>

                  {/* Avatar chip → profile */}
                  <Link
                    href="/dashboard/profile"
                    className="hidden sm:flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full bg-graphite hover:bg-charcoal border border-border/80 hover:border-gold/40 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center text-gold font-serif text-xs overflow-hidden shrink-0">
                      {liveUser?.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={liveUser.avatar}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        liveUser?.name?.[0]?.toUpperCase() || 'C'
                      )}
                    </div>
                    <div className="hidden lg:flex flex-col text-left leading-tight min-w-0">
                      <span className="text-xs font-medium text-primary truncate max-w-22.5">
                        {liveUser?.name?.split(' ')[0] || 'Client'}
                      </span>
                      <span className="text-[9px] text-gold font-mono uppercase tracking-wider">
                        {liveUser?.tier || 'Tier 1'}
                      </span>
                    </div>
                  </Link>

                  {/* Full user menu (dropdown: profile, settings, sign out) */}
                  <UserMenu
                    user={
                      liveUser
                        ? { ...liveUser, tier: liveUser.tier || 'CUSTOMER' }
                        : null
                    }
                    isAuthenticated={true}
                  />
                </>
              )}

              {/* Guest CTAs — never shown when authenticated */}
              {!isAuthenticated && status !== 'loading' && (
                <>
                  <div className="hidden sm:block w-px h-6 bg-border mx-0.5" />
                  <Link href="/auth/login" className="hidden sm:inline-flex">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[10px] uppercase tracking-widest text-secondary hover:text-primary"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/register" className="hidden sm:inline-flex">
                    <Button
                      variant="gold"
                      size="sm"
                      className="text-[10px] uppercase tracking-widest font-semibold"
                    >
                      Client Access
                    </Button>
                  </Link>
                  {/* Compact guest menu on very small screens via UserMenu */}
                  <div className="sm:hidden">
                    <UserMenu user={null} isAuthenticated={false} />
                  </div>
                </>
              )}

              {/* Session loading shimmer */}
              {status === 'loading' && !isAuthenticated && (
                <div className="hidden sm:flex items-center gap-2">
                  <div className="h-8 w-16 rounded-md bg-charcoal/80 animate-pulse" />
                  <div className="h-8 w-24 rounded-md bg-charcoal/80 animate-pulse" />
                </div>
              )}

              {/* Mobile menu toggle */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-1.5 sm:p-2 text-secondary hover:text-primary transition-colors"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X size={22} className="w-5 h-5" />
                ) : (
                  <Menu size={22} className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Mobile search overlay ── */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-20 md:pt-28 px-3 sm:px-4 bg-obsidian/90 backdrop-blur-md">
          <div
            className="absolute inset-0"
            onClick={() => setIsSearchOpen(false)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-2xl bg-graphite border border-active-border rounded-xl shadow-dropdown overflow-hidden">
            <div className="flex items-center px-3 sm:px-4 py-3 border-b border-border bg-inset">
              <Sparkles size={16} className="text-gold mr-2 sm:mr-3 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search vehicles, makes, models..."
                className="w-full bg-transparent text-primary text-sm placeholder:text-muted focus:outline-none search-overlay-input"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearchSubmit(searchQuery);
                }}
              />
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="text-xs text-muted hover:text-primary px-2 py-1 border border-border rounded"
              >
                ESC
              </button>
            </div>
            <div className="p-3 sm:p-4 space-y-3">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted font-semibold mb-2">
                  Popular Searches
                </p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {QUICK_SEARCH_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setSearchQuery(tag);
                        handleSearchSubmit(tag);
                      }}
                      className="text-xs bg-charcoal hover:bg-border text-secondary hover:text-gold px-2 sm:px-3 py-1 sm:py-1.5 rounded-md border border-border transition-all"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-gold/5 border border-gold/20 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <Sparkles size={14} className="text-gold shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-primary">AI Search</p>
                    <p className="text-[10px] text-secondary truncate">
                      Natural language vehicle search
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleSearchSubmit(searchQuery)}
                  className="text-xs bg-gold text-obsidian px-2 sm:px-3 py-1.5 rounded flex items-center gap-1 font-medium shrink-0"
                >
                  Search <ArrowRight size={12} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        isAuthenticated={isAuthenticated}
        user={liveUser}
      />
    </>
  );
}

export default Header;