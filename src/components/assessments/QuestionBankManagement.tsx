import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.ts';
import { Question, QuestionCategory, QuestionDifficulty } from '../../types/index.ts';
import {
  HelpCircle,
  Plus,
  Search,
  Filter,
  Code2,
  CheckCircle,
  Sparkles,
  BookOpen,
  Edit,
  Trash2,
  X,
  Layers,
  ChevronDown,
} from 'lucide-react';

export const QuestionBankManagement: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Partial<Question>>({});

  useEffect(() => {
    fetchQuestions();
  }, [categoryFilter, difficultyFilter]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const data = await api.getQuestions({
        category: categoryFilter,
        difficulty: difficultyFilter,
        search: search || undefined,
      });
      setQuestions(data);
    } catch (e) {
      console.error('Failed fetching questions', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchQuestions();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingQuestion.id) {
        await api.updateQuestion(editingQuestion.id, editingQuestion);
      } else {
        await api.createQuestion(editingQuestion);
      }
      setIsModalOpen(false);
      setEditingQuestion({});
      fetchQuestions();
    } catch (e) {
      console.error('Failed saving question', e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    try {
      await api.deleteQuestion(id);
      fetchQuestions();
    } catch (e) {
      console.error('Failed deleting question', e);
    }
  };

  const categories: QuestionCategory[] = [
    'Quantitative',
    'Logical Reasoning',
    'Verbal Ability',
    'Data Interpretation',
    'Computer Fundamentals',
    'Programming',
    'Job-Specific',
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-600" />
            Central Aptitude Question Bank
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Curated examination repository spanning Quantitative, Logical, Verbal, DI, OS/DBMS, and DSA
          </p>
        </div>

        <button
          onClick={() => {
            setEditingQuestion({
              category: 'Quantitative',
              subcategory: 'Arithmetic',
              difficulty: 'Medium',
              type: 'MCQ',
              marks: 2,
              negativeMarks: 0.5,
              options: ['Option A', 'Option B', 'Option C', 'Option D'],
              correctAnswers: [0],
            });
            setIsModalOpen(true);
          }}
          className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          Add Question
        </button>
      </div>

      {/* Category Pills & Search */}
      <div className="space-y-3">
        {/* Category horizontal scrolling selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              categoryFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            All Categories ({questions.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                categoryFilter === cat
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search & Difficulty Filter Bar */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search question text, subcategory, keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-indigo-500"
            />
          </form>

          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 outline-none focus:border-indigo-500"
          >
            <option value="all">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-3.5">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading question bank...</div>
        ) : questions.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
            No questions found in this category.
          </div>
        ) : (
          questions.map((q, idx) => (
            <div
              key={q.id}
              className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs hover:border-slate-300 transition-all space-y-3"
            >
              {/* Question Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {q.category}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">· {q.subcategory}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      q.difficulty === 'Easy'
                        ? 'bg-emerald-50 text-emerald-700'
                        : q.difficulty === 'Medium'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {q.difficulty}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-700">
                    +{q.marks} / -{q.negativeMarks} Marks
                  </span>
                  <button
                    onClick={() => {
                      setEditingQuestion(q);
                      setIsModalOpen(true);
                    }}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded"
                    title="Edit"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(q.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Question Text */}
              <p className="text-xs font-medium text-slate-900 leading-relaxed">{q.text}</p>

              {/* Code Snippet if present */}
              {q.codeSnippet && (
                <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl text-[11px] overflow-x-auto font-mono leading-relaxed border border-slate-800">
                  <code>{q.codeSnippet}</code>
                </pre>
              )}

              {/* Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                {q.options.map((opt, oIdx) => {
                  const isCorrect = q.correctAnswers?.includes(oIdx);
                  return (
                    <div
                      key={oIdx}
                      className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                        isCorrect
                          ? 'border-emerald-300 bg-emerald-50/70 text-emerald-950 font-semibold'
                          : 'border-slate-200 bg-slate-50/40 text-slate-700'
                      }`}
                    >
                      <span className="truncate">
                        <strong className="mr-1.5">{String.fromCharCode(65 + oIdx)}.</strong>
                        {opt}
                      </span>
                      {isCorrect && (
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.5 rounded">
                          Correct
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Explanation (Admin view) */}
              {q.explanation && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-600">
                  <strong className="text-slate-800 font-semibold">Solution Explanation: </strong>
                  {q.explanation}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Question Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <h3 className="font-semibold text-slate-900 text-base">
                {editingQuestion.id ? 'Edit Aptitude Question' : 'Add New Question'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Category</label>
                  <select
                    value={editingQuestion.category || 'Quantitative'}
                    onChange={(e: any) => setEditingQuestion({ ...editingQuestion, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Subcategory</label>
                  <input
                    type="text"
                    required
                    value={editingQuestion.subcategory || ''}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, subcategory: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                    placeholder="e.g. Time & Work"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Difficulty</label>
                  <select
                    value={editingQuestion.difficulty || 'Medium'}
                    onChange={(e: any) => setEditingQuestion({ ...editingQuestion, difficulty: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Question Statement</label>
                <textarea
                  rows={3}
                  required
                  value={editingQuestion.text || ''}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, text: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500"
                  placeholder="Enter full question description..."
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Code Snippet (Optional)</label>
                <textarea
                  rows={2}
                  value={editingQuestion.codeSnippet || ''}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, codeSnippet: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-[11px] bg-slate-900 text-slate-100"
                  placeholder="Optional code block..."
                />
              </div>

              {/* Options */}
              <div className="space-y-2">
                <label className="font-semibold text-slate-700 block">Options & Correct Answer Check:</label>
                {(editingQuestion.options || ['Option A', 'Option B', 'Option C', 'Option D']).map((opt, i) => {
                  const isChecked = editingQuestion.correctAnswers?.includes(i);
                  return (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={isChecked}
                        onChange={() => setEditingQuestion({ ...editingQuestion, correctAnswers: [i] })}
                        className="w-4 h-4 text-indigo-600"
                      />
                      <span className="font-bold text-slate-600">{String.fromCharCode(65 + i)}:</span>
                      <input
                        type="text"
                        required
                        value={opt}
                        onChange={(e) => {
                          const nextOpts = [...(editingQuestion.options || [])];
                          nextOpts[i] = e.target.value;
                          setEditingQuestion({ ...editingQuestion, options: nextOpts });
                        }}
                        className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Marks for Correct Answer</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={editingQuestion.marks ?? 2}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, marks: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Negative Marks Deduction</label>
                  <input
                    type="number"
                    step="0.25"
                    required
                    value={editingQuestion.negativeMarks ?? 0.5}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, negativeMarks: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Explanation / Solution Steps</label>
                <textarea
                  rows={2}
                  value={editingQuestion.explanation || ''}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, explanation: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                  placeholder="Solution steps for admin review..."
                />
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
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
