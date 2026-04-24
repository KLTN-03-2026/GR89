export interface User {
  _id: string;
  fullName: string;
  email: string;
  avatar: string;
  dateOfBirth?: string | Date | null;
  phone?: string;
  country?: string;
  city?: string;
  role: string;
  currentLevel: string;
  currentStreak: number;
  longestStreak: number;
  totalStudyTime: number;
  totalPoints: number;
  vipPlanId?: string;
  vipStartDate?: Date | null;
  vipExpireDate?: Date | null;
}