import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.ts';
import {
  BarChart3,
  Download,
  Award,
  TrendingUp,
  Percent,
  Building,
  GraduationCap,
  ShieldAlert,
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const res = await api.getReportsSummary();
      setSummary(res);
    } catch (e) {
      console.error('Failed fetching reports summary', e);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!summary) return;
    const headers = ['Category', 'Metric', 'Value'];
    const rows = [
      ['Placement', 'Overall Placement Percentage', `${summary.placementPercentage}%`],
      ['Placement', 'Total Students Placed', `${summary.totalPlaced}`],
      ['Placement', 'Average Salary Package', `₹${summary.averageSalaryLpa} LPA`],
      ['Placement', 'Highest Salary Package', `₹${summary.highestSalaryLpa} LPA`],
      ['Security', 'Security Incidents Tracked', `${summary.securityIncidentsCount}`],
      ['Security', 'Exam Auto-Submissions', `${summary.autoSubmittedAttemptsCount}`],
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `PlacementFlow_Placement_Report_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            Institutional Placement Reports & Export
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Aggregated statistics for college governing bodies, NIRF submissions, and accreditation audits
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <Download className="w-4 h-4 stroke-[2.5]" />
          Download Audit CSV
        </button>
      </div>

      {summary && (
        <div className="space-y-6">
          {/* Top Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Placement Rate</span>
              <div className="text-2xl font-bold text-indigo-600 mt-1">{summary.placementPercentage}%</div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">{summary.totalPlaced} candidates placed</span>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Average Package</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">₹{summary.averageSalaryLpa} LPA</div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Campus mean CTC</span>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Highest Offer</span>
              <div className="text-2xl font-bold text-emerald-600 mt-1">₹{summary.highestSalaryLpa} LPA</div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Top tier corporate offer</span>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Security Incidents</span>
              <div className="text-2xl font-bold text-rose-600 mt-1">{summary.securityIncidentsCount}</div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Proctoring window breaches</span>
            </div>
          </div>

          {/* Company Placements Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <h3 className="font-bold text-slate-900 text-sm">Corporate Recruiter Hiring Distribution</h3>
              <span className="text-xs text-slate-500">Current Academic Year</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
                    <th className="py-3 px-4">Company</th>
                    <th className="py-3 px-4">Salary Package Range</th>
                    <th className="py-3 px-4 text-right">Confirmed Hires</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {summary.companyPlacements.map((cp: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-50/60">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">{cp.company}</td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">{cp.averagePackage}</td>
                      <td className="py-3.5 px-4 text-right font-bold text-emerald-700">{cp.hires} Students</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
