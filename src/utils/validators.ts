import { z } from 'zod';

/* -------------------------------------------------------------------------- */
/*                               SHARED HELPERS                               */
/* -------------------------------------------------------------------------- */

const phoneRegex = /^\+?[1-9]\d{1,14}$/;
const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/i;

/* -------------------------------------------------------------------------- */
/*                        1. AUTHENTICATION & USER SCHEMAS                    */
/* -------------------------------------------------------------------------- */

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email address is required')
    .email('Please provide a valid email address')
    .toLowerCase(),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Name is required')
      .min(2, 'Name must be at least 2 characters')
      .max(60, 'Name cannot exceed 60 characters'),

    email: z
      .string()
      .trim()
      .min(1, 'Email address is required')
      .email('Please provide a valid email address')
      .toLowerCase(),

    // Phone is completely optional. Empty string is allowed.
    phone: z
      .string()
      .trim()
      .optional()
      .transform((v) => v ?? '')
      .refine(
        (v) => v === '' || phoneRegex.test(v),
        'Please enter a valid international phone number (e.g., +1234567890)'
      ),

    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),

    confirmPassword: z
      .string()
      .min(1, 'Please confirm your password'),

    // Accept boolean OR string "true"/"on"/"1"
    termsAccepted: z
      .union([z.boolean(), z.string()])
      .transform((v) => v === true || v === 'true' || v === 'on' || v === '1')
      .refine((v) => v === true, 'You must accept the terms and privacy policy'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(60),
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  phone: z
    .string()
    .trim()
    .optional()
    .transform((v) => v ?? '')
    .refine((v) => v === '' || phoneRegex.test(v), 'Invalid phone number format'),
  avatarUrl: z.string().url('Invalid image URL').optional().or(z.literal('')),
});

/* -------------------------------------------------------------------------- */
/*                         2. LUXURY VEHICLE SCHEMAS                          */
/* -------------------------------------------------------------------------- */

export const TransmissionEnum = z.enum([
  'Automatic',
  'Manual',
  'Dual-Clutch (PDK/DCT)',
  'Sequential',
  'Single-Speed Fixed',
]);

export const FuelTypeEnum = z.enum([
  'Petrol',
  'Diesel',
  'Electric',
  'Hybrid',
  'Plug-in Hybrid',
]);

export const DrivetrainEnum = z.enum(['RWD', 'AWD', '4WD', 'FWD']);

export const BodyTypeEnum = z.enum([
  'Coupe',
  'Sedan',
  'SUV',
  'Cabriolet / Convertible',
  'Hypercar / Supercar',
  'Targa',
  'Shooting Brake / Estate',
]);

export const VehicleStatusEnum = z.enum([
  'AVAILABLE',
  'RESERVED',
  'IN_TRANSIT',
  'ALLOCATION',
  'SOLD',
]);

export const VehicleConditionEnum = z.enum([
  'NEW',
  'PRE_OWNED',
  'CERTIFIED_PRE_OWNED',
  'CLASSIC_HERITAGE',
]);

export const vehicleSchema = z.object({
  vin: z
    .string()
    .trim()
    .toUpperCase()
    .regex(vinRegex, 'VIN must be a valid 17-character alphanumeric string')
    .optional()
    .or(z.literal('')),
  make: z.string().trim().min(1, 'Vehicle marque/make is required'),
  model: z.string().trim().min(1, 'Vehicle model is required'),
  trim: z.string().trim().optional(),
  year: z.coerce
    .number()
    .int()
    .min(1900, 'Year must be after 1900')
    .max(new Date().getFullYear() + 2, 'Year cannot be in the distant future'),
  price: z.coerce.number().positive('Price must be greater than zero'),
  currency: z.string().default('USD'),
  mileage: z.coerce.number().nonnegative('Mileage cannot be negative'),

  transmission: TransmissionEnum,
  fuelType: FuelTypeEnum,
  drivetrain: DrivetrainEnum,
  engine: z.string().trim().min(1, 'Engine specification is required'),
  horsepower: z.coerce.number().int().positive('Horsepower must be greater than 0'),
  acceleration: z.coerce.number().positive('0-60 time must be positive').optional(),
  topSpeed: z.coerce.number().int().positive('Top speed must be positive').optional(),

  bodyType: BodyTypeEnum,
  condition: VehicleConditionEnum.default('CERTIFIED_PRE_OWNED'),
  status: VehicleStatusEnum.default('AVAILABLE'),
  exteriorColor: z.string().trim().min(1, 'Exterior color is required'),
  interiorColor: z.string().trim().min(1, 'Interior color is required'),
  location: z.string().trim().min(1, 'Showroom location is required'),

  images: z
    .array(z.string().url('Must be a valid image URL'))
    .min(1, 'At least one vehicle photograph is required'),
  features: z.array(z.string()).default([]),
  description: z
    .string()
    .trim()
    .min(20, 'Vehicle description must be at least 20 characters'),
  isFeatured: z.boolean().default(false),
  isVerified: z.boolean().default(true),
});

