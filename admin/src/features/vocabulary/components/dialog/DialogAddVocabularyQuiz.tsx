'use client'
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash2, HelpCircle, Save, X, Type, ListChecks, FileQuestion } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-toastify'
import { createVocabularyQuiz, IDataCreateVocabularyQuiz } from '../../services/api'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'

interface DialogAddProps {
  topicId: string
  onSuccess: () => void
}

export function DialogAddVocabularyQuiz({ topicId, onSuccess }: DialogAddProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState<IDataCreateVocabularyQuiz>({
    question: '',
    type: 'Multiple Choice',
    options: [],
    answer: '',
    explanation: ''
  })

  const handleCreate = async () => {
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

    setIsLoading(true)
    try {
      await createVocabularyQuiz(topicId, { ...data, options: nonEmptyOptions })
      toast.success('Tạo quiz thành công')
      onSuccess()
      setOpen(false)
      setData({ question: '', type: 'Multiple Choice', options: [], answer: '', explanation: '' })
    } catch (error) {
      toast.error('Đã có lỗi xảy ra')
    } finally {
      setIsLoading(false)
    }
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
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="sm" className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Thêm Quiz
        </Button>
      </SheetTrigger>

      <SheetContent className="h-full sm:max-w-xl flex flex-col p-0 overflow-hidden">
        <SheetHeader className="p-6 pb-2">
          <SheetTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 bg-primary/10 rounded-lg">
              <HelpCircle className="h-5 w-5 text-primary" />
            </div>
            Thêm Quiz Từ Vựng
          </SheetTitle>
          <SheetDescription>Tạo câu hỏi ôn tập cho các từ vựng trong chủ đề này</SheetDescription>
        </SheetHeader>

        <Separator />

        <ScrollArea className="flex-1 min-h-0 px-6 py-4">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="question-vocab" className="text-sm font-semibold flex items-center gap-2">
                <FileQuestion className="h-4 w-4 text-muted-foreground" />
                Câu hỏi *
              </Label>
              <Textarea
                id="question-vocab"
                placeholder="Nhập nội dung câu hỏi..."
                value={data.question}
                onChange={(e) => setData({ ...data, question: e.target.value })}
                rows={3}
                className="resize-none focus-visible:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type-vocab" className="text-sm font-semibold flex items-center gap-2">
                <Type className="h-4 w-4 text-muted-foreground" />
                Loại câu hỏi *
              </Label>
              <Select value={data.type} onValueChange={(value: 'Multiple Choice' | 'Fill in the blank') => setData({
                ...data,
                type: value,
                options: value === 'Fill in the blank' ? [] : (data.options || []),
                answer: value === 'Fill in the blank' ? data.answer : ''
              })}>
                <SelectTrigger id="type-vocab" className="w-full">
                  <SelectValue placeholder="Chọn loại câu hỏi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Multiple Choice">Trắc nghiệm (Multiple Choice)</SelectItem>
                  <SelectItem value="Fill in the blank">Điền vào chỗ trống (Fill in the blank)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {data.type === 'Multiple Choice' && (
              <div className="space-y-4 p-4 bg-muted/30 rounded-xl border border-dashed">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <ListChecks className="h-4 w-4 text-muted-foreground" />
                    Lựa chọn đáp án
                  </Label>
                  <Button type="button" variant="outline" size="sm" onClick={addOption} className="h-8 px-3 text-xs">
                    <Plus className="h-3 w-3 mr-1" />
                    Thêm lựa chọn
                  </Button>
                </div>

                <div className="space-y-3">
                  {(data.options || []).map((option, index) => (
                    <div key={index} className="flex items-center gap-2 group">
                      <div className="flex-none flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                        {String.fromCharCode(65 + index)}
                      </div>
                      <Input
                        placeholder={`Lựa chọn ${index + 1}`}
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        className="h-9 focus-visible:ring-primary"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeOption(index)}
                        className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {(data.options || []).length === 0 && (
                    <p className="text-xs text-center text-muted-foreground py-2 italic">Chưa có lựa chọn nào. Nhấn "Thêm lựa chọn" để bắt đầu.</p>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="answer-vocab" className="text-sm font-semibold flex items-center gap-2">
                <Save className="h-4 w-4 text-muted-foreground" />
                Đáp án đúng *
              </Label>
              {data.type === 'Multiple Choice' ? (
                <Select value={data.answer} onValueChange={(value) => setData({ ...data, answer: value })} disabled={(data.options || []).filter((o) => o.trim() !== '').length === 0}>
                  <SelectTrigger id="answer-vocab" className="w-full">
                    <SelectValue placeholder={(data.options || []).filter((o) => o.trim() !== '').length === 0 ? "Vui lòng thêm lựa chọn trước" : "Chọn đáp án đúng"} />
                  </SelectTrigger>
                  <SelectContent>
                    {(data.options || []).filter((option) => option.trim() !== '').map((option, index) => (
                      <SelectItem key={`${option}-${index}`} value={option}>
                        <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input id="answer-vocab" placeholder="Nhập đáp án đúng..." value={data.answer} onChange={(e) => setData({ ...data, answer: e.target.value })} className="focus-visible:ring-primary" />
              )}
            </div>

            <div className="space-y-2 pb-6">
              <Label htmlFor="explanation-vocab" className="text-sm font-semibold flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
                Giải thích đáp án
              </Label>
              <Textarea
                id="explanation-vocab"
                placeholder="Giải thích tại sao đáp án này đúng..."
                value={data.explanation}
                onChange={(e) => setData({ ...data, explanation: e.target.value })}
                rows={3}
                className="resize-none focus-visible:ring-primary"
              />
            </div>
          </div>
        </ScrollArea>

        <Separator />

        <div className="p-6 bg-muted/10 flex gap-3">
          <Button className="flex-1 shadow-sm" disabled={isLoading} onClick={handleCreate}>
            {isLoading ? "Đang xử lý..." : "Lưu Quiz"}
          </Button>
          <SheetClose asChild>
            <Button variant="outline" className="flex-none shadow-sm">
              <X className="h-4 w-4 mr-2" />
              Hủy
            </Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  )
}