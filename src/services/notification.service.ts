/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { Notification, INotificationDocument } from '@/models/Notification';
import { 
  findOne,
  findById,
  findMany,
  paginate,
  create,
  update,
  deleteOne,
  deleteMany,
  countDocuments,
  updateMany,
} from './database';

export interface CreateNotificationData {
  user: string;
  type: 'ENQUIRY' | 'MESSAGE' | 'PRICE_CHANGE' | 'VERIFICATION' | 'RESERVATION' | 'SYSTEM' | 'DEALER_UPDATE';
  title: string;
  message: string;
  data?: Record<string, any>;
  priority?: 'low' | 'medium' | 'high';
}

// ✅ Individual exported async functions
export async function createNotification(data: CreateNotificationData): Promise<INotificationDocument> {
  const notification = await create(Notification as any, {
    ...data,
    read: false,
    readAt: null,
    priority: data.priority || 'medium',
  });

  return notification as unknown as INotificationDocument;
}

export async function createBulkNotifications(
  userIds: string[],
  data: Omit<CreateNotificationData, 'user'>
): Promise<INotificationDocument[]> {
  const notifications = await Promise.all(
    userIds.map(userId => 
      createNotification({ ...data, user: userId })
    )
  );

  return notifications;
}

export async function getUserNotifications(
  userId: string,
  page: number = 1,
  limit: number = 20,
  filters?: { read?: boolean; type?: string }
) {
  const query: any = { user: userId };
  
  if (filters?.read !== undefined) {
    query.read = filters.read;
  }
  
  if (filters?.type) {
    query.type = filters.type;
  }

  const result = await paginate<INotificationDocument>(
    Notification as any,
    query,
    { page, limit, sort: { createdAt: -1 } }
  );

  return result;
}

export async function getUnreadCount(userId: string): Promise<number> {
  return await countDocuments(Notification as any, { user: userId, read: false });
}

export async function markAsRead(notificationId: string): Promise<INotificationDocument | null> {
  const notification = await update(
    Notification as any,
    { _id: notificationId },
    { read: true, readAt: new Date() },
    { new: true, lean: true }
  );

  return notification as INotificationDocument | null;
}

export async function markAllAsRead(userId: string): Promise<number> {
  const result = await updateMany(
    Notification as any,
    { user: userId, read: false },
    { read: true, readAt: new Date() }
  );
  return result.modifiedCount || 0;
}

export async function deleteNotification(notificationId: string): Promise<boolean> {
  const result = await deleteOne(Notification as any, { _id: notificationId });
  return !!result;
}

export async function deleteAllNotifications(userId: string): Promise<number> {
  const result = await deleteMany(Notification as any, { user: userId });
  return result.deletedCount || 0;
}

export async function createEnquiryNotification(
  userId: string,
  enquiryId: string,
  vehicleName: string,
  dealerName: string
): Promise<INotificationDocument> {
  return createNotification({
    user: userId,
    type: 'ENQUIRY',
    title: 'Enquiry Received',
    message: `Your enquiry about ${vehicleName} has been sent to ${dealerName}.`,
    data: {
      enquiryId,
      vehicleName,
      dealerName,
      url: `/dashboard/enquiries/${enquiryId}`,
    },
    priority: 'medium',
  });
}

export async function createDealerEnquiryNotification(
  dealerId: string,
  enquiryId: string,
  customerName: string,
  vehicleName: string
): Promise<INotificationDocument> {
  return createNotification({
    user: dealerId,
    type: 'DEALER_UPDATE',
    title: 'New Enquiry Received',
    message: `${customerName} has enquired about ${vehicleName}.`,
    data: {
      enquiryId,
      customerName,
      vehicleName,
      url: `/dealer/enquiries/${enquiryId}`,
    },
    priority: 'high',
  });
}

export async function createPriceChangeNotification(
  userId: string,
  vehicleId: string,
  vehicleName: string,
  oldPrice: number,
  newPrice: number
): Promise<INotificationDocument> {
  return createNotification({
    user: userId,
    type: 'PRICE_CHANGE',
    title: 'Price Updated',
    message: `The price of ${vehicleName} has changed from ${oldPrice.toLocaleString()} to ${newPrice.toLocaleString()}.`,
    data: {
      vehicleId,
      vehicleName,
      oldPrice,
      newPrice,
      url: `/vehicles/${vehicleId}`,
    },
    priority: 'medium',
  });
}

export async function createVerificationNotification(
  userId: string,
  vehicleId: string,
  vehicleName: string,
  status: 'approved' | 'rejected'
): Promise<INotificationDocument> {
  const title = status === 'approved' ? 'Vehicle Verified' : 'Vehicle Verification Failed';
  const message = status === 'approved' 
    ? `Your vehicle ${vehicleName} has been verified and is now live.`
    : `Your vehicle ${vehicleName} did not pass verification. Please review the feedback.`;

  return createNotification({
    user: userId,
    type: 'VERIFICATION',
    title,
    message,
    data: {
      vehicleId,
      vehicleName,
      status,
      url: `/dealer/inventory`,
    },
    priority: status === 'approved' ? 'medium' : 'high',
  });
}

export async function createMessageNotification(
  userId: string,
  messageId: string,
  senderName: string,
  preview: string
): Promise<INotificationDocument> {
  return createNotification({
    user: userId,
    type: 'MESSAGE',
    title: `New Message from ${senderName}`,
    message: preview,
    data: {
      messageId,
      senderName,
      url: `/dashboard/messages`,
    },
    priority: 'high',
  });
}

export async function createSystemNotification(
  userId: string,
  title: string,
  message: string,
  data?: Record<string, any>
): Promise<INotificationDocument> {
  return createNotification({
    user: userId,
    type: 'SYSTEM',
    title,
    message,
    data,
    priority: 'low',
  });
}