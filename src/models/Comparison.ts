import mongoose, { Schema, Document, Model } from 'mongoose';
import { IComparison } from '@/types';

export interface IComparisonDocument extends Omit<IComparison, 'id'>, Document {
  // Add any additional methods here if needed
}

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

// ✅ Fix: Safe model creation
let Comparison: Model<IComparisonDocument>;

try {
  // Try to get existing model
  Comparison = mongoose.model<IComparisonDocument>('Comparison');
} catch {
  // If it doesn't exist, create it
  Comparison = mongoose.model<IComparisonDocument>('Comparison', ComparisonSchema);
}

export { Comparison };
export default Comparison;