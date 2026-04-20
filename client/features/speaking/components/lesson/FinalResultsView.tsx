'use client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { RotateCcw, Sparkles, Volume2 } from 'lucide-react'
import type { SentenceEvaluation } from './types'
import { getWordColorForFinal } from './utils'
import { useRouter } from 'next/navigation'

interface FinalResultsViewProps {
  results: SentenceEvaluation[]
  onRetry?: () => void
  speakingId?: string
}

export function FinalResultsView({
  results,
  onRetry,
  speakingId
}: FinalResultsViewProps) {
  const router = useRouter()

  const handleFinish = () => {
    router.push('/skills/speaking')
  }

  const playRecordedAudio = (audioBlob?: Blob) => {
    if (!audioBlob) return
    const url = URL.createObjectURL(audioBlob)
    const audio = new Audio(url)
    audio.onended = () => URL.revokeObjectURL(url)
    audio.onerror = () => URL.revokeObjectURL(url)
    audio.play().catch(() => {
      URL.revokeObjectURL(url)
    })
  }

  const handleRetry = () => {
    if (!onRetry) {
      router.replace(`/skills/speaking/lesson/${speakingId}`)
    } else {
      onRetry()
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <Card className="shadow-xl rounded-2xl border-slate-200">
        <CardContent className="pt-8 pb-8">
          <div className="space-y-8">
            {results.length > 0 && (
              <div className="space-y-6">
                {results.map((result) => (
                  <div key={result.index} className="space-y-4 p-4 bg-gradient-to-b from-white to-slate-50/70 rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-medium text-gray-600">Câu {result.index + 1}</div>
                      <div className={`text-lg font-bold px-3 py-1 rounded-full border ${getWordColorForFinal(result.score)}`}>
                        {result.score}/100
                      </div>
                    </div>

                    {result.sentence && (
                      <div className="text-sm text-gray-700 mb-3 italic">&ldquo;{result.sentence}&rdquo;</div>
                    )}

                    {!!result.audioBlob && (
                      <div className="mb-2">
                        <Button
                          onClick={() => playRecordedAudio(result.audioBlob)}
                          variant="outline"
                          size="sm"
                          className="gap-2 rounded-xl border-slate-300 hover:bg-white"
                        >
                          <Volume2 className="h-4 w-4" />
                          Nghe lại giọng của bạn
                        </Button>
                      </div>
                    )}

                    {result.words && result.words.length > 0 ? (
                      <div>
                        <div className="text-sm font-medium text-gray-800 mb-3 text-center">Điểm từng từ:</div>
                        <div className="flex flex-wrap items-center justify-center gap-3">
                          {result.words.map((word, idx) => (
                            <div
                              key={`${result.index}-${idx}`}
                              className={`px-3 py-2 rounded-lg border ${getWordColorForFinal(word.score)} transition-all text-center min-w-[90px] shadow-[0_6px_20px_-10px_rgba(0,0,0,0.35)]`}
                            >
                              <div className="text-sm font-semibold mb-1">{word.word}</div>
                              <div className="text-base font-bold">{word.score}/100</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 text-center">Không có dữ liệu từng từ</div>
                    )}

                    {!!result.aiFeedback && (
                      <div className="mt-4 rounded-xl border border-indigo-100 bg-gradient-to-b from-indigo-50 to-white p-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                          <Sparkles className="h-4 w-4 text-indigo-600" />
                          Gợi ý luyện tập
                        </div>
                        <div className="mt-2 text-sm text-slate-700 whitespace-pre-line">
                          {result.aiFeedback}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-center gap-4 pt-6 border-t border-gray-300">
              <Button onClick={() => handleRetry()} variant="outline" size="lg" className="flex items-center gap-2 px-6 rounded-xl">
                <RotateCcw className="w-5 h-5" />
                Làm lại
              </Button>
              <Button
                onClick={handleFinish}
                variant="default"
                size="lg"
                className="flex items-center gap-2 px-6 rounded-xl bg-gradient-to-r from-slate-900 to-indigo-900 hover:opacity-95"
              >
                Trở lại
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

