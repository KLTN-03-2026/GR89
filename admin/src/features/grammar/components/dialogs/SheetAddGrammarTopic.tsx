'use client'

import { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetDescription,
  SheetClose
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { 
  Plus, 
  Book, 
  Type, 
  Info, 
  Layers, 
  Save, 
  X,
  Loader2,
  Sparkles,
  Zap
} from "lucide-react"
import { createGrammarTopic } from "../../services/api"
import { toast } from "react-toastify"

interface Props {
  callback: () => void
}

export function SheetAddGrammarTopic({ callback }: Props) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState({
    title: '',
    description: '',
    level: 'A1'
  })

  const handleCreateGrammarTopic = async () => {
    if (!data.title.trim() || !data.level) {
      toast.error('Vui lòng nhập đầy đủ thông tin')
      return
    }

    setIsLoading(true)
    try {
      const res = await createGrammarTopic(data as any)
      toast.success('Đã tạo chủ đề ' + res?.data?.title)
      callback()
      setOpen(false)
      setData({ title: '', description: '', level: 'A1' })
    } catch (error) {
      toast.error('Đã có lỗi xảy ra')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="h-11 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all font-bold">
          <Plus className="w-4 h-4 mr-2" />
          Thêm chủ đề mới
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-2xl flex flex-col p-0 border-l shadow-2xl">
        <SheetHeader className="p-8 pb-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 shadow-inner">
              <Book className="w-6 h-6" />
            </div>
            <div>
              <SheetTitle className="text-2xl font-black text-gray-900 tracking-tight">Kiến Tạo Chủ Đề</SheetTitle>
              <SheetDescription className="text-gray-500 font-medium mt-1">
                Xây dựng nền tảng ngữ pháp vững chắc cho học viên.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <Separator className="bg-gray-100" />

        <ScrollArea className="flex-1">
          <div className="p-8 space-y-10">
            {/* Section: Basic Info */}
            <section className="space-y-6">
              <div className="flex items-center gap-2.5 text-emerald-600 font-black uppercase text-[11px] tracking-[0.2em]">
                <Zap className="w-4 h-4" />
                Thông Tin Cấu Trúc
              </div>
              
              <div className="grid grid-cols-1 gap-6 bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                <div className="space-y-2.5">
                  <Label htmlFor="title-add" className="text-xs font-black text-gray-500 uppercase ml-1 flex items-center gap-1.5">
                    Tiêu Đề <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="title-add"
                    placeholder="VD: Present Simple, Relative Clauses..."
                    value={data.title}
                    onChange={(e) => setData({ ...data, title: e.target.value })}
                    className="h-12 bg-white border-gray-200 rounded-2xl focus:ring-emerald-500 font-bold px-4 shadow-sm"
                  />
                </div>

                <div className="space-y-2.5">
                  <Label htmlFor="level-add" className="text-xs font-black text-gray-500 uppercase ml-1 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" /> Trình Độ <span className="text-rose-500">*</span>
                  </Label>
                  <Select value={data.level} onValueChange={(value) => setData({ ...data, level: value })}>
                    <SelectTrigger id="level-add" className="h-12 bg-white border-gray-200 rounded-2xl focus:ring-emerald-500 font-bold px-4 shadow-sm">
                      <SelectValue placeholder="Chọn trình độ" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-gray-100 shadow-xl">
                      {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((lvl) => (
                        <SelectItem key={lvl} value={lvl} className="rounded-xl font-bold">{lvl}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2.5">
                  <Label htmlFor="description-add" className="text-xs font-black text-gray-500 uppercase ml-1 flex items-center gap-1.5">
                    <Info className="h-3.5 h-3.5" /> Mô Tả Tóm Tắt
                  </Label>
                  <Input
                    id="description-add"
                    placeholder="VD: Hướng dẫn sử dụng thì hiện tại đơn trong giao tiếp..."
                    value={data.description}
                    onChange={(e) => setData({ ...data, description: e.target.value })}
                    className="h-12 bg-white border-gray-200 rounded-2xl focus:ring-emerald-500 font-bold px-4 shadow-sm"
                  />
                </div>
              </div>
            </section>

            {/* Tips Section */}
            <div className="bg-amber-50/50 border border-amber-100 p-6 rounded-[2rem] flex gap-4 items-start pb-10">
              <div className="p-2 bg-white rounded-xl shadow-sm">
                <Sparkles className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h4 className="text-sm font-black text-amber-900 uppercase tracking-tight">Ghi chú</h4>
                <p className="text-xs font-medium text-amber-700/80 leading-relaxed mt-1">
                  Chủ đề ngữ pháp nên được đặt tên theo chuẩn quốc tế để học viên dễ dàng tìm kiếm và theo dõi lộ trình học tập.
                </p>
              </div>
            </div>
          </div>
        </ScrollArea>

        <Separator className="bg-gray-100" />

        <SheetFooter className="p-8 bg-gray-50/80 backdrop-blur-sm border-t border-gray-100">
          <div className="flex items-center justify-end gap-4 w-full">
            <SheetClose asChild>
              <Button 
                variant="outline" 
                className="h-12 px-8 rounded-2xl border-gray-200 font-bold text-gray-600 hover:bg-white transition-all active:scale-95"
                disabled={isLoading}
              >
                Hủy Bỏ
              </Button>
            </SheetClose>
            <Button 
              onClick={handleCreateGrammarTopic}
              disabled={isLoading} 
              className="h-12 px-10 rounded-2xl bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-200 font-black transition-all active:scale-95"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5 mr-2" />}
              {isLoading ? 'Đang Xử Lý...' : 'Lưu Chủ Đề'}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
