'use client'

import Link from 'next/link'
import { RotateCcw, ListChecks, Trophy, CheckCircle2 } from 'lucide-react'

export interface ListeningSessionResult {
  quizCorrect: number
  quizTotal: number
  quizPercentage: number
  dictationCorrect: number
  dictationTotal: number
  dictationPercentage: number
}

interface ListeningResultStepProps {
  title: string
  result: ListeningSessionResult
  onRetry: () => void
}

export function ListeningResultStep({ title, result, onRetry }: ListeningResultStepProps) {
  const finalScore = Math.round((result.quizPercentage + result.dictationPercentage) / 2)

  const history = [
    { label: 'Trắc nghiệm', value: `${result.quizCorrect}/${result.quizTotal}`, pct: result.quizPercentage, icon: '📋' },
    { label: 'Chép chính tả', value: `${result.dictationCorrect}/${result.dictationTotal}`, pct: result.dictationPercentage, icon: '✍️' },
  ]

  const getMessage = () => {
    if (finalScore >= 80) return { text: 'Xuất sắc!', sub: 'Bạn đã hoàn thành bài học rất tốt.', color: 'text-emerald-600' }
    if (finalScore >= 50) return { text: 'Khá tốt!', sub: 'Cố gắng luyện tập thêm để cải thiện.', color: 'text-amber-600' }
    return { text: 'Cố gắng thêm!', sub: 'Ôn lại và làm lại để nâng điểm.', color: 'text-red-500' }
  }

  const msg = getMessage()

  return (
    <div className="space-y-6">
      <div className="text-center sm:text-left">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-sm text-gray-500 mt-1">Tổng kết kết quả bài học</p>
      </div>

      <div className="rounded-2xl border border-gray-200/80 bg-white shadow-sm overflow-hidden">
        <div className="p-8">
          {/* Score hero */}
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <div className="relative shrink-0">
              <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center">
                <div className="relative w-24 h-24">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="2.5" />
                    <circle
                      cx="18" cy="18" r="15.9"
                      fill="none"
                      stroke={finalScore >= 80 ? '#10b981' : finalScore >= 50 ? '#f59e0b' : '#ef4444'}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeDasharray={`${finalScore} ${100 - finalScore}`}
                      className="transition-all duration-700"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-2xl font-bold ${msg.color}`}>{finalScore}%</span>
                  </div>
                </div>
              </div>
              {finalScore >= 80 && (
                <div className="absolute -top-1 -right-1 w-9 h-9 rounded-xl bg-amber-400 flex items-center justify-center shadow-md">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h2 className={`text-2xl font-bold ${msg.color}`}>{msg.text}</h2>
              <p className="text-gray-500 mt-1">{msg.sub}</p>
              <p className="text-sm text-gray-400 mt-2">
                (Trắc nghiệm {result.quizPercentage}% + Chép chính tả {result.dictationPercentage}%) ÷ 2
              </p>
            </div>
          </div>

          {/* Lịch sử kết quả */}
          <div className="mt-8 pt-8 border-t border-gray-100">
            <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-500" />
              Chi tiết từng phần
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {history.map((h, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{h.icon}</span>
                    <div>
                      <span className="text-sm font-semibold text-gray-700 block">{h.label}</span>
                      <span className="text-xs text-gray-500 tabular-nums">{h.value}</span>
                    </div>
                  </div>
                  <span className={`text-xl font-bold tabular-nums ${
                    h.pct >= 80 ? 'text-emerald-600' : h.pct >= 50 ? 'text-amber-600' : 'text-red-500'
                  }`}>
                    {h.pct}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              Làm lại
            </button>
            <Link
              href="/skills/listening"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl hover:from-indigo-700 hover:to-violet-700 shadow-lg shadow-indigo-200/50 transition-all"
            >
              <ListChecks className="w-4 h-4" />
              Về danh sách
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

