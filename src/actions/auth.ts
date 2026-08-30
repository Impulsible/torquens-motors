/* eslint-disable @typescript-eslint/no-unused-vars */
'use server';

import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';
import { EmailService } from '@/services/email';
import { registerSchema } from '@/utils/validators';
import type { Document } from 'mongoose';

// -----------------------------------------------------------------------------
// TYPES & INTERFACES
// -----------------------------------------------------------------------------

export interface ActionResult<T = unknown> {
  success: boolean;
  message: string;
  redirectTo?: string;
  email?: string;
  verificationLink?: string;
  data?: T;
}

type AuthUserDocument = Document & {
  _id: string;
  name: string;
  email: string;
  password?: string;
  role?: 'CUSTOMER' | 'DEALER' | 'ADMIN';
  emailVerified?: boolean;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  resetToken?: string;
  resetTokenExpires?: Date;
  phone?: string;
  save: () => Promise<AuthUserDocument>;
};

interface AuthErrorLike {
  type?: string;
  name?: string;
  message?: string;
}

function isAuthErrorLike(err: unknown): err is AuthErrorLike {
  return typeof err === 'object' && err !== null && ('type' in err || 'name' in err);
}

// -----------------------------------------------------------------------------
// SERVER ACTIONS
// -----------------------------------------------------------------------------

/**
 * Client Login Server Action
 */
export async function login(
  _prevState: unknown,
  formData: FormData
): Promise<ActionResult> {
  try {
    console.log('🔐 Login attempt started');

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const redirectTo = (formData.get('redirectTo') as string) || '/dashboard';

    if (!email || typeof email !== 'string') {
      return { success: false, message: 'Email address is required.' };
    }

    if (!password || typeof password !== 'string') {
      return { success: false, message: 'Password is required.' };
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return { success: false, message: 'Please enter a valid email address.' };
    }

    await connectToDatabase();

    const user = (await User.findOne({
      email: trimmedEmail,
    }).select('+password')) as AuthUserDocument | null;

    if (!user) {
      return { success: false, message: 'Invalid email address or security key.' };
    }

    if (!user.password) {
      return {
        success: false,
        message: 'This account uses social authentication. Please sign in with Google or Apple.',
      };
    }

    const isPasswordValid = await bcrypt.compare(trimmedPassword, user.password);

    if (!isPasswordValid) {
      return { success: false, message: 'Invalid email address or security key.' };
    }

    // Check boolean verification flag
    if (!user.emailVerified) {
      console.log('⚠️ Login blocked: Account not verified');
      return {
        success: false,
        message: 'Please verify your email address before logging in. Check your inbox for the verification link.',
      };
    }

    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });
    console.log('✅ Login successful for:', trimmedEmail);

    return {
      success: true,
      message: 'Authentication successful. Redirecting to dossier...',
      redirectTo,
    };
  } catch (error: unknown) {
    console.error('❌ Login Server Action Error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unexpected authentication error occurred.',
    };
  }
}

/**
 * Client Registration Server Action
 */
