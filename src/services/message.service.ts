/* eslint-disable @typescript-eslint/no-explicit-any */
import Message from '@/models/Message';
import Conversation from '@/models/Conversation';
import type { IMessageDocument } from '@/models/Message';
import type { IConversationDocument } from '@/models/Conversation';
import { 
  findOne,
  findById,
  findMany,
  paginate,
  create,
  update,
} from './database';

export interface SendMessageData {
  senderId: string;
  receiverId: string;
  content: string;
  attachments?: {
    filename: string;
    url: string;
    size: number;
    mimeType: string;
  }[];
  metadata?: {
    enquiryId?: string;
    vehicleId?: string;
    isSystemMessage?: boolean;
  };
}

export class MessageService {
  /**
   * Send a new message
   */
  static async sendMessage(data: SendMessageData): Promise<{
    message: IMessageDocument;
    conversation: IConversationDocument;
  }> {
    // Get or create conversation
    let conversation = await findOne(Conversation as any, {
      participants: { $all: [data.senderId, data.receiverId] },
    });

    if (!conversation) {
      conversation = await create(Conversation as any, {
        participants: [data.senderId, data.receiverId],
        unreadCount: [
          { userId: data.senderId, count: 0 },
          { userId: data.receiverId, count: 0 },
        ],
        metadata: data.metadata || {},
      });
    }

    // Create message - ✅ Return as any to avoid type conflicts
    const message = await create(Message as any, {
      conversation: (conversation as any)._id,
      sender: data.senderId,
      receiver: data.receiverId,
      content: data.content,
      attachments: data.attachments || [],
      metadata: data.metadata || {},
      read: false,
      readAt: null,
      deletedBy: [],
    }) as any;

    // Update conversation
    const updatedConversation = await update(
      Conversation as any,
      { _id: (conversation as any)._id },
      {
        lastMessage: (message as any)._id,
        lastMessageAt: new Date(),
        $inc: { 'unreadCount.$[elem].count': 1 },
      },
      {
        arrayFilters: [{ 'elem.userId': data.receiverId }],
        new: true,
      }
    );

    // Update sender's unread count to 0
    await update(
      Conversation as any,
      { _id: (conversation as any)._id },
      { $set: { 'unreadCount.$[elem].count': 0 } },
      {
        arrayFilters: [{ 'elem.userId': data.senderId }],
        new: true,
      }
    );

    return {
      message: message as IMessageDocument,
      conversation: updatedConversation as IConversationDocument,
    };
  }

  /**
   * Get messages for a conversation
   */
  static async getConversationMessages(
    conversationId: string,
    page: number = 1,
    limit: number = 50
  ) {
    const result = await paginate(
      Message as any,
      { conversation: conversationId },
      { page, limit, sort: { createdAt: -1 } }
    );

    return result;
  }

  /**
   * Get user conversations
   */
  static async getUserConversations(
    userId: string,
    page: number = 1,
    limit: number = 20
  ) {
    const skip = (page - 1) * limit;
    
    const [data, total] = await Promise.all([
      findMany(
        Conversation as any,
        { participants: userId },
        {},
        { 
          lean: true,
          sort: { lastMessageAt: -1 },
          skip,
          limit,
          populate: 'lastMessage',
        }
      ),
      (Conversation as any).countDocuments({ participants: userId }),
    ]);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Mark messages as read
   */
  static async markConversationAsRead(
    conversationId: string,
    userId: string
  ): Promise<void> {
    // Mark individual messages as read using the static method
    await (Message as any).markConversationAsRead(conversationId, userId);

    // Reset unread count
    await update(
      Conversation as any,
      { _id: conversationId },
      { $set: { 'unreadCount.$[elem].count': 0 } },
      {
        arrayFilters: [{ 'elem.userId': userId }],
        new: true,
      }
    );
  }

  /**
   * Get unread message count for a user
   */
  static async getUnreadCount(userId: string): Promise<number> {
    return (Message as any).getUnreadCount(userId);
  }

  /**
   * Delete a message
   */
  static async deleteMessage(messageId: string, userId: string): Promise<boolean> {
    const message = await findById(Message as any, messageId);
    if (!message) return false;

    // Add user to deletedBy array
    const deletedBy = (message as any).deletedBy || [];
    if (!deletedBy.includes(userId)) {
      await update(
        Message as any,
        { _id: messageId },
        { $push: { deletedBy: userId } }
      );
    }

    return true;
  }

  /**
   * Get conversation by participants
   */
  static async getConversationByParticipants(
    userId1: string,
    userId2: string
  ): Promise<IConversationDocument | null> {
    const conversation = await findOne(Conversation as any, {
      participants: { $all: [userId1, userId2] },
    });
    return conversation as IConversationDocument | null;
  }

  /**
   * Create system message
   */
  static async sendSystemMessage(
    userId: string,
    content: string,
    metadata?: any
  ): Promise<IMessageDocument> {
    const message = await create(Message as any, {
      sender: 'system',
      receiver: userId,
      content,
      metadata: {
        ...metadata,
        isSystemMessage: true,
      },
      read: false,
      readAt: null,
      deletedBy: [],
    }) as any;

    return message as IMessageDocument;
  }

  /**
   * Get conversation statistics
   */
  static async getConversationStats(userId: string): Promise<{
    totalConversations: number;
    unreadCount: number;
    lastMessage: IMessageDocument | null;
  }> {
    const [totalConversations, unreadCount, lastMessage] = await Promise.all([
      (Conversation as any).countDocuments({ participants: userId }),
      (Message as any).getUnreadCount(userId),
      (Message as any).findOne({
        $or: [{ sender: userId }, { receiver: userId }],
        deletedBy: { $ne: userId },
      })
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    return {
      totalConversations,
      unreadCount,
      lastMessage: lastMessage as IMessageDocument | null,
    };
  }
}

export default MessageService;