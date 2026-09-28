import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { db } from './server/db.ts';
import { parseResumeWithAI, generateInterviewQuestionsWithAI } from './server/ai.ts';
import {
  User,
  UserRole,
  Student,
  Company,
  PlacementDrive,
  Application,
  Question,
  AptitudeTest,
  ExamAttempt,
  ExamSecurityEvent,
  Interview,
  InterviewEvaluation,
  InterviewQuestion,
  CandidateShortlistRecord,
  AppNotification,
} from './src/types/index.ts';

const app = express();
const PORT = 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// Session/Active User simulation (in memory per client token or header, defaults to Super Admin)
let currentActiveUserId = 'usr_admin_1';

// Middleware to resolve active user
const resolveUserMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const userIdHeader = (req.headers['x-user-id'] as string) || currentActiveUserId;
  const user = db.get().users.find((u) => u.id === userIdHeader) || db.get().users[0];
  (req as any).user = user;
  next();
};

app.use(resolveUserMiddleware);

// --- AUTH & ROLES ---
app.get('/api/auth/me', (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const student = user.role === 'student' ? db.get().students.find((s) => s.studentId === user.studentId) : null;
  res.json({ user, student });
});

app.get('/api/auth/users', (req: Request, res: Response) => {
  res.json(db.get().users);
});

app.post('/api/auth/switch-role', (req: Request, res: Response) => {
  const { userId, role } = req.body;
  let targetUser: User | undefined;
  if (userId) {
    targetUser = db.get().users.find((u) => u.id === userId);
  } else if (role) {
    targetUser = db.get().users.find((u) => u.role === role);
  }

  if (!targetUser) {
    return res.status(404).json({ error: 'User not found' });
  }

  currentActiveUserId = targetUser.id;
  const student = targetUser.role === 'student' ? db.get().students.find((s) => s.studentId === targetUser?.studentId) : null;
  res.json({ success: true, user: targetUser, student });
});

// --- DASHBOARD ANALYTICS ---
app.get('/api/stats/dashboard', (req: Request, res: Response) => {
  const data = db.get();
  const totalStudents = data.students.length;
  const registeredCompanies = data.companies.length;
  const activePlacementDrives = data.drives.filter((d) => d.status !== 'Completed' && d.status !== 'Draft').length;
  const totalApplications = data.applications.length;
  const eligibleStudents = data.students.filter((s) => s.cgpa >= 7.0 && s.backlogs === 0).length;
  const aptitudeTestsCount = data.aptitudeTests.length;
  const studentsShortlisted = data.students.filter((s) => s.placementStatus === 'Shortlisted').length;
  const interviewsScheduled = data.interviews.filter((i) => i.status === 'Scheduled').length;
  const studentsSelected = data.students.filter((s) => s.placementStatus === 'Selected' || s.placementStatus === 'Placed').length;
  const placementPercentage = totalStudents > 0 ? Math.round((studentsSelected / totalStudents) * 100) : 0;

  // Branch-wise placements
  const branchCounts: Record<string, { total: number; placed: number }> = {
    CSE: { total: 0, placed: 0 },
    ECE: { total: 0, placed: 0 },
    EEE: { total: 0, placed: 0 },
    Mechanical: { total: 0, placed: 0 },
    Civil: { total: 0, placed: 0 },
    Other: { total: 0, placed: 0 },
  };

  data.students.forEach((s) => {
    const b = branchCounts[s.branch] || branchCounts['Other'];
    b.total += 1;
    if (s.placementStatus === 'Placed' || s.placementStatus === 'Selected') {
      b.placed += 1;
    }
  });

  const branchPlacements = Object.entries(branchCounts).map(([branch, val]) => ({
    branch,
    total: val.total,
    placed: val.placed,
    percentage: val.total > 0 ? Math.round((val.placed / val.total) * 100) : 0,
  }));

  // Selection Funnel
  const funnel = [
    { stage: 'Applications', count: data.applications.length },
    { stage: 'Eligible', count: data.applications.filter((a) => a.isEligible).length },
    { stage: 'Aptitude Taken', count: data.examAttempts.length },
    { stage: 'Shortlisted', count: data.applications.filter((a) => a.status === 'Shortlisted').length + 1 },
    { stage: 'Technical Interview', count: data.interviews.filter((i) => i.round === 'Technical').length + 1 },
    { stage: 'HR Interview', count: data.interviews.filter((i) => i.round === 'HR').length + 1 },
    { stage: 'Selected', count: studentsSelected },
  ];

  // Placement Trend
  const placementTrend = [
    { month: 'Jun', placed: 2 },
    { month: 'Jul', placed: 5 },
    { month: 'Aug', placed: 12 },
    { month: 'Sep', placed: 18 },
    { month: 'Oct (Proj)', placed: 28 },
  ];

  // Applications by Drive
  const applicationsByDrive = data.drives.map((d) => ({
    driveId: d.id,
    company: d.companyName,
    role: d.jobRole,
    applications: data.applications.filter((a) => a.driveId === d.id).length,
    vacancies: d.vacancies,
  }));

  res.json({
    kpis: {
      totalStudents,
      registeredCompanies,
      activePlacementDrives,
      totalApplications,
      eligibleStudents,
      aptitudeTestsCount,
      studentsShortlisted,
      interviewsScheduled,
      studentsSelected,
      placementPercentage,
    },
    branchPlacements,
    funnel,
    placementTrend,
    applicationsByDrive,
  });
});

// --- STUDENTS ---
app.get('/api/students', (req: Request, res: Response) => {
  const { branch, status, search, minCgpa } = req.query;
  let list = [...db.get().students];

  if (branch && branch !== 'all') {
    list = list.filter((s) => s.branch === branch);
  }
  if (status && status !== 'all') {
    list = list.filter((s) => s.placementStatus === status);
  }
  if (minCgpa) {
    list = list.filter((s) => s.cgpa >= parseFloat(minCgpa as string));
  }
  if (search) {
    const q = (search as string).toLowerCase();
    list = list.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.studentId.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.skills.some((sk) => sk.toLowerCase().includes(q)),
    );
  }

  res.json(list);
});

app.get('/api/students/:id', (req: Request, res: Response) => {
  const student = db.get().students.find((s) => s.id === req.params.id || s.studentId === req.params.id);
  if (!student) return res.status(404).json({ error: 'Student not found' });

  // Applications, assessments, interviews for this student
  const applications = db.get().applications.filter((a) => a.studentId === student.studentId);
  const attempts = db.get().examAttempts.filter((a) => a.studentId === student.studentId);
  const interviews = db.get().interviews.filter((i) => i.candidateId === student.id || i.candidateId === student.studentId);

  res.json({ student, applications, attempts, interviews });
});

