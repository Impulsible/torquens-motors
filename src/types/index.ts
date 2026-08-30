/* eslint-disable @typescript-eslint/no-explicit-any */
export type UserRole = 'CUSTOMER' | 'DEALER' | 'ADMIN';

export interface IUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  avatar?: string | null;
  phone?: string | null;
  emailVerified: boolean;
  lastLogin?: Date | null;
  preferences?: {
    currency: string;
    notifications: boolean;
    savedSearches: string[];
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IDealer {
  id: string;
  name: string;
  description?: string;
  logo?: string | null;
  location: string;
  phone: string;
  email: string;
  verified: boolean;
  owner?: string | IUser;
  website?: string | null;
  socialMedia?: {
    instagram?: string | null;
    twitter?: string | null;
    facebook?: string | null;
    linkedin?: string | null;
  };
  operatingHours?: {
    monday?: string | null;
    tuesday?: string | null;
    wednesday?: string | null;
    thursday?: string | null;
    friday?: string | null;
    saturday?: string | null;
    sunday?: string | null;
  };
  rating?: number;
  totalReviews?: number;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type VehicleStatus = 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'AVAILABLE' | 'SOLD' | 'ARCHIVED';
export type VerificationStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
export type FuelType = 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid' | 'Plug-in Hybrid';
export type TransmissionType = 'Automatic' | 'Manual' | 'Semi-Automatic';
export type DrivetrainType = 'FWD' | 'RWD' | 'AWD' | '4WD';

export interface IVehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  currency: string;
  mileage: number;
  transmission: TransmissionType | string;
  fuelType: FuelType | string;
  engine?: string;
  horsepower?: number;
  power?: string | number;
  drivetrain?: DrivetrainType | string;
  bodyType?: string;
  location: string;
  images: string[];
  features?: string[];
  description?: string;
  dealer?: string | IDealer;
  verified?: VerificationStatus | string | boolean;
  status: VehicleStatus | string;
  slug?: string;
  views?: number;
  savedCount?: number;
  enquiryCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Alias for backward compatibility
export type Vehicle = IVehicle;

export interface IEnquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  vehicle: string | IVehicle;
  status: 'NEW' | 'CONTACTED' | 'NEGOTIATING' | 'CLOSED' | 'CANCELLED';
  preferredContact: 'EMAIL' | 'PHONE' | 'WHATSAPP';
  dealerResponded?: boolean;
  respondedAt?: Date | null;
  notes?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISavedVehicle {
  id: string;
  user: string | IUser;
  vehicle: string | IVehicle;
  savedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IComparison {
  id: string;
  user?: string | IUser;
  vehicles: string[] | IVehicle[];
  name?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IMessage {
  id: string;
  sender: string | IUser;
  receiver: string | IUser;
  content: string;
  read: boolean;
  readAt?: Date | null;
  enquiry?: string | IEnquiry;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface INotification {
  id: string;
  user: string | IUser;
  type: 'ENQUIRY' | 'MESSAGE' | 'PRICE_CHANGE' | 'VERIFICATION' | 'RESERVATION' | 'SYSTEM';
  title: string;
  message: string;
  read: boolean;
  readAt?: Date | null;
  data?: any;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IReview {
  id: string;
  user: string | IUser;
  dealer: string | IDealer;
  rating: number;
  title: string;
  content: string;
  verified: boolean;
  helpfulCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IVerification {
  id: string;
  vehicle: string | IVehicle;
  dealer?: string | IDealer;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  documents: string[];
  notes?: string;
  reviewedBy?: string | IUser;
  reviewedAt?: Date;
  expiresAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IReservation {
  id: string;
  user: string | IUser;
  vehicle: string | IVehicle;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'EXPIRED';
  depositAmount: number;
  depositPaid: boolean;
  reservationFee: number;
  expiresAt: Date;
  confirmedAt?: Date;
  cancelledAt?: Date;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IPayment {
  id: string;
  user: string | IUser;
  reservation?: string | IReservation;
  amount: number;
  currency: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'CANCELLED';
  paymentMethod: 'CARD' | 'BANK_TRANSFER' | 'PAYPAL' | 'STRIPE';
  stripePaymentIntentId?: string;
  stripeCustomerId?: string;
  metadata?: any;
  completedAt?: Date;
  refundedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ITransaction {
  id: string;
  payment: string | IPayment;
  type: 'DEPOSIT' | 'RESERVATION' | 'COMMISSION' | 'REFUND';
  amount: number;
  currency: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  description: string;
  reference: string;
  metadata?: any;
  completedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISubscription {
  id: string;
  dealer: string | IDealer;
  plan: 'BASIC' | 'PREMIUM' | 'ENTERPRISE';
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PENDING';
  startDate: Date;
  endDate: Date;
  price: number;
  currency: string;
  features: string[];
  autoRenew: boolean;
  paymentMethod: string;
  stripeSubscriptionId?: string;
  cancelledAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICollection {
  id: string;
  name: string;
  slug: string;
  description: string;
  image?: string;
  vehicles: string[] | IVehicle[];
  featured: boolean;
  published: boolean;
  metadata?: any;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent?: string | ICategory;
  metadata?: any;
  createdAt?: Date;
  updatedAt?: Date;
}