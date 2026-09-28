import fs from 'fs';
import path from 'path';
import { getCompleteSeedData } from './seedData.ts';
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
  InterviewQuestion,
  Interview,
  InterviewEvaluation,
  CandidateShortlistRecord,
  AppNotification,
  AutomationRule,
} from '../src/types/index.ts';

export interface DatabaseSchema {
  users: User[];
  students: Student[];
  companies: Company[];
  drives: PlacementDrive[];
  applications: Application[];
  aptitudeTests: AptitudeTest[];
  questions: Question[];
  examAttempts: ExamAttempt[];
  securityEvents: ExamSecurityEvent[];
  interviewQuestions: InterviewQuestion[];
  interviews: Interview[];
  evaluations: InterviewEvaluation[];
  shortlists: Record<string, CandidateShortlistRecord[]>; // driveId -> records
  notifications: AppNotification[];
  automations: AutomationRule[];
  weights: {
    aptitudeWeight: number;
    technicalWeight: number;
    hrWeight: number;
    communicationWeight: number;
  };
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'database.json');

// Ensure directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function getInitialSeed(): DatabaseSchema {
  return getCompleteSeedData() as DatabaseSchema;
}

export class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.drives && parsed.drives.some((d: any) => d.id === 'GVT001' || d.jobCode === 'GVT001')) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error reading database file, re-seeding:', e);
    }
    const seed = getInitialSeed();
    this.persist(seed);
    return seed;
  }

  private persist(data: DatabaseSchema) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error saving database to file:', e);
    }
  }

  public save() {
    this.persist(this.data);
  }

  public get(): DatabaseSchema {
    return this.data;
  }

  public resetToSeed(): DatabaseSchema {
    this.data = getInitialSeed();
    this.save();
    return this.data;
  }
}

export const db = new Database();
