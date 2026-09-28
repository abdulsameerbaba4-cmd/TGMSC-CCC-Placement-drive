import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.ts';
import { PlacementDrive, DriveStatus, Company } from '../../types/index.ts';
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  Calendar,
  MapPin,
  CheckCircle2,
  XCircle,
  Clock,
  IndianRupee,
  Users,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Edit,
  Trash2,
  X,
  FileCheck,
  Check,
} from 'lucide-react';

interface Props {
  onNavigate?: (tab: string) => void;
  onOpenTestForDrive?: (driveId: string) => void;
}

export const DriveManagement: React.FC<Props> = ({ onNavigate, onOpenTestForDrive }) => {
  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDrive, setEditingDrive] = useState<Partial<PlacementDrive>>({});
  const [eligibilityCheckModalDrive, setEligibilityCheckModalDrive] = useState<PlacementDrive | null>(null);
  const [testStudentId, setTestStudentId] = useState('CS21B001');
  const [eligibilityResult, setEligibilityResult] = useState<any>(null);
  const [testingEligibility, setTestingEligibility] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [drivesData, compData] = await Promise.all([api.getDrives(), api.getCompanies()]);
      setDrives(drivesData);
      setCompanies(compData);
    } catch (e) {
      console.error('Error fetching drives', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDrive.id) {
        await api.updateDrive(editingDrive.id, editingDrive);
      } else {
        await api.createDrive(editingDrive);
      }
      setIsModalOpen(false);
      setEditingDrive({});
      fetchData();
    } catch (e) {
      console.error('Failed to save placement drive', e);
    }
  };

  const handleDelete = async (id: string, role: string) => {
    if (!confirm(`Delete drive for "${role}"?`)) return;
    try {
      await api.deleteDrive(id);
      fetchData();
    } catch (e) {
      console.error('Failed to delete drive', e);
    }
  };

  const runEligibilityTest = async (driveId: string) => {
    try {
      setTestingEligibility(true);
      const res = await api.checkEligibility(driveId, testStudentId);
      setEligibilityResult(res);
    } catch (e) {
      console.error('Eligibility check error', e);
    } finally {
      setTestingEligibility(false);
    }
  };

  const statusColors: Record<DriveStatus, string> = {
    Draft: 'bg-slate-100 text-slate-700 border-slate-200',
    Published: 'bg-blue-50 text-blue-700 border-blue-200',
    'Applications Open': 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold',
    'Applications Closed': 'bg-amber-50 text-amber-700 border-amber-200',
    Assessment: 'bg-purple-50 text-purple-700 border-purple-200 font-semibold',
    Interview: 'bg-indigo-50 text-indigo-700 border-indigo-200 font-semibold',
    Selection: 'bg-teal-50 text-teal-700 border-teal-200',
    Completed: 'bg-slate-200 text-slate-800 border-slate-300',
  };

  const filtered = drives.filter((d) => {
    const matchesSearch =
      d.companyName.toLowerCase().includes(search.toLowerCase()) ||
      d.jobRole.toLowerCase().includes(search.toLowerCase()) ||
      d.jobLocation.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-600" />
            Placement Drive Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure recruitment campaigns, automated eligibility thresholds, exam schedules, and vacancies
          </p>
        </div>

        <button
          onClick={() => {
            const comp = companies[0] || { id: 'comp_custom', name: 'Google India' };
            setEditingDrive({
              companyId: comp.id,
              companyName: comp.name,
              jobRole: 'Software Engineer',
              workMode: 'Hybrid',
              ctcLpa: 18,
              salary: '₹18,00,000 CTC',
              vacancies: 5,
              minCgpa: 7.5,
              maxBacklogs: 0,
              graduationYear: 2026,
              allowedBranches: ['CSE', 'ECE', 'EEE'],
              requiredSkills: ['DSA', 'Python/Java', 'SQL'],
              status: 'Applications Open',
              applicationStartDate: new Date().toISOString().split('T')[0],
              applicationDeadline: '2026-11-20',
              assessmentDate: '2026-11-25',
              interviewDate: '2026-12-05',
            });
            setIsModalOpen(true);
          }}
          className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          Create Placement Drive
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search drives by company, job role, or location..."
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
            <option value="all">All Drive Stages</option>
            <option value="Applications Open">Applications Open</option>
            <option value="Assessment">Assessment Stage</option>
            <option value="Interview">Interview Stage</option>
            <option value="Selection">Selection Stage</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Drives Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400">Loading placement drives...</div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400">No drives match your filters.</div>
        ) : (
          filtered.map((drive) => (
            <div
              key={drive.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={drive.companyLogo}
                      alt={drive.companyName}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 bg-slate-50"
                    />
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{drive.jobRole}</h3>
                      <div className="text-xs font-semibold text-slate-600">{drive.companyName}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] border ${statusColors[drive.status]}`}>
                      {drive.status}
                    </span>
                    <button
                      onClick={() => {
                        setEditingDrive(drive);
                        setIsModalOpen(true);
                      }}
                      className="p-1 text-slate-400 hover:text-slate-700"
                      title="Edit Drive"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(drive.id, drive.jobRole)}
                      className="p-1 text-slate-400 hover:text-rose-600"
                      title="Delete Drive"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Key Metrics Pill Grid */}
                <div className="grid grid-cols-3 gap-2.5 mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Compensation</span>
                    <span className="font-bold text-slate-900">{drive.salary}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Vacancies</span>
                    <span className="font-bold text-slate-900">{drive.vacancies} Positions</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Work Mode</span>
                    <span className="font-medium text-slate-700">{drive.workMode}</span>
                  </div>
                </div>

                {/* Eligibility Criteria Box */}
                <div className="mt-3.5 p-3 rounded-xl border border-indigo-100 bg-indigo-50/40 text-xs space-y-1.5">
                  <div className="flex items-center justify-between font-semibold text-indigo-950">
                    <span className="flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                      Automatic Eligibility Criteria
                    </span>
                    <button
                      onClick={() => {
                        setEligibilityCheckModalDrive(drive);
                        setEligibilityResult(null);
                        runEligibilityTest(drive.id);
                      }}
                      className="text-[11px] text-indigo-600 hover:text-indigo-800 underline font-medium"
                    >
                      Test Eligibility Engine
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700 pt-1">
                    <div>
                      Minimum CGPA: <strong className="text-slate-900">{drive.minCgpa.toFixed(1)}</strong>
                    </div>
                    <div>
                      Max Backlogs: <strong className="text-slate-900">{drive.maxBacklogs}</strong>
                    </div>
                    <div className="col-span-2">
                      Branches:{' '}
                      <span className="font-medium text-slate-900">
                        {drive.allowedBranches.join(', ')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    Deadline: <strong>{drive.applicationDeadline}</strong>
                  </span>
                  <span>Assessment: {drive.assessmentDate}</span>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => {
                    setEligibilityCheckModalDrive(drive);
                    setEligibilityResult(null);
                    runEligibilityTest(drive.id);
                  }}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  Verify Student Eligibility
                  <ArrowRight className="w-3 h-3" />
                </button>

                {onOpenTestForDrive && (
                  <button
                    onClick={() => onOpenTestForDrive(drive.id)}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium"
                  >
                    View Tests
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Automated Eligibility Engine Simulator Modal */}
      {eligibilityCheckModalDrive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  Automated Student Eligibility Simulator
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Verify how the platform evaluates student profiles against {eligibilityCheckModalDrive.companyName} criteria
                </p>
              </div>
              <button
                onClick={() => setEligibilityCheckModalDrive(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1.5">Select Student to Verify:</label>
                <div className="flex gap-2">
                  <select
                    value={testStudentId}
                    onChange={(e) => setTestStudentId(e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500 text-xs"
                  >
                    <option value="CS21B001">Rahul Kumar (CSE, CGPA 8.85, 0 Backlogs)</option>
                    <option value="CS21B045">Ananya Iyer (CSE, CGPA 9.35, 0 Backlogs)</option>
                    <option value="EC21B012">Sneha Patel (ECE, CGPA 7.70, 0 Backlogs)</option>
                    <option value="ME21B033">Vikramaditya Verma (Mechanical, CGPA 6.40, 2 Backlogs)</option>
                    <option value="EE21B029">Rohan Mehta (EEE, CGPA 8.20, 0 Backlogs)</option>
                  </select>
                  <button
                    onClick={() => runEligibilityTest(eligibilityCheckModalDrive.id)}
                    disabled={testingEligibility}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {testingEligibility ? 'Checking...' : 'Run Check'}
                  </button>
                </div>
              </div>

              {/* Eligibility Outcome Box */}
              {eligibilityResult && (
                <div
                  className={`p-4 rounded-xl border text-xs ${
                    eligibilityResult.isEligible
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                      : 'bg-rose-50 border-rose-200 text-rose-950'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm">
                    {eligibilityResult.isEligible ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        <span>ELIGIBLE FOR THIS DRIVE</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                        <span>NOT ELIGIBLE FOR THIS DRIVE</span>
                      </>
                    )}
                  </div>

                  <div className="mt-2.5 space-y-1.5 text-[11px] leading-relaxed">
                    {eligibilityResult.isEligible ? (
                      <p className="text-emerald-800">
                        All criteria satisfied: CGPA ({eligibilityResult.student.cgpa}) $\ge$ {eligibilityResult.drive.minCgpa}, Branch ({eligibilityResult.student.branch}) permitted, backlogs ({eligibilityResult.student.backlogs}) within limit.
                      </p>
                    ) : (
                      eligibilityResult.reasons.map((r: string, idx: number) => (
                        <p key={idx} className="text-rose-800 font-medium">
                          • {r}
                        </p>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-right">
              <button
                onClick={() => setEligibilityCheckModalDrive(null)}
                className="px-4 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Drive Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <h3 className="font-semibold text-slate-900 text-base">
                {editingDrive.id ? 'Edit Placement Drive' : 'Configure New Placement Drive'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Company</label>
                  <select
                    value={editingDrive.companyId || ''}
                    onChange={(e) => {
                      const sel = companies.find((c) => c.id === e.target.value);
                      setEditingDrive({
                        ...editingDrive,
                        companyId: e.target.value,
                        companyName: sel?.name || '',
                      });
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500"
                  >
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Job Role Title</label>
                  <input
                    type="text"
                    required
                    value={editingDrive.jobRole || ''}
                    onChange={(e) => setEditingDrive({ ...editingDrive, jobRole: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500"
                    placeholder="e.g. SDE-1 / Data Analyst"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3.5">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Salary Package</label>
                  <input
                    type="text"
                    required
                    value={editingDrive.salary || ''}
                    onChange={(e) => setEditingDrive({ ...editingDrive, salary: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500"
                    placeholder="₹18,00,000 CTC"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">CTC (in LPA)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={editingDrive.ctcLpa || ''}
                    onChange={(e) => setEditingDrive({ ...editingDrive, ctcLpa: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Vacancies</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editingDrive.vacancies || ''}
                    onChange={(e) => setEditingDrive({ ...editingDrive, vacancies: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Eligibility Rules */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="font-bold text-slate-800 text-xs block">Automated Eligibility Thresholds</span>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="font-medium text-slate-600 block mb-1">Minimum CGPA</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      required
                      value={editingDrive.minCgpa || 7.0}
                      onChange={(e) => setEditingDrive({ ...editingDrive, minCgpa: parseFloat(e.target.value) })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-medium text-slate-600 block mb-1">Max Backlogs</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={editingDrive.maxBacklogs ?? 0}
                      onChange={(e) => setEditingDrive({ ...editingDrive, maxBacklogs: parseInt(e.target.value, 10) })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-medium text-slate-600 block mb-1">Graduation Batch</label>
                    <input
                      type="number"
                      required
                      value={editingDrive.graduationYear || 2026}
                      onChange={(e) => setEditingDrive({ ...editingDrive, graduationYear: parseInt(e.target.value, 10) })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-medium text-slate-600 block mb-1">Eligible Branches (select allowed):</label>
                  <div className="flex flex-wrap gap-2">
                    {['CSE', 'ECE', 'EEE', 'Mechanical', 'Civil', 'Other'].map((b) => {
                      const selected = (editingDrive.allowedBranches || []).includes(b);
                      return (
                        <button
                          type="button"
                          key={b}
                          onClick={() => {
                            const cur = editingDrive.allowedBranches || [];
                            const next = selected ? cur.filter((x) => x !== b) : [...cur, b];
                            setEditingDrive({ ...editingDrive, allowedBranches: next });
                          }}
                          className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                            selected
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          {b}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-3 gap-3.5">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Application Deadline</label>
                  <input
                    type="date"
                    required
                    value={editingDrive.applicationDeadline || ''}
                    onChange={(e) => setEditingDrive({ ...editingDrive, applicationDeadline: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Assessment Date</label>
                  <input
                    type="date"
                    value={editingDrive.assessmentDate || ''}
                    onChange={(e) => setEditingDrive({ ...editingDrive, assessmentDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Drive Status</label>
                  <select
                    value={editingDrive.status || 'Published'}
                    onChange={(e: any) => setEditingDrive({ ...editingDrive, status: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Published">Published</option>
                    <option value="Applications Open">Applications Open</option>
                    <option value="Assessment">Assessment</option>
                    <option value="Interview">Interview</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 shadow-xs"
                >
                  Save Placement Drive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
