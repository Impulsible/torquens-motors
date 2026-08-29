import mongoose, { Schema, Document, Model } from 'mongoose';
import { ISubscription } from '@/types';

export interface ISubscriptionDocument extends Omit<ISubscription, 'id'>, Document {}

const SubscriptionSchema = new Schema<ISubscriptionDocument>(
  {
    dealer: {
      type: Schema.Types.ObjectId,
      ref: 'Dealer',
      required: true,
    },
    plan: {
      type: String,
      enum: ['BASIC', 'PREMIUM', 'ENTERPRISE'],
      required: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'EXPIRED', 'CANCELLED', 'PENDING'],
      default: 'PENDING',
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price must be non-negative'],
    },
    currency: {
      type: String,
      required: true,
      default: 'NGN',
    },
    features: [{
      type: String,
    }],
    autoRenew: {
      type: Boolean,
      default: false,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    stripeSubscriptionId: {
      type: String,
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
SubscriptionSchema.index({ dealer: 1 });
SubscriptionSchema.index({ status: 1 });
SubscriptionSchema.index({ endDate: 1 });
SubscriptionSchema.index({ stripeSubscriptionId: 1 });

// Static methods
SubscriptionSchema.statics.getActiveByDealer = async function(dealerId: string) {
  return this.findOne({
    dealer: dealerId,
    status: 'ACTIVE',
    endDate: { $gt: new Date() },
  });
};

SubscriptionSchema.statics.getExpiring = async function(days: number = 7) {
  const threshold = new Date();
  threshold.setDate(threshold.getDate() + days);
  return this.find({
    status: 'ACTIVE',
    endDate: { $lte: threshold, $gt: new Date() },
  });
};

export const Subscription: Model<ISubscriptionDocument> = 
  mongoose.models.Subscription || mongoose.model<ISubscriptionDocument>('Subscription', SubscriptionSchema);