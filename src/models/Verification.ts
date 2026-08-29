import mongoose, { Schema, Document, Model } from 'mongoose';
import { IVerification } from '@/types';

export interface IVerificationDocument extends Omit<IVerification, 'id'>, Document {
  id: string;
}

const VerificationSchema = new Schema<IVerificationDocument>(
  {
    vehicle: {
      type: Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },
    dealer: {
      type: Schema.Types.ObjectId,
      ref: 'Dealer',
      default: null,
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
    },
    documents: [{
      type: String,
      required: true,
    }],
    notes: {
      type: String,
      default: null,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
VerificationSchema.index({ vehicle: 1 });
VerificationSchema.index({ status: 1 });
VerificationSchema.index({ createdAt: -1 });

// Static methods
VerificationSchema.statics.getPending = async function() {
  return this.find({ status: 'PENDING' }).populate('vehicle');
};

VerificationSchema.statics.getByVehicle = async function(vehicleId: string) {
  return this.findOne({ vehicle: vehicleId });
};

export const Verification: Model<IVerificationDocument> = 
  mongoose.models.Verification || mongoose.model<IVerificationDocument>('Verification', VerificationSchema);