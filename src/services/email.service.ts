/* eslint-disable @typescript-eslint/no-explicit-any */
import { Resend } from 'resend';
import {
  welcomeEmail,
  verificationEmail,
  passwordResetEmail,
  enquiryConfirmationEmail,
  dealerEnquiryNotificationEmail,
  vehicleVerifiedEmail,
  priceChangeEmail,
  reservationConfirmationEmail,
  dealerRegistrationEmail,
  type WelcomeEmailData,
  type VerificationEmailData,
  type PasswordResetEmailData,
  type EnquiryConfirmationEmailData,
  type DealerEnquiryNotificationEmailData,
  type VehicleVerifiedEmailData,
  type PriceChangeEmailData,
  type ReservationConfirmationEmailData,
  type DealerRegistrationEmailData,
} from '@/emails/templates';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const DEFAULT_FROM = process.env.EMAIL_FROM || 'TORQUENS MOTORS <noreply@torquens.com>';

if (!RESEND_API_KEY) {
  console.warn('⚠️ RESEND_API_KEY is not set. Email sending will fail.');
}

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

export class EmailService {
  static async sendEmail({
    to,
    subject,
    html,
    from = DEFAULT_FROM,
    replyTo,
  }: {
    to: string;
    subject: string;
    html: string;
    from?: string;
    replyTo?: string;
  }) {
    try {
      console.log('📧 Sending email to:', to);
      console.log('📧 Subject:', subject);

      if (!resend) {
        console.warn('⚠️ Resend API key not configured. Email not sent.');
        console.log('📧 Email content preview:', html.substring(0, 200) + '...');
        return { 
          id: 'mock-email-id', 
          success: true, 
          message: 'Mock email sent (no API key)' 
        };
      }

      const emailPayload: any = {
        from,
        to,
        subject,
        html,
      };

      if (replyTo) {
        emailPayload.reply_to = replyTo;
      }

      const { data, error } = await resend.emails.send(emailPayload);

      if (error) {
        console.error('❌ Resend error:', error);
        throw new Error(`Resend error: ${error.message}`);
      }

      console.log('✅ Email sent successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ Email send error:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 1. WELCOME EMAIL
  // ─────────────────────────────────────────────────────────────
  static async sendWelcomeEmail(data: WelcomeEmailData & { email: string }) {
    const subject = typeof welcomeEmail.subject === 'function' 
      ? welcomeEmail.subject(data) 
      : welcomeEmail.subject;
    const html = welcomeEmail.html(data);
    return this.sendEmail({
      to: data.email,
      subject,
      html,
    });
  }

  // ─────────────────────────────────────────────────────────────
  // 2. VERIFICATION EMAIL
  // ─────────────────────────────────────────────────────────────
  static async sendVerificationEmail(data: VerificationEmailData & { email: string }) {
    const subject = typeof verificationEmail.subject === 'function'
      ? verificationEmail.subject(data)
      : verificationEmail.subject;
    const html = verificationEmail.html(data);
    return this.sendEmail({
      to: data.email,
      subject,
      html,
    });
  }

  // ─────────────────────────────────────────────────────────────
  // 3. PASSWORD RESET EMAIL
  // ─────────────────────────────────────────────────────────────
  static async sendPasswordResetEmail(data: PasswordResetEmailData & { email: string }) {
    const subject = typeof passwordResetEmail.subject === 'function'
      ? passwordResetEmail.subject(data)
      : passwordResetEmail.subject;
    const html = passwordResetEmail.html(data);
    return this.sendEmail({
      to: data.email,
      subject,
      html,
    });
  }

  // ─────────────────────────────────────────────────────────────
  // 4. ENQUIRY CONFIRMATION
  // ─────────────────────────────────────────────────────────────
  static async sendEnquiryConfirmationEmail(data: EnquiryConfirmationEmailData & { email: string }) {
    const subject = typeof enquiryConfirmationEmail.subject === 'function'
      ? enquiryConfirmationEmail.subject(data)
      : enquiryConfirmationEmail.subject;
    const html = enquiryConfirmationEmail.html(data);
    return this.sendEmail({
      to: data.email,
      subject,
      html,
      replyTo: data.dealerName || '',
    });
  }

  // ─────────────────────────────────────────────────────────────
  // 5. DEALER ENQUIRY NOTIFICATION
  // ─────────────────────────────────────────────────────────────
  static async sendDealerEnquiryNotification(data: DealerEnquiryNotificationEmailData & { email: string }) {
    const subject = typeof dealerEnquiryNotificationEmail.subject === 'function'
      ? dealerEnquiryNotificationEmail.subject(data)
      : dealerEnquiryNotificationEmail.subject;
    const html = dealerEnquiryNotificationEmail.html(data);
    return this.sendEmail({
      to: data.email,
      subject,
      html,
    });
  }

  // ─────────────────────────────────────────────────────────────
  // 6. VEHICLE VERIFIED
  // ─────────────────────────────────────────────────────────────
  static async sendVehicleVerifiedEmail(data: VehicleVerifiedEmailData & { email: string }) {
    const subject = typeof vehicleVerifiedEmail.subject === 'function'
      ? vehicleVerifiedEmail.subject(data)
      : vehicleVerifiedEmail.subject;
    const html = vehicleVerifiedEmail.html(data);
    return this.sendEmail({
      to: data.email,
      subject,
      html,
    });
  }

  // ─────────────────────────────────────────────────────────────
  // 7. PRICE CHANGE
  // ─────────────────────────────────────────────────────────────
  static async sendPriceChangeEmail(data: PriceChangeEmailData & { email: string }) {
    const subject = typeof priceChangeEmail.subject === 'function'
      ? priceChangeEmail.subject(data)
      : priceChangeEmail.subject;
    const html = priceChangeEmail.html(data);
    return this.sendEmail({
      to: data.email,
      subject,
      html,
    });
  }

  // ─────────────────────────────────────────────────────────────
  // 8. RESERVATION CONFIRMATION
  // ─────────────────────────────────────────────────────────────
  static async sendReservationConfirmationEmail(data: ReservationConfirmationEmailData & { email: string }) {
    const subject = typeof reservationConfirmationEmail.subject === 'function'
      ? reservationConfirmationEmail.subject(data)
      : reservationConfirmationEmail.subject;
    const html = reservationConfirmationEmail.html(data);
    return this.sendEmail({
      to: data.email,
      subject,
      html,
    });
  }

  // ─────────────────────────────────────────────────────────────
  // 9. DEALER REGISTRATION
  // ─────────────────────────────────────────────────────────────
  static async sendDealerRegistrationEmail(data: DealerRegistrationEmailData & { email: string }) {
    const subject = typeof dealerRegistrationEmail.subject === 'function'
      ? dealerRegistrationEmail.subject(data)
      : dealerRegistrationEmail.subject;
    const html = dealerRegistrationEmail.html(data);
    return this.sendEmail({
      to: data.email,
      subject,
      html,
    });
  }
}

export default EmailService;