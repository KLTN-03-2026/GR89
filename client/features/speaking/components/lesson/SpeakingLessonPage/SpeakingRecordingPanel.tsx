'use client'
import { useState } from 'react'
import type { MutableRefObject, Dispatch, SetStateAction } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { RecordingSection } from '@/components/common/medias'
import { Mic, ChevronRight, CheckCircle, RotateCcw, Sparkles, Volume2 } from 'lucide-react'
import { toast } from 'react-toastify'
import { assessSpeakingPronunciation, saveHighestSpeakingScore } from '@/features/speaking/services/speakingApi'
import type { StudySessionPayload } from '@/libs/apis/types'
import type { AssessmentResult, SentenceEvaluation, SpeechAceResponse } from './types'
import { getWordColor, mapSpeechAceResponseToSpeakingResult } from './utils'
import { MediaSubtitlePreviewEntry } from '@/types/speaking'

interface SpeakingRecordingPanelProps {
  maxDuration: number
  currentSubtitle: MediaSubtitlePreviewEntry | null
  currentSubtitleIndex: number
  lessonSubtitlesLength: number
  speakingId: string
  assessmentResult: AssessmentResult | null
  isSubmitting: boolean
  scores: number[]
  user: { _id: string } | null
  setAssessmentResult: (result: AssessmentResult | null) => void
  setIsSubmitting: (value: boolean) => void
  setSentenceResults: Dispatch<SetStateAction<SentenceEvaluation[]>>
  setScores: Dispatch<SetStateAction<number[]>>
  setCompletedSubtitles: Dispatch<SetStateAction<number[]>>
  setCurrentSubtitleIndex: (index: number | ((prev: number) => number)) => void
  setReplayTrigger: (value: number | ((prev: number) => number)) => void
  setShowFinalResults: (value: boolean) => void
  setFinalAverageScore: (value: number) => void
  setFinalResults: Dispatch<SetStateAction<SentenceEvaluation[]>>
  sentenceResultsRef: MutableRefObject<SentenceEvaluation[]>
  saveAllResultsToServer: (results: Array<{ index: number; score: number; audioBlob?: File }>) => Promise<void>
  getStudySessionPayload: () => StudySessionPayload
}

