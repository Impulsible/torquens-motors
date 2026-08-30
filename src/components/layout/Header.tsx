/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
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
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

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
  'Range Rover',
  'Low Mileage',
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
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setIsSearchOpen((prev) => !prev);
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
    if (e.key === 'Escape') {
      setIsSearchOpen(false);
      setIsMobileMenuOpen(false);
    }
  }, []);

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

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  const handleSearchSubmit = (query: string) => {
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/vehicles?search=${encodeURIComponent(trimmed)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const vaultHref =
    liveUser?.role === 'DEALER'
      ? '/dealer'
      : liveUser?.role === 'ADMIN'
      ? '/admin'
      : '/dashboard';

  return (
    <>
      <div className="hidden lg:block bg-inset border-b border-border/40 py-1.5 text-xs text-secondary font-sans">
        <div className="container-torquens flex justify-between items-center">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-emerald">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald animate-pulse" />
              TORQUENS Verified Guarantee Active
            </span>
            <span className="text-border">|</span>
            <span className="text-muted">Marketplace Currency:</span>
            <span className="text-primary font-medium tracking-wide">🇳🇬 NGN (₦)</span>
          </div>

          <div className="flex items-center gap-6">
            {!isAuthenticated ? (
              <Link href="/dealer/register" className="hover:text-gold transition-colors">
                Become a Verified Dealer
              </Link>
            ) : (
              <Link href={vaultHref} className="hover:text-gold transition-colors font-medium">
                Open Private Vault
              </Link>
            )}
            <span className="text-border">|</span>
            <a href="tel:+234800TORQUENS" className="flex items-center gap-1.5 hover:text-primary transition-colors">
              <PhoneCall size={12} className="text-gold" />
              Concierge: +234 (0) 800 TORQUENS
            </a>
          </div>
        </div>
      </div>

      <header
        className={cn(
          'fixed top-0 lg:top-8.25 left-0 right-0 z-50 transition-all duration-300',
          isScrolled
            ? 'bg-obsidian/95 backdrop-blur-md border-b border-border shadow-card py-2.5'
            : 'bg-obsidian/90 border-b border-border/40 py-3 md:py-4'
        )}
      >
        <div className="container-torquens">
          <div className="flex items-center justify-between gap-3 md:gap-4 min-w-0">
            <Link
              href="/"
              className="flex items-center gap-2 group shrink-0 focus:outline-none"
              aria-label="TORQUENS MOTORS Home"
            >
              <div className="flex flex-col leading-none">
                <span className="text-lg sm:text-xl md:text-2xl font-serif font-light tracking-[0.2em] text-primary group-hover:text-gold transition-colors duration-300">
                  TORQUENS
                </span>
                <span className="text-[8px] sm:text-[9px] font-sans font-extrabold tracking-[0.3em] text-gold uppercase mt-0.5">
                  MOTORS
                </span>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-5 xl:gap-8 flex-1 justify-center min-w-0">
              {NAV_ITEMS.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href.includes('?') &&
                    pathname.startsWith(item.href.split('?')[0]));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'relative text-xs uppercase tracking-widest font-medium transition-colors duration-200 py-1 whitespace-nowrap shrink-0',
                      isActive ? 'text-gold' : 'text-secondary hover:text-primary'
                    )}
                  >
                    {item.label}
                    {item.badge && (
                      <span className="ml-1.5 px-1.5 py-0.5 text-[9px] font-bold bg-gold/15 text-gold border border-gold/30 rounded">
                        {item.badge}
                      </span>
                    )}
                    {isActive && (
                      <span className="absolute -bottom-0.5 left-0 w-full h-0.5 bg-gold rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center justify-end gap-1.5 sm:gap-2 md:gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="hidden md:flex items-center gap-2 bg-inset hover:bg-charcoal border border-border hover:border-active-border text-secondary px-3 py-2 rounded-lg transition-all duration-200 text-xs font-sans shrink-0"
                aria-label="Open search"
              >
                <Search size={14} className="text-muted" />
                <span className="text-muted hidden lg:inline">Search inventory...</span>
                <kbd className="hidden xl:inline-flex items-center gap-0.5 bg-obsidian border border-border px-1.5 py-0.5 rounded text-[10px] text-muted font-mono">
                  ⌘K
                </kbd>
              </button>

              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg bg-inset border border-border text-secondary hover:text-gold hover:border-gold/40 transition-all duration-200 shrink-0"
                aria-label="Open search"
              >
                <Search size={16} />
              </button>

              {isAuthenticated && liveUser ? (
                <>
                  <Link
                    href="/compare"
                    className="relative hidden md:flex items-center justify-center w-9 h-9 rounded-lg text-secondary hover:text-gold transition-colors shrink-0"
                    aria-label="Compare vehicles"
                  >
                    <Layers size={17} />
                    {compareCount > 0 && (
                      <span className="absolute top-0.5 right-0.5 min-w-4 h-4 px-1 rounded-full bg-gold text-obsidian text-[9px] font-bold flex items-center justify-center">
                        {compareCount > 9 ? '9+' : compareCount}
                      </span>
                    )}
                  </Link>

                  <Link
                    href="/dashboard/saved"
                    className="relative hidden md:flex items-center justify-center w-9 h-9 rounded-lg text-secondary hover:text-gold transition-colors shrink-0"
                    aria-label="Saved vehicles"
                  >
                    <Heart size={17} />
                    {savedCount > 0 && (
                      <span className="absolute top-0.5 right-0.5 min-w-4 h-4 px-1 rounded-full bg-gold text-obsidian text-[9px] font-bold flex items-center justify-center">
                        {savedCount > 9 ? '9+' : savedCount}
                      </span>
                    )}
                  </Link>

                  <button
                    type="button"
                    className="relative hidden md:flex items-center justify-center w-9 h-9 rounded-lg text-secondary hover:text-gold transition-colors shrink-0"
                    aria-label="Notifications"
                  >
                    <Bell size={17} />
                    {unreadNotifications > 0 && (
                      <span className="absolute top-0.5 right-0.5 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                        {unreadNotifications > 9 ? '9+' : unreadNotifications}
                      </span>
                    )}
                  </button>

                  <div className="hidden md:block w-px h-5 bg-border mx-0.5 shrink-0" />

                  <UserMenu
                    user={{ ...liveUser, tier: liveUser.tier || 'Tier 1' }}
                    isAuthenticated={true}
                    onSignOut={handleSignOut}
                    className="shrink-0"
                  />
                </>
              ) : (
                status !== 'loading' && (
                  <div className="hidden sm:flex items-center gap-2 shrink-0">
                    <Link href="/auth/login">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs uppercase tracking-widest text-secondary hover:text-primary font-medium px-2.5"
                      >
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/auth/register">
                      <Button
                        variant="gold"
                        size="sm"
                        className="text-xs uppercase tracking-widest font-semibold whitespace-nowrap"
                      >
                        Client Access
                      </Button>
                    </Link>
                  </div>
                )
              )}

              {status === 'loading' && !isAuthenticated && (
                <div className="hidden sm:flex items-center gap-2 shrink-0">
                  <div className="h-8 w-16 rounded-md bg-charcoal/80 animate-pulse" />
                  <div className="h-8 w-24 rounded-md bg-charcoal/80 animate-pulse" />
                </div>
              )}

              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg text-secondary hover:text-gold transition-colors shrink-0 -mr-1"
                aria-label="Toggle navigation menu"
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-20 md:pt-28 px-4 bg-obsidian/90 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="absolute inset-0"
            onClick={() => setIsSearchOpen(false)}
            aria-hidden="true"
          />

          <div className="relative w-full max-w-2xl bg-graphite border border-active-border rounded-xl shadow-dropdown overflow-hidden z-10">
            <div className="flex items-center px-4 py-3.5 border-b border-border bg-inset">
              <Sparkles className="text-gold mr-3 shrink-0" size={18} />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearchSubmit(searchQuery);
                }}
                placeholder="Search vehicles, or try natural language..."
                className="w-full bg-transparent text-primary text-sm font-sans placeholder:text-muted focus:outline-none"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="text-xs text-muted hover:text-primary px-2 py-1 border border-border rounded font-mono transition-colors"
              >
                ESC
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <span className="text-[11px] font-sans uppercase tracking-widest text-muted font-semibold block mb-2.5">
                  Popular Searches
                </span>
                <div className="flex flex-wrap gap-2">
                  {QUICK_SEARCH_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleSearchSubmit(tag)}
                      className="text-xs font-sans bg-charcoal hover:bg-border text-secondary hover:text-gold px-3 py-1.5 rounded-md border border-border hover:border-gold/30 transition-all duration-150 flex items-center gap-1.5"
                    >
                      <Search size={12} className="text-muted" />
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-gold/5 border border-gold/20 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-gold shrink-0">
                    <Sparkles size={15} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-primary font-sans">
                      TORQUENS Intelligence
                    </h4>
                    <p className="text-[11px] text-secondary truncate">
                      Natural language vehicle search
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleSearchSubmit(searchQuery)}
                  className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1 shrink-0"
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
        onSignOut={handleSignOut}
      />
    </>
  );
}

export default Header;