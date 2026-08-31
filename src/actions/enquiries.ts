'use server';

import { getServerSession } from 'next-auth';
import { authConfig } from '@/auth/config';
import { EnquiryService } from '@/services/enquiry.service';
import { EmailService } from '@/services/email';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { enquirySchema } from '@/utils/validators';

// ─────────────────────────────────────────────────────────────
// SECURE DOMAIN TYPE DEFINITIONS
// ─────────────────────────────────────────────────────────────
export type EnquiryStatus = 'NEW' | 'CONTACTED' | 'NEGOTIATING' | 'CLOSED' | 'CANCELLED';
export type PreferredContact = 'EMAIL' | 'PHONE' | 'WHATSAPP';
export type EnquiryType =
  | 'GENERAL_INQUIRY'
  | 'PURCHASE_OFFER'
  | 'PRIVATE_VIEWING'
  | 'BESPOKE_SOURCING'
  | 'TRADE_IN_VALUATION';

export interface ActionResponse<T = undefined> {
  success: boolean;
  message: string;
  data?: T;
  enquiryId?: string;
}

// NextAuth custom session user profile representation
interface AuthenticatedUser {
  id: string;
  email?: string | null;
  name?: string | null;
  role?: 'CLIENT' | 'DEALER' | 'ADMIN' | string;
}

interface SecureSession {
  user?: AuthenticatedUser;
}

