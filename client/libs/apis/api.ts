export type { StudySessionPayload } from './types'

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

// Overview types - used by skill headers and pages
export interface IpaOverview {
  completed: number
  total: number
  totalAvailable: number
  avgProgress: number
  totalScore: number
  totalTime: number
}

export interface GrammarOverview {
  completed: number
  total: number
  totalAvailable: number
  avgProgress: number
  totalScore: number
  totalTime: number
}

export interface ListeningOverview {
  completed: number
  total: number
  totalAvailable: number
  avgProgress: number
  totalScore: number
  totalTime: number
}

export interface ReadingOverview {
  completed: number
  total: number
  totalAvailable: number
  avgProgress: number
  totalScore: number
  totalTime: number
}

export interface SpeakingOverview {
  completed: number
  total: number
  totalAvailable: number
  avgProgress: number
  totalScore: number
  totalTime: number
}

export interface WritingOverview {
  completed: number
  total: number
  totalAvailable: number
  avgProgress: number
  totalScore: number
  totalTime: number
}

export interface VocabularyOverview {
  learnedWords: number
  completedTopics: number
  totalAvailable: number
  totalTopics: number
  avgScore: number
  totalScore: number
  totalTime: number
}
