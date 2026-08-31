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
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Reset Your Password</title>
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
              <span class="badge">Password Reset</span>
            </div>
            <h1>Hello, ${name}!</h1>
            <p>We received a request to reset your password. Click the button below to create a new password.</p>
            <div class="button-wrapper">
              <a href="${resetLink}" class="button" target="_blank">Reset Password</a>
            </div>
            <p style="font-size: 13px; color: #545B6B;">Or copy link:</p>
            <p style="font-size: 12px; word-break: break-all; background: #0E1014; padding: 12px; border-radius: 6px; color: #C5A059; border: 1px solid #1F242D;">
              ${resetLink}
            </p>
            <hr class="divider" />
            <p style="font-size: 13px; color: #545B6B;">This link will expire in 1 hour.</p>
            <p style="font-size: 13px; color: #545B6B;">If you didn't request this, please ignore this email.</p>
          </div>
        </body>
      </html>
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

  // ─────────────────────────────────────────────────────────────
  // ENQUIRY EMAILS
  // ─────────────────────────────────────────────────────────────

  /**
   * Get HTML for customer enquiry confirmation email
   */
  static getEnquiryConfirmationEmail(name: string, vehicleName: string, enquiryId: string) {
    const enquiryUrl = `${getAppUrl()}/dashboard/enquiries/${enquiryId}`;
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #08090B; }
            .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #12151B; border-radius: 12px; border: 1px solid #1F242D; }
            .header { text-align: center; padding-bottom: 30px; border-bottom: 1px solid #1F242D; }
            .logo { font-size: 28px; font-weight: 300; letter-spacing: 2px; color: #F8F9FA; }
            .logo span { color: #C5A059; }
            .content { padding: 30px 0; color: #9EA5B5; line-height: 1.6; }
            .content h1 { color: #F8F9FA; font-size: 24px; margin-bottom: 20px; }
            .button { display: inline-block; padding: 14px 40px; background-color: #C5A059; color: #08090B; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
            .footer { text-align: center; padding-top: 30px; border-top: 1px solid #1F242D; font-size: 12px; color: #545B6B; }
            .details { background-color: #1A1E26; padding: 16px; border-radius: 8px; margin: 16px 0; }
          </style>
        </head>
        <body style="background-color: #08090B; padding: 20px;">
          <div class="container">
            <div class="header">
              <div class="logo">TORQUENS<span>MOTORS</span></div>
            </div>
            <div class="content">
              <h1>Enquiry Received, ${name}!</h1>
              <p>Thank you for your enquiry about the <strong>${vehicleName}</strong>.</p>
              <p>The dealer will review your enquiry and get back to you shortly.</p>
              
              <div class="details">
                <p style="margin: 0; font-size: 14px;"><strong>Vehicle:</strong> ${vehicleName}</p>
                <p style="margin: 8px 0 0; font-size: 14px;"><strong>Enquiry ID:</strong> #${enquiryId.slice(0, 8)}</p>
              </div>
              
              <div style="text-align: center;">
                <a href="${enquiryUrl}" class="button">View Your Enquiry</a>
              </div>
              
              <p style="font-size: 14px; margin-top: 20px;">If you have any questions, please contact us at <a href="mailto:hello@torquens.com" style="color: #C5A059; text-decoration: none;">hello@torquens.com</a>.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} TORQUENS MOTORS. All rights reserved.</p>
              <p style="margin-top: 8px;">Engineered to Move.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Send enquiry confirmation email to the customer
   */
  static async sendEnquiryConfirmation(email: string, name: string, vehicleName: string, enquiryId: string) {
    const html = this.getEnquiryConfirmationEmail(name, vehicleName, enquiryId);
    return this.sendEmail({
      to: email,
      subject: `Enquiry Received - ${vehicleName} | TORQUENS MOTORS`,
      html,
    });
  }

  /**
   * Get HTML for dealer enquiry notification email
   */
  static getDealerEnquiryNotificationEmail(dealerName: string, enquiry: any) {
    const dashboardUrl = `${getAppUrl()}/dealer/enquiries`;
    const vehicleUrl = `${getAppUrl()}/vehicles/${enquiry.vehicle?.id || enquiry.vehicleId}`;
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #08090B; }
            .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #12151B; border-radius: 12px; border: 1px solid #1F242D; }
            .header { text-align: center; padding-bottom: 30px; border-bottom: 1px solid #1F242D; }
            .logo { font-size: 28px; font-weight: 300; letter-spacing: 2px; color: #F8F9FA; }
            .logo span { color: #C5A059; }
            .content { padding: 30px 0; color: #9EA5B5; line-height: 1.6; }
            .content h1 { color: #F8F9FA; font-size: 24px; margin-bottom: 20px; }
            .button { display: inline-block; padding: 14px 40px; background-color: #C5A059; color: #08090B; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
            .footer { text-align: center; padding-top: 30px; border-top: 1px solid #1F242D; font-size: 12px; color: #545B6B; }
            .details { background-color: #1A1E26; padding: 16px; border-radius: 8px; margin: 16px 0; }
            .customer-info { color: #F8F9FA; }
          </style>
        </head>
        <body style="background-color: #08090B; padding: 20px;">
          <div class="container">
            <div class="header">
              <div class="logo">TORQUENS<span>MOTORS</span></div>
            </div>
            <div class="content">
              <h1>New Enquiry Received!</h1>
              <p>Hello ${dealerName},</p>
              <p>A customer has submitted an enquiry about one of your vehicles.</p>
              
              <div class="details">
                <p style="margin: 0; font-size: 14px;"><strong>Customer:</strong> <span class="customer-info">${enquiry.name}</span></p>
                <p style="margin: 8px 0 0; font-size: 14px;"><strong>Email:</strong> <span class="customer-info">${enquiry.email}</span></p>
                <p style="margin: 8px 0 0; font-size: 14px;"><strong>Phone:</strong> <span class="customer-info">${enquiry.phone || 'Not provided'}</span></p>
                <p style="margin: 8px 0 0; font-size: 14px;"><strong>Preferred Contact:</strong> <span class="customer-info">${enquiry.preferredContact || 'Not specified'}</span></p>
                <p style="margin: 8px 0 0; font-size: 14px;"><strong>Vehicle:</strong> <span class="customer-info">${enquiry.vehicle?.make || ''} ${enquiry.vehicle?.model || ''} (${enquiry.vehicle?.year || ''})</span></p>
                <p style="margin: 8px 0 0; font-size: 14px;"><strong>Message:</strong></p>
                <p style="margin: 8px 0 0; font-size: 14px; color: #F8F9FA; padding: 12px; background-color: #08090B; border-radius: 4px;">${enquiry.message || 'No message provided'}</p>
              </div>
              
              <div style="text-align: center;">
                <a href="${dashboardUrl}" class="button">View All Enquiries</a>
              </div>
              <div style="text-align: center; margin-top: 12px;">
                <a href="${vehicleUrl}" style="color: #C5A059; text-decoration: none; font-size: 14px;">View Vehicle Listing →</a>
              </div>
              
              <p style="font-size: 14px; margin-top: 20px;">Please respond to this enquiry as soon as possible to provide the best customer experience.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} TORQUENS MOTORS. All rights reserved.</p>
              <p style="margin-top: 8px;">Engineered to Move.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Send enquiry notification email to the dealer
   */
  static async sendDealerEnquiryNotification(dealerEmail: string, dealerName: string, enquiry: any) {
    const html = this.getDealerEnquiryNotificationEmail(dealerName, enquiry);
    return this.sendEmail({
      to: dealerEmail,
      subject: `New Enquiry: ${enquiry.vehicle?.make || ''} ${enquiry.vehicle?.model || ''} | TORQUENS MOTORS`,
      html,
    });
  }
}

export default EmailService;