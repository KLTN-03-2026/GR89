export interface SpeakingSubtitle {
  _id: string
  speakingId: string
  orderIndex: number
  english: string // câu nói
  phonetic: string // phiên âm
  vietnamese: string // tiếng việt
  start?: string | number
  end?: string | number
  createdAt: string
  updatedAt: string
}

export interface MediaSubtitlePreviewEntry {
  _id?: string
  start?: string | number
  end?: string | number
  english?: string
  vietnamese?: string
  phonetic?: string
}

export interface MediaSubtitleEntry {
  label?: string
  languagePair?: string
  fileUrl: string
  format?: string
  originalName?: string
  totalEntries?: number
  preview?: MediaSubtitlePreviewEntry[]
}

export interface Speaking {
  _id: string
  title: string
  description?: string
  videoUrl: string
  orderIndex: number
  isActive: boolean
  isVipRequired: boolean
  isCompleted: boolean
  progress: number
}
