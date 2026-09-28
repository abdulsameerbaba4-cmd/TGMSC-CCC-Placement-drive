import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.ts';
import {
  Users,
  Building2,
  Briefcase,
  FileCheck,
  GraduationCap,
  CalendarCheck,
  Award,
  TrendingUp,
  Percent,
  CheckCircle,
  Filter,
  ArrowUpRight,
  ShieldAlert,
  ChevronRight,
  Building,
} from 'lucide-react';

interface DashboardStats {
  kpis: {
    totalStudents: number;
    registeredCompanies: number;
    activePlacementDrives: number;
    totalApplications: number;
    eligibleStudents: number;
    aptitudeTestsCount: number;
    studentsShortlisted: number;
    interviewsScheduled: number;
    studentsSelected: number;
    placementPercentage: number;
  };
  branchPlacements: {
    branch: string;
    total: number;
    placed: number;
    percentage: number;
  }[];
  funnel: {
    stage: string;
    count: number;
  }[];
  placementTrend: {
    month: string;
    placed: number;
  }[];
  applicationsByDrive: {
    driveId: string;
    company: string;
    role: string;
    applications: number;
    vacancies: number;
  }[];
}

interface Props {
  onNavigate: (tab: string) => void;
}

export const AdminDashboard: React.FC<Props> = ({ onNavigate }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (e) {
      console.error('Failed to load dashboard statistics', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-500 font-medium">Loading placement analytics...</span>
        </div>
      </div>
    );
  }

  const { kpis, branchPlacements, funnel, placementTrend, applicationsByDrive } = stats;

  const kpiCards = [
    { label: 'Total Students', value: kpis.totalStudents, icon: Users, tab: 'students', color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Registered Companies', value: kpis.registeredCompanies, icon: Building2, tab: 'companies', color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Active Drives', value: kpis.activePlacementDrives, icon: Briefcase, tab: 'drives', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Applications', value: kpis.totalApplications, icon: FileCheck, tab: 'applications', color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Eligible Students', value: kpis.eligibleStudents, icon: CheckCircle, tab: 'students', color: 'text-teal-600', bg: 'bg-teal-50' },
    { label: 'Aptitude Tests', value: kpis.aptitudeTestsCount, icon: GraduationCap, tab: 'tests', color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Shortlisted', value: kpis.studentsShortlisted, icon: Filter, tab: 'shortlists', color: 'text-sky-600', bg: 'bg-sky-50' },
    { label: 'Interviews Scheduled', value: kpis.interviewsScheduled, icon: CalendarCheck, tab: 'interviews', color: 'text-violet-600', bg: 'bg-violet-50' },
    { label: 'Students Selected', value: kpis.studentsSelected, icon: Award, tab: 'students', color: 'text-emerald-700', bg: 'bg-emerald-100/70' },
    { label: 'Placement Rate', value: `${kpis.placementPercentage}%`, icon: Percent, tab: 'reports', color: 'text-indigo-700', bg: 'bg-indigo-100/80', isHighlight: true },
  ];

  const maxApplications = Math.max(...applicationsByDrive.map((d) => d.applications), 1);
  const maxTrend = Math.max(...placementTrend.map((t) => t.placed), 1);
  const maxFunnel = Math.max(...funnel.map((f) => f.count), 1);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-sm border border-slate-800">
        <div>
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
            Campus Recruitment Season 2025–2026
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-white mt-1">
            Placement Intelligence & Automation
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Live end-to-end recruitment tracking across eligible student registries, secure examinations, shortlists, and offer letters.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('drives')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            Manage Drives
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onNavigate('security')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            Security Center
          </button>
        </div>
      </div>

      {/* 10 Key KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {kpiCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              onClick={() => onNavigate(card.tab)}
              className={`p-4 rounded-xl border transition-all cursor-pointer group bg-white shadow-xs hover:shadow-md ${
                card.isHighlight
                  ? 'border-indigo-300 ring-1 ring-indigo-200'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 transition-colors" />
              </div>
              <div className="mt-3">
                <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {card.value}
                </div>
                <div className="text-xs text-slate-500 font-medium mt-0.5 truncate">
                  {card.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Charts & Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Selection Funnel (5 Cols) */}
        <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Selection Funnel Progression</h3>
                <p className="text-xs text-slate-500 mt-0.5">Application to final candidate offer conversion</p>
              </div>
              <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                Live Data
              </span>
            </div>

            <div className="space-y-3 mt-4">
              {funnel.map((item, idx) => {
                const widthPercent = Math.max(12, Math.round((item.count / maxFunnel) * 100));
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-slate-700">{item.stage}</span>
                      <span className="font-semibold text-slate-900">{item.count}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
                        style={{ width: `${widthPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Stage dropout rate automated</span>
            <button
              onClick={() => onNavigate('shortlists')}
              className="font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              Candidate shortlists
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Branch-wise Placement Comparison (7 Cols) */}
        <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Branch-wise Placement Performance</h3>
                <p className="text-xs text-slate-500 mt-0.5">Placement conversion percentages by engineering discipline</p>
              </div>
              <button
                onClick={() => onNavigate('students')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                View Registry
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 mt-4">
              {branchPlacements.map((bp) => (
                <div key={bp.branch} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">{bp.branch}</span>
                    <span className="text-xs font-bold text-indigo-600">{bp.percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full"
                      style={{ width: `${bp.percentage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                    <span>Placed: {bp.placed}</span>
                    <span>Total: {bp.total}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Automated departmental eligibility filtering enabled</span>
            <span className="font-semibold text-slate-700">Target: 85% placement rate</span>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Monthly Placement Trend & Applications by Drive */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Placement Trend (6 Cols) */}
        <div className="lg:col-span-6 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Monthly Placement Trajectory
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Cumulative candidate offers accepted per month</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
              +40% MoM
            </span>
          </div>

          <div className="h-44 flex items-end justify-between gap-3 pt-4 px-2">
            {placementTrend.map((pt, i) => {
              const heightPercent = Math.max(15, Math.round((pt.placed / maxTrend) * 100));
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[11px] font-semibold text-slate-600 group-hover:text-indigo-600">
                    {pt.placed}
                  </span>
                  <div
                    className="w-full max-w-[42px] bg-indigo-100 group-hover:bg-indigo-600 rounded-t-lg transition-all"
                    style={{ height: `${heightPercent}%` }}
                  />
                  <span className="text-[11px] text-slate-500 font-medium">
                    {pt.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Applications by Drive (6 Cols) */}
        <div className="lg:col-span-6 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building className="w-4 h-4 text-indigo-600" />
                Applications by Placement Drive
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Comparing candidate traction across recruiters</p>
            </div>
            <button
              onClick={() => onNavigate('drives')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              All Drives
            </button>
          </div>

          <div className="space-y-3">
            {applicationsByDrive.map((d, i) => {
              const widthPct = Math.max(10, Math.round((d.applications / maxApplications) * 100));
              return (
                <div key={i} className="p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-slate-900">{d.company}</span>
                      <span className="text-slate-500 text-[11px] ml-2 font-normal">({d.role})</span>
                    </div>
                    <span className="font-bold text-slate-900">
                      {d.applications} apps <span className="text-slate-400 font-normal">/ {d.vacancies} open</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
