import { User } from "../user/types"

export type WritingSortField = 'orderIndex' | 'title' | 'createdAt' | 'updatedAt'
export type WritingSortOrder = 'asc' | 'desc'

export interface Writing {
  _id: string
  orderIndex: number
  title: string
  description: string
  minWords: number
  maxWords: number
  duration: number
  suggestedVocabulary: string[]
  suggestedStructure: {
    title: string
    description: string
    step: number
  }[]
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
  isActive: boolean
  isVipRequired: boolean
  createdBy: User
  updatedBy?: User
  createdAt: string
  updatedAt: string
}
