'use client'

import { useEffect, useState } from 'react'
import { AudioSection } from '@/components/common/medias'
import { CheckCircle2, Keyboard, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { doListeningQuiz } from '@/features/listening/services/listeningApi'
import { notifyStreakIncrease } from '@/libs/streakToast'
import { useStudySession } from '@/libs/hooks/useStudySession'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'

interface DictationStepWithViProps {
  lessonId: string
  audioUrl: string
  subtitleEn: string
  subtitleVi: string
  title: string
  onComplete: (result: { correct: number; total: number; percentage: number }) => void
}

const normalizeWord = (v: string) =>
  v
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[.,?!;:"'()\-]/g, '')
    .trim()

export function DictationStepWithVi({
  lessonId,
  audioUrl,
  subtitleEn,
  subtitleVi,
  onComplete,
}: DictationStepWithViProps) {
  const router = useRouter()
  const wordsEn = subtitleEn.trim().split(/\s+/)
  const sentencesEn = subtitleEn.split(/(?<=[.!?])\s+/).filter(Boolean)
  const sentencesVi = subtitleVi.trim().split(/(?<=[.!?])\s+/).filter(Boolean)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [inputText, setInputText] = useState('')
  const [resultText, setResultText] = useState<{ index: number; text: string; isCorrect: boolean }[]>([])
  const [hasStarted, setHasStarted] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false)
  const [isSavingResult, setIsSavingResult] = useState(false)
  const [isResultSaved, setIsResultSaved] = useState(false)
  const [completedSentences, setCompletedSentences] = useState<number[]>([])
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false)
  const [duration, setDuration] = useState(0)
  const { startSession, getSessionPayload } = useStudySession()

  useEffect(() => {
    if (!hasStarted || isCompleted) return
    const timer = window.setInterval(() => {
      setDuration((prev) => prev + 1)
    }, 1000)
    return () => window.clearInterval(timer)
  }, [hasStarted, isCompleted])

  const persistListeningResult = async (
    finalResult: { index: number; text: string; isCorrect: boolean }[]
  ): Promise<boolean> => {
    if (isSavingResult || isResultSaved) return true
    setIsSavingResult(true)
    try {
      const studySession = getSessionPayload()
      await doListeningQuiz(lessonId, duration, finalResult, studySession)
      await notifyStreakIncrease()
      setIsResultSaved(true)
      toast.success('Đã lưu kết quả bài nghe')
      return true
    } catch {
      toast.error('Không thể lưu kết quả. Vui lòng thử lại.')
      return false
    } finally {
      setIsSavingResult(false)
    }
  }

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
    // Audio shortcuts should work while typing
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      window.dispatchEvent(new CustomEvent('audio:seek', { detail: { delta: -5 } }))
      return
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      window.dispatchEvent(new CustomEvent('audio:seek', { detail: { delta: 5 } }))
      return
    }
    if (e.key === 'Control') {
      e.preventDefault()
      window.dispatchEvent(new Event('audio:toggle'))
      return
    }

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      const rawTarget = wordsEn[currentIndex] || ''
      const isCorrect = normalizeWord(inputText) === normalizeWord(rawTarget)

      const newItem = { index: currentIndex, text: inputText, isCorrect }
      const newResult = [...resultText, newItem]
      setResultText(newResult)
      setInputText('')
      const nextIndex = currentIndex + 1

      const sentenceIdx = getSentenceIndexForWordIndex(currentIndex)
      const wordsInThisSentence = sentencesEn[sentenceIdx]?.trim().split(/\s+/)?.length ?? 0
      const wordOffsetInSentence = sentenceIdx >= 0
        ? currentIndex - sentencesEn.slice(0, sentenceIdx).reduce((acc, s) => acc + s.trim().split(/\s+/).length, 0)
        : 0
      const isLastWordOfSentence = wordOffsetInSentence === wordsInThisSentence - 1

      if (isLastWordOfSentence && sentenceIdx >= 0 && !completedSentences.includes(sentenceIdx)) {
        // Add newest completed sentence to top
        setCompletedSentences(prev => [sentenceIdx, ...prev])
      }

      setCurrentIndex(nextIndex)

      if (nextIndex >= wordsEn.length) {
        setIsCompleted(true)
        const correctCount = newResult.filter(r => r.isCorrect).length
        const total = newResult.length
        setShowCompleteConfirm(true)
        void persistListeningResult(newResult)
        onComplete({
          correct: correctCount,
          total,
          percentage: total > 0 ? Math.round((correctCount / total) * 100) : 0,
        })
      }
    }
  }

  const handleStart = () => {
    setHasStarted(true)
    setDuration(0)
    startSession()
  }

  const correctCount = resultText.filter(r => r.isCorrect).length
  const pct = resultText.length ? Math.round((correctCount / resultText.length) * 100) : 0

  const handleGoToResultPage = async () => {
    if (!isResultSaved) {
      const saved = await persistListeningResult(resultText)
      if (!saved) {
        return
      }
    }
    router.push(`/skills/listening/result/${lessonId}`)
  }

  const handleRetry = () => {
    setCurrentIndex(0)
    setInputText('')
    setResultText([])
    setHasStarted(false)
    setIsCompleted(false)
    setShowCompleteConfirm(false)
    setIsSavingResult(false)
    setIsResultSaved(false)
    setCompletedSentences([])
    setDuration(0)
    startSession()
  }

  return (
    <div className="space-y-6">

      <AudioSection audioUrl={audioUrl} />

      <div className="rounded-2xl border border-gray-200/80 bg-white shadow-sm overflow-hidden">
        <div className="p-6 space-y-5">
          {!hasStarted ? (
            <div className="text-center py-12 px-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center mx-auto mb-5">
                <Sparkles className="w-10 h-10 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Sẵn sàng chép chính tả</h3>
              <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto leading-relaxed">
                Bạn sẽ nghe audio và gõ lại từng từ. Nhấn <kbd className="px-1.5 py-0.5 rounded bg-gray-100 font-mono text-xs">Enter</kbd> hoặc <kbd className="px-1.5 py-0.5 rounded bg-gray-100 font-mono text-xs">Space</kbd> để xác nhận.
                Sau mỗi câu hoàn thành, bản dịch tiếng Việt sẽ hiện ra.
              </p>
              <Button
                onClick={handleStart}
                className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-lg shadow-indigo-200/50 px-8 py-3 text-base font-semibold"
              >
                Bắt đầu chép chính tả
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-gray-700">
                  Gõ từng từ <span className="text-gray-400">(Enter/Space xác nhận)</span>
                </p>
                <Button variant="outline" size="sm" onClick={() => setIsShortcutsOpen(true)}>
                  <Keyboard className="w-4 h-4 mr-2" />
                  Phím tắt
                </Button>
              </div>
              <input
                type="text"
                placeholder="Gõ những gì bạn nghe được..."
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                onPaste={e => e.preventDefault()}
                autoComplete="off"
                spellCheck={false}
                disabled={isCompleted}
                className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-base font-medium"
              />
            </>
          )}

          {hasStarted && resultText.length > 0 && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-x-1.5 gap-y-2 leading-relaxed text-sm min-h-[100px] max-h-72 overflow-y-auto p-4 rounded-xl bg-gradient-to-br from-slate-50 to-indigo-50/30 border border-indigo-100/50">
                {wordsEn.map((_, wordIdx) => {
                  const res = resultText.find(r => r.index === wordIdx)
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
                  <span className="font-bold text-indigo-600 tabular-nums">{correctCount}/{resultText.length}</span>
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
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Thời gian:</span>
                  <span className="font-bold text-indigo-600 tabular-nums">
                    {Math.floor(duration / 60)}:{String(duration % 60).padStart(2, '0')}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog open={isShortcutsOpen} onOpenChange={setIsShortcutsOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Phím tắt</DialogTitle>
            <DialogDescription>Enter / Space: Xác nhận từ. Ctrl: Phát/tạm dừng. ← →: Tua 5 giây.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setIsShortcutsOpen(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCompleteConfirm} onOpenChange={setShowCompleteConfirm}>
        <DialogContent
          className="rounded-2xl"
          onEscapeKeyDown={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
          onOpenAutoFocus={(e) => e.preventDefault()}
          onKeyDown={(e) => {
            // Prevent Space from triggering unintended close/actions while dialog is open
            if (e.key === ' ') {
              e.preventDefault()
              e.stopPropagation()
            }
          }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Bạn đã hoàn thành bài chép chính tả
            </DialogTitle>
            <DialogDescription>
              Bạn muốn sang trang kết quả hay làm lại bài này?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={handleRetry}>
              Làm lại
            </Button>
            <Button onClick={handleGoToResultPage} disabled={isSavingResult}>
              {isSavingResult ? 'Đang lưu...' : 'Sang kết quả'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

