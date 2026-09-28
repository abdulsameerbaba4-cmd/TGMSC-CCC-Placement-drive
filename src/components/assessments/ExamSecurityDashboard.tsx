import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.ts';
import { ExamSecurityEvent, ExamAttempt, AptitudeTest } from '../../types/index.ts';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Eye,
  CheckCircle2,
  Clock,
  Laptop,
  Maximize2,
  RefreshCw,
  Search,
  ExternalLink,
  Info,
  User,
  Check,
  X,
  FileSpreadsheet,
} from 'lucide-react';

export const ExamSecurityDashboard: React.FC = () => {
  const [events, setEvents] = useState<ExamSecurityEvent[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncidentAttempt, setSelectedIncidentAttempt] = useState<ExamAttempt | null>(null);
  const [reviewRemarks, setReviewRemarks] = useState('');

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const fetchSecurityData = async () => {
    try {
      setLoading(true);
      const [eventsData, statsData, attemptsData] = await Promise.all([
        api.getSecurityEvents(),
        api.getSecurityStats(),
        api.getExamAttempts(),
      ]);
      setEvents(eventsData);
      setStats(statsData);
      setAttempts(attemptsData);
    } catch (e) {
      console.error('Failed fetching security data', e);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncidentAttempt) return;
    try {
      await api.reviewExamAttempt(selectedIncidentAttempt.id, {
        adminRemarks: reviewRemarks,
        securityStatus: 'Warning', // downgraded from Auto Submitted to Warning upon officer review
      });
      setSelectedIncidentAttempt(null);
      fetchSecurityData();
    } catch (e) {
      console.error('Failed updating security incident', e);
    }
  };

  const autoSubmittedAttempts = attempts.filter((a) => a.submissionType === 'auto_submitted');

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            Exam Security, Integrity & Proctoring Audit Center
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time browser telemetry monitoring, Page Visibility API breach triggers, and automated exam termination logs
          </p>
        </div>

        <button
          onClick={fetchSecurityData}
          className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <RefreshCw className="w-4 h-4 text-slate-500" />
          Refresh Audit Stream
        </button>
      </div>

      {/* Security Status Badges & Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Normal */}
        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/60 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              🟢 Normal Submissions
            </span>
            <div className="text-xl font-bold text-emerald-950 mt-0.5">
              {stats?.normalAttemptsCount || attempts.filter((a) => a.securityStatus === 'Normal').length}
            </div>
          </div>
        </div>

        {/* Auto-Submitted */}
        <div className="p-4 rounded-xl border border-rose-300 bg-rose-50/70 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 animate-pulse">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-rose-800 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-600" />
              🔴 Auto-Submitted
            </span>
            <div className="text-xl font-bold text-rose-950 mt-0.5">
              {stats?.autoSubmittedAttempts || autoSubmittedAttempts.length}
            </div>
          </div>
        </div>

        {/* Window Changes */}
        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <Laptop className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-amber-800 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              🟡 Window Changes
            </span>
            <div className="text-xl font-bold text-amber-950 mt-0.5">
              {stats?.tabSwitches || events.length}
            </div>
          </div>
        </div>

        {/* Fullscreen Exits */}
        <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/60 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
            <Maximize2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-purple-800 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              🔴 Suspicious Exits
            </span>
            <div className="text-xl font-bold text-purple-950 mt-0.5">
              {stats?.fullscreenExits || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Critical Limitation & Transparency Notice (Requirement #38) */}
      <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 flex items-start gap-3 text-xs text-blue-950">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold block">Browser Capability & Privacy Architecture Notice (WC3 Standards):</span>
          <p className="text-[11px] text-blue-800 leading-relaxed">
            The examination proctoring engine relies strictly on standards-compliant browser mechanisms (including the <strong>Page Visibility API</strong>, <strong>Focus/Blur listeners</strong>, and <strong>Fullscreen Change events</strong>). In accordance with browser security and privacy boundaries, the web application monitors DOM focus and tab visibility within the user agent. No unauthorized host operating-system hooks are asserted.
          </p>
        </div>
      </div>

      {/* Live Auto-Submission Incident Stream (Requirement #19) */}
      <div className="space-y-3">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          Immediate Admin Security Incident Alerts ({autoSubmittedAttempts.length})
        </h3>

        <div className="space-y-3">
          {autoSubmittedAttempts.map((att) => (
            <div
              key={att.id}
              className="p-5 rounded-2xl border-2 border-rose-300 bg-rose-50/30 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-600 text-white">
                    🚨 Exam Security Alert
                  </span>
                  <span className="text-xs font-semibold text-rose-900">
                    Incident Trigger: {att.autoSubmitReason || 'Tab / Window Change Detected'}
                  </span>
                </div>

                <div className="text-sm font-bold text-slate-900 mt-1">
                  Candidate: {att.studentName} ({att.studentId})
                </div>

                <div className="text-xs text-slate-600 flex flex-wrap items-center gap-2 pt-0.5">
                  <span>Exam: <strong>{att.testTitle}</strong></span>
                  <span>·</span>
                  <span>Attempt: <strong>#{att.attemptNumber}</strong></span>
                  <span>·</span>
                  <span>Time: <strong>{new Date(att.submissionTime).toLocaleTimeString()}</strong></span>
                  <span>·</span>
                  <span>Action Taken: <strong className="text-rose-700">Automatically Terminated & Submitted</strong></span>
                </div>

                {att.adminRemarks && (
                  <p className="text-[11px] text-slate-600 italic mt-1">
                    Officer remarks: "{att.adminRemarks}"
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedIncidentAttempt(att);
                    setReviewRemarks(att.adminRemarks || '');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shrink-0 shadow-xs"
                >
                  <Eye className="w-4 h-4" />
                  Review & Add Audit Remarks
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comprehensive Exam Audit Log Table (Requirement #20) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              Proctored Examination Audit Log (Immutable Events)
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Chronological log of exam start times, submissions, visibility breaches, and review states
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
            {events.length} Telemetry Events
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <th className="py-3 px-4">Student ID & Name</th>
                <th className="py-3 px-4">Event Type</th>
                <th className="py-3 px-4">API Detection Source</th>
                <th className="py-3 px-4">Event Timestamp</th>
                <th className="py-3 px-4">Event Detail & Context</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">Loading security logs...</td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">No security incidents logged.</td>
                </tr>
              ) : (
                events.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{ev.studentName}</div>
                      <div className="text-[11px] text-slate-400">{ev.studentId}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        {ev.eventType}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                      {ev.browserSource}
                    </td>

                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {new Date(ev.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>

                    <td className="py-3 px-4 max-w-xs text-slate-600 text-[11px] truncate">
                      {ev.details}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800">
                        Auto Submitted
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Incident Review Drawer / Modal */}
      {selectedIncidentAttempt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <h3 className="font-bold text-slate-900 text-sm">
                Proctoring Incident Audit: {selectedIncidentAttempt.studentName}
              </h3>
              <button onClick={() => setSelectedIncidentAttempt(null)} className="p-1.5 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReviewIncident} className="p-6 space-y-4 text-xs">
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-2 text-rose-950">
                <div className="font-bold flex items-center gap-1.5 text-rose-800">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  Trigger: {selectedIncidentAttempt.autoSubmitReason}
                </div>
                <div className="text-[11px] text-rose-900 space-y-1">
                  <div>Assessment: <strong>{selectedIncidentAttempt.testTitle}</strong></div>
                  <div>Timestamp: <strong>{selectedIncidentAttempt.submissionTime}</strong></div>
                  <div>Questions Attempted Before Lockout: <strong>{selectedIncidentAttempt.answers?.length || 0}</strong></div>
                  <div>Evaluated Score: <strong>{selectedIncidentAttempt.score ?? 0} Marks ({selectedIncidentAttempt.percentage ?? 0}%)</strong></div>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Placement Officer Audit Notes / Decision:
                </label>
                <textarea
                  rows={3}
                  required
                  value={reviewRemarks}
                  onChange={(e) => setReviewRemarks(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500"
                  placeholder="e.g. Student confirmed accidental Alt+Tab. Incident verified and archived as warning..."
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedIncidentAttempt(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 shadow-xs"
                >
                  Confirm Review & Save Audit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
