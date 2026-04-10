import React, { useMemo } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, AlertTriangle, XCircle, Award, Volume2, MessageSquareText } from 'lucide-react'
import { IIpaScoringResult } from '../../types'

interface QuizQuestion {
  word: string
  phonetic: string
  vietnamese: string
}

interface QuizResult {
  question: QuizQuestion
  result: IIpaScoringResult
  score: number
  audioBlob?: Blob
}

interface ResultIpaQuizProps {
  results: QuizResult[]
  onRetry?: () => void
}

export default function ResultIpaQuiz({ results, onRetry }: ResultIpaQuizProps) {
  const averageScore = useMemo(() => {
    if (!results || results.length === 0) return 0
    const total = results.reduce((sum, r) => sum + (r.score || 0), 0)
    return total / results.length
  }, [results])

  const formatScore = (score: number) => Number(score ?? 0).toFixed(1)

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-700'
    if (score >= 80) return 'text-emerald-600'
    if (score >= 70) return 'text-amber-600'
    if (score >= 60) return 'text-orange-500'
    return 'text-rose-600'
  }

  const getBadge = (score: number) => {
    if (score >= 90) return { label: 'Xuất sắc', color: 'default' as const }
    if (score >= 80) return { label: 'Tốt', color: 'secondary' as const }
    if (score >= 70) return { label: 'Khá', color: 'outline' as const }
    if (score >= 60) return { label: 'Trung bình', color: 'outline' as const }
    return { label: 'Cần cải thiện', color: 'destructive' as const }
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

  return (
    <div className="space-y-6 max-h-[80vh] overflow-auto pr-1">
      <Card className="bg-gradient-to-r from-slate-950 via-slate-800 to-indigo-900 text-white shadow-2xl sticky top-0 z-10 rounded-2xl border-0">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Award className="h-6 w-6 text-amber-300" />
              Kết quả phát âm IPA
            </CardTitle>
            <p className="text-sm text-slate-200/80">Tổng hợp điểm trung bình của bài kiểm tra</p>
          </div>
          <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-xl border border-white/10 shadow-inner">
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-wide text-slate-300">Điểm trung bình</span>
              <span className="text-sm text-slate-200/80">Toàn bộ bài kiểm tra</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl font-extrabold ${getScoreColor(averageScore)}`}>
                {formatScore(averageScore)}
              </span>
              <span className="text-xl text-slate-200/80">/100</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {results.map((item, idx) => {
          const badge = getBadge(item.score)
          const isHigh = item.score >= 80
          const isMedium = item.score >= 60 && item.score < 80
          return (
            <Card
              key={`${item.question.word}-${idx}`}
              className="border border-slate-100 shadow-sm hover:shadow-xl transition rounded-2xl bg-gradient-to-b from-white to-slate-50/60"
            >
              <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
                <div>
                  <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    {item.question.word}
                    <Badge variant={badge.color} className="text-xs">
                      {badge.label}
                    </Badge>
                  </CardTitle>
                  <div className="text-sm text-slate-600 flex items-center gap-2">
                    <span className="font-mono text-base text-slate-800">/{item.question.phonetic}/</span>
                    <span className="text-slate-500">• {item.question.vietnamese}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-slate-500">
                  <Volume2 className="h-4 w-4" />
                  <span className="text-xs uppercase">Âm</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-baseline gap-1">
                  <span className={`text-3xl font-extrabold ${getScoreColor(item.score)}`}>
                    {formatScore(item.score)}
                  </span>
                  <span className="text-slate-500">/100</span>
                </div>
                <div className="flex items-center gap-2">
                  {isHigh ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> :
                    isMedium ? <AlertTriangle className="h-5 w-5 text-amber-500" /> :
                      <XCircle className="h-5 w-5 text-red-500" />
                  }
                  <span className="text-sm text-slate-600">
                    {isHigh ? 'Âm này rất ổn' : isMedium ? 'Âm tạm ổn, cần luyện thêm' : 'Âm cần cải thiện đáng kể'}
                  </span>
                </div>
                {!!item.audioBlob && (
                  <button
                    onClick={() => playRecordedAudio(item.audioBlob)}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-white shadow-sm"
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                    Nghe lại giọng của bạn
                  </button>
                )}
                {item.result.aiFeedback && (
                  <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                    <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-700">
                      <MessageSquareText className="h-3.5 w-3.5 text-indigo-600" />
                      Gợi ý
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600 whitespace-pre-line">
                      {item.result.aiFeedback}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {onRetry && (
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button
            onClick={onRetry}
            className="px-6 py-3 rounded-full bg-gradient-to-r from-slate-900 to-indigo-900 text-white font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition"
          >
            Làm lại bài kiểm tra
          </button>
          <Link
            href="/study/ipa"
            className="px-6 py-3 rounded-full border border-slate-300 bg-white text-slate-700 font-semibold shadow-sm hover:bg-slate-50 hover:-translate-y-0.5 transition"
          >
            Trở về IPA
          </Link>
        </div>
      )}
    </div>
  )
}
