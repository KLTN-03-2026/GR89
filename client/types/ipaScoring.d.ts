// Interface cho điểm số chi tiết từng âm
export interface IPhonemeScore {
  phone: string
  quality_score: number
  sound_most_like: boolean
  word_extend: string[]
  position: number
}

// Interface cho điểm số từng từ
export interface IWordScore {
  word: string
  phonetic: string
  accuracyScore: number
  phonemes: IPhonemeScore[]
  isCorrect: boolean
  errorPhonemes: string[]
}

// Interface cho kết quả chấm điểm IPA
export interface IIpaScoringResult {
  phone_score_list: IPhonemeScore[]
  word: string
  quality_score: number
}

// Interface cho thống kê chấm điểm
export interface IIpaScoringStats {
  totalAttempts: number
  averageScore: number
  bestScore: number
  worstScore: number
  averageAccuracy: number
  averageFluency: number
  averageCompleteness: number
  totalWords: number
  correctWords: number
  errorWords: number
  recentScores: Array<{
    overallScore: number
    createdAt: string
    lessonId?: {
      name: string
      type: string
    }
  }>
  scoreDistribution: Array<{
    _id: number
    count: number
    scores: number[]
  }>
}

// Interface cho pagination
export interface IIpaScoringPagination {
  page: number
  limit: number
  total: number
  pages: number
}

// Interface cho danh sách kết quả chấm điểm
export interface IIpaScoringList {
  scores: IIpaScoringResult[]
  pagination: IIpaScoringPagination
}

// Interface cho request chấm điểm
export interface IAssessIpaRequest {
  referenceText: string
  lessonId?: string
  audio: File
}

// Interface cho request chấm điểm với cấu hình
export interface IAssessIpaWithConfigRequest {
  referenceText: string
  lessonId?: string
  gradingSystem?: 'HundredMark' | 'FivePoint' | 'PassFail'
  granularity?: 'Phoneme' | 'Word' | 'FullText'
  audio: File
}
