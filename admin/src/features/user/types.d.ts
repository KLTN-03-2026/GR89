export interface User {
  _id: string;
  fullName: string;
  email: string;
  isActive: boolean;
  avatar?: {
    url: string
  }
  role: 'user' | 'admin' | 'content';
  currentStreak: number;
  longestStreak: number;
  totalStudyTime: number;
  totalPoints: number;
  lastActiveDate?: Date;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserScore {
  _id: string;
  userId: string;
  fullName: string;
  email: string;
  avatar: string;
  currentLevel: string;
  totalPoints: number;
  ipaPoints: number;
  vocabularyPoints: number;
  grammarPoints: number;
  readingPoints: number;
  listeningPoints: number;
  speakingPoints: number;
  writingPoints: number;
  currentStreak: number;
  longestStreak: number;
  totalStudyTime: number;
  lastActiveDate: string;
  isActive: boolean;
  isVip?: boolean;
  vipStartDate?: string;
  vipPlanId?: string;
  vipPlanName?: string;
  vipExpiryDate?: string;
}

export interface UserScoreStats {
  totalUsers: number;
  activeUsers: number;
  averagePoints: number;
  totalStudyTime: number;
}

export interface TopUser {
  _id: string;
  userId: string;
  fullName: string;
  email: string;
  currentLevel: string;
  totalPoints: number;
}

export interface SkillAnalysis {
  name: string;
  avg: number;
}

/** Một dòng lịch sử học (StudyHistory) — API admin GET /user/:id/study-history */
export interface UserStudyHistoryEntry {
  lessonId: string;
  category:
  | 'grammar'
  | 'vocabulary'
  | 'reading'
  | 'listening'
  | 'speaking'
  | 'ipa'
  | 'writing';
  lessonTitle: string;
  status: 'passed' | 'failed' | 'in_progress';
  progress: number;
  duration: number;
  level: string;
  createdAt: string;
}