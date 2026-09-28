import React, { useState } from 'react';
import { PlacementDrive, AptitudeTest, Interview } from '../../types/index.ts';
import { StudentExamEntryModal } from './StudentExamEntryModal.tsx';
import { InterviewTimeModal } from './InterviewTimeModal.tsx';
import {
  Home,
  Building2,
  Users,
  Briefcase,
  GraduationCap,
  CalendarCheck,
  Award,
  CheckCircle2,
  ChevronRight,
  UserCheck,
  UserPlus,
  LogIn,
  Clock,
  Sparkles,
  FileCheck,
  ShieldCheck,
  ExternalLink,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  FileText,
  Video,
  Info,
  X,
  Search,
} from 'lucide-react';

interface Props {
  drives: PlacementDrive[];
  tests: AptitudeTest[];
  interviews: Interview[];
  onLoginAs: (role: 'student' | 'super_admin' | 'placement_officer' | 'recruiter') => void;
  onNavigateToSection: (section: string) => void;
  onLaunchExamDirectly: (testId: string, studentInfo: any) => void;
  onSwitchToDashboard?: () => void;
}

export const PublicLandingPage: React.FC<Props> = ({
  drives,
  tests,
  interviews,
  onLoginAs,
  onNavigateToSection,
  onLaunchExamDirectly,
  onSwitchToDashboard,
}) => {
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [isInterviewTimeModalOpen, setIsInterviewTimeModalOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('Home');
  const [selectedDriveForExam, setSelectedDriveForExam] = useState<string | undefined>();
  const [selectedSlotForExam, setSelectedSlotForExam] = useState<string | undefined>();
  const [infoModalContent, setInfoModalContent] = useState<{ title: string; body: string } | null>(null);

  // Dedicated interview slots for live display
  const liveInterviewSlots = [
    {
      id: 'slot_1',
      company: 'Google India',
      driveId: 'drv_google_sde',
      role: 'Software Development Engineer (SDE-1)',
      date: 'Today, 28 September 2026',
      timeSlot: '11:30 AM – 12:15 PM IST',
      round: 'Technical Architecture & Coding',
      status: 'Live & On Schedule',
      interviewer: 'Kavita Sengupta (Google Tech Lead)',
      meetingLink: 'https://meet.google.com/xyz-placement-google',
      venue: 'Interview Room 4A, Telangana Minorities Study Circle, Hyderabad',
      type: 'Hybrid (Online / Walk-in)',
      prerequisite: 'Aptitude Screening Exam Completed',
      eligibleBranches: 'CSE, ECE, EEE, IT',
    },
    {
      id: 'slot_2',
      company: 'Razorpay',
      driveId: 'drv_razorpay_dev',
      role: 'Full Stack & Payment Systems Engineer',
      date: 'Tomorrow, 29 September 2026',
      timeSlot: '02:00 PM – 02:45 PM IST',
      round: 'Core System Design & Concurrency',
      status: 'Slot Booking Open',
      interviewer: 'Aditi Mathur (Engineering Manager)',
      meetingLink: 'https://meet.google.com/razorpay-interview-panel',
      venue: 'Virtual Room Beta & Conference Hall 2',
      type: 'Online Video Conference',
      prerequisite: 'Aptitude Test Score >= 65%',
      eligibleBranches: 'CSE, ECE, IT',
    },
    {
      id: 'slot_3',
      company: 'Cisco Systems',
      driveId: 'drv_cisco_security',
      role: 'Cybersecurity Operations Analyst',
      date: '30 September 2026',
      timeSlot: '10:00 AM – 10:45 AM IST',
      round: 'SOC Incident Response & Networks',
      status: 'Confirmed Interview Schedule',
      interviewer: 'Manish Tiwari (Security Architect)',
      meetingLink: 'https://cisco.webex.com/meet/placement-round',
      venue: 'Main Seminar Hall, TMESC Campus, Hyderabad',
      type: 'On-site Assessment & Interview',
      prerequisite: 'Verified Student Exam Form',
      eligibleBranches: 'CSE, ECE, EEE',
    },
  ];

  const handleOpenExamFormWithSlot = (driveId?: string, slot?: string) => {
    setSelectedDriveForExam(driveId);
    setSelectedSlotForExam(slot);
    setIsExamModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* 1. OFFICIAL GOVERNMENT OF TELANGANA HEADER */}
      <header className="bg-gradient-to-r from-[#072559] via-[#0B3B82] to-[#072559] text-white py-4 px-4 sm:px-8 border-b-2 border-amber-400 relative overflow-hidden shadow-md">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
          {/* Left: Government of Telangana Crest */}
          <div className="flex items-center gap-3.5">
            <div className="w-16 h-16 rounded-full bg-white p-1 shadow-lg border-2 border-amber-400 flex items-center justify-center shrink-0">
              <div className="w-full h-full rounded-full border border-emerald-600 flex flex-col items-center justify-center text-center p-0.5">
                <span className="text-[7px] font-bold text-emerald-800 uppercase leading-none">GOVT OF</span>
                <span className="text-[8px] font-extrabold text-amber-700 tracking-tighter">TELANGANA</span>
                <div className="w-4 h-3 bg-emerald-700 rounded-t-xs mt-0.5" />
                <span className="text-[6px] text-slate-700 leading-none mt-0.5">తెలంగాణ</span>
              </div>
            </div>

            <div className="text-center md:text-left">
              <h2 className="text-xs sm:text-sm font-bold tracking-widest uppercase text-amber-300">
                GOVERNMENT OF TELANGANA
              </h2>
              <h1 className="text-base sm:text-xl lg:text-2xl font-extrabold tracking-tight text-white mt-0.5 uppercase drop-shadow-xs">
                TELANGANA MINORITIES STUDY CIRCLE & CAREER COUNSELING CENTRE
              </h1>
              <p className="text-[11px] sm:text-xs text-blue-100 font-semibold tracking-wide">
                MINORITIES WELFARE DEPARTMENT
              </p>
            </div>
          </div>

          {/* Right: Commission & Quick Portal Link */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex flex-col text-right">
              <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">
                COMMISSIONERATE OF MINORITIES WELFARE
              </span>
              <span className="text-xs text-blue-200">
                Government of Telangana, Hyderabad
              </span>
            </div>

            {onSwitchToDashboard && (
              <button
                onClick={onSwitchToDashboard}
                className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-900 rounded-xl font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4 text-slate-900" />
                Admin Dashboard
              </button>
            )}
          </div>
        </div>

        {/* Golden Motto Ribbon Strip */}
        <div className="max-w-7xl mx-auto mt-3 pt-2 border-t border-blue-700/60 flex items-center justify-center">
          <div className="inline-flex items-center gap-3 sm:gap-6 text-[10px] sm:text-xs font-bold text-amber-300 tracking-wider uppercase">
            <span>SKILLS</span>
            <span className="text-blue-300">|</span>
            <span>GUIDANCE</span>
            <span className="text-blue-300">|</span>
            <span>OPPORTUNITIES</span>
            <span className="text-blue-300">|</span>
            <span>BRIGHTER FUTURES</span>
          </div>
        </div>
      </header>

      {/* 2. MAIN HORIZONTAL NAVIGATION BAR */}
      <nav className="bg-white border-b border-slate-200 shadow-xs sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          {/* Nav links */}
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2.5 text-xs font-semibold text-slate-700">
            <button
              onClick={() => {
                setActiveNav('Home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                activeNav === 'Home'
                  ? 'bg-blue-50 text-blue-700 font-bold'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              <Home className="w-4 h-4 text-blue-700" />
              Home
            </button>

            <button
              onClick={() => {
                setInfoModalContent({
                  title: 'About Telangana Minorities Study Circle',
                  body: 'Telangana Minorities Study Circle & Career Counseling Centre (TMESC) functions under the Minorities Welfare Department, Government of Telangana. It delivers world-class campus recruitment automation, aptitude assessment training, pre-interview screening, and technical guidance for minority youth across Telangana state.',
                });
              }}
              className="px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              About
            </button>

            <button
              onClick={() => onNavigateToSection('drives')}
              className="px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Placement Drives ({drives.length})
            </button>

            <button
              onClick={() => onNavigateToSection('companies')}
              className="px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Companies
            </button>

            <button
              onClick={() => setIsInterviewTimeModalOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-300 font-bold hover:bg-amber-100 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              Interview Times
            </button>

            <button
              onClick={() => handleOpenExamFormWithSlot()}
              className="px-3.5 py-1.5 rounded-lg bg-purple-50 text-purple-800 border border-purple-300 font-bold hover:bg-purple-100 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              Write Exam Form
            </button>

            <button
              onClick={() => {
                setInfoModalContent({
                  title: 'Contact Helpline & Placement Cell',
                  body: 'Official TMESC Hyderabad Placement Office\nHelpline Phone: 040-23236112 / 23236113\nEmail: placements@t-minortiesstudycircle.telangana.gov.in\nAddress: TMESC Building, Gunfoundry, Hyderabad, Telangana 500001.',
                });
              }}
              className="px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors hidden sm:block"
            >
              Contact
            </button>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 py-2">
            <button
              onClick={() => onLoginAs('student')}
              className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              Student Login
            </button>

            <button
              onClick={() => handleOpenExamFormWithSlot()}
              className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              Write Exam
            </button>
          </div>
        </div>
      </nav>

      {/* 3. HERO SECTION (PLACEMENT DRIVE AUTOMATION PORTAL) */}
      <section className="bg-white border-b border-slate-200 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-900 font-bold text-xs mb-3 border border-blue-200">
                  <span className="w-2 h-2 rounded-full bg-blue-700 animate-ping" />
                  <span>State Government Placement Drive Live Portal</span>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  Placement Drive <br />
                  <span className="text-[#0B3B82] drop-shadow-xs">Automation Portal</span>
                </h1>
                <p className="text-sm sm:text-base text-slate-600 font-medium mt-3 max-w-xl leading-relaxed">
                  Connecting Talented Students with Top Companies for a Brighter Future — with automated eligibility, proctored examinations, and live interview schedules.
                </p>
              </div>

              {/* 5 Process Badges */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  <Briefcase className="w-3.5 h-3.5" /> Manage
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <FileCheck className="w-3.5 h-3.5" /> Assess
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  <Users className="w-3.5 h-3.5" /> Shortlist
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                  <CalendarCheck className="w-3.5 h-3.5" /> Interview
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                  <Award className="w-3.5 h-3.5" /> Place
                </span>
              </div>

              {/* The 3 Primary Role Login Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 max-w-xl">
                {/* 1. Student Login (Dark Blue) */}
                <button
                  onClick={() => onLoginAs('student')}
                  className="w-full py-3.5 px-4 bg-[#0a2558] hover:bg-[#07193d] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-between transition-all group hover:scale-[1.02]"
                >
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-blue-200" />
                    <span>Student Login</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-blue-300 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* 2. Admin Login (Forest/Emerald Green) */}
                <button
                  onClick={() => onLoginAs('placement_officer')}
                  className="w-full py-3.5 px-4 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-between transition-all group hover:scale-[1.02]"
                >
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-100" />
                    <span>Admin Login</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-emerald-200 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* 3. Recruiter Login (Warm Amber/Orange) */}
                <button
                  onClick={() => onLoginAs('recruiter')}
                  className="w-full py-3.5 px-4 bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-between transition-all group hover:scale-[1.02]"
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-amber-100" />
                    <span>Recruiter Login</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-amber-200 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Dedicated User Callouts for "Interview Time" and "Student Form to Write Exam" */}
              <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-50/90 via-indigo-50/80 to-purple-50/90 rounded-2xl border-2 border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-xl">
                <div className="space-y-1 text-center sm:text-left">
                  <span className="px-2 py-0.5 rounded bg-blue-700 text-white font-extrabold text-[10px] uppercase tracking-wider">
                    Candidate Pre-Interview Desk
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm">
                    Student Form to Write Exam for Interview
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    Register candidate credentials, verify eligibility with AI resume parse, and write the proctored aptitude test before your interview slot.
                  </p>
                </div>

                <div className="flex flex-col gap-2 w-full sm:w-auto shrink-0">
                  <button
                    onClick={() => handleOpenExamFormWithSlot()}
                    className="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <FileText className="w-4 h-4" />
                    Fill Form & Write Exam
                  </button>

                  <button
                    onClick={() => setIsInterviewTimeModalOpen(true)}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    Check Interview Times
                  </button>
                </div>
              </div>
            </div>

            {/* Right Photographic Campus Collage */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-900">
                <img
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80"
                  alt="Students at Placement Drive"
                  className="w-full h-80 sm:h-96 object-cover object-top opacity-90 hover:scale-105 transition-transform duration-700"
                />

                <div className="absolute top-4 right-4 space-y-1.5">
                  <span className="px-3 py-1 bg-blue-900/80 backdrop-blur-md text-white font-extrabold text-[10px] rounded-lg tracking-wider block uppercase border border-blue-400/40 text-right">
                    JOBS
                  </span>
                  <span className="px-3 py-1 bg-amber-600/80 backdrop-blur-md text-white font-extrabold text-[10px] rounded-lg tracking-wider block uppercase border border-amber-300/40 text-right">
                    CAREERS
                  </span>
                  <span className="px-3 py-1 bg-emerald-700/80 backdrop-blur-md text-white font-extrabold text-[10px] rounded-lg tracking-wider block uppercase border border-emerald-400/40 text-right">
                    OPPORTUNITIES
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 p-3.5 bg-slate-950/80 backdrop-blur-md rounded-2xl border border-white/20 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold block">88.5% Placement Success</span>
                      <span className="text-[10px] text-slate-300">Over 1,200 Candidates Placed in 2025–26</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigateToSection('reports')}
                    className="text-[11px] font-bold text-amber-300 hover:text-amber-200 underline"
                  >
                    View Stats
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. DEDICATED LIVE INTERVIEW TIMES & SCHEDULES SECTION ("this web site is interview time") */}
      <section className="bg-slate-100 py-12 px-4 sm:px-6 lg:px-8 border-b border-slate-200">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-xs mb-2 border border-amber-300">
                <Clock className="w-3.5 h-3.5 text-amber-700" />
                <span>Live Interview Time Grid</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Current & Upcoming Interview Schedules
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Official interview times, interviewer details, Google Meet room links, and exam prerequisite
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsInterviewTimeModalOpen(true)}
                className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-xl font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <Clock className="w-4 h-4 text-amber-600" />
                View Full Time Table
              </button>

              <button
                onClick={() => handleOpenExamFormWithSlot()}
                className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <FileText className="w-4 h-4" />
                Write Exam Form
              </button>
            </div>
          </div>

          {/* Cards of live interview times */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {liveInterviewSlots.map((slot) => (
              <div
                key={slot.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 uppercase">
                        {slot.round}
                      </span>
                      <h4 className="font-bold text-slate-900 text-base mt-1.5">{slot.company}</h4>
                      <p className="text-xs text-slate-600 font-medium">{slot.role}</p>
                    </div>

                    <span className="px-2.5 py-1 rounded-xl text-xs font-extrabold bg-amber-50 text-amber-900 border border-amber-200 shrink-0 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      {slot.timeSlot.split('–')[0].trim()}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl text-[11px] space-y-1.5 border border-slate-100 text-slate-700">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Date:</span>
                      <span className="font-bold text-slate-900">{slot.date}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Interviewer:</span>
                      <span className="font-medium text-slate-900 truncate max-w-[150px]">{slot.interviewer}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Status:</span>
                      <span className="font-semibold text-emerald-700">{slot.status}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2">
                  <button
                    onClick={() => handleOpenExamFormWithSlot(slot.driveId, slot.timeSlot)}
                    className="w-full py-2 px-3 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Write Exam for this Interview
                  </button>

                  <a
                    href={slot.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-1.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Video className="w-3.5 h-3.5 text-blue-700" />
                    Join Video Conference
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. WORKFLOW STEP CHEVRON BAR */}
      <section className="bg-white py-10 px-4 sm:px-6 lg:px-8 border-b border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
              End-to-End Recruitment Automation
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              How the Placement Drive Process Works
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Step 1: Placement Drives */}
            <div
              onClick={() => onNavigateToSection('drives')}
              className="p-4 bg-slate-50 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold mb-3">
                  <Briefcase className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Placement Drives</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Explore latest job opportunities from top companies
                </p>
              </div>
              <span className="text-[10px] font-bold text-blue-600 mt-3 flex items-center gap-1">
                Explore Drives <ChevronRight className="w-3 h-3" />
              </span>
            </div>

            {/* Step 2: Apply */}
            <div
              onClick={() => onNavigateToSection('applications')}
              className="p-4 bg-slate-50 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold mb-3">
                  <FileCheck className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Apply</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Automatic eligibility verification online
                </p>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 mt-3 flex items-center gap-1">
                View Status <ChevronRight className="w-3 h-3" />
              </span>
            </div>

            {/* Step 3: Aptitude Test */}
            <div
              onClick={() => handleOpenExamFormWithSlot()}
              className="p-4 bg-purple-50/70 rounded-2xl border border-purple-200 shadow-xs hover:border-purple-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold mb-3">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Aptitude Test</h4>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  Fill student form & attend proctored assessments
                </p>
              </div>
              <span className="text-[10px] font-bold text-purple-700 mt-3 flex items-center gap-1">
                Write Exam Form <ChevronRight className="w-3 h-3" />
              </span>
            </div>

            {/* Step 4: Shortlisting */}
            <div
              onClick={() => onNavigateToSection('shortlists')}
              className="p-4 bg-slate-50 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold mb-3">
                  <Users className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Shortlisting</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Automated shortlists based on scores & CGPA
                </p>
              </div>
              <span className="text-[10px] font-bold text-amber-600 mt-3 flex items-center gap-1">
                Shortlists <ChevronRight className="w-3 h-3" />
              </span>
            </div>

            {/* Step 5: Interviews */}
            <div
              onClick={() => setIsInterviewTimeModalOpen(true)}
              className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 shadow-xs hover:border-amber-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold mb-3">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Interviews</h4>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  Technical and HR interviews with live slot times
                </p>
              </div>
              <span className="text-[10px] font-bold text-amber-700 mt-3 flex items-center gap-1">
                Interview Times <ChevronRight className="w-3 h-3" />
              </span>
            </div>

            {/* Step 6: Final Selection */}
            <div
              onClick={() => onNavigateToSection('reports')}
              className="p-4 bg-slate-50 rounded-2xl border border-slate-200 shadow-xs hover:border-teal-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold mb-3">
                  <Award className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Final Selection</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Offer letters and corporate campus placements
                </p>
              </div>
              <span className="text-[10px] font-bold text-teal-600 mt-3 flex items-center gap-1">
                View Reports <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. BOTTOM QUICK STATS & FOOTER */}
      <footer className="bg-[#07193d] text-white py-8 px-4 sm:px-8 border-t border-blue-900">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-900/60 border border-blue-700/50 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-blue-300" />
              </div>
              <div>
                <span className="font-bold text-white text-xs block">Students</span>
                <span className="text-[11px] text-slate-400">Register & Apply</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-900/60 border border-blue-700/50 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <span className="font-bold text-white text-xs block">Companies</span>
                <span className="text-[11px] text-slate-400">Post Job Opportunities</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-900/60 border border-blue-700/50 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <span className="font-bold text-white text-xs block">Assessments</span>
                <span className="text-[11px] text-slate-400">Secure Online Tests</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-900/60 border border-blue-700/50 flex items-center justify-center shrink-0">
                <CalendarCheck className="w-5 h-5 text-purple-300" />
              </div>
              <div>
                <span className="font-bold text-white text-xs block">Interviews</span>
                <span className="text-[11px] text-slate-400">Schedule & Manage</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-900/60 border border-blue-700/50 flex items-center justify-center shrink-0">
                <Award className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <span className="font-bold text-white text-xs block">Placement Success</span>
                <span className="text-[11px] text-slate-400">Building Brighter Futures</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-blue-900/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <span>
              © 2026 Telangana Minorities Study Circle & Career Counseling Centre. Minorities Welfare Department, Government of Telangana.
            </span>
            <div className="flex items-center gap-4 text-[11px]">
              <button onClick={() => setIsInterviewTimeModalOpen(true)} className="hover:text-white">
                Interview Timings
              </button>
              <button onClick={() => handleOpenExamFormWithSlot()} className="hover:text-white">
                Write Exam Form
              </button>
              <button onClick={() => onLoginAs('placement_officer')} className="hover:text-white">
                Placement Officer Console
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* INFORMATION MODAL (replacing window.alert) */}
      {infoModalContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-700" />
                <h3 className="font-bold text-slate-900 text-sm">{infoModalContent.title}</h3>
              </div>
              <button
                onClick={() => setInfoModalContent(null)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">
              {infoModalContent.body}
            </p>
            <div className="text-right pt-2">
              <button
                onClick={() => setInfoModalContent(null)}
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STUDENT EXAM ENTRY & REGISTRATION MODAL ("add a student form to write the exam for interview") */}
      <StudentExamEntryModal
        isOpen={isExamModalOpen}
        onClose={() => setIsExamModalOpen(false)}
        drives={drives}
        tests={tests}
        initialDriveId={selectedDriveForExam}
        initialSlot={selectedSlotForExam}
        onLaunchExam={(testId, studentInfo) => {
          onLaunchExamDirectly(testId, studentInfo);
        }}
      />

      {/* INTERVIEW TIME & SCHEDULE MODAL ("and this web site is interview time") */}
      <InterviewTimeModal
        isOpen={isInterviewTimeModalOpen}
        onClose={() => setIsInterviewTimeModalOpen(false)}
        interviews={interviews}
        drives={drives}
        onOpenExamFormForSlot={(driveId, slot) => {
          handleOpenExamFormWithSlot(driveId, slot);
        }}
      />
    </div>
  );
};
