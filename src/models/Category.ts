import mongoose, { Schema, Document, Model } from 'mongoose';
import { ICategory } from '@/types';

export interface ICategoryDocument extends Omit<ICategory, 'id'>, Document {
  generateSlug(): string;
}

const CategorySchema = new Schema<ICategoryDocument>(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      default: null,
    },
    image: {
      type: String,
      default: null,
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to generate slug
CategorySchema.pre<ICategoryDocument>('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

// Indexes
CategorySchema.index({ name: 1, slug: 1 });
CategorySchema.index({ parent: 1 });

export const Category: Model<ICategoryDocument> = 
  mongoose.models.Category || mongoose.model<ICategoryDocument>('Category', CategorySchema);