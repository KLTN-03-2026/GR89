export interface GrammarTopic {
  _id: string
  title: string
  description: string
  progress: number
  isVipRequired?: boolean
}

export type StudyStage = 'theory' | 'practice' | 'quiz' | 'result'
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
  | { id: string; type: 'fill_blank'; question: string; answer: string; hint: string }
  | { id: string; type: 'multiple_choice'; question: string; options: string[]; answer: string; hint: string }
  | { id: string; type: 'correct_sentence'; question: string; wrongSentence: string; answer: string; hint: string }

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