import React from 'react';
import { User, UserRole } from '../../types/index.ts';
import { Shield, Briefcase, GraduationCap, Award, Building, Check, UserCircle2, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  users: User[];
  onSelectUser: (user: User) => void;
}

const roleMeta: Record<UserRole, { label: string; icon: React.ReactNode; color: string; desc: string }> = {
  super_admin: {
    label: 'Super Admin',
    icon: <Shield className="w-5 h-5 text-indigo-400" />,
    color: 'bg-indigo-50 border-indigo-200 text-indigo-900',
    desc: 'Unrestricted enterprise platform oversight, settings & database resets',
  },
  placement_officer: {
    label: 'Placement Officer',
    icon: <Award className="w-5 h-5 text-blue-500" />,
    color: 'bg-blue-50 border-blue-200 text-blue-900',
    desc: 'Manage drives, proctored exams, shortlists, company relations & security alerts',
  },
  faculty_coordinator: {
    label: 'Faculty Coordinator',
    icon: <Briefcase className="w-5 h-5 text-emerald-500" />,
    color: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    desc: 'View departmental student progress, eligibility & interview panels',
  },
  recruiter: {
    label: 'Corporate Recruiter',
    icon: <Building className="w-5 h-5 text-amber-500" />,
    color: 'bg-amber-50 border-amber-200 text-amber-900',
    desc: 'Google Talent Lead — review shortlisted candidates, conduct interviews & evaluations',
  },
  student: {
    label: 'Student Portal',
    icon: <GraduationCap className="w-5 h-5 text-purple-500" />,
    color: 'bg-purple-50 border-purple-200 text-purple-900',
    desc: 'Apply for eligible drives, attend secure proctored exams & track interview rounds',
  },
};

export const RoleSwitcherModal: React.FC<Props> = ({ isOpen, onClose, currentUser, users, onSelectUser }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <UserCircle2 className="w-5 h-5 text-indigo-600" />
              Switch Active Persona / Role
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Instantly toggle between administrator, coordinator, recruiter, and student viewpoints
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Persona List */}
        <div className="p-6 space-y-2.5 max-h-[70vh] overflow-y-auto">
          {users.map((u) => {
            const isSelected = currentUser?.id === u.id;
            const meta = roleMeta[u.role] || roleMeta.student;

            return (
              <div
                key={u.id}
                onClick={() => {
                  onSelectUser(u);
                  onClose();
                }}
                className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-3.5 ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/80'
                }`}
              >
                <img
                  src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                  alt={u.name}
                  className="w-11 h-11 rounded-full object-cover border border-slate-200 shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-slate-900 truncate text-sm">{u.name}</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide uppercase bg-slate-100 text-slate-700">
                      {meta.label}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {u.email} {u.studentId ? `· ID: ${u.studentId}` : ''} {u.department ? `· ${u.department}` : ''}
                  </p>

                  <p className="text-xs text-slate-600 mt-1 line-clamp-1">
                    {meta.desc}
                  </p>
                </div>

                <div className="self-center">
                  {isSelected ? (
                    <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border border-slate-300" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Backend RBAC enforces confidential data separation automatically.</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
