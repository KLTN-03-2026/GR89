export interface LessonSkillStats {
  completed: number
  total: number
  totalAvailable?: number
  avgScore: number
  bestScore: number
  totalScore: number
  totalTime: number
  lastActivity?: string
}

export interface LessonStatsResponse {
  vocabulary: LessonSkillStats
  grammar: LessonSkillStats
  reading: LessonSkillStats
  listening: LessonSkillStats
  speaking: LessonSkillStats
  writing: LessonSkillStats
  ipa: LessonSkillStats
}

export type EntertainmentType = 'movie' | 'music' | 'podcast'

export interface EntertainmentStatsEntry {
  type: EntertainmentType
  totalItems: number
  viewedCount: number
  totalWatchTime: number
}

export type RecentActivityCategory = 'grammar' | 'vocabulary' | 'reading' | 'listening' | 'speaking' | 'ipa' | 'writing'

export interface RecentActivity {
  lessonId: string
  category: RecentActivityCategory
  lessonTitle: string
  createdAt: string
  status: 'passed' | 'failed' | 'in_progress'
}

export interface IDailySuggestionItem {
  title: string
  description: string
  href: string
  icon?: string
  color?: string
  progress?: number
  isCompleted?: boolean
}

export interface IDailySuggestion {
  _id: string
  user: string
  dateString: string
  suggestions: IDailySuggestionItem[]
  createdAt: string
  updatedAt: string
}
