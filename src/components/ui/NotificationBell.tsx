'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bell,
  X,
  MessageSquare,
  AlertCircle,
  Clock,
  ShieldCheck,
  TrendingUp,
  ExternalLink,
  Loader2,
  LucideIcon,
} from 'lucide-react';

import { cn } from '@/utils/cn';
import {
  getUnreadNotificationCount,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from '@/actions/notifications';

// ─────────────────────────────────────────────────────────────
// CLIENT-SAFE TYPES (No imports from @/models or @/services)
// ─────────────────────────────────────────────────────────────
export type NotificationType =
  | 'ENQUIRY'
  | 'MESSAGE'
  | 'PRICE_CHANGE'
  | 'VERIFICATION'
  | 'RESERVATION'
  | 'SYSTEM'
  | 'DEALER_UPDATE';

export type NotificationPriority = 'low' | 'medium' | 'high';

export interface AppNotification {
  _id: string;
  userId?: string;
  type: NotificationType;
  title: string;
  message: string;
  priority?: NotificationPriority;
  read: boolean;
  readAt?: string | Date | null;
  createdAt: string | Date;
  data?: {
    url?: string;
    vehicleId?: string;
    enquiryId?: string;
    [key: string]: unknown;
  };
}

export interface NotificationBellProps {
  userId?: string | null;
  className?: string;
}

const TYPE_CONFIGS: Record<NotificationType, { icon: LucideIcon; color: string; bg: string }> = {
  ENQUIRY: {
    icon: MessageSquare,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
  },
  MESSAGE: {
    icon: MessageSquare,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
  },
  PRICE_CHANGE: {
    icon: TrendingUp,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10 border-yellow-500/20',
  },
  VERIFICATION: {
    icon: ShieldCheck,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
  },
  RESERVATION: {
    icon: Clock,
    color: 'text-gold',
    bg: 'bg-gold/10 border-gold/20',
  },
  SYSTEM: {
    icon: Bell,
    color: 'text-secondary',
    bg: 'bg-graphite border-border/80',
  },
  DEALER_UPDATE: {
    icon: AlertCircle,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10 border-orange-500/20',
  },
};

export function NotificationBell({ userId, className }: NotificationBellProps) {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // ─────────────────────────────────────────────────────────────
  // SECURE FETCH HANDLER VIA SERVER ACTIONS
  // ─────────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    try {
      const [count, res] = await Promise.all([
        getUnreadNotificationCount(),
        getUserNotifications(1, 15),
      ]);

      setUnreadCount(count || 0);
      if (res?.success && Array.isArray(res.data)) {
        setNotifications(res.data as unknown as AppNotification[]);
      }
    } catch (error) {
      console.error('[NotificationBell] Fetch error:', error);
    }
  }, []);

  // Poll for updates safely
  useEffect(() => {
    let isMounted = true;

    const executeInitialFetch = async () => {
      try {
        const [count, res] = await Promise.all([
          getUnreadNotificationCount(),
          getUserNotifications(1, 15),
        ]);

        if (isMounted) {
          setUnreadCount(count || 0);
          if (res?.success && Array.isArray(res.data)) {
            setNotifications(res.data as unknown as AppNotification[]);
          }
        }
      } catch (error) {
        console.error('[NotificationBell] Initial fetch error:', error);
      }
    };

    executeInitialFetch();

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        executeInitialFetch();
      }
    }, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [userId]);

  // Click Outside & Escape Key Listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // ─────────────────────────────────────────────────────────────
  // ACTION HANDLERS
  // ─────────────────────────────────────────────────────────────
  const handleMarkAsRead = async (notificationId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();

    setNotifications((prev) =>
      prev.map((n) => (n._id === notificationId ? { ...n, read: true, readAt: new Date() } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await markNotificationAsRead(notificationId);
    } catch (error) {
      console.error('[NotificationBell] Mark as read failed:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    setMarkingAll(true);
    const previousNotifications = [...notifications];
    const previousUnread = unreadCount;

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true, readAt: new Date() })));
    setUnreadCount(0);

    try {
      await markAllNotificationsAsRead();
    } catch (error) {
      console.error('[NotificationBell] Mark all read failed:', error);
      setNotifications(previousNotifications);
      setUnreadCount(previousUnread);
    } finally {
      setMarkingAll(false);
    }
  };

  const handleDelete = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    const target = notifications.find((n) => n._id === notificationId);
    setNotifications((prev) => prev.filter((n) => n._id !== notificationId));

    if (target && !target.read) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    try {
      await deleteNotification(notificationId);
    } catch (error) {
      console.error('[NotificationBell] Delete notification failed:', error);
    }
  };

  const handleItemClick = (notification: AppNotification) => {
    if (!notification.read) {
      handleMarkAsRead(notification._id);
    }
    setIsOpen(false);

    if (notification.data?.url) {
      router.push(notification.data.url);
    }
  };

  const formatDateDisplay = (dateInput: string | Date) => {
    try {
      const date = new Date(dateInput);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Recent';
    }
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            setLoading(true);
            loadData().finally(() => setLoading(false));
          }
        }}
        aria-label="View notifications and dispatches"
        aria-expanded={isOpen}
        className="relative flex items-center justify-center h-9 w-9 rounded-lg border border-border/80 bg-graphite/60 text-secondary hover:text-primary hover:border-gold/40 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/60"
      >
        <Bell className="h-4 w-4" />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75" />
            <span className="relative inline-flex items-center justify-center rounded-full h-4 w-4 bg-gold text-obsidian text-[9px] font-mono font-bold leading-none shadow-sm">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </span>
        )}
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label="Notifications popover"
          className="absolute right-0 mt-3 w-80 sm:w-96 rounded-xl bg-graphite/95 border border-border/80 shadow-[0_12px_40px_rgba(0,0,0,0.6)] backdrop-blur-2xl z-50 overflow-hidden animate-slide-up select-none"
        >
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-gold to-transparent opacity-80" />

          <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/60 bg-obsidian/40">
            <div className="flex items-center gap-2">
              <span className="text-xs font-serif font-normal text-primary tracking-wide">
                Activity & Notices
              </span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.2 rounded bg-gold/15 text-gold text-[9px] font-mono font-semibold">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  disabled={markingAll}
                  className="text-[10px] font-mono uppercase tracking-widest text-gold hover:text-gold-hover transition-colors disabled:opacity-50"
                >
                  {markingAll ? 'Clearing...' : 'Mark all read'}
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-muted hover:text-primary transition-colors p-0.5 rounded"
                aria-label="Close notifications dropdown"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto max-h-95 divide-y divide-border/40 custom-scrollbar">
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2">
                <Loader2 className="h-6 w-6 text-gold animate-spin" />
                <p className="text-[11px] font-mono text-muted uppercase tracking-wider">
                  Syncing ledger...
                </p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-12 px-4 text-center space-y-2">
                <div className="w-10 h-10 rounded-full border border-gold/20 bg-gold/5 flex items-center justify-center mx-auto text-gold">
                  <Bell className="h-4 w-4" />
                </div>
                <p className="text-xs font-serif text-primary">No Pending Dispatches</p>
                <p className="text-[11px] text-secondary font-sans max-w-xs mx-auto leading-relaxed">
                  All allocation notices and compliance records are currently up to date.
                </p>
              </div>
            ) : (
              notifications.map((notification) => {
                const config = TYPE_CONFIGS[notification.type] || TYPE_CONFIGS.SYSTEM;
                const Icon = config.icon;

                return (
                  <div
                    key={notification._id}
                    onClick={() => handleItemClick(notification)}
                    className={cn(
                      'group relative px-4 py-3.5 transition-all duration-200 cursor-pointer flex items-start gap-3',
                      'hover:bg-white/3',
                      !notification.read
                        ? 'bg-gold/2 border-l-2 border-l-gold'
                        : 'border-l-2 border-l-transparent'
                    )}
                  >
                    <div
                      className={cn(
                        'h-8 w-8 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 shadow-sm',
                        config.bg
                      )}
                    >
                      <Icon className={cn('h-3.5 w-3.5', config.color)} />
                    </div>

                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={cn(
                            'text-xs font-serif tracking-wide truncate',
                            !notification.read ? 'text-primary font-normal' : 'text-secondary'
                          )}
                        >
                          {notification.title}
                        </p>

                        <span className="text-[9px] font-mono text-muted shrink-0 tabular-nums">
                          {formatDateDisplay(notification.createdAt)}
                        </span>
                      </div>

                      <p className="text-[11px] text-secondary font-sans line-clamp-2 leading-relaxed">
                        {notification.message}
                      </p>

                      <div className="pt-1 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          {notification.priority === 'high' && (
                            <span className="px-1 py-0.2 rounded text-[7px] font-mono font-bold tracking-widest uppercase bg-red-500/15 border border-red-500/30 text-red-400">
                              Urgent
                            </span>
                          )}

                          {notification.data?.url && (
                            <span className="text-[9px] font-mono text-gold flex items-center gap-0.5 group-hover:underline">
                              <span>Inspect</span>
                              <ExternalLink size={9} />
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={(e) => handleDelete(notification._id, e)}
                          className="opacity-0 group-hover:opacity-100 p-0.5 text-muted hover:text-red-400 transition-opacity"
                          title="Dismiss notice"
                          aria-label="Dismiss notification"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-2.5 bg-obsidian/40 border-t border-border/60 text-center">
              <Link
                href="/dashboard/notifications"
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center justify-center gap-1 text-[10px] font-mono uppercase tracking-widest text-gold hover:text-gold-hover transition-colors w-full py-1"
              >
                <span>View Full Activity Ledger</span>
                <span className="text-[10px]">→</span>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}