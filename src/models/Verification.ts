/* eslint-disable @typescript-eslint/no-explicit-any */
// src/models/Verification.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

// ─────────────────────────────────────────────────────────────
// INTERFACES
// ─────────────────────────────────────────────────────────────

export interface IVerificationDocument extends Document {
  vehicle: mongoose.Types.ObjectId;
  dealer?: mongoose.Types.ObjectId;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVIEWING';
  documents: {
    type: string;
    url: string;
    uploadedAt: Date;
    verified: boolean;
    notes?: string;
  }[];
  notes?: string;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  expiresAt?: Date;
  verificationChecklist: {
    item: string;
    passed: boolean;
    notes?: string;
  }[];
  metadata: {
    vinChecked?: boolean;
    titleChecked?: boolean;
    customsChecked?: boolean;
    inspectionPassed?: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IVerification extends Omit<IVerificationDocument, keyof Document> {
  id: string;
}

// ─────────────────────────────────────────────────────────────
// SCHEMA
// ─────────────────────────────────────────────────────────────

const VerificationSchema = new Schema<IVerificationDocument>(
  {
    vehicle: {
      type: Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },
    dealer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'REVIEWING'],
      default: 'PENDING',
    },
    documents: [
      {
        type: {
          type: String,
          required: true,
          enum: [
            'PROOF_OF_OWNERSHIP',
            'VEHICLE_REGISTRATION',
            'CUSTOMS_CLEARANCE',
            'INSURANCE',
            'SERVICE_HISTORY',
            'INSPECTION_REPORT',
            'OTHER',
          ],
        },
        url: {
          type: String,
          required: true,
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
        verified: {
          type: Boolean,
          default: false,
        },
        notes: {
          type: String,
          default: null,
        },
      },
    ],
    notes: {
      type: String,
      default: null,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    verificationChecklist: [
      {
        item: {
          type: String,
          required: true,
        },
        passed: {
          type: Boolean,
          default: false,
        },
        notes: {
          type: String,
          default: null,
        },
      },
    ],
    metadata: {
      vinChecked: {
        type: Boolean,
        default: false,
      },
      titleChecked: {
        type: Boolean,
        default: false,
      },
      customsChecked: {
        type: Boolean,
        default: false,
      },
      inspectionPassed: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

// ─────────────────────────────────────────────────────────────
// INDEXES
// ─────────────────────────────────────────────────────────────

VerificationSchema.index({ vehicle: 1 });
VerificationSchema.index({ status: 1 });
VerificationSchema.index({ createdAt: -1 });
VerificationSchema.index({ 'metadata.vinChecked': 1 });
VerificationSchema.index({ expiresAt: 1 });

// ─────────────────────────────────────────────────────────────
// STATIC METHODS
// ─────────────────────────────────────────────────────────────

VerificationSchema.statics.getPending = async function () {
  return this.find({ status: 'PENDING' })
    .populate('vehicle')
    .populate('dealer')
    .sort({ createdAt: 1 });
};

VerificationSchema.statics.getByVehicle = async function (vehicleId: string) {
  return this.findOne({ vehicle: vehicleId })
    .populate('vehicle')
    .populate('dealer')
    .populate('reviewedBy');
};

VerificationSchema.statics.getStats = async function () {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const result = {
    pending: 0,
    approved: 0,
    rejected: 0,
    reviewing: 0,
  };

  stats.forEach((stat: any) => {
    const key = stat._id.toLowerCase();
    if (key in result) {
      (result as any)[key] = stat.count;
    }
  });

  return result;
};

VerificationSchema.statics.getPendingCount = async function (): Promise<number> {
  return this.countDocuments({ status: 'PENDING' });
};

VerificationSchema.statics.getByDealer = async function (dealerId: string) {
  return this.find({ dealer: dealerId })
    .populate('vehicle')
    .sort({ createdAt: -1 });
};

VerificationSchema.statics.getExpired = async function () {
  return this.find({
    expiresAt: { $lt: new Date() },
    status: { $ne: 'REJECTED' },
  });
};

// ─────────────────────────────────────────────────────────────
// INSTANCE METHODS
// ─────────────────────────────────────────────────────────────

VerificationSchema.methods.markAsReviewed = async function (reviewerId: string, notes?: string) {
  this.status = this.status === 'PENDING' ? 'REVIEWING' : this.status;
  this.reviewedBy = reviewerId;
  this.reviewedAt = new Date();
  if (notes) {
    this.notes = notes;
  }
  return this.save();
};

VerificationSchema.methods.approve = async function (reviewerId: string, notes?: string) {
  this.status = 'APPROVED';
  this.reviewedBy = reviewerId;
  this.reviewedAt = new Date();
  if (notes) {
    this.notes = notes;
  }
  // Set expiration to 1 year from now
  const expiryDate = new Date();
  expiryDate.setFullYear(expiryDate.getFullYear() + 1);
  this.expiresAt = expiryDate;
  return this.save();
};

VerificationSchema.methods.reject = async function (reviewerId: string, notes?: string) {
  this.status = 'REJECTED';
  this.reviewedBy = reviewerId;
  this.reviewedAt = new Date();
  if (notes) {
    this.notes = notes;
  }
  return this.save();
};

VerificationSchema.methods.addDocument = async function (docData: {
  type: string;
  url: string;
  notes?: string;
}) {
  this.documents.push({
    ...docData,
    uploadedAt: new Date(),
    verified: false,
  });
  return this.save();
};

VerificationSchema.methods.verifyDocument = async function (documentIndex: number, verified: boolean) {
  if (this.documents[documentIndex]) {
    this.documents[documentIndex].verified = verified;
    return this.save();
  }
  throw new Error('Document not found');
};

VerificationSchema.methods.updateChecklist = async function (
  item: string,
  passed: boolean,
  notes?: string
) {
  const existing = this.verificationChecklist.find((c: any) => c.item === item);
  if (existing) {
    existing.passed = passed;
    if (notes) {
      existing.notes = notes;
    }
  } else {
    this.verificationChecklist.push({ item, passed, notes });
  }
  return this.save();
};

// ─────────────────────────────────────────────────────────────
// EXPORT MODEL
// ─────────────────────────────────────────────────────────────

export const Verification: Model<IVerificationDocument> =
  mongoose.models.Verification ||
  mongoose.model<IVerificationDocument>('Verification', VerificationSchema);

export default Verification;