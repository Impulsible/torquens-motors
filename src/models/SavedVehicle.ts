/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { Schema, Document, Model } from 'mongoose';
import { ISavedVehicle } from '@/types';

export interface ISavedVehicleDocument
  extends Omit<ISavedVehicle, 'user' | 'vehicle' | 'id'>,
    Document {
  _id: mongoose.Types.ObjectId;
  id: string;
  user: string | mongoose.Types.ObjectId;
  vehicle: string | mongoose.Types.ObjectId;
  savedAt: Date;
}

const SavedVehicleSchema = new Schema<ISavedVehicleDocument>(
  {
    user: {
      type: Schema.Types.Mixed,
      required: [true, 'User reference is required'],
    },
    vehicle: {
      type: Schema.Types.Mixed,
      required: [true, 'Vehicle reference is required'],
    },
    savedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
    toJSON: {
      transform: function (_, ret) {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

SavedVehicleSchema.index({ user: 1, vehicle: 1 }, { unique: true });
SavedVehicleSchema.index({ user: 1 });
SavedVehicleSchema.index({ vehicle: 1 });

// Ensure cached model is re-compiled if schema changes during dev reload
if (process.env.NODE_ENV !== 'production' && mongoose.models.SavedVehicle) {
  delete (mongoose.models as any).SavedVehicle;
}

export const SavedVehicle: Model<ISavedVehicleDocument> =
  mongoose.models.SavedVehicle ||
  mongoose.model<ISavedVehicleDocument>('SavedVehicle', SavedVehicleSchema);

export default SavedVehicle;