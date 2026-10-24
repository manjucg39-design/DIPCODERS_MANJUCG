import React from 'react';
import { X, Bell, Check, Clock, AlertCircle } from 'lucide-react';
import { Notification } from '../types';
import { apiClient } from '../services/apiClient';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onRefresh: () => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onRefresh,
}) => {
  if (!isOpen) return null;

  const handleMarkRead = async (id: string) => {
    try {
      await apiClient.markNotificationRead(id);
      onRefresh();
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-2xs">
      <div className="bg-white w-full max-w-sm h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
            <span className="text-[11px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
              {notifications.filter(n => !n.read).length} Unread
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2">
          {notifications.length === 0 ? (
            <div className="text-center py-16 text-xs text-slate-400">
              No notifications yet.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-3 rounded-xl transition-colors ${
                  n.read ? 'bg-white opacity-80' : 'bg-blue-50/70 border border-blue-100'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-slate-900">{n.title}</span>
                  {!n.read && (
                    <button
                      type="button"
                      onClick={() => handleMarkRead(n.id)}
                      className="text-[10px] text-blue-600 hover:underline flex items-center gap-0.5 cursor-pointer"
                      title="Mark as read"
                    >
                      <Check className="w-3 h-3" />
                      <span>Read</span>
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                <span className="text-[9px] text-slate-400 font-mono mt-1.5 block">
                  {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="p-3 border-t border-slate-100 bg-slate-50 text-center text-[10px] text-slate-400">
          Mysuru Hyperlocal Dispatch Updates
        </div>
      </div>
    </div>
  );
};