// ─────────────────────────────────────────────────────────────
// HELPER: SECURE SESSION RETRIEVAL
// ─────────────────────────────────────────────────────────────
async function getSecureSession(): Promise<SecureSession | null> {
  try {
    return (await getServerSession(authConfig)) as SecureSession | null;
  } catch (error) {
    console.error('[EnquiryActions] Failed to retrieve server session:', error);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
// ACTION: CREATE ENQUIRY
// ─────────────────────────────────────────────────────────────
export async function createEnquiry(formData: FormData): Promise<ActionResponse> {
  try {
    const vehicleId = formData.get('vehicleId');
    if (typeof vehicleId !== 'string' || !vehicleId) {
      return {
        success: false,
        message: 'A valid Vehicle ID allocation is required to submit an inquiry.',
      };
    }

    const enquiryType = formData.get('enquiryType') as string | null;
    const hasTradeIn = formData.get('hasTradeIn') === 'true';
    const tradeInDetails = formData.get('tradeInDetails') as string | null;

    const rawData = {
      vehicleId,
      name: (formData.get('name') as string) || '',
      email: (formData.get('email') as string) || '',
      phone: (formData.get('phone') as string) || '',
      message: (formData.get('message') as string) || '',
      preferredContact: (formData.get('preferredContact') as PreferredContact) || 'EMAIL',
      enquiryType: (enquiryType as EnquiryType) || 'GENERAL_INQUIRY',
      hasTradeIn,
      tradeInDetails: tradeInDetails || '',
    };

    // Zod validation execution
    const validatedData = enquirySchema.parse(rawData);

    // Create record using the secure database service layer
    const enquiry = await EnquiryService.createEnquiry({
      ...validatedData,
      vehicleId,
    });

    const enquiryWithDetails = await EnquiryService.getEnquiry(enquiry.id);
    if (!enquiryWithDetails) {
      throw new Error('Enquiry created successfully but could not retrieve generated details.');
    }

    // Send confirmation email to client
    await EmailService.sendEnquiryConfirmation(
      enquiryWithDetails.email,
      enquiryWithDetails.name,
      `${enquiryWithDetails.vehicle.make} ${enquiryWithDetails.vehicle.model}`,
      enquiryWithDetails.id
    );

    // Send notice notification email to assigned portfolio dealer
    await EmailService.sendDealerEnquiryNotification(
      enquiryWithDetails.vehicle.dealer.email,
      enquiryWithDetails.vehicle.dealer.name,
      enquiryWithDetails
    );

    // Revalidate paths for server-side state freshness
    revalidatePath('/dashboard/enquiries');
    revalidatePath(`/vehicles/${enquiryWithDetails.vehicle.id}`);

    return {
      success: true,
      message: 'Your inquiry has been successfully lodged with our private registry.',
      enquiryId: enquiry.id,
    };
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const firstIssue = error.issues[0];
      return {
        success: false,
        message: firstIssue?.message || 'Inquiry input parameters failed validation checks.',
      };
    }
    console.error('[EnquiryActions] createEnquiry exception:', error);
    return {
      success: false,
      message: 'Failed to dispatch allocation inquiry. Please verify inputs and try again.',
    };
  }
}

// ─────────────────────────────────────────────────────────────
// ACTION: GET USER ENQUIRIES
// ─────────────────────────────────────────────────────────────
export async function getUserEnquiries(): Promise<ActionResponse<unknown[]>> {
  const session = await getSecureSession();

  if (!session?.user?.email) {
    return { success: false, message: 'Unauthenticated session execution.', data: [] };
  }

  try {
    const enquiries = await EnquiryService.getEnquiriesByEmail(session.user.email);
    return {
      success: true,
      message: 'User enquiries fetched successfully.',
      data: enquiries,
    };
  } catch (error: unknown) {
    console.error('[EnquiryActions] getUserEnquiries exception:', error);
    return { success: false, message: 'Could not access user inquiry registry ledger.', data: [] };
  }
}

// ─────────────────────────────────────────────────────────────
// ACTION: GET DEALER ENQUIRIES
// ─────────────────────────────────────────────────────────────
export async function getDealerEnquiries(): Promise<ActionResponse<unknown[]>> {
  const session = await getSecureSession();

  if (!session?.user?.id || session.user.role !== 'DEALER') {
    return { success: false, message: 'Unauthorized permission level.', data: [] };
  }

  try {
    const enquiries = await EnquiryService.getEnquiriesByDealer(session.user.id);
    return {
      success: true,
      message: 'Dealer enquiries fetched successfully.',
      data: enquiries,
    };
  } catch (error: unknown) {
    console.error('[EnquiryActions] getDealerEnquiries exception:', error);
    return { success: false, message: 'Failed to query database for assigned dealer requests.', data: [] };
  }
}

// ─────────────────────────────────────────────────────────────
// ACTION: UPDATE STATUS
// ─────────────────────────────────────────────────────────────
export async function updateEnquiryStatus(enquiryId: string, status: string): Promise<ActionResponse> {
  const session = await getSecureSession();

  if (!session?.user?.id) {
    return { success: false, message: 'Unauthenticated session execution.' };
  }

  try {
    const validStatuses: EnquiryStatus[] = ['NEW', 'CONTACTED', 'NEGOTIATING', 'CLOSED', 'CANCELLED'];
    if (!validStatuses.includes(status as EnquiryStatus)) {
      return { success: false, message: 'Provided payload is not an authorized status definition.' };
    }

    await EnquiryService.updateStatus(enquiryId, status as EnquiryStatus);
    
    revalidatePath('/dashboard/enquiries');
    revalidatePath('/dealer/enquiries');

    return { success: true, message: 'Ledger record updated successfully.' };
  } catch (error: unknown) {
    console.error('[EnquiryActions] updateEnquiryStatus exception:', error);
    return { success: false, message: 'Failed to write updated status to database.' };
  }
}

// ─────────────────────────────────────────────────────────────
// ACTION: GET SINGLE ENQUIRY BY ID
// ─────────────────────────────────────────────────────────────
export async function getEnquiryById(enquiryId: string): Promise<ActionResponse<unknown | null>> {
  const session = await getSecureSession();

  if (!session?.user?.id) {
    return { success: false, message: 'Unauthenticated session execution.', data: null };
  }

  try {
    const enquiry = await EnquiryService.getEnquiry(enquiryId);
    
    if (!enquiry) {
      return { success: false, message: 'Allocation request dossier not found.', data: null };
    }

    const isCustomer = enquiry.email === session.user.email;
    const isDealer = enquiry.vehicle.dealer.id === session.user.id;
    
    if (!isCustomer && !isDealer) {
      return { success: false, message: 'Access denied: unauthorized registry access.', data: null };
    }

    return {
      success: true,
      message: 'Enquiry retrieved successfully.',
      data: enquiry,
    };
  } catch (error: unknown) {
    console.error('[EnquiryActions] getEnquiryById exception:', error);
    return { success: false, message: 'Database access failed for this inquiry key.', data: null };
  }
}

// ─────────────────────────────────────────────────────────────
// ACTION: DELETE ENQUIRY (SOFT DELETE)
// ─────────────────────────────────────────────────────────────
export async function deleteEnquiry(enquiryId: string): Promise<ActionResponse> {
  const session = await getSecureSession();

  if (!session?.user?.id) {
    return { success: false, message: 'Unauthenticated session execution.' };
  }

  try {
    const enquiry = await EnquiryService.getEnquiry(enquiryId);
    
    if (!enquiry) {
      return { success: false, message: 'Allocation request dossier not found.' };
    }

    const isCustomer = enquiry.email === session.user.email;
    const isDealer = enquiry.vehicle.dealer.id === session.user.id;
    
    if (!isCustomer && !isDealer) {
      return { success: false, message: 'Access denied: unauthorized modification request.' };
    }

    await EnquiryService.deleteEnquiry(enquiryId);
    
    revalidatePath('/dashboard/enquiries');
    revalidatePath('/dealer/enquiries');

    return { success: true, message: 'Ledger record archived successfully.' };
  } catch (error: unknown) {
    console.error('[EnquiryActions] deleteEnquiry exception:', error);
    return { success: false, message: 'Failed to write soft deletion signature.' };
  }
}

// ─────────────────────────────────────────────────────────────
// ACTION: MARK READ
// ─────────────────────────────────────────────────────────────
export async function markEnquiryAsRead(enquiryId: string): Promise<ActionResponse> {
  const session = await getSecureSession();

  if (!session?.user?.id) {
    return { success: false, message: 'Unauthenticated session execution.' };
  }

  try {
    const enquiry = await EnquiryService.getEnquiry(enquiryId);
    
    if (!enquiry) {
      return { success: false, message: 'Allocation request dossier not found.' };
    }

    const isDealer = enquiry.vehicle.dealer.id === session.user.id;
    if (!isDealer) {
      return { success: false, message: 'Access denied: only assigned brokers can mark read.' };
    }

    await EnquiryService.markAsRead(enquiryId);
    
    revalidatePath('/dealer/enquiries');

    return { success: true, message: 'Ledger records updated to read status.' };
  } catch (error: unknown) {
    console.error('[EnquiryActions] markEnquiryAsRead exception:', error);
    return { success: false, message: 'Failed to write read-state signature.' };
  }
}