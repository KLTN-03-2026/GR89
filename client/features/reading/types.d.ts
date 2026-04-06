import { Quiz } from "./quiz"

export interface IReading {
  _id: string
  title: string
  description: string
  paragraphEn: string
  paragraphVi: string
  vocabulary: IVocabularyReading[]
  quizzes: Quiz[]
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
  image?: {
    _id: string
    url: string
    width?: number
    height?: number
  }
  isActive: boolean
  isVipRequired?: boolean
  isCompleted: boolean
  progress: number
  isResult: boolean
}

export interface IVocabularyReading {
  _id: string
  word: string
  phonetic: string
  definition: string
  vietnamese: string
  example: string
}

export interface ReadingProgress {
  _id: string
  progress: number
  isActive: boolean
  isCompleted: boolean
}
