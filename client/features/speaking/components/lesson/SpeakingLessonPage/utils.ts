import type { SpeechAceResponse, AssessmentResult, AssessmentWordResult } from './types'

export const parseSrtTimestamp = (timestamp: string): number => {
  const [time, ms] = timestamp.split(',')
  const [hh, mm, ss] = time.split(':').map(Number)
  const milliseconds = Number(ms || 0)
  return hh * 3600 + mm * 60 + ss + milliseconds / 1000
}

export const mapSpeechAceResponseToSpeakingResult = (
  data: SpeechAceResponse | undefined,
  referenceText: string
): AssessmentResult => {
  const textScore = data?.text_score
  const overallScore = Math.round(
    textScore?.speechace_score?.pronunciation ??
    textScore?.overall_score ??
    data?.overall_score ??
    0
  )

  const wordScoreList = textScore?.word_score_list ?? []
  const words: AssessmentWordResult[] = wordScoreList.map((wordEntry) => {
    const wordScore = Math.round(wordEntry?.quality_score ?? 0)
    const phoneScoreList = wordEntry?.phone_score_list ?? []
    const phonemes = phoneScoreList.map((phone) => {
      const phoneScore = Math.round(
        phone?.quality_score ??
        phone?.score ??
        phone?.accuracy_score ??
        phone?.pronunciation_score ??
        wordScore
      )
      return {
        phoneme: phone?.phone || phone?.phoneme || phone?.label || phone?.symbol || '',
        accuracyScore: phoneScore
      }
    }).filter((entry) => entry.phoneme)

    return {
      word: wordEntry?.word || '',
      score: wordScore,
      phonetic: wordEntry?.phonetic || wordEntry?.ipa || '',
      phonemes: phonemes.length > 0 ? phonemes : undefined
    }
  })

  if (words.length === 0 && referenceText) {
    const wordArray = referenceText.split(' ').filter(Boolean)
    words.push(...wordArray.map(word => ({
      word,
      score: overallScore,
      phonetic: '',
      phonemes: undefined
    })))
  }

  const averageScore = words.length > 0
    ? Math.round(words.reduce((sum, w) => sum + w.score, 0) / words.length)
    : overallScore

  return {
    overallScore,
    words,
    averageScore,
    aiFeedback: (data as any)?.aiFeedback ? String((data as any).aiFeedback) : undefined,
  }
}

export const getWordColor = (score: number): string => {
  if (score >= 80) return 'text-emerald-700 bg-emerald-100 border-emerald-400'
  if (score >= 60) return 'text-amber-700 bg-amber-100 border-amber-300'
  return 'text-rose-700 bg-rose-100 border-rose-300'
}

export const getWordColorForFinal = (score: number): string => {
  if (score >= 80) return 'bg-emerald-100 border-emerald-500 text-emerald-800'
  if (score >= 60) return 'bg-amber-100 border-amber-500 text-amber-800'
  return 'bg-rose-100 border-rose-500 text-rose-800'
}

