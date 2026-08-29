import mongoose, { Schema, Document, Model } from 'mongoose';
import { ISavedVehicle } from '@/types';

export interface ISavedVehicleDocument extends Omit<ISavedVehicle, 'user' | 'vehicle' | 'id'>, Document {
  _id: mongoose.Types.ObjectId;
  id: string;
  user: mongoose.Types.ObjectId;
  vehicle: mongoose.Types.ObjectId;
}

const SavedVehicleSchema = new Schema<ISavedVehicleDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    vehicle: {
      type: Schema.Types.ObjectId,
      ref: 'Vehicle',
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
      transform: function(_, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Prevent duplicate saves
SavedVehicleSchema.index({ user: 1, vehicle: 1 }, { unique: true });

// Add indexes
SavedVehicleSchema.index({ user: 1 });
SavedVehicleSchema.index({ vehicle: 1 });

export const SavedVehicle: Model<ISavedVehicleDocument> = 
  mongoose.models.SavedVehicle || mongoose.model<ISavedVehicleDocument>('SavedVehicle', SavedVehicleSchema);

export default SavedVehicle;