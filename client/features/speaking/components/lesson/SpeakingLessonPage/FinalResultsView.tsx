'use client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { RotateCcw } from 'lucide-react'
import type { SentenceEvaluation, AssessmentResult } from './types'
import { getWordColorForFinal } from './utils'

interface FinalResultsViewProps {
  averageScore: number
  results: SentenceEvaluation[]
  router: { push: (path: string) => void }
  setShowFinalResults: (value: boolean) => void
  setCurrentSubtitleIndex: (index: number | ((prev: number) => number)) => void
  setCompletedSubtitles: React.Dispatch<React.SetStateAction<number[]>>
  setScores: React.Dispatch<React.SetStateAction<number[]>>
  setAssessmentResult: (result: AssessmentResult | null) => void
  setSentenceResults: React.Dispatch<React.SetStateAction<SentenceEvaluation[]>>
  setFinalAverageScore: (value: number) => void
  setFinalResults: React.Dispatch<React.SetStateAction<SentenceEvaluation[]>>
  setReplayTrigger: (value: number | ((prev: number) => number)) => void
  sentenceResultsRef: React.MutableRefObject<SentenceEvaluation[]>
  saveAllResultsToServer: (results: Array<{ index: number; score: number; audioBlob?: File }>) => Promise<void>
}

export function FinalResultsView({
  averageScore,
  results,
  router,
  setShowFinalResults,
  setCurrentSubtitleIndex,
  setCompletedSubtitles,
  setScores,
  setAssessmentResult,
  setSentenceResults,
  setFinalAverageScore,
  setFinalResults,
  setReplayTrigger,
  sentenceResultsRef
}: FinalResultsViewProps) {
  const handleRetry = () => {
    setCurrentSubtitleIndex(0)
    setCompletedSubtitles([])
    setScores([])
    setAssessmentResult(null)
    setSentenceResults([])
    sentenceResultsRef.current = []
    setShowFinalResults(false)
    setFinalAverageScore(0)
    setFinalResults([])
    setReplayTrigger(0)
  }

  const handleFinish = () => {
    router.push('/skills/speaking')
  }
  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <Card className="shadow-lg">
        <CardContent className="pt-8 pb-8">
          <div className="space-y-8">
            {results.length > 0 && (
              <div className="space-y-6">
                {results.map((result) => (
                  <div key={result.index} className="space-y-4 p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-medium text-gray-600">Câu {result.index + 1}</div>
                      <div className={`text-lg font-bold px-3 py-1 rounded-full border ${getWordColorForFinal(result.score)}`}>
                        {result.score}/100
                      </div>
                    </div>

                    {result.sentence && (
                      <div className="text-sm text-gray-700 mb-3 italic">&ldquo;{result.sentence}&rdquo;</div>
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
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-center gap-4 pt-6 border-t border-gray-300">
              <Button onClick={handleRetry} variant="outline" size="lg" className="flex items-center gap-2 px-6">
                <RotateCcw className="w-5 h-5" />
                Làm lại
              </Button>
              <Button
                onClick={handleFinish}
                variant="default"
                size="lg"
                className="flex items-center gap-2 px-6 bg-blue-600 hover:bg-blue-700"
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

