/**
 * Central API types - used by server services and dashboard.
 * API functions have been moved to feature services (e.g. features/auth/services/authApi.ts).
 */

export type { StudySessionPayload } from './types'

// Lesson stats - used by dashboard, grammar, writing, reading, listening, speaking, ipa services
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
  totalTopics: number
  avgScore: number
  totalScore: number
  totalTime: number
}
