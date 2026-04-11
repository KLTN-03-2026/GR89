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
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
  isResult?: boolean
  progress: number
}

export interface ISpeakingSentenceAchievement {
  sentenceIndex: number
  bestScore: number
  attempts: number
  lastAt: string
}

export interface ISpeakingResult {
  progress: number
  point: number
  bestHistoryProgress: number
  status?: string
  time: number
  date?: string
  sentences: ISpeakingSentenceAchievement[]
  speakingLesson: {
    _id: string
    title: string
    description?: string
    level?: string
    orderIndex?: number
    videoUrl?: { url?: string } | string
  }
}
