'use server';

import { getServerSession } from 'next-auth';
import { authConfig } from '@/auth/config';
import { 
  getUserNotifications as getNotifications,
  getUnreadCount as getUnread,
  markAsRead,
  markAllAsRead,
  deleteNotification as deleteNotificationService, // ✅ Rename import
} from '@/services/notification.service';
import { revalidatePath } from 'next/cache';

export interface ActionResponse<T = undefined> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export async function getUnreadNotificationCount(): Promise<number> {
  try {
    const session = await getServerSession(authConfig);
    const userId = session?.user?.id || session?.user?.email;
    if (!userId) return 0;
    return await getUnread(userId);
  } catch (error) {
    console.error('[NotificationActions] getUnreadNotificationCount error:', error);
    return 0;
  }
}

export async function getUserNotifications(
  page: number = 1,
  limit: number = 20,
  filterType?: string
): Promise<ActionResponse<unknown[]>> {
  try {
    const session = await getServerSession(authConfig);
    const userId = session?.user?.id || session?.user?.email;
    if (!userId) {
      return { success: false, message: 'Unauthenticated session.', data: [] };
    }

    const result = await getNotifications(
      userId,
      page,
      limit,
      { type: filterType === 'ALL' ? undefined : filterType }
    );

    return {
      success: true,
      message: 'Notifications retrieved successfully.',
      data: result.data || [],
      pagination: result.pagination,
    };
  } catch (error) {
    console.error('[NotificationActions] getUserNotifications error:', error);
    return { success: false, message: 'Failed to retrieve notifications.', data: [] };
  }
}

export async function markNotificationAsRead(notificationId: string): Promise<ActionResponse> {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user) {
      return { success: false, message: 'Unauthenticated session.' };
    }

    await markAsRead(notificationId);
    return { success: true, message: 'Notification marked as read.' };
  } catch (error) {
    console.error('[NotificationActions] markNotificationAsRead error:', error);
    return { success: false, message: 'Failed to mark notification as read.' };
  }
}

export async function markAllNotificationsAsRead(): Promise<ActionResponse> {
  try {
    const session = await getServerSession(authConfig);
    const userId = session?.user?.id || session?.user?.email;
    if (!userId) {
      return { success: false, message: 'Unauthenticated session.' };
    }

    await markAllAsRead(userId);
    revalidatePath('/dashboard/notifications');
    revalidatePath('/dealer/notifications');

    return { success: true, message: 'All notifications marked as read.' };
  } catch (error) {
    console.error('[NotificationActions] markAllNotificationsAsRead error:', error);
    return { success: false, message: 'Failed to update notifications.' };
  }
}

export async function deleteNotification(notificationId: string): Promise<ActionResponse> {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user) {
      return { success: false, message: 'Unauthenticated session.' };
    }

    // ✅ Use the renamed import
    await deleteNotificationService(notificationId);
    revalidatePath('/dashboard/notifications');
    revalidatePath('/dealer/notifications');

    return { success: true, message: 'Notification deleted successfully.' };
  } catch (error) {
    console.error('[NotificationActions] deleteNotification error:', error);
    return { success: false, message: 'Failed to delete notification.' };
  }
}