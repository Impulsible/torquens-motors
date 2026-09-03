'use client';

import React from 'react';
import Link from 'next/link';
import { Compass, ArrowLeft, Car } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="min-h-[75vh] flex items-center justify-center px-4 py-20"
    >
      <div className="max-w-md w-full text-center space-y-6">
        {/* Visual Badge */}
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-2xl bg-graphite border border-border/80 text-gold shadow-dropdown">
          <Compass className="h-10 w-10 animate-pulse" />
        </div>

        {/* Heading & Code */}
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

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link href="/" className="w-full sm:w-auto">
            <Button
              variant="gold"
              size="md"
              fullWidth
              className="text-xs uppercase tracking-wider font-mono"
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
              Return to Concierge
            </Button>
          </Link>

          <Link href="/vehicles" className="w-full sm:w-auto">
            <Button
              variant="secondary"
              size="md"
              fullWidth
              className="text-xs uppercase tracking-wider font-mono border-border hover:border-gold/30"
            >
              <Car className="h-3.5 w-3.5 mr-1.5" />
              Explore Showroom
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}