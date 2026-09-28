import {
  User,
  Student,
  Company,
  PlacementDrive,
  Application,
  AptitudeTest,
  Question,
  ExamAttempt,
  ExamSecurityEvent,
  Interview,
  InterviewEvaluation,
  InterviewQuestion,
  CandidateShortlistRecord,
  AppNotification,
  AutomationRule,
} from '../types/index.ts';

// In-memory or localStorage user id for request header
let activeUserId = localStorage.getItem('placementflow_user_id') || 'usr_admin_1';

export const getActiveUserId = () => activeUserId;
export const setActiveUserId = (id: string) => {
  activeUserId = id;
  localStorage.setItem('placementflow_user_id', id);
};

const headers = () => ({
  'Content-Type': 'application/json',
  'x-user-id': activeUserId,
});

export const api = {
  // Auth
  getMe: async (): Promise<{ user: User; student?: Student | null }> => {
    const res = await fetch('/api/auth/me', { headers: headers() });
    return res.json();
  },
  getUsers: async (): Promise<User[]> => {
    const res = await fetch('/api/auth/users', { headers: headers() });
    return res.json();
  },
  switchRole: async (params: { userId?: string; role?: string }): Promise<{ user: User; student?: Student | null }> => {
    const res = await fetch('/api/auth/switch-role', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (data.user) {
      setActiveUserId(data.user.id);
    }
    return data;
  },

  // Dashboard Stats
  getDashboardStats: async () => {
    const res = await fetch('/api/stats/dashboard', { headers: headers() });
    return res.json();
  },

  // Students
  getStudents: async (params?: { branch?: string; status?: string; search?: string; minCgpa?: string }): Promise<Student[]> => {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`/api/students?${query}`, { headers: headers() });
    return res.json();
  },
  getStudentById: async (id: string): Promise<{ student: Student; applications: Application[]; attempts: ExamAttempt[]; interviews: Interview[] }> => {
    const res = await fetch(`/api/students/${id}`, { headers: headers() });
    return res.json();
  },
  createStudent: async (student: Partial<Student>): Promise<Student> => {
    const res = await fetch('/api/students', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(student),
    });
    return res.json();
  },
  updateStudent: async (id: string, updates: Partial<Student>): Promise<Student> => {
    const res = await fetch(`/api/students/${id}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(updates),
    });
    return res.json();
  },
  deleteStudent: async (id: string): Promise<{ success: boolean }> => {
    const res = await fetch(`/api/students/${id}`, {
      method: 'DELETE',
      headers: headers(),
    });
    return res.json();
  },

  // Companies
  getCompanies: async (): Promise<Company[]> => {
    const res = await fetch('/api/companies', { headers: headers() });
    return res.json();
  },
  createCompany: async (company: Partial<Company>): Promise<Company> => {
    const res = await fetch('/api/companies', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(company),
    });
    return res.json();
  },
  updateCompany: async (id: string, company: Partial<Company>): Promise<Company> => {
    const res = await fetch(`/api/companies/${id}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(company),
    });
    return res.json();
  },
  deleteCompany: async (id: string): Promise<{ success: boolean }> => {
    const res = await fetch(`/api/companies/${id}`, {
      method: 'DELETE',
      headers: headers(),
    });
    return res.json();
  },

  // Drives
  getDrives: async (): Promise<PlacementDrive[]> => {
    const res = await fetch('/api/drives', { headers: headers() });
    return res.json();
  },
  createDrive: async (drive: Partial<PlacementDrive>): Promise<PlacementDrive> => {
    const res = await fetch('/api/drives', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(drive),
    });
    return res.json();
  },
  updateDrive: async (id: string, updates: Partial<PlacementDrive>): Promise<PlacementDrive> => {
    const res = await fetch(`/api/drives/${id}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(updates),
    });
    return res.json();
  },
  deleteDrive: async (id: string): Promise<{ success: boolean }> => {
    const res = await fetch(`/api/drives/${id}`, {
      method: 'DELETE',
      headers: headers(),
    });
    return res.json();
  },
  checkEligibility: async (driveId: string, studentId?: string) => {
    const res = await fetch(`/api/drives/${driveId}/check-eligibility`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ studentId }),
    });
    return res.json();
  },

  // Applications
  getApplications: async (): Promise<Application[]> => {
    const res = await fetch('/api/applications', { headers: headers() });
    return res.json();
  },
  applyForDrive: async (driveId: string, studentId?: string): Promise<Application> => {
    const res = await fetch('/api/applications', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ driveId, studentId }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to submit application');
    }
    return res.json();
  },
  updateApplicationStatus: async (id: string, status: string, adminNotes?: string): Promise<Application> => {
    const res = await fetch(`/api/applications/${id}/status`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify({ status, adminNotes }),
    });
    return res.json();
  },

  // Question Bank
  getQuestions: async (params?: { category?: string; difficulty?: string; search?: string }): Promise<Question[]> => {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`/api/questions?${query}`, { headers: headers() });
    return res.json();
  },
  createQuestion: async (question: Partial<Question>): Promise<Question> => {
    const res = await fetch('/api/questions', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(question),
    });
    return res.json();
  },
  updateQuestion: async (id: string, question: Partial<Question>): Promise<Question> => {
    const res = await fetch(`/api/questions/${id}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(question),
    });
    return res.json();
  },
  deleteQuestion: async (id: string): Promise<{ success: boolean }> => {
    const res = await fetch(`/api/questions/${id}`, {
      method: 'DELETE',
      headers: headers(),
    });
    return res.json();
  },

  // Aptitude Tests
  getTests: async (): Promise<AptitudeTest[]> => {
    const res = await fetch('/api/tests', { headers: headers() });
    return res.json();
  },
  getTestById: async (id: string): Promise<AptitudeTest & { questions: Question[] }> => {
    const res = await fetch(`/api/tests/${id}`, { headers: headers() });
    return res.json();
  },
  createTest: async (test: Partial<AptitudeTest>): Promise<AptitudeTest> => {
    const res = await fetch('/api/tests', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(test),
    });
    return res.json();
  },

  // Exam Workflow
  startExam: async (testId: string, studentInfo?: any) => {
    const res = await fetch('/api/exams/start', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ testId, studentInfo }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to start exam');
    }
    return res.json();
  },
  submitExam: async (attemptId: string, answers: { questionId: string; selectedOptions: number[] }[]) => {
    const res = await fetch('/api/exams/submit', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ attemptId, answers }),
    });
    return res.json();
  },
  autoSubmitExam: async (payload: {
    attemptId: string;
    answers: { questionId: string; selectedOptions: number[] }[];
    eventType: string;
    details: string;
    browserSource: string;
  }) => {
    const res = await fetch('/api/exams/auto-submit', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(payload),
    });
    return res.json();
  },
  getExamAttempts: async (params?: { testId?: string; driveId?: string; securityStatus?: string }): Promise<ExamAttempt[]> => {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`/api/exams/attempts?${query}`, { headers: headers() });
    if (!res.ok) return [];
    return res.json();
  },
  getMyAttempts: async (): Promise<Partial<ExamAttempt>[]> => {
    const res = await fetch('/api/exams/my-attempts', { headers: headers() });
    return res.json();
  },
  reviewExamAttempt: async (attemptId: string, payload: { isPassed?: boolean; adminRemarks?: string; securityStatus?: string }) => {
    const res = await fetch(`/api/exams/attempts/${attemptId}/review`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  // Security Dashboard
  getSecurityEvents: async (): Promise<ExamSecurityEvent[]> => {
    const res = await fetch('/api/security/events', { headers: headers() });
    if (!res.ok) return [];
    return res.json();
  },
  getSecurityStats: async () => {
    const res = await fetch('/api/security/stats', { headers: headers() });
    if (!res.ok) return null;
    return res.json();
  },

  // Interviews
  getInterviews: async (): Promise<Interview[]> => {
    const res = await fetch('/api/interviews', { headers: headers() });
    return res.json();
  },
  createInterview: async (interview: Partial<Interview>): Promise<Interview> => {
    const res = await fetch('/api/interviews', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(interview),
    });
    return res.json();
  },
  updateInterview: async (id: string, updates: Partial<Interview>): Promise<Interview> => {
    const res = await fetch(`/api/interviews/${id}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(updates),
    });
    return res.json();
  },
  getInterviewQuestions: async (params?: { role?: string; round?: string; difficulty?: string }): Promise<InterviewQuestion[]> => {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`/api/interview-questions?${query}`, { headers: headers() });
    return res.json();
  },
  generateInterviewQuestions: async (role: string, difficulty?: string) => {
    const res = await fetch('/api/interview-questions/generate', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ role, difficulty }),
    });
    return res.json();
  },
  evaluateInterview: async (interviewId: string, evaluation: Partial<InterviewEvaluation>): Promise<InterviewEvaluation> => {
    const res = await fetch(`/api/interviews/${interviewId}/evaluate`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(evaluation),
    });
    return res.json();
  },
  getInterviewEvaluation: async (interviewId: string): Promise<InterviewEvaluation> => {
    const res = await fetch(`/api/interviews/${interviewId}/evaluation`, { headers: headers() });
    return res.json();
  },

  // Shortlists & Scoring
  getShortlistData: async (driveId: string) => {
    const res = await fetch(`/api/shortlists/${driveId}`, { headers: headers() });
    return res.json();
  },
  updateCandidateShortlist: async (driveId: string, payload: { studentId: string; finalStatus: string; overrideReason?: string }) => {
    const res = await fetch(`/api/shortlists/${driveId}/update`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(payload),
    });
    return res.json();
  },
  updateShortlistWeights: async (weights: { aptitudeWeight: number; technicalWeight: number; hrWeight: number; communicationWeight: number }) => {
    const res = await fetch('/api/shortlists/weights', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(weights),
    });
    return res.json();
  },

  // Notifications
  getNotifications: async (): Promise<AppNotification[]> => {
    const res = await fetch('/api/notifications', { headers: headers() });
    return res.json();
  },
  markNotificationRead: async (id: string) => {
    const res = await fetch(`/api/notifications/${id}/read`, {
      method: 'PUT',
      headers: headers(),
    });
    return res.json();
  },
  markAllNotificationsRead: async () => {
    const res = await fetch('/api/notifications/mark-all-read', {
      method: 'POST',
      headers: headers(),
    });
    return res.json();
  },

  // Automations
  getAutomations: async (): Promise<AutomationRule[]> => {
    const res = await fetch('/api/automations', { headers: headers() });
    return res.json();
  },
  triggerAutomation: async (id: string) => {
    const res = await fetch(`/api/automations/${id}/trigger`, {
      method: 'POST',
      headers: headers(),
    });
    return res.json();
  },

  // Reports
  getReportsSummary: async () => {
    const res = await fetch('/api/reports/summary', { headers: headers() });
    return res.json();
  },

  // AI-Powered Features (Gemini 2.5 Flash)
  parseResume: async (resumeText: string) => {
    const res = await fetch('/api/ai/parse-resume', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ resumeText }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to parse resume');
    }
    return res.json();
  },
  generateAiInterviewQuestions: async (payload: {
    candidateName: string;
    candidateSkills: string[];
    candidateProjects: string[];
    jobRole: string;
    jobDescription: string;
    companyName: string;
    round?: string;
  }) => {
    const res = await fetch('/api/ai/generate-interview-questions', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to generate interview questions');
    }
    return res.json();
  },

  // Reset System
  resetDatabase: async () => {
    const res = await fetch('/api/system/reset-db', {
      method: 'POST',
      headers: headers(),
    });
    return res.json();
  },
};