export function SpeakingRecordingPanel({
  maxDuration = 3,
  currentSubtitle,
  currentSubtitleIndex,
  lessonSubtitlesLength,
  speakingId,
  assessmentResult,
  isSubmitting,
  scores,
  user,
  setAssessmentResult,
  setIsSubmitting,
  setSentenceResults,
  setScores,
  setCompletedSubtitles,
  setCurrentSubtitleIndex,
  setReplayTrigger,
  setShowFinalResults,
  setFinalAverageScore,
  setFinalResults,
  sentenceResultsRef,
  saveAllResultsToServer,
  getStudySessionPayload
}: SpeakingRecordingPanelProps) {
  const [localAudioBlob, setLocalAudioBlob] = useState<Blob | null>(null)

  const handleRecordingComplete = async (audioBlob: Blob) => {
    if (!currentSubtitle) return

    setIsSubmitting(true)
    setAssessmentResult(null)
    setLocalAudioBlob(audioBlob)

    const audioFile = new File([audioBlob], `recording-${Date.now()}.wav`, { type: 'audio/wav' })

    await assessSpeakingPronunciation(currentSubtitle.english || '', audioFile)
      .then((res => {
        if (res.success && res.data) {
          const result = mapSpeechAceResponseToSpeakingResult(res.data as SpeechAceResponse, currentSubtitle.english || '')
          setAssessmentResult(result)
        } else {
          toast.error('Chấm điểm thất bại')
          setLocalAudioBlob(null)
        }
      })).finally(() => {
        setIsSubmitting(false)
        // Sau khi chấm điểm xong, tự động phát lại đoạn video để người học nghe lại
        setReplayTrigger(prev => prev + 1)
      })
  }

  const handleNextSentence = () => {
    if (!assessmentResult || !currentSubtitle) return

    const currentScore = assessmentResult.overallScore
    const audioFile = localAudioBlob ? new File([localAudioBlob], `recording-${currentSubtitleIndex}-${Date.now()}.wav`, { type: 'audio/wav' }) : undefined

    setSentenceResults(prev => {
      const existing = prev.find(r => r.index === currentSubtitleIndex)
      const updated = existing
        ? prev.map(r => r.index === currentSubtitleIndex
          ? {
            ...r,
            score: currentScore,
            audioBlob: audioFile,
            words: assessmentResult.words,
            sentence: currentSubtitle.english || '',
            aiFeedback: assessmentResult.aiFeedback
          }
          : r)
        : [...prev, {
          index: currentSubtitleIndex,
          score: currentScore,
          audioBlob: audioFile,
          words: assessmentResult.words,
          sentence: currentSubtitle.english || '',
          aiFeedback: assessmentResult.aiFeedback
        }]

      sentenceResultsRef.current = updated
      return updated
    })

    setScores(prev => {
      const newScores = [...prev]
      newScores[currentSubtitleIndex] = currentScore
      return newScores
    })
    setCompletedSubtitles(prev => {
      if (!prev.includes(currentSubtitleIndex)) {
        return [...prev, currentSubtitleIndex]
      }
      return prev
    })

    setAssessmentResult(null)
    setLocalAudioBlob(null)

    if (currentSubtitleIndex < (lessonSubtitlesLength || 0) - 1) {
      setCurrentSubtitleIndex(prev => prev + 1)
      setReplayTrigger(0)
    }
  }

  const handleCompleteLesson = async () => {
    if (!assessmentResult || !localAudioBlob || !currentSubtitle) {
      await saveAllResults()
      return
    }

    try {
      setIsSubmitting(true)

      const currentScore = assessmentResult.overallScore
      const audioFile = localAudioBlob ? new File([localAudioBlob], `recording-${currentSubtitleIndex}-${Date.now()}.wav`, { type: 'audio/wav' }) : undefined

      const currentResults = [...sentenceResultsRef.current]
      const existingIndex = currentResults.findIndex(r => r.index === currentSubtitleIndex)

      const currentResult = {
        index: currentSubtitleIndex,
        score: currentScore,
        audioBlob: audioFile,
        words: assessmentResult.words,
        sentence: currentSubtitle.english || '',
        aiFeedback: assessmentResult.aiFeedback
      }

      if (existingIndex >= 0) {
        currentResults[existingIndex] = currentResult
      } else {
        currentResults.push(currentResult)
      }

      setSentenceResults(currentResults)
      sentenceResultsRef.current = currentResults

      const currentScores = [...scores]
      currentScores[currentSubtitleIndex] = currentScore

      const validScores = currentScores.filter(s => s > 0)
      const averageScore = validScores.length > 0
        ? Math.round(currentScores.reduce((sum, s) => sum + s, 0) / validScores.length)
        : currentScore

      await saveAllResultsToServer(currentResults)

      if (user?._id && averageScore > 0) {
        const studySession = getStudySessionPayload()
        saveHighestSpeakingScore(user._id, speakingId, averageScore, studySession)
          .then((res) => {
            if (res.success && res.data) {
              if (res.data.isNewRecord) {
                toast.success(`🏆 Điểm cao mới! ${averageScore}/100`)
              } else if (res.data.previousBest !== undefined && res.data.previousBest >= averageScore) {
                toast.info(`Điểm hiện tại: ${averageScore}/100. Điểm cao nhất trước đó: ${res.data.previousBest}/100`)
              }
            }
          })
      }

      const sortedResults = [...currentResults].sort((a, b) => a.index - b.index)

      setFinalResults(sortedResults)
      setFinalAverageScore(averageScore)
      setShowFinalResults(true)
      setAssessmentResult(null)
      setLocalAudioBlob(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  const saveAllResults = async () => {
    setIsSubmitting(true)
    await saveAllResultsToServer(sentenceResultsRef.current)
      .then(() => {
        const validScores = sentenceResultsRef.current.map(r => r.score).filter(s => s > 0)
        const averageScore = validScores.length > 0
          ? Math.round(validScores.reduce((sum, s) => sum + s, 0) / validScores.length)
          : 0

        if (user?._id && averageScore > 0) {
          const studySession = getStudySessionPayload()
          saveHighestSpeakingScore(user._id, speakingId, averageScore, studySession)
            .then((res) => {
              if (res.success && res.data) {
                if (res.data.isNewRecord) {
                  toast.success(`🏆 Điểm cao mới! ${averageScore}/100`)
                } else if (res.data.previousBest !== undefined && res.data.previousBest >= averageScore) {
                  toast.info(`Điểm hiện tại: ${averageScore}/100. Điểm cao nhất trước đó: ${res.data.previousBest}/100`)
                }
              }
            })
        }

        setFinalResults(sentenceResultsRef.current)
        setFinalAverageScore(averageScore)
        setShowFinalResults(true)
      }).finally(() => {
        setIsSubmitting(false)
      })
  }

  const handleRetryAssessment = () => {
    setAssessmentResult(null)
    setLocalAudioBlob(null)
  }

  const playRecordedAudio = () => {
    if (!localAudioBlob) return
    const url = URL.createObjectURL(localAudioBlob)
    const audio = new Audio(url)
    audio.onended = () => URL.revokeObjectURL(url)
    audio.onerror = () => URL.revokeObjectURL(url)
    audio.play().catch(() => {
      URL.revokeObjectURL(url)
    })
  }

  const hasNextSentence = currentSubtitleIndex < (lessonSubtitlesLength || 0) - 1

  if (!assessmentResult) {
    return (
      <div className="px-6 pb-6 text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Mic className="w-5 h-5 text-red-500" />
          <span className="text-lg font-medium">Ghi âm câu của bạn</span>
        </div>

        <RecordingSection onRecordingComplete={handleRecordingComplete} maxDuration={maxDuration} />

        {isSubmitting && (
          <div className="flex items-center justify-center space-x-2 text-blue-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500" />
            <span>Đang chấm điểm...</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="px-6 pb-6">
      <Card className="w-full rounded-2xl border-slate-200 shadow-lg">
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="text-sm font-medium text-gray-700 text-center">Điểm từng từ:</div>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {assessmentResult.words.map((word) => (
                  <div
                    key={`${word.word}-${word.score}`}
                    className={`px-4 py-2 rounded-lg border-2 ${getWordColor(word.score)} transition-all`}
                    title={`${word.word}: ${word.score}/100`}
                  >
                    <div className="font-medium text-lg">{word.word}</div>
                    {word.phonetic && (
                      <div className="text-xs text-gray-500 mt-1 font-mono">{word.phonetic}</div>
                    )}
                    <div className="text-xs font-bold mt-1">{word.score}/100</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center pt-4 border-t border-gray-200">
              <div className="text-4xl font-bold text-gray-800 mb-2">
                {assessmentResult.averageScore}
                <span className="text-2xl text-gray-500">/100</span>
              </div>
              <div className="text-sm text-gray-500 mt-2">Điểm trung bình</div>
            </div>

            {!!assessmentResult.aiFeedback && (
              <div className="rounded-xl border border-indigo-100 bg-gradient-to-b from-indigo-50 to-white p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <Sparkles className="h-4 w-4 text-indigo-600" />
                  Gợi ý luyện tập
                </div>
                <div className="mt-2 text-sm text-slate-700 whitespace-pre-line">
                  {assessmentResult.aiFeedback}
                </div>
              </div>
            )}

            {!!localAudioBlob && (
              <div className="flex justify-center">
                <Button onClick={playRecordedAudio} variant="outline" className="flex items-center gap-2 rounded-xl border-slate-300 hover:bg-slate-50">
                  <Volume2 className="w-4 h-4" />
                  Nghe lại giọng của bạn
                </Button>
              </div>
            )}

            <div className="flex items-center justify-center gap-4 pt-4">
              <Button onClick={handleRetryAssessment} variant="outline" className="flex items-center gap-2 rounded-xl">
                <RotateCcw className="w-4 h-4" />
                Làm lại
              </Button>
              {hasNextSentence ? (
                <Button onClick={handleNextSentence} variant="default" className="flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800">
                  Tiếp theo
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleCompleteLesson}
                  variant="default"
                  className="flex items-center gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      Hoàn thành
                      <CheckCircle className="w-4 h-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
