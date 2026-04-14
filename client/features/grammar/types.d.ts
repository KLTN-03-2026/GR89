export interface GrammarTopic {
  _id: string
  title: string
  description: string
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
  progress: number
  isVipRequired?: boolean
}

export type StudyStage = 'theory' | 'practice'
export type PracticeStatus = 'idle' | 'correct' | 'wrong'

export type LessonSection = {
  id: string
  title: string
  description?: string
  note?: string
  formula?: string
  examples?: { en: string; vi?: string }[]
  list?: string[]
  table?: { headers: string[]; rows: string[][] }
}

export type PracticeQuestion =
  | { id: string; type: 'Fill in the blank'; question: string; answer: string; hint: string }
  | { id: string; type: 'Multiple Choice'; question: string; options: string[]; answer: string; hint: string }
  | { id: string; type: 'Correct Sentence'; question: string; answer: string; hint: string }

export type QuizQuestion = { id: string; question: string; options: string[]; answer: string }

export type GrammarLessonFlowData = {
  title: string
  description: string
  sections: LessonSection[]
  practice: PracticeQuestion[]
  quizzes: QuizQuestion[]
}

export type GrammarProgress = {
  _id: string
  userId: string
  grammarTopicId: string
  resultId: string[]
  isActive: boolean
  isCompleted: boolean
  progress: number
  studyTime: number
}