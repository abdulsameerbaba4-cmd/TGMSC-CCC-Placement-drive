import React, { useState } from 'react';
import { api } from '../../services/api.ts';
import { Student } from '../../types/index.ts';
import {
  Sparkles,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  Upload,
  User,
  GraduationCap,
  Briefcase,
  Layers,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onApplyParsedData: (data: Partial<Student>) => void;
}

const SAMPLE_RESUMES = [
  {
    title: 'Ananya Sharma — SDE & Cloud Systems',
    text: `ANANYA SHARMA
ananya.sharma2026@student.nit.edu | +91 98112 34567 | Bengaluru, India
Branch: Computer Science & Engineering (CSE) | Class of 2026
National Institute of Technology | Current CGPA: 9.15 / 10.0 | Active Backlogs: 0

TECHNICAL SKILLS
Languages & Frameworks: C++, Python, Java, Go, React, Node.js, TypeScript, PostgreSQL, Redis
Cloud & DevOps: Docker, Kubernetes, AWS (S3, EC2, Lambda), CI/CD GitHub Actions, Linux
Core Competencies: Data Structures & Algorithms, Distributed Systems, Concurrency, RESTful APIs

EDUCATION
Bachelor of Technology in Computer Science & Engineering
National Institute of Technology (2022 - 2026) | CGPA: 9.15

WORK EXPERIENCE
Software Engineering Intern | Zeta Cloud Systems (May 2025 – July 2025)
- Engineered an asynchronous distributed job queue in Go using Redis streams, reducing worker latency by 42%.
- Integrated Prometheus instrumentation and Grafana dashboards for cluster health telemetry.

PROJECTS
Distributed Event Streaming Engine
- Built a fault-tolerant message broker supporting publish-subscribe topics with Raft consensus in Go.
- Implemented zero-copy network serialization with Protocol Buffers and gRPC.

CERTIFICATIONS
- AWS Certified Cloud Practitioner
- Certified Kubernetes Application Developer (CKAD) Prep`,
  },
  {
    title: 'Vikram Sengupta — Cybersecurity & Infrastructure',
    text: `VIKRAM SENGUPTA
vikram.sengupta@student.nit.edu | +91 97234 56789
Branch: Electronics & Communication Engineering (ECE) | Batch 2026
National Institute of Technology | CGPA: 7.85 | Backlogs: 0

SKILLS & CERTIFICATIONS
Security & Networking: Wireshark, Nmap, Metasploit, Snort, SIEM (Splunk), TCP/IP, Linux Kernel, Firewalls, Bash
Programming: Python, C, Bash Scripting, SQL
Certifications: CompTIA Security+, Cisco Certified Network Associate (CCNA)

WORK EXPERIENCE
Cyber Defense Operations Intern | SecureGrid Defense (Jun 2025 - Aug 2025)
- Monitored SOC alerts, triaged 200+ network anomalies, and configured IDS/IPS correlation rules.
- Drafted automated incident containment playbooks using Python.

PROJECTS
Automated Network Vulnerability Scanner
- Python-based vulnerability auditing tool assessing open ports and outdated SSL/TLS ciphers.`,
  },
];

