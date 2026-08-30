/* eslint-disable @typescript-eslint/no-unused-vars */
'use server';

import crypto from 'crypto';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';
import { EmailService } from '@/services/email';
import { registerSchema } from '@/utils/validators';
import type { Document } from 'mongoose';

export interface ActionResult<T = unknown> {
  success: boolean;
  message: string;
  redirectTo?: string;
  email?: string;
  verificationLink?: string;
  data?: T;
}

export interface AuthUserDocument extends Document {
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
  lastLogin?: Date;
}

function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

function asString(value: FormDataEntryValue | null): string {
  return typeof value === 'string' ? value : '';
}

function asBool(value: FormDataEntryValue | null): boolean {
  if (typeof value !== 'string') return false;
  return value === 'true' || value === 'on' || value === '1';
}

function getBaseUrl(): string {
  return (
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'http://localhost:3000'
  );
}

export async function login(
  _prevState: unknown,
  formData: FormData
): Promise<ActionResult> {
  try {
    const email = asString(formData.get('email')).trim().toLowerCase();
    const password = asString(formData.get('password'));
    const redirectTo = asString(formData.get('redirectTo')) || '/dashboard';

    if (!email) return { success: false, message: 'Email address is required.' };
    if (!password) return { success: false, message: 'Password is required.' };

    await connectToDatabase();

    const user = (await User.findOne({ email }).select('+password')) as AuthUserDocument | null;

    if (!user || !user.password) {
      return { success: false, message: 'Invalid email address or security key.' };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return { success: false, message: 'Invalid email address or security key.' };
    }

    // Auto-verify legacy accounts and update last login
    await User.findByIdAndUpdate(user._id, { 
      lastLogin: new Date(),
      emailVerified: true 
    });

    return {
      success: true,
      message: 'Authentication successful.',
      redirectTo,
    };
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unexpected error occurred.',
    };
  }
}

export async function register(
  _prevState: unknown,
  formData: FormData
): Promise<ActionResult> {
  try {
    const name = asString(formData.get('name')).trim();
    const email = asString(formData.get('email')).trim().toLowerCase();
    const phone = asString(formData.get('phone')).trim();
    const password = asString(formData.get('password'));
    const confirmPassword = asString(formData.get('confirmPassword'));
    const termsAccepted = asBool(formData.get('termsAccepted'));

    // Validate using Zod
    const validated = registerSchema.parse({
      name,
      email,
      phone,
      password,
      confirmPassword,
      termsAccepted,
    });

    await connectToDatabase();

    const existingUser = await User.findOne({ email: validated.email });
    if (existingUser) {
      return {
        success: false,
        message: 'An account with this email address already exists.',
      };
    }

    const hashedPassword = await bcrypt.hash(validated.password, 12);

    // Direct account creation with immediate verification (no approval link required)
    const user = (await User.create({
      name: validated.name,
      email: validated.email,
      phone: validated.phone && validated.phone.length > 0 ? validated.phone : undefined,
      password: hashedPassword,
      role: 'CUSTOMER',
      emailVerified: true,
    })) as AuthUserDocument;

    return {
      success: true,
      message: 'Client account created successfully. You can now sign in.',
      email: String(user.email),
      redirectTo: '/auth/login',
    };
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const issue = error.issues[0];
      return {
        success: false,
        message: issue ? issue.message : 'Validation error. Please check your details.',
      };
    }

    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unexpected error occurred.',
    };
  }
}

export async function verifyEmail(token: string): Promise<ActionResult> {
  try {
    if (!token) return { success: false, message: 'Verification token is required.' };

    await connectToDatabase();

    const user = (await User.findOne({
      verificationToken: token,
    })) as AuthUserDocument | null;

    if (!user) {
      return { success: false, message: 'Invalid or expired verification token.' };
    }

    user.emailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    return {
      success: true,
      message: 'Email verified successfully! You can now log in.',
    };
  } catch (error) {
    return { success: false, message: 'An error occurred during verification.' };
  }
}

export async function forgotPassword(_prevState: unknown, formData: FormData): Promise<ActionResult> {
  try {
    const email = asString(formData.get('email')).trim().toLowerCase();
    if (!email) return { success: false, message: 'Email is required.' };

    await connectToDatabase();

    const user = (await User.findOne({ email })) as AuthUserDocument | null;
    if (!user) return { success: false, message: 'No client account found for this email.' };

    const resetToken = generateSecureToken();
    user.resetToken = resetToken;
    user.resetTokenExpires = new Date(Date.now() + 3600000);
    await user.save();

    try {
      await EmailService.sendPasswordResetEmail(String(user.email), String(user.name || 'Client'), String(resetToken));
    } catch {
      return { success: false, message: 'Failed to send reset email.' };
    }

    return { success: true, message: 'Password reset link sent to your email address.' };
  } catch {
    return { success: false, message: 'Security error occurred.' };
  }
}

export async function resetPassword(_prevState: unknown, formData: FormData): Promise<ActionResult> {
  try {
    const token = asString(formData.get('token'));
    const password = asString(formData.get('password'));
    const confirmPassword = asString(formData.get('confirmPassword'));

    if (!token || !password || !confirmPassword) return { success: false, message: 'Missing fields.' };
    if (password !== confirmPassword) return { success: false, message: 'Passwords do not match.' };

    await connectToDatabase();

    const user = (await User.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: new Date() },
    })) as AuthUserDocument | null;

    if (!user) return { success: false, message: 'Invalid or expired token.' };

    user.password = await bcrypt.hash(password, 12);
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save();

    return { success: true, message: 'Password reset successfully.', redirectTo: '/auth/login' };
  } catch {
    return { success: false, message: 'An error occurred.' };
  }
}

export async function logout(): Promise<ActionResult> {
  return { success: true, message: 'Logged out successfully.', redirectTo: '/auth/login' };
}