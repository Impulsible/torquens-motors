import mongoose, { Schema, Document, Model } from 'mongoose';
import { IDealer } from '@/types';

export interface IDealerDocument extends Omit<IDealer, 'id' | 'owner'>, Document {
  _id: string;
  owner: mongoose.Types.ObjectId;
}

const DealerSchema = new Schema<IDealerDocument>(
  {
    name: {
      type: String,
      required: [true, 'Dealer name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name must be at most 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [20, 'Description must be at least 20 characters'],
      maxlength: [2000, 'Description must be at most 2000 characters'],
    },
    logo: {
      type: String,
      default: null,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [/^\+?[\d\s-]{10,}$/, 'Please enter a valid phone number'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
    },
    verified: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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
DealerSchema.index({ email: 1 });
DealerSchema.index({ owner: 1 });
DealerSchema.index({ verified: 1 });

export const Dealer: Model<IDealerDocument> = 
  mongoose.models.Dealer || mongoose.model<IDealerDocument>('Dealer', DealerSchema);

export default Dealer;