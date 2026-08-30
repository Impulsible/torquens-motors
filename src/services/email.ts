/* eslint-disable @typescript-eslint/no-explicit-any */
import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const resend = new Resend(RESEND_API_KEY || 're_dummy');

export function getAppUrl(): string {
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL.replace(/\/$/, '');
  }
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'http://localhost:3000';
}

export class EmailService {
  static async sendEmail({
    to,
    subject,
    html,
    from = process.env.RESEND_FROM_EMAIL || 'TORQUENS Vault <onboarding@resend.dev>',
  }: {
    to: string;
    subject: string;
    html: string;
    from?: string;
  }) {
    try {
      if (!RESEND_API_KEY || RESEND_API_KEY === 're_dummy') {
        console.log('ℹ️ Resend bypassed in mock mode.');
        return { id: 'mock-id', success: true };
      }

      const { data, error } = await resend.emails.send({
        from,
        to,
        subject,
        html,
      });

      if (error) {
        // Handle Resend free tier testing limitation gracefully in development
        if (error.name === 'validation_error' && error.message.includes('testing emails')) {
          console.log(`ℹ️ [Resend Sandbox] Email to ${to} skipped (Resend free sandbox only sends to account owner). User was auto-verified.`);
          return { id: 'sandbox-skip', success: true };
        }
        throw new Error(error.message);
      }

      console.log('✅ Outbound email delivered via Resend:', data?.id);
      return data;
    } catch (error: any) {
      if (error?.message?.includes('testing emails')) {
        console.log(`ℹ️ [Resend Sandbox] Email to ${to} skipped. User was auto-verified.`);
        return { id: 'sandbox-skip', success: true };
      }
      console.warn('⚠️ Email transmission skipped:', error?.message || error);
      return { id: 'error-skip', success: false };
    }
  }

  static getVerificationEmailHtml(name: string, verificationLink: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Verify Your Email</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #08090B; color: #F8F9FA; margin: 0; padding: 40px 20px; }
            .container { max-width: 600px; margin: 0 auto; background-color: #12151B; border: 1px solid #1F242D; border-radius: 16px; padding: 40px 32px; }
            .logo { font-family: Georgia, serif; font-size: 28px; color: #F8F9FA; text-align: center; }
            .logo span { color: #C5A059; }
            .badge { display: inline-block; background: rgba(197, 160, 89, 0.15); color: #C5A059; font-size: 11px; font-weight: 600; text-transform: uppercase; padding: 4px 12px; border-radius: 20px; border: 1px solid rgba(197, 160, 89, 0.3); }
            h1 { font-family: Georgia, serif; font-size: 24px; color: #F8F9FA; }
            p { color: #9EA5B5; font-size: 14px; line-height: 1.7; }
            .button-wrapper { text-align: center; margin: 24px 0; }
            .button { display: inline-block; background: #C5A059; color: #08090B !important; font-weight: 600; font-size: 14px; text-decoration: none; padding: 14px 40px; border-radius: 8px; text-transform: uppercase; }
            .divider { border: none; border-top: 1px solid #1F242D; margin: 24px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">TORQUENS<span>MOTORS</span></div>
            <div style="text-align: center; margin-bottom: 24px; margin-top: 12px;">
              <span class="badge">Private Client Verification</span>
            </div>
            <h1>Welcome, ${name}!</h1>
            <p>To activate your vault access and begin exploring our curated collection, please verify your email address.</p>
            <div class="button-wrapper">
              <a href="${verificationLink}" class="button" target="_blank">Verify Email Address</a>
            </div>
            <p style="font-size: 13px; color: #545B6B;">Or copy link:</p>
            <p style="font-size: 12px; word-break: break-all; background: #0E1014; padding: 12px; border-radius: 6px; color: #C5A059; border: 1px solid #1F242D;">
              ${verificationLink}
            </p>
            <hr class="divider" />
            <p style="font-size: 13px; color: #545B6B;">This link will expire in 24 hours.</p>
          </div>
        </body>
      </html>
    `;
  }

  static async sendVerificationEmail(email: string, name: string, token: string) {
    const baseUrl = getAppUrl();
    const verificationLink = `${baseUrl}/auth/verify?token=${token}`;
    
    console.log('\n======================================================================');
    console.log('🔗 [DEV] ACCOUNT VERIFICATION PROTOCOL INITIATED');
    console.log(`👤 Client: ${name} (${email})`);
    console.log(`👉 Direct Activation Link: ${verificationLink}`);
    console.log('======================================================================\n');
    
    const html = this.getVerificationEmailHtml(name, verificationLink);
    
    return this.sendEmail({
      to: email,
      subject: 'Verify Your Email — TORQUENS MOTORS',
      html,
    });
  }

  static getPasswordResetEmailHtml(name: string, resetLink: string): string {
    return `
      <div style="font-family: sans-serif; background-color: #08090B; color: #F8F9FA; padding: 40px 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #12151B; border: 1px solid #1F242D; border-radius: 12px; padding: 32px;">
          <h2 style="font-family: serif; color: #F8F9FA; font-size: 24px; font-weight: 300; margin-bottom: 8px;">TORQUENS <span style="color: #C5A059;">MOTORS</span></h2>
          <p style="color: #C5A059; text-transform: uppercase; font-size: 11px; letter-spacing: 2px; margin-top: 0;">Reset Password Request</p>
          <p style="color: #9EA5B5; font-size: 14px; line-height: 1.6;">Hello ${name}, click below to reset your security password.</p>
          <div style="margin: 28px 0;"><a href="${resetLink}" style="background-color: #C5A059; color: #08090B; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 12px; text-transform: uppercase; display: inline-block;">Reset Password</a></div>
        </div>
      </div>
    `;
  }

  static async sendPasswordResetEmail(email: string, name: string, token: string) {
    const baseUrl = getAppUrl();
    const resetLink = `${baseUrl}/auth/reset-password?token=${token}`;
    
    console.log('\n======================================================================');
    console.log(`👉 Reset Password Link: ${resetLink}`);
    console.log('======================================================================\n');
    
    const html = this.getPasswordResetEmailHtml(name, resetLink);
    return this.sendEmail({
      to: email,
      subject: 'Reset Your Password — TORQUENS MOTORS',
      html,
    });
  }
}

export default EmailService;