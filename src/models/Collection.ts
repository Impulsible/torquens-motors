import mongoose, { Schema, Document, Model } from 'mongoose';
import { ICollection } from '@/types';

export interface ICollectionDocument extends Omit<ICollection, 'id'>, Document {
  id: string;
  generateSlug(): string;
}

const CollectionSchema = new Schema<ICollectionDocument>(
  {
    name: {
      type: String,
      required: [true, 'Collection name is required'],
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
      required: [true, 'Description is required'],
      minlength: [20, 'Description must be at least 20 characters'],
    },
    image: {
      type: String,
      default: null,
    },
    vehicles: [{
      type: Schema.Types.ObjectId,
      ref: 'Vehicle',
    }],
    featured: {
      type: Boolean,
      default: false,
    },
    published: {
      type: Boolean,
      default: true,
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
CollectionSchema.pre<ICollectionDocument>('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

// Indexes
CollectionSchema.index({ name: 1, slug: 1 });
CollectionSchema.index({ featured: 1, published: 1 });

export const Collection: Model<ICollectionDocument> = 
  mongoose.models.Collection || mongoose.model<ICollectionDocument>('Collection', CollectionSchema);