export type UserRole =
  | 'super_admin'
  | 'placement_officer'
  | 'faculty_coordinator'
  | 'recruiter'
  | 'student';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  studentId?: string;
  companyId?: string;
  college?: string;
  department?: string;
}

export type PlacementStatus =
  | 'Not Placed'
  | 'Applied'
  | 'Shortlisted'
  | 'Interview'
  | 'Selected'
  | 'Rejected'
  | 'Placed';

export interface Student {
  id: string;
  studentId: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  gender: 'Male' | 'Female' | 'Other';
  aadhaarNumber?: string;
  address?: string;
  city?: string;
  district?: string;
  state?: string;
  highestQualification?: string;
  college: string;
  university?: string;
  branch: string;
  graduationYear: number;
  sscPercentage?: number;
  interPercentage?: number;
  cgpa: number;
  backlogs: number;
  skills: string[];
  communicationSkills?: string;
  languagesKnown?: string[];
  computerSkills?: string[];
  jobSpecificSkills?: string[];
  employmentStatus?: 'Fresher' | 'Experienced';
  experienceYears?: number;
  currentEmployer?: string;
  previousExperience?: string;
  certifications: string[];
  projects: {
    title: string;
    description: string;
    technologies: string[];
  }[];
  resumeUrl?: string;
  resumeFileName?: string;
  photoUrl?: string;
  preferredJobId?: string;
  preferredLocation?: string;
  preferredShift?: string;
  confirmedAccurate?: boolean;
  placementStatus: PlacementStatus;
  placedCompany?: string;
  salaryPackageLpa?: number;
  createdAt: string;
}

export interface Company {
  id: string;
  name: string;
  logo: string;
  industry: string;
  website: string;
  hrName: string;
  hrEmail: string;
  hrPhone: string;
  location: string;
  jobRoles: string[];
  salaryPackage: string;
  hiringHistory: {
    year: number;
    hiresCount: number;
    roles: string[];
    averagePackageLpa: number;
  }[];
  createdAt: string;
}

export type DriveStatus =
  | 'Draft'
  | 'Published'
  | 'Applications Open'
  | 'Applications Closed'
  | 'Assessment'
  | 'Interview'
  | 'Selection'
  | 'Completed';

export interface PlacementDrive {
  id: string;
  jobCode?: string;
  companyId: string;
  companyName: string;
  companyLogo: string;
  jobRole: string;
  jobDescription: string;
  jobLocation: string;
  workMode: 'On-site' | 'Hybrid' | 'Remote' | 'Work from Home';
  salary: string;
  ctcLpa: number;
  vacancies: number;
  minCgpa: number;
  allowedBranches: string[];
  maxBacklogs: number;
  graduationYear: number;
  requiredSkills: string[];
  qualificationRequired?: string;
  genderEligibility?: 'Male' | 'Female' | 'Male & Female';
  experienceRequired?: string;
  languagesRequired?: string[];
  shiftTiming?: string;
  noBTechAllowed?: boolean;
  assessmentStatus?: string;
  applicationStartDate: string;
  applicationDeadline: string;
  assessmentDate: string;
  interviewDate: string;
  status: DriveStatus;
  createdAt: string;
}

export interface EligibilityResult {
  isEligible: boolean;
  reasons: string[];
}

export type ApplicationStatus =
  | 'Applied'
  | 'Eligible'
  | 'Not Eligible'
  | 'Assessment Pending'
  | 'Assessment Completed'
  | 'Shortlisted'
  | 'Interview Scheduled'
  | 'Selected'
  | 'Rejected';

export interface Application {
  id: string;
  driveId: string;
  driveRole: string;
  companyName: string;
  companyLogo: string;
  studentId: string;
  studentDbId: string;
  studentName: string;
  studentEmail: string;
  studentBranch: string;
  studentCgpa: number;
  appliedAt: string;
  status: ApplicationStatus;
  isEligible: boolean;
  ineligibilityReason?: string;
  assessmentAttemptId?: string;
  interviewId?: string;
  adminNotes?: string;
}

export type QuestionCategory =
  | 'Quantitative'
  | 'Logical Reasoning'
  | 'Verbal Ability'
  | 'Data Interpretation'
  | 'Computer Fundamentals'
  | 'Programming'
  | 'Job-Specific';

export type QuestionDifficulty = 'Easy' | 'Medium' | 'Hard';

export type QuestionType = 'MCQ' | 'Multiple Answer' | 'True/False' | 'Coding';

export interface Question {
  id: string;
  part?: 'PART A' | 'PART B';
  category: QuestionCategory | string;
  subcategory: string;
  difficulty: QuestionDifficulty;
  type: QuestionType;
  text: string;
  codeSnippet?: string;
  options: string[];
  // CRITICAL: correctAnswers and explanation are stripped for students by backend!
  correctAnswers?: number[]; // 0-indexed indices
  marks: number;
  negativeMarks: number;
  explanation?: string;
  jobRole?: string;
  companyId?: string;
}

