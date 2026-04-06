'use client'

import type { LucideIcon } from 'lucide-react'
import { User } from '../user/types'

export type LessonSection = {
  id: string
  title: string
  description?: string
  note?: string
  formula?: string
  examples?: { en: string; vi?: string }[]
  list?: string[]
  table?: {
    headers: string[]
    rows: string[][]
  }
}

export type PracticeQuestion =
  | { id: string; type: 'fill_blank'; question: string; answer: string; hint?: string }
  | { id: string; type: 'multiple_choice'; question: string; options: string[]; answer: string; hint?: string }
  | { id: string; type: 'correct_sentence'; question: string; wrongSentence: string; answer: string; hint?: string }

export type QuizQuestion = {
  _id: string
  question: string
  type: 'Multiple Choice' | 'Fill in the blank'
  options: string[]
  answer: string
  explanation: string
}

export type GrammarLessonDraft = {
  _id: string
  title: string
  description: string
  sections: LessonSection[]
  practice: PracticeQuestion[]
  quizzes: QuizQuestion[]
}

export type SectionBlockKey = 'description' | 'note' | 'formula' | 'list' | 'examples' | 'table'

export type SectionBlockOption = {
  key: SectionBlockKey
  label: string
  description: string
  icon: LucideIcon
}

export type SectionErrorState = {
  description: string
  note: string
  formula: string
  list: string
  examples: string
  tableHeaders: string
  tableRows: string
}

export type PracticeErrorState = {
  question: string
  options: string
}

export type QuizErrorState = {
  question: string
  options: string
  answer: string
  explanation: string
}

export type Step = 'upload' | 'preview' | 'importing' | 'result'

export type GrammarExample = {
  en: string
  vi?: string
}

export type GrammarSection = {
  id?: string
  title: string
  description?: string
  note?: string
  formula?: string
  examples?: GrammarExample[]
  list?: string[]
  table?: { headers: string[]; rows: string[][] }
}

export type GrammarPractice = {
  id?: string
  type: 'fill_blank' | 'multiple_choice' | 'correct_sentence'
  question: string
  options?: string[]
  wrongSentence?: string
  answer: string
  hint: string
}

export type GrammarQuiz = {
  type: 'Multiple Choice' | 'Fill in the blank'
  question: string
  options?: string[]
  answer: string
  explanation: string
}

export type GrammarTopic = {
  _id: string
  title: string
  description?: string
  orderIndex: number
  sections?: GrammarSection[]
  practice?: GrammarPractice[]
  quizzes?: GrammarQuiz[]
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
  isVipRequired?: boolean
  isActive?: boolean
  createdBy?: User
  updatedBy?: User
  createdAt?: number
}

export type ValidationError = {
  row: number
  field: string
  message: string
}

export type ImportSummary = {
  inserted: number
  skipped: number
  errors: { index: number; reason: string }[]
}

