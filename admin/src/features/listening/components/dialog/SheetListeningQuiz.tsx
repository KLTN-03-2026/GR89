'use client'

import { useEffect, useState } from 'react'
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { HelpCircle, ListChecks, Plus, Save, Trash2 } from 'lucide-react'
import { toast } from 'react-toastify'
import type { Listening } from '@/features/listening/types'
import { addListeningQuiz, updateListeningQuizItem, type ListeningQuizItem } from '@/features/listening/services/api'

type Mode = 'add' | 'edit'

interface SheetListeningQuizProps {
  listening: Listening
  listeningId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  mode: Mode
  quizId?: string
  initial?: ListeningQuizItem | null
}

const emptyItem = (): ListeningQuizItem => ({
  question: '',
  options: ['', ''],
  answer: '',
})

export function SheetListeningQuiz({
  listening,
  listeningId,
  open,
  onOpenChange,
  onSuccess,
  mode,
  quizId,
  initial,
}: SheetListeningQuizProps) {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<ListeningQuizItem>(emptyItem())

  useEffect(() => {
    if (!open) return
    if (mode === 'edit' && initial) {
      setData({
        question: initial.question || '',
        options: initial.options?.length ? [...initial.options] : ['', ''],
        answer: initial.answer || '',
      })
    } else {
      setData(emptyItem())
    }
  }, [open, mode, initial])

  const nonEmptyOptions = (data.options || []).map((o) => o.trim()).filter(Boolean)

  const persist = async (item: ListeningQuizItem) => {
    setLoading(true)
    try {
      if (mode === 'edit') {
        if (!quizId) throw new Error('Missing quizId')
        await updateListeningQuizItem(listeningId, quizId, item)
      } else {
        await addListeningQuiz(listeningId, item)
      }
      toast.success(mode === 'add' ? 'Đã thêm câu hỏi' : 'Đã cập nhật câu hỏi')
      onSuccess()
      onOpenChange(false)
    } catch {
      toast.error('Không thể lưu quiz. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    const q = data.question.trim()
    const opts = nonEmptyOptions
    const ans = data.answer.trim()

    if (!q) {
      toast.error('Vui lòng nhập câu hỏi')
      return
    }
    if (opts.length < 2) {
      toast.error('Cần ít nhất 2 lựa chọn')
      return
    }
    if (!ans) {
      toast.error('Vui lòng chọn đáp án đúng')
      return
    }
    if (!opts.includes(ans)) {
      toast.error('Đáp án phải trùng một trong các lựa chọn')
      return
    }

    const item: ListeningQuizItem = { question: q, options: opts, answer: ans }
    await persist(item)
  }

  const addOption = () => {
    const opts = data.options || []
    if (opts.length > 0 && opts[opts.length - 1]?.trim() === '') {
      toast.error('Điền lựa chọn hiện tại trước khi thêm mới')
      return
    }
    setData({ ...data, options: [...opts, ''] })
  }

  const removeOption = (index: number) => {
    const removed = (data.options || [])[index]
    const newOptions = (data.options || []).filter((_, i) => i !== index)
    setData({
      ...data,
      options: newOptions.length ? newOptions : ['', ''],
      answer: data.answer === removed ? '' : data.answer,
    })
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...(data.options || [])]
    const old = newOptions[index]
    newOptions[index] = value
    setData({
      ...data,
      options: newOptions,
      answer: data.answer === old ? value : data.answer,
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="h-full sm:max-w-xl flex flex-col p-0 overflow-hidden">
        <SheetHeader className="p-6 pb-2">
          <SheetTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 bg-primary/10 rounded-lg">
              <HelpCircle className="h-5 w-5 text-primary" />
            </div>
            {mode === 'add' ? 'Thêm câu quiz (lượt 1)' : 'Sửa câu quiz'}
          </SheetTitle>
          <SheetDescription>
            Câu hỏi trắc nghiệm nghe hiểu ý chính — hiển thị trên app trước bước chép chính tả.
          </SheetDescription>
        </SheetHeader>

        <Separator />

        <ScrollArea className="flex-1 min-h-0 px-6 py-4">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Câu hỏi *</Label>
              <Textarea
                placeholder="Nhập nội dung câu hỏi..."
                value={data.question}
                onChange={(e) => setData({ ...data, question: e.target.value })}
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="space-y-4 p-4 bg-muted/30 rounded-xl border border-dashed">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <ListChecks className="h-4 w-4" />
                  Lựa chọn (ít nhất 2)
                </Label>
                <Button type="button" variant="outline" size="sm" onClick={addOption} className="h-8">
                  <Plus className="h-3 w-3 mr-1" />
                  Thêm lựa chọn
                </Button>
              </div>

              <div className="space-y-3">
                {(data.options || []).map((option, index) => (
                  <div key={index} className="flex items-center gap-2 group">
                    <div className="flex-none w-6 h-6 rounded-full bg-primary/10 text-[10px] font-bold text-primary flex items-center justify-center">
                      {String.fromCharCode(65 + index)}
                    </div>
                    <Input
                      placeholder={`Lựa chọn ${index + 1}`}
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      className="h-9"
                    />
                    {(data.options || []).length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeOption(index)}
                        className="h-9 w-9 text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Đáp án đúng *</Label>
              <Select
                value={data.answer && nonEmptyOptions.includes(data.answer.trim()) ? data.answer : ''}
                onValueChange={(v) => setData({ ...data, answer: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn đáp án trong danh sách lựa chọn" />
                </SelectTrigger>
                <SelectContent>
                  {nonEmptyOptions.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </ScrollArea>

        <SheetFooter className="p-6 border-t gap-2">
          <SheetClose asChild>
            <Button variant="outline" disabled={loading}>
              Hủy
            </Button>
          </SheetClose>
          <Button onClick={() => void handleSave()} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
