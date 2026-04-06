'use client'
import { Button } from '@/components/ui/button'
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { updateReading } from '@/features/reading/services/api'
import { FileText, Info, Layers, Image as ImageIcon, CheckCircle2, Save, Edit3, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-toastify'
import { DataReading, Reading } from '@/features/reading/types'
import { DialogImageToMedia } from '@/components/common'
import { Media } from "@/features/Media/types";
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { SheetFooter } from '@/components/ui/sheet'

interface Props {
  reading: Reading
  callback: () => void
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

export function DialogUpdateReading({ reading, callback, isOpen, setIsOpen }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState<DataReading>({
    title: reading.title,
    description: reading.description,
    paragraphEn: reading.paragraphEn,
    paragraphVi: reading.paragraphVi,
    image: reading.image._id,
    level: reading.level || 'A1',
    vocabulary: reading.vocabulary,
    quizzes: reading.quizzes
  })

  const handleUpdateReading = async () => {
    if (!data.title.trim() || !data.description.trim() || !data.paragraphEn.trim() || !data.paragraphVi.trim() || !data.level) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc')
      return
    }

    setIsLoading(true)
    try {
      await updateReading(reading._id, data as any)
      callback()
      toast.success('Cập nhật bài đọc thành công')
      setIsOpen(false)
    } catch (error) {
      toast.error('Đã có lỗi xảy ra')
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="sm:max-w-3xl flex flex-col p-0 border-l shadow-2xl">
        <SheetHeader className="p-8 pb-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-50 rounded-2xl text-amber-600 shadow-inner">
              <Edit3 className="w-6 h-6" />
            </div>
            <div>
              <SheetTitle className="text-2xl font-black text-gray-900 tracking-tight">Cập Nhật Bài Đọc</SheetTitle>
              <SheetDescription className="text-gray-500 font-medium mt-1">
                Chỉnh sửa nội dung bài đọc <span className="font-mono text-primary bg-primary/5 px-1.5 py-0.5 rounded">{reading._id}</span>
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <Separator className="bg-gray-100" />

        <ScrollArea className="flex-1">
          <div className="p-8 space-y-10">
            {/* Thông tin cơ bản */}
            <section className="space-y-6">
              <div className="flex items-center gap-2.5 text-primary font-black uppercase text-[11px] tracking-[0.2em]">
                <Info className="h-4 w-4" />
                Thông Tin Cơ Bản
              </div>
              <div className="grid grid-cols-2 gap-6 bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                <div className="space-y-2.5 col-span-2 md:col-span-1">
                  <Label className="text-xs font-black text-gray-500 uppercase ml-1 flex items-center gap-1.5">
                    Tiêu đề bài đọc <span className="text-rose-500 text-lg">*</span>
                  </Label>
                  <Input
                    placeholder="VD: The benefits of learning English..."
                    value={data.title}
                    onChange={(e) => setData({ ...data, title: e.target.value })}
                    className="h-12 bg-white border-gray-200 rounded-2xl focus:ring-primary font-bold px-4 shadow-sm"
                  />
                </div>

                <div className="space-y-2.5 col-span-2 md:col-span-1">
                  <Label className="text-xs font-black text-gray-500 uppercase ml-1 flex items-center gap-1.5">
                    Trình độ <span className="text-rose-500 text-lg">*</span>
                  </Label>
                  <Select value={data.level} onValueChange={(value) => setData({ ...data, level: value as DataReading['level'] })}>
                    <SelectTrigger className="h-12 bg-white border-gray-200 rounded-2xl focus:ring-primary font-bold px-4 shadow-sm">
                      <SelectValue placeholder="Chọn trình độ" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-gray-100 shadow-xl">
                      {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((lvl) => (
                        <SelectItem key={lvl} value={lvl} className="rounded-xl font-bold">{lvl}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2.5 col-span-2">
                  <Label className="text-xs font-black text-gray-500 uppercase ml-1 flex items-center gap-1.5">
                    Mô tả bài đọc <span className="text-rose-500 text-lg">*</span>
                  </Label>
                  <Textarea
                    placeholder="Nhập mô tả ngắn gọn giúp người dùng biết được nội dung chính của bài đọc..."
                    value={data.description}
                    onChange={(e) => setData({ ...data, description: e.target.value })}
                    className="bg-white border-gray-200 rounded-2xl focus:ring-primary font-medium px-4 py-3 min-h-[80px] resize-none shadow-sm"
                  />
                </div>
              </div>
            </section>

            {/* Media & Ảnh */}
            <section className="space-y-6">
              <div className="flex items-center gap-2.5 text-blue-600 font-black uppercase text-[11px] tracking-[0.2em]">
                <ImageIcon className="h-4 w-4" />
                Hình Ảnh Minh Họa
              </div>
              <div className="p-8 bg-blue-50/30 rounded-[2rem] border border-dashed border-blue-200/50 flex flex-col items-center gap-4 group hover:bg-blue-50 transition-all">
                <DialogImageToMedia onSelect={(img: Media) => setData({ ...data, image: img._id })} />
                {data.image ? (
                  <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-2xl text-xs font-black shadow-lg shadow-emerald-200 animate-in zoom-in-95">
                    <CheckCircle2 className="h-4 w-4" />
                    Đã Chọn Media ID: {data.image}
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1 text-center">
                    <p className="text-xs font-bold text-blue-600/60 uppercase tracking-widest">Khuyến nghị: 1200x800px</p>
                    <p className="text-[10px] text-blue-400 font-medium italic">Ảnh đẹp giúp bài học thu hút hơn</p>
                  </div>
                )}
              </div>
            </section>

            {/* Nội dung đoạn văn */}
            <section className="space-y-6 pb-10">
              <div className="flex items-center gap-2.5 text-amber-600 font-black uppercase text-[11px] tracking-[0.2em]">
                <Layers className="h-4 w-4" />
                Nội Dung Song Ngữ
              </div>
              <div className="grid grid-cols-1 gap-8 bg-amber-50/30 p-8 rounded-[2.5rem] border border-amber-100/50">
                <div className="space-y-3">
                  <Label className="text-xs font-black text-amber-700/70 uppercase ml-1 flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5" />
                    Đoạn văn (Tiếng Anh) <span className="text-rose-500">*</span>
                  </Label>
                  <Textarea
                    placeholder="Paste English content here..."
                    value={data.paragraphEn}
                    onChange={(e) => setData({ ...data, paragraphEn: e.target.value })}
                    className="min-h-[200px] bg-white border-gray-200 rounded-3xl focus:ring-amber-500 font-medium px-6 py-5 shadow-sm leading-relaxed text-base"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-xs font-black text-amber-700/70 uppercase ml-1 flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5" />
                    Bản dịch (Tiếng Việt) <span className="text-rose-500">*</span>
                  </Label>
                  <Textarea
                    placeholder="Nhập bản dịch tiếng Việt tương ứng giúp học viên đối chiếu..."
                    value={data.paragraphVi}
                    onChange={(e) => setData({ ...data, paragraphVi: e.target.value })}
                    className="min-h-[200px] bg-white border-gray-200 rounded-3xl focus:ring-amber-500 font-medium px-6 py-5 shadow-sm leading-relaxed text-base"
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
            <Button className="h-12 px-10 rounded-2xl bg-amber-600 hover:bg-amber-700 shadow-xl shadow-amber-200 font-black transition-all active:scale-95 text-white" onClick={handleUpdateReading} disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Lưu Thay Đổi
                </>
              )}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
