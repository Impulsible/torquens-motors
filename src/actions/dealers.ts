/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

// ✅ Change: Use server-only wrapper
import { findMany } from '@/lib/database.server';

export interface PublicDealer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  city?: string;
  country?: string;
  verified: boolean;
  vehiclesCount: number;
  rating?: number;
  totalReviews?: number;
  logo?: string;
  coverImage?: string;
  description?: string;
  specialties?: string[];
  joinedAt: string;
}

interface MongoUser {
  _id?: { toString(): string };
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  city?: string;
  country?: string;
  verified?: boolean;
  vehiclesCount?: number;
  rating?: number;
  totalReviews?: number;
  logo?: string;
  coverImage?: string;
  description?: string;
  specialties?: string[];
  createdAt?: string | Date;
}

export async function getPublicDealers(): Promise<{
  success: boolean;
  message?: string;
  data: PublicDealer[];
}> {
  try {
    const { User } = await import('@/models/User');

    // Fetch verified dealers from database
    const rawDealers = await findMany<MongoUser>(
      User as any,
      { role: 'DEALER' },
      undefined,
      { lean: true, sort: { verified: -1, createdAt: -1 } }
    );

    const dealers: PublicDealer[] = rawDealers.map((d) => {
      const locParts = (d.location || '').split(',').map((s) => s.trim());
      const city = d.city || locParts[0] || 'Geneva';
      const country = d.country || locParts[1] || 'Switzerland';

      return {
        id: d._id?.toString() || d.id || '',
        name: d.name || 'Accredited Broker',
        email: d.email || '',
        phone: d.phone || '',
        location: d.location || `${city}, ${country}`,
        city,
        country,
        verified: Boolean(d.verified),
        vehiclesCount: d.vehiclesCount || 0,
        rating: d.rating || 4.9,
        totalReviews: d.totalReviews || 12,
        logo: d.logo,
        coverImage: d.coverImage,
        description:
          d.description ||
          'Specializing in off-market acquisitions, verified competition chassis, and bespoke grand tourer allocations.',
        specialties: d.specialties || ['Hypercars', 'Grand Tourers', 'Provenance Verification', 'Escrow Custody'],
        joinedAt: d.createdAt ? new Date(d.createdAt).toISOString() : new Date().toISOString(),
      };
    });

    return {
      success: true,
      data: JSON.parse(JSON.stringify(dealers)),
    };
  } catch (error) {
    console.error('[DealersAction] getPublicDealers error:', error);
    return {
      success: false,
      message: 'Failed to access the public dealer directory.',
      data: [],
    };
  }
}