import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/auth/config';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';
import type { Document } from 'mongoose';

// Extended interface to resolve TS 2339
interface ProfileUserDocument extends Document {
  name: string;
  email: string;
  phone?: string;
  location?: string;
  avatar?: string | null;
  image?: string | null;
  role?: string;
}

export async function GET() {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const user = (await User.findOne({ email: session.user.email }).lean()) as unknown as ProfileUserDocument | null;

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        location: user.location || '',
        avatar: user.avatar || user.image || null,
        role: user.role || 'CUSTOMER',
      },
    });
  } catch (error: unknown) {
    console.error('❌ Profile GET Error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { name, phone, location } = await request.json();

    if (!name || name.trim().length < 2) {
      return NextResponse.json({ success: false, message: 'Name must be at least 2 characters' }, { status: 400 });
    }

    await connectToDatabase();
    const user = (await User.findOne({ email: session.user.email })) as unknown as ProfileUserDocument | null;

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    user.name = name.trim();
    user.phone = phone?.trim() || undefined;
    user.location = location?.trim() || undefined;
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        location: user.location || '',
        avatar: user.avatar || user.image || null,
      },
    });
  } catch (error: unknown) {
    console.error('❌ Profile PUT Error:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}