import mongoose, { Schema, Document, Model } from 'mongoose';
import { ITransaction } from '@/types';

export interface ITransactionDocument extends Omit<ITransaction, 'id'>, Document {
  id: string;
}

const TransactionSchema = new Schema<ITransactionDocument>(
  {
    payment: {
      type: Schema.Types.ObjectId,
      ref: 'Payment',
      required: true,
    },
    type: {
      type: String,
      enum: ['DEPOSIT', 'RESERVATION', 'COMMISSION', 'REFUND'],
      required: true,
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
      enum: ['PENDING', 'COMPLETED', 'FAILED'],
      default: 'PENDING',
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    reference: {
      type: String,
      required: true,
      unique: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
TransactionSchema.index({ payment: 1 });
TransactionSchema.index({ reference: 1 });
TransactionSchema.index({ status: 1 });
TransactionSchema.index({ createdAt: -1 });

// Pre-save middleware to generate reference if not provided
TransactionSchema.pre('save', function(next) {
  if (!this.reference) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    this.reference = `TOR-${timestamp}-${random}`.toUpperCase();
  }
  next();
});

export const Transaction: Model<ITransactionDocument> = 
  mongoose.models.Transaction || mongoose.model<ITransactionDocument>('Transaction', TransactionSchema);