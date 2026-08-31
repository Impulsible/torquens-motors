/* eslint-disable @typescript-eslint/no-explicit-any */
// src/models/Collection.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

// ─────────────────────────────────────────────────────────────
// INTERFACE
// ─────────────────────────────────────────────────────────────

export interface ICollectionDocument extends Document {
  name: string;
  slug: string;
  description: string;
  image?: string;
  bannerImage?: string;
  vehicles: mongoose.Types.ObjectId[];
  featured: boolean;
  published: boolean;
  order: number;
  metadata: {
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string[];
    backgroundColor?: string;
  };
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICollection extends Omit<ICollectionDocument, keyof Document> {
  id: string;
}

// ─────────────────────────────────────────────────────────────
// SCHEMA
// ─────────────────────────────────────────────────────────────

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
      maxlength: [2000, 'Description must be at most 2000 characters'],
    },
    image: {
      type: String,
      default: null,
    },
    bannerImage: {
      type: String,
      default: null,
    },
    vehicles: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Vehicle',
      },
    ],
    featured: {
      type: Boolean,
      default: false,
    },
    published: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    metadata: {
      seoTitle: { type: String, default: null },
      seoDescription: { type: String, default: null },
      seoKeywords: [{ type: String }],
      backgroundColor: { type: String, default: null },
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// ─────────────────────────────────────────────────────────────
// PRE-SAVE MIDDLEWARE
// ─────────────────────────────────────────────────────────────

CollectionSchema.pre<ICollectionDocument>('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

// ─────────────────────────────────────────────────────────────
// INDEXES
// ─────────────────────────────────────────────────────────────

CollectionSchema.index({ name: 1, slug: 1 });
CollectionSchema.index({ featured: 1, published: 1 });
CollectionSchema.index({ order: 1 });
CollectionSchema.index({ createdBy: 1 });

// ─────────────────────────────────────────────────────────────
// STATIC METHODS
// ─────────────────────────────────────────────────────────────

/**
 * Get featured collections
 */
CollectionSchema.statics.getFeatured = async function () {
  return this.find({ featured: true, published: true })
    .populate('vehicles')
    .sort({ order: 1 })
    .limit(6);
};

/**
 * Get published collections
 */
CollectionSchema.statics.getPublished = async function () {
  return this.find({ published: true })
    .populate('vehicles')
    .sort({ order: 1, createdAt: -1 });
};

/**
 * Get collection by slug
 */
CollectionSchema.statics.getBySlug = async function (slug: string) {
  return this.findOne({ slug, published: true })
    .populate('vehicles')
    .populate('createdBy', 'name email');
};

/**
 * Get collections by creator
 */
CollectionSchema.statics.getByCreator = async function (userId: string) {
  return this.find({ createdBy: userId, published: true })
    .populate('vehicles')
    .sort({ createdAt: -1 });
};

/**
 * Get collections with vehicle count
 */
CollectionSchema.statics.getWithCounts = async function () {
  return this.aggregate([
    { $match: { published: true } },
    {
      $lookup: {
        from: 'vehicles',
        localField: 'vehicles',
        foreignField: '_id',
        as: 'vehicleDetails',
      },
    },
    {
      $addFields: {
        vehicleCount: { $size: '$vehicleDetails' },
      },
    },
    {
      $project: {
        name: 1,
        slug: 1,
        description: 1,
        image: 1,
        bannerImage: 1,
        featured: 1,
        order: 1,
        vehicleCount: 1,
        createdAt: 1,
      },
    },
    { $sort: { featured: -1, order: 1, createdAt: -1 } },
  ]);
};

// ─────────────────────────────────────────────────────────────
// INSTANCE METHODS
// ─────────────────────────────────────────────────────────────

/**
 * Add a vehicle to collection
 */
CollectionSchema.methods.addVehicle = async function (vehicleId: string) {
  if (!this.vehicles.includes(vehicleId as any)) {
    this.vehicles.push(vehicleId as any);
    await this.save();
  }
  return this;
};

/**
 * Remove a vehicle from collection
 */
CollectionSchema.methods.removeVehicle = async function (vehicleId: string) {
  this.vehicles = this.vehicles.filter(
    (id: { toString: () => string; }) => id.toString() !== vehicleId
  );
  await this.save();
  return this;
};

/**
 * Check if collection contains a vehicle
 */
CollectionSchema.methods.hasVehicle = function (vehicleId: string): boolean {
  return this.vehicles.some((id: { toString: () => string; }) => id.toString() === vehicleId);
};

/**
 * Get vehicle count
 */
CollectionSchema.methods.getVehicleCount = function (): number {
  return this.vehicles.length;
};

/**
 * Toggle featured status
 */
CollectionSchema.methods.toggleFeatured = async function () {
  this.featured = !this.featured;
  await this.save();
  return this;
};

/**
 * Toggle published status
 */
CollectionSchema.methods.togglePublished = async function () {
  this.published = !this.published;
  await this.save();
  return this;
};

/**
 * Generate slug from name
 */
CollectionSchema.methods.generateSlug = function (): string {
  return this.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// ─────────────────────────────────────────────────────────────
// EXPORT MODEL
// ─────────────────────────────────────────────────────────────

export const Collection: Model<ICollectionDocument> =
  mongoose.models.Collection ||
  mongoose.model<ICollectionDocument>('Collection', CollectionSchema);

export default Collection;