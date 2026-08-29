import mongoose, { Schema, Document, Model } from 'mongoose';
import { IComparison } from '@/types';

export type IComparisonDocument = IComparison & Document;

const ComparisonSchema = new Schema<IComparisonDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    vehicles: [{
      type: Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    }],
    name: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure at least 2 vehicles in comparison
ComparisonSchema.pre('save', function(next) {
  if (this.vehicles.length < 2) {
    next(new Error('At least 2 vehicles are required for comparison'));
  }
  next();
});

// Indexes
ComparisonSchema.index({ user: 1 });
ComparisonSchema.index({ createdAt: -1 });

export const Comparison: Model<IComparisonDocument> = 
  mongoose.models.Comparison || mongoose.model<IComparisonDocument>('Comparison', ComparisonSchema);