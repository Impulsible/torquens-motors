'use client';
/* eslint-disable @typescript-eslint/no-unused-vars */
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
import { cn } from '@/utils/cn';

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

  const quickLinks = [
    { label: 'Browse Vehicles', href: '/vehicles' },
    { label: 'Curated Collections', href: '/collections' },
    { label: 'Find Verified Dealers', href: '/dealers' },
    { label: 'Sell / Trade Vehicle', href: '/sell-trade' },
    { label: 'Vehicle Comparison Engine', href: '/compare' },
  ];

  const supportLinks = [
    { label: 'Marketplace FAQ', href: '/faq' },
    { label: 'Concierge Contact', href: '/contact' },
    { label: 'Inspection Verification', href: '/verification' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ];

  return (
    <footer className="w-full bg-obsidian border-t border-border/70 mt-auto">
      {/* Top Visual Divider */}
      <div className="relative h-1 w-full overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-linear-to-r from-transparent via-gold/30 to-transparent" />
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* NEWSLETTER CAPTURE */}
        <div className="mb-12 p-6 sm:p-8 lg:p-10 rounded-2xl bg-graphite border border-active-border relative overflow-hidden shadow-card">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -right-24 rounded-full bg-gold/5 blur-3xl"
            style={{ width: 288, height: 288 }}
          />

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
                <div className="p-4 rounded-lg bg-emerald/10 border border-emerald/30 text-emerald flex items-center gap-3 animate-fade-in">
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
                    className="bg-gold text-obsidian font-semibold text-xs uppercase tracking-widest py-3.5 px-6 rounded-md shrink-0 flex items-center justify-center gap-2 hover:bg-gold-hover transition-all duration-300 cursor-pointer"
                  >
                    <span>Request Access</span>
                    <ArrowRight size={14} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* TRUST HIGHLIGHTS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-8 mb-12 border-y border-border/60">
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

        {/* NAVIGATION MATRIX */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block focus:outline-none cursor-pointer">
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

            <div className="pt-1 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-bg border border-emerald-border text-emerald text-[10px] font-semibold uppercase tracking-wider">
                <CheckCircle2 size={12} />
                Verified Dealer Network
              </span>
            </div>

            <div className="flex items-center gap-2.5 pt-1">
              {[
                { Icon: FaFacebook, label: 'Facebook' },
                { Icon: FaTwitter, label: 'Twitter' },
                { Icon: FaInstagram, label: 'Instagram' },
                { Icon: FaYoutube, label: 'Youtube' },
              ].map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  className="w-9 h-9 rounded-md bg-charcoal border border-border flex items-center justify-center text-secondary hover:text-gold hover:border-gold transition-all duration-300 cursor-pointer"
                  aria-label={label}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-sans font-semibold uppercase tracking-[0.2em] text-gold mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs text-secondary hover:text-primary transition-colors font-sans inline-block cursor-pointer"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h3 className="text-xs font-sans font-semibold uppercase tracking-[0.2em] text-gold mb-4">
              Support & Legal
            </h3>
            <ul className="space-y-2.5">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs text-secondary hover:text-primary transition-colors font-sans inline-block cursor-pointer"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Concierge Hubs */}
          <div>
            <h3 className="text-xs font-sans font-semibold uppercase tracking-[0.2em] text-gold mb-4">
              Concierge Hubs
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-xs text-secondary font-sans leading-snug">
                <MapPin className="w-3.5 h-3.5 text-gold shrink-0 mt-0.5" />
                <div>
                  <span className="text-primary font-medium block">Lagos HQ:</span>
                  <span>Victoria Island, Lagos</span>
                </div>
              </li>
              <li className="flex items-start gap-2 text-xs text-secondary font-sans leading-snug">
                <MapPin className="w-3.5 h-3.5 text-gold shrink-0 mt-0.5" />
                <div>
                  <span className="text-primary font-medium block">Abuja Hub:</span>
                  <span>Maitama, Abuja, FCT</span>
                </div>
              </li>
              <li className="flex items-center gap-2 text-xs text-secondary font-sans pt-0.5">
                <Phone className="w-3.5 h-3.5 text-gold shrink-0" />
                <a href="tel:+2348001234567" className="hover:text-primary transition-colors cursor-pointer font-mono">
                  +234 800 123 4567
                </a>
              </li>
              <li className="flex items-center gap-2 text-xs text-secondary font-sans">
                <Mail className="w-3.5 h-3.5 text-gold shrink-0" />
                <a href="mailto:info@torquens.com" className="hover:text-primary transition-colors cursor-pointer">
                  info@torquens.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans text-muted">
          <p>&copy; {currentYear} TORQUENS MOTORS. All rights reserved.</p>

          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-primary transition-colors cursor-pointer">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-primary transition-colors cursor-pointer">
              Terms
            </Link>
            <Link href="/cookies" className="hover:text-primary transition-colors cursor-pointer">
              Cookies
            </Link>

            <button
              onClick={scrollToTop}
              aria-label="Scroll to top"
              className="p-2 rounded-md bg-graphite border border-border text-secondary hover:text-gold hover:border-gold/40 transition-all duration-200 ml-2 cursor-pointer"
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
