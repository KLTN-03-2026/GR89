import { User } from "../user/types"

export interface Ipa {
  _id: string
  sound: string
  soundType: 'vowel' | 'consonant' | 'diphthong'
  image: string
  video: string
  examples: Example[]
  description: string
  orderIndex: number
  isActive: boolean
  isVipRequired: boolean
  createdBy: User
  updatedBy?: User
  createdAt: string
  updatedAt: string
}

export interface Example {
  _id: string
  word: string
  phonetic: string
  vietnamese: string
}