/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, AlertCircle, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { verifyEmail } from '@/actions/auth';

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your vault credentials with the registry...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('The cryptographic access token is missing from the query path.');
      return;
    }

    async function executeVerification() {
      try {
        const result = await verifyEmail(token!);
        if (result.success) {
          setStatus('success');
          setMessage(result.message || 'Identity confirmed. Access to the private garage has been initialized.');
          return;
        }

        // Fallback api call
        const res = await fetch(`/api/auth/verify?token=${token}`);
        const data = await res.json();

        if (res.ok && data.success) {
          setStatus('success');
          setMessage(data.message || 'Email verified successfully.');
        } else {
          setStatus('error');
          setMessage(data.message || 'Token is invalid or has expired.');
        }
      } catch (err) {
        setStatus('error');
        setMessage('Network error verifying credentials.');
      }
    }

    executeVerification();
  }, [token]);

  return (
    <Card className="p-8 bg-graphite/95 border-border/80 text-center shadow-dropdown backdrop-blur-md max-w-md w-full animate-slide-up">
      {status === 'loading' && (
        <div className="py-8 space-y-4">
          <Loader2 className="h-10 w-10 text-gold animate-spin mx-auto" />
          <h2 className="text-xl font-serif text-primary">Verifying Identity</h2>
          <p className="text-xs text-muted font-sans leading-relaxed">{message}</p>
        </div>
      )}

      {status === 'success' && (
        <div className="py-4 space-y-4 animate-fade-in">
          <div className="w-14 h-14 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto shadow-glow">
            <CheckCircle2 className="h-7 w-7 text-gold" />
          </div>
          <Badge variant="gold" size="sm" leftIcon={<ShieldCheck className="h-3 w-3" />}>
            Vault Verified
          </Badge>
          <h2 className="text-2xl font-serif text-primary">Access Granted</h2>
          <p className="text-xs text-secondary font-sans leading-relaxed">{message}</p>
          <Link href="/auth/login" className="block pt-4">
            <Button variant="gold" fullWidth rightIcon={<ArrowRight className="h-4 w-4" />}>
              Proceed to Sign In
            </Button>
          </Link>
        </div>
      )}

      {status === 'error' && (
        <div className="py-4 space-y-4 animate-fade-in">
          <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
            <AlertCircle className="h-7 w-7 text-red-400" />
          </div>
          <Badge variant="danger" size="sm">Verification Failed</Badge>
          <h2 className="text-2xl font-serif text-primary">Authentication Error</h2>
          <p className="text-xs text-secondary font-sans leading-relaxed">{message}</p>
          <Link href="/auth/login" className="block pt-4">
            <Button variant="secondary" fullWidth>
              Return to Login
            </Button>
          </Link>
        </div>
      )}
    </Card>
  );
}

export default function VerifyPage() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16 bg-obsidian">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-140 h-140 bg-radial-hero opacity-30 blur-3xl"
      />
      
      <Suspense fallback={<Loader2 className="h-8 w-8 text-gold animate-spin" />}>
        <VerifyContent />
      </Suspense>
    </div>
  );
}