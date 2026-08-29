import mongoose, { Schema, Document, Model } from 'mongoose';
import { IEnquiry } from '@/types';

export interface IEnquiryDocument extends Omit<IEnquiry, 'id' | 'vehicle'>, Document {
  _id: string;
  vehicle: mongoose.Types.ObjectId;
}

const EnquirySchema = new Schema<IEnquiryDocument>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [60, 'Name must be at most 60 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [/^\+?[\d\s-]{10,}$/, 'Please enter a valid phone number'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      minlength: [10, 'Message must be at least 10 characters'],
      maxlength: [1500, 'Message must be at most 1500 characters'],
    },
    vehicle: {
      type: Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: [true, 'Vehicle reference is required'],
    },
    status: {
      type: String,
      enum: ['NEW', 'CONTACTED', 'NEGOTIATING', 'CLOSED', 'CANCELLED'],
      default: 'NEW',
    },
    preferredContact: {
      type: String,
      enum: ['EMAIL', 'PHONE', 'WHATSAPP'],
      default: 'EMAIL',
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
  }
);

// Add indexes
EnquirySchema.index({ email: 1 });
EnquirySchema.index({ vehicle: 1 });
EnquirySchema.index({ status: 1 });
EnquirySchema.index({ createdAt: -1 });

export const Enquiry: Model<IEnquiryDocument> = 
  mongoose.models.Enquiry || mongoose.model<IEnquiryDocument>('Enquiry', EnquirySchema);

export default Enquiry;