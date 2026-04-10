'use client'

import { useState, useEffect } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
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
  Book, 
  Type, 
  Info, 
  Layers, 
  Save, 
  X,
  Loader2,
  Sparkles,
  Zap,
  History,
  User as UserIcon
} from "lucide-react"
import { updateGrammarTopic } from "../../services/api"
import { toast } from "react-toastify"
import { GrammarTopic } from "../../types"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

interface Props {
  topic: GrammarTopic
  open: boolean
  setOpen: (open: boolean) => void
  callback: () => void
}

export function SheetUpdateGrammarTopic({ topic, open, setOpen, callback }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState({
    title: topic.title,
    description: topic.description || '',
    level: topic.level || 'A1'
  })

  useEffect(() => {
    if (open) {
      setData({
        title: topic.title,
        description: topic.description || '',
        level: topic.level || 'A1'
      })
    }
  }, [open, topic])

  const handleUpdateGrammarTopic = async () => {
    if (!data.title.trim() || !data.level) {
      toast.error('Vui lòng nhập đầy đủ thông tin')
      return
    }

    setIsLoading(true)
    try {
      await updateGrammarTopic(topic._id, {
        title: data.title,
        description: data.description,
        level: data.level
      } as any)
      toast.success('Cập nhật chủ đề thành công')
      setOpen(false)
      callback()
    } catch (error) {
      toast.error('Đã có lỗi xảy ra')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="h-full sm:max-w-2xl flex flex-col p-0 border-l shadow-2xl overflow-hidden">
        <SheetHeader className="p-8 pb-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 shadow-inner">
              <Book className="w-6 h-6" />
            </div>
            <div>
              <SheetTitle className="text-2xl font-black text-gray-900 tracking-tight">Hiệu Chỉnh Chủ Đề</SheetTitle>
              <SheetDescription className="text-gray-500 font-medium mt-1">
                Chỉnh sửa thông tin cho: <span className="text-emerald-600 font-bold">{topic.title}</span>
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <Separator className="bg-gray-100" />

        <ScrollArea className="flex-1 min-h-0">
          <div className="p-8 space-y-10">
            {/* Section: Basic Info */}
            <section className="space-y-6">
              <div className="flex items-center gap-2.5 text-emerald-600 font-black uppercase text-[11px] tracking-[0.2em]">
                <Zap className="w-4 h-4" />
                Thông Tin Cấu Trúc
              </div>
              
              <div className="grid grid-cols-1 gap-6 bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                <div className="space-y-2.5">
                  <Label htmlFor="title-update" className="text-xs font-black text-gray-500 uppercase ml-1 flex items-center gap-1.5">
                    Tiêu Đề <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="title-update"
                    placeholder="VD: Present Simple, Relative Clauses..."
                    value={data.title}
                    onChange={(e) => setData({ ...data, title: e.target.value })}
                    className="h-12 bg-white border-gray-200 rounded-2xl focus:ring-emerald-500 font-bold px-4 shadow-sm"
                  />
                </div>

                <div className="space-y-2.5">
                  <Label htmlFor="level-update" className="text-xs font-black text-gray-500 uppercase ml-1 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" /> Trình Độ <span className="text-rose-500">*</span>
                  </Label>
                  <Select value={data.level} onValueChange={(value) => setData({ ...data, level: value as any })}>
                    <SelectTrigger id="level-update" className="h-12 bg-white border-gray-200 rounded-2xl focus:ring-emerald-500 font-bold px-4 shadow-sm">
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
                  <Label htmlFor="description-update" className="text-xs font-black text-gray-500 uppercase ml-1 flex items-center gap-1.5">
                    <Info className="h-3.5 h-3.5" /> Mô Tả Tóm Tắt
                  </Label>
                  <Input
                    id="description-update"
                    placeholder="VD: Hướng dẫn sử dụng thì hiện tại đơn trong giao tiếp..."
                    value={data.description}
                    onChange={(e) => setData({ ...data, description: e.target.value })}
                    className="h-12 bg-white border-gray-200 rounded-2xl focus:ring-emerald-500 font-bold px-4 shadow-sm"
                  />
                </div>
              </div>
            </section>

            {/* Section: Metadata */}
            <section className="space-y-6 pb-10">
              <div className="flex items-center gap-2.5 text-slate-600 font-black uppercase text-[11px] tracking-[0.2em]">
                <History className="w-4 h-4" />
                Lịch Sử Chỉnh Sửa
              </div>
              
              <div className="bg-slate-50/80 p-6 rounded-[2rem] border border-slate-100 grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    <UserIcon className="w-3 h-3" /> Người tạo
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                      {topic.createdBy?.fullName?.[0] || 'A'}
                    </div>
                    <span className="text-xs font-bold text-slate-700">{topic.createdBy?.fullName || 'Admin'}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    <Sparkles className="w-3 h-3" /> Ngày khởi tạo
                  </div>
                  <div className="text-xs font-bold text-slate-700">
                    {topic.createdAt ? format(new Date(topic.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi }) : '---'}
                  </div>
                </div>
              </div>
            </section>
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
              onClick={handleUpdateGrammarTopic}
              disabled={isLoading} 
              className="h-12 px-10 rounded-2xl bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-200 font-black transition-all active:scale-95"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5 mr-2" />}
              {isLoading ? 'Đang Xử Lý...' : 'Cập Nhật'}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
