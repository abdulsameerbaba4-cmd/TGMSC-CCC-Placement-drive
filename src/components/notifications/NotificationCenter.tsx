import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.ts';
import { AppNotification } from '../../types/index.ts';
import {
  Bell,
  ShieldAlert,
  CheckCircle2,
  Briefcase,
  CalendarCheck,
  Check,
  Filter,
} from 'lucide-react';

interface Props {
  onNavigate?: (tab: string) => void;
}

export const NotificationCenter: React.FC<Props> = ({ onNavigate }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (e) {
      console.error('Failed fetching notifications', e);
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id: string) => {
    await api.markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllRead = async () => {
    await api.markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const filtered = notifications.filter((n) => {
    if (filterType === 'all') return true;
    if (filterType === 'security') return n.type === 'security_alert';
    if (filterType === 'unread') return !n.read;
    return true;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-600" />
            Recruitment Notification Dispatch Center
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time feed of drive announcements, security breach alerts, and schedule changes
          </p>
        </div>

        <button
          onClick={markAllRead}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
        >
          Mark all as read
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 text-xs">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            filterType === 'all'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilterType('security')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
            filterType === 'security'
              ? 'bg-rose-600 text-white'
              : 'bg-white text-rose-600 border border-slate-200 hover:bg-rose-50'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          Security Alerts ({notifications.filter((n) => n.type === 'security_alert').length})
        </button>
        <button
          onClick={() => setFilterType('unread')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            filterType === 'unread'
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Unread ({notifications.filter((n) => !n.read).length})
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-2.5">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading notifications...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
            No notifications in this filter.
          </div>
        ) : (
          filtered.map((n) => {
            const isAlert = n.type === 'security_alert';
            return (
              <div
                key={n.id}
                onClick={() => {
                  markRead(n.id);
                  if (n.link && onNavigate) {
                    onNavigate(n.link.replace(/^\//, ''));
                  }
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                  isAlert
                    ? 'border-rose-300 bg-rose-50/50 hover:bg-rose-50'
                    : !n.read
                    ? 'border-indigo-200 bg-indigo-50/20 hover:bg-indigo-50/40'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="mt-0.5">
                  {isAlert ? (
                    <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                  ) : n.type === 'success' ? (
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                      <Briefcase className="w-4 h-4" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4
                      className={`text-xs ${
                        !n.read ? 'font-bold text-slate-900' : 'font-medium text-slate-800'
                      }`}
                    >
                      {n.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {n.message}
                  </p>
                </div>

                {!n.read && (
                  <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0 self-center" />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
