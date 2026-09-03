/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/auth/config';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';
import type { Document } from 'mongoose';

interface ProfileUserDocument extends Document {
  name: string;
  email: string;
  phone?: string;
  location?: string;
  avatar?: string | null;
  image?: string | null;
  role?: string;
  createdAt?: Date;
}

function buildProfile(user: Partial<ProfileUserDocument> | null, sessionUser?: any) {
  return {
    id: (user as any)?._id?.toString?.() || sessionUser?.id || 'client-1',
    name: user?.name || sessionUser?.name || 'Verified Client',
    email: user?.email || sessionUser?.email || '',
    phone: user?.phone || '',
    location: user?.location || 'Lagos, Nigeria',
    avatar: user?.avatar || user?.image || sessionUser?.image || null,
    role: user?.role || sessionUser?.role || 'CUSTOMER',
    createdAt: user?.createdAt ? new Date(user.createdAt).toISOString() : undefined,
  };
}

export async function GET() {
  try {
    const session = await getServerSession(authConfig);

    // No session → guest profile (200, not 401/404)
    if (!session?.user?.email) {
      const guest = {
        id: 'guest',
        name: 'Guest Client',
        email: '',
        phone: '',
        location: 'Lagos, Nigeria',
        avatar: null,
        role: 'GUEST',
      };
      return NextResponse.json({ success: true, data: guest, profile: guest });
    }

    let dbUser: ProfileUserDocument | null = null;

    try {
      await connectToDatabase();
      dbUser = (await User.findOne({ email: session.user.email }).lean()) as unknown as ProfileUserDocument | null;
    } catch (dbError) {
      console.warn('Profile DB lookup failed, using session fallback:', dbError);
    }

    // Session exists even if DB user is missing → still 200 with session data
    const profile = buildProfile(dbUser, session.user);

    return NextResponse.json({
      success: true,
      data: profile,
      profile,
    });
  } catch (error: unknown) {
    console.error('❌ Profile GET Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, location, avatar } = body;

    if (!name || String(name).trim().length < 2) {
      return NextResponse.json(
        { success: false, message: 'Name must be at least 2 characters' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const user = (await User.findOne({ email: session.user.email })) as unknown as ProfileUserDocument | null;

    if (!user) {
      // Create minimal profile if missing
      const created = await (User as any).create({
        email: session.user.email,
        name: String(name).trim(),
        phone: phone?.trim() || undefined,
        location: location?.trim() || undefined,
        avatar: avatar || session.user.image || null,
        role: (session.user as any).role || 'CUSTOMER',
      });

      const profile = buildProfile(created, session.user);
      return NextResponse.json({
        success: true,
        message: 'Profile created successfully',
        data: profile,
        profile,
      });
    }

    user.name = String(name).trim();
    user.phone = phone?.trim() || undefined;
    user.location = location?.trim() || undefined;
    if (avatar !== undefined) user.avatar = avatar;
    await user.save();

    const profile = buildProfile(user, session.user);

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: profile,
      profile,
    });
  } catch (error: unknown) {
    console.error('❌ Profile PUT Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}