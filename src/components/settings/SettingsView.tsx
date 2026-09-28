import React, { useState } from 'react';
import { api } from '../../services/api.ts';
import {
  Settings,
  Sliders,
  RotateCcw,
  Shield,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface Props {
  onRefreshData?: () => void;
}

export const SettingsView: React.FC<Props> = ({ onRefreshData }) => {
  const [resetting, setResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleReset = async () => {
    if (
      !confirm(
        'Are you sure you want to reset the entire database to the initial seed state? This restores all default students, companies, drives, questions, attempts, and audit logs.'
      )
    )
      return;

    try {
      setResetting(true);
      await api.resetDatabase();
      setResetSuccess(true);
      if (onRefreshData) onRefreshData();
      setTimeout(() => setResetSuccess(false), 4000);
    } catch (e) {
      console.error('Failed resetting database', e);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-3xl">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-600" />
          Platform Administration & Configuration
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Global policies, evaluation weights, and data lifecycle management
        </p>
      </div>

      {resetSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 flex items-center gap-2 text-xs animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>PlacementFlow database successfully re-seeded to pristine enterprise state!</span>
        </div>
      )}

      {/* Role-Based Access Control Card */}
      <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3 text-xs">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Shield className="w-4 h-4 text-indigo-600" />
          Role-Based Access Control (RBAC) & Data Boundaries
        </h3>
        <p className="text-slate-600 leading-relaxed text-xs">
          PlacementFlow strictly segregates data responses at the server controller layer. When a student persona queries examinations, question banks, or candidate shortlists:
        </p>
        <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1 text-[11px]">
          <li><strong>Confidential Marks & Percentages:</strong> Automatically stripped from student HTTP responses.</li>
          <li><strong>Correct Answers & Question Bank Solutions:</strong> Stripped during assessment runtime.</li>
          <li><strong>Security Telemetry & Audit Logs:</strong> Access restricted to Super Admin and Placement Officers.</li>
          <li><strong>Interviewer Rubric Notes & Recommendations:</strong> Available only to recruiting panels.</li>
        </ul>
      </div>

      {/* Database Reset Card */}
      <div className="p-5 rounded-2xl border border-rose-200 bg-rose-50/40 shadow-xs space-y-3 text-xs">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-bold text-rose-950 text-sm flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-rose-600" />
              Reset Database to Seed State
            </h3>
            <p className="text-rose-800 text-xs mt-1 leading-relaxed">
              Resets all student records, placement drives, proctored attempts, security incident logs, and interview question sets to initial enterprise defaults.
            </p>
          </div>

          <button
            onClick={handleReset}
            disabled={resetting}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl transition-colors shadow-xs shrink-0 disabled:opacity-50"
          >
            {resetting ? 'Resetting...' : 'Reset Database'}
          </button>
        </div>
      </div>
    </div>
  );
};
