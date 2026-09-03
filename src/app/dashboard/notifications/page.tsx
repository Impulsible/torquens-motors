'use client';
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  Bell,
  Check,
  X,
  MessageSquare,
  AlertCircle,
  Clock,
  Car,
  ShieldCheck,
  TrendingUp,
  Filter,
  Trash2,
  CheckCheck,
  Sparkles,
  ExternalLink,
  Loader2,
  RefreshCcw,
  Layers,
  LucideIcon,
  ShieldAlert,
  Info,
} from 'lucide-react';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, BadgeProps } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/utils/cn';
// ✅ Import from actions instead of service
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from '@/actions/notifications';

// ─────────────────────────────────────────────────────────────
// STRICT TYPE DEFINITIONS
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
  id?: string;
  userId: string;
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

interface TypeMeta {
  label: string;
  icon: LucideIcon;
  colorClass: string;
  bgClass: string;
}

// ─────────────────────────────────────────────────────────────
// METADATA CONFIGURATION
// ─────────────────────────────────────────────────────────────
const NOTIFICATION_METAS: Record<NotificationType, TypeMeta> = {
  ENQUIRY: {
    label: 'Inquiry Dossier',
    icon: MessageSquare,
    colorClass: 'text-blue-400',
    bgClass: 'bg-blue-500/10 border-blue-500/20',
  },
  MESSAGE: {
    label: 'Concierge Dispatch',
    icon: MessageSquare,
    colorClass: 'text-emerald-400',
    bgClass: 'bg-emerald-500/10 border-emerald-500/20',
  },
  PRICE_CHANGE: {
    label: 'Market Valuation',
    icon: TrendingUp,
    colorClass: 'text-yellow-400',
    bgClass: 'bg-yellow-500/10 border-yellow-500/20',
  },
  VERIFICATION: {
    label: 'Provenance Stamp',
    icon: ShieldCheck,
    colorClass: 'text-emerald-400',
    bgClass: 'bg-emerald-500/10 border-emerald-500/20',
  },
  RESERVATION: {
    label: 'Allocation Hold',
    icon: Clock,
    colorClass: 'text-gold',
    bgClass: 'bg-gold/10 border-gold/20',
  },
  SYSTEM: {
    label: 'System Notice',
    icon: Bell,
    colorClass: 'text-secondary',
    bgClass: 'bg-graphite border-border/80',
  },
  DEALER_UPDATE: {
    label: 'Broker Alert',
    icon: AlertCircle,
    colorClass: 'text-orange-400',
    bgClass: 'bg-orange-500/10 border-orange-500/20',
  },
};

const FILTER_TABS = [
  { value: 'ALL', label: 'All Notices' },
  { value: 'ENQUIRY', label: 'Inquiries' },
  { value: 'VERIFICATION', label: 'Verifications' },
  { value: 'PRICE_CHANGE', label: 'Market Shifts' },
  { value: 'SYSTEM', label: 'System' },
];