export interface AptitudeTest {
  id: string;
  driveId: string;
  title: string;
  companyName: string;
  jobRole: string;
  durationMinutes: number;
  totalQuestions: number;
  totalMarks: number;
  passingPercentage: number;
  negativeMarking: number;
  startDate: string;
  endDate: string;
  maxAttempts: number;
  questionIds: string[];
  createdAt: string;
}

export type SubmissionType = 'normal' | 'auto_submitted';

export type SecurityStatus =
  | 'Normal'
  | 'Warning'
  | 'Auto Submitted'
  | 'Suspicious Activity';

export interface ExamAttempt {
  id: string;
  testId: string;
  testTitle: string;
  driveId: string;
  companyName: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentBranch: string;
  studentCgpa: number;
  startTime: string;
  submissionTime: string;
  submissionType: SubmissionType;
  autoSubmitReason?: string;
  attemptNumber: number;
  answers: {
    questionId: string;
    selectedOptions: number[];
    isCorrect?: boolean; // ADMIN ONLY
    marksObtained?: number; // ADMIN ONLY
  }[];
  // CRITICAL: Scores & evaluation are strictly ADMIN ONLY!
  aptitudeScore?: number;
  domainScore?: number;
  score?: number;
  percentage?: number;
  isPassed?: boolean;
  securityStatus: SecurityStatus;
  securityEventsCount: number;
  adminReviewed: boolean;
  adminRemarks?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export type BrowserSecuritySource =
  | 'Page Visibility API'
  | 'Focus/Blur Event'
  | 'Fullscreen API'
  | 'Lifecycle API';

export interface ExamSecurityEvent {
  id: string;
  attemptId: string;
  testId: string;
  studentId: string;
  studentName: string;
  eventType:
    | 'window_changed'
    | 'tab_switched'
    | 'fullscreen_exited'
    | 'focus_lost'
    | 'visibility_hidden';
  timestamp: string;
  details: string;
  browserSource: BrowserSecuritySource;
}

export type InterviewRound =
  | 'Technical'
  | 'Coding'
  | 'Project'
  | 'Managerial'
  | 'HR';

export type InterviewStatus =
  | 'Scheduled'
  | 'Completed'
  | 'Rescheduled'
  | 'Cancelled'
  | 'Selected'
  | 'Rejected';

export interface InterviewQuestion {
  id: string;
  role: 'Software Developer' | 'Cybersecurity' | 'Data Analyst' | 'HR/Management';
  category:
    | 'Technical'
    | 'Coding'
    | 'Project'
    | 'Problem Solving'
    | 'Behavioral/HR'
    | 'Role Specific';
  subcategory: string;
  question: string;
  expectedAnswerGuide: string;
  sampleFollowUps: string[];
  difficulty: QuestionDifficulty;
  round: InterviewRound;
}

export interface Interview {
  id: string;
  driveId: string;
  candidateId: string; // student id
  candidateName: string;
  candidateEmail: string;
  candidateBranch: string;
  candidateCgpa: number;
  companyId: string;
  companyName: string;
  interviewerName: string;
  interviewerEmail: string;
  round: InterviewRound;
  date: string;
  time: string;
  durationMinutes: number;
  interviewType: 'Online' | 'In-person';
  meetingLink?: string;
  location?: string;
  status: InterviewStatus;
  generatedQuestions?: InterviewQuestion[];
  evaluationId?: string;
  createdAt: string;
}

export interface InterviewEvaluation {
  id: string;
  interviewId: string;
  candidateId: string;
  technicalKnowledgeScore: number; // /10
  problemSolvingScore: number; // /10
  communicationScore: number; // /10
  projectKnowledgeScore: number; // /10
  roleSpecificScore: number; // /10
  teamworkScore: number; // /10
  overallPerformanceScore: number; // /10
  averageScore: number; // /10
  strengths: string;
  weaknesses: string;
  comments: string;
  recommendation: 'Strongly Recommended' | 'Recommended' | 'Hold' | 'Not Recommended';
  evaluatedAt: string;
  evaluatedBy: string;
}

export interface ShortlistWeights {
  aptitudeWeight: number; // default 40
  technicalWeight: number; // default 30
  hrWeight: number; // default 20
  communicationWeight: number; // default 10
}

export interface CandidateShortlistRecord {
  studentId: string;
  studentName: string;
  studentEmail: string;
  branch: string;
  cgpa: number;
  driveId: string;
  // ADMIN ONLY fields
  aptitudeScore?: number;
  aptitudePercentage?: number;
  technicalScore?: number;
  hrScore?: number;
  selectionScore?: number;
  aptitudeStatus?: 'Passed' | 'Failed' | 'Auto Submitted' | 'Not Attempted';
  interviewStatus?: string;
  finalStatus: 'Shortlisted' | 'Not Shortlisted' | 'Selected' | 'Rejected' | 'Pending';
  overrideReason?: string;
  overriddenBy?: string;
  securityStatus: SecurityStatus;
}

export interface AppNotification {
  id: string;
  targetRole: UserRole | 'all';
  targetUserId?: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'security_alert';
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  description: string;
  status: 'Active' | 'Paused';
  lastExecuted: string;
  nextExecution: string;
  actionsTakenCount: number;
}
