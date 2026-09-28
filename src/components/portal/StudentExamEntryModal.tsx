import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import { PlacementDrive, AptitudeTest } from '../../types/index.ts';
import {
  FileText,
  User,
  GraduationCap,
  Clock,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  X,
  AlertCircle,
  Building,
  Phone,
  Mail,
  Calendar,
  Briefcase,
  FileCheck,
  MapPin,
  Award,
  Layers,
  Check,
  ChevronRight,
  ChevronLeft,
  Info,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  drives?: PlacementDrive[];
  tests?: AptitudeTest[];
  initialDriveId?: string;
  initialTestId?: string;
  initialSlot?: string;
  onLaunchExam: (testId: string, studentInfo: any) => void;
}

export const StudentExamEntryModal: React.FC<Props> = ({
  isOpen,
  onClose,
  drives = [],
  tests = [],
  initialDriveId,
  initialTestId,
  initialSlot,
  onLaunchExam,
}) => {
  const [localDrives, setLocalDrives] = useState<PlacementDrive[]>(drives);
  const [localTests, setLocalTests] = useState<AptitudeTest[]>(tests);
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State covering all specified sections
  const [formData, setFormData] = useState({
    // 1. Personal Information
    name: 'Mohammed Abdul Sameer',
    dateOfBirth: '2004-05-14',
    gender: 'Male',
    phone: '+91 98490 12345',
    email: 'sameer.student@t-minds.org',
    aadhaarNumber: 'XXXX-XXXX-9842',
    address: 'House No 18-2-412, Falaknuma',
    city: 'Hyderabad',
    district: 'Hyderabad',
    state: 'Telangana',

    // 2. Education
    highestQualification: 'Any Degree',
    college: 'Telangana Minorities Engineering Academy, Hyderabad',
    university: 'Osmania University',
    branch: 'CSE',
    graduationYear: '2026',
    sscPercentage: '86.4',
    interPercentage: '84.2',
    cgpa: '8.4',
    backlogs: '0',
    certifications: 'Telangana Minorities Study Circle Placement Ready Certificate, Python for Beginners',

    // 3. Skills & Employment
    technicalSkills: 'Java, Python, SQL, MS Office, Fast Typing',
    communicationSkills: 'Good',
    languagesKnown: 'Telugu, Hindi, English, Urdu',
    computerSkills: 'MS Office, Excel Spreadsheets, Internet Research, Data Entry',
    jobSpecificSkills: 'Outbound Calling, Customer Query Resolution, Troubleshooting',
    employmentStatus: 'Fresher',
    experienceYears: '0',
    currentEmployer: '',
    previousExperience: '',

    // 4. Documents & Job Preference
    resumeFileName: 'Sameer_Resume_2026.pdf',
    photoFileName: 'Sameer_Passport_Photo.jpg',
    certificatesFileName: 'Academic_Certificates_Compiled.pdf',
    driveId: initialDriveId || 'GVT004',
    testId: initialTestId || 'test_gvt001',
    preferredLocation: 'Hyderabad',
    preferredShift: 'Day',
    interviewSlot: initialSlot || 'Today - 11:30 AM Slot',
    confirmedAccurate: true,
    agreeProctoring: true,
  });

  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showAiResumeInput, setShowAiResumeInput] = useState(false);
  const [resumeText, setResumeText] = useState('');
  const [parsingResume, setParsingResume] = useState(false);

  useEffect(() => {
    if (drives && drives.length > 0) {
      setLocalDrives(drives);
    } else {
      api.getDrives().then((data) => {
        if (data && data.length > 0) setLocalDrives(data);
      }).catch(console.error);
    }

    if (tests && tests.length > 0) {
      setLocalTests(tests);
    } else {
      api.getTests().then((data) => {
        if (data && data.length > 0) setLocalTests(data);
      }).catch(console.error);
    }
  }, [drives, tests]);

  useEffect(() => {
    if (initialDriveId) {
      setFormData((prev) => ({ ...prev, driveId: initialDriveId }));
    }
    if (initialTestId) {
      setFormData((prev) => ({ ...prev, testId: initialTestId }));
    }
    if (initialSlot) {
      setFormData((prev) => ({ ...prev, interviewSlot: initialSlot }));
    }
  }, [initialDriveId, initialTestId, initialSlot]);

  if (!isOpen) return null;

  const currentDrive =
    localDrives.find((d) => d.id === formData.driveId || d.jobCode === formData.driveId) || localDrives[0];
  const currentTest =
    localTests.find((t) => t.driveId === currentDrive?.id) || localTests[0];

  // Automatic Eligibility Verification Engine
  const studentCgpa = parseFloat(formData.cgpa) || 0;
  const studentBacklogs = parseInt(formData.backlogs, 10) || 0;
  const studentExp = parseFloat(formData.experienceYears) || 0;
  const minCgpaReq = currentDrive?.minCgpa ?? 5.0;
  const maxBacklogsReq = currentDrive?.maxBacklogs ?? 0;
  const allowedBranches = currentDrive?.allowedBranches || ['All Streams'];

  const isCgpaEligible = studentCgpa >= minCgpaReq;
  const isBacklogEligible = studentBacklogs <= maxBacklogsReq;
  const isBranchEligible = allowedBranches.includes('All Streams') || allowedBranches.includes(formData.branch);

  // Gender criteria
  const isGenderEligible =
    !currentDrive?.genderEligibility ||
    currentDrive.genderEligibility === 'Male & Female' ||
    currentDrive.genderEligibility === formData.gender;

  // No B.Tech rule
  const isTechBranch = ['CSE', 'ECE', 'EEE', 'Mechanical', 'Civil'].includes(formData.branch) ||
    formData.highestQualification.includes('B.Tech');
  const isNoBTechEligible = !currentDrive?.noBTechAllowed || !isTechBranch;

  // Experience requirement
  const isExpEligible =
    !currentDrive?.experienceRequired?.includes('2+') || studentExp >= 2;

  const isOverallEligible =
    isCgpaEligible && isBacklogEligible && isBranchEligible && isGenderEligible && isNoBTechEligible && isExpEligible;

  // AI Resume Parse Auto-Fill
  const handleParseResume = async () => {
    if (!resumeText.trim()) {
      setError('Please paste your resume text first to auto-extract details.');
      return;
    }

    try {
      setParsingResume(true);
      setError(null);
      const parsed = await api.parseResume(resumeText);

      setFormData((prev) => ({
        ...prev,
        name: parsed.name || prev.name,
        email: parsed.email || prev.email,
        phone: parsed.phone || prev.phone,
        college: parsed.college || prev.college,
        branch: parsed.branch || prev.branch,
        cgpa: parsed.cgpa ? String(parsed.cgpa) : prev.cgpa,
        graduationYear: parsed.graduationYear ? String(parsed.graduationYear) : prev.graduationYear,
        technicalSkills: parsed.skills?.join(', ') || prev.technicalSkills,
      }));

      setSuccessMessage('Profile fields pre-filled from resume using Gemini AI!');
      setTimeout(() => setSuccessMessage(null), 4000);
      setShowAiResumeInput(false);
    } catch (e: any) {
      console.error('AI resume parse error', e);
      setError('Could not parse resume automatically. You can fill the fields manually.');
    } finally {
      setParsingResume(false);
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.confirmedAccurate) {
      setError('Please confirm that the information provided is accurate.');
      return;
    }

    if (!formData.agreeProctoring) {
      setError('You must accept the proctored examination security terms to enter.');
      return;
    }

    try {
      setVerifying(true);
      setError(null);

      // 1. Save / Update student profile in database
      await api.createStudent({
        studentId: formData.studentId || `TS-TMSC-${Date.now().toString().slice(-4)}`,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender as any,
        aadhaarNumber: formData.aadhaarNumber,
        address: formData.address,
        city: formData.city,
        district: formData.district,
        state: formData.state,
        highestQualification: formData.highestQualification,
        college: formData.college,
        university: formData.university,
        branch: formData.branch,
        graduationYear: parseInt(formData.graduationYear, 10) || 2026,
        sscPercentage: parseFloat(formData.sscPercentage) || 80,
        interPercentage: parseFloat(formData.interPercentage) || 80,
        cgpa: parseFloat(formData.cgpa) || 8.0,
        backlogs: parseInt(formData.backlogs, 10) || 0,
        skills: formData.technicalSkills.split(',').map((s) => s.trim()).filter(Boolean),
        communicationSkills: formData.communicationSkills,
        languagesKnown: formData.languagesKnown.split(',').map((s) => s.trim()).filter(Boolean),
        computerSkills: formData.computerSkills.split(',').map((s) => s.trim()).filter(Boolean),
        jobSpecificSkills: formData.jobSpecificSkills.split(',').map((s) => s.trim()).filter(Boolean),
        employmentStatus: formData.employmentStatus as any,
        experienceYears: parseFloat(formData.experienceYears) || 0,
        currentEmployer: formData.currentEmployer,
        previousExperience: formData.previousExperience,
        certifications: formData.certifications.split(',').map((s) => s.trim()).filter(Boolean),
        projects: [],
        resumeFileName: formData.resumeFileName,
        preferredJobId: formData.driveId,
        preferredLocation: formData.preferredLocation,
        preferredShift: formData.preferredShift,
        confirmedAccurate: formData.confirmedAccurate,
        placementStatus: 'Applied',
      });

      // 2. Submit application for selected job
      if (formData.driveId) {
        try {
          await api.applyForDrive(formData.driveId, formData.studentId);
        } catch (appErr) {
          console.warn('Application registration notice:', appErr);
        }
      }

      // Show user notification without revealing internal scores
      setSuccessMessage('Application submitted successfully. Proceeding to proctored examination.');

      // Launch exam
      const selectedTestId = currentTest?.id || 'test_gvt001';
      setTimeout(() => {
        onLaunchExam(selectedTestId, formData);
        onClose();
      }, 700);
    } catch (e: any) {
      console.error('Registration submission error:', e);
      // Fallback: still launch exam
      const selectedTestId = currentTest?.id || 'test_gvt001';
      onLaunchExam(selectedTestId, formData);
      onClose();
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]">
        {/* Government Header */}
        <div className="bg-gradient-to-r from-[#072559] via-[#0B3B82] to-[#072559] text-white p-5 border-b-2 border-amber-400 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/40 text-amber-300 font-extrabold flex items-center justify-center text-xs shadow-inner shrink-0">
              TMESC
            </div>
            <div>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
                Government of Telangana · Minorities Welfare Department
              </span>
              <h3 className="font-extrabold text-base sm:text-lg text-white tracking-tight">
                Mandatory Student Registration & Application Form
              </h3>
              <p className="text-[11px] text-blue-200">
                Complete candidate credentials, verify job eligibility & proceed to aptitude + domain screening
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4-Step Stepper Header */}
        <div className="bg-slate-100 px-6 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-600">
          <button
            type="button"
            onClick={() => setActiveStep(1)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
              activeStep === 1
                ? 'bg-blue-700 text-white font-bold shadow-xs'
                : 'hover:bg-slate-200 text-slate-700'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-white/20 text-[10px] flex items-center justify-center">1</span>
            <span>Personal</span>
          </button>

          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />

          <button
            type="button"
            onClick={() => setActiveStep(2)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
              activeStep === 2
                ? 'bg-blue-700 text-white font-bold shadow-xs'
                : 'hover:bg-slate-200 text-slate-700'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-white/20 text-[10px] flex items-center justify-center">2</span>
            <span>Education</span>
          </button>

          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />

          <button
            type="button"
            onClick={() => setActiveStep(3)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
              activeStep === 3
                ? 'bg-blue-700 text-white font-bold shadow-xs'
                : 'hover:bg-slate-200 text-slate-700'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-white/20 text-[10px] flex items-center justify-center">3</span>
            <span>Skills & Work</span>
          </button>

          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />

          <button
            type="button"
            onClick={() => setActiveStep(4)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
              activeStep === 4
                ? 'bg-purple-700 text-white font-bold shadow-xs'
                : 'hover:bg-slate-200 text-slate-700'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-white/20 text-[10px] flex items-center justify-center">4</span>
            <span>Job & Review</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleFinalSubmit} className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* AI Auto-Fill Helper Bar */}
          <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="font-bold text-purple-950 text-xs">AI Resume Auto-Fill</span>
                <span className="text-[11px] text-purple-700 block">
                  Paste resume text to instantly populate education, CGPA, branch, and skills.
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowAiResumeInput(!showAiResumeInput)}
              className="px-3 py-1 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-bold transition-colors shrink-0"
            >
              {showAiResumeInput ? 'Close AI Input' : 'Auto-Fill with AI'}
            </button>
          </div>

          {showAiResumeInput && (
            <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-200 space-y-2">
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your resume text here (Name, Email, Phone, College, Branch, CGPA, Skills)..."
                rows={3}
                className="w-full p-2.5 bg-white border border-purple-300 rounded-xl text-xs outline-none focus:ring-1 focus:ring-purple-500 font-sans"
              />
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setResumeText(
                      `Mohammed Abdul Sameer\nPhone: +91 98490 12345 | Email: sameer.student@t-minds.org\nEducation: B.Tech in CSE (2022-2026), Osmania University / Telangana Minorities Engineering Academy\nCGPA: 8.4/10.0, 0 Backlogs\nKey Skills: Java, Python, SQL, MS Office, Fast Typing, Customer Query Resolution\nAddress: Falaknuma, Hyderabad, Telangana`
                    );
                  }}
                  className="text-[11px] text-purple-700 hover:underline"
                >
                  Load Sample Candidate Text
                </button>
                <button
                  type="button"
                  disabled={parsingResume}
                  onClick={handleParseResume}
                  className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 disabled:opacity-60"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {parsingResume ? 'Parsing...' : 'Extract & Populate'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 1: PERSONAL INFORMATION */}
          {activeStep === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <User className="w-4 h-4 text-blue-700" />
                <h4 className="font-bold text-slate-900 text-sm">1. Personal Information</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Full Name (As per SSC / ID)</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-blue-600 font-medium"
                    placeholder="Candidate full name"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Date of Birth</label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="date"
                      required
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-blue-600"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-blue-600 bg-white font-medium"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Mobile Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-blue-600"
                      placeholder="+91..."
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-blue-600"
                      placeholder="student@example.com"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Aadhaar / Institutional ID Number</label>
                  <input
                    type="text"
                    value={formData.aadhaarNumber}
                    onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-blue-600 font-mono"
                    placeholder="XXXX-XXXX-XXXX"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">City / Town</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-blue-600"
                    placeholder="Hyderabad"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Residential Address</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-blue-600"
                  placeholder="Street / Colony / Door number"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">District</label>
                  <input
                    type="text"
                    required
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-blue-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: EDUCATION */}
          {activeStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <GraduationCap className="w-4 h-4 text-blue-700" />
                <h4 className="font-bold text-slate-900 text-sm">2. Educational Qualifications</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Highest Qualification</label>
                  <select
                    value={formData.highestQualification}
                    onChange={(e) => setFormData({ ...formData, highestQualification: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-blue-600 bg-white font-medium"
                  >
                    <option value="SSC">SSC (10th Standard)</option>
                    <option value="Intermediate">Intermediate (10+2)</option>
                    <option value="ITI & Diploma">ITI & Diploma</option>
                    <option value="Any Degree">Any Degree (B.Com / B.Sc / BA / BBA)</option>
                    <option value="B.Tech">B.Tech / B.E. (Engineering)</option>
                    <option value="Post Graduate">Post Graduate (MCA / MBA / M.Sc)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Branch / Stream</label>
                  <select
                    value={formData.branch}
                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-blue-600 bg-white font-medium"
                  >
                    <option value="All Streams">All Streams / General</option>
                    <option value="CSE">CSE / IT</option>
                    <option value="ECE">ECE</option>
                    <option value="EEE">EEE</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Civil">Civil</option>
                    <option value="B.Com">B.Com</option>
                    <option value="BBA">BBA</option>
                    <option value="B.Sc">B.Sc</option>
                    <option value="BA">BA</option>
                    <option value="ITI Machinist">ITI Machinist / Fitter</option>
                    <option value="Diploma Mechanical">Diploma Mechanical</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">College / Training Institute</label>
                  <input
                    type="text"
                    required
                    value={formData.college}
                    onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-blue-600 font-medium"
                    placeholder="Institute Name"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Affiliated University / Board</label>
                  <input
                    type="text"
                    value={formData.university}
                    onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-blue-600"
                    placeholder="e.g. Osmania University / SBTET"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Passing Year</label>
                  <input
                    type="number"
                    value={formData.graduationYear}
                    onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-blue-600 font-bold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">SSC (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.sscPercentage}
                    onChange={(e) => setFormData({ ...formData, sscPercentage: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-blue-600 font-bold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Inter/Dip (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.interPercentage}
                    onChange={(e) => setFormData({ ...formData, interPercentage: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-blue-600 font-bold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Grad CGPA / %</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.cgpa}
                    onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-blue-600 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Active Backlogs</label>
                <input
                  type="number"
                  min="0"
                  value={formData.backlogs}
                  onChange={(e) => setFormData({ ...formData, backlogs: e.target.value })}
                  className="w-32 px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-blue-600 font-bold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Certifications & Training</label>
                <input
                  type="text"
                  value={formData.certifications}
                  onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-blue-600"
                  placeholder="e.g. Telangana Study Circle Certificate, Tally, AutoCAD, Python"
                />
              </div>
            </div>
          )}

          {/* STEP 3: SKILLS & EMPLOYMENT */}
          {activeStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <Briefcase className="w-4 h-4 text-blue-700" />
                <h4 className="font-bold text-slate-900 text-sm">3. Skills & Employment History</h4>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Technical Skills</label>
                <input
                  type="text"
                  value={formData.technicalSkills}
                  onChange={(e) => setFormData({ ...formData, technicalSkills: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-blue-600"
                  placeholder="e.g. Java, Python, MS Excel, AutoCAD, CNC G-Codes"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Communication Skills</label>
                  <select
                    value={formData.communicationSkills}
                    onChange={(e) => setFormData({ ...formData, communicationSkills: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-blue-600 bg-white"
                  >
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Languages Known</label>
                  <input
                    type="text"
                    value={formData.languagesKnown}
                    onChange={(e) => setFormData({ ...formData, languagesKnown: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-blue-600"
                    placeholder="e.g. Telugu, Hindi, English, Urdu"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Computer / Office Skills</label>
                  <input
                    type="text"
                    value={formData.computerSkills}
                    onChange={(e) => setFormData({ ...formData, computerSkills: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-blue-600"
                    placeholder="e.g. MS Word, Excel, Fast Typing, Email Etiquette"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Job-Specific Skills</label>
                  <input
                    type="text"
                    value={formData.jobSpecificSkills}
                    onChange={(e) => setFormData({ ...formData, jobSpecificSkills: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-blue-600"
                    placeholder="e.g. Inbound Voice, Lead Generation, CCTV, QR"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <span className="font-bold text-slate-800 text-xs block mb-2 uppercase tracking-wider">
                  Employment Background
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Experience Status</label>
                    <select
                      value={formData.employmentStatus}
                      onChange={(e) => setFormData({ ...formData, employmentStatus: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-blue-600 bg-white"
                    >
                      <option value="Fresher">Fresher</option>
                      <option value="Experienced">Experienced</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Total Experience (Years)</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={formData.experienceYears}
                      onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-blue-600 font-bold"
                    />
                  </div>
                </div>

                {formData.employmentStatus === 'Experienced' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-3">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Current / Previous Employer</label>
                      <input
                        type="text"
                        value={formData.currentEmployer}
                        onChange={(e) => setFormData({ ...formData, currentEmployer: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-blue-600"
                        placeholder="Company name"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Job Responsibilities</label>
                      <input
                        type="text"
                        value={formData.previousExperience}
                        onChange={(e) => setFormData({ ...formData, previousExperience: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-blue-600"
                        placeholder="Key duties performed"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: DOCUMENTS, JOB PREFERENCE & REVIEW */}
          {activeStep === 4 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <FileCheck className="w-4 h-4 text-purple-700" />
                <h4 className="font-bold text-slate-900 text-sm">4. Target Job Selection & Verification</h4>
              </div>

              {/* Target Job Selection Dropdown */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Select Job Opening to Apply & Write Exam
                </label>
                <select
                  value={formData.driveId}
                  onChange={(e) => {
                    const selected = localDrives.find((d) => d.id === e.target.value || d.jobCode === e.target.value);
                    const matchingTest = localTests.find((t) => t.driveId === selected?.id) || localTests[0];
                    setFormData({
                      ...formData,
                      driveId: e.target.value,
                      testId: matchingTest?.id || formData.testId,
                    });
                  }}
                  className="w-full p-2.5 bg-blue-50/60 border-2 border-blue-400 rounded-xl text-xs font-bold text-blue-950 outline-none"
                >
                  {localDrives.map((d) => (
                    <option key={d.id} value={d.id}>
                      [{d.jobCode || d.id}] {d.jobRole} — {d.companyName} ({d.salary})
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Job Highlights Card */}
              {currentDrive && (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-[11px]">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 text-xs">{currentDrive.jobRole}</span>
                      <span className="text-slate-600 block">{currentDrive.companyName} · {currentDrive.jobLocation}</span>
                    </div>
                    <span className="px-2.5 py-1 bg-amber-50 text-amber-900 font-bold border border-amber-300 rounded-lg text-xs">
                      {currentDrive.salary}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200 text-slate-600">
                    <div>Qual: <strong className="text-slate-900">{currentDrive.qualificationRequired || 'Any'}</strong></div>
                    <div>Gender: <strong className="text-slate-900">{currentDrive.genderEligibility || 'Male & Female'}</strong></div>
                    <div>Mode: <strong className="text-slate-900">{currentDrive.workMode}</strong></div>
                    <div>Shift: <strong className="text-slate-900">{currentDrive.shiftTiming || 'Day Shift'}</strong></div>
                  </div>
                </div>
              )}

              {/* Real-time Automated Eligibility Check Banner */}
              <div
                className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                  isOverallEligible
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : 'bg-amber-50 border-amber-300 text-amber-950'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {isOverallEligible ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                  )}
                  <div>
                    <span className="font-extrabold text-xs block">
                      {isOverallEligible
                        ? 'Automated Eligibility Check: Eligible'
                        : 'Automated Eligibility Notice: Criteria Variance'}
                    </span>
                    <span className="text-[11px] opacity-90 block mt-0.5">
                      {isOverallEligible
                        ? `Matches criteria: Min CGPA ${minCgpaReq}, Allowed Backlogs ${maxBacklogsReq}, ${currentDrive?.genderEligibility || 'Male & Female'}.`
                        : `Check: Gender (${currentDrive?.genderEligibility || 'Any'}), Backlogs (max ${maxBacklogsReq}), or Branch eligibility.`}
                    </span>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase shrink-0 ${
                    isOverallEligible
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-600 text-white'
                  }`}
                >
                  {isOverallEligible ? 'Verified Eligible' : 'Review Criteria'}
                </span>
              </div>

              {/* Preferences */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Preferred Work Location</label>
                  <input
                    type="text"
                    value={formData.preferredLocation}
                    onChange={(e) => setFormData({ ...formData, preferredLocation: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-blue-600"
                    placeholder="e.g. Hyderabad / Dilsukhnagar / Begumpet"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Preferred Shift</label>
                  <select
                    value={formData.preferredShift}
                    onChange={(e) => setFormData({ ...formData, preferredShift: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-blue-600 bg-white"
                  >
                    <option value="Day">Day Shift</option>
                    <option value="Night">Night Shift</option>
                    <option value="Rotational">Rotational</option>
                    <option value="Any">Any Shift</option>
                  </select>
                </div>
              </div>

              {/* Mandatory Affirmation Checkboxes */}
              <div className="space-y-2.5 pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer font-semibold text-slate-800 text-xs">
                  <input
                    type="checkbox"
                    checked={formData.confirmedAccurate}
                    onChange={(e) => setFormData({ ...formData, confirmedAccurate: e.target.checked })}
                    className="w-4 h-4 text-blue-700 rounded mt-0.5"
                  />
                  <span>
                    "I confirm that the information provided by me is accurate."
                  </span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer font-medium text-slate-700 text-xs">
                  <input
                    type="checkbox"
                    checked={formData.agreeProctoring}
                    onChange={(e) => setFormData({ ...formData, agreeProctoring: e.target.checked })}
                    className="w-4 h-4 text-purple-700 rounded mt-0.5"
                  />
                  <span>
                    I understand this is a <strong>Secured Examination</strong>. Any tab switch or window departure will trigger automatic submission and alert the administrator.
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            {activeStep > 1 ? (
              <button
                type="button"
                onClick={() => setActiveStep((prev) => (prev - 1) as any)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-50"
              >
                Cancel
              </button>
            )}

            {activeStep < 4 ? (
              <button
                type="button"
                onClick={() => setActiveStep((prev) => (prev + 1) as any)}
                className="px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold flex items-center gap-1.5 shadow-md shadow-blue-700/20"
              >
                Save & Continue <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={verifying}
                className="px-6 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold flex items-center gap-2 shadow-lg shadow-purple-700/25 disabled:opacity-60 transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
                {verifying ? 'Submitting & Launching Exam...' : 'Submit Application & Enter Proctored Exam'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
