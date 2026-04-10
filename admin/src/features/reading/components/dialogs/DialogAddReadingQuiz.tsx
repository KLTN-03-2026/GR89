'use client'
import { Button } from '@/components/ui/button'
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash2, HelpCircle, Save, X, Type, ListChecks, FileQuestion, Sparkles, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-toastify'
import { createReadingQuiz } from '@/features/reading/services/api'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { SheetFooter } from '@/components/ui/sheet'

interface DialogAddProps {
  readingId: string
  onSuccess: () => void
}

export function DialogAddReadingQuiz({ readingId, onSuccess }: DialogAddProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState({
    question: "",
    type: "Multiple Choice" as "Multiple Choice" | "Fill in the blank",
    options: [] as string[],
    answer: "",
    explanation: ""
  })

  const handleCreate = async () => {
    const nonEmptyOptions = data.options.filter((o) => o.trim() !== "")

    if (!data.question.trim() || !data.answer.trim()) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc')
      return
    }

    if (data.type === "Multiple Choice" && nonEmptyOptions.length < 2) {
      toast.error('Câu hỏi trắc nghiệm cần ít nhất 2 lựa chọn')
      return
    }

    if (data.type === "Multiple Choice" && data.answer && !nonEmptyOptions.includes(data.answer)) {
      toast.error('Đáp án phải là một trong các lựa chọn đã thêm')
      return
    }

    setIsLoading(true)
    try {
      await createReadingQuiz(readingId, { ...data, options: nonEmptyOptions })
      toast.success('Tạo quiz thành công')
      onSuccess()
      setOpen(false)
      setData({ question: "", type: "Multiple Choice", options: [], answer: "", explanation: "" })
    } catch (error) {
      toast.error('Đã có lỗi xảy ra')
    } finally {
      setIsLoading(false)
    }
  }

  const addOption = () => {
    const hasTrailingEmpty = data.options.length > 0 && data.options[data.options.length - 1].trim() === ""
    if (hasTrailingEmpty) {
      toast.error('Vui lòng điền lựa chọn hiện tại trước khi thêm mới')
      return
    }
    setData({ ...data, options: [...data.options, ""] })
  }

  const removeOption = (index: number) => {
    const newOptions = data.options.filter((_, i) => i !== index)
    const removedOption = data.options[index]
    setData({
      ...data,
      options: newOptions,
      answer: data.answer === removedOption ? "" : data.answer
    })
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...data.options]
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
        <Button className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200 gap-2 h-9 px-4 rounded-xl font-bold transition-all active:scale-95">
          <Plus className="h-4 w-4" />
          Thêm Quiz mới
        </Button>
      </SheetTrigger>

      <SheetContent className="h-full sm:max-w-xl flex flex-col p-0 border-l shadow-2xl overflow-hidden">
        <SheetHeader className="p-8 pb-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 shadow-inner">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <SheetTitle className="text-2xl font-black text-gray-900 tracking-tight">Thêm Câu Hỏi</SheetTitle>
              <SheetDescription className="text-gray-500 font-medium mt-1">
                Tạo câu hỏi trắc nghiệm hoặc điền vào chỗ trống.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <Separator className="bg-gray-100" />

        <ScrollArea className="flex-1 min-h-0">
          <div className="p-8 space-y-10">
            {/* Nội dung câu hỏi */}
            <section className="space-y-6">
              <div className="flex items-center gap-2.5 text-emerald-600 font-black uppercase text-[11px] tracking-[0.2em]">
                <FileQuestion className="w-4 h-4" />
                Nội Dung Câu Hỏi
              </div>

              <div className="grid gap-6 bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                <div className="space-y-2.5">
                  <Label className="text-xs font-black text-gray-500 uppercase ml-1 flex items-center gap-1.5">
                    Câu hỏi <span className="text-rose-500 text-lg">*</span>
                  </Label>
                  <Textarea
                    placeholder="VD: What is the main idea of the paragraph?..."
                    value={data.question}
                    onChange={(e) => setData({ ...data, question: e.target.value })}
                    className="bg-white border-gray-200 rounded-2xl focus:ring-emerald-500 font-bold px-4 py-3 min-h-[100px] resize-none shadow-sm"
                  />
                </div>

                <div className="space-y-2.5">
                  <Label className="text-xs font-black text-gray-500 uppercase ml-1 flex items-center gap-1.5">
                    Loại câu hỏi <span className="text-rose-500 text-lg">*</span>
                  </Label>
                  <Select value={data.type} onValueChange={(value: "Multiple Choice" | "Fill in the blank") => setData({
                    ...data,
                    type: value,
                    options: value === "Fill in the blank" ? [] : data.options,
                    answer: value === "Fill in the blank" ? data.answer : ""
                  })}>
                    <SelectTrigger className="h-12 bg-white border-gray-200 rounded-2xl focus:ring-emerald-500 font-bold px-4 shadow-sm">
                      <SelectValue placeholder="Chọn loại câu hỏi" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-gray-100 shadow-xl">
                      <SelectItem value="Multiple Choice" className="rounded-xl font-bold">Trắc nghiệm (Multiple Choice)</SelectItem>
                      <SelectItem value="Fill in the blank" className="rounded-xl font-bold">Điền vào chỗ trống (Fill in the blank)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            {/* Lựa chọn (nếu là trắc nghiệm) */}
            {data.type === "Multiple Choice" && (
              <section className="space-y-6">
                <div className="flex items-center gap-2.5 text-blue-600 font-black uppercase text-[11px] tracking-[0.2em]">
                  <ListChecks className="w-4 h-4" />
                  Lựa Chọn Đáp Án
                </div>

                <div className="space-y-4 bg-blue-50/30 p-6 rounded-[2.5rem] border border-blue-100/50">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-black text-blue-600/60 uppercase tracking-widest ml-2">Danh sách lựa chọn</p>
                    <Button type="button" variant="outline" size="sm" onClick={addOption} className="h-8 px-4 rounded-full border-blue-200 bg-white hover:bg-blue-50 text-blue-600 font-black text-[10px] uppercase shadow-sm transition-all active:scale-95">
                      <Plus className="h-3 w-3 mr-1" />
                      Thêm lựa chọn
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {data.options.map((option, index) => (
                      <div key={index} className="flex items-center gap-3 group animate-in slide-in-from-left-2 duration-200" style={{ animationDelay: `${index * 50}ms` }}>
                        <div className="flex-none flex items-center justify-center w-8 h-8 rounded-xl bg-blue-600 text-white text-xs font-black shadow-lg shadow-blue-100">
                          {String.fromCharCode(65 + index)}
                        </div>
                        <Input
                          placeholder={`Lựa chọn ${index + 1}`}
                          value={option}
                          onChange={(e) => updateOption(index, e.target.value)}
                          className="h-11 bg-white border-gray-200 rounded-xl focus:ring-blue-500 font-bold px-4 shadow-sm"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeOption(index)}
                          className="h-10 w-10 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all shrink-0"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </Button>
                      </div>
                    ))}
                    {data.options.length === 0 && (
                      <div className="py-10 text-center border-2 border-dashed border-blue-200 rounded-[2rem] bg-white/50">
                        <Sparkles className="h-8 w-8 text-blue-200 mx-auto mb-2" />
                        <p className="text-xs font-bold text-blue-400 uppercase tracking-wider text-center">Chưa có lựa chọn nào</p>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* Đáp án đúng */}
            <section className="space-y-6">
              <div className="flex items-center gap-2.5 text-amber-600 font-black uppercase text-[11px] tracking-[0.2em]">
                <CheckCircle2 className="w-4 h-4" />
                Đáp Án Chính Xác
              </div>

              <div className="bg-amber-50/30 p-6 rounded-[2rem] border border-amber-100/50 space-y-4">
                <div className="space-y-2.5">
                  <Label className="text-xs font-black text-gray-500 uppercase ml-1 flex items-center gap-1.5">
                    Đáp án đúng <span className="text-rose-500 text-lg">*</span>
                  </Label>
                  {data.type === "Multiple Choice" ? (
                    <Select value={data.answer} onValueChange={(value) => setData({ ...data, answer: value })} disabled={data.options.filter((o) => o.trim() !== "").length === 0}>
                      <SelectTrigger className="h-12 bg-white border-gray-200 rounded-2xl focus:ring-amber-500 font-bold px-4 shadow-sm">
                        <SelectValue placeholder={data.options.filter((o) => o.trim() !== "").length === 0 ? "Vui lòng thêm lựa chọn trước" : "Bấm để chọn đáp án đúng..."} />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-gray-100 shadow-xl">
                        {data.options.filter((option) => option.trim() !== "").map((option, index) => (
                          <SelectItem key={`${option}-${index}`} value={option} className="rounded-xl font-bold">
                            <span className="text-amber-600 mr-2">{String.fromCharCode(65 + index)}.</span>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input placeholder="Nhập đáp án chính xác..." value={data.answer} onChange={(e) => setData({ ...data, answer: e.target.value })} className="h-12 bg-white border-gray-200 rounded-2xl focus:ring-amber-500 font-bold px-4 shadow-sm" />
                  )}
                </div>

                <div className="space-y-2.5">
                  <Label className="text-xs font-black text-gray-500 uppercase ml-1 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5" /> Giải thích đáp án
                  </Label>
                  <Textarea
                    placeholder="Giải thích tại sao đáp án này đúng để giúp học viên hiểu bài tốt hơn..."
                    value={data.explanation}
                    onChange={(e) => setData({ ...data, explanation: e.target.value })}
                    className="bg-white border-gray-200 rounded-2xl focus:ring-amber-500 font-medium px-4 py-3 min-h-[100px] resize-none shadow-sm"
                  />
                </div>
              </div>
            </section>
          </div>
        </ScrollArea>

        <Separator className="bg-gray-100" />

        <SheetFooter className="p-8 bg-gray-50/80 backdrop-blur-sm border-t border-gray-100">
          <div className="flex items-center justify-end gap-4 w-full">
            <SheetClose asChild>
              <Button variant="outline" className="h-12 px-8 rounded-2xl border-gray-200 font-bold text-gray-600 hover:bg-white transition-all active:scale-95" disabled={isLoading}>
                Hủy Bỏ
              </Button>
            </SheetClose>
            <Button className="h-12 px-10 rounded-2xl bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-200 font-black transition-all active:scale-95 text-white" onClick={handleCreate} disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Đang Lưu...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Lưu Câu Hỏi
                </>
              )}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}


