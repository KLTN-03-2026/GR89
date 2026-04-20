'use client'
import { formatDate, getTime } from "@/libs/utils"
import { IListeningProgress } from "@/features/listening/types"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

interface ResultListeningPageProps {
  result: IListeningProgress
  onRetry?: () => void
}

export function ResultListening({ result, onRetry }: ResultListeningPageProps) {
  const router = useRouter()
  const [showAllMistakes, setShowAllMistakes] = useState(false)
  const subtitleText = result.listeningId.subtitle || ''
  const subtitles = subtitleText.trim().length > 0 ? subtitleText.split(/\s+/) : []
  const wrongs = result.result.filter(r => !r.isCorrect)
  const displayedWrongs = showAllMistakes ? wrongs : wrongs.slice(0, 8)
  const hasMore = wrongs.length > 8
  const wpm = result.time > 0 ? (subtitles.length / result.time) * 60 : 0
  const totalAnswers = result.totalQuestions ?? result.result.length

  const tone =
    result.progress >= 80
      ? { title: 'Xuất sắc!', color: 'text-emerald-600', sub: 'Bạn đã nghe và chép rất chính xác.' }
      : result.progress >= 50
        ? { title: 'Khá tốt!', color: 'text-amber-600', sub: 'Bạn đang tiến bộ, hãy luyện thêm để tăng độ chính xác.' }
        : { title: 'Cố gắng thêm!', color: 'text-rose-600', sub: 'Làm lại bài và tập trung vào các từ sai bên dưới.' }

  const handleRetry = () => {
    if (!onRetry) {
      router.replace(`/skills/listening/lesson/${result.listeningId._id}`)
    }
    else {
      onRetry()
    }
  }
  return (
    <div className="mx-auto max-w-6xl p-6 space-y-6">
      <div className="rounded-2xl overflow-hidden border border-indigo-100 shadow-sm">
        <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-6 py-6 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Kết quả bài nghe</h1>
              <p className="text-indigo-100 mt-1">Chủ đề: {result.listeningId.title}</p>
            </div>
            <Link href="/skills/listening" className="text-sm bg-white/15 hover:bg-white/25 transition px-3 py-1.5 rounded-lg">
              Về danh sách
            </Link>
          </div>
        </div>
        <div className="bg-white p-5 border-t border-indigo-100">
          <p className={`text-xl font-bold ${tone.color}`}>{tone.title}</p>
          <p className="text-sm text-gray-600 mt-1">{tone.sub}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Điểm quiz', value: `${result.quizPoint ?? 0}/${result.quizTotal ?? 0}` },
          { label: 'Số từ đúng', value: `${result.point}/${totalAnswers}` },
          { label: 'Độ chính xác', value: `${Math.round(result.progress)}%` },
          { label: 'Thời gian', value: getTime(result.time) }
        ].map((s) => (
          <div key={s.label} className="rounded-xl bg-white flex flex-col justify-evenly p-5 border border-gray-200 shadow-sm">
            <div className="text-gray-500 text-sm">{s.label}</div>
            <div className="text-2xl font-semibold mt-1">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl bg-white p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Các từ cần cải thiện</h2>
            <span className="text-sm text-gray-500">Tổng lỗi: {wrongs.length}</span>
          </div>
          {wrongs.length === 0 ? (
            <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <p className="font-semibold text-emerald-700">Hoàn hảo! Bạn không có từ sai.</p>
            </div>
          ) : (
            <>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                {displayedWrongs.map((w, i) => {
                  const correctWord = subtitles[w.index] || ''
                  return (
                    <div key={i} className="flex items-center gap-2 rounded-lg border border-gray-100 p-2">
                      <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 line-through">{w.text.trim() || '(không điền)'}</span>
                      <span className="text-gray-400">→</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">{correctWord}</span>
                    </div>
                  )
                })}
              </div>
              {hasMore && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => setShowAllMistakes(!showAllMistakes)}
                    className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                  >
                    {showAllMistakes ? 'Thu gọn' : `Xem thêm ${wrongs.length - 8} lỗi`}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <div className="rounded-xl bg-white p-6 border border-gray-200 shadow-sm flex flex-col items-center">
          <div className="relative">
            <svg viewBox="0 0 36 36" className="w-40 h-40">
              <path className="text-gray-200" stroke="currentColor" strokeWidth="4" fill="none" d="M18 2a16 16 0 110 32 16 16 0 010-32z" />
              <path
                className="text-indigo-600"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${Math.max(0, Math.min(100, result.progress))}, 100`}
                d="M18 2a16 16 0 110 32 16 16 0 010-32z"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-700">{Math.round(result.progress)}%</div>
                <div className="text-xs text-gray-500">Độ chính xác</div>
              </div>
            </div>
          </div>
          <div className="mt-5 w-full space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Ngày đạt</span>
              <span className="font-medium">{formatDate(result.date)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Tốc độ gõ</span>
              <span className="font-medium">{Math.round(wpm)} WPM</span>
            </div>
          </div>
          <div className="mt-5 flex w-full gap-2">
            <Button
              className="w-full px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium"
              onClick={handleRetry}
            >
              Làm lại
            </Button>
            <Link href="/skills/listening" className="flex-1">
              <Button className="w-full px-3 py-2 rounded-lg border text-sm font-medium">Danh sách</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
