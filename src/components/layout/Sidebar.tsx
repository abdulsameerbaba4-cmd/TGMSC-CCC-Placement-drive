import React from 'react';
import { User } from '../../types/index.ts';
import {
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  FileCheck,
  GraduationCap,
  HelpCircle,
  ListFilter,
  CalendarCheck,
  Bell,
  ShieldAlert,
  BarChart3,
  Sliders,
  Settings,
  Zap,
  UserCircle,
  FileText,
  LogOut,
  Sparkles,
  Globe,
  Clock,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  badgeColor?: string;
}

interface Props {
  user: User | null;
  activeTab: string;
  onNavigate: (tab: string) => void;
  securityAlertCount?: number;
  unreadNotificationsCount?: number;
  onOpenRoleSwitcher: () => void;
}

export const Sidebar: React.FC<Props> = ({
  user,
  activeTab,
  onNavigate,
  securityAlertCount = 0,
  unreadNotificationsCount = 0,
  onOpenRoleSwitcher,
}) => {
  const isStudent = user?.role === 'student';

  const adminNavItems: NavItem[] = [
    { id: 'portal', label: 'Government Portal', icon: Globe },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'companies', label: 'Companies', icon: Building2 },
    { id: 'drives', label: 'Placement Drives', icon: Briefcase },
    { id: 'applications', label: 'Applications', icon: FileCheck },
    { id: 'tests', label: 'Aptitude Tests', icon: GraduationCap },
    { id: 'questions', label: 'Question Bank', icon: HelpCircle },
    { id: 'shortlists', label: 'Shortlists', icon: ListFilter },
    { id: 'interviews', label: 'Interviews & Schedules', icon: CalendarCheck },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotificationsCount },
    {
      id: 'security',
      label: 'Exam Security',
      icon: ShieldAlert,
      badge: securityAlertCount,
      badgeColor: 'bg-rose-500 text-white font-bold',
    },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'automations', label: 'Automations', icon: Zap },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const studentNavItems: NavItem[] = [
    { id: 'portal', label: 'Government Portal', icon: Globe },
    { id: 'student_dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'student_drives', label: 'Eligible Drives', icon: Briefcase },
    { id: 'student_applications', label: 'My Applications', icon: FileCheck },
    { id: 'student_tests', label: 'Assessments & Tests', icon: GraduationCap },
    { id: 'student_interviews', label: 'My Interviews', icon: CalendarCheck },
    { id: 'student_profile', label: 'Profile & Resume', icon: UserCircle },
  ];

  const currentItems = isStudent ? studentNavItems : adminNavItems;

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen shrink-0 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="px-5 py-5 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 fill-white/20" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
              PlacementFlow
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">Automation Platform</p>
          </div>
        </div>
        <p className="text-[11px] text-slate-400 mt-2.5 leading-snug line-clamp-1 italic">
          “Automate Every Step of Your Placement Drive.”
        </p>
      </div>

      {/* Role Banner */}
      <div className="px-4 py-2.5 bg-slate-950/60 border-b border-slate-800/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-300">
            {isStudent ? 'Student View' : 'Admin Console'}
          </span>
        </div>
        <button
          onClick={onOpenRoleSwitcher}
          className="text-[11px] font-medium text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors"
        >
          Switch Role
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-1">
        {currentItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                    item.badgeColor || (isActive ? 'bg-indigo-700 text-white' : 'bg-slate-800 text-slate-300')
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Footer Profile */}
      <div className="p-3.5 border-t border-slate-800/80 bg-slate-950/40">
        <div
          onClick={onOpenRoleSwitcher}
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800/60 cursor-pointer transition-colors"
        >
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
            alt={user?.name || 'User'}
            className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user?.name || 'Authorized User'}</p>
            <p className="text-[10px] text-slate-400 truncate capitalize">
              {user?.role?.replace('_', ' ') || 'User'}
            </p>
          </div>
          <Sliders className="w-4 h-4 text-slate-500 hover:text-slate-300 shrink-0" />
        </div>
      </div>
    </aside>
  );
};
