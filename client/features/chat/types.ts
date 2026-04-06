/* AI Chat Exercise System */
export type ExerciseType = 'multiple-choice' | 'fill-blank' | 'translation'

export interface ExerciseQuestion {
  id: string
  type: ExerciseType
  question: string
  explanation: string
}

export interface MultipleChoiceQuestion extends ExerciseQuestion {
  type: 'multiple-choice'
  options: Array<{
    label: string
    value: string
    isCorrect: boolean
  }>
}

export interface FillBlankQuestion extends ExerciseQuestion {
  type: 'fill-blank'
  correctAnswers: string[]
}

export interface TranslationQuestion extends ExerciseQuestion {
  type: 'translation'
  correctAnswers: string[]
}

export interface Exercise {
  id: string
  title?: string
  questions: Array<MultipleChoiceQuestion | FillBlankQuestion | TranslationQuestion>
}

export interface QuestionResult {
  questionId: string
  isCorrect: boolean
  userAnswer: string
  correctAnswer: string
  explanation: string
}

export interface ExerciseResult {
  exerciseId: string
  totalQuestions: number
  correctAnswers: number
  percentage: number
  results: QuestionResult[]
}
