import React from 'react';
import Link from 'next/link';
import { Compass, ArrowLeft, Car } from 'lucide-react';

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="min-h-[75vh] flex items-center justify-center px-4 py-20 bg-obsidian"
    >
      <div className="max-w-md w-full text-center space-y-6">
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-2xl bg-graphite border border-border/80 text-gold shadow-dropdown">
          <Compass className="h-10 w-10 animate-pulse" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono tracking-widest uppercase text-gold">
            Error 404 · Navigation Lost
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-light text-primary tracking-tight">
            Off the Beaten Track
          </h1>
          <p className="text-xs sm:text-sm text-secondary font-sans leading-relaxed">
            The vehicle dossier or page you are seeking does not exist in the TORQUENS registry or has been relocated.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-gold text-obsidian font-mono text-xs uppercase font-semibold hover:bg-gold-hover transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Return to Concierge
          </Link>

          <Link
            href="/vehicles"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-graphite border border-border text-primary font-mono text-xs uppercase font-semibold hover:border-gold/40 transition-colors"
          >
            <Car className="h-3.5 w-3.5" />
            Explore Showroom
          </Link>
        </div>
      </div>
    </main>
  );
}