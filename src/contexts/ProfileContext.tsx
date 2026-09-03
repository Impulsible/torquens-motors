'use client';
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */


import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
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

function profileFromSession(session: any): ProfileData | null {
  if (!session?.user) return null;
  return {
    id: session.user.id || 'user-1',
    name: session.user.name || 'Verified Client',
    email: session.user.email || '',
    phone: '',
    location: 'Lagos, Nigeria',
    avatar: session.user.image || null,
    role: session.user.role || 'CUSTOMER',
  };
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    // Still resolving NextAuth session
    if (status === 'loading') {
      setIsLoading(true);
      return;
    }

    // Logged out
    if (status === 'unauthenticated') {
      setProfile(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const res = await fetch('/api/user/profile', {
        cache: 'no-store',
        credentials: 'include',
      });

      const json = await res.json().catch(() => ({}));

      if (res.ok && (json.success || json.data || json.profile)) {
        const data = json.data || json.profile || json;
        setProfile({
          id: data.id,
          name: data.name || session?.user?.name || 'Verified Client',
          email: data.email || session?.user?.email || '',
          phone: data.phone || '',
          location: data.location || 'Lagos, Nigeria',
          avatar: data.avatar ?? session?.user?.image ?? null,
          role: data.role || (session?.user as any)?.role || 'CUSTOMER',
          createdAt: data.createdAt,
        });
      } else {
        // API failed → fall back to session so UI still works
        const fallback = profileFromSession(session);
        setProfile(fallback);
        if (res.status >= 500) {
          setError(json.message || 'Failed to load profile data.');
        }
      }
    } catch (err) {
      console.warn('Profile fetch handled gracefully:', err);
      setProfile(profileFromSession(session));
      setError(null);
    } finally {
      setIsLoading(false);
    }
  }, [status, session]);

  const updateProfile = useCallback((updates: Partial<ProfileData>) => {
    setProfile((prev) => (prev ? { ...prev, ...updates } : (updates as ProfileData)));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value: ProfileContextValue = {
    profile,
    isLoading,
    error,
    refresh,
    updateProfile,
  };

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return ctx;
}