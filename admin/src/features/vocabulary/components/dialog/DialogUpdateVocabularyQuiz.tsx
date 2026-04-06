'use client'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash2, HelpCircle } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-toastify'
import { IDataUpdateQuiz, updateQuiz } from '../../services/api'
import { Quiz } from '@/types'

interface Props {
  quiz: Quiz
  isOpen: boolean
  setIsOpen: (v: boolean) => void
  onSuccess: () => void
}

export function DialogUpdateVocabularyQuiz({ quiz, isOpen, setIsOpen, onSuccess }: Props) {
  const [data, setData] = useState<IDataUpdateQuiz>({
    question: quiz?.question || '',
    type: quiz?.type || 'Multiple Choice',
    options: quiz?.options || [],
    answer: quiz?.answer || '',
    explanation: quiz?.explanation || ''
  })

  const handleUpdate = async () => {
    const nonEmptyOptions = (data.options || []).filter((o) => o.trim() !== '')
    if (!data.question.trim() || !data.answer.trim()) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc')
      return
    }
    if (data.type === 'Multiple Choice' && nonEmptyOptions.length < 2) {
      toast.error('Câu hỏi trắc nghiệm cần ít nhất 2 lựa chọn')
      return
    }
    if (data.type === 'Multiple Choice' && data.answer && !nonEmptyOptions.includes(data.answer)) {
      toast.error('Đáp án phải là một trong các lựa chọn đã thêm')
      return
    }


    await updateQuiz(quiz._id, { ...data, options: nonEmptyOptions })
      .then(() => {
        toast.success('Cập nhật quiz thành công')
        onSuccess()
        setIsOpen(false)
      })
  }

  const addOption = () => {
    const hasTrailingEmpty = (data.options || []).length > 0 && (data.options || [])[data.options!.length - 1].trim() === ''
    if (hasTrailingEmpty) {
      toast.error('Vui lòng điền lựa chọn hiện tại trước khi thêm mới')
      return
    }
    setData({ ...data, options: [...(data.options || []), ''] })
  }

  const removeOption = (index: number) => {
    const newOptions = (data.options || []).filter((_, i) => i !== index)
    const removedOption = (data.options || [])[index]
    setData({
      ...data,
      options: newOptions,
      answer: data.answer === removedOption ? '' : data.answer
    })
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...(data.options || [])]
    const oldOption = newOptions[index]
    newOptions[index] = value
    setData({
      ...data,
      options: newOptions,
      answer: data.answer === oldOption ? value : data.answer
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Cập nhật Quiz
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="question">Câu hỏi *</Label>
            <Textarea id="question" placeholder="Nhập nội dung câu hỏi" value={data.question} onChange={(e) => setData({ ...data, question: e.target.value })} rows={3} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Loại câu hỏi *</Label>
            <Select value={data.type} onValueChange={(value: 'Multiple Choice' | 'Fill in the blank') => setData({
              ...data,
              type: value,
              options: value === 'Fill in the blank' ? [] : (data.options || []),
              answer: value === 'Fill in the blank' ? data.answer : ''
            })}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn loại câu hỏi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Multiple Choice">Multiple Choice</SelectItem>
                <SelectItem value="Fill in the blank">Fill in the blank</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {data.type === 'Multiple Choice' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Lựa chọn</Label>
                <Button type="button" variant="outline" size="sm" onClick={addOption}>
                  <Plus className="h-4 w-4 mr-1" />
                  Thêm lựa chọn
                </Button>
              </div>

              {(data.options || []).map((option, index) => (
                <div key={`${option}-${index}`} className="flex items-center gap-2">
                  <Input placeholder="Nhập lựa chọn" value={option} onChange={(e) => updateOption(index, e.target.value)} />
                  <Button type="button" variant="outline" size="sm" onClick={() => removeOption(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="answer">Đáp án *</Label>
            {data.type === 'Multiple Choice' ? (
              <Select value={data.answer} onValueChange={(value) => setData({ ...data, answer: value })} disabled={(data.options || []).filter((o) => o.trim() !== '').length === 0}>
                <SelectTrigger>
                  <SelectValue placeholder={(data.options || []).filter((o) => o.trim() !== '').length === 0 ? 'Thêm lựa chọn trước' : 'Chọn đáp án đúng'} />
                </SelectTrigger>
                <SelectContent>
                  {(data.options || []).filter((option) => option.trim() !== '').map((option, index) => (
                    <SelectItem key={`${option}-${index}`} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input id="answer" placeholder="Nhập đáp án đúng" value={data.answer} onChange={(e) => setData({ ...data, answer: e.target.value })} />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="explanation">Giải thích</Label>
            <Textarea id="explanation" placeholder="Nhập giải thích" value={data.explanation} onChange={(e) => setData({ ...data, explanation: e.target.value })} rows={3} />
          </div>

          <div className="flex gap-2 pt-4">
            <Button className="flex-1" onClick={handleUpdate}>Cập nhật</Button>
            <DialogClose asChild>
              <Button variant="outline">Hủy</Button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
