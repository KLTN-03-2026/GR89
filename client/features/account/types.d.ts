export interface UserProfile {
  _id: string
  fullName: string
  email: string
  avatar?: string
  role: string
  currentStreak?: number
  longestStreak?: number
  totalStudyTime?: number
  totalPoints?: number
  vipExpireDate?: Date | null
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
