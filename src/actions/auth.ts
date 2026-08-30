'use server';

import crypto from 'crypto';
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

// -----------------------------------------------------------------------------
// HELPERS
// -----------------------------------------------------------------------------

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

// -----------------------------------------------------------------------------
// LOGIN
// -----------------------------------------------------------------------------

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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, message: 'Please enter a valid email address.' };
    }

    await connectToDatabase();

    const user = (await User.findOne({ email }).select(
      '+password'
    )) as AuthUserDocument | null;

    if (!user) {
      return { success: false, message: 'Invalid email address or security key.' };
    }

    if (!user.password) {
      return {
        success: false,
        message:
          'This account uses social authentication. Please sign in with Google or Apple.',
      };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return { success: false, message: 'Invalid email address or security key.' };
    }

    if (!user.emailVerified) {
      return {
        success: false,
        message:
          'Please verify your email address before logging in. Check your inbox for the verification link.',
      };
    }

    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    return {
      success: true,
      message: 'Authentication successful. Redirecting to dossier...',
      redirectTo,
    };
  } catch (error: unknown) {
    console.error('Login Server Action Error:', error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'An unexpected authentication error occurred.',
    };
  }
}

// -----------------------------------------------------------------------------
// REGISTER (Fixed — all schema fields properly passed)
// -----------------------------------------------------------------------------

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

    // Fast pre-Zod field guards
    if (!name) {
      return { success: false, message: 'Name is required.' };
    }
    if (!email) {
      return { success: false, message: 'Email address is required.' };
    }
    if (!password) {
      return { success: false, message: 'Password is required.' };
    }
    if (!confirmPassword) {
      return { success: false, message: 'Please confirm your password.' };
    }
    if (password !== confirmPassword) {
      return { success: false, message: 'Passwords do not match.' };
    }
    if (!termsAccepted) {
      return {
        success: false,
        message: 'You must accept the terms and privacy policy.',
      };
    }

    // ✅ Pass ALL fields expected by registerSchema
    const validated = registerSchema.parse({
      name,
      email,
      phone,
      password,
      confirmPassword,
      termsAccepted: true,
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
    const token = generateSecureToken();
    const tokenExpires = new Date(Date.now() + 24 * 3600 * 1000);

    const shouldAutoVerify =
      process.env.NODE_ENV === 'development' ||
      process.env.AUTO_VERIFY_USERS === 'true';

    const user = (await User.create({
      name: validated.name,
      email: validated.email,
      phone: validated.phone && validated.phone.length > 0 ? validated.phone : undefined,
      password: hashedPassword,
      role: 'CUSTOMER',
      emailVerified: Boolean(shouldAutoVerify),
      verificationToken: shouldAutoVerify ? undefined : token,
      verificationTokenExpires: shouldAutoVerify ? undefined : tokenExpires,
    })) as AuthUserDocument;

    if (!shouldAutoVerify) {
      try {
        await EmailService.sendVerificationEmail(
          String(user.email),
          String(user.name || validated.name || 'Client'),
          String(token)
        );
      } catch (emailError) {
        console.error('Verification email failed to transmit:', emailError);
        // Do not fail account creation if email fails
      }
    }

    const verificationLink = `${getBaseUrl()}/auth/verify?token=${token}`;

    return {
      success: true,
      message: shouldAutoVerify
        ? 'Your client registration was completed and verified automatically. You can sign in now.'
        : 'Registration successful! Please check your email to verify your account.',
      email: String(user.email),
      verificationLink: shouldAutoVerify ? undefined : verificationLink,
      redirectTo: '/auth/login',
    };
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const issue = error.issues[0];
      console.error('Register Zod issues:', error.issues);
      return {
        success: false,
        message: issue
          ? `${issue.path?.join('.') || 'field'}: ${issue.message}`
          : 'Validation error. Please check your details.',
      };
    }

    console.error('Registration Server Action Error:', error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred during registration.',
    };
  }
}

// -----------------------------------------------------------------------------
// VERIFY EMAIL
// -----------------------------------------------------------------------------

export async function verifyEmail(token: string): Promise<ActionResult> {
  try {
    if (!token || typeof token !== 'string') {
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

    user.emailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    return {
      success: true,
      message: 'Email verified successfully! You can now log in to your account.',
    };
  } catch (error) {
    console.error('Verification Server Action Error:', error);
    return {
      success: false,
      message: 'An error occurred during verification. Please try again.',
    };
  }
}

// -----------------------------------------------------------------------------
// FORGOT PASSWORD
// -----------------------------------------------------------------------------

export async function forgotPassword(
  _prevState: unknown,
  formData: FormData
): Promise<ActionResult> {
  try {
    const email = asString(formData.get('email')).trim().toLowerCase();

    if (!email) {
      return { success: false, message: 'Email address is required.' };
    }

    await connectToDatabase();

    const user = (await User.findOne({ email })) as AuthUserDocument | null;

    if (!user) {
      return {
        success: false,
        message: 'No client account found registered under this email address.',
      };
    }

    const resetToken = generateSecureToken();
    const resetTokenExpires = new Date(Date.now() + 3600000);

    user.resetToken = resetToken;
    user.resetTokenExpires = resetTokenExpires;
    await user.save();

    try {
      await EmailService.sendPasswordResetEmail(
        String(user.email),
        String(user.name || 'Client'),
        String(resetToken)
      );
    } catch (emailError) {
      console.error('Failed to send reset email:', emailError);
      return {
        success: false,
        message: 'Failed to dispatch reset email. Please try again later.',
      };
    }

    return {
      success: true,
      message: 'Password reset authorization link sent to your email address.',
    };
  } catch (error) {
    console.error('Forgot Password Server Action Error:', error);
    return {
      success: false,
      message: 'An unexpected security error occurred. Please try again.',
    };
  }
}

// -----------------------------------------------------------------------------
// RESET PASSWORD
// -----------------------------------------------------------------------------

export async function resetPassword(
  _prevState: unknown,
  formData: FormData
): Promise<ActionResult> {
  try {
    const token = asString(formData.get('token'));
    const password = asString(formData.get('password'));
    const confirmPassword = asString(formData.get('confirmPassword'));

    if (!token) {
      return { success: false, message: 'Reset authorization token is missing.' };
    }
    if (!password) {
      return { success: false, message: 'Password is required.' };
    }
    if (!confirmPassword) {
      return { success: false, message: 'Please confirm your password.' };
    }
    if (password !== confirmPassword) {
      return { success: false, message: 'Passwords do not match.' };
    }
    if (password.length < 8) {
      return {
        success: false,
        message: 'Password must be at least 8 characters long.',
      };
    }

    await connectToDatabase();

    const user = (await User.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: new Date() },
    })) as AuthUserDocument | null;

    if (!user) {
      return { success: false, message: 'Invalid or expired password reset token.' };
    }

    user.password = await bcrypt.hash(password, 12);
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save();

    return {
      success: true,
      message:
        'Password reset successfully! You may now sign in with your new security key.',
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

// -----------------------------------------------------------------------------
// LOGOUT
// -----------------------------------------------------------------------------

export async function logout(): Promise<ActionResult> {
  return {
    success: true,
    message: 'Logged out successfully.',
    redirectTo: '/auth/login',
  };
}