export default function NotificationsPage() {
  const { data: session, status: authStatus } = useSession();
  const { showToast } = useToast();

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const userId = session?.user?.id || session?.user?.email || '';

  // ─────────────────────────────────────────────────────────────
  // SECURE NOTIFICATIONS FETCH (USING SERVER ACTIONS)
  // ─────────────────────────────────────────────────────────────
  const loadNotifications = useCallback(
    async (isSilent = false) => {
      if (!userId && authStatus !== 'loading') {
        setLoading(false);
        return;
      }

      if (isSilent) setRefreshing(true);
      else setLoading(true);

      try {
        // ✅ Call the Server Action instead of the service directly
        const result = await getUserNotifications(
          page,
          20,
          filter === 'ALL' ? undefined : filter
        );

        if (result?.success && result?.data) {
          setNotifications(result.data as unknown as AppNotification[]);
          setTotal(result.pagination?.total || result.data.length);
          setTotalPages(result.pagination?.totalPages || 1);
        } else {
          // Handle error case
          setNotifications([]);
          setTotal(0);
          setTotalPages(1);
        }
      } catch (error) {
        console.error('[NotificationsPage] Error loading notifications:', error);
        showToast({
          type: 'error',
          title: 'Sync Failed',
          message: 'Unable to retrieve your notices from the secure ledger.',
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [userId, authStatus, page, filter, showToast]
  );

  useEffect(() => {
    if (authStatus === 'authenticated') {
      loadNotifications();
    }
  }, [authStatus, loadNotifications]);

  // ─────────────────────────────────────────────────────────────
  // READ STATUS MUTATIONS
  // ─────────────────────────────────────────────────────────────
  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const previous = [...notifications];

    // Optimistic read status
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true, readAt: new Date() } : n))
    );

    try {
      // ✅ Call the Server Action
      await markNotificationAsRead(id);
    } catch (error) {
      console.error('[NotificationsPage] Mark as read failed:', error);
      setNotifications(previous);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!userId) return;
    const previous = [...notifications];

    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true, readAt: new Date() }))
    );

    try {
      // ✅ Call the Server Action
      await markAllNotificationsAsRead();
      showToast({
        type: 'success',
        title: 'All Notices Read',
        message: 'All incoming notices marked as reviewed.',
      });
    } catch (error) {
      console.error('[NotificationsPage] Mark all as read failed:', error);
      setNotifications(previous);
      showToast({
        type: 'error',
        title: 'Action Failed',
        message: 'Could not update read receipts on server.',
      });
    }
  };

  // ─────────────────────────────────────────────────────────────
  // DELETION PROTOCOLS
  // ─────────────────────────────────────────────────────────────
  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setDeletingId(id);
    const previous = [...notifications];

    setNotifications((prev) => prev.filter((n) => n._id !== id));
    setSelectedIds((prev) => prev.filter((item) => item !== id));

    try {
      // ✅ Call the Server Action
      await deleteNotification(id);
      showToast({
        type: 'success',
        title: 'Notice Dismissed',
        message: 'The notification has been archived.',
      });
    } catch (error) {
      console.error('[NotificationsPage] Delete failed:', error);
      setNotifications(previous);
      showToast({
        type: 'error',
        title: 'Dismissal Failed',
        message: 'Could not remove notice from database.',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const previous = [...notifications];
    const targets = [...selectedIds];

    setNotifications((prev) => prev.filter((n) => !targets.includes(n._id)));
    setSelectedIds([]);

    try {
      // ✅ Call the Server Action for each
      await Promise.all(targets.map((id) => deleteNotification(id)));
      showToast({
        type: 'success',
        title: 'Notices Dismissed',
        message: `${targets.length} notifications removed from ledger.`,
      });
    } catch (error) {
      console.error('[NotificationsPage] Bulk delete failed:', error);
      setNotifications(previous);
      showToast({
        type: 'error',
        title: 'Action Incomplete',
        message: 'Could not delete all selected notices.',
      });
    }
  };

  const handleSelectAllToggle = () => {
    if (selectedIds.length === notifications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(notifications.map((n) => n._id));
    }
  };

  // ─────────────────────────────────────────────────────────────
  // DATE FORMATTER UTILITY
  // ─────────────────────────────────────────────────────────────
  const getTimeAgo = (dateInput: string | Date) => {
    try {
      const date = new Date(dateInput);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (minutes < 1) return 'Just now';
      if (minutes < 60) return `${minutes}m ago`;
      if (hours < 24) return `${hours}h ago`;
      if (days < 7) return `${days}d ago`;
      return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
      });
    } catch {
      return 'Recently';
    }
  };

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  // ─────────────────────────────────────────────────────────────
  // LOADING SKELETON
  // ─────────────────────────────────────────────────────────────
  if (loading && page === 1) {
    return (
      <div className="space-y-8 animate-fade-in max-w-5xl mx-auto pb-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-border/40">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 bg-graphite/60" />
            <Skeleton className="h-8 w-64 bg-graphite/80" />
          </div>
          <Skeleton className="h-10 w-36 bg-graphite/60" />
        </div>

        <div className="flex gap-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-lg bg-graphite/50" />
          ))}
        </div>

        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl bg-graphite/50" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto pb-20">
      {/* ───────────────────────────────────────────────────────── */}
      {/* HEADER SECTION                                            */}
      {/* ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="gold" size="sm">
              <span className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest">
                <Sparkles className="h-3 w-3" />
                Concierge Dispatch
              </span>
            </Badge>
            <span className="text-muted text-xs">•</span>
            <span className="text-xs font-mono text-muted uppercase">Live Activity Stream</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-serif font-light text-primary tracking-tight">
            Security & Activity Notices
          </h1>
          <p className="text-xs sm:text-sm text-secondary font-sans mt-1">
            {unreadCount > 0
              ? `You have ${unreadCount} unreviewed dispatch notice${unreadCount === 1 ? '' : 's'}.`
              : 'All client allocation dispatches and compliance records are current.'}
          </p>
        </div>

        {/* Global Action Triggers */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => loadNotifications(true)}
            disabled={refreshing}
            className="text-xs uppercase tracking-wider border-border hover:border-gold/30"
          >
            {refreshing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
            ) : (
              <RefreshCcw className="h-3.5 w-3.5 mr-1.5" />
            )}
            <span>{refreshing ? 'Syncing...' : 'Refresh'}</span>
          </Button>

          {unreadCount > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleMarkAllAsRead}
              leftIcon={<CheckCheck className="h-3.5 w-3.5" />}
              className="text-xs uppercase tracking-wider border-border hover:border-gold/30 font-semibold"
            >
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────── */}
      {/* FILTER TABS & BULK SELECTION TRIGGER                      */}
      {/* ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-obsidian border border-border/60 overflow-x-auto max-w-full">
          {FILTER_TABS.map((tab) => {
            const isSelected = filter === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => {
                  setFilter(tab.value);
                  setPage(1);
                }}
                className={cn(
                  'px-3.5 py-1.5 rounded-md text-xs font-medium tracking-wide whitespace-nowrap transition-all',
                  isSelected
                    ? 'bg-gold text-obsidian font-semibold shadow-sm'
                    : 'text-secondary hover:text-primary hover:bg-graphite/45'
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Master Select All Toggle */}
        {notifications.length > 0 && (
          <button
            type="button"
            onClick={handleSelectAllToggle}
            className="text-xs font-mono uppercase tracking-widest text-muted hover:text-gold transition-colors self-end sm:self-auto px-2"
          >
            {selectedIds.length === notifications.length ? 'Deselect All' : 'Select All On Page'}
          </button>
        )}
      </div>

      {/* ───────────────────────────────────────────────────────── */}
      {/* FLOATING BULK ACTIONS BAR (When items are checked)        */}
      {/* ───────────────────────────────────────────────────────── */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
          <div className="flex items-center gap-4 px-5 py-3 rounded-full bg-graphite/95 border border-gold/40 shadow-2xl backdrop-blur-xl">
            <span className="text-xs font-mono text-primary">
              <strong className="text-gold font-bold">{selectedIds.length}</strong> notice{selectedIds.length === 1 ? '' : 's'} selected
            </span>

            <div className="h-4 w-px border-border/60" aria-hidden="true" />

            <Button
              variant="danger"
              size="sm"
              onClick={handleBulkDelete}
              className="text-xs uppercase font-mono tracking-wider py-1 px-3"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              <span>Dismiss Selected</span>
            </Button>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────── */}
      {/* NOTIFICATIONS ROSTER                                      */}
      {/* ───────────────────────────────────────────────────────── */}
      {notifications.length === 0 ? (
        <Card className="py-16 px-6 text-center bg-graphite/40 border-border/60">
          <div className="w-16 h-16 rounded-full border border-gold/30 bg-gold/5 flex items-center justify-center mx-auto mb-4">
            <Bell className="h-7 w-7 text-gold stroke-[1.5]" />
          </div>
          <h3 className="text-xl font-serif font-light text-primary">All Caught Up</h3>
          <p className="text-xs text-secondary font-sans max-w-sm mx-auto mt-1">
            There are no pending dispatches or security notices matching your current filter criteria.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const meta = NOTIFICATION_METAS[notification.type] || NOTIFICATION_METAS.SYSTEM;
            const Icon = meta.icon;
            const isSelected = selectedIds.includes(notification._id);
            const isDeletingThis = deletingId === notification._id;

            return (
              <Card
                key={notification._id}
                className={cn(
                  'p-4 sm:p-5 bg-graphite/90 border-border/80 hover:border-gold/30 transition-all duration-300 relative overflow-hidden backdrop-blur-md',
                  !notification.read && 'border-l-4 border-l-gold bg-graphite/95 shadow-[inset_4px_0_12px_rgba(212,175,55,0.1)]'
                )}
              >
                <div className="flex items-start gap-4">
                  {/* Select Checkbox */}
                  <div className="pt-1 shrink-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {
                        setSelectedIds((prev) =>
                          prev.includes(notification._id)
                            ? prev.filter((id) => id !== notification._id)
                            : [...prev, notification._id]
                        );
                      }}
                      className="h-4 w-4 rounded bg-inset border-border text-gold focus:ring-1 focus:ring-gold/40 focus:ring-offset-obsidian cursor-pointer accent-gold"
                    />
                  </div>

                  {/* Icon Avatar */}
                  <div
                    className={cn(
                      'h-10 w-10 rounded-xl border flex items-center justify-center shrink-0 mt-0.5',
                      meta.bgClass
                    )}
                  >
                    <Icon className={cn('h-5 w-5', meta.colorClass)} />
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-serif font-normal text-primary tracking-wide">
                          {notification.title}
                        </h4>

                        {/* Priority Badge */}
                        {notification.priority === 'high' && (
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold tracking-widest uppercase bg-red-500/15 border border-red-500/30 text-red-400">
                            Urgent
                          </span>
                        )}
                      </div>

                      {/* Timestamp */}
                      <span className="text-[10px] font-mono text-muted tabular-nums">
                        {getTimeAgo(notification.createdAt)}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-secondary font-sans leading-relaxed">
                      {notification.message}
                    </p>

                    {/* Footer Actions & Destination Link */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-border/30 mt-2">
                      <div>
                        {notification.data?.url && (
                          <Link
                            href={notification.data.url}
                            onClick={() => {
                              if (!notification.read) handleMarkAsRead(notification._id);
                            }}
                            className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-gold hover:text-gold-hover hover:underline transition-colors"
                          >
                            <span>Inspect Dossier</span>
                            <ExternalLink size={12} />
                          </Link>
                        )}
                      </div>

                      {/* Micro Action Icons */}
                      <div className="flex items-center gap-1">
                        {!notification.read && (
                          <button
                            type="button"
                            onClick={(e) => handleMarkAsRead(notification._id, e)}
                            className="p-1 rounded text-muted hover:text-gold transition-colors"
                            title="Mark as read"
                            aria-label="Mark notification as read"
                          >
                            <Check size={14} />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={(e) => handleDelete(notification._id, e)}
                          disabled={isDeletingThis}
                          className="p-1 rounded text-muted hover:text-red-400 transition-colors"
                          title="Dismiss notice"
                          aria-label="Dismiss notification"
                        >
                          {isDeletingThis ? (
                            <Loader2 size={14} className="animate-spin text-red-400" />
                          ) : (
                            <X size={14} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────── */}
      {/* PAGINATION CONTROLS                                       */}
      {/* ───────────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/40">
          <p className="text-xs font-mono text-muted">
            Displaying {notifications.length} of {total} total notifications
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="text-xs uppercase font-mono"
            >
              Previous
            </Button>

            <span className="px-3 text-xs font-mono text-secondary">
              {page} / {totalPages}
            </span>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="text-xs uppercase font-mono"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}