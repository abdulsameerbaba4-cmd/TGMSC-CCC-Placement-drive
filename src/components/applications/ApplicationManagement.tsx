import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.ts';
import { Application, ApplicationStatus } from '../../types/index.ts';
import {
  FileCheck,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  UserCheck,
  UserX,
  Calendar,
  AlertTriangle,
  Award,
} from 'lucide-react';

export const ApplicationManagement: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await api.getApplications();
      setApplications(data);
    } catch (e) {
      console.error('Failed fetching applications', e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: ApplicationStatus) => {
    try {
      await api.updateApplicationStatus(id, newStatus);
      fetchApplications();
    } catch (e) {
      console.error('Failed updating application status', e);
    }
  };

  const statusColors: Record<ApplicationStatus, string> = {
    Applied: 'bg-blue-50 text-blue-700 border-blue-200',
    Eligible: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Not Eligible': 'bg-rose-50 text-rose-700 border-rose-200',
    'Assessment Pending': 'bg-purple-50 text-purple-700 border-purple-200',
    'Assessment Completed': 'bg-indigo-50 text-indigo-700 border-indigo-200 font-semibold',
    Shortlisted: 'bg-sky-50 text-sky-700 border-sky-200 font-semibold',
    'Interview Scheduled': 'bg-amber-50 text-amber-700 border-amber-200',
    Selected: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold',
    Rejected: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const filtered = applications.filter((app) => {
    const matchesSearch =
      app.studentName.toLowerCase().includes(search.toLowerCase()) ||
      app.studentId.toLowerCase().includes(search.toLowerCase()) ||
      app.companyName.toLowerCase().includes(search.toLowerCase()) ||
      app.driveRole.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-indigo-600" />
            Student Drive Applications
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated eligibility verification status, assessment progress, and round promotions
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search applications by candidate, roll no, drive..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 outline-none focus:border-indigo-500"
          >
            <option value="all">All Application Statuses</option>
            <option value="Applied">Applied</option>
            <option value="Eligible">Eligible</option>
            <option value="Not Eligible">Not Eligible</option>
            <option value="Assessment Completed">Assessment Completed</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Interview Scheduled">Interview Scheduled</option>
            <option value="Selected">Selected</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Candidate</th>
                <th className="py-3 px-4">Placement Drive</th>
                <th className="py-3 px-4">Eligibility Engine</th>
                <th className="py-3 px-4">Current Stage</th>
                <th className="py-3 px-4">Application Date</th>
                <th className="py-3 px-4 text-right">Advance Stage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">Loading applications...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">No applications found.</td>
                </tr>
              ) : (
                filtered.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Candidate */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{app.studentName}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {app.studentId} · {app.studentBranch} (CGPA {app.studentCgpa.toFixed(2)})
                      </div>
                    </td>

                    {/* Drive */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{app.companyName}</div>
                      <div className="text-[11px] text-slate-500">{app.driveRole}</div>
                    </td>

                    {/* Eligibility Engine Result */}
                    <td className="py-3.5 px-4">
                      {app.isEligible ? (
                        <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Auto-Verified Eligible</span>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center gap-1.5 text-rose-700 font-semibold">
                            <XCircle className="w-4 h-4 text-rose-600" />
                            <span>Auto Ineligible</span>
                          </div>
                          {app.ineligibilityReason && (
                            <p className="text-[10px] text-rose-600 mt-0.5 max-w-xs line-clamp-2">
                              {app.ineligibilityReason}
                            </p>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Current Stage */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] border ${statusColors[app.status]}`}>
                        {app.status}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {new Date(app.appliedAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>

                    {/* Advance Action Buttons */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {app.status !== 'Shortlisted' && app.status !== 'Selected' && (
                          <button
                            onClick={() => handleUpdateStatus(app.id, 'Shortlisted')}
                            className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded text-[11px] font-semibold transition-colors"
                          >
                            Shortlist
                          </button>
                        )}
                        {app.status === 'Shortlisted' && (
                          <button
                            onClick={() => handleUpdateStatus(app.id, 'Interview Scheduled')}
                            className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded text-[11px] font-semibold transition-colors"
                          >
                            Interview
                          </button>
                        )}
                        {app.status !== 'Selected' && (
                          <button
                            onClick={() => handleUpdateStatus(app.id, 'Selected')}
                            className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded text-[11px] font-semibold transition-colors"
                          >
                            Select
                          </button>
                        )}
                        {app.status !== 'Rejected' && (
                          <button
                            onClick={() => handleUpdateStatus(app.id, 'Rejected')}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium transition-colors"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
