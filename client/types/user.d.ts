export interface User {
  _id: string;
  fullName: string;
  email: string;
  avatar: {
    _id: string,
    url: string
  };
  role: string;
  currentLevel: string;
  currentStreak: number;
  longestStreak: number;
  totalStudyTime: number;
  totalPoints: number;
  isVip?: boolean;
  vipPlanId?: string;
  vipStartDate?: Date | null;
}