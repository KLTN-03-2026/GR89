'use client'

import { Save } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { QuizFormFields } from './QuizFormFields'
import type { QuizErrorState, QuizQuestion } from '../../types'

interface QuizEditorPanelProps {
  activeQuiz: QuizQuestion | null
  activeQuizErrors: QuizErrorState
  quizOptionsInput: string
  onSave: () => void
  onUpdateQuiz: (patch: Partial<QuizQuestion>) => void
  onChangeQuizType: (value: QuizQuestion['type']) => void
  onChangeQuizOptionsInput: (value: string) => void
}

export function QuizEditorPanel({
  activeQuiz,
  activeQuizErrors,
  quizOptionsInput,
  onSave,
  onUpdateQuiz,
  onChangeQuizType,
  onChangeQuizOptionsInput
}: QuizEditorPanelProps) {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <CardTitle>Quiz editor</CardTitle>
          <Button type="button" onClick={onSave} disabled={!activeQuiz}>
            <Save className="mr-2 h-4 w-4" />
            Lưu
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {!activeQuiz ? (
          <div className="rounded-xl border border-dashed bg-slate-50 p-8 text-center text-sm text-muted-foreground">Chưa chọn quiz.</div>
        ) : (
          <QuizFormFields
            activeQuiz={activeQuiz}
            activeQuizErrors={activeQuizErrors}
            quizOptionsInput={quizOptionsInput}
            onUpdateQuiz={onUpdateQuiz}
            onChangeQuizType={onChangeQuizType}
            onChangeQuizOptionsInput={onChangeQuizOptionsInput}
          />
        )}
      </CardContent>
    </Card>
  )
}

