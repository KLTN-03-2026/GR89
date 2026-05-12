'use client'

import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import type { QuizQuestion } from '../../types'

interface QuizListPanelProps {
  quizzes: QuizQuestion[]
  activeQuizId: string
  onSelectQuiz: (quizId: string) => void
  onMoveQuizUp: (index: number) => void
  onMoveQuizDown: (index: number) => void
  onDeleteQuiz: (index: number) => void
  onAddQuiz: () => void
}

export function QuizListPanel({
  quizzes,
  activeQuizId,
  onSelectQuiz,
  onMoveQuizUp,
  onMoveQuizDown,
  onDeleteQuiz,
  onAddQuiz
}: QuizListPanelProps) {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Quiz</CardTitle>
        <CardDescription>Danh sách câu hỏi chấm điểm cuối bài.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-2">
        {quizzes.map((item, index) => (
          <div
            key={item._id}
            className={`w-full rounded-xl border p-3 text-left text-sm transition ${item._id === activeQuizId
                ? 'border-sky-500 bg-sky-50/50 shadow-sm ring-1 ring-sky-100'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              }`}
          >
            <div className="flex items-center justify-between gap-3">
              <button type="button" className="min-w-0 flex-1 text-left" onClick={() => onSelectQuiz(item._id)}>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Quiz {index + 1}</p>
                <p className="mt-1 truncate text-sm font-medium text-slate-900">{item.question.slice(0, 40) || 'Câu hỏi mới'}...</p>
              </button>

              <div className="flex shrink-0 items-center gap-1">
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 rounded-lg border-slate-200"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onMoveQuizUp(index)
                  }}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>

                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 rounded-lg border-slate-200"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onMoveQuizDown(index)
                  }}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>

                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="h-8 w-8 rounded-lg"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onDeleteQuiz(index)
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        <Button type="button" className="w-full rounded-xl" variant="secondary" onClick={onAddQuiz}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm quiz
        </Button>
      </CardContent>
    </Card>
  )
}
