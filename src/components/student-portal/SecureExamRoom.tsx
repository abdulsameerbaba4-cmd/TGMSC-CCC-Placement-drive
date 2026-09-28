import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api.ts';
import { Question } from '../../types/index.ts';
import {
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Maximize,
  HelpCircle,
  X,
  FileCheck,
  Check,
} from 'lucide-react';

interface Props {
  testId: string;
  studentInfo?: any;
  onExit: () => void;
}

export const SecureExamRoom: React.FC<Props> = ({ testId, studentInfo, onExit }) => {
  // Exam phases: 'notice' | 'exam' | 'submitted_normal' | 'submitted_auto'
  const [phase, setPhase] = useState<'notice' | 'exam' | 'submitted_normal' | 'submitted_auto'>('notice');
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [testMeta, setTestMeta] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number[]>>({});
  const [secondsRemaining, setSecondsRemaining] = useState(1500); // 25 mins default
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Proctoring Ref tracking to prevent duplicate auto-submits
  const autoSubmittedRef = useRef(false);
  const answersRef = useRef(selectedAnswers);
  answersRef.current = selectedAnswers;
  const attemptIdRef = useRef(attemptId);
  attemptIdRef.current = attemptId;

  // Format answers for submission
  const formatAnswersPayload = () => {
    return questions.map((q) => ({
      questionId: q.id,
      selectedOptions: answersRef.current[q.id] || [],
    }));
  };

  // Auto-submit trigger when security event occurs
  const triggerAutoSubmit = async (eventType: string, details: string, browserSource: string) => {
    if (autoSubmittedRef.current || !attemptIdRef.current) return;
    autoSubmittedRef.current = true;
    setIsSubmitting(true);

    try {
      await api.autoSubmitExam({
        attemptId: attemptIdRef.current,
        answers: formatAnswersPayload(),
        eventType,
        details,
        browserSource,
      });
      setPhase('submitted_auto');
    } catch (e) {
      console.error('Failed auto-submitting exam', e);
      setPhase('submitted_auto');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Start exam session
  const handleStartExam = async () => {
    try {
      setErrorMessage(null);
      const res = await api.startExam(testId, studentInfo);
      setAttemptId(res.attemptId);
      setTestMeta(res.test);
      setQuestions(res.questions);
      setSecondsRemaining((res.test.durationMinutes || 25) * 60);

      // Try entering fullscreen if supported
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } catch (err) {
        console.warn('Fullscreen request bypassed by browser policy', err);
      }

      setPhase('exam');
    } catch (e: any) {
      console.error('Failed to start exam', e);
      setErrorMessage(e.message || 'Unable to start examination. Check attempt restrictions.');
    }
  };

  // Normal submission by candidate
  const handleNormalSubmit = async () => {
    if (autoSubmittedRef.current || !attemptId) return;
    if (!confirm('Are you sure you wish to finalize and submit your assessment? You cannot change your responses once submitted.')) {
      return;
    }

    try {
      setIsSubmitting(true);
      await api.submitExam(attemptId, formatAnswersPayload());
      setPhase('submitted_normal');
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    } catch (e) {
      console.error('Error submitting exam', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Proctoring listeners active ONLY during 'exam' phase
  useEffect(() => {
    if (phase !== 'exam') return;

    // 1. Page Visibility API listener
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        triggerAutoSubmit(
          'tab_switched',
          'Page Visibility API detected document.visibilityState changed to "hidden". Candidate navigated away or minimized tab.',
          'Page Visibility API'
        );
      }
    };

    // 2. Focus / Blur window listener
    const handleWindowBlur = () => {
      triggerAutoSubmit(
        'focus_lost',
        'Window focus event lost (blur detected). Candidate activated an external application or window.',
        'Focus/Blur Event'
      );
    };

    // 3. Fullscreen exit listener
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        triggerAutoSubmit(
          'fullscreen_exited',
          'Candidate exited secure full-screen assessment view.',
          'Fullscreen API'
        );
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [phase]);

  // Countdown timer
  useEffect(() => {
    if (phase !== 'exam') return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleNormalSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase]);

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentQ = questions[currentIdx];

  // PHASE 1: PRE-EXAM SECURITY NOTICE (Requirement #14)
  if (phase === 'notice') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
        <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">
                Secure Examination Notice & Policy
              </h3>
            </div>
            <button onClick={onExit} className="p-1.5 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-4 text-xs">
            {/* Required Warning Text (Requirement #14) */}
            <div className="p-4 bg-rose-50 border-2 border-rose-200 rounded-2xl text-rose-950 space-y-2 leading-relaxed">
              <span className="font-bold text-sm block text-rose-800">
                Notice: Strict Proctoring Rules Active
              </span>
              <p className="font-medium text-xs">
                «Do not switch tabs, windows, or leave the examination screen. If you leave the examination page, your assessment may be automatically submitted and the incident will be reported to the Placement Administrator.»
              </p>
            </div>

            {/* Browser Mechanics Notice (Requirement #38) */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 space-y-1.5 text-[11px] leading-relaxed">
              <span className="font-semibold text-slate-800 block">Proctoring Enforcement Details:</span>
              <p>
                This test session uses browser-supported telemetry: <strong>Page Visibility API</strong>, <strong>Focus/Blur listeners</strong>, and <strong>Full-Screen mode</strong>.
              </p>
              <p className="text-slate-500">
                Note: In compliance with standard web browser security, only in-browser tab navigation, minimizing, and focus changes are detected. Please close all messaging and background tabs before beginning.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs">
                {errorMessage}
              </div>
            )}
          </div>

          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              onClick={onExit}
              className="px-4 py-2 rounded-xl border border-slate-300 bg-white font-medium text-slate-700 hover:bg-slate-100"
            >
              Cancel & Exit
            </button>
            <button
              onClick={handleStartExam}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-2 shadow-xs transition-colors"
            >
              <Maximize className="w-4 h-4" />
              I Understand — Start Secure Assessment
            </button>
          </div>
        </div>
      </div>
    );
  }

  // PHASE 3: SUBMITTED NORMALLY (Requirement #16: STRICT NO-SCORE NOTICE)
  if (phase === 'submitted_normal') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 p-8 text-center space-y-4 animate-in zoom-in-95 duration-150">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center shadow-xs">
            <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
          </div>

          <h3 className="text-lg font-bold text-slate-900">
            Assessment Submitted Successfully
          </h3>

          {/* EXACT REQUIRED TEXT (Requirement #16) */}
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Your assessment has been submitted. Results will be communicated by the Placement Team.
          </p>

          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={onExit}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs shadow-xs"
            >
              Return to Student Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // PHASE 4: AUTO-SUBMITTED ON DETECTED WINDOW CHANGE (Requirement #15 & #16)
  if (phase === 'submitted_auto') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border-2 border-rose-300 p-8 text-center space-y-4 animate-in zoom-in-95 duration-150">
          <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-700 mx-auto flex items-center justify-center shadow-xs animate-pulse">
            <AlertTriangle className="w-8 h-8 stroke-[2.5]" />
          </div>

          <h3 className="text-lg font-bold text-slate-900">
            Assessment Automatically Submitted
          </h3>

          {/* EXACT REQUIRED TEXT (Requirement #16) */}
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Your assessment was automatically submitted because the examination window was changed. Please contact the Placement Team if you believe this occurred by mistake.
          </p>

          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-800">
            Security incident ID recorded in official placement registry and flagged for officer review.
          </div>

          <div className="pt-2">
            <button
              onClick={onExit}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs shadow-xs"
            >
              Acknowledge & Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // PHASE 2: ACTIVE PROCTORED EXAM INTERFACE
  return (
    <div className="fixed inset-0 z-50 bg-slate-900 text-slate-100 flex flex-col select-none">
      {/* Top Proctored Exam Bar */}
      <header className="h-16 bg-slate-950 border-b border-slate-800 px-6 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              {testMeta?.title || 'Aptitude Assessment'}
            </h3>
            <span className="text-[10px] text-rose-400 font-semibold tracking-wider uppercase">
              Secure Proctoring Active · Window/Tab Changes Monitored
            </span>
          </div>
        </div>

        {/* Center Countdown Clock */}
        <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-900 rounded-xl border border-slate-700 font-mono text-base font-bold text-indigo-400">
          <Clock className="w-4 h-4 text-slate-400" />
          <span>{formatTimer(secondsRemaining)}</span>
        </div>

        {/* Right Submit Button */}
        <button
          onClick={handleNormalSubmit}
          disabled={isSubmitting}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
        >
          <FileCheck className="w-4 h-4" />
          Final Submit Exam
        </button>
      </header>

      {/* Main Examination Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Question Content Area */}
        <div className="flex-1 bg-slate-900 p-6 sm:p-8 overflow-y-auto flex flex-col justify-between">
          {currentQ ? (
            <div className="max-w-3xl mx-auto w-full space-y-6">
              {/* Question Meta */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-indigo-400">
                    Question {currentIdx + 1} of {questions.length}
                  </span>
                  <span className="text-xs text-slate-500">· {currentQ.category}</span>
                </div>
                <span className="text-xs text-slate-400">
                  +{currentQ.marks} Marks / -{currentQ.negativeMarks} Neg.
                </span>
              </div>

              {/* Question Text */}
              <p className="text-sm sm:text-base font-medium text-slate-100 leading-relaxed">
                {currentQ.text}
              </p>

              {/* Code Snippet if applicable */}
              {currentQ.codeSnippet && (
                <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed">
                  <code>{currentQ.codeSnippet}</code>
                </pre>
              )}

              {/* Options */}
              <div className="space-y-3 pt-2">
                {currentQ.options.map((opt, oIdx) => {
                  const isSelected = selectedAnswers[currentQ.id]?.includes(oIdx);
                  return (
                    <div
                      key={oIdx}
                      onClick={() => {
                        setSelectedAnswers((prev) => ({
                          ...prev,
                          [currentQ.id]: [oIdx],
                        }));
                      }}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-3.5 ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-950/60 ring-1 ring-indigo-500 text-white'
                          : 'border-slate-800 bg-slate-950/40 hover:bg-slate-800/60 text-slate-300'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'border border-slate-700 text-slate-400'
                        }`}
                      >
                        {String.fromCharCode(65 + oIdx)}
                      </div>
                      <span className="text-xs sm:text-sm font-medium leading-relaxed">
                        {opt}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-500 my-auto">Loading questions...</div>
          )}

          {/* Bottom Navigation Controls */}
          <div className="max-w-3xl mx-auto w-full pt-6 border-t border-slate-800/80 flex items-center justify-between">
            <button
              onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
              disabled={currentIdx === 0}
              className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 font-medium text-xs hover:bg-slate-800 disabled:opacity-40 flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <button
              onClick={() => {
                setSelectedAnswers((prev) => {
                  const next = { ...prev };
                  delete next[currentQ.id];
                  return next;
                });
              }}
              className="text-xs text-slate-400 hover:text-slate-200 underline"
            >
              Clear Choice
            </button>

            <button
              onClick={() => setCurrentIdx((prev) => Math.min(questions.length - 1, prev + 1))}
              disabled={currentIdx === questions.length - 1}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs disabled:opacity-40 flex items-center gap-1.5"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Question Palette Grid */}
        <aside className="w-64 bg-slate-950 border-l border-slate-800 p-5 flex flex-col justify-between shrink-0 hidden md:flex">
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-3">
              Question Navigator
            </h4>

            <div className="grid grid-cols-4 gap-2">
              {questions.map((q, i) => {
                const isAnswered = (selectedAnswers[q.id]?.length || 0) > 0;
                const isCurrent = i === currentIdx;

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIdx(i)}
                    className={`h-9 rounded-lg text-xs font-bold transition-all ${
                      isCurrent
                        ? 'border-2 border-indigo-400 bg-indigo-600 text-white'
                        : isAnswered
                        ? 'bg-emerald-600/80 text-white'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-[11px] space-y-1.5 text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded bg-emerald-600" />
              <span>Answered ({Object.keys(selectedAnswers).filter((k) => selectedAnswers[k]?.length > 0).length})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded bg-slate-800" />
              <span>Unattempted ({questions.length - Object.keys(selectedAnswers).filter((k) => selectedAnswers[k]?.length > 0).length})</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
