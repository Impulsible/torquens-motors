import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export class EmailService {
  static async sendEmail({
    to,
    subject,
    html,
    from = 'TORQUENS MOTORS <hello@torquens.com>',
  }: {
    to: string;
    subject: string;
    html: string;
    from?: string;
  }) {
    try {
      const { data, error } = await resend.emails.send({
        from,
        to,
        subject,
        html,
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Email send error:', error);
      throw error;
    }
  }

  static getWelcomeEmail(name: string) {
    return `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #C5A059;">TORQUENS MOTORS</h1>
        <p>Welcome to TORQUENS MOTORS, ${name}!</p>
        <p>We're thrilled to have you join our community of automotive enthusiasts.</p>
        <p>Start exploring our curated collection of exceptional vehicles.</p>
        <a href="${process.env.NEXTAUTH_URL}/vehicles" style="background: #C5A059; color: #08090B; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
          Explore Vehicles
        </a>
        <p style="margin-top: 20px; color: #545B6B;">Engineered to Move.</p>
      </div>
    `;
  }

  static getEnquiryConfirmationEmail(vehicleName: string) {
    return `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #C5A059;">TORQUENS MOTORS</h1>
        <h2>Enquiry Received</h2>
        <p>Thank you for your enquiry about the <strong>${vehicleName}</strong>.</p>
        <p>A dealer will be in touch with you shortly.</p>
        <a href="${process.env.NEXTAUTH_URL}/dashboard/enquiries" style="background: #C5A059; color: #08090B; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
          View Your Enquiries
        </a>
        <p style="margin-top: 20px; color: #545B6B;">Engineered to Move.</p>
      </div>
    `;
  }
}