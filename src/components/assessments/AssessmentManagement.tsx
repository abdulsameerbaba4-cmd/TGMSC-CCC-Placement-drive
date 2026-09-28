import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.ts';
import { AptitudeTest, ExamAttempt, PlacementDrive, Question } from '../../types/index.ts';
import {
  GraduationCap,
  Plus,
  Clock,
  Award,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Eye,
  Edit,
  X,
  User,
  Search,
  Filter,
} from 'lucide-react';

interface Props {
  onNavigateToSecurity?: () => void;
}

export const AssessmentManagement: React.FC<Props> = ({ onNavigateToSecurity }) => {
  const [tests, setTests] = useState<AptitudeTest[]>([]);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isCreateTestOpen, setIsCreateTestOpen] = useState(false);
  const [newTestData, setNewTestData] = useState<Partial<AptitudeTest>>({});
  const [selectedAttempt, setSelectedAttempt] = useState<ExamAttempt | null>(null);
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [overridePassed, setOverridePassed] = useState<boolean>(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [testsData, attemptsData, drivesData, questionsData] = await Promise.all([
        api.getTests(),
        api.getExamAttempts(),
        api.getDrives(),
        api.getQuestions(),
      ]);
      setTests(testsData);
      setAttempts(attemptsData);
      setDrives(drivesData);
      setAllQuestions(questionsData);
    } catch (e) {
      console.error('Failed fetching assessment data', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedDrive = drives.find((d) => d.id === newTestData.driveId) || drives[0];
      const testPayload = {
        ...newTestData,
        driveId: selectedDrive.id,
        companyName: selectedDrive.companyName,
        jobRole: selectedDrive.jobRole,
        questionIds: (newTestData.questionIds && newTestData.questionIds.length > 0)
          ? newTestData.questionIds
          : allQuestions.slice(0, 10).map((q) => q.id),
      };
      await api.createTest(testPayload);
      setIsCreateTestOpen(false);
      setNewTestData({});
      fetchData();
    } catch (e) {
      console.error('Failed creating test', e);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAttempt) return;
    try {
      await api.reviewExamAttempt(selectedAttempt.id, {
        isPassed: overridePassed,
        adminRemarks: reviewRemarks,
        securityStatus: selectedAttempt.securityStatus === 'Auto Submitted' && overridePassed ? 'Warning' : selectedAttempt.securityStatus,
      });
      setSelectedAttempt(null);
      fetchData();
    } catch (e) {
      console.error('Failed updating attempt review', e);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-600" />
            Aptitude Examination System & Proctoring Oversight
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure proctored drive exams, time windows, and evaluate confidential candidate performances
          </p>
        </div>

        <button
          onClick={() => {
            const drive = drives[0] || { id: 'drv_default', companyName: 'Google', jobRole: 'SDE-1' };
            setNewTestData({
              driveId: drive.id,
              title: `${drive.companyName} Core Aptitude Assessment`,
              durationMinutes: 30,
              passingPercentage: 60,
              negativeMarking: 0.5,
              totalMarks: 20,
              questionIds: allQuestions.slice(0, 10).map((q) => q.id),
            });
            setIsCreateTestOpen(true);
          }}
          className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          Create Aptitude Test
        </button>
      </div>

      {/* Tests Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tests.map((test) => (
          <div
            key={test.id}
            className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    {test.companyName}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm mt-1">{test.title}</h3>
                  <div className="text-xs text-slate-500 mt-0.5">Role: {test.jobRole}</div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1 justify-end">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {test.durationMinutes} Mins
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    Passing: {test.passingPercentage}%
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4 p-3 bg-slate-50 rounded-xl text-xs text-slate-600">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Questions</span>
                  <strong className="text-slate-900">{test.questionIds.length} MCQs</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Marks</span>
                  <strong className="text-slate-900">{test.totalMarks} Marks</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Negative Mark</span>
                  <strong className="text-slate-900">-{test.negativeMarking}</strong>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Proctored with Fullscreen & Window Blur Detection</span>
              <span className="font-semibold text-indigo-600">
                {attempts.filter((a) => a.testId === test.id).length} Attempts Logged
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Admin-Only Candidate Exam Attempts Table (Requirement #17) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-600" />
              Confidential Candidate Aptitude Evaluations (Admin-Only)
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Strictly restricted to placement officers. Scores, correct percentages, and security states are never exposed to candidates.
            </p>
          </div>
          <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md border border-indigo-200">
            Total Submissions: {attempts.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Exam / Drive</th>
                <th className="py-3 px-4">Score</th>
                <th className="py-3 px-4">Percentage</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Security Incident</th>
                <th className="py-3 px-4 text-right">Review Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">Loading candidate attempts...</td>
                </tr>
              ) : attempts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">No examination attempts submitted yet.</td>
                </tr>
              ) : (
                attempts.map((attempt) => {
                  const isAuto = attempt.submissionType === 'auto_submitted';
                  return (
                    <tr
                      key={attempt.id}
                      className={`hover:bg-slate-50/60 transition-colors ${
                        isAuto ? 'bg-rose-50/20' : ''
                      }`}
                    >
                      {/* Student */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{attempt.studentName}</div>
                        <div className="text-[11px] text-slate-400">
                          ID: {attempt.studentId} · {attempt.studentBranch}
                        </div>
                      </td>

                      {/* Exam */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">{attempt.testTitle}</div>
                        <div className="text-[11px] text-slate-500">{attempt.companyName}</div>
                      </td>

                      {/* Score */}
                      <td className="py-3.5 px-4">
                        {isAuto && !attempt.adminReviewed ? (
                          <span className="font-mono text-slate-400">—</span>
                        ) : (
                          <span className="font-bold text-slate-900 font-mono text-sm">
                            {attempt.score}
                          </span>
                        )}
                      </td>

                      {/* Percentage */}
                      <td className="py-3.5 px-4">
                        {isAuto && !attempt.adminReviewed ? (
                          <span className="font-mono text-slate-400">—</span>
                        ) : (
                          <span
                            className={`font-semibold font-mono ${
                              (attempt.percentage || 0) >= 60 ? 'text-emerald-600' : 'text-slate-600'
                            }`}
                          >
                            {attempt.percentage}%
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {isAuto ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1 w-max">
                            <AlertTriangle className="w-3 h-3" />
                            Auto Submitted
                          </span>
                        ) : attempt.isPassed ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 w-max">
                            <CheckCircle2 className="w-3 h-3" />
                            Passed
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                            Failed
                          </span>
                        )}
                      </td>

                      {/* Security */}
                      <td className="py-3.5 px-4">
                        {isAuto ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-600 text-white animate-pulse">
                            🚨 Alert
                          </span>
                        ) : (
                          <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Normal
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedAttempt(attempt);
                            setReviewRemarks(attempt.adminRemarks || '');
                            setOverridePassed(attempt.isPassed || false);
                          }}
                          className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded text-[11px] transition-colors"
                        >
                          Review & Grade
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Review Drawer / Modal */}
      {selectedAttempt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Candidate Examination Evaluation: {selectedAttempt.studentName}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Roll ID: {selectedAttempt.studentId} · Attempt #{selectedAttempt.attemptNumber}
                </p>
              </div>
              <button onClick={() => setSelectedAttempt(null)} className="p-1.5 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="p-6 space-y-4 text-xs">
              {/* Incident Alert Banner if auto submitted */}
              {selectedAttempt.submissionType === 'auto_submitted' && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-950 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    Proctoring Incident: Auto-Submitted Due to Window Breach
                  </div>
                  <p className="text-[11px] text-rose-800 leading-relaxed">
                    Candidate triggered window/tab switch or blur event at {selectedAttempt.submissionTime}. Exam was automatically terminated and submitted to protect assessment integrity.
                  </p>
                </div>
              )}

              {/* Score Breakdown */}
              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Calculated Score</span>
                  <strong className="text-slate-900 text-sm">{selectedAttempt.score ?? 0} Marks</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Percentage</span>
                  <strong className="text-indigo-600 text-sm">{selectedAttempt.percentage ?? 0}%</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Questions Logged</span>
                  <strong className="text-slate-900 text-sm">{selectedAttempt.answers?.length || 0} attempted</strong>
                </div>
              </div>

              {/* Pass / Fail Override */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Administrative Evaluation Decision</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-800">
                    <input
                      type="radio"
                      name="passRadio"
                      checked={overridePassed === true}
                      onChange={() => setOverridePassed(true)}
                      className="w-4 h-4 text-indigo-600"
                    />
                    Mark Qualified / Passed
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-800">
                    <input
                      type="radio"
                      name="passRadio"
                      checked={overridePassed === false}
                      onChange={() => setOverridePassed(false)}
                      className="w-4 h-4 text-indigo-600"
                    />
                    Mark Disqualified / Failed
                  </label>
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Officer Audit Remarks</label>
                <textarea
                  rows={3}
                  value={reviewRemarks}
                  onChange={(e) => setReviewRemarks(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500"
                  placeholder="Audit reason, proctoring notes, or justification for pass/fail decision..."
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                {onNavigateToSecurity && selectedAttempt.submissionType === 'auto_submitted' && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAttempt(null);
                      onNavigateToSecurity();
                    }}
                    className="text-rose-600 hover:underline font-semibold text-xs flex items-center gap-1"
                  >
                    View in Security Dashboard
                  </button>
                )}

                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setSelectedAttempt(null)}
                    className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 shadow-xs"
                  >
                    Save Audit Decision
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Test Modal */}
      {isCreateTestOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <h3 className="font-semibold text-slate-900 text-base">Configure Proctored Aptitude Test</h3>
              <button onClick={() => setIsCreateTestOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTest} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Associated Placement Drive</label>
                <select
                  value={newTestData.driveId || ''}
                  onChange={(e) => {
                    const sel = drives.find((d) => d.id === e.target.value);
                    setNewTestData({
                      ...newTestData,
                      driveId: e.target.value,
                      companyName: sel?.companyName,
                      jobRole: sel?.jobRole,
                    });
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                >
                  {drives.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.companyName} — {d.jobRole}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Assessment Title</label>
                <input
                  type="text"
                  required
                  value={newTestData.title || ''}
                  onChange={(e) => setNewTestData({ ...newTestData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                  placeholder="e.g. SDE-1 Technical & Aptitude Screening"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    min="5"
                    max="180"
                    required
                    value={newTestData.durationMinutes || 30}
                    onChange={(e) => setNewTestData({ ...newTestData, durationMinutes: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Passing %</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={newTestData.passingPercentage || 60}
                    onChange={(e) => setNewTestData({ ...newTestData, passingPercentage: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Negative Marking</label>
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    required
                    value={newTestData.negativeMarking ?? 0.5}
                    onChange={(e) => setNewTestData({ ...newTestData, negativeMarking: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-950">
                <span className="font-semibold text-[11px] block">Proctoring Enforcement:</span>
                <p className="text-[11px] text-indigo-800 mt-0.5">
                  Page Visibility API and window blur listeners will automatically lock and submit the assessment if the candidate switches windows or tabs.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCreateTestOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 shadow-xs"
                >
                  Publish Aptitude Test
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
