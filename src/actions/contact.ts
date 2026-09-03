'use server';

import { EmailService } from '@/services/email';
import { contactSchema, type ContactFormData, type ContactActionResponse } from '@/types/contact';

export async function submitContactInquiry(data: ContactFormData): Promise<ContactActionResponse> {
  try {
    const validated = contactSchema.parse(data);

    try {
      if (EmailService?.sendDealerEnquiryNotification) {
        await EmailService.sendDealerEnquiryNotification(
          process.env.CONCIERGE_EMAIL || 'concierge@torquens.com',
          'TORQUENS Central Desk',
          {
            dealerName: 'TORQUENS Private Concierge',
            customerName: validated.name,
            customerEmail: validated.email,
            customerPhone: validated.phone,
            preferredContact: validated.preferredChannel,
            vehicleName: validated.targetAsset || `Direct [${validated.inquiryType}] Transmission`,
            enquiryId: `direct_${Date.now()}`,
            message: validated.message,
          }
        );
      }
    } catch (mailErr) {
      console.warn('[ContactAction] Mail notification warning (non-fatal):', mailErr);
    }

    return {
      success: true,
      message: 'Your confidential inquiry has been registered with our senior brokerage desk.',
    };
  } catch (error) {
    console.error('[ContactAction] Error:', error);
    return {
      success: false,
      message: 'Failed to dispatch inquiry. Please reach out via our direct telephone lines.',
    };
  }
}