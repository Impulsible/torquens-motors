import mongoose, { Schema, Document, Model } from 'mongoose';
import { IPayment } from '@/types';

export interface IPaymentDocument extends Omit<IPayment, 'id'>, Document {}

const PaymentSchema = new Schema<IPaymentDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reservation: {
      type: Schema.Types.ObjectId,
      ref: 'Reservation',
      default: null,
    },
    amount: {
      type: Number,
      required: true,
      min: [0, 'Amount must be non-negative'],
    },
    currency: {
      type: String,
      required: true,
      default: 'NGN',
    },
    status: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED'],
      default: 'PENDING',
    },
    paymentMethod: {
      type: String,
      enum: ['CARD', 'BANK_TRANSFER', 'PAYPAL', 'STRIPE'],
      required: true,
    },
    stripePaymentIntentId: {
      type: String,
      default: null,
    },
    stripeCustomerId: {
      type: String,
      default: null,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    completedAt: {
      type: Date,
      default: null,
    },
    refundedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
PaymentSchema.index({ user: 1 });
PaymentSchema.index({ reservation: 1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ stripePaymentIntentId: 1 });
PaymentSchema.index({ createdAt: -1 });

// Static methods
PaymentSchema.statics.getByUser = async function(userId: string) {
  return this.find({ user: userId }).sort({ createdAt: -1 });
};

PaymentSchema.statics.getByReservation = async function(reservationId: string) {
  return this.findOne({ reservation: reservationId });
};

export const Payment: Model<IPaymentDocument> = 
  mongoose.models.Payment || mongoose.model<IPaymentDocument>('Payment', PaymentSchema);