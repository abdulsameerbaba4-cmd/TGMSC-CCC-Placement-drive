import React, { useState } from 'react';
import { api } from '../../services/api.ts';
import { PlacementDrive, Student } from '../../types/index.ts';
import {
  Sparkles,
  Check,
  Plus,
  Edit2,
  Trash2,
  X,
  RefreshCw,
  BookOpen,
  User,
  Briefcase,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface QuestionItem {
  id: string;
  question: string;
  category: string;
  type: 'technical' | 'project' | 'situational';
  expectedAnswerGuide: string;
  selected: boolean;
  followUps?: string[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  candidate: Student;
  drive: PlacementDrive;
  onSaveQuestionsToPlan: (questions: QuestionItem[]) => void;
}

export const AiInterviewQuestionModal: React.FC<Props> = ({
  isOpen,
  onClose,
  candidate,
  drive,
  onSaveQuestionsToPlan,
}) => {
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newQuestionCategory, setNewQuestionCategory] = useState('Technical');
  const [error, setError] = useState<string | null>(null);
  const [interviewRound, setInterviewRound] = useState('Technical');

  if (!isOpen) return null;

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.generateAiInterviewQuestions({
        candidateName: candidate.name,
        candidateSkills: candidate.skills,
        candidateProjects: candidate.projects?.map((p) => `${p.title}: ${p.description}`) || [],
        jobRole: drive.jobRole,
        jobDescription: drive.jobDescription,
        companyName: drive.companyName,
        round: interviewRound,
      });

      const generated: QuestionItem[] = [];

      (res.data.technicalQuestions || []).forEach((q: any, i: number) => {
        generated.push({
          id: `ai_t_${i}_${Date.now()}`,
          question: q.question,
          category: q.category || 'Core Technical',
          type: 'technical',
          expectedAnswerGuide: q.expectedAnswerGuide || '',
          followUps: q.followUps || [],
          selected: true,
        });
      });

      (res.data.projectQuestions || []).forEach((q: any, i: number) => {
        generated.push({
          id: `ai_p_${i}_${Date.now()}`,
          question: q.question,
          category: `Project (${q.projectReference || 'Architecture'})`,
          type: 'project',
          expectedAnswerGuide: q.expectedAnswerGuide || '',
          followUps: q.followUps || [],
          selected: true,
        });
      });

      (res.data.situationalQuestions || []).forEach((q: any, i: number) => {
        generated.push({
          id: `ai_s_${i}_${Date.now()}`,
          question: q.question,
          category: q.category || 'Situational / Behavioral',
          type: 'situational',
          expectedAnswerGuide: q.expectedAnswerGuide || '',
          followUps: q.followUps || [],
          selected: true,
        });
      });

      setQuestions(generated);
    } catch (e: any) {
      console.error('Failed generating interview questions', e);
      setError(e.message || 'Error generating questions with AI.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, selected: !q.selected } : q))
    );
  };

  const handleDelete = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const handleStartEdit = (q: QuestionItem) => {
    setEditingId(q.id);
    setEditText(q.question);
  };

  const handleSaveEdit = (id: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, question: editText } : q))
    );
    setEditingId(null);
  };

  const handleAddNewQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;

    setQuestions((prev) => [
      ...prev,
      {
        id: `custom_${Date.now()}`,
        question: newQuestionText.trim(),
        category: newQuestionCategory,
        type: newQuestionCategory === 'Technical' ? 'technical' : 'situational',
        expectedAnswerGuide: 'Custom interviewer evaluation criteria.',
        selected: true,
      },
    ]);
    setNewQuestionText('');
  };

  const handleConfirmPlan = () => {
    const selected = questions.filter((q) => q.selected);
    onSaveQuestionsToPlan(selected);
    onClose();
  };

  const selectedCount = questions.filter((q) => q.selected).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50/80 to-blue-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                AI-Assisted Contextual Interview Question Generator
                <span className="text-[10px] font-semibold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Gemini 2.5 Flash
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Generates tailored technical, project-based, and behavioral questions synthesized from candidate resume & job description
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Candidate Context Pill Banner */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
              <User className="w-4 h-4 text-indigo-600" />
              <span>{candidate.name}</span>
              <span className="text-slate-400 font-normal">({candidate.branch}, CGPA {candidate.cgpa})</span>
            </div>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
              <Briefcase className="w-4 h-4 text-emerald-600" />
              <span>{drive.companyName}</span>
              <span className="text-slate-400 font-normal">({drive.jobRole})</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={interviewRound}
              onChange={(e) => setInterviewRound(e.target.value)}
              className="bg-white border border-slate-300 text-slate-700 text-xs px-2.5 py-1 rounded-lg outline-none font-medium"
            >
              <option value="Technical">Technical Round</option>
              <option value="Coding">Coding Round</option>
              <option value="Project">Project Architecture Round</option>
              <option value="Managerial">Managerial Round</option>
              <option value="HR">HR / Culture Fit</option>
            </select>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  {questions.length > 0 ? 'Regenerate Set' : 'Generate with AI'}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {questions.length === 0 && !loading && (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <BookOpen className="w-10 h-10 mx-auto text-slate-300" />
              <p className="font-semibold text-slate-700">No questions generated yet.</p>
              <p className="text-[11px] text-slate-500 max-w-md mx-auto leading-relaxed">
                Click <strong>"Generate with AI"</strong> above. Gemini will synthesize {candidate.name}'s resume skills ({candidate.skills.slice(0, 3).join(', ')}) with {drive.companyName}'s {drive.jobRole} requirements to produce structured questions.
              </p>
            </div>
          )}

          {/* Question List */}
          {questions.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs pb-1">
                <span className="font-bold text-slate-900">
                  Generated Questions ({selectedCount} of {questions.length} selected for interview panel)
                </span>
                <span className="text-slate-500 text-[11px]">
                  Select, modify or add custom questions below
                </span>
              </div>

              {questions.map((q, idx) => (
                <div
                  key={q.id}
                  className={`p-4 rounded-xl border transition-all ${
                    q.selected
                      ? 'border-indigo-200 bg-white shadow-xs'
                      : 'border-slate-200 bg-slate-50/60 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={q.selected}
                        onChange={() => toggleSelect(q.id)}
                        className="w-4 h-4 text-indigo-600 rounded cursor-pointer mt-0.5"
                      />
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                        {q.category}
                      </span>
                      <span className="text-[10px] uppercase font-semibold text-indigo-600">
                        {q.type}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleStartEdit(q)}
                        className="p-1 text-slate-400 hover:text-slate-700 rounded"
                        title="Edit question text"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(q.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded"
                        title="Delete question"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {editingId === q.id ? (
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="flex-1 px-3 py-1.5 border border-indigo-300 rounded-lg text-xs outline-none"
                      />
                      <button
                        onClick={() => handleSaveEdit(q.id)}
                        className="px-2.5 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <p className="mt-2 font-semibold text-slate-900 leading-relaxed text-xs">
                      {q.question}
                    </p>
                  )}

                  {/* Expected Answer Guide */}
                  {q.expectedAnswerGuide && (
                    <div className="mt-2.5 p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-[11px] text-slate-600 leading-relaxed">
                      <strong className="text-slate-800 font-semibold">Evaluation Rubric: </strong>
                      {q.expectedAnswerGuide}
                    </div>
                  )}

                  {/* Follow ups */}
                  {q.followUps && q.followUps.length > 0 && (
                    <div className="mt-2 text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-700">Follow-up Probes:</span>
                      <span className="ml-1 text-slate-600">{q.followUps.join(' · ')}</span>
                    </div>
                  )}
                </div>
              ))}

              {/* Add Custom Question Row */}
              <form
                onSubmit={handleAddNewQuestion}
                className="p-3.5 bg-slate-50 rounded-xl border border-dashed border-slate-300 flex items-center gap-2"
              >
                <select
                  value={newQuestionCategory}
                  onChange={(e) => setNewQuestionCategory(e.target.value)}
                  className="bg-white border border-slate-300 px-2 py-1.5 rounded-lg text-xs font-medium text-slate-700"
                >
                  <option value="Technical">Technical</option>
                  <option value="System Architecture">Architecture</option>
                  <option value="Project Probing">Project</option>
                  <option value="Situational">Situational</option>
                  <option value="HR / Cultural">Behavioral</option>
                </select>

                <input
                  type="text"
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  placeholder="Add custom question to this interview plan..."
                  className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs outline-none focus:border-indigo-500"
                />

                <button
                  type="submit"
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Selected questions will be attached to the interviewer's score evaluation form.
          </span>
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmPlan}
              disabled={selectedCount === 0}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-1.5 shadow-xs disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              Save {selectedCount} Questions to Interview Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
