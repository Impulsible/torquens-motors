import mongoose, { Schema, Document, Model } from 'mongoose';
import { IReservation } from '@/types';

export interface IReservationDocument extends Omit<IReservation, 'id'>, Document {}

const ReservationSchema = new Schema<IReservationDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    vehicle: {
      type: Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'EXPIRED'],
      default: 'PENDING',
    },
    depositAmount: {
      type: Number,
      required: true,
      min: [0, 'Deposit amount must be non-negative'],
    },
    depositPaid: {
      type: Boolean,
      default: false,
    },
    reservationFee: {
      type: Number,
      required: true,
      min: [0, 'Reservation fee must be non-negative'],
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    confirmedAt: {
      type: Date,
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
ReservationSchema.index({ user: 1, vehicle: 1 });
ReservationSchema.index({ status: 1 });
ReservationSchema.index({ expiresAt: 1 });
ReservationSchema.index({ createdAt: -1 });

// Static methods
ReservationSchema.statics.getActive = async function(userId: string) {
  return this.find({
    user: userId,
    status: { $in: ['PENDING', 'CONFIRMED'] },
    expiresAt: { $gt: new Date() },
  });
};

ReservationSchema.statics.expirePending = async function() {
  return this.updateMany(
    {
      status: 'PENDING',
      expiresAt: { $lt: new Date() },
    },
    { status: 'EXPIRED' }
  );
};

export const Reservation: Model<IReservationDocument> = 
  mongoose.models.Reservation || mongoose.model<IReservationDocument>('Reservation', ReservationSchema);