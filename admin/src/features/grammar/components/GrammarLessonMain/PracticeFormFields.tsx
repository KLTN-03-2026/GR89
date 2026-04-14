'use client'

import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'

import type { PracticeErrorState, PracticeQuestion } from '../../types'
import { getPracticeTypeLabel } from './utils'

interface PracticeFormFieldsProps {
  activePractice: PracticeQuestion
  activePracticeErrors: PracticeErrorState
  practiceOptionsInput: string
  onUpdatePractice: (patch: Partial<PracticeQuestion>) => void
  onChangePracticeType: (nextType: PracticeQuestion['type']) => void
  onChangePracticeOptionsInput: (value: string) => void
}

export function PracticeFormFields({
  activePractice,
  activePracticeErrors,
  practiceOptionsInput,
  onUpdatePractice,
  onChangePracticeType,
  onChangePracticeOptionsInput
}: PracticeFormFieldsProps) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-[1fr_240px]">
        <div className="space-y-2 rounded-xl border p-4">
          <Label>Câu hỏi</Label>
          <Textarea
            value={activePractice.question}
            onChange={(e) => onUpdatePractice({ question: e.target.value })}
            rows={3}
            placeholder="Nhập câu hỏi luyện tập"
          />
          {activePracticeErrors.question ? <p className="text-xs text-rose-600">{activePracticeErrors.question}</p> : null}
        </div>

        <div className="rounded-xl border bg-slate-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Tóm tắt câu luyện tập</p>
          <div className="mt-3 space-y-2 text-sm text-slate-600">
            <p>
              Loại: <span className="font-medium text-slate-900">{getPracticeTypeLabel(activePractice.type)}</span>
            </p>
            <p>
              Đáp án: <span className="font-medium text-slate-900">{activePractice.answer || 'Chưa có'}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2 rounded-xl border p-4">
        <Label>Loại bài</Label>
        <Select value={activePractice.type} onValueChange={onChangePracticeType}>
          <SelectTrigger>
            <SelectValue placeholder="Chọn loại bài" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Fill in the blank">Điền vào chỗ trống</SelectItem>
            <SelectItem value="Multiple Choice">Trắc nghiệm</SelectItem>
            <SelectItem value="Correct Sentence">Sửa câu</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {activePractice.type === 'Multiple Choice' && (
        <div className="space-y-2 rounded-xl border p-4">
          <Label>Lựa chọn (mỗi dòng 1 option)</Label>
          <Textarea
            value={practiceOptionsInput}
            onChange={(e) => onChangePracticeOptionsInput(e.target.value)}
            rows={4}
            placeholder={'Mỗi dòng là một lựa chọn\nVí dụ:\ngo\ngoes\nwent'}
          />
          {activePracticeErrors.options ? <p className="text-xs text-rose-600">{activePracticeErrors.options}</p> : null}
        </div>
      )}

      {activePractice.type === 'Correct Sentence' && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Câu hỏi sẽ được dùng làm câu sai gốc. Giao diện người học sẽ tự hiển thị: `&quot;`Hãy sửa câu sau:`&quot;`.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 rounded-xl border p-4">
          <Label>Đáp án</Label>
          <Input value={activePractice.answer} onChange={(e) => onUpdatePractice({ answer: e.target.value })} placeholder="Nhập đáp án đúng" />
        </div>

        <div className="space-y-2 rounded-xl border p-4">
          <Label>Gợi ý</Label>
          <Input value={activePractice.hint || ''} onChange={(e) => onUpdatePractice({ hint: e.target.value })} placeholder="Nhập gợi ý nếu có" />
        </div>
      </div>
    </>
  )
}

