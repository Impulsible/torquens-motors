import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IConversationDocument extends Document {
  _id: string;
  participants: string[];
  lastMessage: mongoose.Types.ObjectId | string;
  lastMessageAt: Date;
  unreadCount: {
    userId: string;
    count: number;
  }[];
  metadata: {
    enquiryId?: string;
    vehicleId?: string;
    isSystemConversation?: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversationDocument>(
  {
    participants: {
      type: [String],
      required: true,
      index: true,
    },
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    unreadCount: {
      type: [{
        userId: { type: String, required: true },
        count: { type: Number, default: 0 },
      }],
      default: [],
    },
    metadata: {
      type: {
        enquiryId: String,
        vehicleId: String,
        isSystemConversation: Boolean,
      },
      default: {},
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

// Indexes
ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ lastMessageAt: -1 });

// ✅ Safe model creation
let Conversation: Model<IConversationDocument>;

try {
  Conversation = mongoose.model<IConversationDocument>('Conversation');
} catch {
  Conversation = mongoose.model<IConversationDocument>('Conversation', ConversationSchema);
}

export { Conversation };
export default Conversation;