'use client'
import { useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { RecordingSection } from '@/components/common/medias'
import { Mic, ChevronRight, CheckCircle, RotateCcw, Sparkles, Volume2 } from 'lucide-react'
import { assessSpeakingPronunciation } from '@/features/speaking/services/speakingApi'
import type { AssessmentWordResult, SentenceEvaluation, SpeechAceResponse } from './types'
import { getWordColor, mapSpeechAceResponseToSpeakingResult } from './utils'
import { subtitle } from '../../types'

interface SpeakingRecordingPanelProps {
  maxDuration: number
  currentSubtitle: subtitle | null
  currentSubtitleIndex: number
  lessonSubtitlesLength: number
  sentenceCurrent: SentenceEvaluation
  setSentenceResults: Dispatch<SetStateAction<SentenceEvaluation[]>>
  setCurrentSubtitleIndex: (index: number | ((prev: number) => number)) => void
  submit: () => void
  isSubmittingAll: boolean
}

export function SpeakingRecordingPanel({
  maxDuration,
  currentSubtitle,
  currentSubtitleIndex,
  lessonSubtitlesLength,
  sentenceCurrent,
  setSentenceResults,
  setCurrentSubtitleIndex,
  submit,
  isSubmittingAll
}: SpeakingRecordingPanelProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [localAudioBlob, setLocalAudioBlob] = useState<Blob | null>(null)

  // Gọi API chấm điểm phát âm từng câu
  const handleRecordingComplete = async (audioBlob: Blob) => {
    if (!currentSubtitle) return

    setIsSubmitting(true)
    setLocalAudioBlob(audioBlob)

    const audioFile = new File([audioBlob], `recording-${Date.now()}.wav`, { type: 'audio/wav' })

    await assessSpeakingPronunciation(currentSubtitle.english || '', audioFile)
      .then((res => {
        const result = mapSpeechAceResponseToSpeakingResult(res.data as SpeechAceResponse, currentSubtitle.english || '')
        setSentenceResults(prev =>
          prev.map((item: SentenceEvaluation) =>
            item.index === currentSubtitleIndex ? {
              index: item.index,
              score: result.words.reduce((acc, word) => acc + word.score, 0) / result.words.length,
              words: result.words,
              audioBlob: audioFile,
              sentence: currentSubtitle.english || '',
              aiFeedback: result.aiFeedback
            } : item
          )
        )
      })).finally(() => {
        setIsSubmitting(false)
      })
  }

  // Hàm chuyển sang câu tiếp theo
  const handleNextSentence = () => {
    if (!sentenceCurrent || !currentSubtitle) return

    setCurrentSubtitleIndex(prev => prev + 1)
  }

  // Hàm làm lại câu học
  const handleRetryAssessment = () => {
    setLocalAudioBlob(null)
  }

  // Hàm nghe lại giọng của bạn
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
  if (!sentenceCurrent || (sentenceCurrent.words && sentenceCurrent.words.length === 0)) {
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

  // Hàm tính điểm trung bình của câu
  const avg = Math.round(
    (sentenceCurrent.words?.reduce((acc, w) => acc + w.score, 0) || 0) /
    (sentenceCurrent.words?.length || 1)
  )

  return (
    <div className="px-6 pb-6">
      <Card className="w-full rounded-2xl border-slate-200 shadow-lg">
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="text-sm font-medium text-gray-700 text-center">Điểm từng từ:</div>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {sentenceCurrent.words && sentenceCurrent.words.length > 0 && sentenceCurrent.words.map((word: AssessmentWordResult, index: number) => (
                  <div
                    key={`${word.word}-${word.score}-${index}-${Date.now()}`}
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
                {avg}
                <span className="text-2xl text-gray-500">/100</span>
              </div>
              <div className="text-sm text-gray-500 mt-2">Điểm trung bình</div>
            </div>

            {!!sentenceCurrent.aiFeedback && (
              <div className="rounded-xl border border-indigo-100 bg-gradient-to-b from-indigo-50 to-white p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <Sparkles className="h-4 w-4 text-indigo-600" />
                  Gợi ý luyện tập
                </div>
                <div className="mt-2 text-sm text-slate-700 whitespace-pre-line">
                  {sentenceCurrent.aiFeedback}
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
                  onClick={() => submit()}
                  variant="default"
                  className="flex items-center gap-2"
                  disabled={isSubmitting || isSubmittingAll}
                >
                  {isSubmitting || isSubmittingAll ? (
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
