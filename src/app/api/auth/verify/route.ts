import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    console.log('🔍 Executing token verification for:', token);

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication verification token is missing.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      console.log('❌ Invalid or expired token query attempt');
      return NextResponse.json(
        { success: false, message: 'Verification link is invalid or has expired.' },
        { status: 400 }
      );
    }

    // Set boolean flag matching IUserDocument
    user.emailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    console.log(`✅ Verification successful for client: ${user.email}`);

    return NextResponse.json({
      success: true,
      message: 'Your email address has been verified. You may now access your vault.',
    });
  } catch (error) {
    console.error('❌ API Verification crash:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Dossier verification failed.' },
      { status: 500 }
    );
  }
}