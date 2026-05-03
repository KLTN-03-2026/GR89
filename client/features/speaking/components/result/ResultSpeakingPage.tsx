'use client'

import type { ISpeakingResult } from '@/features/speaking/types'
import { formatDate, getTime } from '@/libs/utils'
import Link from 'next/link'

interface ResultSpeakingPageProps {
  result: ISpeakingResult
}

export function ResultSpeakingPage({ result }: ResultSpeakingPageProps) {
  const title = result.speakingLesson.title || 'Bài nói'
  const tone =
    result.progress >= 80
      ? {
        title: 'Xuất sắc!',
        color: 'text-emerald-600',
        sub: 'Phát âm và nhịp nói của bạn rất tốt.',
      }
      : result.progress >= 50
        ? {
          title: 'Khá tốt!',
          color: 'text-amber-600',
          sub: 'Tiếp tục luyện từng câu để nâng điểm trung bình.',
        }
        : {
          title: 'Cố gắng thêm!',
          color: 'text-rose-600',
          sub: 'Nghe mẫu, luyện lại các câu điểm thấp bên dưới.',
        }

  const sentenceCount = result.sentences?.length ?? 0
  const totalAttempts = result.sentences?.reduce((s, x) => s + (x.attempts || 0), 0) ?? 0

  return (
    <div className="mx-auto max-w-6xl p-6 space-y-6">
      <div className="rounded-2xl overflow-hidden border border-orange-100 shadow-sm">
        <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 px-6 py-6 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Thành tích bài nói</h1>
              <p className="text-orange-50 mt-1">Chủ đề: {title}</p>
            </div>
            <Link
              href="/skills/speaking"
              className="text-sm bg-white/15 hover:bg-white/25 transition px-3 py-1.5 rounded-lg shrink-0"
            >
              Về danh sách
            </Link>
          </div>
        </div>
        <div className="bg-white p-5 border-t border-orange-100">
          <p className={`text-xl font-bold ${tone.color}`}>{tone.title}</p>
          <p className="text-sm text-gray-600 mt-1">{tone.sub}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Điểm hiển thị', value: `${Math.round(result.progress)}/100` },
          { label: 'Điểm lần lưu gần nhất (bài)', value: `${Math.round(result.bestHistoryProgress || 0)}/100` },
          { label: 'Số câu đã luyện', value: `${sentenceCount}` },
          { label: 'Thời gian (phiên đã lưu)', value: result.time > 0 ? getTime(result.time) : '—' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl bg-white p-5 border border-gray-200 shadow-sm">
            <div className="text-gray-500 text-sm">{s.label}</div>
            <div className="text-2xl font-semibold mt-1">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl bg-white p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Điểm theo từng câu</h2>
            {totalAttempts > 0 ? (
              <span className="text-sm text-gray-500">Tổng lượt luyện: {totalAttempts}</span>
            ) : null}
          </div>
          {sentenceCount === 0 ? (
            <p className="text-sm text-gray-600 rounded-lg border border-orange-100 bg-orange-50/60 p-4">
              Chưa có dữ liệu luyện từng câu. Điểm hiển thị có thể đến từ lần hoàn thành bài (lưu điểm tổng).
            </p>
          ) : (
            <ul className="space-y-2">
              {result.sentences.map((row) => (
                <li
                  key={row.sentenceIndex}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-100 px-3 py-2 text-sm"
                >
                  <span className="font-medium text-gray-700">Câu {row.sentenceIndex + 1}</span>
                  <span className="text-orange-700 font-semibold">{row.bestScore}/100</span>
                  <span className="text-gray-500 text-xs">
                    {row.attempts} lượt
                    {row.lastAt ? ` · ${formatDate(row.lastAt)}` : ''}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl bg-white p-6 border border-gray-200 shadow-sm flex flex-col items-center">
          <div className="relative">
            <svg viewBox="0 0 36 36" className="w-40 h-40">
              <path
                className="text-gray-200"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                d="M18 2a16 16 0 110 32 16 16 0 010-32z"
              />
              <path
                className="text-orange-600"
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
                <div className="text-3xl font-bold text-orange-700">{Math.round(result.progress)}</div>
                <div className="text-xs text-gray-500">/100</div>
              </div>
            </div>
          </div>
          <div className="mt-5 w-full space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Cập nhật</span>
              <span className="font-medium">{result.date ? formatDate(result.date) : '—'}</span>
            </div>
            {result.status ? (
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Trạng thái lưu</span>
                <span className="font-medium capitalize">{result.status}</span>
              </div>
            ) : null}
          </div>
          <div className="mt-5 flex w-full gap-2">
            <Link href={`/skills/speaking/${result.speakingLesson._id}`} className="flex-1">
              <button
                type="button"
                className="w-full px-3 py-2 rounded-lg bg-orange-600 text-white text-sm font-medium"
              >
                Luyện lại
              </button>
            </Link>
            <Link href="/skills/speaking" className="flex-1">
              <button
                type="button"
                className="w-full px-3 py-2 rounded-lg border text-sm font-medium"
              >
                Danh sách
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
