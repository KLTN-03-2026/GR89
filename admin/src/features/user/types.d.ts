export interface User {
  _id: string;
  fullName: string;
  email: string;
  isActive: boolean;
  role: 'user' | 'admin' | 'content';
  currentStreak: number;
  longestStreak: number;
  totalStudyTime: number;
  totalPoints: number;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserScore {
  _id: string;
  userId: string;
  fullName: string;
  email: string;
  currentLevel: string;
  totalPoints: number;
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