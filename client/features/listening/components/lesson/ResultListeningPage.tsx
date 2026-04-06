'use client'
import { formatDate, getTime } from "@/libs/utils"
import { IListeningProgress } from "@/types/listening"
import Link from "next/link"
import { useState } from "react"
import { ContentStateDisplay, ContentStateType } from "@/components/common/ContentStateDisplay"

interface ResultListeningPageProps {
  result: IListeningProgress
  error?: { type: ContentStateType, message?: string } | null
}

export function ResultListeningPage({ result, error }: ResultListeningPageProps) {
  const [showAllMistakes, setShowAllMistakes] = useState(false)

  if (error) {
    return (
      <ContentStateDisplay
        type={error.type}
        message={error.message}
        onUpgradeSuccess={() => {
          window.location.reload()
        }}
        backUrl="/skills/listening"
        showBackButton={true}
        variant="fullscreen"
      />
    )
  }

  if (!result) {
    return (
      <ContentStateDisplay
        type="empty"
        message="Không tìm thấy kết quả"
        backUrl="/skills/listening"
        showBackButton={true}
        variant="fullscreen"
      />
    )
  }

  const subtitles = result.listeningId.subtitle.split(' ')
  const wrongs = result.result.filter(r => !r.isCorrect)
  const displayedWrongs = showAllMistakes ? wrongs : wrongs.slice(0, 8)
  const hasMore = wrongs.length > 8
  const wpm = subtitles.length / result.time * 60

  return (
    <div className="mx-auto max-w-6xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kết quả cao nhất</h1>
          <p className="text-sm text-gray-500 mt-1">Chủ đề: {result.listeningId.title}</p>
        </div>
        <Link href="/skills/listening" className="text-indigo-600 hover:underline">← Quay lại danh sách</Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Điểm', value: `${result.point}/${result.result.length}` },
          { label: 'Chính xác', value: `${result.progress}%` },
          { label: 'Thời gian', value: getTime(result.time) },
        ].map((s) => (
          <div key={s.label} className="rounded-xl bg-white/90 dark:bg-gray-900/40 p-5 shadow-sm">
            <div className="text-gray-500 text-sm">{s.label}</div>
            <div className="text-2xl font-semibold mt-1">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: mistakes preview + meta */}
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-xl bg-white/90 dark:bg-gray-900/40 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Các từ sai</h2>
              <span className="text-sm text-gray-500">Tổng: {wrongs.length}</span>
            </div>
            {wrongs.length === 0 ? (
              <div className="mt-4 text-center py-8">
                <div className="text-6xl mb-4">🎉</div>
                <p className="text-lg font-semibold text-green-600 mb-2">Hoàn hảo!</p>
                <p className="text-sm text-gray-500">Bạn đã gõ đúng tất cả các từ. Thật tuyệt vời!</p>
              </div>
            ) : (
              <>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-2 text-sm">
                  {displayedWrongs.map((w, i) => {
                    const correctWord = subtitles[w.index] || ''
                    return (
                      <div key={i} className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 line-through">{w.text.trim() || '(-)'}</span>
                        <span className="text-gray-400">→</span>
                        <span className="px-2 py-0.5 rounded bg-green-50 text-green-700">{correctWord}</span>
                      </div>
                    )
                  })}
                </div>
                {hasMore && (
                  <div className="mt-5 flex justify-end">
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

          <div className="rounded-xl bg-white/90 dark:bg-gray-900/40 p-5 shadow-sm">
            <h2 className="text-lg font-semibold mb-2">Thông tin phiên luyện</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-500">Ngày đạt</div>
                <div className="font-medium">{formatDate(result.date)}</div>
              </div>
              <div>
                <div className="text-gray-500">Tốc độ gõ (ước tính)</div>
                <div className="font-medium">{Math.round(wpm)} WPM</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Accuracy donut + actions */}
        <div className="rounded-xl bg-white/90 dark:bg-gray-900/40 p-6 shadow-sm flex flex-col items-center justify-center">
          <div className="relative">
            <svg viewBox="0 0 36 36" className="w-44 h-44">
              <path className="text-gray-200" stroke="currentColor" strokeWidth="4" fill="none" d="M18 2a16 16 0 110 32 16 16 0 010-32z" />
              <path className="text-indigo-600" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round"
                strokeDasharray={`${result.progress}, 100`} d="M18 2a16 16 0 110 32 16 16 0 010-32z" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-700">{result.progress}%</div>
                <div className="text-xs text-gray-500">Chính xác</div>
              </div>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Link href={`/skills/listening/${result.listeningId._id}`} className="inline-flex">
              <button className="px-3 py-2 rounded-md bg-indigo-600 text-white text-sm">Làm lại chủ đề</button>
            </Link>
            <Link href="/skills/listening" className="inline-flex">
              <button className="px-3 py-2 rounded-md border text-sm">Quay lại</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

