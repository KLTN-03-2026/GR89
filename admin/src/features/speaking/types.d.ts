import { Media } from "../Media/types"
import { User } from "../user/types"

export interface SpeakingSubtitle {
  _id: string
  orderIndex: number
  sentence: string // câu nói
  phonetic: string // phiên âm
  vietnamese: string // tiếng việt
  start?: number
  end?: number
}

export interface Speaking {
  _id: string
  title: string
  description?: string
  videoUrl: Media | null
  subtitleIds: SpeakingSubtitle[]
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  orderIndex: number
  isActive: boolean
  isVipRequired: boolean
  createdBy: ser
  updatedBy?: User
  createdAt: string
  updatedAt: string
}