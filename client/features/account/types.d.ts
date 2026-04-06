export interface UserProfile {
  _id: string
  fullName: string
  email: string
  avatar?: { _id: string; url: string } | string
  role: string
  currentStreak?: number
  longestStreak?: number
  totalStudyTime?: number
  totalPoints?: number
  isVip?: boolean
  vipPlanId?: string
  vipStartDate?: Date | null
}

export interface StreakStatus {
  currentStreak: number
  longestStreak: number
  todayDone: boolean
  nextResetTime: string
  freezeCount: number
}
