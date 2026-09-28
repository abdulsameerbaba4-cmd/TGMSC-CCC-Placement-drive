import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.ts';
import { PlacementDrive, CandidateShortlistRecord, ShortlistWeights } from '../../types/index.ts';
import {
  ListFilter,
  Sliders,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Award,
  Download,
  Filter,
  Search,
  Sparkles,
  Edit,
  X,
  FileCheck,
  ShieldAlert,
} from 'lucide-react';

export const ShortlistDashboard: React.FC = () => {
  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  const [selectedDriveId, setSelectedDriveId] = useState<string>('');
  const [shortlistData, setShortlistData] = useState<{
    drive: PlacementDrive;
    weights: ShortlistWeights;
    candidates: CandidateShortlistRecord[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // Override Modal
  const [overridingCandidate, setOverridingCandidate] = useState<CandidateShortlistRecord | null>(null);
  const [overrideStatus, setOverrideStatus] = useState<string>('Shortlisted');
  const [overrideReason, setOverrideReason] = useState<string>('');

  // Weights Config Modal
  const [isWeightsModalOpen, setIsWeightsModalOpen] = useState(false);
  const [weightsForm, setWeightsForm] = useState<ShortlistWeights>({
    aptitudeWeight: 40,
    technicalWeight: 30,
    hrWeight: 20,
    communicationWeight: 10,
  });

  useEffect(() => {
    fetchDrives();
  }, []);

  useEffect(() => {
    if (selectedDriveId) {
      fetchShortlist(selectedDriveId);
    }
  }, [selectedDriveId]);

  const fetchDrives = async () => {
    try {
      setLoading(true);
      const data = await api.getDrives();
      setDrives(data);
      if (data.length > 0) {
        setSelectedDriveId(data[0].id);
      }
    } catch (e) {
      console.error('Failed fetching drives', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchShortlist = async (driveId: string) => {
    try {
      setLoading(true);
      const res = await api.getShortlistData(driveId);
      setShortlistData(res);
      if (res.weights) {
        setWeightsForm(res.weights);
      }
    } catch (e) {
      console.error('Failed fetching shortlist data', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overridingCandidate || !selectedDriveId) return;
    try {
      await api.updateCandidateShortlist(selectedDriveId, {
        studentId: overridingCandidate.studentId,
        finalStatus: overrideStatus,
        overrideReason,
      });
      setOverridingCandidate(null);
      setOverrideReason('');
      fetchShortlist(selectedDriveId);
    } catch (e) {
      console.error('Failed updating shortlist candidate', e);
    }
  };

  const handleSaveWeights = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateShortlistWeights(weightsForm);
      setIsWeightsModalOpen(false);
      if (selectedDriveId) fetchShortlist(selectedDriveId);
    } catch (e) {
      console.error('Failed updating shortlist weights', e);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ListFilter className="w-5 h-5 text-indigo-600" />
            Candidate Shortlist & Selection Scoring Hub
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparent weighted selection scoring for administrators. Students never see internal scores or ranking.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsWeightsModalOpen(true)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-xs"
          >
            <Sliders className="w-4 h-4 text-slate-500" />
            Configure Weights
          </button>
        </div>
      </div>

      {/* Drive Selector & Weights Pill Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-700">Placement Campaign:</span>
          <select
            value={selectedDriveId}
            onChange={(e) => setSelectedDriveId(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-900 outline-none"
          >
            {drives.map((d) => (
              <option key={d.id} value={d.id}>
                {d.companyName} — {d.jobRole} ({d.status})
              </option>
            ))}
          </select>
        </div>

        {shortlistData && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Evaluation Formula:</span>
            <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold">
              Aptitude {shortlistData.weights.aptitudeWeight}%
            </span>
            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold">
              Technical {shortlistData.weights.technicalWeight}%
            </span>
            <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-semibold">
              HR {shortlistData.weights.hrWeight}%
            </span>
            <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-700 font-semibold">
              Comm {shortlistData.weights.communicationWeight}%
            </span>
          </div>
        )}
      </div>

      {/* Candidates Shortlist Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <th className="py-3 px-4">Candidate</th>
                <th className="py-3 px-4">Academic CGPA</th>
                <th className="py-3 px-4">Aptitude Score (40%)</th>
                <th className="py-3 px-4">Technical Score (30%)</th>
                <th className="py-3 px-4">HR Score (20%)</th>
                <th className="py-3 px-4">Composite Selection Score</th>
                <th className="py-3 px-4">Security</th>
                <th className="py-3 px-4">Final Status</th>
                <th className="py-3 px-4 text-right">Audit Override</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">Loading candidates...</td>
                </tr>
              ) : !shortlistData || shortlistData.candidates.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No candidates registered for this placement drive yet.
                  </td>
                </tr>
              ) : (
                shortlistData.candidates.map((cand) => (
                  <tr key={cand.studentId} className="hover:bg-slate-50/60 transition-colors">
                    {/* Candidate */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{cand.studentName}</div>
                      <div className="text-[11px] text-slate-400">{cand.studentId} · {cand.branch}</div>
                    </td>

                    {/* CGPA */}
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {cand.cgpa.toFixed(2)}
                    </td>

                    {/* Aptitude */}
                    <td className="py-3.5 px-4">
                      {cand.aptitudeScore !== undefined ? (
                        <div>
                          <span className="font-bold text-slate-900">{cand.aptitudeScore} Marks</span>
                          <span className="text-[11px] text-slate-400 ml-1.5">({cand.aptitudePercentage}%)</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Not Taken</span>
                      )}
                    </td>

                    {/* Technical */}
                    <td className="py-3.5 px-4">
                      {cand.technicalScore !== undefined && cand.technicalScore > 0 ? (
                        <span className="font-bold text-slate-900">{cand.technicalScore}/100</span>
                      ) : (
                        <span className="text-slate-400 italic">Pending</span>
                      )}
                    </td>

                    {/* HR */}
                    <td className="py-3.5 px-4">
                      {cand.hrScore !== undefined && cand.hrScore > 0 ? (
                        <span className="font-bold text-slate-900">{cand.hrScore}/100</span>
                      ) : (
                        <span className="text-slate-400 italic">Pending</span>
                      )}
                    </td>

                    {/* Selection Score */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-indigo-700 text-sm font-mono">
                          {cand.selectionScore?.toFixed(1) || 0}
                        </span>
                        <span className="text-[10px] text-slate-400">/ 100</span>
                      </div>
                    </td>

                    {/* Security */}
                    <td className="py-3.5 px-4">
                      {cand.securityStatus === 'Auto Submitted' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white animate-pulse">
                          🚨 Incident
                        </span>
                      ) : (
                        <span className="text-emerald-700 text-[11px] font-medium">Normal</span>
                      )}
                    </td>

                    {/* Final Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                          cand.finalStatus === 'Selected'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold'
                            : cand.finalStatus === 'Shortlisted'
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            : cand.finalStatus === 'Rejected'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {cand.finalStatus}
                      </span>
                      {cand.overrideReason && (
                        <div className="text-[10px] text-slate-500 italic mt-0.5 truncate max-w-xs" title={cand.overrideReason}>
                          Note: "{cand.overrideReason}"
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setOverridingCandidate(cand);
                          setOverrideStatus(cand.finalStatus);
                          setOverrideReason(cand.overrideReason || '');
                        }}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-[11px]"
                      >
                        Override Status
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Override Modal with Mandatory Audit Note (Requirement #21) */}
      {overridingCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <h3 className="font-bold text-slate-900 text-sm">
                Administrative Override: {overridingCandidate.studentName}
              </h3>
              <button onClick={() => setOverridingCandidate(null)} className="p-1.5 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOverride} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Set Decision Status:</label>
                <select
                  value={overrideStatus}
                  onChange={(e) => setOverrideStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none font-medium"
                >
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="Not Shortlisted">Not Shortlisted</option>
                  <option value="Selected">Selected (Offer Letter)</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Pending">Pending Review</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Mandatory Audit Reason / Justification Note:
                </label>
                <textarea
                  rows={3}
                  required
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500"
                  placeholder="Explain reason for manual qualification, academic waiver, or panel decision..."
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setOverridingCandidate(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 shadow-xs"
                >
                  Record Audit Decision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Weights Config Modal */}
      {isWeightsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <h3 className="font-bold text-slate-900 text-sm">Configure Selection Score Weights</h3>
              <button onClick={() => setIsWeightsModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveWeights} className="p-6 space-y-4 text-xs">
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-800">Aptitude Test Weight</span>
                    <span className="font-bold text-indigo-600">{weightsForm.aptitudeWeight}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={weightsForm.aptitudeWeight}
                    onChange={(e) => setWeightsForm({ ...weightsForm, aptitudeWeight: parseInt(e.target.value, 10) })}
                    className="w-full accent-indigo-600"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-800">Technical Interview Weight</span>
                    <span className="font-bold text-blue-600">{weightsForm.technicalWeight}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={weightsForm.technicalWeight}
                    onChange={(e) => setWeightsForm({ ...weightsForm, technicalWeight: parseInt(e.target.value, 10) })}
                    className="w-full accent-blue-600"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-800">HR / Behavioral Round Weight</span>
                    <span className="font-bold text-purple-600">{weightsForm.hrWeight}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={weightsForm.hrWeight}
                    onChange={(e) => setWeightsForm({ ...weightsForm, hrWeight: parseInt(e.target.value, 10) })}
                    className="w-full accent-purple-600"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-800">Communication & Culture Fit</span>
                    <span className="font-bold text-teal-600">{weightsForm.communicationWeight}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={weightsForm.communicationWeight}
                    onChange={(e) => setWeightsForm({ ...weightsForm, communicationWeight: parseInt(e.target.value, 10) })}
                    className="w-full accent-teal-600"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsWeightsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 shadow-xs"
                >
                  Update Weights
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
