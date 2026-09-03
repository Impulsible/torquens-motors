import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().min(2, 'Full legal name is required (at least 2 characters)'),
  email: z.string().email('Please enter a valid private client email address'),
  phone: z.string().min(6, 'Please provide a direct telephone number'),
  inquiryType: z.enum([
    'BESPOKE_SOURCING',
    'CONSIGNMENT_APPRAISAL',
    'PRIVATE_VIEWING',
    'ESCROW_LOGISTICS',
    'GENERAL_CONCIERGE',
  ]),
  preferredChannel: z.enum(['EMAIL', 'PHONE', 'WHATSAPP']),
  targetAsset: z.string().optional(),
  message: z.string().min(15, 'Please provide at least 15 characters of instruction details'),
});

export type ContactFormData = z.infer<typeof contactSchema>;

export interface ContactActionResponse<T = undefined> {
  success: boolean;
  message: string;
  data?: T;
}