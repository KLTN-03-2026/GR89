'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

import { getQuizTypeLabel } from './utils'
import type { QuizErrorState, QuizQuestion } from '../../types'

interface QuizFormFieldsProps {
  activeQuiz: QuizQuestion
  activeQuizErrors: QuizErrorState
  quizOptionsInput: string
  onUpdateQuiz: (patch: Partial<QuizQuestion>) => void
  onChangeQuizType: (value: QuizQuestion['type']) => void
  onChangeQuizOptionsInput: (value: string) => void
}

export function QuizFormFields({
  activeQuiz,
  activeQuizErrors,
  quizOptionsInput,
  onUpdateQuiz,
  onChangeQuizType,
  onChangeQuizOptionsInput
}: QuizFormFieldsProps) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-[1fr_220px]">
        <div className="space-y-2 rounded-xl border p-4">
          <Label>Câu hỏi</Label>
          <Textarea
            value={activeQuiz.question}
            onChange={(e) => onUpdateQuiz({ question: e.target.value })}
            rows={3}
            placeholder="Nhập câu hỏi quiz"
          />
          {activeQuizErrors.question ? <p className="text-xs text-rose-600">{activeQuizErrors.question}</p> : null}
        </div>

        <div className="rounded-xl border bg-slate-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Tóm tắt quiz</p>
          <div className="mt-3 space-y-2 text-sm text-slate-600">
            <p>
              Loại: <span className="font-medium text-slate-900">{getQuizTypeLabel(activeQuiz.type)}</span>
            </p>
            <p>
              Lựa chọn: <span className="font-medium text-slate-900">{activeQuiz.options.length}</span>
            </p>
            <p>
              Đáp án: <span className="font-medium text-slate-900">{activeQuiz.answer || 'Chưa có'}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2 rounded-xl border p-4">
        <Label>Loại quiz</Label>
        <Select value={activeQuiz.type} onValueChange={onChangeQuizType}>
          <SelectTrigger>
            <SelectValue placeholder="Chọn loại quiz" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Multiple Choice">Trắc nghiệm</SelectItem>
            <SelectItem value="Fill in the blank">Điền vào chỗ trống</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {activeQuiz.type === 'Multiple Choice' && (
        <div className="space-y-2 rounded-xl border p-4">
          <Label>Lựa chọn (mỗi dòng 1 option)</Label>
          <Textarea
            value={quizOptionsInput}
            onChange={(e) => onChangeQuizOptionsInput(e.target.value)}
            rows={5}
            placeholder={'Mỗi dòng là một lựa chọn\nVí dụ:\nEvery day\nRight now\nAt the moment'}
          />
          {activeQuizErrors.options ? <p className="text-xs text-rose-600">{activeQuizErrors.options}</p> : null}
        </div>
      )}

      <div className="space-y-2 rounded-xl border p-4">
        <Label>Đáp án</Label>
        {activeQuiz.type === 'Multiple Choice' ? (
          <Select
            value={activeQuiz.answer}
            onValueChange={(value) => onUpdateQuiz({ answer: value })}
            disabled={activeQuiz.options.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn đáp án từ danh sách lựa chọn" />
            </SelectTrigger>
            <SelectContent>
              {activeQuiz.options.map((option, index) => (
                <SelectItem key={`${option}-${index}`} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input value={activeQuiz.answer} onChange={(e) => onUpdateQuiz({ answer: e.target.value })} placeholder="Nhập đáp án đúng" />
        )}
        {activeQuizErrors.answer ? <p className="text-xs text-rose-600">{activeQuizErrors.answer}</p> : null}
      </div>

      <div className="space-y-2 rounded-xl border p-4">
        <Label>Giải thích</Label>
        <Textarea
          value={activeQuiz.explanation}
          onChange={(e) => onUpdateQuiz({ explanation: e.target.value })}
          rows={4}
          placeholder="Nhập lời giải thích cho đáp án"
        />
        {activeQuizErrors.explanation ? <p className="text-xs text-rose-600">{activeQuizErrors.explanation}</p> : null}
      </div>
    </>
  )
}

