export interface MediaSubtitlePreview {
  start: string
  end: string
  english?: string
  phonetic?: string
  vietnamese?: string
  raw?: string
}

export interface MediaSubtitle {
  _id?: string
  label?: string
  fileUrl: string
  format?: string
  languagePair?: string
  originalName?: string
  uploadedAt?: string | Date
  updatedAt?: string | Date
  totalEntries?: number
  preview?: MediaSubtitlePreview[]
}

export interface Media {
  _id: string
  type: string
  url: string
  publicId: string
  title?: string // Tên tùy chỉnh cho media
  format: string
  size: number
  width: number
  height: number
  duration?: number // For audio files
  userId: {
    _id: string
    email: string
    fullName: string
  }
  subtitles?: MediaSubtitle[]
  createdAt: Date
  updatedAt: Date
}