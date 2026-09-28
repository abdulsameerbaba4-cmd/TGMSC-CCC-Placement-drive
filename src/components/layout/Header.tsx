import React, { useState } from 'react';
import { User, AppNotification } from '../../types/index.ts';
import {
  Bell,
  Search,
  Plus,
  Sparkles,
  ChevronDown,
  ShieldAlert,
  Calendar,
  Briefcase,
  UserPlus,
  CheckCircle2,
  ExternalLink,
  Shield,
  Menu,
  Clock,
} from 'lucide-react';

interface Props {
  user: User | null;
  notifications: AppNotification[];
  onOpenRoleSwitcher: () => void;
  onNavigate: (tab: string) => void;
  onMarkNotificationRead: (id: string) => void;
  onMarkAllNotificationsRead: () => void;
  onOpenQuickAction: (action: string) => void;
  toggleSidebarMobile?: () => void;
  onGlobalSearch?: (query: string) => void;
  onGoToPortal?: () => void;
  onOpenExamForm?: () => void;
  onOpenInterviewTimes?: () => void;
}

export const Header: React.FC<Props> = ({
  user,
  notifications,
  onOpenRoleSwitcher,
  onNavigate,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onOpenQuickAction,
  toggleSidebarMobile,
  onGlobalSearch,
  onGoToPortal,
  onOpenExamForm,
  onOpenInterviewTimes,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const unreadCount = notifications.filter((n) => !n.read).length;
  const isStudent = user?.role === 'student';

  const roleLabelMap: Record<string, string> = {
    super_admin: 'Super Admin',
    placement_officer: 'Placement Officer',
    faculty_coordinator: 'Faculty Coordinator',
    recruiter: 'Recruiter',
    student: 'Student',
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onGlobalSearch && searchQuery.trim()) {
      onGlobalSearch(searchQuery.trim());
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile hamburger & Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        {toggleSidebarMobile && (
          <button
            onClick={toggleSidebarMobile}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
            title="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search students, companies, drives, skills..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (onGlobalSearch) onGlobalSearch(e.target.value);
            }}
            className="w-full pl-9 pr-4 py-2 bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-xs sm:text-sm rounded-lg border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all placeholder:text-slate-400"
          />
        </form>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {onGoToPortal && (
          <button
            onClick={onGoToPortal}
            className="px-3 py-1.5 text-xs font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            title="Return to Government of Telangana Portal"
          >
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span>Govt Portal</span>
          </button>
        )}

        {onOpenInterviewTimes && (
          <button
            onClick={onOpenInterviewTimes}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg shadow-xs transition-colors"
            title="Check Interview Times & Schedules"
          >
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Interview Times</span>
          </button>
        )}

        {onOpenExamForm && (
          <button
            onClick={onOpenExamForm}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 active:bg-purple-900 rounded-lg shadow-xs transition-colors"
            title="Write Exam Form for Interview"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Write Exam</span>
          </button>
        )}

        {/* Quick Action Button for Admins */}
        {!isStudent && (
          <div className="relative">
            <button
              onClick={() => setShowQuickMenu(!showQuickMenu)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              Quick Action
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {showQuickMenu && (
              <div
                className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setShowQuickMenu(false)}
              >
                <button
                  onClick={() => onOpenQuickAction('create_drive')}
                  className="w-full px-3.5 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 font-medium"
                >
                  <Briefcase className="w-4 h-4 text-indigo-600" />
                  New Placement Drive
                </button>
                <button
                  onClick={() => onOpenQuickAction('schedule_interview')}
                  className="w-full px-3.5 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 font-medium"
                >
                  <Calendar className="w-4 h-4 text-blue-600" />
                  Schedule Interview
                </button>
                <button
                  onClick={() => onOpenQuickAction('add_student')}
                  className="w-full px-3.5 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 font-medium"
                >
                  <UserPlus className="w-4 h-4 text-emerald-600" />
                  Enroll New Student
                </button>
                <button
                  onClick={() => onOpenQuickAction('add_question')}
                  className="w-full px-3.5 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 font-medium"
                >
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  Add Aptitude Question
                </button>
              </div>
            )}
          </div>
        )}

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-40 animate-in fade-in duration-100">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
                <span className="font-semibold text-xs text-slate-800 uppercase tracking-wider">
                  Notifications ({unreadCount} new)
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={() => {
                      onMarkAllNotificationsRead();
                    }}
                    className="text-[11px] font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        onMarkNotificationRead(n.id);
                        if (n.link) {
                          onNavigate(n.link.replace(/^\//, ''));
                          setShowNotifications(false);
                        }
                      }}
                      className={`p-3 text-left hover:bg-slate-50 cursor-pointer transition-colors ${
                        !n.read ? 'bg-indigo-50/30' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        {n.type === 'security_alert' ? (
                          <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        ) : n.type === 'success' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        ) : (
                          <Briefcase className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                        )}

                        <div className="flex-1 min-w-0">
                          <p className={`text-xs ${!n.read ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'}`}>
                            {n.title}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                            {n.message}
                          </p>
                          <span className="text-[10px] text-slate-400 mt-1 inline-block">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 text-center">
                <button
                  onClick={() => {
                    onNavigate('notifications');
                    setShowNotifications(false);
                  }}
                  className="text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  View All Notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Pill & Role Switcher */}
        <div
          onClick={onOpenRoleSwitcher}
          className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 cursor-pointer transition-all bg-white"
          title="Click to Switch Persona / Role"
        >
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
            alt={user?.name || 'User'}
            className="w-7 h-7 rounded-full object-cover border border-slate-200"
          />
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-semibold text-slate-900 truncate max-w-[120px]">
              {user?.name || 'User'}
            </span>
            <span className="text-[10px] font-medium text-indigo-600 tracking-tight">
              {roleLabelMap[user?.role || ''] || 'Portal User'}
            </span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </div>
      </div>
    </header>
  );
};
