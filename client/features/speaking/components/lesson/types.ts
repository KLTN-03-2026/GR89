export interface SpeechAcePhoneScore {
  phone?: string
  phoneme?: string
  label?: string
  symbol?: string
  quality_score?: number
  score?: number
  accuracy_score?: number
  pronunciation_score?: number
}

export interface SpeechAceWordScore {
  word?: string
  quality_score?: number
  phonetic?: string
  ipa?: string
  phone_score_list?: SpeechAcePhoneScore[]
}

export interface SpeechAceResponse {
  text_score?: {
    speechace_score?: {
      pronunciation?: number
    }
    overall_score?: number
    word_score_list?: SpeechAceWordScore[]
  }
  overall_score?: number
  aiFeedback?: string
}

export interface AssessmentWordResult {
  word: string
  score: number
  phonetic?: string
  phonemes?: {
    phoneme: string
    accuracyScore: number
  }[]
}

export interface AssessmentResult {
  overallScore: number
  words: AssessmentWordResult[]
  averageScore: number
  aiFeedback?: string
}

export interface SentenceEvaluation {
  index: number
  score: number
  audioBlob?: File
  words?: AssessmentWordResult[]
  sentence?: string
  aiFeedback?: string
}

export interface SpeakingLessonPageProps {
  speakingId: string
}

