import { Schema, model, models, Document, Model } from 'mongoose';

export interface ISearchLog extends Document {
  query: string;
  normalizedQuery: string;
  resultsCount: number;
  filters?: Record<string, unknown>;
  userId?: Schema.Types.ObjectId | string;
  sessionId: string;
  ipAddress?: string;
  userAgent?: string;
  executionTimeMs?: number;
  createdAt: Date;
  updatedAt: Date;
}

const SearchLogSchema = new Schema<ISearchLog>(
  {
    query: {
      type: String,
      required: true,
      trim: true,
    },
    normalizedQuery: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    resultsCount: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },
    filters: {
      type: Schema.Types.Mixed,
      default: {},
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    executionTimeMs: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for high-performance aggregations and time-range queries
SearchLogSchema.index({ createdAt: -1 });
SearchLogSchema.index({ normalizedQuery: 1, createdAt: -1 });
SearchLogSchema.index({ resultsCount: 1, createdAt: -1 });
SearchLogSchema.index({ sessionId: 1, createdAt: -1 });

export const SearchLog: Model<ISearchLog> =
  models.SearchLog || model<ISearchLog>('SearchLog', SearchLogSchema);

export default SearchLog;