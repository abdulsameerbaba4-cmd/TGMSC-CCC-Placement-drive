import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.ts';
import { Student, PlacementStatus } from '../../types/index.ts';
import { AiResumeParserModal } from './AiResumeParserModal.tsx';
import {
  Users,
  Search,
  Filter,
  Plus,
  Download,
  Trash2,
  Edit,
  Eye,
  X,
  CheckCircle,
  FileText,
  Briefcase,
  GraduationCap,
  Sparkles,
  Phone,
  Mail,
  Calendar,
  AlertCircle,
  Award,
} from 'lucide-react';

interface Props {
  onNavigateToDrive?: (driveId: string) => void;
}

export const StudentManagement: React.FC<Props> = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [minCgpa, setMinCgpa] = useState('');

  // Modals & Drawers
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentDetails, setStudentDetails] = useState<any>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAiResumeModalOpen, setIsAiResumeModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Student>>({});

  useEffect(() => {
    fetchStudents();
  }, [branchFilter, statusFilter, minCgpa]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await api.getStudents({
        branch: branchFilter,
        status: statusFilter,
        minCgpa: minCgpa || undefined,
        search: search || undefined,
      });
      setStudents(data);
    } catch (e) {
      console.error('Error fetching students', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStudents();
  };

  const handleOpenProfile = async (student: Student) => {
    setSelectedStudent(student);
    try {
      const details = await api.getStudentById(student.id);
      setStudentDetails(details);
    } catch (e) {
      console.error('Failed to load student details', e);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete student "${name}"? This action is permanent.`)) return;
    try {
      await api.deleteStudent(id);
      fetchStudents();
      if (selectedStudent?.id === id) setSelectedStudent(null);
    } catch (e) {
      console.error('Error deleting student', e);
    }
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditModalOpen && editFormData.id) {
        await api.updateStudent(editFormData.id, editFormData);
      } else {
        await api.createStudent(editFormData);
      }
      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
      setEditFormData({});
      fetchStudents();
    } catch (e) {
      console.error('Failed saving student', e);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Student ID', 'Full Name', 'Email', 'Phone', 'Branch', 'CGPA', 'Backlogs', 'Grad Year', 'Status', 'Company'];
    const rows = students.map((s) => [
      s.studentId,
      s.name,
      s.email,
      s.phone,
      s.branch,
      s.cgpa.toFixed(2),
      s.backlogs,
      s.graduationYear,
      s.placementStatus,
      s.placedCompany || '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PlacementFlow_Students_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statusColors: Record<PlacementStatus, string> = {
    'Not Placed': 'bg-slate-100 text-slate-700 border-slate-200',
    Applied: 'bg-blue-50 text-blue-700 border-blue-200',
    Shortlisted: 'bg-purple-50 text-purple-700 border-purple-200',
    Interview: 'bg-amber-50 text-amber-700 border-amber-200',
    Selected: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold',
    Placed: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold',
    Rejected: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Student Database & Eligibility Profiles
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage student academic records, verification statuses, backlogs, and drive history
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAiResumeModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-xs font-semibold text-white transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Sparkles className="w-4 h-4" />
            AI Resume Parser
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Export CSV
          </button>
          <button
            onClick={() => {
              setEditFormData({
                branch: 'CSE',
                cgpa: 8.0,
                backlogs: 0,
                graduationYear: 2026,
                placementStatus: 'Not Placed',
                gender: 'Male',
                skills: ['Python', 'DSA', 'SQL'],
              });
              setIsAddModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Add Student
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, roll no, email, skill..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 outline-none"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Branch Filter */}
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 outline-none focus:border-indigo-500"
          >
            <option value="all">All Branches</option>
            <option value="CSE">CSE</option>
            <option value="ECE">ECE</option>
            <option value="EEE">EEE</option>
            <option value="Mechanical">Mechanical</option>
            <option value="Civil">Civil</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 outline-none focus:border-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="Not Placed">Not Placed</option>
            <option value="Applied">Applied</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Interview">Interview</option>
            <option value="Selected">Selected</option>
            <option value="Placed">Placed</option>
          </select>

          {/* Min CGPA */}
          <select
            value={minCgpa}
            onChange={(e) => setMinCgpa(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 outline-none focus:border-indigo-500"
          >
            <option value="">Any CGPA</option>
            <option value="8.5">CGPA ≥ 8.5</option>
            <option value="8.0">CGPA ≥ 8.0</option>
            <option value="7.5">CGPA ≥ 7.5</option>
            <option value="7.0">CGPA ≥ 7.0</option>
          </select>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Branch & Batch</th>
                <th className="py-3 px-4">CGPA / Backlogs</th>
                <th className="py-3 px-4">Primary Skills</th>
                <th className="py-3 px-4">Placement Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                      <span>Loading student records...</span>
                    </div>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No students found matching your criteria.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Student Name & ID */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 hover:text-indigo-600 cursor-pointer" onClick={() => handleOpenProfile(student)}>
                            {student.name}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span>ID: {student.studentId}</span>
                            <span>·</span>
                            <span>{student.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Branch & Batch */}
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-800">{student.branch}</span>
                      <div className="text-[11px] text-slate-400">Class of {student.graduationYear}</div>
                    </td>

                    {/* CGPA / Backlogs */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{student.cgpa.toFixed(2)}</span>
                        {student.backlogs > 0 ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-600 border border-rose-200">
                            {student.backlogs} Backlog{student.backlogs > 1 ? 's' : ''}
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-600">
                            0 Backlogs
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Skills */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {student.skills.slice(0, 3).map((sk, i) => (
                          <span key={i} className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                            {sk}
                          </span>
                        ))}
                        {student.skills.length > 3 && (
                          <span className="text-[10px] text-slate-400">+{student.skills.length - 3}</span>
                        )}
                      </div>
                    </td>

                    {/* Placement Status */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] border ${statusColors[student.placementStatus]}`}>
                        {student.placementStatus}
                      </span>
                      {student.placedCompany && (
                        <div className="text-[10px] font-medium text-emerald-700 mt-0.5 truncate">
                          {student.placedCompany} (₹{student.salaryPackageLpa || 12} LPA)
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenProfile(student)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="View Profile Drawer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditFormData(student);
                            setIsEditModalOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit Student"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(student.id, student.name)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Delete Student"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Profile Drawer */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-indigo-600 text-white font-bold text-lg flex items-center justify-center">
                  {selectedStudent.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{selectedStudent.name}</h3>
                  <p className="text-xs text-slate-500">
                    Roll No: {selectedStudent.studentId} · {selectedStudent.branch} (Batch of {selectedStudent.graduationYear})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6 text-xs">
              {/* Placement Status Card */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Placement Status</span>
                  <div className="text-base font-bold text-slate-900 mt-0.5 flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs border ${statusColors[selectedStudent.placementStatus]}`}>
                      {selectedStudent.placementStatus}
                    </span>
                    {selectedStudent.placedCompany && (
                      <span className="text-xs text-emerald-700 font-semibold">
                        at {selectedStudent.placedCompany} (₹{selectedStudent.salaryPackageLpa} LPA)
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-500">CGPA</span>
                  <div className="text-lg font-bold text-indigo-600">{selectedStudent.cgpa.toFixed(2)}</div>
                </div>
              </div>

              {/* Contact & College Info */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="p-3 rounded-lg border border-slate-100 bg-white">
                  <span className="text-slate-400 text-[11px] flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" /> Email
                  </span>
                  <span className="font-medium text-slate-800 truncate block mt-0.5">{selectedStudent.email}</span>
                </div>
                <div className="p-3 rounded-lg border border-slate-100 bg-white">
                  <span className="text-slate-400 text-[11px] flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" /> Phone
                  </span>
                  <span className="font-medium text-slate-800 block mt-0.5">{selectedStudent.phone}</span>
                </div>
              </div>

              {/* Technical Skills */}
              <div>
                <h4 className="font-bold text-slate-900 text-xs mb-2">Technical Competencies</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedStudent.skills.map((sk, i) => (
                    <span key={i} className="px-2 py-1 rounded bg-slate-100 text-slate-700 font-medium">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              {/* Projects */}
              {selectedStudent.projects && selectedStudent.projects.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-900 text-xs mb-2">Key Projects</h4>
                  <div className="space-y-2">
                    {selectedStudent.projects.map((p, i) => (
                      <div key={i} className="p-3 rounded-lg border border-slate-200 bg-white">
                        <div className="font-semibold text-slate-900">{p.title}</div>
                        <p className="text-slate-600 mt-1 leading-relaxed text-[11px]">{p.description}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {p.technologies.map((t, idx) => (
                            <span key={idx} className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Resume */}
              <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  <div>
                    <span className="font-medium text-slate-900">{selectedStudent.resumeFileName || 'Resume.pdf'}</span>
                    <p className="text-[11px] text-slate-400">Verified by Placement Cell</p>
                  </div>
                </div>
                <button
                  onClick={() => alert(`Opening ${selectedStudent.resumeFileName || 'resume file'} for verification.`)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 font-medium text-slate-700 text-xs"
                >
                  View PDF
                </button>
              </div>

              {/* Drive History & Interviews */}
              {studentDetails && (
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900 text-xs">Drive Applications & Outcomes</h4>
                  {studentDetails.applications.length === 0 ? (
                    <p className="text-slate-400 italic">No applications filed yet.</p>
                  ) : (
                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                      {studentDetails.applications.map((app: any) => (
                        <div key={app.id} className="p-3 flex items-center justify-between">
                          <div>
                            <span className="font-semibold text-slate-900">{app.companyName}</span>
                            <span className="text-slate-500 text-[11px] ml-1.5">({app.driveRole})</span>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              Applied: {new Date(app.appliedAt).toLocaleDateString()}
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${statusColors[app.status as PlacementStatus] || 'bg-slate-100 text-slate-700'}`}>
                            {app.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Student Modal */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <h3 className="font-semibold text-slate-900 text-base">
                {isEditModalOpen ? 'Edit Student Profile' : 'Enroll New Student'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setIsEditModalOpen(false);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editFormData.name || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500"
                    placeholder="e.g. Rahul Sharma"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Student Roll ID</label>
                  <input
                    type="text"
                    required
                    value={editFormData.studentId || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, studentId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500"
                    placeholder="e.g. CS21B099"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={editFormData.email || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500"
                    placeholder="student@college.edu"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editFormData.phone || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500"
                    placeholder="+91 98765 00000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3.5">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Branch</label>
                  <select
                    value={editFormData.branch || 'CSE'}
                    onChange={(e: any) => setEditFormData({ ...editFormData, branch: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500"
                  >
                    <option value="CSE">CSE</option>
                    <option value="ECE">ECE</option>
                    <option value="EEE">EEE</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Civil">Civil</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    required
                    value={editFormData.cgpa || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, cgpa: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Active Backlogs</label>
                  <input
                    type="number"
                    min="0"
                    value={editFormData.backlogs ?? 0}
                    onChange={(e) => setEditFormData({ ...editFormData, backlogs: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Skills (Comma-separated)</label>
                <input
                  type="text"
                  value={Array.isArray(editFormData.skills) ? editFormData.skills.join(', ') : ''}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      skills: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500"
                  placeholder="Java, React, SQL, Cloud, DSA"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Placement Status</label>
                <select
                  value={editFormData.placementStatus || 'Not Placed'}
                  onChange={(e: any) => setEditFormData({ ...editFormData, placementStatus: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500"
                >
                  <option value="Not Placed">Not Placed</option>
                  <option value="Applied">Applied</option>
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="Interview">Interview</option>
                  <option value="Selected">Selected</option>
                  <option value="Placed">Placed</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setIsEditModalOpen(false);
                  }}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 shadow-xs"
                >
                  Save Student Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Resume Parser Modal */}
      <AiResumeParserModal
        isOpen={isAiResumeModalOpen}
        onClose={() => setIsAiResumeModalOpen(false)}
        onApplyParsedData={async (parsedData) => {
          try {
            await api.createStudent({
              ...parsedData,
              placementStatus: 'Not Placed',
            });
            fetchStudents();
          } catch (e) {
            console.error('Failed applying parsed student data', e);
          }
        }}
      />
    </div>
  );
};