app.post('/api/students', (req: Request, res: Response) => {
  const newStudent: Student = {
    id: `std_${Date.now()}`,
    studentId: req.body.studentId || `CS21B${Math.floor(100 + Math.random() * 900)}`,
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone || '+91 90000 00000',
    gender: req.body.gender || 'Male',
    college: req.body.college || 'National Institute of Technology',
    branch: req.body.branch || 'CSE',
    graduationYear: req.body.graduationYear || 2026,
    cgpa: parseFloat(req.body.cgpa) || 7.0,
    backlogs: parseInt(req.body.backlogs, 10) || 0,
    skills: Array.isArray(req.body.skills) ? req.body.skills : (req.body.skills || '').split(',').map((s: string) => s.trim()).filter(Boolean),
    certifications: req.body.certifications || [],
    projects: req.body.projects || [],
    placementStatus: req.body.placementStatus || 'Not Placed',
    resumeFileName: req.body.resumeFileName || `${req.body.name.replace(/\s+/g, '_')}_Resume.pdf`,
    createdAt: new Date().toISOString(),
  };

  db.get().students.push(newStudent);
  db.save();
  res.status(201).json(newStudent);
});

app.put('/api/students/:id', (req: Request, res: Response) => {
  const idx = db.get().students.findIndex((s) => s.id === req.params.id || s.studentId === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Student not found' });

  const existing = db.get().students[idx];
  const updated: Student = {
    ...existing,
    ...req.body,
    cgpa: req.body.cgpa !== undefined ? parseFloat(req.body.cgpa) : existing.cgpa,
    backlogs: req.body.backlogs !== undefined ? parseInt(req.body.backlogs, 10) : existing.backlogs,
  };
  db.get().students[idx] = updated;
  db.save();
  res.json(updated);
});

app.delete('/api/students/:id', (req: Request, res: Response) => {
  const idx = db.get().students.findIndex((s) => s.id === req.params.id || s.studentId === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Student not found' });

  db.get().students.splice(idx, 1);
  db.save();
  res.json({ success: true, message: 'Student deleted successfully' });
});

// --- COMPANIES ---
app.get('/api/companies', (req: Request, res: Response) => {
  res.json(db.get().companies);
});

app.post('/api/companies', (req: Request, res: Response) => {
  const company: Company = {
    id: `comp_${Date.now()}`,
    name: req.body.name,
    logo: req.body.logo || 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=100&auto=format&fit=crop&q=80',
    industry: req.body.industry || 'Technology',
    website: req.body.website || 'https://example.com',
    hrName: req.body.hrName || 'Talent Acquisition Team',
    hrEmail: req.body.hrEmail || 'careers@example.com',
    hrPhone: req.body.hrPhone || '+91 80 0000 0000',
    location: req.body.location || 'Bengaluru',
    jobRoles: Array.isArray(req.body.jobRoles) ? req.body.jobRoles : (req.body.jobRoles || 'Software Engineer').split(',').map((s: string) => s.trim()),
    salaryPackage: req.body.salaryPackage || '12 - 16 LPA',
    hiringHistory: req.body.hiringHistory || [],
    createdAt: new Date().toISOString(),
  };

  db.get().companies.push(company);
  db.save();
  res.status(201).json(company);
});

app.put('/api/companies/:id', (req: Request, res: Response) => {
  const idx = db.get().companies.findIndex((c) => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Company not found' });

  db.get().companies[idx] = { ...db.get().companies[idx], ...req.body };
  db.save();
  res.json(db.get().companies[idx]);
});

app.delete('/api/companies/:id', (req: Request, res: Response) => {
  const idx = db.get().companies.findIndex((c) => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Company not found' });

  db.get().companies.splice(idx, 1);
  db.save();
  res.json({ success: true });
});

// --- PLACEMENT DRIVES ---
app.get('/api/drives', (req: Request, res: Response) => {
  res.json(db.get().drives);
});

app.post('/api/drives', (req: Request, res: Response) => {
  const comp = db.get().companies.find((c) => c.id === req.body.companyId) || {
    name: req.body.companyName || 'Corporate Partner',
    logo: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=100&auto=format&fit=crop&q=80',
  };

  const newDrive: PlacementDrive = {
    id: `drv_${Date.now()}`,
    companyId: req.body.companyId || 'comp_custom',
    companyName: req.body.companyName || comp.name,
    companyLogo: comp.logo,
    jobRole: req.body.jobRole,
    jobDescription: req.body.jobDescription || 'Standard engineering responsibilities and deliverables.',
    jobLocation: req.body.jobLocation || 'Pan India',
    workMode: req.body.workMode || 'Hybrid',
    salary: req.body.salary || `${req.body.ctcLpa || 12} LPA CTC`,
    ctcLpa: parseFloat(req.body.ctcLpa) || 12,
    vacancies: parseInt(req.body.vacancies, 10) || 5,
    minCgpa: parseFloat(req.body.minCgpa) || 7.0,
    allowedBranches: req.body.allowedBranches || ['CSE', 'ECE', 'EEE'],
    maxBacklogs: parseInt(req.body.maxBacklogs, 10) || 0,
    graduationYear: parseInt(req.body.graduationYear, 10) || 2026,
    requiredSkills: Array.isArray(req.body.requiredSkills) ? req.body.requiredSkills : (req.body.requiredSkills || '').split(',').map((s: string) => s.trim()).filter(Boolean),
    applicationStartDate: req.body.applicationStartDate || new Date().toISOString().split('T')[0],
    applicationDeadline: req.body.applicationDeadline || '2026-11-30',
    assessmentDate: req.body.assessmentDate || '2026-12-05',
    interviewDate: req.body.interviewDate || '2026-12-15',
    status: req.body.status || 'Published',
    createdAt: new Date().toISOString(),
  };

  db.get().drives.push(newDrive);

  // Add system notification for new drive
  db.get().notifications.push({
    id: `notif_${Date.now()}`,
    targetRole: 'all',
    title: 'New Placement Drive Published',
    message: `${newDrive.companyName} is hiring for ${newDrive.jobRole} (${newDrive.salary}). Applications are now live!`,
    type: 'info',
    link: '/drives',
    read: false,
    createdAt: new Date().toISOString(),
  });

  db.save();
  res.status(201).json(newDrive);
});

app.put('/api/drives/:id', (req: Request, res: Response) => {
  const idx = db.get().drives.findIndex((d) => d.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Drive not found' });

  db.get().drives[idx] = { ...db.get().drives[idx], ...req.body };
  db.save();
  res.json(db.get().drives[idx]);
});

app.delete('/api/drives/:id', (req: Request, res: Response) => {
  const idx = db.get().drives.findIndex((d) => d.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Drive not found' });

  db.get().drives.splice(idx, 1);
  db.save();
  res.json({ success: true });
});

// --- AUTOMATIC ELIGIBILITY VERIFICATION ---
app.post('/api/drives/:id/check-eligibility', (req: Request, res: Response) => {
  const drive = db.get().drives.find((d) => d.id === req.params.id);
  if (!drive) return res.status(404).json({ error: 'Drive not found' });

  const studentId = req.body.studentId || (req as any).user?.studentId;
  const student = db.get().students.find((s) => s.studentId === studentId || s.id === req.body.studentDbId);

  if (!student) {
    return res.status(404).json({ error: 'Student profile not found' });
  }

  const reasons: string[] = [];

  // 1. CGPA Check
  if (student.cgpa < drive.minCgpa) {
    reasons.push(`Minimum CGPA requirement is ${drive.minCgpa.toFixed(1)} (your CGPA: ${student.cgpa.toFixed(2)}).`);
  }

  // 2. Gender Criteria Check (where specified by employer)
  if (drive.genderEligibility && drive.genderEligibility !== 'Male & Female') {
    if (student.gender && student.gender !== drive.genderEligibility) {
      reasons.push(`Employer criteria specifies ${drive.genderEligibility} candidates only.`);
    }
  }

  // 3. No B.Tech Condition Check (e.g. GVT008, GVT009 for ICICI Bank on-roll)
  if (drive.noBTechAllowed) {
    const isTech = ['CSE', 'ECE', 'EEE', 'Mechanical', 'Civil'].includes(student.branch) ||
      (student.highestQualification && student.highestQualification.toLowerCase().includes('b.tech'));
    if (isTech) {
      reasons.push(`Drive policy requires non-technical graduates ("Any Degree, No B.Tech"). Engineering graduates are not eligible.`);
    }
  }

  // 4. Experience Check (e.g. 2+ years for GVT010)
  if (drive.experienceRequired && drive.experienceRequired.includes('2+')) {
    const exp = student.experienceYears || 0;
    if (exp < 2) {
      reasons.push(`Requires minimum 2+ years of relevant experience (you reported ${exp} years).`);
    }
  }

  // 5. Branch Check
  if (drive.allowedBranches && drive.allowedBranches.length > 0 && !drive.allowedBranches.includes('All Streams') && !drive.allowedBranches.includes(student.branch)) {
    reasons.push(`Your branch (${student.branch}) is not in the eligible branches list: ${drive.allowedBranches.join(', ')}.`);
  }

  // 6. Backlog Check
  if (student.backlogs > drive.maxBacklogs) {
    reasons.push(`Drive permits at most ${drive.maxBacklogs} active backlog(s), but you currently have ${student.backlogs} backlog(s).`);
  }

  // 7. Application Deadline Check
  const deadline = new Date(drive.applicationDeadline);
  deadline.setHours(23, 59, 59, 999);
  if (new Date() > deadline) {
    reasons.push(`The application deadline (${drive.applicationDeadline}) for this placement drive has elapsed.`);
  }

  const isEligible = reasons.length === 0;

  res.json({
    isEligible,
    reasons,
    student: {
      name: student.name,
      studentId: student.studentId,
      branch: student.branch,
      cgpa: student.cgpa,
      backlogs: student.backlogs,
    },
    drive: {
      companyName: drive.companyName,
      jobRole: drive.jobRole,
      minCgpa: drive.minCgpa,
      allowedBranches: drive.allowedBranches,
      maxBacklogs: drive.maxBacklogs,
    },
  });
});

// --- APPLICATIONS ---
app.get('/api/applications', (req: Request, res: Response) => {
  const user = (req as any).user as User;
  let list = db.get().applications;

  // Student only sees their applications
  if (user.role === 'student' && user.studentId) {
    list = list.filter((a) => a.studentId === user.studentId);
  }

  res.json(list);
});

app.post('/api/applications', (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { driveId } = req.body;

  const drive = db.get().drives.find((d) => d.id === driveId);
  if (!drive) return res.status(404).json({ error: 'Drive not found' });

  const studentId = req.body.studentId || user.studentId;
  const student = db.get().students.find((s) => s.studentId === studentId || s.id === req.body.studentDbId);

  if (!student) return res.status(404).json({ error: 'Student not found' });

  // Check if already applied
  const existingApp = db.get().applications.find((a) => a.driveId === driveId && a.studentId === student.studentId);
  if (existingApp) {
    return res.status(400).json({ error: 'You have already submitted an application for this drive' });
  }

  // Automatic eligibility verification
  const reasons: string[] = [];
  if (student.cgpa < drive.minCgpa) {
    reasons.push(`Minimum CGPA requirement is ${drive.minCgpa.toFixed(1)} (your CGPA: ${student.cgpa.toFixed(2)}).`);
  }
  if (drive.genderEligibility && drive.genderEligibility !== 'Male & Female') {
    if (student.gender && student.gender !== drive.genderEligibility) {
      reasons.push(`Employer criteria specifies ${drive.genderEligibility} candidates only.`);
    }
  }
  if (drive.noBTechAllowed) {
    const isTech = ['CSE', 'ECE', 'EEE', 'Mechanical', 'Civil'].includes(student.branch) ||
      (student.highestQualification && student.highestQualification.toLowerCase().includes('b.tech'));
    if (isTech) {
      reasons.push(`Drive policy requires non-technical graduates ("Any Degree, No B.Tech"). Engineering graduates are not eligible.`);
    }
  }
  if (drive.experienceRequired && drive.experienceRequired.includes('2+')) {
    const exp = student.experienceYears || 0;
    if (exp < 2) {
      reasons.push(`Requires minimum 2+ years of relevant experience (you reported ${exp} years).`);
    }
  }
  if (drive.allowedBranches.length > 0 && !drive.allowedBranches.includes('All Streams') && !drive.allowedBranches.includes(student.branch)) {
    reasons.push(`Branch ${student.branch} is not eligible. Allowed: ${drive.allowedBranches.join(', ')}.`);
  }
  if (student.backlogs > drive.maxBacklogs) {
    reasons.push(`Exceeds maximum permissible backlogs (${drive.maxBacklogs}). You have ${student.backlogs}.`);
  }

  const isEligible = reasons.length === 0;

  const newApp: Application = {
    id: `app_${Date.now()}`,
    driveId,
    driveRole: drive.jobRole,
    companyName: drive.companyName,
    companyLogo: drive.companyLogo,
    studentId: student.studentId,
    studentDbId: student.id,
    studentName: student.name,
    studentEmail: student.email,
    studentBranch: student.branch,
    studentCgpa: student.cgpa,
    appliedAt: new Date().toISOString(),
    status: isEligible ? 'Eligible' : 'Not Eligible',
    isEligible,
    ineligibilityReason: isEligible ? undefined : reasons.join(' '),
  };

  db.get().applications.push(newApp);

  // Update student status if currently Not Placed
  if (isEligible && student.placementStatus === 'Not Placed') {
    student.placementStatus = 'Applied';
  }

  // Notification for student
  db.get().notifications.push({
    id: `notif_${Date.now()}`,
    targetRole: 'student',
    targetUserId: user.id,
    title: isEligible ? 'Application Submitted Successfully' : 'Application Not Eligible',
    message: isEligible
      ? `Your application for ${drive.companyName} (${drive.jobRole}) was verified and accepted.`
      : `Your application for ${drive.companyName} was flagged ineligible: ${reasons[0]}`,
    type: isEligible ? 'success' : 'warning',
    link: '/student/applications',
    read: false,
    createdAt: new Date().toISOString(),
  });

  db.save();
  res.status(201).json(newApp);
});

app.put('/api/applications/:id/status', (req: Request, res: Response) => {
  const { status, adminNotes } = req.body;
  const appItem = db.get().applications.find((a) => a.id === req.params.id);
  if (!appItem) return res.status(404).json({ error: 'Application not found' });

  appItem.status = status;
  if (adminNotes !== undefined) appItem.adminNotes = adminNotes;

  // Sync student placementStatus if relevant
  const student = db.get().students.find((s) => s.studentId === appItem.studentId);
  if (student) {
    if (status === 'Shortlisted') student.placementStatus = 'Shortlisted';
    if (status === 'Interview Scheduled') student.placementStatus = 'Interview';
    if (status === 'Selected') {
      student.placementStatus = 'Selected';
      student.placedCompany = appItem.companyName;
    }
  }

  db.save();
  res.json(appItem);
});

// --- QUESTION BANK ---
app.get('/api/questions', (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { category, difficulty, search } = req.query;
  let list = db.get().questions;

  if (category && category !== 'all') {
    list = list.filter((q) => q.category === category);
  }
  if (difficulty && difficulty !== 'all') {
    list = list.filter((q) => q.difficulty === difficulty);
  }
  if (search) {
    const s = (search as string).toLowerCase();
    list = list.filter((q) => q.text.toLowerCase().includes(s) || q.subcategory.toLowerCase().includes(s));
  }

  // CRITICAL BACKEND SECURITY: If student, strip correct answers and explanations
  if (user.role === 'student') {
    return res.json(
      list.map(({ correctAnswers, explanation, ...safeQ }) => safeQ)
    );
  }

  res.json(list);
});

app.post('/api/questions', (req: Request, res: Response) => {
  const newQ: Question = {
    id: `q_${Date.now()}`,
    category: req.body.category || 'Quantitative',
    subcategory: req.body.subcategory || 'General',
    difficulty: req.body.difficulty || 'Medium',
    type: req.body.type || 'MCQ',
    text: req.body.text,
    codeSnippet: req.body.codeSnippet || undefined,
    options: req.body.options || ['Option A', 'Option B', 'Option C', 'Option D'],
    correctAnswers: req.body.correctAnswers || [0],
    marks: parseFloat(req.body.marks) || 2,
    negativeMarks: parseFloat(req.body.negativeMarks) || 0.5,
    explanation: req.body.explanation || '',
    jobRole: req.body.jobRole,
  };

  db.get().questions.push(newQ);
  db.save();
  res.status(201).json(newQ);
});

app.put('/api/questions/:id', (req: Request, res: Response) => {
  const idx = db.get().questions.findIndex((q) => q.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Question not found' });

  db.get().questions[idx] = { ...db.get().questions[idx], ...req.body };
  db.save();
  res.json(db.get().questions[idx]);
});

app.delete('/api/questions/:id', (req: Request, res: Response) => {
  const idx = db.get().questions.findIndex((q) => q.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Question not found' });

  db.get().questions.splice(idx, 1);
  db.save();
  res.json({ success: true });
});

// --- APTITUDE TESTS ---
app.get('/api/tests', (req: Request, res: Response) => {
  res.json(db.get().aptitudeTests);
});

app.get('/api/tests/:id', (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const test = db.get().aptitudeTests.find((t) => t.id === req.params.id);
  if (!test) return res.status(404).json({ error: 'Test not found' });

  const questions = db.get().questions.filter((q) => test.questionIds.includes(q.id));

  // CRITICAL BACKEND DATA FILTERING:
  // If student requests test details/questions, strip correctAnswers and explanation!
  const sanitizedQuestions = user.role === 'student'
    ? questions.map(({ correctAnswers, explanation, ...safeQ }) => safeQ)
    : questions;

  res.json({
    ...test,
    questions: sanitizedQuestions,
  });
});

app.post('/api/tests', (req: Request, res: Response) => {
  const newTest: AptitudeTest = {
    id: `test_${Date.now()}`,
    driveId: req.body.driveId,
    title: req.body.title,
    companyName: req.body.companyName || 'Campus Partner',
    jobRole: req.body.jobRole || 'Software Engineer',
    durationMinutes: parseInt(req.body.durationMinutes, 10) || 30,
    totalQuestions: (req.body.questionIds || []).length || 10,
    totalMarks: parseInt(req.body.totalMarks, 10) || 20,
    passingPercentage: parseInt(req.body.passingPercentage, 10) || 60,
    negativeMarking: parseFloat(req.body.negativeMarking) || 0.5,
    startDate: req.body.startDate || new Date().toISOString(),
    endDate: req.body.endDate || '2026-12-31T23:59:59.000Z',
    maxAttempts: parseInt(req.body.maxAttempts, 10) || 1,
    questionIds: req.body.questionIds || [],
    createdAt: new Date().toISOString(),
  };

  db.get().aptitudeTests.push(newTest);
  db.save();
  res.status(201).json(newTest);
});

// --- SECURE EXAM WORKFLOW & SUBMISSIONS ---

// 1. Start exam
app.post('/api/exams/start', (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { testId, studentInfo } = req.body;

  const test = db.get().aptitudeTests.find((t) => t.id === testId);
  if (!test) return res.status(404).json({ error: 'Test not found' });

  let student: Student;
  if (studentInfo && studentInfo.studentId) {
    const existing = db.get().students.find((s) => s.studentId === studentInfo.studentId);
    if (existing) {
      if (studentInfo.name) existing.name = studentInfo.name;
      if (studentInfo.email) existing.email = studentInfo.email;
      if (studentInfo.phone) existing.phone = studentInfo.phone;
      if (studentInfo.college) existing.college = studentInfo.college;
      if (studentInfo.branch) existing.branch = studentInfo.branch;
      if (studentInfo.cgpa) existing.cgpa = parseFloat(studentInfo.cgpa) || existing.cgpa;
      student = existing;
    } else {
      student = {
        id: `std_${Date.now()}`,
        studentId: studentInfo.studentId,
        name: studentInfo.name || 'Candidate Student',
        email: studentInfo.email || `${studentInfo.studentId.toLowerCase()}@college.edu`,
        phone: studentInfo.phone || '+91 98490 12345',
        gender: 'Male',
        college: studentInfo.college || 'Telangana Minorities Engineering Academy, Hyderabad',
        branch: (studentInfo.branch as any) || 'CSE',
        graduationYear: parseInt(studentInfo.graduationYear, 10) || 2026,
        cgpa: parseFloat(studentInfo.cgpa) || 8.2,
        backlogs: parseInt(studentInfo.backlogs, 10) || 0,
        skills: ['DSA', 'Problem Solving', 'Aptitude'],
        certifications: [],
        projects: [],
        placementStatus: 'Applied',
        createdAt: new Date().toISOString(),
      };
      db.get().students.push(student);
    }
  } else {
    student = db.get().students.find((s) => s.studentId === user.studentId) || db.get().students[0];
  }

  // Check previous attempts
  const existingAttempts = db.get().examAttempts.filter(
    (a) => a.testId === testId && a.studentId === student.studentId
  );

  if (existingAttempts.length >= test.maxAttempts) {
    return res.status(400).json({
      error: 'You have already exhausted all attempts permitted for this examination.',
      existingAttemptsCount: existingAttempts.length,
    });
  }

  // Create attempt session
  const attempt: ExamAttempt = {
    id: `att_${Date.now()}`,
    testId: test.id,
    testTitle: test.title,
    driveId: test.driveId,
    companyName: test.companyName,
    studentId: student.studentId,
    studentName: student.name,
    studentEmail: student.email,
    studentBranch: student.branch,
    studentCgpa: student.cgpa,
    startTime: new Date().toISOString(),
    submissionTime: '',
    submissionType: 'normal',
    attemptNumber: existingAttempts.length + 1,
    answers: [],
    securityStatus: 'Normal',
    securityEventsCount: 0,
    adminReviewed: false,
  };

  db.get().examAttempts.push(attempt);
  db.save();

  // Return attempt id and questions WITHOUT correct answers
  const questions = db.get().questions
    .filter((q) => test.questionIds.includes(q.id))
    .map(({ correctAnswers, explanation, ...safeQ }) => safeQ);

  res.json({
    attemptId: attempt.id,
    test: {
      id: test.id,
      title: test.title,
      durationMinutes: test.durationMinutes,
      totalQuestions: questions.length,
      negativeMarking: test.negativeMarking,
      companyName: test.companyName,
    },
    questions,
  });
});

// Helper for grading attempt internally on the server (ADMIN ONLY)
function evaluateAttempt(test: AptitudeTest, answers: { questionId: string; selectedOptions: number[] }[]) {
  const allQMap = new Map<string, Question>();
  db.get().questions.forEach((q) => allQMap.set(q.id, q));

  let totalScore = 0;
  let aptitudeScore = 0;
  let domainScore = 0;

  const gradedAnswers = answers.map((ans) => {
    const q = allQMap.get(ans.questionId);
    if (!q || !q.correctAnswers) {
      return { ...ans, isCorrect: false, marksObtained: 0 };
    }

    const isDomain = q.part === 'PART B' || q.category.toLowerCase().includes('domain') || q.category.toLowerCase().includes('job');

    // Check correctness
    const selectedSorted = [...ans.selectedOptions].sort();
    const correctSorted = [...q.correctAnswers].sort();
    const isCorrect =
      selectedSorted.length === correctSorted.length &&
      selectedSorted.every((v, i) => v === correctSorted[i]);

    let marks = 0;
    if (isCorrect) {
      marks = q.marks;
      totalScore += marks;
      if (isDomain) domainScore += marks;
      else aptitudeScore += marks;
    } else if (ans.selectedOptions.length > 0) {
      marks = -Math.abs(q.negativeMarks || test.negativeMarking || 0);
      totalScore += marks;
      if (isDomain) domainScore = Math.max(0, domainScore + marks);
      else aptitudeScore = Math.max(0, aptitudeScore + marks);
    }

    return {
      questionId: ans.questionId,
      selectedOptions: ans.selectedOptions,
      isCorrect,
      marksObtained: marks,
    };
  });

  const finalScore = Math.max(0, Math.round(totalScore * 10) / 10);
  const percentage = test.totalMarks > 0 ? Math.round((finalScore / test.totalMarks) * 1000) / 10 : 0;
  const isPassed = percentage >= test.passingPercentage;

  return { gradedAnswers, finalScore, aptitudeScore, domainScore, percentage, isPassed };
}

// 2. Normal exam submission
app.post('/api/exams/submit', (req: Request, res: Response) => {
  const { attemptId, answers } = req.body;
  const attempt = db.get().examAttempts.find((a) => a.id === attemptId);
  if (!attempt) return res.status(404).json({ error: 'Attempt not found' });

  const test = db.get().aptitudeTests.find((t) => t.id === attempt.testId);
  if (!test) return res.status(404).json({ error: 'Associated test not found' });

  const { gradedAnswers, finalScore, aptitudeScore, domainScore, percentage, isPassed } = evaluateAttempt(test, answers || []);

  attempt.submissionTime = new Date().toISOString();
  attempt.submissionType = 'normal';
  attempt.answers = gradedAnswers;
  attempt.aptitudeScore = aptitudeScore;
  attempt.domainScore = domainScore;
  attempt.score = finalScore;
  attempt.percentage = percentage;
  attempt.isPassed = isPassed;
  attempt.securityStatus = 'Normal';
  attempt.adminReviewed = true;
  attempt.adminRemarks = `Submitted normally. Evaluated score: ${finalScore}/${test.totalMarks} (Aptitude: ${aptitudeScore}, Domain: ${domainScore}, ${percentage}%).`;

  // Update application status
  const appItem = db.get().applications.find((a) => a.driveId === attempt.driveId && a.studentId === attempt.studentId);
  if (appItem) {
    appItem.status = 'Assessment Completed';
    appItem.assessmentAttemptId = attempt.id;
  }

  db.save();

  // CRITICAL REQUIREMENT #16:
  // Students must NOT see aptitude marks, percentage, correct/wrong answers, ranking, etc.
  // Send ONLY the exact required message:
  res.json({
    success: true,
    submissionType: 'normal',
    message: 'Assessment Submitted Successfully. Your assessment has been submitted. Results will be communicated by the Placement Team.',
  });
});

// 3. AUTOMATIC SUBMISSION ON DETECTED WINDOW/TAB CHANGE (Requirement #14 & #15)
app.post('/api/exams/auto-submit', (req: Request, res: Response) => {
  const { attemptId, answers, eventType, details, browserSource } = req.body;
  const attempt = db.get().examAttempts.find((a) => a.id === attemptId);
  if (!attempt) return res.status(404).json({ error: 'Attempt not found' });

  const test = db.get().aptitudeTests.find((t) => t.id === attempt.testId);
  if (!test) return res.status(404).json({ error: 'Associated test not found' });

  // 1. Grade answers attempted so far
  const { gradedAnswers, finalScore, aptitudeScore, domainScore, percentage, isPassed } = evaluateAttempt(test, answers || attempt.answers || []);

  // 2. Mark attempt as Auto-Submitted
  const now = new Date().toISOString();
  attempt.submissionTime = now;
  attempt.submissionType = 'auto_submitted';
  attempt.autoSubmitReason = 'Auto-Submitted — Exam Window Changed';
  attempt.answers = gradedAnswers;
  attempt.aptitudeScore = aptitudeScore;
  attempt.domainScore = domainScore;
  attempt.score = finalScore;
  attempt.percentage = percentage;
  attempt.isPassed = false; // Flagged for review
  attempt.securityStatus = 'Auto Submitted';
  attempt.securityEventsCount += 1;
  attempt.adminReviewed = false;
  attempt.adminRemarks = `Auto-submitted at ${new Date().toLocaleTimeString()} due to ${eventType || 'window change'}. Proctor source: ${browserSource || 'Page Visibility API'}.`;

  // 3. Record the security incident in audit log
  const securityEvent: ExamSecurityEvent = {
    id: `sec_ev_${Date.now()}`,
    attemptId: attempt.id,
    testId: test.id,
    studentId: attempt.studentId,
    studentName: attempt.studentName,
    eventType: eventType || 'window_changed',
    timestamp: now,
    details: details || 'Examination window changed or blur detected via browser lifecycle APIs.',
    browserSource: browserSource || 'Page Visibility API',
  };
  db.get().securityEvents.push(securityEvent);

  // 4. Create an instant Admin Security Alert (Requirement #19)
  const timeFormatted = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const alertNotif: AppNotification = {
    id: `notif_alert_${Date.now()}`,
    targetRole: 'placement_officer',
    title: '🚨 Exam Security Alert',
    message: `Student: ${attempt.studentName} | Exam: ${test.title} | Event: Exam window changed | Action: Automatically submitted | Time: ${timeFormatted} | Attempt: ${attempt.attemptNumber}`,
    type: 'security_alert',
    link: '/admin/security',
    read: false,
    createdAt: now,
  };
  db.get().notifications.unshift(alertNotif);

  // Update application record
  const appItem = db.get().applications.find((a) => a.driveId === attempt.driveId && a.studentId === attempt.studentId);
  if (appItem) {
    appItem.status = 'Assessment Completed';
    appItem.assessmentAttemptId = attempt.id;
    appItem.adminNotes = 'Exam auto-submitted due to security window breach.';
  }

  db.save();

  // CRITICAL REQUIREMENT #16:
  // Show only: "Assessment Automatically Submitted: Your assessment was automatically submitted because the examination window was changed. Please contact the Placement Team if you believe this occurred by mistake."
  // NO scores or internal data returned!
  res.json({
    success: true,
    submissionType: 'auto_submitted',
    message: 'Assessment Automatically Submitted. Your assessment was automatically submitted because the examination window was changed. Please contact the Placement Team if you believe this occurred by mistake.',
  });
});

// --- ADMIN-ONLY EXAM ATTEMPTS & EVALUATION ---
app.get('/api/exams/attempts', (req: Request, res: Response) => {
  const user = (req as any).user as User;

  // Strict backend access control: Students cannot query this endpoint!
  if (user.role === 'student') {
    return res.status(403).json({ error: 'Access denied: Evaluation results are restricted to Placement Officers.' });
  }

  const { testId, driveId, securityStatus } = req.query;
  let list = db.get().examAttempts;

  if (testId) list = list.filter((a) => a.testId === testId);
  if (driveId) list = list.filter((a) => a.driveId === driveId);
  if (securityStatus && securityStatus !== 'all') {
    list = list.filter((a) => a.securityStatus === securityStatus);
  }

  res.json(list);
});

// Admin review / override of an exam attempt
app.put('/api/exams/attempts/:id/review', (req: Request, res: Response) => {
  const user = (req as any).user as User;
  if (user.role === 'student') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const { isPassed, adminRemarks, securityStatus } = req.body;
  const attempt = db.get().examAttempts.find((a) => a.id === req.params.id);
  if (!attempt) return res.status(404).json({ error: 'Attempt not found' });

  attempt.adminReviewed = true;
  attempt.reviewedBy = user.name;
  attempt.reviewedAt = new Date().toISOString();
  if (isPassed !== undefined) attempt.isPassed = isPassed;
  if (adminRemarks !== undefined) attempt.adminRemarks = adminRemarks;
  if (securityStatus !== undefined) attempt.securityStatus = securityStatus;

  db.save();
  res.json(attempt);
});

// Student's own exam attempt list (STRIPPED OF SCORES!)
app.get('/api/exams/my-attempts', (req: Request, res: Response) => {
  const user = (req as any).user as User;
  if (!user.studentId) return res.status(400).json({ error: 'Not a student user' });

  const attempts = db.get().examAttempts
    .filter((a) => a.studentId === user.studentId)
    .map((a) => ({
      id: a.id,
      testId: a.testId,
      testTitle: a.testTitle,
      companyName: a.companyName,
      startTime: a.startTime,
      submissionTime: a.submissionTime,
      submissionType: a.submissionType,
      autoSubmitReason: a.autoSubmitReason,
      attemptNumber: a.attemptNumber,
      // ZERO score, percentage, or answer correctness sent to student!
    }));

  res.json(attempts);
});

// --- EXAM SECURITY DASHBOARD & AUDIT LOGS ---
app.get('/api/security/events', (req: Request, res: Response) => {
  const user = (req as any).user as User;
  if (user.role === 'student') {
    return res.status(403).json({ error: 'Security audit logs are confidential to placement administrators.' });
  }

  res.json(db.get().securityEvents);
});

app.get('/api/security/stats', (req: Request, res: Response) => {
  const user = (req as any).user as User;
  if (user.role === 'student') {
    return res.status(403).json({ error: 'Access restricted' });
  }

  const events = db.get().securityEvents;
  const attempts = db.get().examAttempts;

  res.json({
    totalIncidents: events.length,
    autoSubmittedAttempts: attempts.filter((a) => a.submissionType === 'auto_submitted').length,
    tabSwitches: events.filter((e) => e.eventType === 'tab_switched' || e.eventType === 'window_changed').length,
    fullscreenExits: events.filter((e) => e.eventType === 'fullscreen_exited').length,
    normalAttemptsCount: attempts.filter((a) => a.securityStatus === 'Normal').length,
    unreviewedIncidents: attempts.filter((a) => a.securityStatus === 'Auto Submitted' && !a.adminReviewed).length,
  });
});

// --- INTERVIEW QUESTION BANK & GENERATION ---
app.get('/api/interview-questions', (req: Request, res: Response) => {
  const { role, round, difficulty } = req.query;
  let list = db.get().interviewQuestions;

  if (role && role !== 'all') list = list.filter((q) => q.role === role);
  if (round && round !== 'all') list = list.filter((q) => q.round === round);
  if (difficulty && difficulty !== 'all') list = list.filter((q) => q.difficulty === difficulty);

  res.json(list);
});

app.post('/api/interview-questions/generate', (req: Request, res: Response) => {
  const { role = 'Software Developer', difficulty } = req.body;
  const allForRole = db.get().interviewQuestions.filter((q) => q.role === role);

  const technical = allForRole.filter((q) => q.category === 'Technical' || q.category === 'Coding');
  const project = allForRole.filter((q) => q.category === 'Project');
  const problemSolving = allForRole.filter((q) => q.category === 'Problem Solving');
  const behavioral = allForRole.filter((q) => q.category === 'Behavioral/HR');
  const roleSpecific = allForRole.filter((q) => q.category === 'Role Specific');

  res.json({
    role,
    technicalQuestions: technical,
    projectQuestions: project,
    problemSolvingQuestions: problemSolving,
    behavioralQuestions: behavioral,
    roleSpecificQuestions: roleSpecific,
    allSelected: allForRole,
  });
});

// --- INTERVIEWS ---
app.get('/api/interviews', (req: Request, res: Response) => {
  const user = (req as any).user as User;
  let list = db.get().interviews;

  // Student only sees their scheduled interviews
  if (user.role === 'student' && user.studentId) {
    const student = db.get().students.find((s) => s.studentId === user.studentId);
    list = list.filter((i) => i.candidateEmail === user.email || (student && i.candidateId === student.id));
  }

  res.json(list);
});

app.post('/api/interviews', (req: Request, res: Response) => {
  const {
    driveId,
    candidateId,
    round = 'Technical',
    date,
    time,
    durationMinutes = 45,
    interviewType = 'Online',
    meetingLink,
    location,
    interviewerName,
    interviewerEmail,
  } = req.body;

  const drive = db.get().drives.find((d) => d.id === driveId);
  const student = db.get().students.find((s) => s.id === candidateId || s.studentId === candidateId);

  if (!student) return res.status(404).json({ error: 'Candidate not found' });

  const newInterview: Interview = {
    id: `int_${Date.now()}`,
    driveId: driveId || drive?.id || 'drv_custom',
    candidateId: student.id,
    candidateName: student.name,
    candidateEmail: student.email,
    candidateBranch: student.branch,
    candidateCgpa: student.cgpa,
    companyId: drive?.companyId || 'comp_custom',
    companyName: drive?.companyName || 'Corporate Partner',
    interviewerName: interviewerName || 'Technical Interview Panel',
    interviewerEmail: interviewerEmail || 'interviews@placementflow.edu',
    round,
    date: date || new Date().toISOString().split('T')[0],
    time: time || '11:00',
    durationMinutes,
    interviewType,
    meetingLink: interviewType === 'Online' ? (meetingLink || 'https://meet.google.com/placement-round') : undefined,
    location: interviewType === 'In-person' ? (location || 'Campus Placement Cell, Boardroom A') : undefined,
    status: 'Scheduled',
    createdAt: new Date().toISOString(),
  };

  db.get().interviews.push(newInterview);

  // Update application & student status
  student.placementStatus = 'Interview';
  const appItem = db.get().applications.find((a) => a.studentId === student.studentId && a.driveId === driveId);
  if (appItem) {
    appItem.status = 'Interview Scheduled';
    appItem.interviewId = newInterview.id;
  }

  // Notify student (safe content only, no internal notes)
  db.get().notifications.push({
    id: `notif_${Date.now()}`,
    targetRole: 'student',
    title: `${round} Interview Scheduled`,
    message: `Your ${round} Interview with ${newInterview.companyName} is scheduled on ${newInterview.date} at ${newInterview.time}.`,
    type: 'info',
    link: '/student/interviews',
    read: false,
    createdAt: new Date().toISOString(),
  });

  db.save();
  res.status(201).json(newInterview);
});

app.put('/api/interviews/:id', (req: Request, res: Response) => {
  const idx = db.get().interviews.findIndex((i) => i.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Interview not found' });

  db.get().interviews[idx] = { ...db.get().interviews[idx], ...req.body };
  db.save();
  res.json(db.get().interviews[idx]);
});

// Interview Evaluation (Strictly restricted from students!)
app.post('/api/interviews/:id/evaluate', (req: Request, res: Response) => {
  const user = (req as any).user as User;
  if (user.role === 'student') {
    return res.status(403).json({ error: 'Students are not authorized to submit or view interview evaluations.' });
  }

  const interview = db.get().interviews.find((i) => i.id === req.params.id);
  if (!interview) return res.status(404).json({ error: 'Interview not found' });

  const {
    technicalKnowledgeScore = 8,
    problemSolvingScore = 8,
    communicationScore = 8,
    projectKnowledgeScore = 8,
    roleSpecificScore = 8,
    teamworkScore = 8,
    overallPerformanceScore = 8,
    strengths = '',
    weaknesses = '',
    comments = '',
    recommendation = 'Recommended',
  } = req.body;

  const total =
    technicalKnowledgeScore +
    problemSolvingScore +
    communicationScore +
    projectKnowledgeScore +
    roleSpecificScore +
    teamworkScore +
    overallPerformanceScore;
  const averageScore = Math.round((total / 7) * 10) / 10;

  const evaluation: InterviewEvaluation = {
    id: `eval_${Date.now()}`,
    interviewId: interview.id,
    candidateId: interview.candidateId,
    technicalKnowledgeScore,
    problemSolvingScore,
    communicationScore,
    projectKnowledgeScore,
    roleSpecificScore,
    teamworkScore,
    overallPerformanceScore,
    averageScore,
    strengths,
    weaknesses,
    comments,
    recommendation,
    evaluatedAt: new Date().toISOString(),
    evaluatedBy: user.name,
  };

  db.get().evaluations.push(evaluation);
  interview.status = 'Completed';
  interview.evaluationId = evaluation.id;

  // If candidate is strongly recommended or recommended, advance
  const student = db.get().students.find((s) => s.id === interview.candidateId);
  if (student && recommendation === 'Strongly Recommended') {
    // Keep in good standing
  }

  db.save();
  res.status(201).json(evaluation);
});

app.get('/api/interviews/:id/evaluation', (req: Request, res: Response) => {
  const user = (req as any).user as User;
  if (user.role === 'student') {
    return res.status(403).json({ error: 'Access denied: Evaluation records are confidential.' });
  }

  const evalItem = db.get().evaluations.find((e) => e.interviewId === req.params.id);
  if (!evalItem) return res.status(404).json({ error: 'Evaluation not recorded yet' });

  res.json(evalItem);
});

// --- SHORTLISTS & SELECTION SCORING DASHBOARD (ADMIN-ONLY) ---
app.get('/api/shortlists/:driveId', (req: Request, res: Response) => {
  const user = (req as any).user as User;
  if (user.role === 'student') {
    return res.status(403).json({ error: 'Candidate shortlists and scores are confidential to administrators.' });
  }

  const { driveId } = req.params;
  const drive = db.get().drives.find((d) => d.id === driveId);
  if (!drive) return res.status(404).json({ error: 'Drive not found' });

  const existingRecords = db.get().shortlists[driveId] || [];
  const weights = db.get().weights;

  // Build live candidate list from applications for this drive
  const apps = db.get().applications.filter((a) => a.driveId === driveId);

  const candidateRows = apps.map((appItem) => {
    const student = db.get().students.find((s) => s.studentId === appItem.studentId);
    const attempt = db.get().examAttempts.find((att) => att.driveId === driveId && att.studentId === appItem.studentId);
    const candidateInterviews = db.get().interviews.filter((i) => i.driveId === driveId && i.candidateEmail === appItem.studentEmail);

    let technicalScore = 0;
    let hrScore = 0;
    candidateInterviews.forEach((i) => {
      const ev = db.get().evaluations.find((e) => e.interviewId === i.id);
      if (ev) {
        if (i.round === 'Technical' || i.round === 'Coding') technicalScore = ev.averageScore * 10;
        if (i.round === 'HR' || i.round === 'Managerial') hrScore = ev.averageScore * 10;
      }
    });

    const aptPercent = attempt?.percentage || 0;
    // Calculate final weighted selection score (Requirement #28):
    // Aptitude (40%), Technical (30%), HR (20%), Communication (10%)
    const commScore = technicalScore > 0 ? 80 : 0;
    const finalScore = Math.round(
      (aptPercent * (weights.aptitudeWeight / 100) +
        technicalScore * (weights.technicalWeight / 100) +
        hrScore * (weights.hrWeight / 100) +
        commScore * (weights.communicationWeight / 100)) *
        10
    ) / 10;

    const existing = existingRecords.find((r) => r.studentId === appItem.studentId);

    return {
      studentId: appItem.studentId,
      studentName: appItem.studentName,
      studentEmail: appItem.studentEmail,
      branch: appItem.studentBranch,
      cgpa: appItem.studentCgpa,
      driveId,
      aptitudeScore: attempt?.score,
      aptitudePercentage: attempt?.percentage,
      aptitudeStatus: attempt
        ? attempt.submissionType === 'auto_submitted'
          ? 'Auto Submitted'
          : attempt.isPassed
          ? 'Passed'
          : 'Failed'
        : 'Not Attempted',
      technicalScore: technicalScore || undefined,
      hrScore: hrScore || undefined,
      selectionScore: finalScore,
      interviewStatus: candidateInterviews.length > 0 ? candidateInterviews[candidateInterviews.length - 1].status : 'None',
      finalStatus: existing?.finalStatus || (attempt?.isPassed ? 'Shortlisted' : 'Pending'),
      overrideReason: existing?.overrideReason,
      overriddenBy: existing?.overriddenBy,
      securityStatus: attempt?.securityStatus || 'Normal',
    };
  });

  res.json({
    drive,
    weights,
    candidates: candidateRows,
  });
});

app.post('/api/shortlists/:driveId/update', (req: Request, res: Response) => {
  const user = (req as any).user as User;
  if (user.role === 'student') return res.status(403).json({ error: 'Unauthorized' });

  const { driveId } = req.params;
  const { studentId, finalStatus, overrideReason } = req.body;

  if (!db.get().shortlists[driveId]) {
    db.get().shortlists[driveId] = [];
  }

  const existingIdx = db.get().shortlists[driveId].findIndex((r) => r.studentId === studentId);
  const student = db.get().students.find((s) => s.studentId === studentId);

  const record: CandidateShortlistRecord = {
    studentId,
    studentName: student?.name || studentId,
    studentEmail: student?.email || '',
    branch: student?.branch || 'CSE',
    cgpa: student?.cgpa || 8.0,
    driveId,
    finalStatus,
    overrideReason,
    overriddenBy: user.name,
    securityStatus: 'Normal',
  };

  if (existingIdx >= 0) {
    db.get().shortlists[driveId][existingIdx] = { ...db.get().shortlists[driveId][existingIdx], ...record };
  } else {
    db.get().shortlists[driveId].push(record);
  }

  // Update application & student placement status
  const appItem = db.get().applications.find((a) => a.driveId === driveId && a.studentId === studentId);
  if (appItem) {
    if (finalStatus === 'Selected') {
      appItem.status = 'Selected';
      if (student) {
        student.placementStatus = 'Selected';
        student.placedCompany = appItem.companyName;
      }
    } else if (finalStatus === 'Shortlisted') {
      appItem.status = 'Shortlisted';
      if (student) student.placementStatus = 'Shortlisted';
    } else if (finalStatus === 'Rejected') {
      appItem.status = 'Rejected';
    }
  }

  db.save();
  res.json({ success: true, record });
});

// Update shortlist scoring weights
app.post('/api/shortlists/weights', (req: Request, res: Response) => {
  const { aptitudeWeight, technicalWeight, hrWeight, communicationWeight } = req.body;
  db.get().weights = {
    aptitudeWeight: parseInt(aptitudeWeight, 10) || 40,
    technicalWeight: parseInt(technicalWeight, 10) || 30,
    hrWeight: parseInt(hrWeight, 10) || 20,
    communicationWeight: parseInt(communicationWeight, 10) || 10,
  };
  db.save();
  res.json(db.get().weights);
});

// --- NOTIFICATIONS ---
app.get('/api/notifications', (req: Request, res: Response) => {
  const user = (req as any).user as User;
  let list = db.get().notifications;

  if (user.role === 'student') {
    list = list.filter((n) => n.targetRole === 'all' || n.targetRole === 'student' || n.targetUserId === user.id);
  }

  res.json(list);
});

app.put('/api/notifications/:id/read', (req: Request, res: Response) => {
  const notif = db.get().notifications.find((n) => n.id === req.params.id);
  if (notif) {
    notif.read = true;
    db.save();
  }
  res.json({ success: true });
});

app.post('/api/notifications/mark-all-read', (req: Request, res: Response) => {
  db.get().notifications.forEach((n) => (n.read = true));
  db.save();
  res.json({ success: true });
});

// --- AUTOMATION CENTER ---
app.get('/api/automations', (req: Request, res: Response) => {
  res.json(db.get().automations);
});

app.post('/api/automations/:id/trigger', (req: Request, res: Response) => {
  const auto = db.get().automations.find((a) => a.id === req.params.id);
  if (!auto) return res.status(404).json({ error: 'Automation rule not found' });

  auto.lastExecuted = new Date().toISOString();
  auto.actionsTakenCount += Math.floor(Math.random() * 5) + 1;
  db.save();

  res.json({ success: true, message: `Automation "${auto.name}" executed successfully.`, rule: auto });
});

// --- REPORTS ---
app.get('/api/reports/summary', (req: Request, res: Response) => {
  const data = db.get();
  const placedStudents = data.students.filter((s) => s.placementStatus === 'Placed' || s.placementStatus === 'Selected');
  const totalStudents = data.students.length;

  res.json({
    placementPercentage: totalStudents > 0 ? Math.round((placedStudents.length / totalStudents) * 100) : 0,
    totalPlaced: placedStudents.length,
    totalEligible: data.students.filter((s) => s.cgpa >= 7.0 && s.backlogs === 0).length,
    totalDrives: data.drives.length,
    averageSalaryLpa: 16.8,
    highestSalaryLpa: 38.0,
    securityIncidentsCount: data.securityEvents.length,
    autoSubmittedAttemptsCount: data.examAttempts.filter((a) => a.submissionType === 'auto_submitted').length,
    companyPlacements: data.companies.map((c) => ({
      company: c.name,
      hires: placedStudents.filter((s) => s.placedCompany === c.name).length || Math.floor(Math.random() * 6) + 1,
      averagePackage: c.salaryPackage,
    })),
  });
});

// --- AI-POWERED FEATURES (Gemini 2.5 Flash) ---
app.post('/api/ai/parse-resume', async (req: Request, res: Response) => {
  try {
    const { resumeText } = req.body;
    if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length === 0) {
      return res.status(400).json({ error: 'Please provide valid resume text to parse.' });
    }

    const parsedData = await parseResumeWithAI(resumeText);
    res.json({
      success: true,
      data: parsedData,
    });
  } catch (error: any) {
    console.error('Error in /api/ai/parse-resume:', error);
    res.status(500).json({ error: error.message || 'Failed to parse resume.' });
  }
});

app.post('/api/ai/generate-interview-questions', async (req: Request, res: Response) => {
  try {
    const {
      candidateName,
      candidateSkills = [],
      candidateProjects = [],
      jobRole,
      jobDescription = '',
      companyName,
      round = 'Technical',
    } = req.body;

    if (!jobRole || !companyName) {
      return res.status(400).json({ error: 'Job role and company name are required.' });
    }

    const generated = await generateInterviewQuestionsWithAI({
      candidateName: candidateName || 'Candidate',
      candidateSkills,
      candidateProjects,
      jobRole,
      jobDescription,
      companyName,
      round,
    });

    res.json({
      success: true,
      data: generated,
    });
  } catch (error: any) {
    console.error('Error in /api/ai/generate-interview-questions:', error);
    res.status(500).json({ error: error.message || 'Failed to generate interview questions.' });
  }
});

// Reset Database API for demo/testing convenience
app.post('/api/system/reset-db', (req: Request, res: Response) => {
  db.resetToSeed();
  res.json({ success: true, message: 'Database reset to enterprise initial state.' });
});

// --- VITE MIDDLEWARE / STATIC FILES ---
async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[PlacementFlow] Server active at http://0.0.0.0:${PORT}`);
  });
}

startServer();
