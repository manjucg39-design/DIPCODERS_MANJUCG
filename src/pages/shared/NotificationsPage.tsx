import React, { useState } from 'react';
import { Bell, CheckCheck, BookOpen, DollarSign, FileText, AlertTriangle, Star } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { MOCK_NOTIFICATIONS } from '../../lib/mock-data';
import { formatIST, timeAgo } from '../../lib/utils';
import type { Notification, NotificationType } from '../../types/domain';

function getNotifIcon(type: NotificationType) {
  const map: Record<NotificationType, React.ReactNode> = {
    BOOKING_CREATED:            <BookOpen className="w-4 h-4" />,
    BOOKING_ACCEPTED:           <BookOpen className="w-4 h-4" />,
    BOOKING_CANCELLED:          <BookOpen className="w-4 h-4" />,
    PAYMENT_CAPTURED:           <DollarSign className="w-4 h-4" />,
    QUOTATION_SUBMITTED:        <FileText className="w-4 h-4" />,
    QUOTATION_DECISION:         <FileText className="w-4 h-4" />,
    ADDITIONAL_WORK_REQUEST:    <FileText className="w-4 h-4" />,
    ADDITIONAL_WORK_DECISION:   <FileText className="w-4 h-4" />,
    COMPLETION_REQUESTED:       <CheckCheck className="w-4 h-4" />,
    MUTUALLY_COMPLETED:         <CheckCheck className="w-4 h-4" />,
    DISPUTE_OPENED:             <AlertTriangle className="w-4 h-4" />,
    REFUND_UPDATE:              <DollarSign className="w-4 h-4" />,
    REVIEW_RECEIVED:            <Star className="w-4 h-4" />,
    DIRECT_PAYMENT_REPORTED:    <DollarSign className="w-4 h-4" />,
    SYSTEM:                     <Bell className="w-4 h-4" />,
  };
  return map[type] ?? <Bell className="w-4 h-4" />;
}

function getNotifColor(type: NotificationType): string {
  if (['DISPUTE_OPENED'].includes(type)) return 'text-red-500 bg-red-50';
  if (['PAYMENT_CAPTURED', 'REFUND_UPDATE', 'DIRECT_PAYMENT_REPORTED'].includes(type)) return 'text-green-600 bg-green-50';
  if (['QUOTATION_SUBMITTED', 'QUOTATION_DECISION', 'ADDITIONAL_WORK_REQUEST', 'ADDITIONAL_WORK_DECISION'].includes(type)) return 'text-amber-600 bg-amber-50';
  if (['MUTUALLY_COMPLETED', 'REVIEW_RECEIVED'].includes(type)) return 'text-primary-600 bg-primary-50';
  return 'text-dark-500 bg-surface-100';
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>(
    MOCK_NOTIFICATIONS.filter(n => n.user_id === user?.id)
  );
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const displayed = filter === 'unread' ? notifications.filter(n => !n.is_read) : notifications;
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const markRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  return (
    <div className="animate-fade-in space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm text-dark-900 mb-1">Notifications</h1>
          <p className="text-dark-500 text-sm">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="btn-ghost btn-sm flex items-center gap-2">
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-surface-200">
        {(['all', 'unread'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px capitalize ${
              filter === tab
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-dark-500 hover:text-dark-800'
            }`}
          >
            {tab} {tab === 'unread' && unreadCount > 0 && (
              <span className="ml-1 bg-primary-500 text-white text-xs rounded-full px-1.5 py-0.5">{unreadCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Notification List */}
      {displayed.length === 0 ? (
        <div className="card card-body text-center py-16">
          <Bell className="w-12 h-12 text-dark-200 mx-auto mb-3" />
          <p className="font-semibold text-dark-700 mb-1">
            {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          </p>
          <p className="text-sm text-dark-400">Notifications will appear here for booking updates, payments, and more.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map(n => {
            const colorCls = getNotifColor(n.type);
            return (
              <div
                key={n.id}
                onClick={() => markRead(n.id)}
                className={`card p-4 flex items-start gap-4 cursor-pointer transition-all hover:shadow-card-hover ${
                  !n.is_read ? 'border-l-4 border-l-primary-500 bg-primary-50/30' : ''
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${colorCls}`}>
                  {getNotifIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <p className={`text-sm font-semibold ${!n.is_read ? 'text-dark-900' : 'text-dark-700'}`}>
                      {n.title}
                    </p>
                    {!n.is_read && <div className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-1.5" />}
                  </div>
                  <p className="text-xs text-dark-500 mt-0.5 leading-relaxed">{n.body}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <p className="text-xs text-dark-400">{formatIST(n.created_at, 'dd MMM yyyy, hh:mm a')} IST</p>
                    <span className="text-xs text-dark-300">·</span>
                    <p className="text-xs text-dark-400">{timeAgo(n.created_at)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-dark-400 text-center">
        Notifications are persisted per session (development mode). In production, these are stored server-side with pagination.
      </p>
    </div>
  );
}
