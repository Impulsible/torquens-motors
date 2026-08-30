/* eslint-disable @typescript-eslint/no-unused-vars */
import mongoose, { Schema, Document, Model } from 'mongoose';
import { IVehicle } from '@/types';

export interface IVehicleDocument extends Omit<IVehicle, 'id' | 'dealer'> {
  _id: string;
  dealer: mongoose.Types.ObjectId;
  model: string;
}

const VehicleSchema = new Schema<IVehicleDocument>(
  {
    make: {
      type: String,
      required: [true, 'Make is required'],
      trim: true,
      minlength: [2, 'Make must be at least 2 characters'],
      maxlength: [50, 'Make must be at most 50 characters'],
    },
    model: {
      type: String,
      required: [true, 'Model is required'],
      trim: true,
      minlength: [2, 'Model must be at least 2 characters'],
      maxlength: [50, 'Model must be at most 50 characters'],
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
      min: [1900, 'Year must be after 1900'],
      max: [new Date().getFullYear() + 2, 'Year cannot be in the distant future'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be a positive number'],
    },
    currency: {
      type: String,
      default: 'NGN',
      uppercase: true,
      trim: true,
    },
    mileage: {
      type: Number,
      required: [true, 'Mileage is required'],
      min: [0, 'Mileage cannot be negative'],
    },
    transmission: {
      type: String,
      enum: ['Automatic', 'Manual', 'Semi-Automatic'],
      required: [true, 'Transmission type is required'],
    },
    fuelType: {
      type: String,
      enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'Plug-in Hybrid'],
      required: [true, 'Fuel type is required'],
    },
    engine: {
      type: String,
      required: [true, 'Engine specification is required'],
      trim: true,
    },
    horsepower: {
      type: Number,
      required: [true, 'Horsepower is required'],
      min: [1, 'Horsepower must be greater than 0'],
    },
    drivetrain: {
      type: String,
      enum: ['FWD', 'RWD', 'AWD', '4WD'],
      required: [true, 'Drivetrain type is required'],
    },
    bodyType: {
      type: String,
      required: [true, 'Body type is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: function(images: string[]) {
          return images.every(url => /^https?:\/\/.+/.test(url));
        },
        message: 'Each image must be a valid URL',
      },
    },
    features: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [20, 'Description must be at least 20 characters'],
      maxlength: [5000, 'Description must be at most 5000 characters'],
    },
    dealer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Dealer reference is required'],
    },
    verified: {
      type: String,
      enum: ['UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED'],
      default: 'UNVERIFIED',
    },
    status: {
      type: String,
      enum: ['DRAFT', 'PENDING_REVIEW', 'APPROVED', 'PUBLISHED', 'SOLD', 'ARCHIVED'],
      default: 'DRAFT',
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function(_, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform: function(_, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Add indexes for performance
VehicleSchema.index({ make: 1, model: 1 });
VehicleSchema.index({ price: 1 });
VehicleSchema.index({ status: 1 });
VehicleSchema.index({ slug: 1 });
VehicleSchema.index({ dealer: 1 });
VehicleSchema.index({ createdAt: -1 });
VehicleSchema.index({ verified: 1 });

// Static methods
VehicleSchema.statics.findBySlug = async function(slug: string) {
  return this.findOne({ slug });
};

VehicleSchema.statics.findByDealer = async function(dealerId: string) {
  return this.find({ dealer: dealerId });
};

VehicleSchema.statics.findPublished = async function() {
  return this.find({ status: 'PUBLISHED' });
};

// ✅ Fix: Safe model creation with fallback
let Vehicle: Model<IVehicleDocument>;

try {
  // Try to get existing model
  Vehicle = mongoose.model<IVehicleDocument>('Vehicle');
} catch {
  // If it doesn't exist, create it
  Vehicle = mongoose.model<IVehicleDocument>('Vehicle', VehicleSchema);
}

// ✅ Alternative: Using the cached models pattern
// const Vehicle = mongoose.models.Vehicle as Model<IVehicleDocument> || 
//   mongoose.model<IVehicleDocument>('Vehicle', VehicleSchema);

export { Vehicle };
export default Vehicle;