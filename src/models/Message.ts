import mongoose, { Schema, Document, Model } from 'mongoose';
import { IMessage } from '@/types';

export interface IMessageDocument extends Omit<IMessage, 'id' | '_id'>, Document {
  _id: mongoose.Types.ObjectId;
  id: string;
}

const MessageSchema = new Schema<IMessageDocument>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
      maxlength: [5000, 'Message too long'],
    },
    read: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
    enquiry: {
      type: Schema.Types.ObjectId,
      ref: 'Enquiry',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
MessageSchema.index({ sender: 1, receiver: 1 });
MessageSchema.index({ enquiry: 1 });
MessageSchema.index({ read: 1 });
MessageSchema.index({ createdAt: -1 });

// Static methods
MessageSchema.statics.getConversation = async function(user1Id: string, user2Id: string) {
  return this.find({
    $or: [
      { sender: user1Id, receiver: user2Id },
      { sender: user2Id, receiver: user1Id },
    ],
  }).sort({ createdAt: 1 });
};

MessageSchema.statics.markAsRead = async function(messageId: string) {
  return this.findByIdAndUpdate(
    messageId,
    { read: true, readAt: new Date() },
    { new: true }
  );
};

export const Message: Model<IMessageDocument> = 
  mongoose.models.Message || mongoose.model<IMessageDocument>('Message', MessageSchema);