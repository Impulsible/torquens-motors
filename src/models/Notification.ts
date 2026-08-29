import mongoose, { Schema, Document, Model } from 'mongoose';
import { INotification } from '@/types';

export interface INotificationDocument extends Omit<INotification, 'id'>, Document {}

const NotificationSchema = new Schema<INotificationDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['ENQUIRY', 'MESSAGE', 'PRICE_CHANGE', 'VERIFICATION', 'RESERVATION', 'SYSTEM'],
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
    },
    read: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
    data: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
NotificationSchema.index({ user: 1, read: 1 });
NotificationSchema.index({ createdAt: -1 });
NotificationSchema.index({ type: 1 });

// Static methods
NotificationSchema.statics.getUnreadCount = async function(userId: string) {
  return this.countDocuments({ user: userId, read: false });
};

NotificationSchema.statics.markAllAsRead = async function(userId: string) {
  return this.updateMany(
    { user: userId, read: false },
    { read: true, readAt: new Date() }
  );
};

export const Notification: Model<INotificationDocument> = 
  mongoose.models.Notification || mongoose.model<INotificationDocument>('Notification', NotificationSchema);