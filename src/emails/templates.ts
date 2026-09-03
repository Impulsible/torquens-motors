// ─────────────────────────────────────────────────────────────
// GENERIC EMAIL TEMPLATE INTERFACES
// ─────────────────────────────────────────────────────────────
export interface EmailTemplate<T = Record<string, unknown>> {
  subject: string | ((data: T) => string);
  html: (data: T) => string;
  text?: (data: T) => string;
}

// ─────────────────────────────────────────────────────────────
// DATA PAYLOAD TYPE DEFINITIONS
// ─────────────────────────────────────────────────────────────
export interface WelcomeEmailData {
  name: string;
}

export interface VerificationEmailData {
  name: string;
  token: string;
}

export interface PasswordResetEmailData {
  name: string;
  token: string;
}

export interface EnquiryConfirmationEmailData {
  name: string;
  vehicleName: string;
  enquiryId: string;
  dealerName: string;
}

export interface DealerEnquiryNotificationEmailData {
  dealerName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  message: string;
  vehicleName: string;
  enquiryId: string;
  preferredContact: string;
}

export interface VehicleVerifiedEmailData {
  dealerName: string;
  vehicleName: string;
  vehicleId: string;
}

export interface PriceChangeEmailData {
  name: string;
  vehicleName: string;
  vehicleId: string;
  oldPrice: number;
  newPrice: number;
  currency: string;
}

export interface ReservationConfirmationEmailData {
  name: string;
  vehicleName: string;
  vehicleId: string;
  reservationId: string;
  depositAmount: number;
  currency: string;
  expiresAt: Date | string;
}

export interface DealerRegistrationEmailData {
  dealerName: string;
  email: string;
}

// ─────────────────────────────────────────────────────────────
// BASE LUXURY EMAIL WRAPPER
// ─────────────────────────────────────────────────────────────
const APP_URL = process.env.APP_URL || 'https://torquens.com';

