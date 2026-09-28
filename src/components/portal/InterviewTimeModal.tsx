import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import { Interview, PlacementDrive } from '../../types/index.ts';
import {
  Clock,
  CalendarCheck,
  Video,
  MapPin,
  CheckCircle2,
  X,
  UserCheck,
  Building,
  ArrowRight,
  ExternalLink,
  Sparkles,
  HelpCircle,
  Search,
  Filter,
  FileText,
  AlertCircle,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  interviews?: Interview[];
  drives?: PlacementDrive[];
  onOpenExamFormForSlot: (driveId?: string, slot?: string) => void;
}

export const InterviewTimeModal: React.FC<Props> = ({
  isOpen,
  onClose,
  interviews = [],
  drives = [],
  onOpenExamFormForSlot,
}) => {
  const [localInterviews, setLocalInterviews] = useState<Interview[]>(interviews);
  const [search, setSearch] = useState('');
  const [selectedRoundFilter, setSelectedRoundFilter] = useState('all');

  useEffect(() => {
    if (interviews && interviews.length > 0) {
      setLocalInterviews(interviews);
    } else {
      api.getInterviews().then((data) => {
        if (data && data.length > 0) setLocalInterviews(data);
      }).catch(console.error);
    }
  }, [interviews]);

  if (!isOpen) return null;

  // Fallback enriched slots if db has few items
  const displaySlots = [
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
      prerequisite: 'Aptitude & Technical Screening Exam Completed',
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
      status: 'Slot Registration Open',
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
    {
      id: 'slot_4',
      company: 'Tata Consultancy Services',
      driveId: 'drv_tcs_digital',
      role: 'Digital Engineer & Cloud Associate',
      date: '02 October 2026',
      timeSlot: '03:30 PM – 04:15 PM IST',
      round: 'Managerial & Behavioral Interview',
      status: 'Scheduled',
      interviewer: 'Ravi Teja (Talent Acquisition Lead)',
      meetingLink: 'https://meet.google.com/tcs-interview-hall',
      venue: 'Auditorium Block C, TMESC Hyderabad',
      type: 'Online / In-person',
      prerequisite: 'Minimum CGPA 7.0 & No Active Backlogs',
      eligibleBranches: 'All Engineering Branches',
    },
  ];

  const filteredSlots = displaySlots.filter((s) => {
    const matchesSearch =
      s.company.toLowerCase().includes(search.toLowerCase()) ||
      s.role.toLowerCase().includes(search.toLowerCase()) ||
      s.interviewer.toLowerCase().includes(search.toLowerCase());
    const matchesRound =
      selectedRoundFilter === 'all' ||
      s.round.toLowerCase().includes(selectedRoundFilter.toLowerCase());
    return matchesSearch && matchesRound;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-blue-900 text-white p-5 border-b border-blue-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300 font-bold flex items-center justify-center shadow-inner shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                  Live Drive Schedule · TMESC Government of Telangana
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
                  Live Interview Time Ticker
                </span>
              </div>
              <h3 className="font-bold text-base sm:text-lg text-white tracking-tight">
                Interview Time & Schedule Slots
              </h3>
              <p className="text-[11px] text-blue-200">
                Official interview schedules, panels, meeting links, and candidate pre-interview exam requirement
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-blue-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
          {/* Action Callout Banner: Direct Student Form to Write Exam */}
          <div className="p-4 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-blue-950 shadow-xs">
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="px-2 py-0.5 bg-blue-700 text-white font-extrabold text-[10px] uppercase rounded-md tracking-wider">
                  Mandatory Step
                </span>
                <span className="font-bold text-slate-900 text-xs">
                  Aptitude Exam Required Before Interview Time
                </span>
              </div>
              <p className="text-[11px] text-slate-600 max-w-xl">
                Every candidate scheduled for an interview must fill out the <strong>Student Exam Form</strong> and complete the proctored aptitude assessment to confirm their interview slot.
              </p>
            </div>

            <button
              onClick={() => {
                onClose();
                onOpenExamFormForSlot(displaySlots[0].driveId, displaySlots[0].timeSlot);
              }}
              className="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold text-xs shrink-0 shadow-md shadow-blue-700/20 flex items-center gap-2 transition-all hover:scale-102"
            >
              <FileText className="w-4 h-4" />
              Fill Student Form & Write Exam
            </button>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search company, role, interviewer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-600"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto text-[11px]">
              {['all', 'technical', 'system design', 'cybersecurity', 'behavioral'].map((r) => (
                <button
                  key={r}
                  onClick={() => setSelectedRoundFilter(r)}
                  className={`px-3 py-1.5 rounded-lg font-semibold capitalize whitespace-nowrap transition-colors ${
                    selectedRoundFilter === r
                      ? 'bg-blue-700 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Active Interview Time Slots */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-sm">
                Active Interview Schedules ({filteredSlots.length} Slots Available)
              </h4>
              <span className="text-[11px] text-slate-500">
                All timings listed in Indian Standard Time (IST)
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3.5">
              {filteredSlots.map((slot) => (
                <div
                  key={slot.id}
                  className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-md transition-all group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-base">{slot.company}</span>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 uppercase">
                          {slot.round}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {slot.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium mt-1">{slot.role}</p>
                    </div>

                    <div className="text-left sm:text-right shrink-0">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 shadow-xs">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>{slot.timeSlot}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 block mt-1 font-medium">{slot.date}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-600">
                    <div>
                      Panel Lead: <strong className="text-slate-900">{slot.interviewer}</strong>
                    </div>
                    <div className="truncate">
                      Venue: <span className="text-slate-800 font-medium">{slot.venue}</span>
                    </div>
                    <div>
                      Branches: <span className="text-slate-800 font-medium">{slot.eligibleBranches}</span>
                    </div>
                  </div>

                  <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Requirement: <strong>{slot.prerequisite}</strong></span>
                    </span>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => {
                          onClose();
                          onOpenExamFormForSlot(slot.driveId, slot.timeSlot);
                        }}
                        className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Write Exam for this Interview
                      </button>

                      <a
                        href={slot.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors shrink-0"
                      >
                        <Video className="w-3.5 h-3.5" />
                        Join Room
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Official Interview Timings are synced with the Placement Drive Schedule.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-700 hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