/* -------------------------------------------------------------------------- */
/*                     3. INVENTORY SEARCH & FILTER SCHEMA                    */
/* -------------------------------------------------------------------------- */

export const vehicleFilterSchema = z.object({
  search: z.string().optional(),
  make: z.string().optional(),
  model: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  minYear: z.coerce.number().optional(),
  maxYear: z.coerce.number().optional(),
  maxMileage: z.coerce.number().optional(),
  bodyType: z.array(BodyTypeEnum).optional(),
  transmission: z.array(TransmissionEnum).optional(),
  fuelType: z.array(FuelTypeEnum).optional(),
  status: VehicleStatusEnum.optional(),
  sortBy: z
    .enum(['price_asc', 'price_desc', 'year_desc', 'mileage_asc', 'newest'])
    .default('newest'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

/* -------------------------------------------------------------------------- */
/*                  4. VIP CONCIERGE & TEST DRIVE INQUIRIES                   */
/* -------------------------------------------------------------------------- */

export const enquiryTypeEnum = z.enum([
  'GENERAL_INQUIRY',
  'PURCHASE_OFFER',
  'PRIVATE_VIEWING',
  'BESPOKE_SOURCING',
  'TRADE_IN_VALUATION',
]);

export const enquirySchema = z.object({
  vehicleId: z.string().optional(),
  enquiryType: enquiryTypeEnum.default('GENERAL_INQUIRY'),
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(60),
  email: z.string().trim().email('Please provide a valid email address').toLowerCase(),
  phone: z.string().trim().regex(phoneRegex, 'Please provide a valid phone number'),
  preferredContact: z.enum(['EMAIL', 'PHONE', 'WHATSAPP']),
  message: z.string().trim().min(10, 'Please provide at least 10 characters').max(1500),
  hasTradeIn: z.boolean().default(false),
  tradeInDetails: z.string().trim().optional(),
});

export const testDriveBookingSchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle selection is required'),
  name: z.string().trim().min(2, 'Full name is required'),
  email: z.string().trim().email('Valid email address is required').toLowerCase(),
  phone: z.string().trim().regex(phoneRegex, 'Valid contact number is required'),
  preferredDate: z.string().refine((dateStr) => {
    const selected = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selected >= today;
  }, 'Scheduled date must be today or in the future'),
  timeSlot: z.enum(['MORNING_10AM', 'AFTERNOON_2PM', 'EVENING_5PM']),
  locationType: z.enum(['SHOWROOM', 'PRIVATE_RESIDENCE', 'CONCIERGE_DELIVERY']),
  driverLicenseNumber: z.string().trim().min(5, 'Driver license number is required'),
  notes: z.string().trim().max(500).optional(),
});

/* -------------------------------------------------------------------------- */
/*                       5. EXPORTED TYPES (TYPE INFERENCE)                   */
/* -------------------------------------------------------------------------- */

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export type VehicleInput = z.infer<typeof vehicleSchema>;
export type VehicleFilterParams = z.infer<typeof vehicleFilterSchema>;
export type VehicleStatus = z.infer<typeof VehicleStatusEnum>;
export type VehicleCondition = z.infer<typeof VehicleConditionEnum>;
export type TransmissionType = z.infer<typeof TransmissionEnum>;
export type FuelType = z.infer<typeof FuelTypeEnum>;
export type BodyType = z.infer<typeof BodyTypeEnum>;

export type EnquiryInput = z.infer<typeof enquirySchema>;
export type TestDriveBookingInput = z.infer<typeof testDriveBookingSchema>;