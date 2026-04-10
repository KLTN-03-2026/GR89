import { User } from "../user/types";

export interface Listening {
  quiz?: {
    question: string
    options: string[]
    answer: string
  }[]
  _id: string
  title: string
  description: string
  audio: string | { _id: string; url: string; title?: string; filename?: string }
  subtitle: string
  subtitleVi: string
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
  isActive: boolean
  isVipRequired: boolean
  orderIndex: number
  createdBy: User
  updatedBy?: User
  createdAt: string
  updatedAt: string
}
