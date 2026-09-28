import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.ts';
import {
  Interview,
  InterviewQuestion,
  InterviewEvaluation,
  PlacementDrive,
  Student,
  InterviewRound,
} from '../../types/index.ts';
import { AiInterviewQuestionModal } from './AiInterviewQuestionModal.tsx';
import {
  CalendarCheck,
  Plus,
  Search,
  Filter,
  Video,
  MapPin,
  Clock,
  Sparkles,
  BookOpen,
  Award,
  Star,
  CheckCircle,
  XCircle,
  X,
  User,
  Building,
  HelpCircle,
} from 'lucide-react';

export const InterviewManagement: React.FC = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [interviewQuestions, setInterviewQuestions] = useState<InterviewQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  // Tabs: 'scheduled' | 'question_bank' | 'generate'
  const [activeSubTab, setActiveSubTab] = useState<'scheduled' | 'question_bank' | 'generator'>('scheduled');

  // Question Bank filters
  const [roleFilter, setRoleFilter] = useState('Software Developer');
  const [roundFilter, setRoundFilter] = useState('all');

  // Generator state
  const [genRole, setGenRole] = useState<'Software Developer' | 'Cybersecurity' | 'Data Analyst' | 'HR/Management'>('Software Developer');
  const [generatedSet, setGeneratedSet] = useState<any>(null);

  // Modals
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isAiQuestionModalOpen, setIsAiQuestionModalOpen] = useState(false);
  const [aiSelectedCandidate, setAiSelectedCandidate] = useState<Student | null>(null);
  const [aiSelectedDrive, setAiSelectedDrive] = useState<PlacementDrive | null>(null);
  const [newInterviewData, setNewInterviewData] = useState<Partial<Interview>>({});
  const [evaluatingInterview, setEvaluatingInterview] = useState<Interview | null>(null);
  const [evalData, setEvalData] = useState<Partial<InterviewEvaluation>>({});

  useEffect(() => {
    fetchData();
  }, [roleFilter, roundFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [intData, drivesData, studentsData, questionsData] = await Promise.all([
        api.getInterviews(),
        api.getDrives(),
        api.getStudents(),
        api.getInterviewQuestions({ role: roleFilter, round: roundFilter }),
      ]);
      setInterviews(intData);
      setDrives(drivesData);
      setStudents(studentsData);
      setInterviewQuestions(questionsData);
    } catch (e) {
      console.error('Failed fetching interview data', e);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuestions = async () => {
    try {
      const res = await api.generateInterviewQuestions(genRole);
      setGeneratedSet(res);
    } catch (e) {
      console.error('Failed generating questions', e);
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createInterview(newInterviewData);
      setIsScheduleModalOpen(false);
      setNewInterviewData({});
      fetchData();
    } catch (e) {
      console.error('Failed scheduling interview', e);
    }
  };

  const handleEvaluationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evaluatingInterview) return;
    try {
      await api.evaluateInterview(evaluatingInterview.id, evalData);
      setEvaluatingInterview(null);
      setEvalData({});
      fetchData();
    } catch (e) {
      console.error('Failed submitting evaluation', e);
    }
  };

  const openEvaluationModal = (interview: Interview) => {
    setEvaluatingInterview(interview);
    setEvalData({
      technicalKnowledgeScore: 8,
      problemSolvingScore: 8,
      communicationScore: 8,
      projectKnowledgeScore: 8,
      roleSpecificScore: 8,
      teamworkScore: 8,
      overallPerformanceScore: 8,
      recommendation: 'Recommended',
      strengths: '',
      weaknesses: '',
      comments: '',
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-indigo-600" />
            Interview Rounds & Structured Question Engine
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Role-specific technical questioning, multi-round scheduling, and rubric evaluations
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              const cand = students.find((s) => s.id === 'std_2') || students[0];
              const drv = drives[0];
              setAiSelectedCandidate(cand);
              setAiSelectedDrive(drv);
              setIsAiQuestionModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-xs font-semibold text-white transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Sparkles className="w-4 h-4" />
            AI Candidate Question Probing
          </button>
          <button
            onClick={() => {
              const drive = drives[0] || { id: 'drv_custom', companyName: 'Google India' };
              const student = students[0] || { id: 'std_1', name: 'Rahul Kumar' };
              setNewInterviewData({
                driveId: drive.id,
                candidateId: student.id,
                round: 'Technical',
                date: new Date().toISOString().split('T')[0],
                time: '14:30',
                durationMinutes: 45,
                interviewType: 'Online',
                meetingLink: 'https://meet.google.com/placement-panel-nit',
                interviewerName: 'Google Tech Lead',
              });
              setIsScheduleModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Schedule Interview
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs">
        <button
          onClick={() => setActiveSubTab('scheduled')}
          className={`pb-3 px-3 font-semibold transition-colors flex items-center gap-2 border-b-2 ${
            activeSubTab === 'scheduled'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          Scheduled Interviews ({interviews.length})
        </button>

        <button
          onClick={() => setActiveSubTab('question_bank')}
          className={`pb-3 px-3 font-semibold transition-colors flex items-center gap-2 border-b-2 ${
            activeSubTab === 'question_bank'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Role Interview Questions ({interviewQuestions.length})
        </button>

        <button
          onClick={() => {
            setActiveSubTab('generator');
            if (!generatedSet) handleGenerateQuestions();
          }}
          className={`pb-3 px-3 font-semibold transition-colors flex items-center gap-2 border-b-2 ${
            activeSubTab === 'generator'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          Role Question Set Generator
        </button>
      </div>

      {/* SUB-TAB 1: SCHEDULED INTERVIEWS */}
      {activeSubTab === 'scheduled' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Company & Round</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Interviewer / Panel</th>
                  <th className="py-3 px-4">Interview Link / Location</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Evaluation Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {interviews.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No interviews scheduled yet.
                    </td>
                  </tr>
                ) : (
                  interviews.map((int) => (
                    <tr key={int.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{int.candidateName}</div>
                        <div className="text-[11px] text-slate-400">
                          {int.candidateBranch} · CGPA {int.candidateCgpa.toFixed(2)}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{int.companyName}</div>
                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {int.round} Round
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-900">{int.date}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {int.time} ({int.durationMinutes} mins)
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">{int.interviewerName}</div>
                        <div className="text-[11px] text-slate-400">{int.interviewerEmail}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        {int.interviewType === 'Online' && int.meetingLink ? (
                          <a
                            href={int.meetingLink}
                            target="_blank"
                            rel="noreferrer"
                            className="text-indigo-600 hover:underline flex items-center gap-1 font-medium"
                          >
                            <Video className="w-3.5 h-3.5" />
                            Join Video Meeting
                          </a>
                        ) : (
                          <div className="flex items-center gap-1 text-slate-600">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>{int.location || 'On Campus'}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                            int.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                        >
                          {int.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => openEvaluationModal(int)}
                          className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-[11px] shadow-xs"
                        >
                          {int.evaluationId ? 'Edit Rubric Evaluation' : 'Evaluate Candidate'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: ROLE INTERVIEW QUESTIONS */}
      {activeSubTab === 'question_bank' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">Select Job Role:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-medium text-slate-800"
              >
                <option value="Software Developer">Software Developer</option>
                <option value="Cybersecurity">Cybersecurity</option>
                <option value="Data Analyst">Data Analyst</option>
                <option value="HR/Management">HR/Management</option>
              </select>
            </div>

            <select
              value={roundFilter}
              onChange={(e) => setRoundFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700"
            >
              <option value="all">All Rounds</option>
              <option value="Technical">Technical</option>
              <option value="Coding">Coding</option>
              <option value="Project">Project</option>
              <option value="HR">HR / Behavioral</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {interviewQuestions.map((q) => (
              <div
                key={q.id}
                className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs hover:border-slate-300 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700">
                      {q.role}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">· {q.category}</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    {q.round} Round
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-900 leading-relaxed">{q.question}</h4>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-700 space-y-1">
                  <span className="font-semibold text-slate-800 block text-[10px] uppercase tracking-wide">
                    Interviewer Expected Answer Guide:
                  </span>
                  <p className="leading-relaxed">{q.expectedAnswerGuide}</p>
                </div>

                {q.sampleFollowUps && q.sampleFollowUps.length > 0 && (
                  <div className="pt-2 text-[11px] text-slate-600">
                    <span className="font-semibold text-slate-700 block text-[10px] uppercase">
                      Recommended Follow-ups:
                    </span>
                    <ul className="list-disc list-inside mt-0.5 space-y-0.5 text-slate-600">
                      {q.sampleFollowUps.map((fu, idx) => (
                        <li key={idx}>{fu}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: ROLE QUESTION SET GENERATOR */}
      {activeSubTab === 'generator' && (
        <div className="space-y-5">
          <div className="p-5 bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-900 rounded-2xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                Interview Panel Preparation
              </span>
              <h3 className="text-lg font-bold text-white mt-0.5">
                Generate Structured Interview Evaluation Set
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Automatically assemble balanced question sets across Technical, Project, Concurrency, and Behavioral rubrics
              </p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={genRole}
                onChange={(e: any) => setGenRole(e.target.value)}
                className="bg-slate-800 text-white border border-slate-700 text-xs px-3 py-2 rounded-xl outline-none"
              >
                <option value="Software Developer">Software Developer</option>
                <option value="Cybersecurity">Cybersecurity</option>
                <option value="Data Analyst">Data Analyst</option>
                <option value="HR/Management">HR/Management</option>
              </select>

              <button
                onClick={handleGenerateQuestions}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Assemble Set
              </button>
            </div>
          </div>

          {generatedSet && (
            <div className="space-y-4">
              {/* Technical Questions Section */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-600" />
                  Technical & Coding Questions (5–10 items)
                </h4>
                <div className="space-y-3">
                  {generatedSet.technicalQuestions?.map((q: any, i: number) => (
                    <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                      <div className="font-semibold text-slate-900">
                        {i + 1}. {q.question}
                      </div>
                      <p className="text-[11px] text-slate-600">{q.expectedAnswerGuide}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Project & Behavioral */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    Project & Architecture Deep-Dive (2–5 items)
                  </h4>
                  <div className="space-y-2">
                    {generatedSet.projectQuestions?.map((q: any, i: number) => (
                      <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                        <div className="font-semibold text-slate-900">{q.question}</div>
                        <p className="text-[11px] text-slate-600">{q.expectedAnswerGuide}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-600" />
                    Behavioral & Culture Fit (3–5 items)
                  </h4>
                  <div className="space-y-2">
                    {generatedSet.behavioralQuestions?.map((q: any, i: number) => (
                      <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                        <div className="font-semibold text-slate-900">{q.question}</div>
                        <p className="text-[11px] text-slate-600">{q.expectedAnswerGuide}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Interviewer Candidate Evaluation Modal (Requirement #25) */}
      {evaluatingInterview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Candidate Evaluation Rubric: {evaluatingInterview.candidateName}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Round: {evaluatingInterview.round} | Company: {evaluatingInterview.companyName} | Confidential Evaluation Form
                </p>
              </div>
              <button onClick={() => setEvaluatingInterview(null)} className="p-1.5 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEvaluationSubmit} className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
              <span className="font-bold text-slate-800 text-xs block uppercase tracking-wider">
                Category Scorecards (Out of 10):
              </span>

              <div className="grid grid-cols-2 gap-3.5">
                {[
                  { key: 'technicalKnowledgeScore', label: 'Technical Knowledge' },
                  { key: 'problemSolvingScore', label: 'Problem Solving' },
                  { key: 'communicationScore', label: 'Communication' },
                  { key: 'projectKnowledgeScore', label: 'Project Knowledge' },
                  { key: 'roleSpecificScore', label: 'Role-Specific Skills' },
                  { key: 'teamworkScore', label: 'Teamwork' },
                  { key: 'overallPerformanceScore', label: 'Overall Performance' },
                ].map((item) => (
                  <div key={item.key} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-800">{item.label}</span>
                      <span className="font-bold text-indigo-600 text-sm">
                        {(evalData as any)[item.key] || 8}/10
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="0.5"
                      value={(evalData as any)[item.key] || 8}
                      onChange={(e) => setEvalData({ ...evalData, [item.key]: parseFloat(e.target.value) })}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                  </div>
                ))}
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-2 gap-3.5 pt-1">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Strengths Observed</label>
                  <textarea
                    rows={2}
                    value={evalData.strengths || ''}
                    onChange={(e) => setEvalData({ ...evalData, strengths: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                    placeholder="Key technical capabilities..."
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Areas for Development</label>
                  <textarea
                    rows={2}
                    value={evalData.weaknesses || ''}
                    onChange={(e) => setEvalData({ ...evalData, weaknesses: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                    placeholder="Identified gaps..."
                  />
                </div>
              </div>

              {/* Recommendation */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1.5">
                  Interviewer Recommendation Decision:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['Strongly Recommended', 'Recommended', 'Hold', 'Not Recommended'].map((rec) => {
                    const isSelected = evalData.recommendation === rec;
                    return (
                      <button
                        type="button"
                        key={rec}
                        onClick={() => setEvalData({ ...evalData, recommendation: rec as any })}
                        className={`py-2 px-2 rounded-xl text-[11px] font-semibold border transition-all text-center ${
                          isSelected
                            ? rec.includes('Recommended')
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : rec === 'Hold'
                              ? 'bg-amber-500 text-white border-amber-500'
                              : 'bg-rose-600 text-white border-rose-600'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {rec}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Comments */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Interviewer Comprehensive Comments</label>
                <textarea
                  rows={2}
                  value={evalData.comments || ''}
                  onChange={(e) => setEvalData({ ...evalData, comments: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                  placeholder="Summary for recruitment panel and final selection scoring..."
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEvaluatingInterview(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 shadow-xs"
                >
                  Save Rubric Evaluation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Interview Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <h3 className="font-semibold text-slate-900 text-base">Schedule Candidate Interview</h3>
              <button onClick={() => setIsScheduleModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Candidate</label>
                  <select
                    value={newInterviewData.candidateId || ''}
                    onChange={(e) => setNewInterviewData({ ...newInterviewData, candidateId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.studentId}, {s.branch})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Placement Drive</label>
                  <select
                    value={newInterviewData.driveId || ''}
                    onChange={(e) => setNewInterviewData({ ...newInterviewData, driveId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                  >
                    {drives.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.companyName} — {d.jobRole}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3.5">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Round</label>
                  <select
                    value={newInterviewData.round || 'Technical'}
                    onChange={(e: any) => setNewInterviewData({ ...newInterviewData, round: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                  >
                    <option value="Technical">Technical</option>
                    <option value="Coding">Coding</option>
                    <option value="Project">Project</option>
                    <option value="Managerial">Managerial</option>
                    <option value="HR">HR</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={newInterviewData.date || ''}
                    onChange={(e) => setNewInterviewData({ ...newInterviewData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Time</label>
                  <input
                    type="time"
                    required
                    value={newInterviewData.time || '11:00'}
                    onChange={(e) => setNewInterviewData({ ...newInterviewData, time: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Interviewer Name / Lead</label>
                  <input
                    type="text"
                    required
                    value={newInterviewData.interviewerName || ''}
                    onChange={(e) => setNewInterviewData({ ...newInterviewData, interviewerName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                    placeholder="e.g. S. Deshmukh (Lead Architect)"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Meeting Link / Room</label>
                  <input
                    type="text"
                    value={newInterviewData.meetingLink || ''}
                    onChange={(e) => setNewInterviewData({ ...newInterviewData, meetingLink: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                    placeholder="https://meet.google.com/..."
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 shadow-xs"
                >
                  Confirm & Send Invites
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Contextual Interview Question Generator Modal */}
      {isAiQuestionModalOpen && aiSelectedCandidate && aiSelectedDrive && (
        <AiInterviewQuestionModal
          isOpen={isAiQuestionModalOpen}
          onClose={() => setIsAiQuestionModalOpen(false)}
          candidate={aiSelectedCandidate}
          drive={aiSelectedDrive}
          onSaveQuestionsToPlan={(selectedQuestions) => {
            alert(`Saved ${selectedQuestions.length} contextual AI questions to ${aiSelectedCandidate.name}'s interview evaluation plan.`);
          }}
        />
      )}
    </div>
  );
};