const emailWrapper = (content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TORQUENS MOTORS</title>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #08090B; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #12151B; border-radius: 12px; border: 1px solid #1F242D; }
    .header { text-align: center; padding-bottom: 30px; border-bottom: 1px solid #1F242D; }
    .logo { font-size: 26px; font-weight: 300; letter-spacing: 3px; color: #F8F9FA; font-family: Georgia, serif; }
    .logo span { color: #C5A059; }
    .content { padding: 30px 0; color: #9EA5B5; line-height: 1.6; }
    .content h1 { color: #F8F9FA; font-size: 22px; font-weight: 300; margin-bottom: 20px; font-family: Georgia, serif; }
    .button { display: inline-block; padding: 14px 36px; background-color: #C5A059; color: #08090B !important; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 13px; letter-spacing: 1px; text-transform: uppercase; margin: 20px 0; }
    .button:hover { background-color: #E2B96C; }
    .divider { height: 1px; background: #1F242D; margin: 20px 0; }
    .footer { text-align: center; padding-top: 30px; border-top: 1px solid #1F242D; font-size: 11px; color: #545B6B; font-family: monospace; letter-spacing: 1px; }
    .footer a { color: #C5A059; text-decoration: none; }
    .details { background-color: #1A1E26; padding: 16px; border-radius: 8px; margin: 16px 0; border: 1px solid #282E3A; }
    .details-label { font-size: 11px; color: #717A8C; text-transform: uppercase; letter-spacing: 1px; font-family: monospace; }
    .details-value { color: #F8F9FA; font-weight: 500; font-size: 14px; }
    .badge { display: inline-block; padding: 4px 12px; background-color: #C5A059; color: #08090B; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
  </style>
</head>
<body style="background-color: #08090B; padding: 20px; margin: 0;">
  <div class="container">
    <div class="header">
      <div class="logo">TORQUENS<span>MOTORS</span></div>
      <div style="margin-top: 8px; font-size: 10px; color: #717A8C; letter-spacing: 3px; text-transform: uppercase; font-family: monospace;">
        Private Client Registry · Geneva & Mayfair
      </div>
    </div>
    ${content}
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} TORQUENS MOTORS. All rights reserved.</p>
      <p style="margin-top: 8px;">
        <a href="${APP_URL}">Showroom</a> &bull;
        <a href="${APP_URL}/privacy">Privacy Policy</a> &bull;
        <a href="${APP_URL}/terms">Terms of Protocol</a>
      </p>
    </div>
  </div>
</body>
</html>
`;

// ─────────────────────────────────────────────────────────────
// 1. WELCOME EMAIL
// ─────────────────────────────────────────────────────────────
export const welcomeEmail: EmailTemplate<WelcomeEmailData> = {
  subject: 'Welcome to TORQUENS Private Client Registry',
  html: (data: WelcomeEmailData) =>
    emailWrapper(`
    <div class="content">
      <h1>Welcome, ${data.name}</h1>
      <p>Your private client account has been verified. You now possess accredited access to our off-market allocations and global concierge services.</p>
      <p>With your membership credentials, you can:</p>
      <ul style="color: #9EA5B5; padding-left: 20px;">
        <li style="margin: 8px 0;">Curate and track high-value vehicle allocations in your private vault</li>
        <li style="margin: 8px 0;">Submit confidential acquisition inquiries directly to authorized custodians</li>
        <li style="margin: 8px 0;">Access bespoke sourcing for rare competition and road chassis</li>
      </ul>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${APP_URL}/vehicles" class="button">Explore Showroom</a>
      </div>
      <p style="font-size: 13px; margin-top: 20px; color: #717A8C;">For bespoke concierge assistance, contact <a href="mailto:concierge@torquens.com" style="color: #C5A059; text-decoration: none;">concierge@torquens.com</a>.</p>
    </div>
  `),
};

// ─────────────────────────────────────────────────────────────
// 2. EMAIL VERIFICATION
// ─────────────────────────────────────────────────────────────
export const verificationEmail: EmailTemplate<VerificationEmailData> = {
  subject: 'Verify Vault Access - TORQUENS MOTORS',
  html: (data: VerificationEmailData) => {
    const verificationUrl = `${APP_URL}/auth/verify?token=${data.token}`;
    return emailWrapper(`
      <div class="content">
        <h1>Verify Vault Credentials, ${data.name}</h1>
        <p>Please authenticate your private client email to activate your account and access confidential vehicle portfolios.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" class="button">Verify Credentials</a>
        </div>
        <p style="margin-top: 20px; font-size: 13px;">Or copy and paste this verification key link into your browser:</p>
        <p style="font-size: 11px; word-break: break-all; background-color: #1A1E26; padding: 12px; border-radius: 4px; color: #F8F9FA; font-family: monospace;">${verificationUrl}</p>
        <p style="font-size: 12px; margin-top: 20px; color: #717A8C;">This authentication link will expire in 24 hours.</p>
      </div>
    `);
  },
};

// ─────────────────────────────────────────────────────────────
// 3. PASSWORD RESET
// ─────────────────────────────────────────────────────────────
export const passwordResetEmail: EmailTemplate<PasswordResetEmailData> = {
  subject: 'Reset Security Key - TORQUENS MOTORS',
  html: (data: PasswordResetEmailData) => {
    const resetUrl = `${APP_URL}/auth/reset-password?token=${data.token}`;
    return emailWrapper(`
      <div class="content">
        <h1>Security Key Reset, ${data.name}</h1>
        <p>We received a security key reset request for your TORQUENS registry account.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" class="button">Reset Security Key</a>
        </div>
        <p style="margin-top: 20px; font-size: 13px;">Direct security reset URL:</p>
        <p style="font-size: 11px; word-break: break-all; background-color: #1A1E26; padding: 12px; border-radius: 4px; color: #F8F9FA; font-family: monospace;">${resetUrl}</p>
        <p style="font-size: 12px; margin-top: 20px; color: #717A8C;">This single-use reset key will expire in 1 hour. If you did not request this, please disregard this transmission.</p>
      </div>
    `);
  },
};

// ─────────────────────────────────────────────────────────────
// 4. ENQUIRY CONFIRMATION (CLIENT)
// ─────────────────────────────────────────────────────────────
export const enquiryConfirmationEmail: EmailTemplate<EnquiryConfirmationEmailData> = {
  subject: (data: EnquiryConfirmationEmailData) => `Inquiry Lodged - ${data.vehicleName} | TORQUENS MOTORS`,
  html: (data: EnquiryConfirmationEmailData) => {
    const enquiryUrl = `${APP_URL}/dashboard/enquiries/${data.enquiryId}`;
    return emailWrapper(`
      <div class="content">
        <h1>Inquiry Dispatched, ${data.name}</h1>
        <p>Your allocation inquiry regarding the <strong>${data.vehicleName}</strong> has been received by our private brokerage registry.</p>
        <div class="details">
          <div><span class="details-label">Target Asset</span><br><span class="details-value">${data.vehicleName}</span></div>
          <div style="margin-top: 10px;"><span class="details-label">Assigned Custodian</span><br><span class="details-value">${data.dealerName}</span></div>
          <div style="margin-top: 10px;"><span class="details-label">Dossier ID</span><br><span class="details-value" style="font-family: monospace;">#${data.enquiryId.slice(0, 10)}</span></div>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${enquiryUrl}" class="button">Inspect Inquiry Dossier</a>
        </div>
        <p style="font-size: 13px; margin-top: 20px; color: #717A8C;">The assigned broker will initiate communication via your specified channel shortly.</p>
      </div>
    `);
  },
};

// ─────────────────────────────────────────────────────────────
// 5. DEALER ENQUIRY NOTIFICATION (DEALER)
// ─────────────────────────────────────────────────────────────
export const dealerEnquiryNotificationEmail: EmailTemplate<DealerEnquiryNotificationEmailData> = {
  subject: (data: DealerEnquiryNotificationEmailData) => `New Client Inquiry: ${data.vehicleName} | TORQUENS`,
  html: (data: DealerEnquiryNotificationEmailData) => {
    const dashboardUrl = `${APP_URL}/dealer/enquiries/${data.enquiryId}`;
    return emailWrapper(`
      <div class="content">
        <h1>New Client Allocation Inquiry</h1>
        <p>Hello ${data.dealerName},</p>
        <p>A prospective client has submitted an inquiry for <strong>${data.vehicleName}</strong>.</p>
        <div class="details">
          <div><span class="details-label">Client Name</span><br><span class="details-value">${data.customerName}</span></div>
          <div style="margin-top: 10px;"><span class="details-label">Client Email</span><br><span class="details-value">${data.customerEmail}</span></div>
          <div style="margin-top: 10px;"><span class="details-label">Phone</span><br><span class="details-value">${data.customerPhone || 'Not provided'}</span></div>
          <div style="margin-top: 10px;"><span class="details-label">Preferred Channel</span><br><span class="details-value">${data.preferredContact}</span></div>
          <div style="margin-top: 10px;"><span class="details-label">Vehicle</span><br><span class="details-value">${data.vehicleName}</span></div>
          <div style="margin-top: 14px;"><span class="details-label">Message / Logistics Note</span><br>
            <div style="background-color: #08090B; padding: 12px; border-radius: 4px; margin-top: 4px; color: #F8F9FA; font-size: 13px;">
              ${data.message}
            </div>
          </div>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${dashboardUrl}" class="button">Open In Broker Terminal</a>
        </div>
      </div>
    `);
  },
};

// ─────────────────────────────────────────────────────────────
// 6. VEHICLE VERIFIED (DEALER)
// ─────────────────────────────────────────────────────────────
export const vehicleVerifiedEmail: EmailTemplate<VehicleVerifiedEmailData> = {
  subject: (data: VehicleVerifiedEmailData) => `Provenance Cleared - ${data.vehicleName} | TORQUENS`,
  html: (data: VehicleVerifiedEmailData) => {
    const vehicleUrl = `${APP_URL}/vehicles/${data.vehicleId}`;
    return emailWrapper(`
      <div class="content">
        <h1>Allocation Cleared, ${data.dealerName}</h1>
        <p>Compliance review and provenance verification for <strong>${data.vehicleName}</strong> has been approved. The vehicle is now active in public and private showrooms.</p>
        <div style="text-align: center; padding: 10px 0;">
          <span class="badge">✓ TORQUENS Verified Provenance</span>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${vehicleUrl}" class="button">View Live Listing</a>
        </div>
      </div>
    `);
  },
};

// ─────────────────────────────────────────────────────────────
// 7. PRICE CHANGE ALERT
// ─────────────────────────────────────────────────────────────
export const priceChangeEmail: EmailTemplate<PriceChangeEmailData> = {
  subject: (data: PriceChangeEmailData) => `Valuation Update - ${data.vehicleName} | TORQUENS MOTORS`,
  html: (data: PriceChangeEmailData) => {
    const vehicleUrl = `${APP_URL}/vehicles/${data.vehicleId}`;
    const priceDiff = data.newPrice - data.oldPrice;
    const isPriceDrop = priceDiff < 0;
    const formattedOld = data.oldPrice.toLocaleString();
    const formattedNew = data.newPrice.toLocaleString();

    return emailWrapper(`
      <div class="content">
        <h1>Market Valuation Adjustment</h1>
        <p>Hello ${data.name},</p>
        <p>The listed price for bookmarked allocation <strong>${data.vehicleName}</strong> has been revised.</p>
        <div class="details">
          <div><span class="details-label">Previous Valuation</span><br><span class="details-value" style="text-decoration: line-through; color: #545B6B;">${data.currency} ${formattedOld}</span></div>
          <div style="margin-top: 10px;"><span class="details-label">Updated Price</span><br><span class="details-value" style="color: ${isPriceDrop ? '#10B981' : '#C5A059'}; font-size: 18px; font-family: monospace;">${data.currency} ${formattedNew}</span></div>
          ${isPriceDrop ? `<div style="margin-top: 8px;"><span class="badge" style="background-color: #10B981; color: #08090B;">Price Revised Downward</span></div>` : ''}
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${vehicleUrl}" class="button">View Updated Showcase</a>
        </div>
      </div>
    `);
  },
};

// ─────────────────────────────────────────────────────────────
// 8. RESERVATION CONFIRMATION
// ─────────────────────────────────────────────────────────────
export const reservationConfirmationEmail: EmailTemplate<ReservationConfirmationEmailData> = {
  subject: (data: ReservationConfirmationEmailData) => `Allocation Reserved - ${data.vehicleName} | TORQUENS`,
  html: (data: ReservationConfirmationEmailData) => {
    const vehicleUrl = `${APP_URL}/vehicles/${data.vehicleId}`;
    const expiryDate = new Date(data.expiresAt).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    return emailWrapper(`
      <div class="content">
        <h1>Allocation Confirmed</h1>
        <p>Hello ${data.name},</p>
        <p>Your reservation hold on <strong>${data.vehicleName}</strong> has been confirmed under escrow custody.</p>
        <div class="details">
          <div><span class="details-label">Vehicle</span><br><span class="details-value">${data.vehicleName}</span></div>
          <div style="margin-top: 10px;"><span class="details-label">Reservation ID</span><br><span class="details-value" style="font-family: monospace;">#${data.reservationId.slice(0, 10)}</span></div>
          <div style="margin-top: 10px;"><span class="details-label">Deposit Received</span><br><span class="details-value">${data.currency} ${data.depositAmount.toLocaleString()}</span></div>
          <div style="margin-top: 10px;"><span class="details-label">Hold Expiration</span><br><span class="details-value">${expiryDate}</span></div>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${vehicleUrl}" class="button">View Allocation Details</a>
        </div>
      </div>
    `);
  },
};

// ─────────────────────────────────────────────────────────────
// 9. DEALER REGISTRATION
// ─────────────────────────────────────────────────────────────
export const dealerRegistrationEmail: EmailTemplate<DealerRegistrationEmailData> = {
  subject: 'Broker Application Received - TORQUENS MOTORS',
  html: (data: DealerRegistrationEmailData) =>
    emailWrapper(`
    <div class="content">
      <h1>Brokerage Application In Review</h1>
      <p>Hello ${data.dealerName},</p>
      <p>Thank you for submitting your dealer accreditation application to the TORQUENS private network.</p>
      <p>Our compliance team is auditing your business registration, operating history, and custody facility documentation. You will receive an accreditation decision within 48 business hours.</p>
      <div class="details">
        <div><span class="details-label">Dealership Legal Name</span><br><span class="details-value">${data.dealerName}</span></div>
        <div style="margin-top: 10px;"><span class="details-label">Registered Contact</span><br><span class="details-value">${data.email}</span></div>
        <div style="margin-top: 10px;"><span class="details-label">Audit Status</span><br><span class="details-value"><span class="badge" style="background-color: #E2B96C; color: #08090B;">Compliance Audit Pending</span></span></div>
      </div>
    </div>
  `),
};