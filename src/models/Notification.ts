import mongoose, { Schema, Document, Model } from 'mongoose';
import { INotification } from '@/types';

export interface INotificationDocument extends Omit<INotification, 'id'>, Document {
  _id: string;
  priority?: 'low' | 'medium' | 'high';
}

const NotificationSchema = new Schema<INotificationDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    type: {
      type: String,
      enum: ['ENQUIRY', 'MESSAGE', 'PRICE_CHANGE', 'VERIFICATION', 'RESERVATION', 'SYSTEM', 'DEALER_UPDATE'],
      required: [true, 'Notification type is required'],
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      maxlength: [500, 'Message cannot exceed 500 characters'],
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
    data: {
      type: Schema.Types.Mixed,
      default: {},
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
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
    toObject: {
      transform: function(_, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ✅ Indexes for performance
NotificationSchema.index({ user: 1, createdAt: -1 });
NotificationSchema.index({ user: 1, read: 1 });
NotificationSchema.index({ type: 1 });
NotificationSchema.index({ createdAt: -1 });

// ✅ Static methods
NotificationSchema.statics.getUnreadCount = async function(userId: string) {
  return this.countDocuments({ user: userId, read: false });
};

NotificationSchema.statics.markAllAsRead = async function(userId: string) {
  return this.updateMany(
    { user: userId, read: false },
    { read: true, readAt: new Date() }
  );
};

NotificationSchema.statics.getRecent = async function(userId: string, limit: number = 10) {
  return this.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};

NotificationSchema.statics.getByType = async function(userId: string, type: string) {
  return this.find({ user: userId, type })
    .sort({ createdAt: -1 })
    .lean();
};

NotificationSchema.statics.getUnreadByType = async function(userId: string, type: string) {
  return this.find({ user: userId, type, read: false })
    .sort({ createdAt: -1 })
    .lean();
};

// ✅ Fix: Safe model creation with try-catch
let Notification: Model<INotificationDocument>;

try {
  // Try to get existing model
  Notification = mongoose.model<INotificationDocument>('Notification');
} catch {
  // If it doesn't exist, create it
  Notification = mongoose.model<INotificationDocument>('Notification', NotificationSchema);
}

// Alternative: Using the cached models pattern
// const Notification = mongoose.models.Notification as Model<INotificationDocument> || 
//   mongoose.model<INotificationDocument>('Notification', NotificationSchema);

export { Notification };
export default Notification;