export async function register(
  _prevState: unknown,
  formData: FormData
): Promise<ActionResult> {
  try {
    console.log('📝 Register action called');

    const name = formData.get('name');
    const email = formData.get('email');
    const phone = formData.get('phone');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');

    if (!name || typeof name !== 'string') {
      return { success: false, message: 'Name is required.' };
    }

    if (!email || typeof email !== 'string') {
      return { success: false, message: 'Email address is required.' };
    }

    if (!password || typeof password !== 'string') {
      return { success: false, message: 'Password is required.' };
    }

    if (!confirmPassword || typeof confirmPassword !== 'string') {
      return { success: false, message: 'Please confirm your password.' };
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPhone = phone && typeof phone === 'string' ? phone.trim() : '';
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    if (trimmedName.length < 2) {
      return { success: false, message: 'Name must be at least 2 characters long.' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return { success: false, message: 'Please enter a valid email address.' };
    }

    if (trimmedPassword !== trimmedConfirmPassword) {
      return { success: false, message: 'Passwords do not match.' };
    }

    if (trimmedPassword.length < 8) {
      return { success: false, message: 'Password must be at least 8 characters long.' };
    }

    await connectToDatabase();

    const existingUser = await User.findOne({ email: trimmedEmail });
    if (existingUser) {
      return { success: false, message: 'An account with this email already exists.' };
    }

    const hashedPassword = await bcrypt.hash(trimmedPassword, 12);

    const token =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    const tokenExpires = new Date(Date.now() + 24 * 3600 * 1000); // 24 Hours

    // In development or when AUTO_VERIFY_USERS=true, auto-verify user as Boolean true
    const shouldAutoVerify =
      process.env.NODE_ENV === 'development' ||
      process.env.AUTO_VERIFY_USERS === 'true';

    const user = await User.create({
      name: trimmedName,
      email: trimmedEmail,
      phone: trimmedPhone || undefined,
      password: hashedPassword,
      role: 'CUSTOMER',
      emailVerified: shouldAutoVerify ? true : false, // ✅ Strictly Boolean
      verificationToken: shouldAutoVerify ? undefined : token,
      verificationTokenExpires: shouldAutoVerify ? undefined : tokenExpires,
    });

    console.log(`✅ MongoDB Account created (Auto-verified: ${shouldAutoVerify}):`, user.email);

    // Dispatch verification email
    try {
      await EmailService.sendVerificationEmail(trimmedEmail, trimmedName, token);
    } catch (emailError) {
      console.error('⚠️ Verification email failed to transmit:', emailError);
    }

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const verificationLink = `${baseUrl}/auth/verify?token=${token}`;

    return {
      success: true,
      message: shouldAutoVerify
        ? 'Your client registration was completed and verified automatically.'
        : 'Registration successful! Please check your email to verify your account.',
      email: trimmedEmail,
      verificationLink: shouldAutoVerify ? undefined : verificationLink,
      redirectTo: '/auth/login',
    };
  } catch (error: unknown) {
    console.error('❌ Registration error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unexpected error occurred during registration.',
    };
  }
}

/**
 * Verify Email Token Server Action
 */
export async function verifyEmail(token: string): Promise<ActionResult> {
  try {
    if (!token) {
      return { success: false, message: 'Verification token is required.' };
    }

    await connectToDatabase();

    const user = (await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: new Date() },
    })) as AuthUserDocument | null;

    if (!user) {
      return { success: false, message: 'Invalid or expired verification token.' };
    }

    // Set boolean flag
    user.emailVerified = true; // ✅ Strictly Boolean
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    return {
      success: true,
      message: 'Email verified successfully! You can now log in.',
    };
  } catch (error) {
    console.error('Verification Server Action Error:', error);
    return {
      success: false,
      message: 'An error occurred during verification. Please try again.',
    };
  }
}

/**
 * Forgot Password Server Action
 */
export async function forgotPassword(
  _prevState: unknown,
  formData: FormData
): Promise<ActionResult> {
  try {
    const email = formData.get('email') as string;

    if (!email) {
      return { success: false, message: 'Email address is required.' };
    }

    await connectToDatabase();

    const user = (await User.findOne({
      email: email.toLowerCase().trim(),
    })) as AuthUserDocument | null;

    if (!user) {
      return {
        success: false,
        message: 'No client account found registered under this email address.',
      };
    }

    const resetToken =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour

    user.resetToken = resetToken;
    user.resetTokenExpires = resetTokenExpires;
    await user.save();

    try {
      await EmailService.sendPasswordResetEmail(user.email, user.name, resetToken);
    } catch (emailError) {
      console.error('⚠️ Failed to send reset email:', emailError);
      return {
        success: false,
        message: 'Failed to dispatch reset email. Please try again later.',
      };
    }

    return {
      success: true,
      message: 'Password reset link sent to your email address.',
    };
  } catch (error) {
    console.error('Forgot Password Server Action Error:', error);
    return {
      success: false,
      message: 'An unexpected security error occurred. Please try again.',
    };
  }
}

/**
 * Reset Password Server Action
 */
export async function resetPassword(
  _prevState: unknown,
  formData: FormData
): Promise<ActionResult> {
  try {
    const token = formData.get('token') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (!token) {
      return { success: false, message: 'Reset authorization token is missing.' };
    }

    if (password !== confirmPassword) {
      return { success: false, message: 'Passwords do not match.' };
    }

    if (password.length < 8) {
      return { success: false, message: 'Password must be at least 8 characters long.' };
    }

    await connectToDatabase();

    const user = (await User.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: new Date() },
    })) as AuthUserDocument | null;

    if (!user) {
      return { success: false, message: 'Invalid or expired password reset token.' };
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save();

    return {
      success: true,
      message: 'Password reset successfully! You may now sign in with your new key.',
      redirectTo: '/auth/login',
    };
  } catch (error) {
    console.error('Reset Password Server Action Error:', error);
    return {
      success: false,
      message: 'An unexpected error occurred while resetting your password.',
    };
  }
}

/**
 * Logout Server Action
 */
export async function logout(): Promise<ActionResult> {
  return {
    success: true,
    message: 'Logged out successfully.',
    redirectTo: '/auth/login',
  };
}