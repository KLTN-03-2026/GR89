'use client'

import { BookOpen, ClipboardCheck, HelpCircle } from 'lucide-react'

import { Badge } from '@/components/ui/badge'

interface GrammarLessonHeaderProps {
  topicId?: string
  title: string
  description: string
  sectionsCount: number
  practiceCount: number
  quizCount: number
}

export function GrammarLessonHeader({
  topicId,
  title,
  description,
  sectionsCount,
  practiceCount,
  quizCount
}: GrammarLessonHeaderProps) {
  return (
    <section className="rounded-2xl border bg-white shadow-sm">
      <div className="space-y-5 p-5 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-medium">
                Đang chỉnh sửa bài học
              </Badge>
              {topicId ? (
                <Badge variant="outline" className="max-w-full rounded-full px-3 py-1 text-xs text-slate-600">
                  ID: {topicId}
                </Badge>
              ) : null}
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">{title || 'Chưa có tiêu đề'}</h1>
              <p className="max-w-3xl text-sm leading-7 text-slate-600">{description || 'Chưa có mô tả cho bài học này.'}</p>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap gap-3">
            <div className="min-w-[140px] rounded-xl border bg-emerald-50/60 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-white p-2 text-emerald-600 shadow-sm">
                  <BookOpen className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Lý thuyết</p>
                  <p className="text-xl font-semibold text-slate-900">{sectionsCount}</p>
                </div>
              </div>
            </div>

            <div className="min-w-[140px] rounded-xl border bg-sky-50/60 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-white p-2 text-sky-600 shadow-sm">
                  <ClipboardCheck className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Luyện tập</p>
                  <p className="text-xl font-semibold text-slate-900">{practiceCount}</p>
                </div>
              </div>
            </div>

            <div className="min-w-[140px] rounded-xl border bg-amber-50/60 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-white p-2 text-amber-600 shadow-sm">
                  <HelpCircle className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Quiz</p>
                  <p className="text-xl font-semibold text-slate-900">{quizCount}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

