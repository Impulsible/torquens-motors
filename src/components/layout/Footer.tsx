'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowUp,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa';

export function Footer() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const currentYear = new Date().getFullYear();

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail('');
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-obsidian border-t border-border relative overflow-hidden">
      {/* ----------------------------------------------------------------- */}
      {/* 1. TOP VISUAL DIVIDER (Checkerboard + Subtle Gradient Ambient)    */}
      {/* ----------------------------------------------------------------- */}
      <div className="relative h-10 w-full overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 checkerboard-bg opacity-15" />
        <div className="absolute inset-0 bg-linear-to-b from-obsidian via-transparent to-obsidian" />
      </div>

      <div className="container-torquens pt-12 pb-16">
        {/* ----------------------------------------------------------------- */}
        {/* 2. PRIVATE OFF-MARKET INVENTORY NEWSLETTER CAPTURE                */}
        {/* ----------------------------------------------------------------- */}
        <div className="mb-14 p-6 sm:p-10 rounded-2xl bg-graphite border border-active-border relative overflow-hidden shadow-card">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-gold/5 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-7 space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs font-sans font-semibold uppercase tracking-widest">
                <Sparkles size={13} />
                Private Concierge Registry
              </div>
              <h3 className="text-2xl sm:text-3xl font-serif font-light text-primary">
                Receive Off-Market Allocations
              </h3>
              <p className="text-secondary text-xs sm:text-sm font-sans max-w-xl leading-relaxed">
                Subscribe to receive private alerts for rare luxury inventory drops, unlisted exotic cars, and exclusive price adjustments across Nigeria & international hubs.
              </p>
            </div>

            <div className="lg:col-span-5">
              {isSubscribed ? (
                <div className="p-4 rounded-lg bg-emerald/10 border border-emerald/30 text-emerald flex items-center gap-3 animate-in fade-in duration-300">
                  <CheckCircle2 size={20} className="shrink-0" />
                  <span className="text-xs font-sans font-medium">
                    You have been enrolled in the Private Registry.
                  </span>
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2.5">
                  <div className="relative flex-1">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address..."
                      className="w-full bg-inset text-primary text-xs sm:text-sm px-4 py-3.5 rounded-md border border-border focus:border-gold focus:outline-none transition-colors placeholder:text-muted font-sans"
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn-primary text-xs uppercase tracking-widest font-semibold py-3.5 px-6 shrink-0 flex items-center justify-center gap-2"
                  >
                    <span>Request Access</span>
                    <ArrowRight size={14} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* 3. TRUST & MARKETPLACE SAFETY HIGHLIGHTS                           */}
        {/* ----------------------------------------------------------------- */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-8 mb-14 border-y border-border/60">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center text-gold shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 className="text-xs font-sans font-semibold uppercase tracking-wider text-primary">
                100% Verified Vehicles
              </h4>
              <p className="text-[11px] text-secondary font-sans mt-0.5">
                Chassis, title & documentation verified.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-emerald/10 border border-emerald/30 flex items-center justify-center text-emerald shrink-0">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <h4 className="text-xs font-sans font-semibold uppercase tracking-wider text-primary">
                Concierge Inspection
              </h4>
              <p className="text-[11px] text-secondary font-sans mt-0.5">
                Comprehensive 150-point technical check.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center text-gold shrink-0">
              <Lock size={20} />
            </div>
            <div>
              <h4 className="text-xs font-sans font-semibold uppercase tracking-wider text-primary">
                Secured Marketplace
              </h4>
              <p className="text-[11px] text-secondary font-sans mt-0.5">
                Protected buyer-dealer enquiries.
              </p>
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* 4. MAIN NAVIGATION MATRIX                                         */}
        {/* ----------------------------------------------------------------- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 mb-14">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block focus:outline-none">
              <div className="flex flex-col">
                <span className="text-2xl font-serif font-light tracking-[0.2em] text-primary">
                  TORQUENS
                </span>
                <span className="text-[10px] font-sans font-extrabold tracking-[0.35em] text-gold uppercase -mt-1">
                  MOTORS
                </span>
              </div>
            </Link>

            <p className="text-xs text-secondary font-sans leading-relaxed max-w-sm">
              Engineered to Move. Premium automotive marketplace connecting discerning luxury buyers with verified dealers across Africa and beyond.
            </p>

            <div className="pt-2 flex items-center gap-2">
              <span className="badge-verified">✓ Verified Dealer Network</span>
            </div>

            {/* Social Icons using react-icons/fa */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="#"
                className="w-9 h-9 rounded-md bg-charcoal border border-border flex items-center justify-center text-secondary hover:text-gold hover:border-gold transition-all duration-300"
                aria-label="Facebook"
              >
                <FaFacebook className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-md bg-charcoal border border-border flex items-center justify-center text-secondary hover:text-gold hover:border-gold transition-all duration-300"
                aria-label="Twitter"
              >
                <FaTwitter className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-md bg-charcoal border border-border flex items-center justify-center text-secondary hover:text-gold hover:border-gold transition-all duration-300"
                aria-label="Instagram"
              >
                <FaInstagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-md bg-charcoal border border-border flex items-center justify-center text-secondary hover:text-gold hover:border-gold transition-all duration-300"
                aria-label="Youtube"
              >
                <FaYoutube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-sans font-semibold uppercase tracking-[0.2em] text-gold mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {[
                { label: 'Browse Vehicles', href: '/vehicles' },
                { label: 'Curated Collections', href: '/collections' },
                { label: 'Find Verified Dealers', href: '/dealers' },
                { label: 'Sell / Trade Vehicle', href: '/sell' },
                { label: 'Vehicle Comparison Engine', href: '/compare' },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs text-secondary hover:text-primary transition-colors font-sans gold-underline inline-block py-0.5"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-xs font-sans font-semibold uppercase tracking-[0.2em] text-gold mb-4">
              Support & Legal
            </h3>
            <ul className="space-y-2.5">
              {[
                { label: 'Marketplace FAQ', href: '/faq' },
                { label: 'Concierge Contact', href: '/contact' },
                { label: 'Inspection Verification', href: '/verification' },
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Terms of Service', href: '/terms' },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs text-secondary hover:text-primary transition-colors font-sans gold-underline inline-block py-0.5"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Hubs */}
          <div>
            <h3 className="text-xs font-sans font-semibold uppercase tracking-[0.2em] text-gold mb-4">
              Concierge Hubs
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-xs text-secondary font-sans">
                <MapPin className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                <div>
                  <span className="text-primary font-medium block">Lagos HQ:</span>
                  <span>Victoria Island, Lagos</span>
                </div>
              </li>
              <li className="flex items-start gap-2.5 text-xs text-secondary font-sans">
                <MapPin className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                <div>
                  <span className="text-primary font-medium block">Abuja Hub:</span>
                  <span>Maitama, Abuja, FCT</span>
                </div>
              </li>
              <li className="flex items-center gap-2.5 text-xs text-secondary font-sans pt-1">
                <Phone className="w-4 h-4 text-gold shrink-0" />
                <a href="tel:+2348001234567" className="hover:text-primary transition-colors">
                  +234 800 123 4567
                </a>
              </li>
              <li className="flex items-center gap-2.5 text-xs text-secondary font-sans">
                <Mail className="w-4 h-4 text-gold shrink-0" />
                <a href="mailto:info@torquens.com" className="hover:text-primary transition-colors">
                  info@torquens.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* 5. BOTTOM BAR (Copyright, Policy Links, Scroll-to-Top)             */}
        {/* ----------------------------------------------------------------- */}
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans text-muted">
          <p>&copy; {currentYear} TORQUENS MOTORS. All rights reserved.</p>

          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-primary transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-primary transition-colors">
              Terms
            </Link>
            <Link href="/cookies" className="hover:text-primary transition-colors">
              Cookies
            </Link>

            {/* Back to top trigger */}
            <button
              onClick={scrollToTop}
              aria-label="Scroll to top"
              className="p-2 rounded-md bg-graphite border border-border text-secondary hover:text-gold hover:border-gold/40 transition-all duration-200 ml-2"
            >
              <ArrowUp size={14} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;