export const AiResumeParserModal: React.FC<Props> = ({ isOpen, onClose, onApplyParsedData }) => {
  const [resumeText, setResumeText] = useState(SAMPLE_RESUMES[0].text);
  const [loading, setLoading] = useState(false);
  const [parsedResult, setParsedResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleParse = async () => {
    if (!resumeText.trim()) {
      setError('Please provide or paste resume text first.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await api.parseResume(resumeText);
      setParsedResult(res.data);
    } catch (e: any) {
      console.error('Resume parsing failed', e);
      setError(e.message || 'Failed to parse resume with AI.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!parsedResult) return;
    onApplyParsedData({
      name: parsedResult.name,
      email: parsedResult.email,
      phone: parsedResult.phone,
      gender: parsedResult.gender,
      college: parsedResult.college,
      branch: parsedResult.branch,
      graduationYear: parsedResult.graduationYear,
      cgpa: parsedResult.cgpa,
      backlogs: parsedResult.backlogs,
      skills: parsedResult.skills,
      certifications: parsedResult.certifications,
      projects: parsedResult.projects,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50/80 to-purple-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                AI-Powered Student Resume Parser
                <span className="text-[10px] font-semibold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Gemini 2.5 Flash
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Automatically extracts education, CGPA, backlogs, skills, and projects to pre-fill profiles and drive eligibility
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
          {/* Left: Input & Samples (5 cols) */}
          <div className="lg:col-span-5 space-y-3 flex flex-col">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-700">Paste or Load Resume Text:</label>
              <span className="text-[11px] text-slate-400">PDF / Plaintext input</span>
            </div>

            {/* Quick Sample Selector */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500 font-medium">Load Sample:</span>
              {SAMPLE_RESUMES.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setResumeText(s.text);
                    setParsedResult(null);
                  }}
                  className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition-colors"
                >
                  {s.title.split('—')[0].trim()}
                </button>
              ))}
            </div>

            <textarea
              rows={12}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              className="w-full flex-1 p-3 bg-slate-50 border border-slate-300 rounded-xl font-mono text-[11px] leading-relaxed outline-none focus:bg-white focus:border-indigo-500"
              placeholder="Paste student resume content here..."
            />

            <button
              onClick={handleParse}
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-60"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Extracting Entities with Gemini AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Extract Entities with AI</span>
                </>
              )}
            </button>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Right: Extracted Schema Results (7 cols) */}
          <div className="lg:col-span-7 bg-slate-50/70 p-5 rounded-2xl border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Structured Extraction Preview
                </h4>
                <span className="text-[11px] text-slate-500">
                  {parsedResult ? 'Extraction Complete' : 'Awaiting Extraction'}
                </span>
              </div>

              {!parsedResult ? (
                <div className="py-16 text-center text-slate-400 space-y-2">
                  <FileText className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="font-medium text-xs">No resume parsed yet.</p>
                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                    Click "Extract Entities with AI" to parse student contact details, CGPA, backlogs, technical skills, and projects.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Summary */}
                  {parsedResult.summary && (
                    <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl text-[11px] text-indigo-900">
                      <strong>AI Summary:</strong> {parsedResult.summary}
                    </div>
                  )}

                  {/* Personal & Academic Cards */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase block">Candidate</span>
                      <div className="font-bold text-slate-900 text-sm">{parsedResult.name}</div>
                      <div className="text-[11px] text-slate-500">{parsedResult.email}</div>
                      <div className="text-[11px] text-slate-500">{parsedResult.phone}</div>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase block">Academic Standings</span>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Branch:</span>
                        <strong className="text-slate-900">{parsedResult.branch}</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">CGPA:</span>
                        <strong className="text-indigo-600 text-sm font-bold">{parsedResult.cgpa.toFixed(2)}</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Active Backlogs:</span>
                        <span className={`font-semibold ${parsedResult.backlogs === 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {parsedResult.backlogs}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Skills */}
                  <div>
                    <span className="font-semibold text-slate-700 block mb-1.5 text-[11px]">
                      Extracted Technical Skills ({parsedResult.skills?.length || 0}):
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {parsedResult.skills?.map((sk: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-800 font-medium text-[11px]">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Projects */}
                  {parsedResult.projects && parsedResult.projects.length > 0 && (
                    <div>
                      <span className="font-semibold text-slate-700 block mb-1 text-[11px]">Parsed Projects:</span>
                      <div className="space-y-1.5 max-h-36 overflow-y-auto">
                        {parsedResult.projects.map((p: any, idx: number) => (
                          <div key={idx} className="p-2.5 bg-white rounded-lg border border-slate-200 text-[11px]">
                            <div className="font-semibold text-slate-900">{p.title}</div>
                            <p className="text-slate-600 text-[10px] mt-0.5 line-clamp-1">{p.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Automated Eligibility Impact Note */}
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Applying this data will automatically update CGPA ({parsedResult.cgpa}), branch ({parsedResult.branch}), and skills in real-time eligibility checks for all active placement drives.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="mt-5 pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!parsedResult}
                onClick={handleApply}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1.5 shadow-xs disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                Apply to Student Profile & Verify Eligibility
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
