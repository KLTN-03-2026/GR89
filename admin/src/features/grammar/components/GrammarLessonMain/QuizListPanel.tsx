'use client'

import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import type { QuizQuestion } from '../../types'

interface QuizListPanelProps {
  quizzes: QuizQuestion[]
  activeQuizId: string
  onSelectQuiz: (quizId: string) => void
  onAddQuiz: () => void
}

export function QuizListPanel({ quizzes, activeQuizId, onSelectQuiz, onAddQuiz }: QuizListPanelProps) {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Quiz</CardTitle>
        <CardDescription>Danh sách câu hỏi chấm điểm cuối bài.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-2">
        {quizzes.map((item, index) => (
          <button
            key={item._id}
            className={`w-full rounded-xl border p-3 text-left text-sm transition ${item._id === activeQuizId
                ? 'border-sky-500 bg-sky-50/50 shadow-sm ring-1 ring-sky-100'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              }`}
            onClick={() => onSelectQuiz(item._id)}
            type="button"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Quiz {index + 1}</p>
            <p className="mt-1 font-medium text-slate-900">{item.question.slice(0, 40) || 'Câu hỏi mới'}...</p>
          </button>
        ))}

        <Button type="button" className="w-full rounded-xl" variant="secondary" onClick={onAddQuiz}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm quiz
        </Button>
      </CardContent>
    </Card>
  )
}

