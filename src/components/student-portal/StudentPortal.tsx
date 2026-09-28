import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.ts';
import {
  Student,
  PlacementDrive,
  Application,
  AptitudeTest,
  Interview,
  User,
} from '../../types/index.ts';
import { SecureExamRoom } from './SecureExamRoom.tsx';
import { AiResumeParserModal } from '../students/AiResumeParserModal.tsx';
import {
  GraduationCap,
  Briefcase,
  FileCheck,
  CalendarCheck,
  UserCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Video,
  MapPin,
  AlertTriangle,
  FileText,
  Mail,
  Phone,
  ShieldCheck,
  Lock,
} from 'lucide-react';

interface Props {
  user: User;
  student: Student | null;
  activeSubTab?: string;
  onRefreshUser: () => void;
}

export const StudentPortal: React.FC<Props> = ({ user, student, activeSubTab = 'student_dashboard', onRefreshUser }) => {
  const [tab, setTab] = useState(activeSubTab);
  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [tests, setTests] = useState<AptitudeTest[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [myAttempts, setMyAttempts] = useState<any[]>([]);
  const [eligibilityMap, setEligibilityMap] = useState<Record<string, { isEligible: boolean; reasons: string[] }>>({});
  const [loading, setLoading] = useState(true);

  // Active secure exam room launcher
  const [activeExamTestId, setActiveExamTestId] = useState<string | null>(null);

  // AI Resume Parser modal
  const [isAiResumeOpen, setIsAiResumeOpen] = useState(false);

  useEffect(() => {
    setTab(activeSubTab);
  }, [activeSubTab]);

  useEffect(() => {
    fetchStudentData();
  }, [user.id]);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const [drivesData, appsData, testsData, interviewsData, attemptsData] = await Promise.all([
        api.getDrives(),
        api.getApplications(),
        api.getTests(),
        api.getInterviews(),
        api.getMyAttempts(),
      ]);

      setDrives(drivesData);
      setApplications(appsData);
      setTests(testsData);
      setInterviews(interviewsData);
      setMyAttempts(attemptsData);

      // Run automatic eligibility check for each drive for this student
      if (student) {
        const map: Record<string, { isEligible: boolean; reasons: string[] }> = {};
        for (const d of drivesData) {
          try {
            const check = await api.checkEligibility(d.id, student.studentId);
            map[d.id] = check;
          } catch (e) {
            console.error(`Eligibility error for ${d.id}`, e);
          }
        }
        setEligibilityMap(map);
      }
    } catch (e) {
      console.error('Failed loading student portal data', e);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (driveId: string) => {
    try {
      await api.applyForDrive(driveId, student?.studentId);
      alert('Application submitted successfully!');
      fetchStudentData();
      onRefreshUser();
    } catch (e: any) {
      alert(e.message || 'Application failed');
    }
  };

  if (activeExamTestId) {
    return (
      <SecureExamRoom
        testId={activeExamTestId}
        onExit={() => {
          setActiveExamTestId(null);
          fetchStudentData();
        }}
      />
    );
  }

  const eligibleDrivesCount = Object.values(eligibilityMap).filter((e) => e.isEligible).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Student Welcome & Placement Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl shadow-sm border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xl flex items-center justify-center border border-white/20 shrink-0">
            {student?.name?.charAt(0) || user.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-white">{student?.name || user.name}</h2>
              <span className="text-[10px] font-semibold bg-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded border border-indigo-400/30 uppercase tracking-wider">
                {student?.studentId || 'STUDENT'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              {student?.branch} · Class of {student?.graduationYear} · CGPA: <strong>{student?.cgpa.toFixed(2)}</strong> ({student?.backlogs || 0} Backlogs)
            </p>
          </div>
        </div>

        {/* Current Placement Status Badge */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-xs border border-white/10 text-right">
            <span className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider block">Placement Status</span>
            <span className="text-sm font-bold text-white">
              {student?.placementStatus || 'Not Placed'}
            </span>
            {student?.placedCompany && (
              <span className="text-[11px] text-emerald-400 block font-semibold">
                Offer: {student.placedCompany} (₹{student.salaryPackageLpa} LPA)
              </span>
            )}
          </div>

          <button
            onClick={() => setIsAiResumeOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-sm shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            Parse Resume with AI
          </button>
        </div>
      </div>

      {/* Internal Navigation Tabs for Student Portal */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs overflow-x-auto pb-1">
        {[
          { id: 'student_dashboard', label: 'My Dashboard', icon: GraduationCap },
          { id: 'student_drives', label: `Eligible Drives (${eligibleDrivesCount})`, icon: Briefcase },
          { id: 'student_applications', label: `My Applications (${applications.length})`, icon: FileCheck },
          { id: 'student_tests', label: `Assessments (${tests.length})`, icon: Clock },
          { id: 'student_interviews', label: `My Interviews (${interviews.length})`, icon: CalendarCheck },
          { id: 'student_profile', label: 'Profile & Resume', icon: UserCheck },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = tab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`pb-3 px-3 font-semibold transition-colors flex items-center gap-2 border-b-2 whitespace-nowrap ${
                isActive
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: STUDENT DASHBOARD */}
      {tab === 'student_dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Eligible Drives</span>
              <div className="text-2xl font-bold text-indigo-600 mt-1">{eligibleDrivesCount}</div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Ready for application</span>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Applied Drives</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">{applications.length}</div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Submissions verified</span>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Assessments</span>
              <div className="text-2xl font-bold text-purple-600 mt-1">{tests.length}</div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Online tests scheduled</span>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Interviews</span>
              <div className="text-2xl font-bold text-emerald-600 mt-1">{interviews.length}</div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Rounds scheduled</span>
            </div>
          </div>

          {/* Quick Action: Top Eligible Drives */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Recommended Active Drives</h3>
              <button
                onClick={() => setTab('student_drives')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                View All Drives ({drives.length})
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {drives.slice(0, 2).map((d) => {
                const el = eligibilityMap[d.id];
                const hasApplied = applications.some((a) => a.driveId === d.id);

                return (
                  <div key={d.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <img src={d.companyLogo} alt={d.companyName} className="w-10 h-10 rounded-xl object-cover" />
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{d.jobRole}</h4>
                          <span className="text-xs text-slate-600 font-medium">{d.companyName}</span>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
                        <span>Package: <strong>{d.salary}</strong></span>
                        <span>Deadline: {d.applicationDeadline}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                      {el?.isEligible ? (
                        <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Eligible
                        </span>
                      ) : (
                        <span className="text-[11px] text-rose-600 font-semibold flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" />
                          Not Eligible
                        </span>
                      )}

                      {hasApplied ? (
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold">
                          Applied
                        </span>
                      ) : (
                        <button
                          onClick={() => handleApply(d.id)}
                          disabled={!el?.isEligible}
                          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-lg text-xs font-semibold shadow-xs"
                        >
                          Apply Now
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ELIGIBLE DRIVES (WITH LIVE AUTOMATIC REASON - Requirement #9) */}
      {tab === 'student_drives' && (
        <div className="space-y-4">
          <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-2xl text-xs text-indigo-950 flex items-center justify-between">
            <span>
              Real-time Automated Eligibility Check: The system continuously evaluates your CGPA ({student?.cgpa.toFixed(2)}), branch ({student?.branch}), and backlogs ({student?.backlogs}) against each recruiter's policy.
            </span>
          </div>

          <div className="space-y-4">
            {drives.map((d) => {
              const el = eligibilityMap[d.id];
              const isEligible = el?.isEligible;
              const hasApplied = applications.some((a) => a.driveId === d.id);

              return (
                <div
                  key={d.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
                >
                  <div className="space-y-2 max-w-xl">
                    <div className="flex items-center gap-3">
                      <img src={d.companyLogo} alt={d.companyName} className="w-12 h-12 rounded-xl object-cover border border-slate-200" />
                      <div>
                        <h4 className="font-bold text-slate-900 text-base">{d.jobRole}</h4>
                        <div className="text-xs font-semibold text-slate-600">{d.companyName} · {d.jobLocation} ({d.workMode})</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                      <span>CTC: <strong className="text-slate-900">{d.salary}</strong></span>
                      <span>·</span>
                      <span>Vacancies: <strong>{d.vacancies}</strong></span>
                      <span>·</span>
                      <span>Application Deadline: <strong>{d.applicationDeadline}</strong></span>
                    </div>

                    {/* Eligibility Display with exact reason (Requirement #9) */}
                    <div className="pt-2">
                      {isEligible ? (
                        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 text-xs font-medium flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Eligible — You meet all CGPA, branch, and backlog criteria for this placement drive.</span>
                        </div>
                      ) : (
                        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-950 text-xs leading-relaxed space-y-1">
                          <div className="font-bold flex items-center gap-1.5 text-rose-800">
                            <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                            Not Eligible
                          </div>
                          {el?.reasons && el.reasons.length > 0 ? (
                            el.reasons.map((r, i) => (
                              <p key={i} className="text-rose-900 font-medium">
                                • {r}
                              </p>
                            ))
                          ) : (
                            <p className="text-rose-900 font-medium">
                              «You are not eligible for this placement drive because the minimum CGPA requirement is {d.minCgpa.toFixed(1)}.»
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Apply Action Button */}
                  <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
                    {hasApplied ? (
                      <span className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Application Submitted
                      </span>
                    ) : (
                      <button
                        onClick={() => handleApply(d.id)}
                        disabled={!isEligible}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-semibold rounded-xl text-xs shadow-xs transition-colors"
                      >
                        Apply for Drive
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: MY APPLICATIONS */}
      {tab === 'student_applications' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
            <h3 className="font-bold text-slate-900 text-sm">Submitted Placement Drive Applications</h3>
            <span className="text-xs text-slate-500">{applications.length} Records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <th className="py-3 px-4">Placement Drive</th>
                  <th className="py-3 px-4">Eligibility Status</th>
                  <th className="py-3 px-4">Current Progress</th>
                  <th className="py-3 px-4 text-right">Applied Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {applications.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-400">
                      You have not applied for any placement drives yet.
                    </td>
                  </tr>
                ) : (
                  applications.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/60">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {app.companyName} — {app.driveRole}
                      </td>
                      <td className="py-3.5 px-4">
                        {app.isEligible ? (
                          <span className="text-emerald-700 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Eligible
                          </span>
                        ) : (
                          <span className="text-rose-600 font-semibold">Ineligible</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {app.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-500 font-mono text-[11px]">
                        {new Date(app.appliedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: ASSESSMENTS & SECURE EXAMS (Requirement #16 & #17) */}
      {tab === 'student_tests' && (
        <div className="space-y-6">
          {/* Active Tests List */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Scheduled Aptitude Examinations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tests.map((test) => {
                const myAttempt = myAttempts.find((a) => a.testId === test.id);
                return (
                  <div key={test.id} className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        {test.companyName}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm mt-1">{test.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Role: {test.jobRole}</p>

                      <div className="grid grid-cols-2 gap-2 mt-4 p-3 bg-slate-50 rounded-xl text-xs text-slate-600">
                        <div>
                          Duration: <strong>{test.durationMinutes} Minutes</strong>
                        </div>
                        <div>
                          Negative Marking: <strong>-{test.negativeMarking}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      {myAttempt ? (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Attempt Completed</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => setActiveExamTestId(test.id)}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs shadow-xs transition-colors flex items-center gap-1.5"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          Start Secure Assessment
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Previous Submissions (STRICTLY NO SCORES DISPLAYED - Requirement #16) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Assessment Submissions Registry</h4>
                <p className="text-[11px] text-slate-500">
                  Official receipt of submitted examination records
                </p>
              </div>
            </div>

            <div className="p-6">
              {myAttempts.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No assessment attempts recorded.</p>
              ) : (
                <div className="space-y-3">
                  {myAttempts.map((att) => (
                    <div
                      key={att.id}
                      className={`p-4 rounded-xl border flex items-center justify-between ${
                        att.submissionType === 'auto_submitted'
                          ? 'border-amber-200 bg-amber-50/40'
                          : 'border-slate-200 bg-slate-50/40'
                      }`}
                    >
                      <div>
                        <h5 className="font-bold text-slate-900 text-xs">{att.testTitle}</h5>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Submitted on {new Date(att.submissionTime).toLocaleString()} · Attempt #{att.attemptNumber}
                        </div>
                        {att.submissionType === 'auto_submitted' && (
                          <div className="mt-1 text-[11px] text-amber-800 font-medium">
                            Note: Assessment was automatically submitted due to examination window focus change.
                          </div>
                        )}
                      </div>

                      <div className="text-right">
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-semibold rounded-lg text-xs">
                          Submitted for Placement Team Review
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: MY INTERVIEWS */}
      {tab === 'student_interviews' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <h3 className="font-bold text-slate-900 text-sm">My Scheduled Interview Rounds</h3>
              <span className="text-xs text-slate-500">{interviews.length} Scheduled</span>
            </div>

            <div className="p-6">
              {interviews.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No interviews scheduled at this time.</p>
              ) : (
                <div className="space-y-3">
                  {interviews.map((int) => (
                    <div key={int.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{int.companyName}</span>
                          <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase">
                            {int.round} Round
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {int.date} at {int.time} ({int.durationMinutes} mins)
                          </span>
                          <span>·</span>
                          <span>Panel: {int.interviewerName}</span>
                        </div>
                      </div>

                      <div>
                        {int.interviewType === 'Online' && int.meetingLink ? (
                          <a
                            href={int.meetingLink}
                            target="_blank"
                            rel="noreferrer"
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                          >
                            <Video className="w-4 h-4" />
                            Join Video Call
                          </a>
                        ) : (
                          <div className="text-xs font-medium text-slate-700 flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            {int.location || 'Placement Cell Boardroom'}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: PROFILE & RESUME */}
      {tab === 'student_profile' && student && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6 text-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Academic Registry & Verified Skills</h3>
              <p className="text-xs text-slate-500 mt-0.5">Used by recruiters to filter eligibility and generate contextual interview questions</p>
            </div>
            <button
              onClick={() => setIsAiResumeOpen(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold flex items-center gap-1.5 shadow-xs"
            >
              <Sparkles className="w-4 h-4" />
              Update with AI Resume Parser
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Branch</span>
              <strong className="text-slate-900 text-sm">{student.branch}</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">CGPA</span>
              <strong className="text-indigo-600 text-sm">{student.cgpa.toFixed(2)}</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Backlogs</span>
              <strong className={student.backlogs === 0 ? 'text-emerald-600' : 'text-rose-600'}>
                {student.backlogs} Active
              </strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Graduation Batch</span>
              <strong className="text-slate-900 text-sm">{student.graduationYear}</strong>
            </div>
          </div>

          <div>
            <span className="font-bold text-slate-800 text-xs block mb-2">Technical Competencies</span>
            <div className="flex flex-wrap gap-1.5">
              {student.skills.map((sk, i) => (
                <span key={i} className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-medium">
                  {sk}
                </span>
              ))}
            </div>
          </div>

          {student.projects && student.projects.length > 0 && (
            <div>
              <span className="font-bold text-slate-800 text-xs block mb-2">Featured Engineering Projects</span>
              <div className="space-y-2">
                {student.projects.map((p, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="font-semibold text-slate-900">{p.title}</div>
                    <p className="text-slate-600 text-[11px] mt-1">{p.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* AI Resume Parser Modal */}
      <AiResumeParserModal
        isOpen={isAiResumeOpen}
        onClose={() => setIsAiResumeOpen(false)}
        onApplyParsedData={async (parsedData) => {
          if (!student) return;
          try {
            await api.updateStudent(student.id, parsedData);
            alert('Your student profile was updated with parsed resume data! Eligibility for active drives has been re-verified.');
            fetchStudentData();
            onRefreshUser();
          } catch (e) {
            console.error('Failed applying resume data to profile', e);
          }
        }}
      />
    </div>
  );
};
