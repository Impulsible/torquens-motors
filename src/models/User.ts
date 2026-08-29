/* eslint-disable @typescript-eslint/no-unused-vars */
import mongoose, { Schema, Document, Model } from 'mongoose';
import { IUser, UserRole } from '@/types';

// Extend IUser with Mongoose Document
export interface IUserDocument extends Omit<IUser, 'id'>, Document {
  _id: string; // Mongoose uses _id instead of id
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name must be at most 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: ['CUSTOMER', 'DEALER', 'ADMIN'],
      default: 'CUSTOMER',
      required: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\+?[\d\s-]{10,}$/, 'Please enter a valid phone number'],
      default: null,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    preferences: {
      type: {
        currency: { type: String, default: 'NGN' },
        notifications: { type: Boolean, default: true },
        savedSearches: [{ type: String }],
      },
      default: {},
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function(_, ret) {
        // Convert _id to id for API responses
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform: function(_, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Add indexes for performance
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ createdAt: -1 });

// Method to compare passwords (will be implemented with bcrypt)
UserSchema.methods.comparePassword = async function(
  this: IUserDocument,
  candidatePassword: string
): Promise<boolean> {
  // This will be implemented in the auth service with bcrypt
  // The method is defined here for type safety
  return false;
};

// Static methods
UserSchema.statics.findByEmail = async function(email: string) {
  return this.findOne({ email });
};

UserSchema.statics.findByRole = async function(role: string) {
  return this.find({ role });
};

// Create or get model
export const User: Model<IUserDocument> = 
  mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);

export default User;