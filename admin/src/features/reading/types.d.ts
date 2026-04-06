import { User } from "../user/types";
import { Quiz } from "./quiz"

interface DataReading {
  title: string
  description: string
  paragraphEn: string
  paragraphVi: string
  image?: string
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
  vocabulary: {
    word: string
    phonetic: string
    definition: string
    vietnamese: string
    example: string
  }[]
  quizzes: string[]
}

export interface Reading {
  _id: string
  orderIndex: number,
  image: {
    _id: string;
    url: string;
  }
  title: string
  description: string
  paragraphEn: string
  paragraphVi: string
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
  vocabulary: Vocabulary[]
  quizzes: Quiz[]
  isActive: boolean
  isVipRequired?: boolean
  createdBy: User
  updatedBy?: User
  createdAt: string
  updatedAt: string
}

export interface Vocabulary {
  _id: string
  word: string
  phonetic: string
  definition: string
  vietnamese: string
  example: string
}

export interface ReadingOverviewStats {
  totalLessons: number
  activeLessons: number
  totalUsers: number
  completionRate: number
  monthlyLearns: number
  monthlyChange: number
  completedProgressRecords: number
  totalProgressRecords: number
}