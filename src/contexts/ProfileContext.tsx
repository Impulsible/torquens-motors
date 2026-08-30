/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

export interface ProfileData {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  avatar?: string | null;
  role?: string;
  createdAt?: string;
}

interface ProfileContextValue {
  profile: ProfileData | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateProfile: (updates: Partial<ProfileData>) => void;
}

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (status !== 'authenticated') {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch('/api/user/profile', {
        cache: 'no-store',
      });
      const json = await res.json();

      if (res.ok && json.success) {
        setProfile(json.data);
      } else {
        setError(json.message || 'Failed to load profile data.');
      }
    } catch (err) {
      console.error('Profile fetch failed:', err);
      setError('Network error retrieving profile.');
    } finally {
      setIsLoading(false);
    }
  }, [status]);

  const updateProfile = useCallback((updates: Partial<ProfileData>) => {
    setProfile((prev) => (prev ? { ...prev, ...updates } : (updates as ProfileData)));
  }, []);

  useEffect(() => {
    if (status === 'authenticated') {
      refresh();
    } else if (status === 'unauthenticated') {
      setProfile(null);
      setIsLoading(false);
    }
  }, [status, session?.user?.email, refresh]);

  const value: ProfileContextValue = {
    profile,
    isLoading,
    error,
    refresh,
    updateProfile,
  };

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return ctx;
}