import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.ts';
import { Company } from '../../types/index.ts';
import {
  Building2,
  Plus,
  Search,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  TrendingUp,
  X,
  Edit,
  Trash2,
  Globe,
  Award,
} from 'lucide-react';

export const CompanyManagement: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Partial<Company>>({});
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const data = await api.getCompanies();
      setCompanies(data);
    } catch (e) {
      console.error('Failed fetching companies', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCompany.id) {
        await api.updateCompany(editingCompany.id, editingCompany);
      } else {
        await api.createCompany(editingCompany);
      }
      setIsModalOpen(false);
      setEditingCompany({});
      fetchCompanies();
    } catch (e) {
      console.error('Error saving company', e);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name}?`)) return;
    try {
      await api.deleteCompany(id);
      fetchCompanies();
    } catch (e) {
      console.error('Failed to delete company', e);
    }
  };

  const filtered = companies.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.industry.toLowerCase().includes(search.toLowerCase()) ||
      c.location.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-600" />
            Corporate Partner & Recruiter Registry
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage recruiting organizations, HR liaisons, past hiring batches, and package tiers
          </p>
        </div>

        <button
          onClick={() => {
            setEditingCompany({
              industry: 'Technology',
              salaryPackage: '14 - 18 LPA',
              location: 'Bengaluru',
              jobRoles: ['Software Engineer'],
            });
            setIsModalOpen(true);
          }}
          className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          Add Company
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs max-w-md">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by company name, industry, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Company Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400">Loading companies...</div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400">No companies found.</div>
        ) : (
          filtered.map((company) => (
            <div
              key={company.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={company.logo}
                      alt={company.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 bg-slate-50"
                    />
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{company.name}</h3>
                      <span className="text-[11px] font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        {company.industry}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingCompany(company);
                        setIsModalOpen(true);
                      }}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded"
                      title="Edit"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(company.id, company.name)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Details */}
                <div className="mt-4 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{company.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">Package: <strong>{company.salaryPackage}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-600 hover:underline flex items-center gap-1 truncate"
                    >
                      {company.website.replace('https://', '')}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* HR Liaison */}
                <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                    Primary HR Point of Contact
                  </span>
                  <div className="font-semibold text-slate-800">{company.hrName}</div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <Mail className="w-3 h-3 text-slate-400" />
                    <span>{company.hrEmail}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{company.hrPhone}</span>
                  </div>
                </div>

                {/* Roles Offered */}
                <div className="mt-3">
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">Roles Offered:</span>
                  <div className="flex flex-wrap gap-1">
                    {company.jobRoles.map((role, idx) => (
                      <span key={idx} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Hiring History Summary */}
              {company.hiringHistory && company.hiringHistory.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1 text-slate-700 font-medium">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                    Past Hires: {company.hiringHistory.reduce((acc, h) => acc + h.hiresCount, 0)} Alumni
                  </span>
                  <button
                    onClick={() => setSelectedCompany(company)}
                    className="font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    View History
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Hiring History Modal */}
      {selectedCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-2.5">
                <img src={selectedCompany.logo} alt={selectedCompany.name} className="w-8 h-8 rounded-lg object-cover" />
                <h3 className="font-bold text-slate-900 text-base">{selectedCompany.name} — Hiring Track Record</h3>
              </div>
              <button onClick={() => setSelectedCompany(null)} className="p-1.5 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {selectedCompany.hiringHistory.map((h, i) => (
                  <div key={i} className="p-3.5 flex items-center justify-between bg-white">
                    <div>
                      <span className="font-bold text-slate-900 text-sm">Batch of {h.year}</span>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Roles: {h.roles.join(', ')}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-bold text-emerald-600">{h.hiresCount} Selected</span>
                      <div className="text-[10px] text-slate-400">Avg ₹{h.averagePackageLpa} LPA</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 text-right">
              <button
                onClick={() => setSelectedCompany(null)}
                className="px-4 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Company Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <h3 className="font-semibold text-slate-900 text-base">
                {editingCompany.id ? 'Edit Partner Company' : 'Register Corporate Recruiter'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Company Name</label>
                  <input
                    type="text"
                    required
                    value={editingCompany.name || ''}
                    onChange={(e) => setEditingCompany({ ...editingCompany, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500"
                    placeholder="e.g. Amazon Web Services"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Industry Sector</label>
                  <input
                    type="text"
                    required
                    value={editingCompany.industry || ''}
                    onChange={(e) => setEditingCompany({ ...editingCompany, industry: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500"
                    placeholder="e.g. Cloud & Artificial Intelligence"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Website URL</label>
                  <input
                    type="url"
                    value={editingCompany.website || ''}
                    onChange={(e) => setEditingCompany({ ...editingCompany, website: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500"
                    placeholder="https://company.com"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Office Location</label>
                  <input
                    type="text"
                    value={editingCompany.location || ''}
                    onChange={(e) => setEditingCompany({ ...editingCompany, location: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500"
                    placeholder="Bengaluru / Hyderabad"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3.5">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">HR Lead Name</label>
                  <input
                    type="text"
                    required
                    value={editingCompany.hrName || ''}
                    onChange={(e) => setEditingCompany({ ...editingCompany, hrName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500"
                    placeholder="Recruiter Name"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">HR Email</label>
                  <input
                    type="email"
                    required
                    value={editingCompany.hrEmail || ''}
                    onChange={(e) => setEditingCompany({ ...editingCompany, hrEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500"
                    placeholder="hr@company.com"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">HR Phone</label>
                  <input
                    type="text"
                    value={editingCompany.hrPhone || ''}
                    onChange={(e) => setEditingCompany({ ...editingCompany, hrPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500"
                    placeholder="+91 80..."
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Salary Package Details</label>
                <input
                  type="text"
                  value={editingCompany.salaryPackage || ''}
                  onChange={(e) => setEditingCompany({ ...editingCompany, salaryPackage: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500"
                  placeholder="e.g. ₹16 - 22 LPA CTC"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 shadow-xs"
                >
                  Save Partner Organization
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
