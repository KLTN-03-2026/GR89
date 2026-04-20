'use client'

import { useState } from 'react'
import { AudioSection } from '@/components/common/medias'
import DictationCompletedConfirm from './DictationCompletedConfirm'
import { useRouter } from 'next/navigation'
import DictationHasStarted from './DictationHasStarted'
import DictationInput from './DictationInput'

interface DictationStepWithViProps {
  listeningId: string
  audioUrl: string
  subtitleEn: string
  subtitleVi: string
  title: string
  formDataDictationResult: {
    index: number
    text: string
    isCorrect: boolean
  }[]
  setFormDataDictationResult: (formDataDictationResult: {
    index: number
    text: string
    isCorrect: boolean
  }[]) => void
  handleSubmit: () => void
  onRetry?: () => void
}

const sanitizeSubtitleForDictation = (text: string) =>
  String(text || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => Boolean(line))
    .map((line) => line.replace(/^[AB]\s*:\s*/i, ''))
    .join('\n')

const normalizeWord = (v: string) =>
  v
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[.,?!;:"'()\-]/g, '')
    .trim()

export function DictationStepWithVi({
  listeningId,
  audioUrl,
  subtitleEn,
  subtitleVi,
  formDataDictationResult,
  setFormDataDictationResult,
  handleSubmit,
  onRetry
}: DictationStepWithViProps) {
  const router = useRouter()
  const normalizedSubtitleEn = sanitizeSubtitleForDictation(subtitleEn)
  const normalizedSubtitleVi = sanitizeSubtitleForDictation(subtitleVi)
  const wordsEn = normalizedSubtitleEn.trim().split(/\s+/)
  const sentencesEn = normalizedSubtitleEn.split(/(?<=[.!?])\s+/).filter(Boolean)
  const sentencesVi = normalizedSubtitleVi.trim().split(/(?<=[.!?])\s+/).filter(Boolean)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [inputText, setInputText] = useState('')

  const [hasStarted, setHasStarted] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  const [isSavingResult, setIsSavingResult] = useState(false)
  const [completedSentences, setCompletedSentences] = useState<number[]>([])

  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false)

  const getSentenceIndexForWordIndex = (wordIdx: number) => {
    let count = 0
    for (let i = 0; i < sentencesEn.length; i++) {
      const wordsInSentence = sentencesEn[i].trim().split(/\s+/).length
      if (wordIdx < count + wordsInSentence) return i
      count += wordsInSentence
    }
    return -1
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Click left giảm 5s audio
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      window.dispatchEvent(new CustomEvent('audio:seek', { detail: { delta: -5 } }))
      return
    }

    // Click right tăng 5s audio
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      window.dispatchEvent(new CustomEvent('audio:seek', { detail: { delta: 5 } }))
      return
    }

    // Click Control toggle audio
    if (e.key === 'Control') {
      e.preventDefault()
      window.dispatchEvent(new Event('audio:toggle'))
      return
    }

    // Click Enter hoặc Space xác nhận từ
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      const rawTarget = wordsEn[currentIndex] || ''
      const isCorrect = normalizeWord(inputText) === normalizeWord(rawTarget)

      const newItem = { index: currentIndex, text: inputText, isCorrect }
      const newResult = [...formDataDictationResult, newItem]
      setFormDataDictationResult(newResult)
      setInputText('')
      const nextIndex = currentIndex + 1

      const sentenceIdx = getSentenceIndexForWordIndex(currentIndex)
      const wordsInThisSentence = sentencesEn[sentenceIdx]?.trim().split(/\s+/)?.length ?? 0
      const wordOffsetInSentence = sentenceIdx >= 0
        ? currentIndex - sentencesEn.slice(0, sentenceIdx).reduce((acc, s) => acc + s.trim().split(/\s+/).length, 0)
        : 0
      const isLastWordOfSentence = wordOffsetInSentence === wordsInThisSentence - 1

      if (isLastWordOfSentence && sentenceIdx >= 0 && !completedSentences.includes(sentenceIdx)) {
        setCompletedSentences(prev => [sentenceIdx, ...prev])
      }

      setCurrentIndex(nextIndex)

      if (nextIndex >= wordsEn.length) {
        setIsCompleted(true)
        setShowCompleteConfirm(true)
      }
    }
  }

  const correctCount = formDataDictationResult.filter(r => r.isCorrect).length
  const pct = formDataDictationResult.length ? Math.round((correctCount / formDataDictationResult.length) * 100) : 0

  const handleGoToResultPage = async () => {
    handleSubmit()
  }

  const handleRetry = () => {
    if (!onRetry) {
      router.replace(`/skills/listening/lesson/${listeningId}`)
    }
    else {
      setCurrentIndex(0)
      setInputText('')
      setFormDataDictationResult([])
      setHasStarted(false)
      setIsCompleted(false)
      setIsSavingResult(false)
      setCompletedSentences([])
      setShowCompleteConfirm(false)
      onRetry()
    }
  }

  return (
    <div className="space-y-6">

      <AudioSection audioUrl={audioUrl} />

      <div className="rounded-2xl border border-gray-200/80 bg-white shadow-sm overflow-hidden">
        <div className="p-6 space-y-5">
          {!hasStarted ? (
            <DictationHasStarted handleStart={() => setHasStarted(true)} />
          ) : (
            <DictationInput
              inputText={inputText}
              setInputText={setInputText}
              handleKeyDown={handleKeyDown}
              isCompleted={isCompleted}
            />
          )}

          {hasStarted && formDataDictationResult.length > 0 && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-x-1.5 gap-y-2 leading-relaxed text-sm min-h-[100px] max-h-72 overflow-y-auto p-4 rounded-xl bg-gradient-to-br from-slate-50 to-indigo-50/30 border border-indigo-100/50">
                {wordsEn.map((_, wordIdx) => {
                  const res = formDataDictationResult.find(r => r.index === wordIdx)
                  if (!res) return null

                  return (
                    <span key={wordIdx} className="inline-flex flex-wrap items-baseline gap-x-1">
                      {res.isCorrect ? (
                        <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 font-medium">{wordsEn[wordIdx]}</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-lg bg-red-100 text-red-800 inline-flex items-center gap-1">
                          <span className="line-through">{res.text || '(-)'}</span>
                          <span>{wordsEn[wordIdx]}</span>
                        </span>
                      )}
                    </span>
                  )
                })}
              </div>

              {completedSentences.length > 0 && (
                <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 mb-3">
                    Các câu đã hoàn thành
                  </p>
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                    {completedSentences.map((sentenceIdx) => (
                      <div
                        key={sentenceIdx}
                        className="rounded-lg border border-indigo-200 bg-white p-3 shadow-sm"
                      >
                        <p className="text-sm font-medium text-gray-900 leading-relaxed">
                          {sentencesEn[sentenceIdx]}
                        </p>
                        {sentencesVi[sentenceIdx] && (
                          <p className="mt-1.5 text-sm text-gray-600 italic leading-relaxed border-l-2 border-indigo-300 pl-2.5">
                            {sentencesVi[sentenceIdx]}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Điểm:</span>
                  <span className="font-bold text-indigo-600 tabular-nums">{correctCount}/{formDataDictationResult.length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Tỷ lệ:</span>
                  <span className={`font-bold tabular-nums ${pct >= 80 ? 'text-emerald-600' : pct >= 50 ? 'text-amber-600' : 'text-red-500'
                    }`}>
                    {pct}%
                  </span>
                </div>
                <div className="flex-1 h-2 max-w-[150px] rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>

              </div>
            </div>
          )}
        </div>
      </div>

      <DictationCompletedConfirm
        handleRetry={handleRetry}
        handleGoToResultPage={handleGoToResultPage}
        showCompleteConfirm={showCompleteConfirm}
        setShowCompleteConfirm={setShowCompleteConfirm}
        isSavingResult={isSavingResult}
      />
    </div>
  )
}

