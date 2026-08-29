import mongoose, { Schema, Document, Model } from 'mongoose';
import { IReview } from '@/types';

export interface IReviewDocument extends Omit<IReview, 'id'>, Document {}

const ReviewSchema = new Schema<IReviewDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    dealer: {
      type: Schema.Types.ObjectId,
      ref: 'Dealer',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating must be at most 5'],
    },
    title: {
      type: String,
      required: [true, 'Review title is required'],
      trim: true,
      maxlength: [100, 'Title too long'],
    },
    content: {
      type: String,
      required: [true, 'Review content is required'],
      minlength: [10, 'Content must be at least 10 characters'],
      maxlength: [2000, 'Content too long'],
    },
    verified: {
      type: Boolean,
      default: false,
    },
    helpfulCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index to prevent duplicate reviews
ReviewSchema.index({ user: 1, dealer: 1 }, { unique: true });

// Indexes
ReviewSchema.index({ dealer: 1, rating: -1 });
ReviewSchema.index({ createdAt: -1 });
ReviewSchema.index({ verified: 1 });

// Static methods
ReviewSchema.statics.getAverageRating = async function(dealerId: string) {
  const result = await this.aggregate([
    { $match: { dealer: dealerId } },
    { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  return result[0] || { avgRating: 0, count: 0 };
};

export const Review: Model<IReviewDocument> = 
  mongoose.models.Review || mongoose.model<IReviewDocument>('Review', ReviewSchema);